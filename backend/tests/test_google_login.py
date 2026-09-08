"""구글 로그인 예외 처리.

오늘 고친 것: try 블록 안에서 raise한 HTTPException(403, 비활성 계정)을
아래 `except Exception`이 삼켜서 500 + 내부 예외 문자열로 재포장하고 있었다.
비활성 계정이 500으로 나가고, 서버 내부 메시지가 클라이언트에 노출됐다.

실제 구글 토큰을 만들 수 없으므로 검증 함수만 갈아끼운다.
"""

import pytest

from app.api import auth as auth_module
from app.models.user import UserRole, LoginProvider


@pytest.fixture
def fake_google(monkeypatch):
    """id_token.verify_oauth2_token을 원하는 결과로 바꾼다."""
    def _use(result=None, raises=None):
        def _verify(token, request, client_id, **kw):
            if raises is not None:
                raise raises
            return result
        monkeypatch.setattr(auth_module.id_token, "verify_oauth2_token", _verify)
    return _use


async def test_비활성_계정은_403이고_500이_아니다(client, make_user, fake_google):
    u, _ = await make_user(active=False, email="inactive@test.example.com")
    fake_google({"email": u.email, "sub": "google-sub-1"})

    r = await client.post("/auth/google", json={"token": "whatever"})
    assert r.status_code == 403, f"{r.status_code} {r.text}"
    assert r.json()["detail"] == "비활성화된 계정입니다."


async def test_비활성_계정_응답에_내부_예외_문자열이_없다(client, make_user, fake_google):
    u, _ = await make_user(active=False, email="inactive2@test.example.com")
    fake_google({"email": u.email, "sub": "google-sub-2"})
    detail = (await client.post("/auth/google", json={"token": "x"})).json()["detail"]
    for leak in ("Traceback", "sqlalchemy", "asyncpg", "HTTPException"):
        assert leak not in detail


async def test_유효하지_않은_토큰은_400(client, fake_google):
    fake_google(raises=ValueError("bad token"))
    r = await client.post("/auth/google", json={"token": "bad"})
    assert r.status_code == 400
    assert "구글" in r.json()["detail"]


async def test_처음_로그인하면_계정이_생기고_is_new_user가_참(client, fake_google, session):
    fake_google({"email": "brand.new@test.example.com", "sub": "google-sub-3"})
    r = await client.post("/auth/google", json={"token": "x"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["is_new_user"] is True
    assert body["email"] == "brand.new@test.example.com"
    assert body["role"] == UserRole.USER.value

    from sqlalchemy import select
    from app.models.user import User
    u = (await session.execute(
        select(User).where(User.email == "brand.new@test.example.com"))).scalar_one()
    assert u.provider == LoginProvider.GOOGLE
    assert u.social_id == "google-sub-3"


async def test_기존_계정으로_다시_로그인하면_새_계정을_만들지_않는다(client, make_user, fake_google, session):
    u, _ = await make_user(email="already@test.example.com", nickname="이미있음")
    fake_google({"email": u.email, "sub": "google-sub-4"})

    r = await client.post("/auth/google", json={"token": "x"})
    assert r.status_code == 200
    assert r.json()["user_id"] == u.id
    assert r.json()["is_new_user"] is False

    from sqlalchemy import func, select
    from app.models.user import User
    n = (await session.execute(
        select(func.count()).select_from(User).where(User.email == u.email))).scalar()
    assert n == 1
