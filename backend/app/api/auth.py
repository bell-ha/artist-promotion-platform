import os
import uuid
import random
import string
from datetime import datetime, timedelta
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from app.database import get_session
from app.models.user import User, UserRole, LoginProvider
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_ID:
    raise ValueError("GOOGLE_CLIENT_ID 환경변수가 설정되지 않았습니다.")

# --- 이메일 발송 설정 ---
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

otp_storage: Dict[str, dict] = {}
forgot_otp_storage: Dict[str, dict] = {}

def _cleanup_expired_otps() -> None:
    now = datetime.now()
    expired = [email for email, data in otp_storage.items() if now > data["expires"]]
    for email in expired:
        del otp_storage[email]

def _cleanup_forgot_otps() -> None:
    now = datetime.now()
    expired = [email for email, data in forgot_otp_storage.items() if now > data["expires"]]
    for email in expired:
        del forgot_otp_storage[email]

# --- Request 모델 ---
class EmailSignUpRequest(BaseModel):
    nickname: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SocialTokenRequest(BaseModel):
    token: str

class NicknameUpdateRequest(BaseModel):
    nickname: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class VerifyPasswordRequest(BaseModel):
    password: str

class ForgotPasswordVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class ForgotPasswordResetRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

# --- API 엔드포인트 ---

@router.post("/send-otp")
async def send_otp(email: EmailStr):
    _cleanup_expired_otps()
    otp = "".join(random.choices(string.digits, k=6))
    otp_storage[email] = {"otp": otp, "expires": datetime.now() + timedelta(minutes=5)}
    
    html = f"""
    <div style="background-color: #f4f4f4; padding: 50px 20px; font-family: sans-serif;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background-color: #5D5755; padding: 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">StudioSeiHa</h2>
            </div>
            <div style="padding: 40px 30px; text-align: center; color: #333333;">
                <h3 style="margin-top: 0; font-size: 20px;">이메일 인증 안내</h3>
                <p style="font-size: 15px; color: #666666; line-height: 1.6;">본인 확인을 위해 아래의 6자리 인증번호를 입력창에 적어주세요.</p>
                <div style="margin: 30px 0; background-color: #f9f7f6; padding: 20px; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5D5755;">{otp}</span>
                </div>
                <p style="font-size: 13px; color: #999999;">* 인증번호는 5분 동안만 유효합니다.</p>
            </div>
        </div>
    </div>
    """
    message = MessageSchema(subject="[StudioSeiHa] 인증번호 안내", recipients=[email], body=html, subtype="html")
    fm = FastMail(conf)
    await fm.send_message(message)
    return {"message": "success"}

@router.post("/verify-otp")
async def verify_otp(data: OtpVerifyRequest):
    _cleanup_expired_otps()
    stored = otp_storage.get(data.email)
    if not stored or stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="인증번호가 틀렸거나 만료되었습니다.")
    if datetime.now() > stored["expires"]:
        otp_storage.pop(data.email, None)
        raise HTTPException(status_code=400, detail="인증번호가 만료되었습니다.")
    otp_storage.pop(data.email, None)  # 인증 성공 후 즉시 삭제 (재사용 방지)
    return {"status": "verified"}

@router.get("/check-nickname")
async def check_nickname(nickname: str, session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.nickname == nickname)
    result = await session.execute(statement)
    exists = result.scalar_one_or_none()
    return {"available": exists is None}

@router.post("/signup")
async def email_signup(data: EmailSignUpRequest, session: AsyncSession = Depends(get_session)):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="비밀번호는 6자 이상이어야 합니다.")

    email_stmt = select(User).where(User.email == data.email)
    email_res = await session.execute(email_stmt)
    if email_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    nick_stmt = select(User).where(User.nickname == data.nickname)
    nick_res = await session.execute(nick_stmt)
    if nick_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")

    new_user = User(
        email=data.email,
        password=get_password_hash(data.password),
        nickname=data.nickname,
        provider=LoginProvider.LOCAL,
        role=UserRole.USER,
        is_active=True
    )
    session.add(new_user)
    await session.commit()
    return {"status": "success"}

# --- 일반 로그인 추가 ---
@router.post("/login")
async def email_login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == data.email)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    if not user or not user.is_active or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {
        "access_token": access_token,
        "user_id": user.id,
        "nickname": user.nickname,
        "email": user.email,
        "role": user.role.value,
    }

