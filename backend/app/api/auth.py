from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/login")
def login(login_data: dict, db: Session = Depends(get_db)):
    # 1. 유저 찾기
    user = db.query(User).filter(User.email == login_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 틀렸습니다.")

    # 2. 비밀번호 확인
    if not verify_password(login_data.get("password"), user.password):
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 틀렸습니다.")

    # 3. 토큰 발급 (ID와 Role을 담음)
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role,
        "nickname": user.nickname
    }