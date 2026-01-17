# 🚀 Artist Promotion Platform (StudioSeiHa)

## 1. 프로젝트 개요
아티스트 정보를 관리하고 멀티미디어 콘텐츠를 제공하는 **Full-stack 비동기 웹 애플리케이션**입니다. 구글 OAuth를 활용한 간편 로그인과 신규 유저를 위한 온보딩 프로세스(닉네임 설정), 그리고 Cloudinary를 이용한 이미지 자산 관리를 핵심 기능으로 합니다.

## 2. 기술 스택 (Tech Stack)

### Backend
* **Language**: Python 3.11
* **Framework**: **FastAPI** (비동기 처리 최적화)
* **Database**: **Neon DB** (Serverless PostgreSQL)
* **ORM**: **SQLModel** (SQLAlchemy + Pydantic 통합)
* **Auth**: Google OAuth 2.0 & JWT (JSON Web Token)

### Frontend
* **Library**: **React (Vite)**
* **State/Auth**: Google OAuth Provider & Axios
* **Styling**: Component-based inline styling

### Infrastructure & Storage
* **Deployment**: Cloudtype
* **Container**: Docker, Docker-Compose
* **CDN**: Cloudinary (Image Management)

## 3. 파일 구조 (Final Directory Structure)

```text
artist-promotion-platform/
├── backend/                     # FastAPI 비동기 백엔드 서버
│   ├── app/
│   │   ├── api/                 # Endpoint (Auth, Nickname 관리 등)
│   │   ├── core/                # 보안 및 JWT 설정
│   │   ├── models/              # SQLModel 기반 DB 테이블 정의
│   │   ├── schemas/             # 데이터 검증용 Pydantic 모델
│   │   ├── database.py          # 비동기 DB 엔진(AsyncEngine) 설정
│   │   ├── cloudinary.py        # CDN 연동 유틸리티
│   │   └── main.py              # Entry Point (CORS 및 라우터 등록)
│   ├── Dockerfile
│   └── requirements.txt         # 백엔드 패키지 의존성
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── pages/               # Main.jsx (온보딩 및 메인 로직)
│   │   ├── App.jsx              # 라우팅 로직
│   │   └── main.jsx             # React Entry Point
│   ├── Dockerfile.dev           # 개발용 도커 환경
│   └── package.json
├── .gitignore                   # 환경변수(.env) 및 시스템 파일 보안 관리
├── docker-compose.yml           # 풀스택 서비스 오케스트레이션
└── README.md

```

## 4. 주요 구현 사항 및 트러블슈팅 (Highlights)

### ✅ 신규 유저 온보딩 프로세스 (Google OAuth)

* **이슈**: 구글 로그인 시 DB에 계정은 생성되나 신규 유저의 닉네임 설정 단계가 누락됨.
* **해결**: 백엔드의 `is_new_user` 플래그를 프론트엔드에서 즉시 감지하여 전용 **닉네임 설정 모달**을 강제 팝업하는 로직 구현. 중복 검사를 통과해야만 서비스 이용이 가능하도록 설계.

### ✅ 보안 및 환경변수 관리 최적화

* **이슈**: 커밋 기록에 민감 정보(`.env`)가 노출되는 보안 이슈 발생.
* **해결**: `git filter-branch` 및 `force push`를 통해 과거 유출 기록을 완전히 세탁함. 이후 모든 비밀 정보는 인프라(Cloudtype) 환경변수로 분리하여 관리.

### ✅ 비동기 DB 및 인프라 연동

* `Asyncpg` 드라이버를 사용하여 Neon DB와 비동기 세션을 유지하며 성능 최적화.
* 로컬(localhost)과 배포 서버(Cloudtype) 환경에 따라 백엔드 URL이 자동 전환되도록 유연한 통신 환경 구축.

## 5. 실행 및 관리

### 로컬 실행

```bash
# 전체 컨테이너 빌드 및 백그라운드 실행
docker-compose up --build -d

```

### 보안 관리

* **`.env` 관리**: 본 프로젝트의 `.env`는 `.gitignore`에 등록되어 GitHub에 업로드되지 않습니다.
* **배포 서버 설정**: 실제 운영 환경에서는 Cloudtype 환경변수 설정을 통해 서버 비밀키를 공급받습니다.

## 6. 현재 상태 및 향후 과제

* **완료**: 구글 로그인 연동, 신규 유저 닉네임 강제 설정 모달, DB 비동기 CRUD.
* **진행 예정**:
1. JWT 토큰을 이용한 Private Route 보안 강화.
2. 아티스트 프로필 이미지 Cloudinary 업로드 기능 세부 연동.
3. 장르별 아티스트 필터링 고도화.
