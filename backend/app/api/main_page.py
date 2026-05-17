from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_session
from app.models.user import User
from app.models.template1 import NameSection
from app.models.template2 import T2NameSection
from app.models.main_page import MainPageContent, DiscoverCard, SpotlightSetting
from app.core.deps import require_admin

public_router = APIRouter(tags=["main-page"])
admin_router = APIRouter(prefix="/admin/main-page", tags=["admin"])


# ── 내부 헬퍼 ───────────────────────────────────────

async def _get_thumbnail(artist_id: int, session: AsyncSession) -> Optional[str]:
    user = (await session.execute(select(User).where(User.id == artist_id))).scalar_one_or_none()
    if not user:
        return None
    if user.active_template == 2:
        ns = (await session.execute(
            select(T2NameSection).where(T2NameSection.user_id == artist_id)
        )).scalar_one_or_none()
    else:
        ns = (await session.execute(
            select(NameSection).where(NameSection.user_id == artist_id)
        )).scalar_one_or_none()
    return ns.thumbnail_url if ns else None


async def _get_nickname(artist_id: int, session: AsyncSession) -> Optional[str]:
    user = (await session.execute(select(User).where(User.id == artist_id))).scalar_one_or_none()
    return user.nickname if user else None


async def _ensure_content(session: AsyncSession) -> MainPageContent:
    content = (await session.execute(
        select(MainPageContent).where(MainPageContent.id == 1)
    )).scalar_one_or_none()
    if not content:
        content = MainPageContent(id=1)
        session.add(content)
        await session.commit()
        await session.refresh(content)
    return content


async def _ensure_spotlight(session: AsyncSession) -> SpotlightSetting:
    sp = (await session.execute(
        select(SpotlightSetting).where(SpotlightSetting.id == 1)
    )).scalar_one_or_none()
    if not sp:
        sp = SpotlightSetting(id=1)
        session.add(sp)
        await session.commit()
        await session.refresh(sp)
    return sp


# ── 공개 API ─────────────────────────────────────────

@public_router.get("/main-page")
async def get_main_page(session: AsyncSession = Depends(get_session)):
    content = await _ensure_content(session)
    spotlight = await _ensure_spotlight(session)
    cards = (await session.execute(
        select(DiscoverCard).order_by(DiscoverCard.slot_order)
    )).scalars().all()

    # Spotlight 이미지/아티스트명 결정
    sp_image = spotlight.image_url
    sp_artist_name = spotlight.artist_name
    if spotlight.artist_id:
        thumb = await _get_thumbnail(spotlight.artist_id, session)
        if thumb:
            sp_image = thumb
        if not sp_artist_name:
            sp_artist_name = await _get_nickname(spotlight.artist_id, session)

    # Discover 카드 썸네일 결정
    resolved_cards = []
    for card in cards:
        img = card.image_url
        if card.artist_id:
            thumb = await _get_thumbnail(card.artist_id, session)
            if thumb:
                img = thumb
        if img:
            resolved_cards.append({"slot_order": card.slot_order, "image_url": img})

    return {
        "hero": {
            "title": content.hero_title,
            "subtitle": content.hero_subtitle,
            "bg1_url": content.hero_bg1_url,
            "bg2_url": content.hero_bg2_url,
        },
        "discover": {
            "subtitle": content.discover_subtitle,
            "cards": resolved_cards,
        },
        "spotlight": {
            "subtitle": spotlight.subtitle,
            "image_url": sp_image,
            "title": spotlight.title,
            "artist_name": sp_artist_name,
            "genre": spotlight.genre,
        },
        "cta": {
            "title": content.cta_title,
            "subtitle": content.cta_subtitle,
        },
    }


# ── 어드민 API ────────────────────────────────────────

@admin_router.get("")
async def get_main_page_admin(
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    content = await _ensure_content(session)
    spotlight = await _ensure_spotlight(session)
    cards = (await session.execute(
        select(DiscoverCard).order_by(DiscoverCard.slot_order)
    )).scalars().all()

    # 어드민용: resolved_url 포함 (미리보기용)
    resolved_cards = []
    for card in cards:
        thumb = None
        if card.artist_id:
            thumb = await _get_thumbnail(card.artist_id, session)
        resolved_cards.append({
            "id": card.id,
            "slot_order": card.slot_order,
            "artist_id": card.artist_id,
            "image_url": card.image_url,
            "resolved_url": thumb or card.image_url,
        })

    sp_thumb = None
    if spotlight.artist_id:
        sp_thumb = await _get_thumbnail(spotlight.artist_id, session)

    return {
        "content": {
            "hero_title": content.hero_title,
            "hero_subtitle": content.hero_subtitle,
            "hero_bg1_url": content.hero_bg1_url,
            "hero_bg2_url": content.hero_bg2_url,
            "discover_subtitle": content.discover_subtitle,
            "cta_title": content.cta_title,
            "cta_subtitle": content.cta_subtitle,
        },
        "spotlight": {
            "subtitle": spotlight.subtitle,
            "artist_id": spotlight.artist_id,
            "image_url": spotlight.image_url,
            "title": spotlight.title,
            "artist_name": spotlight.artist_name,
            "genre": spotlight.genre,
            "resolved_url": sp_thumb or spotlight.image_url,
        },
        "cards": resolved_cards,
    }


class ContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_bg1_url: Optional[str] = None
    hero_bg2_url: Optional[str] = None
    discover_subtitle: Optional[str] = None
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None


@admin_router.patch("/content")
async def update_content(
    data: ContentUpdate,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    content = await _ensure_content(session)
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(content, field, val)
    await session.commit()
    return {"ok": True}


class SpotlightUpdate(BaseModel):
    subtitle: Optional[str] = None
    artist_id: Optional[int] = None
    image_url: Optional[str] = None
    title: Optional[str] = None
    artist_name: Optional[str] = None
    genre: Optional[str] = None
    clear_artist: bool = False


@admin_router.patch("/spotlight")
async def update_spotlight(
    data: SpotlightUpdate,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    sp = await _ensure_spotlight(session)
    for field, val in data.model_dump(exclude_none=True, exclude={"clear_artist"}).items():
        setattr(sp, field, val)
    if data.clear_artist:
        sp.artist_id = None
    await session.commit()
    return {"ok": True}


class DiscoverCardItem(BaseModel):
    slot_order: int
    artist_id: Optional[int] = None
    image_url: Optional[str] = None


class DiscoverCardsUpdate(BaseModel):
    cards: list[DiscoverCardItem]


@admin_router.patch("/discover-cards")
async def update_discover_cards(
    data: DiscoverCardsUpdate,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    existing = (await session.execute(select(DiscoverCard))).scalars().all()
    for card in existing:
        await session.delete(card)
    await session.flush()
    for item in data.cards:
        session.add(DiscoverCard(
            slot_order=item.slot_order,
            artist_id=item.artist_id,
            image_url=item.image_url,
        ))
    await session.commit()
    return {"ok": True}
