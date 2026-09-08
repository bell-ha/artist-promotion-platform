"""
공용 픽스처.

⚠️ 안전장치 — 왜 이 파일 맨 위에서 os.environ을 강제로 덮어쓰는가
────────────────────────────────────────────────────────────────
저장소 루트의 `.env`에 **운영 Neon** DATABASE_URL이 들어 있습니다.
app/database.py는 임포트되는 순간 모듈 최상단에서

    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_async_engine(DATABASE_URL, ...)

를 실행합니다. 즉 pytest를 실행한 셸에 운영 DATABASE_URL이 들어 있으면
(예: `set -a; . .env; set +a` 를 한 터미널) 테스트가 조용히 운영 DB에
붙어 데이터를 만들고 지웁니다.

그래서 app.* 를 **그 무엇도 임포트하기 전에**:
  1) os.environ에 테스트 값을 강제로 심습니다.
     setdefault가 아니라 대입입니다 — 셸에 무엇이 있었든 확실히 덮습니다.
  2) dotenv.find_dotenv / load_dotenv 를 무력화합니다.
     지금 app 코드에는 dotenv 호출이 없지만(제거했습니다), 누군가 다시
     넣어도 테스트가 운영으로 새지 않도록 미리 막아 둡니다.
  3) 매 테스트 직전에 실제로 스크래치를 보고 있는지 다시 확인합니다.

이 순서가 깨지면(예: app.database를 먼저 import한 뒤 환경변수를 바꾸면)
안전장치가 무의미해집니다.
"""

import os

_TEST_DATABASE_URL = "postgresql+asyncpg://postgres:scratch@localhost:5433/seihi_test"

# 1) 강제 주입 — app.* 임포트 전에 반드시 끝나야 한다
os.environ["DATABASE_URL"] = _TEST_DATABASE_URL
os.environ["SECRET_KEY"] = "test-secret-do-not-use-in-prod"       # core/security.py가 임포트 시점에 요구
os.environ["GOOGLE_CLIENT_ID"] = "test-google-client-id"          # api/auth.py가 임포트 시점에 요구
os.environ.setdefault("CLOUDINARY_CLOUD_NAME", "test")
os.environ.setdefault("CLOUDINARY_API_KEY", "test")
os.environ.setdefault("CLOUDINARY_API_SECRET", "test")
os.environ.setdefault("MAIL_USERNAME", "test@example.com")
os.environ.setdefault("MAIL_PASSWORD", "test")
os.environ.setdefault("MAIL_FROM", "test@example.com")

# 2) dotenv 무력화 (앱이 다시 .env를 읽게 되더라도 효과가 없도록)
import dotenv  # noqa: E402
dotenv.find_dotenv = lambda *a, **k: ""
dotenv.load_dotenv = lambda *a, **k: False

# ── 여기서부터 app.* 임포트 ──────────────────────────────────────
import subprocess  # noqa: E402
import uuid  # noqa: E402
from pathlib import Path  # noqa: E402

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.database import DATABASE_URL, AsyncSessionLocal, engine  # noqa: E402
from app.main import app as fastapi_app  # noqa: E402
from app.core.security import create_access_token, get_password_hash  # noqa: E402
from app.models.user import User, UserRole, LoginProvider, SubscriptionPlan  # noqa: E402
from app.models.category import CareerCategory, CareerItem  # noqa: E402
from app.models.template1 import NameSection, NameSectionJob  # noqa: E402
from app.models.template2 import T2NameSection, T2NameSectionJob  # noqa: E402

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _assert_pointed_at_scratch_db() -> None:
    """운영 DB로 붙었으면 테스트를 아예 중단시킨다. 이중 확인이다."""
    if DATABASE_URL != _TEST_DATABASE_URL:
        pytest.exit(
            f"테스트가 예상과 다른 DB를 보고 있습니다.\n"
            f"  기대: {_TEST_DATABASE_URL}\n"
            f"  실제: {DATABASE_URL}",
            returncode=1,
        )
    if "neon.tech" in (DATABASE_URL or ""):
        pytest.exit("운영(Neon) DB를 향하고 있습니다. 중단합니다.", returncode=1)


_assert_pointed_at_scratch_db()


@pytest.fixture(autouse=True)
def _guard_every_test():
    """매 테스트 직전에도 다시 확인한다."""
    _assert_pointed_at_scratch_db()
    yield


# ══════════════════════════════════════════════════════════════════
# 스키마 — create_all이 아니라 Alembic으로 세운다
# ══════════════════════════════════════════════════════════════════

@pytest.fixture(scope="session", autouse=True)
def _migrate_test_db():
    """세션당 한 번 `alembic upgrade head`.

    create_all을 쓰면 마이그레이션이 실제로 도는지는 검증되지 않습니다.
    이렇게 하면 스키마 테스트가 마이그레이션 테스트를 겸합니다.
    """
    _assert_pointed_at_scratch_db()
    env = {**os.environ, "DATABASE_URL": _TEST_DATABASE_URL}
    r = subprocess.run(
        [str(BACKEND_DIR / ".venv_test" / "bin" / "alembic"), "upgrade", "head"],
        cwd=BACKEND_DIR, env=env, capture_output=True, text=True,
    )
    if r.returncode != 0:
        pytest.exit(f"alembic upgrade head 실패:\n{r.stdout}\n{r.stderr}", returncode=1)
    yield


@pytest_asyncio.fixture(autouse=True)
async def _clean_tables():
    """테스트마다 사용자 관련 데이터를 비운다.

    users를 지우면 t1_*/t2_*/user_jobs 가 ON DELETE CASCADE 로 함께 사라진다.
    career_categories / career_items(기준정보)는 마이그레이션이 넣은 것이라 남긴다.
    """
    async with engine.begin() as conn:
        await conn.execute(text("DELETE FROM discover_cards"))
        await conn.execute(text("UPDATE spotlight_settings SET artist_id = NULL"))
        await conn.execute(text("DELETE FROM users"))
    yield


@pytest_asyncio.fixture
async def client():
    """앱에 직접 붙는 비동기 클라이언트 (네트워크 포트를 쓰지 않는다)."""
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def session():
    async with AsyncSessionLocal() as s:
        yield s


# ══════════════════════════════════════════════════════════════════
# 사용자 만들기
# ══════════════════════════════════════════════════════════════════

async def _create_user(session, *, email=None, nickname=None, role=UserRole.USER,
                       plan=SubscriptionPlan.FREE, template=1, active=True,
                       password="pw123456"):
    u = User(
        email=email or f"{uuid.uuid4().hex[:8]}@test.example.com",
        nickname=nickname or f"user_{uuid.uuid4().hex[:6]}",
        password=get_password_hash(password),
        provider=LoginProvider.LOCAL,
        role=role,
        is_active=active,
        active_template=template,
        subscription_plan=plan,
    )
    session.add(u)
    await session.commit()
    await session.refresh(u)
    return u


@pytest_asyncio.fixture
async def make_user(session):
    """테스트에서 사용자를 만들 때 쓴다. 토큰까지 함께 돌려준다."""
    async def _make(**kw):
        u = await _create_user(session, **kw)
        token = create_access_token({"sub": u.email, "role": u.role.value})
        return u, {"Authorization": f"Bearer {token}"}
    return _make


@pytest_asyncio.fixture
async def career_item_id(session):
    """마이그레이션이 넣은 기준정보에서 항목 하나를 집는다."""
    row = (await session.execute(
        text('SELECT id FROM career_items ORDER BY id LIMIT 1')
    )).scalar()
    assert row is not None, "career_items가 비어 있습니다 — 시드 마이그레이션이 안 돌았습니다"
    return row
