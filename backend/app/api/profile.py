from collections import defaultdict

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
from app.schemas.template1 import NameSectionSave, AlbumSectionSave, TextSectionsSave, ContactSectionSave
from app.schemas.template2 import T2NameSectionSave, T2ImageSectionsSave
from app.core.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


def _row_to_dict(row) -> dict:
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}


# ── 파일 업로드 (Cloudinary) ───────────────────
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    import asyncio
    import cloudinary.uploader
    import app.cloudinary  # cloudinary config 초기화

    contents = await file.read()
    result = await asyncio.to_thread(cloudinary.uploader.upload, contents, resource_type="auto")
    return {"url": result["secure_url"]}


# ── 직업 카테고리 목록 ─────────────────────────
@router.get("/career-items")
async def get_career_items(session: AsyncSession = Depends(get_session)):
    # 2번의 쿼리로 N+1 해소
    cats = (await session.execute(
        select(CareerCategory).where(CareerCategory.is_active == True).order_by(CareerCategory.order)
    )).scalars().all()

    all_items = (await session.execute(
        select(CareerItem).where(CareerItem.is_active == True).order_by(CareerItem.category_id, CareerItem.order)
    )).scalars().all()

    items_by_cat: dict = defaultdict(list)
    for item in all_items:
        items_by_cat[item.category_id].append({"id": item.id, "name": item.name})

    return [
        {"id": cat.id, "name": cat.name, "items": items_by_cat[cat.id]}
        for cat in cats
    ]


