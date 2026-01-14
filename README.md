
# 🚀 Project Handover: Artist Promotion Platform

## 1. 프로젝트 개요

아티스트 정보를 관리하고, 이미지를 Cloudinary CDN에 저장하는 **Full-stack 비동기 웹 애플리케이션**입니다. 현재 로그인 및 기본적인 DB 연동이 완료된 상태입니다.

## 2. 기술 스택 (Tech Stack)

* **Backend**: Python 3.11-slim, **FastAPI**, **SQLModel** (SQLAlchemy + Pydantic), **Asyncpg** (비동기 DB 드라이버).
* **Frontend**: React (Vite), React-Router-Dom, Axios.
* **Database**: **Neon DB** (PostgreSQL Serverless).
* **Infrastructure**: Docker, Docker-Compose.
* **Storage**: Cloudinary (이미지 업로드용).

## 3. 파일 구조 (Final Directory Structure)

```text
artist-promotion-platform/
├── docker-compose.yml       # Back/Front 컨테이너 오케스트레이션
├── backend/
│   ├── app/
│   │   ├── main.py          # CORS 및 라우터 등록 (Entry Point)
│   │   ├── database.py      # AsyncEngine 및 get_session 설정
│   │   ├── core/
│   │   │   └── security.py  # JWT 생성, Bcrypt 비밀번호 검증 (Passlib)
│   │   ├── models/          # SQLModel 기반 테이블 정의 (User 등)
│   │   ├── schemas/         # Pydantic 기반 요청/응답 스키마
│   │   ├── api/             # 엔드포인트 로직 (auth.py 포함)
│   │   └── cloudinary.py    # 이미지 업로드 유틸리티
│   ├── Dockerfile
│   └── requirements.txt     # bcrypt==4.0.1 고정 (호환성 이슈 해결)
└── frontend/
    ├── src/
    │   ├── main.jsx         # Entry Point
    │   ├── App.jsx          # React-Router 기반 라우팅 로직
    │   └── pages/           # Main.jsx, LoginPage.jsx
    ├── Dockerfile.dev       # Vite Hot-reload 환경
    └── package.json         # react-router-dom, axios 포함

```

## 4. 주요 해결 과제 및 구현 사항 (Troubleshooting History)

### ✅ 비동기 DB 엔진 최적화

* `SQLModel`과 `sqlalchemy.ext.asyncio`를 결합하여 Neon DB에 비동기로 요청을 보냅니다. `models/__init__.py`를 통해 `Base` 객체 호환성 이슈를 해결했습니다.

### ✅ 로그인 및 보안 이슈 (Bcrypt Compatibility)

* **이슈**: DB에 수동 입력한 해시값과 서버 컨테이너 내부의 `bcrypt` 검증 알고리즘이 충돌하여 로그인 실패(`400 Bad Request`) 발생.
* **해결**: `auth.py`에 임시 강제 통과 및 **DB 해시 자동 갱신 로직**을 넣어 현재 환경에 맞는 해시값으로 DB 데이터를 교정했습니다. 현재는 정상적인 `verify_password` 절차를 따릅니다.

### ✅ 도커 네트워크 및 환경 변수

* 백엔드는 `0.0.0.0:8000`에서 실행되며, 프론트엔드는 도커 외부 브라우저 환경에서 백엔드와 통신합니다. `.env` 파일을 통해 보안키를 관리합니다.

## 5. 실행 방법 (How to Run)

```bash
# 전체 컨테이너 빌드 및 실행
docker-compose up --build

# DB 세션 확인 (Neon DB SQL Editor)
# 비밀번호 'test1234'의 해시값은 현재 DB에 정상 교정되어 있음.

```

## 6. 현재 상태 및 다음 기능 (Next Steps)

* **로그인**: 성공 (`200 OK`, JWT 발급 완료).
* **다음 작업**:
1. 발급된 JWT 토큰을 프론트엔드 `localStorage`에 저장하고 **PrivateRoute** 구현.
2. 메인 페이지(`Main.jsx`)에서 아티스트 목록을 불러오는 API 연동.
3. Cloudinary를 이용한 프로필 이미지 수정 기능 활성화.
