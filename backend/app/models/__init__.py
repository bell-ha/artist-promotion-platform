# app/models/__init__.py
from sqlmodel import SQLModel
from .user import User, UserRole
from .category import CareerCategory, CareerItem, UserJob
from .template1 import (
    NameSection, NameSectionJob,
    AlbumSection, YoutubeCard, SoundcloudCard, ImageCard, NoImageCard,
    ContactSection,
    TextSection, TextCard, TextCardBodyItem,
)
from .template2 import (
    T2NameSection, T2NameSectionJob,
    T2AlbumSection, T2YoutubeCard, T2SoundcloudCard, T2ImageCard, T2NoImageCard,
    T2ContactSection,
    T2TextSection, T2TextCard, T2TextCardBodyItem,
    T2ImageSection, T2ImageSectionImage,
)
from .main_page import MainPageContent, DiscoverCard, SpotlightSetting

# 다른 곳에서 Base라는 이름으로 쓰고 싶다면 아래와 같이 정의할 수 있습니다.
Base = SQLModel