"""권한 · 인증 경계."""

import pytest

from app.models.user import UserRole

ADMIN_GET = ["/admin/stats", "/admin/recent", "/admin/users", "/admin/main-page"]
MY_GET = ["/profile/me/t1", "/profile/me/t2"]


@pytest.mark.parametrize("path", ADMIN_GET)
async def test_토큰_없이_관리자_API는_401(client, path):
    assert (await client.get(path)).status_code == 401


@pytest.mark.parametrize("path", ADMIN_GET)
async def test_일반_사용자는_관리자_API에_403(client, make_user, path):
    _, h = await make_user(role=UserRole.USER)
    r = await client.get(path, headers=h)
    assert r.status_code == 403, f"{path} → {r.status_code}"


@pytest.mark.parametrize("path", ADMIN_GET)
async def test_관리자는_관리자_API에_접근한다(client, make_user, path):
    _, h = await make_user(role=UserRole.ADMIN)
    r = await client.get(path, headers=h)
    assert r.status_code == 200, f"{path} → {r.status_code} {r.text[:120]}"


@pytest.mark.parametrize("path", MY_GET)
async def test_토큰_없이_내_프로필은_401(client, path):
    assert (await client.get(path)).status_code == 401


async def test_잘못된_토큰은_401(client):
    r = await client.get("/profile/me/t1", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


async def test_Bearer_없는_헤더는_401(client, make_user):
    _, h = await make_user()
    raw = h["Authorization"].split(" ", 1)[1]
    assert (await client.get("/profile/me/t1", headers={"Authorization": raw})).status_code == 401


async def test_비활성_계정의_토큰은_403(client, make_user):
    _, h = await make_user(active=False)
    assert (await client.get("/profile/me/t1", headers=h)).status_code == 403


async def test_저장은_토큰의_주인에게만_적용된다(client, make_user, career_item_id):
    """남의 프로필을 고칠 수 있는 경로가 없어야 한다.

    저장 라우트는 user_id를 받지 않고 토큰에서 꺼내 쓴다. 그래서 A의
    토큰으로 저장하면 A의 데이터만 바뀐다 — 그 성질을 고정한다.
    """
    ua, ha = await make_user(template=1, nickname="에이")
    ub, hb = await make_user(template=1, nickname="비")
    body = {"name": "에이가쓴이름", "english_name": "A", "tagline": None,
            "description1": None, "description2": None, "thumbnail_url": None,
            "career_item_ids": [career_item_id]}
    await client.put("/profile/t1/name-section", json=body, headers=ha)

    a = (await client.get(f"/profile/public/{ua.id}")).json()
    b = (await client.get(f"/profile/public/{ub.id}")).json()
    assert a["name_section"]["name"] == "에이가쓴이름"
    assert b["name_section"] is None, "B의 프로필이 A의 저장에 영향을 받았습니다"


async def test_관리자_사용자_목록에_비밀번호가_없다(client, make_user):
    _, h = await make_user(role=UserRole.ADMIN)
    rows = (await client.get("/admin/users", headers=h)).json()
    assert rows
    for row in rows:
        assert "password" not in row, "관리자 목록 응답에 비밀번호가 실려 나갑니다"
