"""
카테고리 초기 데이터 삽입 스크립트

실행 방법 (backend/ 디렉토리에서):
    python -m scripts.seed_categories
"""

import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sqlalchemy
from app.database import AsyncSessionLocal
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


async def seed():
    async with AsyncSessionLocal() as session:
        # 기존 데이터 전체 교체
        await session.execute(sqlalchemy.text("DELETE FROM user_jobs"))
        await session.execute(sqlalchemy.text("DELETE FROM career_items"))
        await session.execute(sqlalchemy.text("DELETE FROM career_categories"))
        await session.flush()

        for cat_data in CATEGORIES:
            category = CareerCategory(name=cat_data["name"], order=cat_data["order"])
            session.add(category)
            await session.flush()
            print(f"[추가] 카테고리: {category.name}")

            for i, item_name in enumerate(cat_data["items"]):
                session.add(CareerItem(category_id=category.id, name=item_name, order=i + 1))
                print(f"  [추가] 항목: {item_name}")

        await session.commit()
        print("\n✅ 시드 완료")


if __name__ == "__main__":
    asyncio.run(seed())