@router.post("/google")
async def google_login(data: SocialTokenRequest, session: AsyncSession = Depends(get_session)):
    try:
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds=30)
        email = idinfo.get('email')
        google_id = idinfo.get('sub')

        statement = select(User).where(User.email == email)
        result = await session.execute(statement)
        user = result.scalar_one_or_none()

        is_new_user = False
        if not user:
            is_new_user = True
            temp_nickname = f"User_{uuid.uuid4().hex[:6]}"
            user = User(
                email=email,
                nickname=temp_nickname, 
                provider=LoginProvider.GOOGLE,
                social_id=str(google_id),
                role=UserRole.USER,
                is_active=True
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        elif user.nickname.startswith("User_"):
            is_new_user = True

        if not user.is_active:
            raise HTTPException(status_code=403, detail="비활성화된 계정입니다.")

        access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
        return {
            "access_token": access_token,
            "user_id": user.id,
            "nickname": user.nickname,
            "email": user.email,
            "is_new_user": is_new_user,
            "role": user.role.value,
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 구글 토큰입니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "nickname": current_user.nickname,
        "provider": current_user.provider.value,
        "subscription_plan": current_user.subscription_plan.value,
    }


@router.post("/verify-password")
async def verify_current_password(
    data: VerifyPasswordRequest,
    current_user: User = Depends(get_current_user),
):
    if current_user.provider != LoginProvider.LOCAL:
        raise HTTPException(status_code=400, detail="소셜 로그인 계정입니다.")
    if not verify_password(data.password, current_user.password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 틀렸습니다.")
    return {"valid": True}


@router.put("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.provider != LoginProvider.LOCAL:
        raise HTTPException(status_code=400, detail="소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.")
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 틀렸습니다.")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="새 비밀번호는 6자 이상이어야 합니다.")
    current_user.password = get_password_hash(data.new_password)
    session.add(current_user)
    await session.commit()
    return {"status": "ok"}


@router.post("/forgot-password/send-otp")
async def forgot_password_send_otp(email: EmailStr, session: AsyncSession = Depends(get_session)):
    _cleanup_forgot_otps()
    user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user or user.provider != LoginProvider.LOCAL:
        return {"message": "success"}  # 존재 여부 노출하지 않음

    otp = "".join(random.choices(string.digits, k=6))
    forgot_otp_storage[email] = {
        "otp": otp,
        "expires": datetime.now() + timedelta(minutes=5),
        "verified": False,
    }

    html = f"""
    <div style="background-color: #f4f4f4; padding: 50px 20px; font-family: sans-serif;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background-color: #5D5755; padding: 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">StudioSeiHa</h2>
            </div>
            <div style="padding: 40px 30px; text-align: center; color: #333333;">
                <h3 style="margin-top: 0; font-size: 20px;">비밀번호 재설정 안내</h3>
                <p style="font-size: 15px; color: #666666; line-height: 1.6;">아래의 6자리 인증번호를 입력해 비밀번호를 재설정해주세요.</p>
                <div style="margin: 30px 0; background-color: #f9f7f6; padding: 20px; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5D5755;">{otp}</span>
                </div>
                <p style="font-size: 13px; color: #999999;">* 인증번호는 5분 동안만 유효합니다.</p>
            </div>
        </div>
    </div>
    """
    message = MessageSchema(subject="[StudioSeiHa] 비밀번호 재설정 인증번호", recipients=[email], body=html, subtype="html")
    fm = FastMail(conf)
    await fm.send_message(message)
    return {"message": "success"}


@router.post("/forgot-password/verify-otp")
async def forgot_password_verify_otp(data: ForgotPasswordVerifyRequest):
    _cleanup_forgot_otps()
    stored = forgot_otp_storage.get(data.email)
    if not stored or stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="인증번호가 틀렸거나 만료되었습니다.")
    if datetime.now() > stored["expires"]:
        forgot_otp_storage.pop(data.email, None)
        raise HTTPException(status_code=400, detail="인증번호가 만료되었습니다.")
    forgot_otp_storage[data.email]["verified"] = True
    return {"status": "verified"}


@router.post("/forgot-password/reset")
async def forgot_password_reset(data: ForgotPasswordResetRequest, session: AsyncSession = Depends(get_session)):
    _cleanup_forgot_otps()
    stored = forgot_otp_storage.get(data.email)
    if not stored or stored["otp"] != data.otp or not stored.get("verified"):
        raise HTTPException(status_code=400, detail="인증이 완료되지 않았거나 잘못된 요청입니다.")
    if datetime.now() > stored["expires"]:
        forgot_otp_storage.pop(data.email, None)
        raise HTTPException(status_code=400, detail="인증이 만료되었습니다.")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="비밀번호는 6자 이상이어야 합니다.")

    user = (await session.execute(select(User).where(User.email == data.email))).scalar_one_or_none()
    if not user or user.provider != LoginProvider.LOCAL:
        raise HTTPException(status_code=400, detail="유효하지 않은 요청입니다.")

    user.password = get_password_hash(data.new_password)
    session.add(user)
    await session.commit()
    forgot_otp_storage.pop(data.email, None)
    return {"status": "ok"}


@router.post("/update-nickname")
async def update_nickname(
    data: NicknameUpdateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    current_user.nickname = data.nickname
    session.add(current_user)
    await session.commit()
    return {"status": "success"}