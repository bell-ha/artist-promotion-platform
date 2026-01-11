from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models.artist import Artist
import cloudinary.uploader

app = FastAPI()


@app.post("/api/artists/{artist_id}/image")
async def upload_artist_image(
    artist_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    artist = await session.get(Artist, artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    # Cloudinary 업로드
    result = cloudinary.uploader.upload(
        file.file,
        folder="artists",
        public_id=f"artist_{artist_id}",
        overwrite=True,
    )

    artist.image_url = result["secure_url"]
    session.add(artist)
    await session.commit()
    await session.refresh(artist)

    return {
        "id": artist.id,
        "image_url": artist.image_url,
    }
