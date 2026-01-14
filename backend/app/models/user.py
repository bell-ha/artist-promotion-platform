from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, Enum, func
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    GUEST = "guest"
    USER = "user"
    ARTIST = "artist"
    ADMIN = "admin"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    nickname: str = Field(nullable=False)
    password: Optional[str] = Field(default=None) # 직접 로그인용
    profile_image: Optional[str] = Field(default=None)
    role: UserRole = Field(sa_column=Column(Enum(UserRole), default=UserRole.USER))
    social_id: Optional[str] = Field(default=None, unique=True)
    provider: str = Field(default="google")
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    is_active: bool = Field(default=True)