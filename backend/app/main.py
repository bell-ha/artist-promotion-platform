import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth
from app.api import profile
from app.api import payment
from app.api import admin
from app.api import main_page as main_page_api

# 스키마 생성과 기준정보 시드는 Alembic 마이그레이션이 담당한다.
# 부팅 때마다 운영 DB에 DDL을 실행하던 구조를 걷어냈다.
app = FastAPI(
    title="Artist Promotion Platform API",
)

# ✅ 미들웨어 설정
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://www.seihi.co.kr",
    "https://seihi.co.kr",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(payment.router)
app.include_router(admin.router)
app.include_router(main_page_api.public_router)
app.include_router(main_page_api.admin_router)

@app.get("/")
async def root():
    return {"message": "Artist Promotion Platform API is running"}

# (필요하다면) 여기에 있던 아티스트 API들도 app/api/artist.py로 옮기는 것을 추천합니다.