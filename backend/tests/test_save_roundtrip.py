"""저장 라운드트립.

저장한 값이 그대로 돌아오는지, 재저장이 중복을 만들지 않는지,
빈 목록 저장이 전체 삭제로 동작하는지.
T1/T2가 같은 서비스 함수를 쓰므로 양쪽 다 돌립니다.
"""

import pytest
from sqlalchemy import text

TEMPLATES = [1, 2]


def name_payload(template):
    p = {"name": "이름", "english_name": "Name", "tagline": "TL",
         "description1": "설명1", "description2": "설명2",
         "thumbnail_url": "th.png", "career_item_ids": []}
    if template == 2:
        p["activity_area"] = "서울"
    return p


CONTACT = {"phone1": "010-1111-1111", "phone2": "010-2222-2222",
           "email1": "a@example.com", "email2": "b@example.com", "email3": "c@example.com",
           "instagram_url": "ig", "tiktok_url": "tt", "youtube_url": "yt",
           "extra_description": "메모"}

TEXTS = {"sections": [
    {"title": "S0", "description": "d0", "order": 0, "cards": [
        {"title": "C0", "detail": "det", "order": 0, "body_items": [
            {"title": "B0", "content": "c0", "order": 0},
            {"title": "B1", "content": "c1", "order": 1}]},
        {"title": "C1", "detail": "det", "order": 1, "body_items": []}]},
    {"title": "S1", "description": "d1", "order": 1, "cards": []}]}


@pytest.mark.parametrize("template", TEMPLATES)
async def test_name_section_왕복(client, make_user, career_item_id, template):
    _, h = await make_user(template=template)
    body = {**name_payload(template), "career_item_ids": [career_item_id]}
    assert (await client.put(f"/profile/t{template}/name-section", json=body, headers=h)).status_code == 200

    ns = (await client.get(f"/profile/me/t{template}", headers=h)).json()["name_section"]
    for k in ("name", "english_name", "tagline", "description1", "description2", "thumbnail_url"):
        assert ns[k] == body[k]
    assert ns["career_item_ids"] == [career_item_id]
    if template == 2:
        assert ns["activity_area"] == "서울"


@pytest.mark.parametrize("template", TEMPLATES)
async def test_name_section_재저장해도_직업이_중복되지_않는다(client, make_user, career_item_id, template):
    _, h = await make_user(template=template)
    body = {**name_payload(template), "career_item_ids": [career_item_id]}
    for _ in range(3):
        await client.put(f"/profile/t{template}/name-section", json=body, headers=h)

    ns = (await client.get(f"/profile/me/t{template}", headers=h)).json()["name_section"]
    assert ns["career_item_ids"] == [career_item_id]


@pytest.mark.parametrize("template", TEMPLATES)
async def test_contact_section_아홉_필드_왕복(client, make_user, template):
    _, h = await make_user(template=template)
    assert (await client.put(f"/profile/t{template}/contact-section",
                             json=CONTACT, headers=h)).status_code == 200
    got = (await client.get(f"/profile/me/t{template}", headers=h)).json()["contact_section"]
    assert got == CONTACT


@pytest.mark.parametrize("template", TEMPLATES)
async def test_text_sections_중첩_왕복(client, make_user, template):
    _, h = await make_user(template=template)
    assert (await client.put(f"/profile/t{template}/text-sections",
                             json=TEXTS, headers=h)).status_code == 200

    got = (await client.get(f"/profile/me/t{template}", headers=h)).json()["text_sections"]
    assert [s["title"] for s in got] == ["S0", "S1"]
    assert [c["title"] for c in got[0]["cards"]] == ["C0", "C1"]
    assert [b["title"] for b in got[0]["cards"][0]["body_items"]] == ["B0", "B1"]


@pytest.mark.parametrize("template", TEMPLATES)
async def test_text_sections_재저장해도_중복되지_않는다(client, make_user, template):
    _, h = await make_user(template=template)
    for _ in range(3):
        await client.put(f"/profile/t{template}/text-sections", json=TEXTS, headers=h)
    got = (await client.get(f"/profile/me/t{template}", headers=h)).json()["text_sections"]
    assert len(got) == 2


@pytest.mark.parametrize("template", TEMPLATES)
async def test_빈_목록_저장은_전체_삭제다(client, make_user, session, template):
    _, h = await make_user(template=template)
    await client.put(f"/profile/t{template}/text-sections", json=TEXTS, headers=h)
    await client.put(f"/profile/t{template}/text-sections", json={"sections": []}, headers=h)

    got = (await client.get(f"/profile/me/t{template}", headers=h)).json()["text_sections"]
    assert got == []
    # 고아 행이 남지 않았는지 (삭제 순서가 잘못되면 body_items가 남는다)
    orphans = (await session.execute(text(
        f"SELECT count(*) FROM t{template}_text_card_body_items b "
        f"LEFT JOIN t{template}_text_cards c ON b.text_card_id = c.id WHERE c.id IS NULL"
    ))).scalar()
    assert orphans == 0


@pytest.mark.parametrize("template", TEMPLATES)
async def test_album_카드_order가_다시_매겨진다(client, make_user, template):
    _, h = await make_user(template=template)
    cards = [{"link": f"L{i}", "project_title": f"T{i}", "project_subtitle": None,
              "album_name": None, "composer": None, "category_desc": None,
              "year": None, "description": None, "order": 99} for i in range(3)]
    body = {"youtube_cards": cards, "soundcloud_cards": [],
            "image_cards": [], "no_image_cards": []}
    assert (await client.put(f"/profile/t{template}/album-section",
                             json=body, headers=h)).status_code == 200
    got = (await client.get(f"/profile/me/t{template}", headers=h)).json()["album_section"]
    assert [c["order"] for c in got["youtube_cards"]] == [0, 1, 2]


async def test_T2_이미지섹션_최대_4장_제한(client, make_user):
    _, h = await make_user(template=2)
    body = {"sections": [{"title": "IS", "description": "d", "order": 0,
                          "images": [{"image_url": f"i{i}.png", "order": i} for i in range(7)]}]}
    assert (await client.put("/profile/t2/image-sections", json=body, headers=h)).status_code == 200
    got = (await client.get("/profile/me/t2", headers=h)).json()["image_sections"]
    assert len(got[0]["images"]) == 4


async def test_T1_응답에는_이미지섹션_키가_없다(client, make_user):
    _, h = await make_user(template=1)
    got = (await client.get("/profile/me/t1", headers=h)).json()
    assert "image_sections" not in got
