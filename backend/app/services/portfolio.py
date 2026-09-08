"""
포트폴리오 도메인 로직 (템플릿 1·2 공통)

이 파일이 생긴 이유
────────────────────
api/profile.py가 898줄이었는데, 그중 약 600줄이 같은 코드 두 벌이었습니다.
읽기 직렬화가 네 벌(내 T1 조회 / 내 T2 조회 / 공개 조회의 T1 분기 / T2 분기),
저장 로직이 두 벌 있었습니다. T1과 T2는 테이블만 다르고 구조가 같습니다 —
실제 차이는 T2NameSection.activity_area 한 필드와 T2 전용 이미지 섹션뿐입니다.

그래서 "어떤 모델 묶음을 쓸지"만 레지스트리(TEMPLATES)로 골라 주고,
읽기·저장 로직은 한 벌만 둡니다. 템플릿 3이 생기면 아래 TEMPLATES에
한 줄 추가하는 것으로 끝나고, api 레이어는 건드릴 필요가 없습니다.

테이블을 t1_*/t2_*로 나눈 것 자체는 그대로 뒀습니다. 그건 템플릿별로
독립적으로 진화시키려는 선택이라 근거가 있고, 문제는 그 분리가 파이썬
코드까지 복제된 것이었습니다.
"""

from dataclasses import dataclass, field
from typing import Optional, Type

from sqlalchemy import delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.template1 import (
    NameSection, NameSectionJob,
    AlbumSection, YoutubeCard, SoundcloudCard, ImageCard, NoImageCard,
    ContactSection,
    TextSection, TextCard, TextCardBodyItem,
)
from app.models.template2 import (
    T2NameSection, T2NameSectionJob,
    T2AlbumSection, T2YoutubeCard, T2SoundcloudCard, T2ImageCard, T2NoImageCard,
    T2ContactSection,
    T2TextSection, T2TextCard, T2TextCardBodyItem,
    T2ImageSection, T2ImageSectionImage,
)


# ══════════════════════════════════════════════════════════════════
# 템플릿 레지스트리
# ══════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class TemplateModels:
    """한 템플릿이 쓰는 모델 묶음. 아래 로직은 전부 이 묶음만 보고 동작합니다."""
    number: int

    name_section: Type
    name_section_job: Type

    album_section: Type
    youtube_card: Type
    soundcloud_card: Type
    image_card: Type
    no_image_card: Type

    contact_section: Type

    text_section: Type
    text_card: Type
    text_card_body_item: Type

    # 템플릿 2 전용 — 없는 템플릿은 None
    image_section: Optional[Type] = None
    image_section_image: Optional[Type] = None

    # 그 템플릿에만 있는 Name Section 필드 (T2의 activity_area)
    name_extra_fields: tuple = field(default_factory=tuple)

    @property
    def has_image_sections(self) -> bool:
        return self.image_section is not None

    @property
    def card_kinds(self):
        """(응답 키, 모델) 쌍. 앨범 카드 4종을 순회할 때 씁니다."""
        return (
            ("youtube_cards", self.youtube_card),
            ("soundcloud_cards", self.soundcloud_card),
            ("image_cards", self.image_card),
            ("no_image_cards", self.no_image_card),
        )


TEMPLATES = {
    1: TemplateModels(
        number=1,
        name_section=NameSection, name_section_job=NameSectionJob,
        album_section=AlbumSection,
        youtube_card=YoutubeCard, soundcloud_card=SoundcloudCard,
        image_card=ImageCard, no_image_card=NoImageCard,
        contact_section=ContactSection,
        text_section=TextSection, text_card=TextCard,
        text_card_body_item=TextCardBodyItem,
    ),
    2: TemplateModels(
        number=2,
        name_section=T2NameSection, name_section_job=T2NameSectionJob,
        album_section=T2AlbumSection,
        youtube_card=T2YoutubeCard, soundcloud_card=T2SoundcloudCard,
        image_card=T2ImageCard, no_image_card=T2NoImageCard,
        contact_section=T2ContactSection,
        text_section=T2TextSection, text_card=T2TextCard,
        text_card_body_item=T2TextCardBodyItem,
        image_section=T2ImageSection, image_section_image=T2ImageSectionImage,
        name_extra_fields=("activity_area",),
    ),
}


def get_template(template_number: int) -> Optional[TemplateModels]:
    return TEMPLATES.get(template_number)


