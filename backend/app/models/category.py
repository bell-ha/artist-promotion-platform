from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Integer, ForeignKey


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
    # CASCADE 아님 — 운영 DB의 DO $$ 조건(t1_/t2_ 또는 user_id→users)에 해당하지 않음
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
    # users 삭제 시 함께 삭제 (운영 DB가 이미 CASCADE)
    user_id: int = Field(
        sa_column=Column(
            Integer,
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    # CASCADE 아님 — 위와 같은 이유
    career_item_id: int = Field(foreign_key="career_items.id", nullable=False)

    career_item: Optional[CareerItem] = Relationship(back_populates="user_jobs")
