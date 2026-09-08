"""플랜별 앨범 카드 한도.

t1·t2 **양쪽** 다 검사합니다. 한쪽만 걸어두면 다른 템플릿으로 우회되는데,
그 우회가 가능해지는 순간을 이 테스트가 잡습니다.
"""

import pytest

from app.models.user import SubscriptionPlan


def card(i):
    return {"link": f"L{i}", "project_title": f"곡{i}", "project_subtitle": None,
            "album_name": None, "composer": None, "category_desc": None,
            "year": None, "description": None, "order": 0}


def payload(n, kind="soundcloud_cards"):
    body = {"youtube_cards": [], "soundcloud_cards": [],
            "image_cards": [], "no_image_cards": []}
    body[kind] = [card(i) for i in range(n)]
    return body


LIMITS = [
    (SubscriptionPlan.FREE, 3),
    (SubscriptionPlan.STANDARD, 10),
]


@pytest.mark.parametrize("template", [1, 2])
@pytest.mark.parametrize("plan,limit", LIMITS)
async def test_한도_이내는_저장된다(client, make_user, template, plan, limit):
    _, h = await make_user(plan=plan, template=template)
    r = await client.put(f"/profile/t{template}/album-section",
                         json=payload(limit), headers=h)
    assert r.status_code == 200, r.text


@pytest.mark.parametrize("template", [1, 2])
@pytest.mark.parametrize("plan,limit", LIMITS)
async def test_한도를_넘으면_403(client, make_user, template, plan, limit):
    _, h = await make_user(plan=plan, template=template)
    r = await client.put(f"/profile/t{template}/album-section",
                         json=payload(limit + 1), headers=h)
    assert r.status_code == 403, r.text
    detail = r.json()["detail"]
    assert plan.value in detail
    assert str(limit) in detail
    assert str(limit + 1) in detail       # 지금 몇 개 요청했는지도 알려준다


@pytest.mark.parametrize("template", [1, 2])
async def test_PREMIUM은_무제한(client, make_user, template):
    _, h = await make_user(plan=SubscriptionPlan.PREMIUM, template=template)
    r = await client.put(f"/profile/t{template}/album-section",
                         json=payload(50), headers=h)
    assert r.status_code == 200, r.text


@pytest.mark.parametrize("template", [1, 2])
async def test_한도는_카드_4종의_합계로_센다(client, make_user, template):
    """한 종류만 세면 종류를 섞어서 우회할 수 있다. 합계여야 한다."""
    _, h = await make_user(plan=SubscriptionPlan.FREE, template=template)
    mixed = {"youtube_cards": [card(0)], "soundcloud_cards": [card(1)],
             "image_cards": [card(2)], "no_image_cards": [card(3)]}   # 합계 4 > 3
    r = await client.put(f"/profile/t{template}/album-section", json=mixed, headers=h)
    assert r.status_code == 403, r.text


async def test_T2_이미지섹션은_한도에_포함되지_않는다(client, make_user):
    """이미지 섹션은 성격이 다른 기능이라 앨범 카드 한도와 무관하다."""
    _, h = await make_user(plan=SubscriptionPlan.FREE, template=2)
    await client.put("/profile/t2/album-section", json=payload(3), headers=h)
    r = await client.put("/profile/t2/image-sections", headers=h, json={
        "sections": [{"title": "갤러리", "description": "", "order": 0,
                      "images": [{"image_url": f"i{i}.png", "order": i} for i in range(4)]}]
    })
    assert r.status_code == 200, r.text


async def test_한도_초과_저장은_기존_카드를_건드리지_않는다(client, make_user):
    """403이 나갈 때 DB가 이미 지워져 있으면 안 된다 (저장 전에 검사해야 함)."""
    _, h = await make_user(plan=SubscriptionPlan.FREE, template=1)
    await client.put("/profile/t1/album-section", json=payload(3), headers=h)

    r = await client.put("/profile/t1/album-section", json=payload(4), headers=h)
    assert r.status_code == 403

    got = await client.get("/profile/me/t1", headers=h)
    cards = sum(len(v) for v in got.json()["album_section"].values())
    assert cards == 3, "한도 초과 요청이 기존 카드를 지웠습니다"