# ══════════════════════════════════════════════════════════════════
# 직렬화 헬퍼
# ══════════════════════════════════════════════════════════════════

# Name / Contact 섹션의 응답 키. 순서까지 기존 응답과 같게 맞춰 뒀습니다.
NAME_FIELDS = (
    "name", "english_name", "tagline",
    "description1", "description2", "thumbnail_url",
)
CONTACT_FIELDS = (
    "phone1", "phone2",
    "email1", "email2", "email3",
    "instagram_url", "tiktok_url", "youtube_url",
    "extra_description",
)


def _row_to_dict(row) -> dict:
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}


def _by_order(rows):
    """selectinload로 가져온 자식들을 order 기준으로 정렬합니다.

    예전에는 쿼리마다 .order_by(...)를 붙였는데, 이제 관계를 한 번에
    끌어오므로 파이썬에서 정렬합니다. 모델의 Relationship에 order_by를
    다는 방법도 있지만 models/는 이 작업의 소유가 아니라 손대지 않았습니다.
    """
    return sorted(rows, key=lambda r: (r.order is None, r.order))


# ══════════════════════════════════════════════════════════════════
# 읽기
# ══════════════════════════════════════════════════════════════════

async def _load_name_section(session: AsyncSession, tpl: TemplateModels, user_id: int):
    ns = (await session.execute(
        select(tpl.name_section)
        .where(tpl.name_section.user_id == user_id)
        .options(selectinload(tpl.name_section.jobs))
    )).scalar_one_or_none()
    if not ns:
        return None

    data = {f: getattr(ns, f) for f in NAME_FIELDS}
    for f in tpl.name_extra_fields:          # T2의 activity_area
        data[f] = getattr(ns, f)
    data["career_item_ids"] = [j.career_item_id for j in ns.jobs]
    return data


async def _load_album_section(session: AsyncSession, tpl: TemplateModels, user_id: int):
    album = (await session.execute(
        select(tpl.album_section)
        .where(tpl.album_section.user_id == user_id)
        .options(
            selectinload(tpl.album_section.youtube_cards),
            selectinload(tpl.album_section.soundcloud_cards),
            selectinload(tpl.album_section.image_cards),
            selectinload(tpl.album_section.no_image_cards),
        )
    )).scalar_one_or_none()
    if not album:
        return None

    return {
        "youtube_cards":    [_row_to_dict(r) for r in _by_order(album.youtube_cards)],
        "soundcloud_cards": [_row_to_dict(r) for r in _by_order(album.soundcloud_cards)],
        "image_cards":      [_row_to_dict(r) for r in _by_order(album.image_cards)],
        "no_image_cards":   [_row_to_dict(r) for r in _by_order(album.no_image_cards)],
    }


async def _load_text_sections(session: AsyncSession, tpl: TemplateModels, user_id: int):
    sections = (await session.execute(
        select(tpl.text_section)
        .where(tpl.text_section.user_id == user_id)
        .order_by(tpl.text_section.order)
        .options(
            selectinload(tpl.text_section.cards)
            .selectinload(tpl.text_card.body_items)
        )
    )).scalars().all()

    return [
        {
            "title": ts.title,
            "description": ts.description,
            "order": ts.order,
            "cards": [
                {
                    "title": card.title,
                    "detail": card.detail,
                    "order": card.order,
                    "body_items": [
                        {"title": b.title, "content": b.content, "order": b.order}
                        for b in _by_order(card.body_items)
                    ],
                }
                for card in _by_order(ts.cards)
            ],
        }
        for ts in sections
    ]


async def _load_contact_section(session: AsyncSession, tpl: TemplateModels, user_id: int):
    cs = (await session.execute(
        select(tpl.contact_section).where(tpl.contact_section.user_id == user_id)
    )).scalar_one_or_none()
    if not cs:
        return None
    return {f: getattr(cs, f) for f in CONTACT_FIELDS}


async def _load_image_sections(session: AsyncSession, tpl: TemplateModels, user_id: int):
    if not tpl.has_image_sections:
        return None

    sections = (await session.execute(
        select(tpl.image_section)
        .where(tpl.image_section.user_id == user_id)
        .order_by(tpl.image_section.order)
        .options(selectinload(tpl.image_section.images))
    )).scalars().all()

    return [
        {
            "title": sec.title,
            "description": sec.description,
            "order": sec.order,
            "images": [
                {"image_url": img.image_url, "order": img.order}
                for img in _by_order(sec.images)
            ],
        }
        for sec in sections
    ]


