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
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
    pool_recycle=240,  # NeonDB 5분 idle timeout보다 1분 일찍 갱신
    connect_args={"statement_cache_size": 0},  # enum 타입 변경 후 캐시 충돌 방지
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

        # users 삭제 시 포트폴리오 데이터 전체 CASCADE 설정
        await conn.execute(__import__("sqlalchemy").text("""
            DO $$
            DECLARE
                fk RECORD;
                col_name TEXT;
                ref_table TEXT;
                ref_col TEXT;
            BEGIN
                FOR fk IN
                    SELECT
                        tc.constraint_name,
                        tc.table_name,
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage ccu
                        ON ccu.constraint_name = tc.constraint_name
                    JOIN information_schema.referential_constraints rc
                        ON tc.constraint_name = rc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                      AND rc.delete_rule != 'CASCADE'
                      AND (
                          tc.table_name LIKE 't1_%'
                          OR tc.table_name LIKE 't2_%'
                          OR (kcu.column_name = 'user_id' AND ccu.table_name = 'users')
                      )
                LOOP
                    EXECUTE format(
                        'ALTER TABLE %I DROP CONSTRAINT %I',
                        fk.table_name, fk.constraint_name
                    );
                    EXECUTE format(
                        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I(%I) ON DELETE CASCADE',
                        fk.table_name, fk.constraint_name,
                        fk.column_name, fk.foreign_table_name, fk.foreign_column_name
                    );
                END LOOP;
            END$$;
        """))

        # userrole enum을 USER/ADMIN(대문자)만 남기도록 정리
        await conn.execute(__import__("sqlalchemy").text("""
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
                    ALTER TABLE users ALTER COLUMN role TYPE text USING UPPER(role::text);
                    UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN');
                    DROP TYPE userrole;
                    CREATE TYPE userrole AS ENUM ('USER', 'ADMIN');
                    ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::userrole;
                END IF;
            END$$;
        """))

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


CATEGORIES = [
    {"name": "PERFORMER",        "order": 1, "items": ["보컬", "인디 싱어송라이터", "뮤지컬배우"]},
    {"name": "INSTRUMENTALIST",  "order": 2, "items": ["기타리스트", "피아니스트", "드러머", "베이시스트", "오케스트라 연주자", "세션 연주자"]},
    {"name": "CREATOR",          "order": 3, "items": ["대중음악 작곡가", "영화음악 작곡가", "게임음악 작곡가", "광고음악 작곡가", "비트메이커", "탑라이너"]},
    {"name": "SOUND DESIGNER",   "order": 4, "items": ["사운드 디자이너", "폴리 아티스트", "인터랙티브 오디오 디자이너"]},
    {"name": "AUDIO ENGINEER",   "order": 5, "items": ["레코딩 엔지니어", "믹싱/마스터링 엔지니어", "라이브 PA 엔지니어", "방송 음향 감독"]},
    {"name": "AUDIO PROGRAMMER", "order": 6, "items": ["프론트엔드 개발자", "백엔드 개발자"]},
    {"name": "VISUAL ARTIST",    "order": 7, "items": ["미디어아트 작가", "미술 작가", "설치미술가", "공연 테크니컬 디렉터"]},
]

# 카테고리 초기 데이터 삽입 — 이미 데이터가 있으면 건너뜀 (재시작 시 유저 데이터 보호)
async def seed_categories():
    from sqlalchemy.future import select
    from app.models.category import CareerCategory, CareerItem

    async with AsyncSessionLocal() as session:
        existing = (await session.execute(select(CareerCategory).limit(1))).scalar_one_or_none()
        if existing:
            return

        for cat_data in CATEGORIES:
            category = CareerCategory(name=cat_data["name"], order=cat_data["order"])
            session.add(category)
            await session.flush()

            for i, item_name in enumerate(cat_data["items"]):
                session.add(CareerItem(category_id=category.id, name=item_name, order=i + 1))

        await session.commit()