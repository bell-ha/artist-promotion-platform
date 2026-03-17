# Artist Promotion Platform — SEIHI

## 1. 프로젝트 개요
아티스트 정보를 관리하고 멀티미디어 콘텐츠를 제공하는 **Full-stack 비동기 웹 애플리케이션**입니다.

### 핵심 기능
- **Google OAuth & 이메일 인증**: 구글 소셜 로그인 및 OTP 기반 이메일 인증
- **사용자 인증**: 로컬 회원가입, 비밀번호 해싱(bcrypt), JWT 토큰 기반 인증
- **신규 유저 온보딩**: 닉네임 설정 및 중복 검사를 통한 회원가입 프로세스
- **마이페이지**: 사용자 프로필 정보 확인 및 관리
- **이미지 자산 관리**: Cloudinary를 이용한 CDN 기반 미디어 저장소

---

## 2. 기술 스택 (Tech Stack)

### Backend
- **Language**: Python 3.11
- **Framework**: FastAPI (비동기 처리 최적화)
- **Database**: Neon DB (Serverless PostgreSQL)
- **ORM**: SQLModel (SQLAlchemy + Pydantic 통합)
- **Auth**: Google OAuth 2.0, Email OTP, JWT
- **Password Security**: bcrypt & passlib
- **Email**: FastAPI-Mail (SMTP 기반)
- **Async Driver**: asyncpg

### Frontend
- **Library**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Auth**: @react-oauth/google

### Infrastructure & Storage
- **Deployment**: Cloudtype
- **Container**: Docker, Docker-Compose
- **CDN**: Cloudinary (Image Management)

---

## 3. 파일 구조

```text
artist-promotion-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── auth.py             # 구글 로그인 및 닉네임 설정/검증 API
│   │   ├── core/
│   │   │   └── security.py         # JWT 발급 및 비밀번호 해싱 로직
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   ├── database.py
│   │   ├── cloudinary.py
│   │   ├── main.py
│   │   └── __init__.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/             # 로컬 이미지/SVG 에셋
│   │   │       ├── logo.svg
│   │   │       ├── hero-bg-1.png
│   │   │       ├── hero-bg-2.png
│   │   │       ├── discover-1~4.png
│   │   │       ├── spotlight-album.png
│   │   │       └── icon-*.svg
│   │   ├── components/             # 페이지 단위 섹션 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── DiscoverSounds.tsx
│   │   │   ├── SpotlightAlbum.tsx
│   │   │   ├── CTASection.tsx
│   │   │   └── AuthModals.tsx
│   │   ├── lib/
│   │   │   ├── assets.ts           # 이미지 에셋 중앙 관리
│   │   │   └── api.ts              # Axios 인스턴스 및 API 함수
│   │   ├── pages/
│   │   │   ├── Main.tsx            # 메인 랜딩 페이지
│   │   │   └── MyPage.tsx          # 마이페이지
│   │   ├── types/
│   │   │   └── auth.ts             # 인증 관련 타입 정의
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 4. 인증 API (`/auth`)

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

---

## 5. 실행 방법

### 로컬 개발

```bash
# 전체 컨테이너 빌드 및 백그라운드 실행
docker-compose up --build -d

# 프론트엔드: http://localhost:5173
# 백엔드:     http://localhost:8000
# API 문서:   http://localhost:8000/docs
```

### 환경변수 설정 (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
GOOGLE_CLIENT_ID=your-google-client-id
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@seihi.com
SECRET_KEY=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

> `.env` 파일은 `.gitignore`에 등록되어 GitHub에 업로드되지 않습니다.
> 배포 시 Cloudtype 대시보드에서 환경변수를 직접 설정하세요.

---

## 6. 현재 상태 및 향후 과제

**완료**
- 구글 로그인 연동, 신규 유저 닉네임 강제 설정 모달, DB 비동기 CRUD
- 프론트엔드 TypeScript 마이그레이션 (JSX → TSX)
- SEIHI 랜딩 페이지 퍼블리싱 (Header, Hero, Discover Sounds, Spotlight Album, CTA)
- Tailwind CSS 도입 및 에셋 중앙 관리 구조 설계

**진행 예정**
1. JWT 기반 Private Route 보안 강화
2. 아티스트 프로필 이미지 Cloudinary 업로드 연동
3. 장르별 아티스트 필터링 고도화
4. 상세 페이지 퍼블리싱
