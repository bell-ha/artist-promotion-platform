from pydantic import BaseModel
from typing import Optional, List

# T1과 동일한 스키마는 재사용
from app.schemas.template1 import (
    AlbumSectionSave,
    TextSectionsSave,
    ContactSectionSave,
)


# ── Name Section ──────────────────────────────
class T2NameSectionSave(BaseModel):
    name: Optional[str] = None
    english_name: Optional[str] = None
    description1: Optional[str] = None
    description2: Optional[str] = None
    thumbnail_url: Optional[str] = None
    career_item_ids: List[int] = []
    activity_area: Optional[str] = None   # T2 전용 추가 필드


# ── Image Section ─────────────────────────────
class T2ImageSectionImageData(BaseModel):
    image_url: Optional[str] = None
    order: int = 0


class T2ImageSectionData(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: int = 0
    images: List[T2ImageSectionImageData] = []


class T2ImageSectionsSave(BaseModel):
    sections: List[T2ImageSectionData] = []


# T2AlbumSectionSave, T2TextSectionsSave, T2ContactSectionSave는
# T1과 완전히 동일하므로 AlbumSectionSave, TextSectionsSave, ContactSectionSave를 그대로 사용
