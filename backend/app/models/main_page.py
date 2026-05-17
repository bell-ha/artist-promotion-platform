from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Integer, ForeignKey


class MainPageContent(SQLModel, table=True):
    __tablename__ = "main_page_content"

    id: Optional[int] = Field(default=None, primary_key=True)
    hero_title: str = Field(default="가치를 위한, 기록의 첫 걸음")
    hero_subtitle: str = Field(
        default="가격은 협상의 결과이고, 가치는 존재의 본질입니다. SEIHI는 아티스트의 가치를 지키는 플랫폼입니다.\n영광스러운 첫 시작을 저희와 함께해주세요."
    )
    discover_subtitle: str = Field(default="다양한 장르의 사운드를 한 화면에서")
    cta_title: str = Field(default="새로운 사운드를 만나는\n가장 좋은 방식")
    cta_subtitle: str = Field(default="다양한 장르의 음악 포트폴리오를 한 화면에서 탐색해보세요.")
    # 히어로 배경 이미지 (없으면 로컬 에셋 사용)
    hero_bg1_url: Optional[str] = Field(default=None)
    hero_bg2_url: Optional[str] = Field(default=None)


class DiscoverCard(SQLModel, table=True):
    __tablename__ = "discover_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    slot_order: int = Field(nullable=False)
    # 컬럼명을 artist_id로 해서 database.py의 CASCADE 스크립트 영향 안 받음
    artist_id: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )
    image_url: Optional[str] = Field(default=None)


class SpotlightSetting(SQLModel, table=True):
    __tablename__ = "spotlight_settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    subtitle: str = Field(default="이번 달 가장 주목할 사운드 컬렉션")
    artist_id: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )
    image_url: Optional[str] = Field(default=None)
    title: Optional[str] = Field(default=None)
    artist_name: Optional[str] = Field(default=None)
    genre: Optional[str] = Field(default=None)
