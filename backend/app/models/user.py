from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, Enum, func
import enum
from datetime import datetime

# 1. 권한 설정 (GUEST 제외)
class UserRole(str, enum.Enum):
    USER = "user"
    ARTIST = "artist"
    ADMIN = "admin"

# 2. 가입 경로 설정 (Enum 추가)
class LoginProvider(str, enum.Enum):
    LOCAL = "local"
    GOOGLE = "google"
    KAKAO = "kakao"

class User(SQLModel, table=True):
    __tablename__ = "users"

    # id: 자동 증가하는 정수형
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 필수 정보
    email: str = Field(index=True, unique=True, nullable=False)
    nickname: str = Field(nullable=False)
    
    # password: 직접 가입(local)일 때만 필수, 소셜 로그인 시 null 허용
    password: Optional[str] = Field(default=None)
    
    # 프로필 이미지: null 허용
    profile_image: Optional[str] = Field(default=None)
    
    # 권한: 기본값은 일반 유저(USER)
    role: UserRole = Field(
        sa_column=Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    )
    
    # 가입 경로: Enum 사용, 기본값은 LOCAL (직접 가입)
    provider: LoginProvider = Field(
        sa_column=Column(Enum(LoginProvider), default=LoginProvider.LOCAL, nullable=False)
    )
    
    # 소셜 로그인 식별자 (구글/카카오 고유 ID)
    social_id: Optional[str] = Field(default=None, unique=True)
    
    # 기타 정보
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    is_active: bool = Field(default=True)