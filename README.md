# Artist Promotion Platform — SEIHI

## 1. 프로젝트 개요

아티스트 정보를 관리하고 멀티미디어 콘텐츠를 제공하는 **Full-stack 비동기 웹 애플리케이션**입니다.

### 핵심 기능
- **Google OAuth & 이메일 인증**: 구글 소셜 로그인 및 OTP 기반 이메일 인증
- **사용자 인증**: 로컬 회원가입, 비밀번호 해싱(bcrypt), JWT 토큰 기반 인증
- **신규 유저 온보딩**: 닉네임 설정 및 중복 검사
- **아티스트 프로필 편집**: 템플릿 기반 포트폴리오 구성 (Name / Album / Text 섹션)
- **파일 업로드**: Cloudinary CDN — 이미지(jpg, png 등) 및 오디오(mp3) 지원
- **마이페이지**: 프로필 조회, 포트폴리오 편집, 데이터 확인

---

## 2. 기술 스택

### Backend
| 항목 | 내용 |
|------|------|
| Language | Python 3.11 |
| Framework | FastAPI (async) |
| Database | NeonDB — Serverless PostgreSQL |
| ORM | SQLModel (SQLAlchemy + Pydantic) |
| Auth | Google OAuth 2.0, Email OTP, JWT (Bearer) |
| Password | bcrypt + passlib |
| Email | FastAPI-Mail (Gmail SMTP) |
| Async Driver | asyncpg |
| File Storage | Cloudinary (`resource_type="auto"` — image & audio) |

### Frontend
| 항목 | 내용 |
|------|------|
| Library | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS + inline styles |
| Routing | React Router v6 |
| HTTP | Axios |
| Google Auth | @react-oauth/google |

### Infrastructure
| 항목 | 내용 |
|------|------|
| Container | Docker + Docker Compose |
| Deployment | Cloudtype |

---

## 3. 파일 구조

```text
artist-promotion-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py             # 인증 API (Google, 이메일, JWT)
│   │   │   └── profile.py          # 프로필 API (조회/저장/업로드)
│   │   ├── core/
│   │   │   ├── security.py         # JWT 발급, bcrypt 해싱
│   │   │   └── deps.py             # get_current_user 의존성
│   │   ├── models/
│   │   │   ├── user.py             # users 테이블
│   │   │   ├── category.py         # career_categories, career_items, user_jobs
│   │   │   └── template1.py        # t1_* 템플릿1 전용 테이블
│   │   ├── schemas/
│   │   │   └── template1.py        # Pydantic 저장 스키마
│   │   ├── cloudinary.py           # Cloudinary 설정 초기화
│   │   ├── database.py             # 엔진, 세션, init_db, seed_categories
│   │   └── main.py                 # FastAPI 앱, lifespan, 라우터 등록
│   ├── scripts/
│   │   └── seed_categories.py      # 직업 카테고리 수동 시드 스크립트
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModals.tsx       # 로그인/회원가입/비밀번호 찾기 모달
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── DiscoverSounds.tsx
│   │   │   ├── SpotlightAlbum.tsx
│   │   │   └── CTASection.tsx
│   │   ├── pages/
│   │   │   ├── Main.tsx            # 메인 랜딩 페이지
│   │   │   ├── MyPage.tsx          # 마이페이지 (프로필 요약)
│   │   │   ├── EditProfile.tsx     # 프로필 편집 (Name/Album/Text 섹션)
│   │   │   └── Profile.tsx         # 저장된 프로필 데이터 확인 (개발용)
│   │   ├── lib/
│   │   │   ├── api.ts              # BACKEND_URL, FORGOT_API 상수
│   │   │   └── assets.ts           # 이미지 에셋 중앙 관리
│   │   ├── types/
│   │   │   └── auth.ts             # Auth 관련 타입
│   │   ├── App.tsx                 # 라우팅
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 4. 데이터베이스 구조

### 테이블 목록

```
users
career_categories
career_items
user_jobs
t1_name_sections
t1_name_section_jobs
t1_album_sections
t1_youtube_cards
t1_soundcloud_cards
t1_image_cards
t1_no_image_cards
t1_text_sections
t1_text_cards
t1_text_card_body_items
```

---

### `users`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int PK | |
| email | varchar UNIQUE | |
| nickname | varchar | |
| password | varchar NULL | 로컬 가입 시만 존재 |
| profile_image | varchar NULL | |
| role | enum | `user` / `admin` |
| provider | enum | `local` / `google` / `naver` |
| social_id | varchar NULL UNIQUE | 구글 sub 값 |
| active_template | int | 현재 선택 템플릿 (1/2/3), default 1 |
| is_active | bool | |
| created_at | timestamptz | |

---

### 직업 분류 (`career_*`, `user_jobs`)

서버 시작 시 `seed_categories()`로 자동 삽입됩니다.

```
career_categories (대분류)
  id, name, order, is_active

  └── career_items (세부 항목)
        id, category_id → career_categories.id
        name, order, is_active

user_jobs (유저 ↔ 직업 다대다)
  id
  user_id        → users.id
  career_item_id → career_items.id