# ── 내 프로필 전체 조회 ────────────────────────
@router.get("/me/t1")
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
        yt = (await session.execute(select(YoutubeCard).where(YoutubeCard.album_section_id == album_sec.id).order_by(YoutubeCard.order))).scalars().all()
        sc = (await session.execute(select(SoundcloudCard).where(SoundcloudCard.album_section_id == album_sec.id).order_by(SoundcloudCard.order))).scalars().all()
        ic = (await session.execute(select(ImageCard).where(ImageCard.album_section_id == album_sec.id).order_by(ImageCard.order))).scalars().all()
        ni = (await session.execute(select(NoImageCard).where(NoImageCard.album_section_id == album_sec.id).order_by(NoImageCard.order))).scalars().all()

        album_section = {
            "youtube_cards": [_row_to_dict(r) for r in yt],
            "soundcloud_cards": [_row_to_dict(r) for r in sc],
            "image_cards": [_row_to_dict(r) for r in ic],
            "no_image_cards": [_row_to_dict(r) for r in ni],
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

    # Contact Section
    cs = (await session.execute(
        select(ContactSection).where(ContactSection.user_id == current_user.id)
    )).scalar_one_or_none()

    contact_section = None
    if cs:
        contact_section = {
            "phone1": cs.phone1, "phone2": cs.phone2,
            "email1": cs.email1, "email2": cs.email2, "email3": cs.email3,
            "instagram_url": cs.instagram_url,
            "tiktok_url": cs.tiktok_url,
            "youtube_url": cs.youtube_url,
            "extra_description": cs.extra_description,
        }

    return {
        "active_template": current_user.active_template,
        "name_section": name_section,
        "album_section": album_section,
        "contact_section": contact_section,
        "text_sections": text_sections,
    }


# ── Name Section 저장 ──────────────────────────
@router.put("/t1/name-section")
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
    ns.thumbnail_url = data.thumbnail_url

    await session.execute(delete(NameSectionJob).where(NameSectionJob.name_section_id == ns.id))
    for item_id in data.career_item_ids:
        session.add(NameSectionJob(name_section_id=ns.id, career_item_id=item_id))

    await session.commit()
    return {"status": "ok"}


# ── Album Section 저장 ─────────────────────────
@router.put("/t1/album-section")
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
@router.put("/t1/text-sections")
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


# ── Contact Section 저장 ──────────────────────
@router.put("/t1/contact-section")
async def save_contact_section(
    data: ContactSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    cs = (await session.execute(
        select(ContactSection).where(ContactSection.user_id == current_user.id)
    )).scalar_one_or_none()

    if not cs:
        cs = ContactSection(user_id=current_user.id)
        session.add(cs)

    cs.phone1 = data.phone1
    cs.phone2 = data.phone2
    cs.email1 = data.email1
    cs.email2 = data.email2
    cs.email3 = data.email3
    cs.instagram_url = data.instagram_url
    cs.tiktok_url = data.tiktok_url
    cs.youtube_url = data.youtube_url
    cs.extra_description = data.extra_description

    await session.commit()
    return {"status": "ok"}


# ════════════════════════════════════════════════
# TEMPLATE 2 ROUTES
# ════════════════════════════════════════════════

# ── T2 프로필 전체 조회 ────────────────────────
@router.get("/me/t2")
async def get_profile_t2(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Name Section
    ns = (await session.execute(
        select(T2NameSection).where(T2NameSection.user_id == current_user.id)
    )).scalar_one_or_none()

    name_section = None
    if ns:
        jobs = (await session.execute(
            select(T2NameSectionJob).where(T2NameSectionJob.name_section_id == ns.id)
        )).scalars().all()
        name_section = {
            "name": ns.name,
            "english_name": ns.english_name,
            "description1": ns.description1,
            "description2": ns.description2,
            "thumbnail_url": ns.thumbnail_url,
            "activity_area": ns.activity_area,
            "career_item_ids": [j.career_item_id for j in jobs],
        }

    # Album Section
    album_sec = (await session.execute(
        select(T2AlbumSection).where(T2AlbumSection.user_id == current_user.id)
    )).scalar_one_or_none()

    album_section = None
    if album_sec:
        yt = (await session.execute(select(T2YoutubeCard).where(T2YoutubeCard.album_section_id == album_sec.id).order_by(T2YoutubeCard.order))).scalars().all()
        sc = (await session.execute(select(T2SoundcloudCard).where(T2SoundcloudCard.album_section_id == album_sec.id).order_by(T2SoundcloudCard.order))).scalars().all()
        ic = (await session.execute(select(T2ImageCard).where(T2ImageCard.album_section_id == album_sec.id).order_by(T2ImageCard.order))).scalars().all()
        ni = (await session.execute(select(T2NoImageCard).where(T2NoImageCard.album_section_id == album_sec.id).order_by(T2NoImageCard.order))).scalars().all()

        album_section = {
            "youtube_cards": [_row_to_dict(r) for r in yt],
            "soundcloud_cards": [_row_to_dict(r) for r in sc],
            "image_cards": [_row_to_dict(r) for r in ic],
            "no_image_cards": [_row_to_dict(r) for r in ni],
        }

    # Text Sections
    text_secs = (await session.execute(
        select(T2TextSection).where(T2TextSection.user_id == current_user.id).order_by(T2TextSection.order)
    )).scalars().all()

    text_sections = []
    for ts in text_secs:
        cards = (await session.execute(
            select(T2TextCard).where(T2TextCard.text_section_id == ts.id).order_by(T2TextCard.order)
        )).scalars().all()
        cards_data = []
        for card in cards:
            body_items = (await session.execute(
                select(T2TextCardBodyItem).where(T2TextCardBodyItem.text_card_id == card.id).order_by(T2TextCardBodyItem.order)
            )).scalars().all()
            cards_data.append({
                "title": card.title, "detail": card.detail, "order": card.order,
                "body_items": [{"title": b.title, "content": b.content, "order": b.order} for b in body_items],
            })
        text_sections.append({
            "title": ts.title, "description": ts.description, "order": ts.order, "cards": cards_data,
        })

    # Contact Section
    cs = (await session.execute(
        select(T2ContactSection).where(T2ContactSection.user_id == current_user.id)
    )).scalar_one_or_none()

    contact_section = None
    if cs:
        contact_section = {
            "phone1": cs.phone1, "phone2": cs.phone2,
            "email1": cs.email1, "email2": cs.email2, "email3": cs.email3,
            "instagram_url": cs.instagram_url,
            "tiktok_url": cs.tiktok_url,
            "youtube_url": cs.youtube_url,
            "extra_description": cs.extra_description,
        }

    # Image Sections
    image_secs = (await session.execute(
        select(T2ImageSection).where(T2ImageSection.user_id == current_user.id).order_by(T2ImageSection.order)
    )).scalars().all()

    image_sections = []
    for img_sec in image_secs:
        images = (await session.execute(
            select(T2ImageSectionImage).where(T2ImageSectionImage.image_section_id == img_sec.id).order_by(T2ImageSectionImage.order)
        )).scalars().all()
        image_sections.append({
            "title": img_sec.title, "description": img_sec.description, "order": img_sec.order,
            "images": [{"image_url": img.image_url, "order": img.order} for img in images],
        })

    return {
        "active_template": current_user.active_template,
        "name_section": name_section,
        "album_section": album_section,
        "contact_section": contact_section,
        "text_sections": text_sections,
        "image_sections": image_sections,
    }


# ── T2 Name Section 저장 ───────────────────────
@router.put("/t2/name-section")
async def save_t2_name_section(
    data: T2NameSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    ns = (await session.execute(
        select(T2NameSection).where(T2NameSection.user_id == current_user.id)
    )).scalar_one_or_none()

    if not ns:
        ns = T2NameSection(user_id=current_user.id)
        session.add(ns)
        await session.flush()

    ns.name = data.name
    ns.english_name = data.english_name
    ns.description1 = data.description1
    ns.description2 = data.description2
    ns.thumbnail_url = data.thumbnail_url
    ns.activity_area = data.activity_area

    await session.execute(delete(T2NameSectionJob).where(T2NameSectionJob.name_section_id == ns.id))
    for item_id in data.career_item_ids:
        session.add(T2NameSectionJob(name_section_id=ns.id, career_item_id=item_id))

    await session.commit()
    return {"status": "ok"}


# ── T2 Album Section 저장 ──────────────────────
@router.put("/t2/album-section")
async def save_t2_album_section(
    data: AlbumSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    album_sec = (await session.execute(
        select(T2AlbumSection).where(T2AlbumSection.user_id == current_user.id)
    )).scalar_one_or_none()

    if not album_sec:
        album_sec = T2AlbumSection(user_id=current_user.id)
        session.add(album_sec)
        await session.flush()

    await session.execute(delete(T2YoutubeCard).where(T2YoutubeCard.album_section_id == album_sec.id))
    await session.execute(delete(T2SoundcloudCard).where(T2SoundcloudCard.album_section_id == album_sec.id))
    await session.execute(delete(T2ImageCard).where(T2ImageCard.album_section_id == album_sec.id))
    await session.execute(delete(T2NoImageCard).where(T2NoImageCard.album_section_id == album_sec.id))

    for i, c in enumerate(data.youtube_cards):
        session.add(T2YoutubeCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))
    for i, c in enumerate(data.soundcloud_cards):
        session.add(T2SoundcloudCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))
    for i, c in enumerate(data.image_cards):
        session.add(T2ImageCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))
    for i, c in enumerate(data.no_image_cards):
        session.add(T2NoImageCard(album_section_id=album_sec.id, order=i, **c.model_dump(exclude={"order"})))

    await session.commit()
    return {"status": "ok"}


# ── T2 Text Sections 저장 ─────────────────────
@router.put("/t2/text-sections")
async def save_t2_text_sections(
    data: TextSectionsSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    existing_sections = (await session.execute(
        select(T2TextSection).where(T2TextSection.user_id == current_user.id)
    )).scalars().all()

    for ts in existing_sections:
        existing_cards = (await session.execute(
            select(T2TextCard).where(T2TextCard.text_section_id == ts.id)
        )).scalars().all()
        for card in existing_cards:
            await session.execute(delete(T2TextCardBodyItem).where(T2TextCardBodyItem.text_card_id == card.id))
        await session.execute(delete(T2TextCard).where(T2TextCard.text_section_id == ts.id))
    await session.execute(delete(T2TextSection).where(T2TextSection.user_id == current_user.id))

    for i, sec_data in enumerate(data.sections):
        ts = T2TextSection(
            user_id=current_user.id,
            title=sec_data.title,
            description=sec_data.description,
            order=i,
        )
        session.add(ts)
        await session.flush()

        for j, card_data in enumerate(sec_data.cards):
            card = T2TextCard(
                text_section_id=ts.id,
                title=card_data.title,
                detail=card_data.detail,
                order=j,
            )
            session.add(card)
            await session.flush()

            for k, body_data in enumerate(card_data.body_items):
                session.add(T2TextCardBodyItem(
                    text_card_id=card.id,
                    title=body_data.title,
                    content=body_data.content,
                    order=k,
                ))

    await session.commit()
    return {"status": "ok"}


# ── T2 Contact Section 저장 ───────────────────
@router.put("/t2/contact-section")
async def save_t2_contact_section(
    data: ContactSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    cs = (await session.execute(
        select(T2ContactSection).where(T2ContactSection.user_id == current_user.id)
    )).scalar_one_or_none()

    if not cs:
        cs = T2ContactSection(user_id=current_user.id)
        session.add(cs)

    cs.phone1 = data.phone1
    cs.phone2 = data.phone2
    cs.email1 = data.email1
    cs.email2 = data.email2
    cs.email3 = data.email3
    cs.instagram_url = data.instagram_url
    cs.tiktok_url = data.tiktok_url
    cs.youtube_url = data.youtube_url
    cs.extra_description = data.extra_description

    await session.commit()
    return {"status": "ok"}


# ── T2 Image Sections 저장 ────────────────────
@router.put("/t2/image-sections")
async def save_t2_image_sections(
    data: T2ImageSectionsSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    existing_sections = (await session.execute(
        select(T2ImageSection).where(T2ImageSection.user_id == current_user.id)
    )).scalars().all()

    for sec in existing_sections:
        await session.execute(delete(T2ImageSectionImage).where(T2ImageSectionImage.image_section_id == sec.id))
    await session.execute(delete(T2ImageSection).where(T2ImageSection.user_id == current_user.id))

    for i, sec_data in enumerate(data.sections):
        sec = T2ImageSection(
            user_id=current_user.id,
            title=sec_data.title,
            description=sec_data.description,
            order=i,
        )
        session.add(sec)
        await session.flush()

        for j, img_data in enumerate(sec_data.images[:4]):  # 최대 4개 제한
            session.add(T2ImageSectionImage(
                image_section_id=sec.id,
                image_url=img_data.image_url,
                order=j,
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


# ── 카테고리별 아티스트 공개 목록 ──────────────
@router.get("/public/list")
async def list_public_artists(
    career_item_id: int,
    session: AsyncSession = Depends(get_session),
):
    rows = (await session.execute(
        select(User.nickname, NameSection.name, NameSection.english_name, NameSection.thumbnail_url, User.active_template)
        .join(NameSection, NameSection.user_id == User.id)
        .join(NameSectionJob, NameSectionJob.name_section_id == NameSection.id)
        .where(NameSectionJob.career_item_id == career_item_id)
        .where(User.is_active == True)
    )).all()

    return [
        {
            "nickname": r.nickname,
            "name": r.name,
            "english_name": r.english_name,
            "thumbnail_url": r.thumbnail_url,
            "active_template": r.active_template,
        }
        for r in rows
    ]
