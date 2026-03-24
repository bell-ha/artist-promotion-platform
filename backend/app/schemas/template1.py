from pydantic import BaseModel
from typing import Optional, List


# ── Name Section ──────────────────────────────
class NameSectionSave(BaseModel):
    name: Optional[str] = None
    english_name: Optional[str] = None
    description1: Optional[str] = None
    description2: Optional[str] = None
    thumbnail_url: Optional[str] = None
    career_item_ids: List[int] = []


# ── Album Section Cards ───────────────────────
class YoutubeCardData(BaseModel):
    link: Optional[str] = None
    project_title: Optional[str] = None
    project_subtitle: Optional[str] = None
    album_name: Optional[str] = None
    composer: Optional[str] = None
    category_desc: Optional[str] = None
    year: Optional[int] = None
    description: Optional[str] = None
    order: int = 0


class SoundcloudCardData(BaseModel):
    link: Optional[str] = None
    project_title: Optional[str] = None
    project_subtitle: Optional[str] = None
    album_name: Optional[str] = None
    composer: Optional[str] = None
    category_desc: Optional[str] = None
    year: Optional[int] = None
    description: Optional[str] = None
    order: int = 0


class ImageCardData(BaseModel):
    hyperlink: Optional[str] = None
    image_url: Optional[str] = None
    project_title: Optional[str] = None
    project_subtitle: Optional[str] = None
    album_name: Optional[str] = None
    composer: Optional[str] = None
    category_desc: Optional[str] = None
    year: Optional[int] = None
    description: Optional[str] = None
    order: int = 0


class NoImageCardData(BaseModel):
    mp3_url: Optional[str] = None
    project_title: Optional[str] = None
    project_subtitle: Optional[str] = None
    album_name: Optional[str] = None
    composer: Optional[str] = None
    category_desc: Optional[str] = None
    year: Optional[int] = None
    description: Optional[str] = None
    order: int = 0


class AlbumSectionSave(BaseModel):
    youtube_cards: List[YoutubeCardData] = []
    soundcloud_cards: List[SoundcloudCardData] = []
    image_cards: List[ImageCardData] = []
    no_image_cards: List[NoImageCardData] = []


# ── Text Section ──────────────────────────────
class TextCardBodyItemData(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: int = 0


class TextCardData(BaseModel):
    title: Optional[str] = None
    detail: Optional[str] = None
    order: int = 0
    body_items: List[TextCardBodyItemData] = []


class TextSectionData(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: int = 0
    cards: List[TextCardData] = []


class TextSectionsSave(BaseModel):
    sections: List[TextSectionData] = []
