"""안전장치 자체를 검증한다. 이게 깨지면 나머지 테스트는 신뢰할 수 없다."""

from app.database import DATABASE_URL


def test_테스트는_스크래치_DB를_본다():
    assert DATABASE_URL == "postgresql+asyncpg://postgres:scratch@localhost:5433/seihi_test"


def test_운영_Neon으로_붙지_않는다():
    assert "neon.tech" not in DATABASE_URL
    assert "localhost" in DATABASE_URL


def test_dotenv가_무력화되어_있다():
    import dotenv
    assert dotenv.find_dotenv() == ""
    assert dotenv.load_dotenv() is False


async def test_기준정보는_마이그레이션이_넣어둔다(session):
    from sqlalchemy import text
    cats = (await session.execute(text("SELECT count(*) FROM career_categories"))).scalar()
    items = (await session.execute(text("SELECT count(*) FROM career_items"))).scalar()
    assert cats == 7
    assert items == 28
