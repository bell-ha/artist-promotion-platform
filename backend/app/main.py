from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

import cloudinary.uploader
import cloudinary
import app.cloudinary  # Cloudinary 설정 임포트
from app.database import get_session
from app.models.artist import Artist

app = FastAPI(title="Artist Promotion Platform API")

# ✅ 1. CORS 설정: 프론트엔드에서 백엔드 API에 접속할 수 있게 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용 (실제 서비스에서는 프론트엔드 주소만 넣는 것이 안전함)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 2. 기본 헬스체크 엔드포인트
@app.get("/")
async def root():
    return {"message": "Artist Promotion Platform API is running"}

# ✅ 3. 아티스트 목록 조회 API
@app.get("/api/artists")
async def get_artists(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Artist))
    artists = result.scalars().all()
    return artists

# ✅ 4. 이미지 업로드 및 URL 저장 API
@app.post("/api/artists/{artist_id}/image")
async def upload_artist_image(
    artist_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    # DB에서 아티스트 확인
    artist = await session.get(Artist, artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    try:
        # ✅ Cloudinary 업로드 실행
        # file.file은 바이너리 파일 객체입니다.
        result = cloudinary.uploader.upload(
            file.file,
            folder="artists",
            public_id=f"artist_{artist_id}",
            overwrite=True,
        )

        # 업로드된 보안 URL을 DB에 저장
        artist.image_url = result.get("secure_url")
        session.add(artist)
        await session.commit()
        await session.refresh(artist)

        return {
            "id": artist.id,
            "name": artist.name,
            "image_url": artist.image_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")