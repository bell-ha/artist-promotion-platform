from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.database import get_session
from app.models.user import User
from app.models.category import CareerCategory, CareerItem
from app.models.template1 import (
    NameSection, NameSectionJob,
    AlbumSection, YoutubeCard, SoundcloudCard, ImageCard, NoImageCard,
    TextSection, TextCard, TextCardBodyItem,
)
from app.schemas.template1 import NameSectionSave, AlbumSectionSave, TextSectionsSave
from app.core.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


# ── 파일 업로드 (Cloudinary) ───────────────────
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    import cloudinary.uploader
    import app.cloudinary  # cloudinary config 초기화

    contents = await file.read()
    result = cloudinary.uploader.upload(contents, resource_type="auto")
    return {"url": result["secure_url"]}


# ── 직업 카테고리 목록 ─────────────────────────
@router.get("/career-items")
async def get_career_items(session: AsyncSession = Depends(get_session)):
    cats = (await session.execute(
        select(CareerCategory).where(CareerCategory.is_active == True).order_by(CareerCategory.order)
    )).scalars().all()

    result = []
    for cat in cats:
        items = (await session.execute(
            select(CareerItem)
            .where(CareerItem.category_id == cat.id, CareerItem.is_active == True)
            .order_by(CareerItem.order)
        )).scalars().all()
        result.append({
            "id": cat.id,
            "name": cat.name,
            "items": [{"id": item.id, "name": item.name} for item in items],
        })
    return result


# ── 내 프로필 전체 조회 ────────────────────────
@router.get("/me")
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Name Section
    ns = (await session.execute(
        select(NameSection).where(NameSection.user_id == current_user.id)
    )).scalar_one_or_none()

    name_section = None
    if ns:
        jobs = (await session.execute(
            select(NameSectionJob).where(NameSectionJob.name_section_id == ns.id)
        )).scalars().all()
        name_section = {
            "name": ns.name,
            "english_name": ns.english_name,
            "description1": ns.description1,
            "description2": ns.description2,
            "thumbnail_url": ns.thumbnail_url,
            "career_item_ids": [j.career_item_id for j in jobs],
        }

    # Album Section
    album_sec = (await session.execute(
        select(AlbumSection).where(AlbumSection.user_id == current_user.id)
    )).scalar_one_or_none()

    album_section = None
    if album_sec:
        def row_to_dict(row):
            d = {c.name: getattr(row, c.name) for c in row.__table__.columns}
            return d

        yt = (await session.execute(select(YoutubeCard).where(YoutubeCard.album_section_id == album_sec.id).order_by(YoutubeCard.order))).scalars().all()
        sc = (await session.execute(select(SoundcloudCard).where(SoundcloudCard.album_section_id == album_sec.id).order_by(SoundcloudCard.order))).scalars().all()
        ic = (await session.execute(select(ImageCard).where(ImageCard.album_section_id == album_sec.id).order_by(ImageCard.order))).scalars().all()
        ni = (await session.execute(select(NoImageCard).where(NoImageCard.album_section_id == album_sec.id).order_by(NoImageCard.order))).scalars().all()

        album_section = {
            "youtube_cards": [row_to_dict(r) for r in yt],
            "soundcloud_cards": [row_to_dict(r) for r in sc],
            "image_cards": [row_to_dict(r) for r in ic],
            "no_image_cards": [row_to_dict(r) for r in ni],
        }

    # Text Sections
    text_secs = (await session.execute(
        select(TextSection).where(TextSection.user_id == current_user.id).order_by(TextSection.order)
    )).scalars().all()

    text_sections = []
    for ts in text_secs:
        cards = (await session.execute(
            select(TextCard).where(TextCard.text_section_id == ts.id).order_by(TextCard.order)
        )).scalars().all()

        cards_data = []
        for card in cards:
            body_items = (await session.execute(
                select(TextCardBodyItem).where(TextCardBodyItem.text_card_id == card.id).order_by(TextCardBodyItem.order)
            )).scalars().all()
            cards_data.append({
                "title": card.title,
                "detail": card.detail,
                "order": card.order,
                "body_items": [{"title": b.title, "content": b.content, "order": b.order} for b in body_items],
            })

        text_sections.append({
            "title": ts.title,
            "description": ts.description,
            "order": ts.order,
            "cards": cards_data,
        })

    return {
        "active_template": current_user.active_template,
        "name_section": name_section,
        "album_section": album_section,
        "text_sections": text_sections,
    }


