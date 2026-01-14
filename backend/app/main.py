from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.database import init_db
from app.api import auth  # auth 라우터 임포트

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 테이블 생성
    await init_db()
    yield

app = FastAPI(
    title="Artist Promotion Platform API",
    lifespan=lifespan
)

# ✅ 미들웨어 설정
app.add_middleware(SessionMiddleware, secret_key="your-temporary-session-secret")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Artist Promotion Platform API is running"}

# (필요하다면) 여기에 있던 아티스트 API들도 app/api/artist.py로 옮기는 것을 추천합니다.