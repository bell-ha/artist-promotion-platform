from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_session
from app.models.user import User
from app.schemas.user import UserLogin, Token
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, session: AsyncSession = Depends(get_session)):
    # 1. 유저 존재 여부 확인
    statement = select(User).where(User.email == login_data.email)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    
    # 유저가 없거나 비밀번호 필드가 비어있는 경우
    if not user or not user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="이메일 또는 비밀번호가 틀렸습니다."
        )

    # 2. 비밀번호 검증 (이미 DB 데이터가 교정되어 정상 작동합니다)
    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="이메일 또는 비밀번호가 틀렸습니다."
        )

    # 3. 계정 활성화 여부 확인
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화된 계정입니다. 관리자에게 문의하세요."
        )

    # 4. JWT 토큰 발급
    # Enum 객체일 경우 .value를 쓰고, 아닐 경우 그대로 문자열로 처리
    user_role = user.role.value if hasattr(user.role, 'value') else user.role
    
    try:
        access_token = create_access_token(data={
            "sub": user.email, 
            "role": user_role
        })
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "role": user_role,
            "nickname": user.nickname
        }
    except Exception as e:
        # 토큰 생성 중 예외 발생 시 로그 출력
        print(f"Token generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="로그인 처리 중 서버 오류가 발생했습니다."
        )