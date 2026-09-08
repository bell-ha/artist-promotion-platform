"""
포트폴리오 API (라우팅 전용)

T1/T2 분기와 쿼리는 전부 app/services/portfolio.py에 있습니다.
이 파일은 요청을 받아 어떤 템플릿인지 고르고, 서비스를 부르고, 응답을
만드는 일만 합니다.

예전에는 이 파일이 898줄이었고 그중 약 600줄이 T1/T2 두 벌로 복제된
같은 코드였습니다. 읽기 직렬화만 네 군데에 흩어져 있었습니다.
"""

from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_session
from app.models.user import User
from app.models.category import CareerCategory, CareerItem
from app.schemas.template1 import (
    NameSectionSave, AlbumSectionSave, TextSectionsSave, ContactSectionSave,
)
from app.schemas.template2 import T2NameSectionSave, T2ImageSectionsSave
from app.core.deps import get_current_user
from app.services import portfolio

router = APIRouter(prefix="/profile", tags=["Profile"])


def _template_or_404(template_number: int):
    tpl = portfolio.get_template(template_number)
    if tpl is None:
        raise HTTPException(status_code=404, detail="활성 템플릿이 없습니다.")
    return tpl


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
    content_type = file.content_type or ""
    if content_type.startswith("audio/"):
        resource_type = "raw"
    elif content_type.startswith("video/"):
        resource_type = "video"
    else:
        resource_type = "image"
    result = await asyncio.to_thread(cloudinary.uploader.upload, contents, resource_type=resource_type)
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


# ══════════════════════════════════════════════════
# 내 포트폴리오 — 조회
# ══════════════════════════════════════════════════

async def _get_my_profile(template_number: int, current_user: User, session: AsyncSession):
    tpl = _template_or_404(template_number)
    data = await portfolio.load_portfolio(session, tpl, current_user.id)
    return {"active_template": current_user.active_template, **data}


@router.get("/me/t1")
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await _get_my_profile(1, current_user, session)


@router.get("/me/t2")
async def get_profile_t2(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await _get_my_profile(2, current_user, session)


# ══════════════════════════════════════════════════
# 내 포트폴리오 — 저장
# ══════════════════════════════════════════════════
# 아래 라우트들은 전부 "템플릿 번호 + 서비스 함수" 조합만 다릅니다.

@router.put("/t1/name-section")
async def save_name_section(
    data: NameSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_name_section(session, _template_or_404(1), current_user.id, data)
    return {"status": "ok"}


@router.put("/t2/name-section")
async def save_t2_name_section(
    data: T2NameSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_name_section(session, _template_or_404(2), current_user.id, data)
    return {"status": "ok"}


@router.put("/t1/album-section")
async def save_album_section(
    data: AlbumSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_album_section(session, _template_or_404(1), current_user.id, data)
    return {"status": "ok"}


@router.put("/t2/album-section")
async def save_t2_album_section(
    data: AlbumSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_album_section(session, _template_or_404(2), current_user.id, data)
    return {"status": "ok"}


@router.put("/t1/text-sections")
async def save_text_sections(
    data: TextSectionsSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_text_sections(session, _template_or_404(1), current_user.id, data)
    return {"status": "ok"}


@router.put("/t2/text-sections")
async def save_t2_text_sections(
    data: TextSectionsSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_text_sections(session, _template_or_404(2), current_user.id, data)
    return {"status": "ok"}


@router.put("/t1/contact-section")
async def save_contact_section(
    data: ContactSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_contact_section(session, _template_or_404(1), current_user.id, data)
    return {"status": "ok"}


@router.put("/t2/contact-section")
async def save_t2_contact_section(
    data: ContactSectionSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_contact_section(session, _template_or_404(2), current_user.id, data)
    return {"status": "ok"}


# 이미지 섹션은 템플릿 2에만 있습니다.
@router.put("/t2/image-sections")
async def save_t2_image_sections(
    data: T2ImageSectionsSave,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await portfolio.save_image_sections(session, _template_or_404(2), current_user.id, data)
    return {"status": "ok"}


# ══════════════════════════════════════════════════
# 공개 조회
# ══════════════════════════════════════════════════

@router.get("/by-id/{user_id}")
async def get_public_profile_by_id(
    user_id: int,
    session: AsyncSession = Depends(get_session),
):
    user = (await session.execute(
        select(User).where(User.id == user_id)
    )).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="비활성화된 계정입니다.")

    tpl = _template_or_404(user.active_template)
    data = await portfolio.load_portfolio(session, tpl, user.id)

    return {
        "active_template": tpl.number,
        "username": user.nickname,
        **data,
    }


# ⚠️ 이 라우트는 "/public/{user_id}" 보다 위에 있어야 합니다.
#    아래에 있으면 "list"가 user_id로 먼저 매칭돼 422가 납니다.
@router.get("/public/list")
async def list_public_artists(
    career_item_id: int,
    session: AsyncSession = Depends(get_session),
):
    return await portfolio.list_public_artists(session, career_item_id)


@router.get("/search")
async def search_artists(q: str = "", session: AsyncSession = Depends(get_session)):
    return await portfolio.search_artists(session, q)


@router.get("/public/{user_id}")
async def get_public_profile(
    user_id: int,
    session: AsyncSession = Depends(get_session),
):
    return await get_public_profile_by_id(user_id, session)


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
