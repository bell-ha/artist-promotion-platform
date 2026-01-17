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
├── backend/                        # FastAPI 비동기 백엔드 서버
│   ├── app/
│   │   ├── api/                    # API 엔드포인트 로직
│   │   │   ├── __init__.py
│   │   │   └── auth.py             # 구글 로그인 및 닉네임 설정/검증 API
│   │   ├── core/                   # 보안 및 공통 설정
│   │   │   └── security.py         # JWT 발급 및 비밀번호 해싱 로직
│   │   ├── models/                 # DB 테이블 정의
│   │   │   ├── __init__.py
│   │   │   └── user.py             # User(id, email, nickname 등) 모델
│   │   ├── schemas/                # Pydantic 데이터 검증 모델
│   │   │   ├── __init__.py
│   │   │   └── user.py             # 요청/응답용 유저 스키마
│   │   ├── database.py             # AsyncEngine 및 비동기 세션 관리
│   │   ├── cloudinary.py           # 이미지 업로드 및 CDN 연동 유틸
│   │   ├── main.py                 # 앱 진입점 (CORS, 라우터 통합)
│   │   └── __init__.py
│   ├── Dockerfile                  # 백엔드 컨테이너 빌드 설정
│   └── requirements.txt            # 의존성 패키지 리스트
├── frontend/                       # React (Vite) 프론트엔드
│   ├── src/
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   │   ├── Main.jsx            # 메인 대시보드 및 닉네임 설정 모달 구현
│   │   │   └── LoginPage.jsx       # 구글 로그인 페이지
│   │   ├── assets/                 # 이미지 및 정적 자산
│   │   ├── App.jsx                 # 라우팅 및 전역 상태 관리
│   │   ├── main.jsx                # 프론트엔드 진입점
│   │   └── index.css               # 전역 스타일시트
│   ├── public/                     # 정적 리소스
│   ├── index.html                  # 메인 HTML 템플릿
│   ├── vite.config.js              # Vite 빌드 설정
│   ├── package.json                # 프론트엔드 라이브러리 관리
│   ├── Dockerfile.dev              # 개발용 도커 환경 설정
│   └── .gitignore                  # 로컬 환경 설정 제외 파일 정의
├── docker-compose.yml              # 전체 서비스 통합 실행 설정
├── .gitignore                      # 루트 레포지토리 보안 관리 (.env 포함)
└── README.md                       # 프로젝트 문서

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
