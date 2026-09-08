import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
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
    # ⚠️ 이 설정은 그대로 두어야 합니다.
    #    운영은 Neon의 pooled 엔드포인트(호스트명에 -pooler)를 씁니다. 그건
    #    PgBouncer transaction 모드라 prepared statement를 지원하지 않아서,
    #    캐시를 켜면 asyncpg가 실패합니다. 기동 시 DDL을 없앴다고 해서
    #    되돌릴 수 있는 설정이 아닙니다.
    connect_args={"statement_cache_size": 0},
)

# 세션 생성기 설정
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


# ══════════════════════════════════════════════════════════════════
# 아래 두 함수는 비워 두었습니다 (스키마 관리는 Alembic이 합니다)
# ══════════════════════════════════════════════════════════════════
#
# 예전에는 서버가 뜰 때마다 여기서 create_all과 raw DDL이 돌았습니다.
# ALTER TABLE ADD COLUMN 6건, enum 값 대문자 통일 UPDATE, FK를 전부 DROP
# 후 CASCADE로 재생성하는 DO $$ 블록, DROP TYPE/CREATE TYPE 까지요.
# 그래서 (a) 스키마 변경 이력이 남지 않고 (b) 되돌릴 수단이 없고
# (c) 인스턴스를 늘리면 같은 DDL이 동시에 돌아 잠금 경합이 났습니다.
#
# 이제는 이렇게 합니다.
#     alembic upgrade head      # 스키마 + 기준정보
#     uvicorn app.main:app      # 앱은 스키마를 만들지 않음
# Dockerfile의 CMD가 이 순서로 실행합니다.
#
# 함수 자체는 남겨 두었습니다. main.py의 lifespan이 아직 호출하고 있어서,
# 지금 지우면 그 파일이 고쳐지기 전까지 서버가 기동하지 않기 때문입니다.
# main.py에서 두 호출이 제거되면 아래 두 함수도 지우면 됩니다.

async def init_db() -> None:
    """더 이상 스키마를 만들지 않습니다. `alembic upgrade head`를 쓰세요."""
    return None


async def seed_categories() -> None:
    """기준정보는 마이그레이션(seed career categories)이 넣습니다."""
    return None
