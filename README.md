# 🚀 Artist Promotion Platform (StudioSeiHa)

## 1. 프로젝트 개요
아티스트 정보를 관리하고 멀티미디어 콘텐츠를 제공하는 **Full-stack 비동기 웹 애플리케이션**입니다. 

### 핵심 기능
- **Google OAuth & 이메일 인증**: 구글 소셜 로그인 및 OTP 기반 이메일 인증
- **사용자 인증**: 로컬 회원가입, 비밀번호 해싱(bcrypt), JWT 토큰 기반 인증
- **신규 유저 온보딩**: 닉네임 설정 및 중복 검사를 통한 회원가입 프로세스
- **마이페이지**: 사용자 프로필 정보 확인 및 관리
- **이미지 자산 관리**: Cloudinary를 이용한 CDN 기반 미디어 저장소

## 2. 기술 스택 (Tech Stack)

### Backend
* **Language**: Python 3.11
* **Framework**: **FastAPI** (비동기 처리 최적화)
* **Database**: **Neon DB** (Serverless PostgreSQL)
* **ORM**: **SQLModel** (SQLAlchemy + Pydantic 통합)
* **Auth**: Google OAuth 2.0, Email OTP, JWT (JSON Web Token)
* **Password Security**: bcrypt & passlib
* **Email**: FastAPI-Mail (SMTP 기반 이메일 발송)
* **Async Driver**: Asy19 (Vite)**
* **Routing**: React Router v7
* **HTTP Client**: Axios
* **Auth**: @react-oauth/google (Google OAuth 제공자)
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

## 4. 다중 인증 방식 지원 (Google OAuth + 로컬 회원가입 + Email OTP)

* **Google OAuth 2.0**: 구글 계정으로 간편 로그인 (백엔드 검증 포함)
* **로컬 회원가입**: 이메일과 비밀번호로 자체 회원가입 지원
* **Email OTP 인증**: 회원가입 시 6자리 OTP를 메일로 발송하여 이메일 검증 (5분 유효)
* **구현**: `/auth/send-otp`, `/auth/verify-otp`, `/auth/signup-email`, `/auth/login-email` 엔드포인트

### ✅ 신규 유저 온보딩 프로세스

* **이슈**: 구글 로그인 시 DB에 계정은 생성되나 신규 유저의 닉네임 설정 단계가 누락됨.
* **해결**: 백엔드의 `is_new_user` 플래그를 프론트엔드에서 즉시 감지하여 전용 **닉네임 설정 모달**을 강제 팝업. 중복 검사를 통과해야만 서비스 이용 가능.

### ✅ 보안: 비밀번호 해싱 & JWT 토큰 기반 인증

* **bcrypt**: 비밀번호를 안전하게 해싱하여 저장 (Salt rounds = 12)
* **JWT 토큰**: 로그인 성공 시 액세스 토큰 발급 및 요청 시마다 검증
* **구현**: `core/security.py`에서 토큰 생성/검증, `auth.py`에서 라우터 의존성 주입
API 엔드포인트

### 인증 API (`/auth`)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/auth/send-otp` | 이메일로 OTP 코드 발송 (5분 유효) |
| POST | `/auth/verify-otp` | OTP 검증 및 확인 |
| POST | `/auth/signup-email` | 로컬 회원가입 (이메일 + 비밀번호) |
| POST | `/auth/login-email` | 로컬 로그인 (이메일 + 비밀번호) |
| POST | `/auth/google-callback` | Google OAuth 토큰 검증 및 로그인 |
| POST | `/auth/update-nickname` | 사용자 닉네임 설정/수정 |
| GET | `/auth/check-nickname` | 닉네임 중복 검사 |
| GET | `/auth/profile` | 현재 사용자 프로필 조회 (JWT 필수) |

## 6. 실행 및 관리

### 로컬 개발 실행

```bash
# 전체 컨테이너 빌드 및 백그라운드 실행
docker-compose up --build -d

# 프론트엔드 (자동 실행, http://localhost:5173)
# 백엔드 (자동 실행, http://localhost:8000)
# API 문서 (http://localhost:8000/docs)
```

### 환경변수 설정 (`.env`)

프로젝트 루트에 `.env` 파일을 생성하고 다음 값을 설정하세요:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here

# Email Configuration (Gmail)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@studioseihа.com

# JWT Secret
SECRET_KEY=your-super-secret-jwt-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server URLs
BACKEND_URL=http://localhost:8000  # 로컬 개발 시
FRONTEND_URL=http://localhost:5173  # 로컬 개발 시
```

> **주의**: `.env` 파일은 `.gitignore`에 등록되어 GitHub에 업로드되지 않습니다.  
> **배포 시**: Cloudtype 대시보드에서 환경변수를 직접 설정하세요.

### 보안 관리

* **비밀번호 해싱**: bcrypt를 사용하여 모든 비밀번호 안전 저장
* **JWT 토큰**: 로그인 후 발급되는 토큰으로 API 요청 인증
* **CORS 설정**: 개발 중 모든 출처 허용, 배포 시 특정 도메인만 허용 권장
* **OTP 유효기간**: 5분으로 제한하여 보안 강화
* 사용자 프로필 정보 조회 및 관리
* React Router를 통한 `/mypage` 페이지 라우팅
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
