from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class CareerCategory(SQLModel, table=True):
    """직업 대분류 (PERFORMER, CREATOR, ...)"""
    __tablename__ = "career_categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, unique=True)   # "PERFORMER"
    order: int = Field(default=0)                    # 헤더 표시 순서
    is_active: bool = Field(default=True)

    items: List["CareerItem"] = Relationship(back_populates="category")


class CareerItem(SQLModel, table=True):
    """직업 세부항목 (보컬, 기타리스트, ...)"""
    __tablename__ = "career_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="career_categories.id", nullable=False)
    name: str = Field(nullable=False)                # "보컬"
    order: int = Field(default=0)                    # 카테고리 내 순서
    is_active: bool = Field(default=True)

    category: Optional[CareerCategory] = Relationship(back_populates="items")
    user_jobs: List["UserJob"] = Relationship(back_populates="career_item")


class UserJob(SQLModel, table=True):
    """유저 ↔ 직업 다대다 연결"""
    __tablename__ = "user_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    career_item_id: int = Field(foreign_key="career_items.id", nullable=False)

    career_item: Optional[CareerItem] = Relationship(back_populates="user_jobs")
