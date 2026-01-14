import os
from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

# 환경 변수에서 DB 주소 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

# 비동기 엔진 생성
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # 실행되는 SQL문을 로그로 보여줍니다 (개발 시 유용)
)

# 세션 생성기 설정
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ✅ [추가] 서버 시작 시 테이블을 생성하는 함수
async def init_db():
    async with engine.begin() as conn:
        # 이 시점에 모델들이 SQLModel.metadata에 등록되어 있어야 합니다.
        # 따라서 아래처럼 모델을 임포트해줍니다.
        from app.models.user import User
        
        # 테이블 생성 (이미 존재하면 건너뜁니다)
        await conn.run_sync(SQLModel.metadata.create_all)

# 의존성 주입을 위한 세션 제공 함수
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session