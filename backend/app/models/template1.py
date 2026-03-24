from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# ──────────────────────────────────────────────
# NAME SECTION
# ──────────────────────────────────────────────

class NameSection(SQLModel, table=True):
    """Template 1 - Name Section (유저당 하나)"""
    __tablename__ = "t1_name_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, nullable=False)

    thumbnail_url: Optional[str] = Field(default=None)
    name: Optional[str] = Field(default=None)           # 함태영
    english_name: Optional[str] = Field(default=None)   # Ham Tae...
    description1: Optional[str] = Field(default=None)
    description2: Optional[str] = Field(default=None)

    jobs: List["NameSectionJob"] = Relationship(back_populates="name_section")


class NameSectionJob(SQLModel, table=True):
    """Name Section ↔ CareerItem 다대다"""
    __tablename__ = "t1_name_section_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    name_section_id: int = Field(foreign_key="t1_name_sections.id", nullable=False)
    career_item_id: int = Field(foreign_key="career_items.id", nullable=False)

    name_section: Optional[NameSection] = Relationship(back_populates="jobs")


# ──────────────────────────────────────────────
# ALBUM SECTION
# ──────────────────────────────────────────────

class AlbumSection(SQLModel, table=True):
    """Template 1 - Album Section (유저당 최대 하나)"""
    __tablename__ = "t1_album_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, nullable=False)

    youtube_cards: List["YoutubeCard"] = Relationship(back_populates="album_section")
    soundcloud_cards: List["SoundcloudCard"] = Relationship(back_populates="album_section")
    image_cards: List["ImageCard"] = Relationship(back_populates="album_section")
    no_image_cards: List["NoImageCard"] = Relationship(back_populates="album_section")


class YoutubeCard(SQLModel, table=True):
    __tablename__ = "t1_youtube_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t1_album_sections.id", nullable=False)
    order: int = Field(default=0)

    link: Optional[str] = Field(default=None)
    project_title: Optional[str] = Field(default=None)
    project_subtitle: Optional[str] = Field(default=None)
    album_name: Optional[str] = Field(default=None)
    composer: Optional[str] = Field(default=None)
    category_desc: Optional[str] = Field(default=None)
    year: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)

    album_section: Optional[AlbumSection] = Relationship(back_populates="youtube_cards")


class SoundcloudCard(SQLModel, table=True):
    __tablename__ = "t1_soundcloud_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t1_album_sections.id", nullable=False)
    order: int = Field(default=0)

    link: Optional[str] = Field(default=None)
    project_title: Optional[str] = Field(default=None)
    project_subtitle: Optional[str] = Field(default=None)
    album_name: Optional[str] = Field(default=None)
    composer: Optional[str] = Field(default=None)
    category_desc: Optional[str] = Field(default=None)
    year: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)

    album_section: Optional[AlbumSection] = Relationship(back_populates="soundcloud_cards")


class ImageCard(SQLModel, table=True):
    __tablename__ = "t1_image_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t1_album_sections.id", nullable=False)
    order: int = Field(default=0)

    hyperlink: Optional[str] = Field(default=None)
    image_url: Optional[str] = Field(default=None)
    project_title: Optional[str] = Field(default=None)
    project_subtitle: Optional[str] = Field(default=None)
    album_name: Optional[str] = Field(default=None)
    composer: Optional[str] = Field(default=None)
    category_desc: Optional[str] = Field(default=None)
    year: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)

    album_section: Optional[AlbumSection] = Relationship(back_populates="image_cards")


class NoImageCard(SQLModel, table=True):
    __tablename__ = "t1_no_image_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t1_album_sections.id", nullable=False)
    order: int = Field(default=0)

    mp3_url: Optional[str] = Field(default=None)
    project_title: Optional[str] = Field(default=None)
    project_subtitle: Optional[str] = Field(default=None)
    album_name: Optional[str] = Field(default=None)
    composer: Optional[str] = Field(default=None)
    category_desc: Optional[str] = Field(default=None)
    year: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)

    album_section: Optional[AlbumSection] = Relationship(back_populates="no_image_cards")


# ──────────────────────────────────────────────
# TEXT SECTION
# ──────────────────────────────────────────────

class TextSection(SQLModel, table=True):
    """Template 1 - Text Section (유저당 여러 개 가능)"""
    __tablename__ = "t1_text_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    order: int = Field(default=0)

    title: Optional[str] = Field(default=None)        # Collaboration · Clients
    description: Optional[str] = Field(default=None)

    cards: List["TextCard"] = Relationship(back_populates="text_section")


class TextCard(SQLModel, table=True):
    __tablename__ = "t1_text_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    text_section_id: int = Field(foreign_key="t1_text_sections.id", nullable=False)
    order: int = Field(default=0)

    title: Optional[str] = Field(default=None)        # ㈜배움 Baeum Co., Ltd.
    detail: Optional[str] = Field(default=None)       # 세부 사항

    text_section: Optional["TextSection"] = Relationship(back_populates="cards")
    body_items: List["TextCardBodyItem"] = Relationship(back_populates="text_card")


class TextCardBodyItem(SQLModel, table=True):
    __tablename__ = "t1_text_card_body_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    text_card_id: int = Field(foreign_key="t1_text_cards.id", nullable=False)
    order: int = Field(default=0)

    title: Optional[str] = Field(default=None)        # Project
    content: Optional[str] = Field(default=None)      # Children's Song Production Series

    text_card: Optional[TextCard] = Relationship(back_populates="body_items")
