import os
import asyncio
from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

# 환경 변수에서 DB 주소 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

# 비동기 엔진 생성
# pool_pre_ping: 커넥션 사용 전 유효성 확인 (NeonDB 유휴 종료 대응)
# pool_recycle:  5분마다 커넥션 강제 갱신
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300,
)

# 세션 생성기 설정
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ✅ [추가] 서버 시작 시 테이블을 생성하는 함수
async def init_db():
    async with engine.begin() as conn:
        # 이 시점에 모델들이 SQLModel.metadata에 등록되어 있어야 합니다.
        # 따라서 아래처럼 모델을 임포트해줍니다.
        from app.models.user import User
        from app.models.category import CareerCategory, CareerItem, UserJob
        
        # 테이블 생성 (이미 존재하면 건너뜁니다)
        await conn.run_sync(SQLModel.metadata.create_all)

        # 기존 테이블에 새 컬럼 추가 (이미 있으면 스킵)
        for table in [
            "t1_youtube_cards", "t1_soundcloud_cards",
            "t1_image_cards", "t1_no_image_cards",
        ]:
            await conn.execute(
                __import__("sqlalchemy").text(
                    f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS project_subtitle VARCHAR"
                )
            )

        # users 테이블에 subscription_plan 컬럼 추가
        await conn.execute(
            __import__("sqlalchemy").text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR NOT NULL DEFAULT 'free'"
            )
        )

        # ALTER TABLE DEFAULT 'free'(소문자)로 삽입된 기존 데이터를 SQLAlchemy enum 이름(대문자)으로 통일
        await conn.execute(
            __import__("sqlalchemy").text(
                "UPDATE users SET subscription_plan = UPPER(subscription_plan) "
                "WHERE subscription_plan IN ('free', 'standard', 'premium')"
            )
        )

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


# 카테고리 초기 데이터 삽입 (이미 존재하면 스킵)
async def seed_categories():
    from sqlalchemy.future import select
    from app.models.category import CareerCategory, CareerItem

    CATEGORIES = [
        {"name": "Performer",   "order": 1, "items": ["Vocal", "Musical"]},
        {"name": "Player",      "order": 2, "items": ["Guitarist", "Pianist", "Drummer", "Bassist", "Orchestrator", "Session Player"]},
        {"name": "Creator",     "order": 3, "items": ["Composer", "Songwriter", "Beatmaker", "Topliner", "Producer"]},
        {"name": "Sound",       "order": 4, "items": ["Sound Designer", "Foley Artist", "Audio Designer"]},
        {"name": "Engineer",    "order": 5, "items": ["Recording Engineer", "Mixing & Mastering Engineer", "Live Engineer", "Broadcast Engineer"]},
        {"name": "Developer",   "order": 6, "items": ["Frontend Developer", "Backend Developer", "Fullstack Developer"]},
        {"name": "Visual",      "order": 7, "items": ["Media Artist", "Visual Artist", "Technical Director"]},
    ]

    async with AsyncSessionLocal() as session:
        from app.models.category import UserJob

        # 기존 데이터 전체 교체 (user_jobs → career_items → career_categories 순으로 삭제)
        await session.execute(__import__("sqlalchemy").text("DELETE FROM user_jobs"))
        await session.execute(__import__("sqlalchemy").text("DELETE FROM career_items"))
        await session.execute(__import__("sqlalchemy").text("DELETE FROM career_categories"))
        await session.flush()

        for cat_data in CATEGORIES:
            category = CareerCategory(name=cat_data["name"], order=cat_data["order"])
            session.add(category)
            await session.flush()

            for i, item_name in enumerate(cat_data["items"]):
                session.add(CareerItem(category_id=category.id, name=item_name, order=i + 1))

        await session.commit()