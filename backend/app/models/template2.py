from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# ──────────────────────────────────────────────
# NAME SECTION
# ──────────────────────────────────────────────

class T2NameSection(SQLModel, table=True):
    """Template 2 - Name Section (유저당 하나)"""
    __tablename__ = "t2_name_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, nullable=False)

    thumbnail_url: Optional[str] = Field(default=None)
    name: Optional[str] = Field(default=None)
    english_name: Optional[str] = Field(default=None)
    tagline: Optional[str] = Field(default=None)          # Guitarist / Session Guitarist
    description1: Optional[str] = Field(default=None)
    description2: Optional[str] = Field(default=None)
    activity_area: Optional[str] = Field(default=None)    # 활동지역

    jobs: List["T2NameSectionJob"] = Relationship(back_populates="name_section")


class T2NameSectionJob(SQLModel, table=True):
    """T2 Name Section ↔ CareerItem 다대다"""
    __tablename__ = "t2_name_section_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    name_section_id: int = Field(foreign_key="t2_name_sections.id", nullable=False)
    career_item_id: int = Field(foreign_key="career_items.id", nullable=False)

    name_section: Optional[T2NameSection] = Relationship(back_populates="jobs")


# ──────────────────────────────────────────────
# ALBUM SECTION
# ──────────────────────────────────────────────

class T2AlbumSection(SQLModel, table=True):
    """Template 2 - Album Section (유저당 최대 하나)"""
    __tablename__ = "t2_album_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, nullable=False)

    youtube_cards: List["T2YoutubeCard"] = Relationship(back_populates="album_section")
    soundcloud_cards: List["T2SoundcloudCard"] = Relationship(back_populates="album_section")
    image_cards: List["T2ImageCard"] = Relationship(back_populates="album_section")
    no_image_cards: List["T2NoImageCard"] = Relationship(back_populates="album_section")


class T2YoutubeCard(SQLModel, table=True):
    __tablename__ = "t2_youtube_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t2_album_sections.id", nullable=False)
    order: int = Field(default=0)

    link: Optional[str] = Field(default=None)
    project_title: Optional[str] = Field(default=None)
    project_subtitle: Optional[str] = Field(default=None)
    album_name: Optional[str] = Field(default=None)
    composer: Optional[str] = Field(default=None)
    category_desc: Optional[str] = Field(default=None)
    year: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)

    album_section: Optional[T2AlbumSection] = Relationship(back_populates="youtube_cards")


class T2SoundcloudCard(SQLModel, table=True):
    __tablename__ = "t2_soundcloud_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t2_album_sections.id", nullable=False)
    order: int = Field(default=0)

    link: Optional[str] = Field(default=None)
    project_title: Optional[str] = Field(default=None)
    project_subtitle: Optional[str] = Field(default=None)
    album_name: Optional[str] = Field(default=None)
    composer: Optional[str] = Field(default=None)
    category_desc: Optional[str] = Field(default=None)
    year: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)

    album_section: Optional[T2AlbumSection] = Relationship(back_populates="soundcloud_cards")


class T2ImageCard(SQLModel, table=True):
    __tablename__ = "t2_image_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t2_album_sections.id", nullable=False)
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

    album_section: Optional[T2AlbumSection] = Relationship(back_populates="image_cards")


class T2NoImageCard(SQLModel, table=True):
    __tablename__ = "t2_no_image_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    album_section_id: int = Field(foreign_key="t2_album_sections.id", nullable=False)
    order: int = Field(default=0)

    mp3_url: Optional[str] = Field(default=None)
    project_title: Optional[str] = Field(default=None)
    project_subtitle: Optional[str] = Field(default=None)
    album_name: Optional[str] = Field(default=None)
    composer: Optional[str] = Field(default=None)
    category_desc: Optional[str] = Field(default=None)
    year: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)

    album_section: Optional[T2AlbumSection] = Relationship(back_populates="no_image_cards")


# ──────────────────────────────────────────────
# CONTACT SECTION
# ──────────────────────────────────────────────

class T2ContactSection(SQLModel, table=True):
    """Template 2 - Contact Section (유저당 하나)"""
    __tablename__ = "t2_contact_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, nullable=False)

    phone1: Optional[str] = Field(default=None)
    phone2: Optional[str] = Field(default=None)

    email1: Optional[str] = Field(default=None)
    email2: Optional[str] = Field(default=None)
    email3: Optional[str] = Field(default=None)

    instagram_url: Optional[str] = Field(default=None)
    tiktok_url: Optional[str] = Field(default=None)
    youtube_url: Optional[str] = Field(default=None)

    extra_description: Optional[str] = Field(default=None)


# ──────────────────────────────────────────────
# TEXT SECTION
# ──────────────────────────────────────────────

class T2TextSection(SQLModel, table=True):
    """Template 2 - Text Section (유저당 여러 개 가능)"""
    __tablename__ = "t2_text_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    order: int = Field(default=0)

    title: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)

    cards: List["T2TextCard"] = Relationship(back_populates="text_section")


class T2TextCard(SQLModel, table=True):
    __tablename__ = "t2_text_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    text_section_id: int = Field(foreign_key="t2_text_sections.id", nullable=False)
    order: int = Field(default=0)

    title: Optional[str] = Field(default=None)
    detail: Optional[str] = Field(default=None)

    text_section: Optional[T2TextSection] = Relationship(back_populates="cards")
    body_items: List["T2TextCardBodyItem"] = Relationship(back_populates="text_card")


class T2TextCardBodyItem(SQLModel, table=True):
    __tablename__ = "t2_text_card_body_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    text_card_id: int = Field(foreign_key="t2_text_cards.id", nullable=False)
    order: int = Field(default=0)

    title: Optional[str] = Field(default=None)
    content: Optional[str] = Field(default=None)

    text_card: Optional[T2TextCard] = Relationship(back_populates="body_items")


# ──────────────────────────────────────────────
# IMAGE SECTION
# ──────────────────────────────────────────────

class T2ImageSection(SQLModel, table=True):
    """Template 2 - Image Section (유저당 여러 개 가능)"""
    __tablename__ = "t2_image_sections"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    order: int = Field(default=0)

    title: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)

    images: List["T2ImageSectionImage"] = Relationship(back_populates="image_section")


class T2ImageSectionImage(SQLModel, table=True):
    """Image Section 내 이미지 (최대 4개)"""
    __tablename__ = "t2_image_section_images"

    id: Optional[int] = Field(default=None, primary_key=True)
    image_section_id: int = Field(foreign_key="t2_image_sections.id", nullable=False)
    order: int = Field(default=0)   # 0~3 (최대 4개)

    image_url: Optional[str] = Field(default=None)

    image_section: Optional[T2ImageSection] = Relationship(back_populates="images")
