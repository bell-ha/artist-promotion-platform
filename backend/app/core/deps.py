from typing import Optional
from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError, jwt

from app.database import get_session
from app.models.user import User, UserRole
from app.core.security import SECRET_KEY, ALGORITHM


async def get_current_user(
    authorization: Optional[str] = Header(None),
    session: AsyncSession = Depends(get_session),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증이 필요합니다.")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
    except JWTError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="비활성화된 계정입니다.")

    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다.")
    return current_user
