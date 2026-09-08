"""T1/T2 통합 회귀.

오늘 고친 버그: `/profile/public/list`가 T1 테이블만 조인해서 T2만 작성한
사용자가 카테고리 목록에서 영구히 누락됐다. `/profile/search`는 둘 다 봤다.
같은 공개 조회인데 동작이 갈렸던 원인이 템플릿 분기를 두 벌로 유지한 것이었다.

지금은 두 경로가 services/portfolio.py의 같은 함수를 쓴다. 이 테스트가
그 성질을 고정한다.
"""

import pytest


def name_payload(name, english, item_ids, *, area=None):
    p = {"name": name, "english_name": english, "tagline": "TL",
         "description1": "d1", "description2": "d2",
         "thumbnail_url": "th.png", "career_item_ids": item_ids}
    if area is not None:
        p["activity_area"] = area
    return p


@pytest.mark.parametrize("template", [1, 2])
async def test_공개_목록에_해당_템플릿_사용자가_나온다(client, make_user, career_item_id, template):
    _, h = await make_user(template=template)
    body = name_payload(f"이름{template}", f"Name{template}", [career_item_id],
                        area="서울" if template == 2 else None)
    assert (await client.put(f"/profile/t{template}/name-section", json=body, headers=h)).status_code == 200

    r = await client.get(f"/profile/public/list?career_item_id={career_item_id}")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1, rows
    assert rows[0]["active_template"] == template
    assert rows[0]["name"] == f"이름{template}"


async def test_T2만_작성한_사용자가_목록에서_누락되지_않는다(client, make_user, career_item_id):
    """이게 오늘 고친 버그의 재발 방지선이다."""
    _, h1 = await make_user(template=1, nickname="티원")
    _, h2 = await make_user(template=2, nickname="티투")
    await client.put("/profile/t1/name-section",
                     json=name_payload("김티원", "Kim", [career_item_id]), headers=h1)
    await client.put("/profile/t2/name-section",
                     json=name_payload("박티투", "Park", [career_item_id], area="부산"), headers=h2)

    rows = (await client.get(f"/profile/public/list?career_item_id={career_item_id}")).json()
    nicknames = {r["nickname"] for r in rows}
    assert nicknames == {"티원", "티투"}, rows
    assert {r["active_template"] for r in rows} == {1, 2}


async def test_목록과_검색이_같은_사용자_집합을_본다(client, make_user, career_item_id):
    """두 공개 API의 동작이 갈리지 않아야 한다."""
    _, h1 = await make_user(template=1, nickname="검색티원")
    _, h2 = await make_user(template=2, nickname="검색티투")
    await client.put("/profile/t1/name-section",
                     json=name_payload("검색가능", "Findable One", [career_item_id]), headers=h1)
    await client.put("/profile/t2/name-section",
                     json=name_payload("검색가능", "Findable Two", [career_item_id], area="서울"), headers=h2)

    listed = {r["id"] for r in (await client.get(
        f"/profile/public/list?career_item_id={career_item_id}")).json()}
    found = {r["id"] for r in (await client.get("/profile/search?q=검색가능")).json()}
    assert listed == found, f"목록 {listed} vs 검색 {found}"


async def test_비활성_사용자는_공개되지_않는다(client, make_user, career_item_id):
    _, h = await make_user(template=1, active=True)
    await client.put("/profile/t1/name-section",
                     json=name_payload("나중에비활성", "Later", [career_item_id]), headers=h)
    # 비활성 사용자를 따로 하나 더
    u2, h2 = await make_user(template=1, nickname="비활성", active=False)
    rows = (await client.get(f"/profile/public/list?career_item_id={career_item_id}")).json()
    assert u2.id not in {r["id"] for r in rows}


@pytest.mark.parametrize("template", [1, 2])
async def test_공개_프로필_조회가_템플릿에_맞는_모양을_돌려준다(client, make_user, career_item_id, template):
    u, h = await make_user(template=template)
    await client.put(f"/profile/t{template}/name-section",
                     json=name_payload("공개", "Public", [career_item_id],
                                       area="대구" if template == 2 else None), headers=h)

    d = (await client.get(f"/profile/public/{u.id}")).json()
    assert d["active_template"] == template
    assert d["name_section"]["name"] == "공개"
    # 이미지 섹션은 템플릿 2에만 있다
    if template == 2:
        assert "image_sections" in d
        assert d["name_section"]["activity_area"] == "대구"
    else:
        assert "image_sections" not in d


async def test_by_id와_public이_같은_결과를_준다(client, make_user, career_item_id):
    u, h = await make_user(template=1)
    await client.put("/profile/t1/name-section",
                     json=name_payload("동일", "Same", [career_item_id]), headers=h)
    a = (await client.get(f"/profile/by-id/{u.id}")).json()
    b = (await client.get(f"/profile/public/{u.id}")).json()
    assert a == b


async def test_없는_사용자는_404(client):
    assert (await client.get("/profile/public/999999")).status_code == 404


async def test_비활성_사용자_프로필은_403(client, make_user):
    u, _ = await make_user(active=False)
    assert (await client.get(f"/profile/public/{u.id}")).status_code == 403
