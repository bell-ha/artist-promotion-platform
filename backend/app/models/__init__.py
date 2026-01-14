# app/models/__init__.py
from sqlmodel import SQLModel
from .user import User, UserRole
# 추가되는 모델들을 여기에 등록하세요
# from .artist import Artist 

# 다른 곳에서 Base라는 이름으로 쓰고 싶다면 아래와 같이 정의할 수 있습니다.
Base = SQLModel