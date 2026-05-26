import asyncio
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, text, String, cast
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

import cloudinary
import cloudinary.api
import app.cloudinary as _cloudinary_init  # noqa: F401

from app.database import get_session
from app.models.user import User, UserRole, SubscriptionPlan
from app.models.template1 import (
    NameSection, AlbumSection,
    YoutubeCard, SoundcloudCard, ImageCard, NoImageCard,
)
from app.models.template2 import (
    T2AlbumSection, T2NameSection,
    T2YoutubeCard, T2SoundcloudCard, T2ImageCard, T2NoImageCard,
    T2ImageSectionImage,
)
from app.core.deps import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


# ──────────────────────────────────────────────
# 통계
# ──────────────────────────────────────────────

@router.get("/stats")
async def get_stats(
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    today = datetime.now(timezone.utc).date()

    total_users = (await session.execute(select(func.count()).select_from(User))).scalar()
    today_signups = (await session.execute(
        select(func.count()).select_from(User).where(func.date(User.created_at) == today)
    )).scalar()
    paid_users = (await session.execute(
        select(func.count()).select_from(User).where(
            func.upper(cast(User.subscription_plan, String)) != "FREE"
        )
    )).scalar()
    active_artists = (await session.execute(
        select(func.count()).select_from(User).where(User.is_active == True)
    )).scalar()

    # 업로드 수 (T1 + T2 카드 합산)
    counts = []
    for model in [YoutubeCard, SoundcloudCard, ImageCard, NoImageCard,
                  T2YoutubeCard, T2SoundcloudCard, T2ImageCard, T2NoImageCard]:
        c = (await session.execute(select(func.count()).select_from(model))).scalar()
        counts.append(c)
    total_uploads = sum(counts)

    return {
        "total_users": total_users,
        "today_signups": today_signups,
        "paid_users": paid_users,
        "active_artists": active_artists,
        "total_uploads": total_uploads,
    }


# ──────────────────────────────────────────────
# 최근 활동
# ──────────────────────────────────────────────

@router.get("/recent")
async def get_recent(
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    recent_users = (await session.execute(
        select(User).order_by(User.created_at.desc()).limit(5)
    )).scalars().all()

    # 최근 업로드: youtube_cards 기준 (order 필드 없이 id desc)
    recent_yt = (await session.execute(
        select(YoutubeCard, AlbumSection).join(AlbumSection).order_by(YoutubeCard.id.desc()).limit(5)
    )).all()

    return {
        "recent_signups": [
            {"id": u.id, "nickname": u.nickname, "email": u.email, "created_at": u.created_at.isoformat()}
            for u in recent_users
        ],
        "recent_uploads": [
            {
                "user_id": row.AlbumSection.user_id,
                "type": "youtube",
                "title": row.YoutubeCard.project_title,
                "album": row.YoutubeCard.album_name,
            }
            for row in recent_yt
        ],
    }


# ──────────────────────────────────────────────
# 회원 목록
# ──────────────────────────────────────────────

@router.get("/users")
async def list_users(
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    return [_user_row(u) for u in users]


# ──────────────────────────────────────────────
# 회원 상세
# ──────────────────────────────────────────────

@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: int,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    user = await _get_user_or_404(user_id, session)

    name_sec = (await session.execute(
        select(NameSection).where(NameSection.user_id == user_id)
    )).scalar_one_or_none()

    album_sec = (await session.execute(
        select(AlbumSection).where(AlbumSection.user_id == user_id)
    )).scalar_one_or_none()

    uploads = []
    if album_sec:
        for model, kind in [
            (YoutubeCard, "youtube"), (SoundcloudCard, "soundcloud"),
            (ImageCard, "image"), (NoImageCard, "no_image"),
        ]:
            rows = (await session.execute(
                select(model).where(model.album_section_id == album_sec.id)
            )).scalars().all()
            for r in rows:
                uploads.append({
                    "type": kind,
                    "id": r.id,
                    "title": getattr(r, "project_title", None),
                    "album": getattr(r, "album_name", None),
                })

    return {
        **_user_row(user),
        "thumbnail_url": name_sec.thumbnail_url if name_sec else None,
        "real_name": name_sec.name if name_sec else None,
        "english_name": name_sec.english_name if name_sec else None,
        "uploads": uploads,
    }


# ──────────────────────────────────────────────
# 활성 토글 (기존 유지)
# ──────────────────────────────────────────────

@router.patch("/users/{user_id}/active")
async def toggle_user_active(
    user_id: int,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    user = await _get_user_or_404(user_id, session)
    user.is_active = not user.is_active
    await session.commit()
    return {"id": user.id, "is_active": user.is_active}


# ──────────────────────────────────────────────
# 구독 플랜 변경
# ──────────────────────────────────────────────

class PlanUpdate(BaseModel):
    plan: str  # "free" | "standard" | "premium"


@router.patch("/users/{user_id}/plan")
async def update_user_plan(
    user_id: int,
    data: PlanUpdate,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    user = await _get_user_or_404(user_id, session)
    try:
        user.subscription_plan = SubscriptionPlan(data.plan.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 플랜입니다.")
    await session.commit()
    return {"id": user.id, "plan": user.subscription_plan.value}


# ──────────────────────────────────────────────
# 회원 삭제
# ──────────────────────────────────────────────

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    user = await _get_user_or_404(user_id, session)
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="관리자 계정은 삭제할 수 없습니다.")
    await session.delete(user)
    await session.commit()
    return {"deleted": user_id}


# ──────────────────────────────────────────────
# 내부 헬퍼
# ──────────────────────────────────────────────

def _user_row(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "nickname": u.nickname,
        "role": u.role.value,
        "is_active": u.is_active,
        "subscription_plan": u.subscription_plan.value,
        "provider": u.provider.value,
        "active_template": u.active_template,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }


async def _get_user_or_404(user_id: int, session: AsyncSession) -> User:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    return user


# ──────────────────────────────────────────────
# Cloudinary 고아 파일 관리
# ──────────────────────────────────────────────

def _extract_public_id(url: str) -> str | None:
    """Cloudinary URL에서 public_id 추출"""
    match = re.search(r'/upload/(?:v\d+/)?(.+?)(?:\.\w+)?$', url)
    return match.group(1) if match else None


async def _collect_db_public_ids(session: AsyncSession) -> set[str]:
    """DB에 저장된 모든 Cloudinary URL의 public_id 수집"""
    urls: list[str] = []

    for model, col in [
        (NameSection, NameSection.thumbnail_url),
        (T2NameSection, T2NameSection.thumbnail_url),
        (ImageCard, ImageCard.image_url),
        (T2ImageCard, T2ImageCard.image_url),
        (NoImageCard, NoImageCard.mp3_url),
        (T2NoImageCard, T2NoImageCard.mp3_url),
        (T2ImageSectionImage, T2ImageSectionImage.image_url),
    ]:
        rows = (await session.execute(select(col).where(col.isnot(None)))).scalars().all()
        urls.extend(rows)

    public_ids = set()
    for url in urls:
        pid = _extract_public_id(url)
        if pid:
            public_ids.add(pid)
    return public_ids


@router.get("/cloudinary/orphans")
async def get_cloudinary_orphans(
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """DB에 없는 Cloudinary 파일 목록 반환"""
    db_ids = await _collect_db_public_ids(session)

    # Cloudinary에서 전체 파일 목록 가져오기 (image + raw)
    cloudinary_files: list[dict] = []
    for resource_type in ("image", "raw"):
        next_cursor = None
        while True:
            kwargs = {"resource_type": resource_type, "max_results": 500}
            if next_cursor:
                kwargs["next_cursor"] = next_cursor
            result = await asyncio.to_thread(cloudinary.api.resources, **kwargs)
            cloudinary_files.extend(result.get("resources", []))
            next_cursor = result.get("next_cursor")
            if not next_cursor:
                break

    orphans = [
        {
            "public_id": f["public_id"],
            "resource_type": f["resource_type"],
            "url": f["secure_url"],
            "bytes": f.get("bytes", 0),
            "created_at": f.get("created_at", ""),
        }
        for f in cloudinary_files
        if f["public_id"] not in db_ids
    ]

    total_bytes = sum(o["bytes"] for o in orphans)
    return {"orphans": orphans, "count": len(orphans), "total_mb": round(total_bytes / 1024 / 1024, 2)}


class DeleteOrphansRequest(BaseModel):
    public_ids: list[str]


@router.delete("/cloudinary/orphans")
async def delete_cloudinary_orphans(
    data: DeleteOrphansRequest,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """선택한 고아 파일 Cloudinary에서 삭제"""
    # DB에 실제로 없는 파일만 삭제 (안전장치)
    db_ids = await _collect_db_public_ids(session)
    safe_to_delete = [pid for pid in data.public_ids if pid not in db_ids]

    deleted, failed = [], []
    for pid in safe_to_delete:
        try:
            await asyncio.to_thread(cloudinary.uploader.destroy, pid)
            deleted.append(pid)
        except Exception:
            failed.append(pid)

    return {"deleted": len(deleted), "failed": failed}
