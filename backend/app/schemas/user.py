from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

# 로그인 요청 시 사용
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# API 응답 시 사용 (비밀번호 제외)
class UserRead(BaseModel):
    id: int
    email: str
    nickname: str
    profile_image: Optional[str] = None
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

# 토큰 응답 형식
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    nickname: str