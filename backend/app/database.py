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

# 의존성 주입을 위한 세션 제공 함수
# NeonDB가 커넥션을 끊은 경우 최대 3회 재시도 (0.5s → 1s 딜레이)
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    last_exc = None
    for attempt in range(3):
        try:
            async with AsyncSessionLocal() as session:
                yield session
                return
        except Exception as e:
            last_exc = e
            if attempt < 2:
                await asyncio.sleep(0.5 * (attempt + 1))
    raise last_exc


# 카테고리 초기 데이터 삽입 (이미 존재하면 스킵)
async def seed_categories():
    from sqlalchemy.future import select
    from app.models.category import CareerCategory, CareerItem

    CATEGORIES = [
        {"name": "PERFORMER",         "order": 1, "items": ["보컬", "인디 싱어송라이터", "뮤지컬배우"]},
        {"name": "INSTRUMENTALIST",   "order": 2, "items": ["기타리스트", "피아니스트", "드러머", "베이시스트", "오케스트라 연주자", "세션 연주자"]},
        {"name": "CREATOR",           "order": 3, "items": ["대중음악 작곡가", "영화음악 작곡가", "게임음악 작곡가", "광고음악 작곡가", "비트메이커", "탑라이너"]},
        {"name": "SOUND DESIGNER",    "order": 4, "items": ["사운드 디자이너", "폴리 아티스트", "인터랙티브 오디오 디자이너"]},
        {"name": "AUDIO ENGINEER",    "order": 5, "items": ["레코딩 엔지니어", "믹싱/마스터링 엔지니어", "라이브 PA 엔지니어", "방송 음향 감독"]},
        {"name": "AUDIO PROGRAMMER",  "order": 6, "items": ["프론트엔드 개발자", "백엔드 개발자"]},
        {"name": "VISUAL ARTIST",     "order": 7, "items": ["미디어아트 작가", "미술 작가", "설치미술가", "공연 테크니컬 디렉터"]},
    ]

    async with AsyncSessionLocal() as session:
        for cat_data in CATEGORIES:
            result = await session.execute(select(CareerCategory).where(CareerCategory.name == cat_data["name"]))
            category = result.scalars().first()

            if not category:
                category = CareerCategory(name=cat_data["name"], order=cat_data["order"])
                session.add(category)
                await session.flush()

            for i, item_name in enumerate(cat_data["items"]):
                result = await session.execute(
                    select(CareerItem).where(CareerItem.category_id == category.id, CareerItem.name == item_name)
                )
                if not result.scalars().first():
                    session.add(CareerItem(category_id=category.id, name=item_name, order=i + 1))

        await session.commit()