from sqlmodel import SQLModel, Field
from typing import Optional

class Artist(SQLModel, table=True):
    __tablename__ = "artists"   # 🔥 이 한 줄이 핵심

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    genre: str
    country: str
    image_url: Optional[str] = None