async def load_portfolio(session: AsyncSession, tpl: TemplateModels, user_id: int) -> dict:
    """한 사용자의 포트폴리오 전체를 읽습니다.

    쿼리 수가 데이터 양과 무관하게 고정입니다(T1 11회, T2 14회).
    예전에는 텍스트 섹션 S개·카드 C개일 때 9 + S + S*C 회였습니다 —
    섹션 3개에 카드 4개면 한 번 조회에 24회가 나갔습니다.
    """
    data = {
        "name_section":    await _load_name_section(session, tpl, user_id),
        "album_section":   await _load_album_section(session, tpl, user_id),
        "contact_section": await _load_contact_section(session, tpl, user_id),
        "text_sections":   await _load_text_sections(session, tpl, user_id),
    }
    if tpl.has_image_sections:
        data["image_sections"] = await _load_image_sections(session, tpl, user_id)
    return data


# ══════════════════════════════════════════════════════════════════
# 저장
# ══════════════════════════════════════════════════════════════════

async def save_name_section(session: AsyncSession, tpl: TemplateModels, user_id: int, data) -> None:
    ns = (await session.execute(
        select(tpl.name_section).where(tpl.name_section.user_id == user_id)
    )).scalar_one_or_none()

    if not ns:
        ns = tpl.name_section(user_id=user_id)
        session.add(ns)
        await session.flush()

    for f in NAME_FIELDS:
        setattr(ns, f, getattr(data, f))
    for f in tpl.name_extra_fields:
        setattr(ns, f, getattr(data, f))

    await session.execute(
        delete(tpl.name_section_job).where(tpl.name_section_job.name_section_id == ns.id)
    )
    for item_id in data.career_item_ids:
        session.add(tpl.name_section_job(name_section_id=ns.id, career_item_id=item_id))

    await session.commit()


async def save_album_section(session: AsyncSession, tpl: TemplateModels, user_id: int, data) -> None:
    album = (await session.execute(
        select(tpl.album_section).where(tpl.album_section.user_id == user_id)
    )).scalar_one_or_none()

    if not album:
        album = tpl.album_section(user_id=user_id)
        session.add(album)
        await session.flush()

    # 기존 카드 전부 삭제 후 재삽입
    for key, model in tpl.card_kinds:
        await session.execute(delete(model).where(model.album_section_id == album.id))
        for i, card in enumerate(getattr(data, key)):
            session.add(model(
                album_section_id=album.id,
                order=i,
                **card.model_dump(exclude={"order"}),
            ))

    await session.commit()


async def save_text_sections(session: AsyncSession, tpl: TemplateModels, user_id: int, data) -> None:
    # 기존 데이터 전부 삭제 (body_items → cards → sections 순)
    existing = (await session.execute(
        select(tpl.text_section)
        .where(tpl.text_section.user_id == user_id)
        .options(selectinload(tpl.text_section.cards))
    )).scalars().all()

    card_ids = [card.id for ts in existing for card in ts.cards]
    if card_ids:
        await session.execute(
            delete(tpl.text_card_body_item)
            .where(tpl.text_card_body_item.text_card_id.in_(card_ids))
        )
    section_ids = [ts.id for ts in existing]
    if section_ids:
        await session.execute(
            delete(tpl.text_card).where(tpl.text_card.text_section_id.in_(section_ids))
        )
    await session.execute(
        delete(tpl.text_section).where(tpl.text_section.user_id == user_id)
    )

    # 새 데이터 삽입
    for i, sec_data in enumerate(data.sections):
        ts = tpl.text_section(
            user_id=user_id,
            title=sec_data.title,
            description=sec_data.description,
            order=i,
        )
        session.add(ts)
        await session.flush()

        for j, card_data in enumerate(sec_data.cards):
            card = tpl.text_card(
                text_section_id=ts.id,
                title=card_data.title,
                detail=card_data.detail,
                order=j,
            )
            session.add(card)
            await session.flush()

            for k, body_data in enumerate(card_data.body_items):
                session.add(tpl.text_card_body_item(
                    text_card_id=card.id,
                    title=body_data.title,
                    content=body_data.content,
                    order=k,
                ))

    await session.commit()


async def save_contact_section(session: AsyncSession, tpl: TemplateModels, user_id: int, data) -> None:
    cs = (await session.execute(
        select(tpl.contact_section).where(tpl.contact_section.user_id == user_id)
    )).scalar_one_or_none()

    if not cs:
        cs = tpl.contact_section(user_id=user_id)
        session.add(cs)

    for f in CONTACT_FIELDS:
        setattr(cs, f, getattr(data, f))

    await session.commit()


