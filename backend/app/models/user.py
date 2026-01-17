from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, Enum, func
import enum
from datetime import datetime

# 1. 권한 설정 (단순화: USER, ADMIN)
class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

# 2. 가입 경로 설정
class LoginProvider(str, enum.Enum):
    LOCAL = "local"
    GOOGLE = "google"
    NAVER = "naver"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    nickname: str = Field(nullable=False)
    
    # 소셜 로그인 시 null 허용
    password: Optional[str] = Field(default=None)
    profile_image: Optional[str] = Field(default=None)
    
    role: UserRole = Field(
        sa_column=Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    )
    
    provider: LoginProvider = Field(
        sa_column=Column(Enum(LoginProvider), default=LoginProvider.LOCAL, nullable=False)
    )
    
    # 구글 고유 식별자 (ID) 저장용
    social_id: Optional[str] = Field(default=None, unique=True)
    
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    is_active: bool = Field(default=True)