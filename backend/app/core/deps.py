from typing import Optional
from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError, jwt

from app.database import get_session
from app.models.user import User
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

    return user