```

**seed 데이터 (7개 카테고리)**

| 카테고리 | 항목 |
|----------|------|
| PERFORMER | 보컬, 인디 싱어송라이터, 뮤지컬배우 |
| INSTRUMENTALIST | 기타리스트, 피아니스트, 드러머, 베이시스트, 오케스트라 연주자, 세션 연주자 |
| CREATOR | 대중음악 작곡가, 영화음악 작곡가, 게임음악 작곡가, 광고음악 작곡가, 비트메이커, 탑라이너 |
| SOUND DESIGNER | 사운드 디자이너, 폴리 아티스트, 인터랙티브 오디오 디자이너 |
| AUDIO ENGINEER | 레코딩 엔지니어, 믹싱/마스터링 엔지니어, 라이브 PA 엔지니어, 방송 음향 감독 |
| AUDIO PROGRAMMER | 프론트엔드 개발자, 백엔드 개발자 |
| VISUAL ARTIST | 미디어아트 작가, 미술 작가, 설치미술가, 공연 테크니컬 디렉터 |

---

### Template 1 테이블 (`t1_*`)

`users.active_template = 1` 인 유저에게 사용됩니다.
모든 t1 테이블은 `user_id → users.id` FK를 가집니다.

```
t1_name_sections (유저당 1행)
  id, user_id, thumbnail_url
  name, english_name, description1, description2

  └── t1_name_section_jobs (직업 연결)
        id
        name_section_id → t1_name_sections.id
        career_item_id  → career_items.id

t1_album_sections (유저당 1행)
  id, user_id

  ├── t1_youtube_cards
  │     id, album_section_id, order
  │     link, project_title, album_name, composer
  │     category_desc, year, description
  │
  ├── t1_soundcloud_cards
  │     id, album_section_id, order
  │     link, project_title, album_name, composer
  │     category_desc, year, description
  │
  ├── t1_image_cards
  │     id, album_section_id, order
  │     hyperlink, image_url        ← Cloudinary URL
  │     project_title, album_name, composer
  │     category_desc, year, description
  │
  └── t1_no_image_cards
        id, album_section_id, order
        mp3_url                     ← Cloudinary URL
        project_title, album_name, composer
        category_desc, year, description

t1_text_sections (유저당 N행)
  id, user_id, order, title, description

  └── t1_text_cards
        id, text_section_id, order, title, detail

        └── t1_text_card_body_items
              id, text_card_id, order, title, content
```

---

## 5. API

### 인증 (`/auth`)
| 메서드 | 엔드포인트 | 인증 | 설명 |
|--------|-----------|:----:|------|
| POST | `/auth/send-otp` | | 이메일로 OTP 발송 (5분 유효) |
| POST | `/auth/verify-otp` | | OTP 검증 |
| POST | `/auth/signup` | | 로컬 회원가입 |
| POST | `/auth/login` | | 로컬 로그인 → JWT 반환 |
| POST | `/auth/google` | | Google id_token 검증 → JWT 반환 |
| POST | `/auth/update-nickname` | | 닉네임 수정 |
| GET | `/auth/check-nickname` | | 닉네임 중복 확인 |

### 프로필 (`/profile`)
| 메서드 | 엔드포인트 | 인증 | 설명 |
|--------|-----------|:----:|------|
| GET | `/profile/me` | 🔒 | 전체 프로필 조회 |
| GET | `/profile/career-items` | | 직업 카테고리 목록 |
| PUT | `/profile/name-section` | 🔒 | Name Section 저장 |
| PUT | `/profile/album-section` | 🔒 | Album Section 저장 (4종 카드) |
| PUT | `/profile/text-sections` | 🔒 | Text Sections 저장 |
| PUT | `/profile/active-template` | 🔒 | 활성 템플릿 변경 (1/2/3) |
| POST | `/profile/upload` | 🔒 | 파일 → Cloudinary → URL 반환 |

> 🔒 = `Authorization: Bearer <token>` 헤더 필요
> Swagger UI: `http://localhost:8000/docs`

---

## 6. 실행 방법

```bash
# 전체 빌드 및 백그라운드 실행
docker compose up --build -d

# 프론트엔드: http://localhost:5173
# 백엔드:     http://localhost:8000
# API 문서:   http://localhost:8000/docs
```

서버 시작 시 `init_db()` + `seed_categories()`가 자동 실행됩니다.
테이블 생성 및 직업 카테고리 초기 데이터 삽입이 자동으로 이루어집니다.

---

## 7. 환경변수 (`.env`)

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname

# Auth
SECRET_KEY=your-jwt-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email (Gmail SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@seihi.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

> `.env`는 `.gitignore`에 등록되어 있습니다. 배포 시 Cloudtype 대시보드에서 환경변수를 직접 설정하세요.

---

## 8. 현재 상태

**완료**
- Google OAuth 로그인, 이메일 OTP 회원가입, JWT 인증
- 아티스트 프로필 편집 (Template 1): Name / Album / Text 섹션
- Cloudinary 파일 업로드 (이미지, MP3)
- 직업 카테고리 DB 구조 + 자동 시드
- 프로필 데이터 확인 페이지 (`/mypage/profile` — API 응답 JSON 뷰어)

**예정**
- Template 2, 3 설계 및 구현
- 아티스트 공개 포트폴리오 페이지 (비로그인 접근)
- 장르별 아티스트 검색 / 필터링
- JWT Private Route 보안 강화
