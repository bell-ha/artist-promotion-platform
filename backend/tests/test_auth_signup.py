"""이메일 인증 강제 · OTP 시도 제한 · 쿨다운.

오늘 막은 구멍이라 회귀 방지선이 필요합니다.
OTP 저장소가 프로세스 메모리 dict(app.api.auth.otp_storage)라 테스트에서
직접 조작합니다. 실제 메일 발송은 BackgroundTasks로 빠지므로
ASGITransport 환경에서는 SMTP를 타지 않습니다.
"""

from datetime import datetime, timedelta

import pytest

from app.api import auth as auth_module

SIGNUP = {"nickname": "새사용자", "email": "newbie@test.example.com", "password": "pw123456"}


@pytest.fixture(autouse=True)
def _clear_otp_storage():
    auth_module.otp_storage.clear()
    auth_module.forgot_otp_storage.clear()
    yield
    auth_module.otp_storage.clear()
    auth_module.forgot_otp_storage.clear()


def _put_otp(email, otp="123456", *, verified=False, attempts=0, minutes=5, sent_ago=0):
    auth_module.otp_storage[email] = {
        "otp": otp,
        "expires": datetime.now() + timedelta(minutes=minutes),
        "verified": verified,
        "attempts": attempts,
        "last_sent": datetime.now() - timedelta(seconds=sent_ago),
    }


# ── 1. 이메일 인증 강제 ──────────────────────────────────────────

async def test_인증_없이_가입하면_400(client):
    r = await client.post("/auth/signup", json=SIGNUP)
    assert r.status_code == 400
    assert "인증" in r.json()["detail"]


async def test_verify만_하고_가입하면_200(client):
    _put_otp(SIGNUP["email"])
    v = await client.post("/auth/verify-otp", json={"email": SIGNUP["email"], "otp": "123456"})
    assert v.status_code == 200
    assert v.json()["status"] == "verified"

    r = await client.post("/auth/signup", json=SIGNUP)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "success"


async def test_인증은_한_번만_쓰인다(client):
    """가입에 소비된 인증으로 다시 가입할 수 없다."""
    _put_otp(SIGNUP["email"], verified=True)
    first = await client.post("/auth/signup", json=SIGNUP)
    assert first.status_code == 200

    second = await client.post("/auth/signup",
                               json={**SIGNUP, "nickname": "다른닉"})
    assert second.status_code == 400
    assert "인증" in second.json()["detail"]


async def test_만료된_인증으로는_가입할_수_없다(client):
    auth_module.otp_storage[SIGNUP["email"]] = {
        "otp": "123456",
        "expires": datetime.now() - timedelta(minutes=1),   # 이미 만료
        "verified": True,
        "attempts": 0,
        "last_sent": datetime.now() - timedelta(minutes=6),
    }
    r = await client.post("/auth/signup", json=SIGNUP)
    assert r.status_code == 400


async def test_다른_이메일의_인증은_소용없다(client):
    _put_otp("someone.else@test.example.com", verified=True)
    r = await client.post("/auth/signup", json=SIGNUP)
    assert r.status_code == 400


async def test_비밀번호가_짧으면_400(client):
    _put_otp(SIGNUP["email"], verified=True)
    r = await client.post("/auth/signup", json={**SIGNUP, "password": "12345"})
    assert r.status_code == 400
    assert "6자" in r.json()["detail"]


# ── 2. OTP 시도 제한 · 쿨다운 ────────────────────────────────────

async def test_틀린_OTP는_시도_횟수를_올린다(client):
    _put_otp(SIGNUP["email"], otp="111111")
    r = await client.post("/auth/verify-otp", json={"email": SIGNUP["email"], "otp": "999999"})
    assert r.status_code == 400
    assert auth_module.otp_storage[SIGNUP["email"]]["attempts"] == 1


async def test_5회_넘게_틀리면_폐기되고_429(client):
    _put_otp(SIGNUP["email"], otp="111111")
    for _ in range(auth_module.OTP_MAX_ATTEMPTS):
        await client.post("/auth/verify-otp", json={"email": SIGNUP["email"], "otp": "999999"})

    r = await client.post("/auth/verify-otp", json={"email": SIGNUP["email"], "otp": "111111"})
    assert r.status_code == 429
    # 폐기됐으므로 맞는 번호를 알아도 다시 쓸 수 없다
    assert SIGNUP["email"] not in auth_module.otp_storage


async def test_쿨다운_안에_재발송하면_429(client):
    _put_otp(SIGNUP["email"], sent_ago=0)
    r = await client.post(f'/auth/send-otp?email={SIGNUP["email"]}')
    assert r.status_code == 429
    assert "초" in r.json()["detail"]


async def test_쿨다운이_지나면_재발송된다(client):
    _put_otp(SIGNUP["email"], sent_ago=auth_module.OTP_RESEND_COOLDOWN_SECONDS + 1)
    r = await client.post(f'/auth/send-otp?email={SIGNUP["email"]}')
    assert r.status_code == 200
    # 새 번호가 발급되고 인증 상태는 초기화된다
    assert auth_module.otp_storage[SIGNUP["email"]]["verified"] is False
    assert auth_module.otp_storage[SIGNUP["email"]]["attempts"] == 0
