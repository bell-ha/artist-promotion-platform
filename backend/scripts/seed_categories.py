"""
카테고리 초기 데이터 삽입 스크립트

실행 방법 (backend/ 디렉토리에서):
    python -m scripts.seed_categories
"""

import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import engine, AsyncSessionLocal
from app.models.category import CareerCategory, CareerItem

CATEGORIES = [
    {
        "name": "PERFORMER",
        "order": 1,
        "items": ["보컬", "인디 싱어송라이터", "뮤지컬배우"],
    },
    {
        "name": "INSTRUMENTALIST",
        "order": 2,
        "items": ["기타리스트", "피아니스트", "드러머", "베이시스트", "오케스트라 연주자", "세션 연주자"],
    },
    {
        "name": "CREATOR",
        "order": 3,
        "items": ["대중음악 작곡가", "영화음악 작곡가", "게임음악 작곡가", "광고음악 작곡가", "비트메이커", "탑라이너"],
    },
    {
        "name": "SOUND DESIGNER",
        "order": 4,
        "items": ["사운드 디자이너", "폴리 아티스트", "인터랙티브 오디오 디자이너"],
    },
    {
        "name": "AUDIO ENGINEER",
        "order": 5,
        "items": ["레코딩 엔지니어", "믹싱/마스터링 엔지니어", "라이브 PA 엔지니어", "방송 음향 감독"],
    },
    {
        "name": "AUDIO PROGRAMMER",
        "order": 6,
        "items": ["프론트엔드 개발자", "백엔드 개발자"],
    },
    {
        "name": "VISUAL ARTIST",
        "order": 7,
        "items": ["미디어아트 작가", "미술 작가", "설치미술가", "공연 테크니컬 디렉터"],
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        for cat_data in CATEGORIES:
            # 이미 존재하면 건너뜀
            result = await session.execute(
                select(CareerCategory).where(CareerCategory.name == cat_data["name"])
            )
            category = result.scalars().first()

            if not category:
                category = CareerCategory(name=cat_data["name"], order=cat_data["order"])
                session.add(category)
                await session.flush()  # id 확보
                print(f"[추가] 카테고리: {category.name}")
            else:
                print(f"[스킵] 이미 존재: {category.name}")

            for i, item_name in enumerate(cat_data["items"]):
                result = await session.execute(
                    select(CareerItem).where(
                        CareerItem.category_id == category.id,
                        CareerItem.name == item_name,
                    )
                )
                if not result.scalars().first():
                    session.add(CareerItem(category_id=category.id, name=item_name, order=i + 1))
                    print(f"  [추가] 항목: {item_name}")

        await session.commit()
        print("\n✅ 시드 완료")


if __name__ == "__main__":
    asyncio.run(seed())