# ── Name Section 저장 ──────────────────────────
@router.put("/name-section")
async def save_name_section(
    data: NameSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    ns = (await session.execute(
        select(NameSection).where(NameSection.user_id == current_user.id)
    )).scalar_one_or_none()

    if not ns:
        ns = NameSection(user_id=current_user.id)
        session.add(ns)
        await session.flush()

    ns.name = data.name
    ns.english_name = data.english_name
    ns.description1 = data.description1
    ns.description2 = data.description2

    await session.execute(delete(NameSectionJob).where(NameSectionJob.name_section_id == ns.id))
    for item_id in data.career_item_ids:
        session.add(NameSectionJob(name_section_id=ns.id, career_item_id=item_id))

    await session.commit()
    return {"status": "ok"}


# ── Album Section 저장 ─────────────────────────
@router.put("/album-section")
async def save_album_section(
    data: AlbumSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    album_sec = (await session.execute(
        select(AlbumSection).where(AlbumSection.user_id == current_user.id)
    )).scalar_one_or_none()

    if not album_sec:
        album_sec = AlbumSection(user_id=current_user.id)
        session.add(album_sec)
        await session.flush()

    # 기존 카드 전부 삭제 후 재삽입
    await session.execute(delete(YoutubeCard).where(YoutubeCard.album_section_id == album_sec.id))
    await session.execute(delete(SoundcloudCard).where(SoundcloudCard.album_section_id == album_sec.id))
    await session.execute(delete(ImageCard).where(ImageCard.album_section_id == album_sec.id))
    await session.execute(delete(NoImageCard).where(NoImageCard.album_section_id == album_sec.id))

    for i, c in enumerate(data.youtube_cards):
        session.add(YoutubeCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))
    for i, c in enumerate(data.soundcloud_cards):
        session.add(SoundcloudCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))
    for i, c in enumerate(data.image_cards):
        session.add(ImageCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))
    for i, c in enumerate(data.no_image_cards):
        session.add(NoImageCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))

    await session.commit()
    return {"status": "ok"}


# ── Text Sections 저장 ─────────────────────────
@router.put("/text-sections")
async def save_text_sections(
    data: TextSectionsSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # 기존 데이터 전부 삭제 (body_items → cards → sections 순)
    existing_sections = (await session.execute(
        select(TextSection).where(TextSection.user_id == current_user.id)
    )).scalars().all()

    for ts in existing_sections:
        existing_cards = (await session.execute(
            select(TextCard).where(TextCard.text_section_id == ts.id)
        )).scalars().all()
        for card in existing_cards:
            await session.execute(delete(TextCardBodyItem).where(TextCardBodyItem.text_card_id == card.id))
        await session.execute(delete(TextCard).where(TextCard.text_section_id == ts.id))
    await session.execute(delete(TextSection).where(TextSection.user_id == current_user.id))

    # 새 데이터 삽입
    for i, sec_data in enumerate(data.sections):
        ts = TextSection(
            user_id=current_user.id,
            title=sec_data.title,
            description=sec_data.description,
            order=i,
        )
        session.add(ts)
        await session.flush()

        for j, card_data in enumerate(sec_data.cards):
            card = TextCard(
                text_section_id=ts.id,
                title=card_data.title,
                detail=card_data.detail,
                order=j,
            )
            session.add(card)
            await session.flush()

            for k, body_data in enumerate(card_data.body_items):
                session.add(TextCardBodyItem(
                    text_card_id=card.id,
                    title=body_data.title,
                    content=body_data.content,
                    order=k,
                ))

    await session.commit()
    return {"status": "ok"}


# ── Active Template 변경 ───────────────────────
class ActiveTemplateRequest(BaseModel):
    template_number: int


@router.put("/active-template")
async def update_active_template(
    data: ActiveTemplateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if data.template_number not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="템플릿 번호는 1, 2, 3 중 하나여야 합니다.")
    current_user.active_template = data.template_number
    session.add(current_user)
    await session.commit()
    return {"status": "ok", "active_template": data.template_number}
