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

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = "163502629915-hnul9f78fgomial7ktg27rubjapt0vu4.apps.googleusercontent.com"

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
    email: str
    nickname: str

class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

# --- API 엔드포인트 ---

@router.post("/send-otp")
async def send_otp(email: EmailStr):
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
    if data.email not in otp_storage or otp_storage[data.email]["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="인증번호가 틀렸거나 만료되었습니다.")
    return {"status": "verified"}

@router.get("/check-nickname")
async def check_nickname(nickname: str, session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.nickname == nickname)
    result = await session.execute(statement)
    exists = result.scalar_one_or_none()
    return {"available": exists is None}

@router.post("/signup")
async def email_signup(data: EmailSignUpRequest, session: AsyncSession = Depends(get_session)):
    email_stmt = select(User).where(User.email == data.email)
    email_res = await session.execute(email_stmt)
    if email_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

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

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {
        "access_token": access_token,
        "nickname": user.nickname,
        "email": user.email
    }

@router.post("/google")
async def google_login(data: SocialTokenRequest, session: AsyncSession = Depends(get_session)):
    try:
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), GOOGLE_CLIENT_ID)
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

        access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
        return {
            "access_token": access_token,
            "nickname": user.nickname,
            "email": user.email,
            "is_new_user": is_new_user
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update-nickname")
async def update_nickname(data: NicknameUpdateRequest, session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == data.email)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    
    user.nickname = data.nickname
    session.add(user)
    await session.commit()
    return {"status": "success"}