async def save_image_sections(session: AsyncSession, tpl: TemplateModels, user_id: int, data) -> None:
    if not tpl.has_image_sections:
        return

    existing = (await session.execute(
        select(tpl.image_section).where(tpl.image_section.user_id == user_id)
    )).scalars().all()

    section_ids = [sec.id for sec in existing]
    if section_ids:
        await session.execute(
            delete(tpl.image_section_image)
            .where(tpl.image_section_image.image_section_id.in_(section_ids))
        )
    await session.execute(
        delete(tpl.image_section).where(tpl.image_section.user_id == user_id)
    )

    for i, sec_data in enumerate(data.sections):
        sec = tpl.image_section(
            user_id=user_id,
            title=sec_data.title,
            description=sec_data.description,
            order=i,
        )
        session.add(sec)
        await session.flush()

        for j, img_data in enumerate(sec_data.images[:4]):   # 최대 4개 제한
            session.add(tpl.image_section_image(
                image_section_id=sec.id,
                image_url=img_data.image_url,
                order=j,
            ))

    await session.commit()


# ══════════════════════════════════════════════════════════════════
# 공개 목록 / 검색
# ══════════════════════════════════════════════════════════════════
#
# 이 두 개가 한 함수를 공유하는 게 중요합니다.
# 예전에는 /profile/search는 T1·T2를 모두 조회했는데 /profile/public/list는
# T1 테이블만 조인해서, T2만 작성한 사용자가 카테고리 목록에서 영구히
# 누락됐습니다. 같은 공개 조회인데 동작이 갈렸던 이유가 템플릿 분기를
# 두 벌로 유지한 것이었습니다.

async def _artist_rows(session: AsyncSession, tpl: TemplateModels, *,
                       career_item_id: Optional[int] = None,
                       pattern: Optional[str] = None,
                       limit: Optional[int] = None):
    """한 템플릿에서 공개 아티스트 행을 뽑습니다.

    active_template로 거르므로, 각 사용자는 지금 쓰고 있는 템플릿 기준으로
    한 번만 나옵니다(원래 /profile/search가 쓰던 규칙과 같습니다).
    """
    ns = tpl.name_section
    stmt = (
        select(User.id, User.nickname, ns.name, ns.english_name,
               ns.thumbnail_url, User.active_template)
        .join(ns, ns.user_id == User.id)
        .where(User.is_active == True)               # noqa: E712
        .where(User.active_template == tpl.number)
    )

    if career_item_id is not None:
        job = tpl.name_section_job
        stmt = (
            stmt.join(job, job.name_section_id == ns.id)
                .where(job.career_item_id == career_item_id)
        )

    if pattern is not None:
        stmt = stmt.where(or_(
            User.nickname.ilike(pattern),
            ns.name.ilike(pattern),
            ns.english_name.ilike(pattern),
        ))

    if limit is not None:
        stmt = stmt.limit(limit)

    return (await session.execute(stmt)).all()


def _dedupe(rows):
    """여러 템플릿에서 모은 행을 사용자 id 기준으로 중복 제거합니다."""
    seen, out = set(), []
    for r in rows:
        if r.id not in seen:
            seen.add(r.id)
            out.append(r)
    return out


async def list_public_artists(session: AsyncSession, career_item_id: int) -> list:
    rows = []
    for tpl in TEMPLATES.values():
        rows.extend(await _artist_rows(session, tpl, career_item_id=career_item_id))

    return [
        {
            "id": r.id,
            "nickname": r.nickname,
            "name": r.name,
            "english_name": r.english_name,
            "thumbnail_url": r.thumbnail_url,
            "active_template": r.active_template,
        }
        for r in _dedupe(rows)
    ]


async def search_artists(session: AsyncSession, q: str, limit: int = 20) -> list:
    if not q.strip():
        return []
    pattern = f"%{q.strip()}%"

    rows = []
    for tpl in TEMPLATES.values():
        rows.extend(await _artist_rows(session, tpl, pattern=pattern, limit=limit))

    return [
        {
            "id": r.id,
            "nickname": r.nickname,
            "name": r.name,
            "english_name": r.english_name,
            "thumbnail_url": r.thumbnail_url,
        }
        for r in _dedupe(rows)
    ][:limit]
