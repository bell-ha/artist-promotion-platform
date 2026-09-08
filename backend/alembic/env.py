"""
Alembic 실행 환경.

접속 문자열은 alembic.ini가 아니라 DATABASE_URL 환경변수에서만 읽습니다.
운영은 backend/.env, 검증은 /tmp/seihi_test.env 를 씁니다 —
어느 DB를 향하는지는 항상 셸의 환경변수로 결정됩니다.

⚠️ 명령은 backend/ 디렉터리에서 실행해야 `import app.models`가 됩니다.
"""

import asyncio
import os
from logging.config import fileConfig
from urllib.parse import urlsplit

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# 모델 등록 — 이 import가 있어야 SQLModel.metadata가 채워집니다.
# app.database는 일부러 import하지 않습니다: 모듈 최상단에서 엔진을 만들기 때문에
# import하는 순간 불필요한 커넥션 풀이 뜨고, DATABASE_URL이 없으면 그 자리에서 터집니다.
from sqlmodel import SQLModel
import app.models  # noqa: F401

config = context.config

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL 환경변수가 없습니다. 어느 DB에 걸지 셸에서 명시하세요.\n"
        "  검증: set -a; . /tmp/seihi_test.env; set +a\n"
        "  운영: set -a; . backend/.env; set +a   (+ ALEMBIC_ALLOW_REMOTE=1)"
    )

# ── 운영 DB 오접속 방지 ────────────────────────────────────────────
# 여기서 .env를 자동으로 읽지 않습니다.
# 처음에는 load_dotenv(find_dotenv())를 썼는데, find_dotenv()가 이 파일 위치에서
# 위로 올라가며 찾다가 저장소 루트의 .env(= 운영 Neon)를 집었습니다.
# DATABASE_URL을 지정하지 않고 alembic을 돌리면 조용히 운영에 붙습니다.
# 그래서 (1) 자동 로딩을 없애고 (2) 원격 호스트는 명시적 허용을 요구합니다.
_host = urlsplit(DATABASE_URL.replace("+asyncpg", "")).hostname or ""
_is_local = _host in ("localhost", "127.0.0.1", "::1", "")
if not _is_local and os.getenv("ALEMBIC_ALLOW_REMOTE") != "1":
    raise RuntimeError(
        f"원격 DB({_host})를 향하고 있습니다. 의도한 것이 맞다면\n"
        "    ALEMBIC_ALLOW_REMOTE=1 alembic <명령>\n"
        "으로 명시하세요. 운영 DB에 실수로 거는 것을 막기 위한 장치입니다."
    )

print(f"[alembic] 대상 DB: {_host or '(로컬 소켓)'}"
      f"{'  ⚠️ 원격' if not _is_local else ''}")

config.set_main_option("sqlalchemy.url", DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


def _configure_kwargs():
    return dict(
        target_metadata=target_metadata,
        # VARCHAR ↔ enum 같은 타입 차이를 잡으려면 켜야 합니다.
        # 기본값(False)이면 subscription_plan 드리프트를 그냥 지나칩니다.
        compare_type=True,
        # ADD COLUMN이 남긴 DEFAULT 'free' 같은 잔재를 잡습니다.
        compare_server_default=True,
    )


def run_migrations_offline() -> None:
    """--sql 모드. DB에 연결하지 않고 SQL만 출력합니다.

    적용 전에 무엇이 실행될지 확인할 때 씁니다:
        alembic upgrade head --sql
    """
    context.configure(
        url=DATABASE_URL,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        **_configure_kwargs(),
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, **_configure_kwargs())
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        # 마이그레이션은 짧게 붙었다 끊어야 합니다. Neon의 유휴 종료와
        # 커넥션 풀이 얽히면 원인 찾기 어려운 멈춤이 생깁니다.
        poolclass=pool.NullPool,
        # 앱과 동일: 타입이 바뀌는 순간 캐시된 구문이 깨지므로 마이그레이션 중엔 끕니다.
        connect_args={"statement_cache_size": 0},
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
