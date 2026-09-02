<div align="center">

# SEIHI — 아티스트 포트폴리오 플랫폼

**음악 아티스트가 코드 없이 자신의 포트폴리오 페이지를 만들고 공개하는 웹 서비스**

[![FastAPI](https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/NeonDB-Serverless_PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Service](https://img.shields.io/badge/서비스-seihi.co.kr-000000)](https://www.seihi.co.kr/)

2인 팀 · 2025.12 ~ 2026.05 · **실서비스 운영 중**

</div>

---

## 한눈에 보기

| | |
|---|---|
| **문제** | 음악 아티스트는 자기 작업을 모아 보여줄 곳이 없다. 인스타는 흐르고, 사운드클라우드는 음원만, 웹사이트는 만들 줄 모른다 |
| **접근** | 템플릿을 고르고 칸을 채우면 포트폴리오 페이지가 되는 서비스 |
| **까다로운 지점** | 아티스트마다 보여줄 것이 다르다 — 누구는 앨범, 누구는 세션 이력, 누구는 영상. **가변적인 콘텐츠 구조를 어떻게 저장할 것인가** |
| **규모** | 백엔드 라우터 6개 · 테이블 20+ · 인증 경로 3개 · 프론트 React 18 + TS |
| **배포** | Docker Compose → Cloudtype · [www.seihi.co.kr](https://www.seihi.co.kr/) |

<div align="center">
<img src="frontend/src/assets/images/template1_thumbnail.png" width="520" alt="Template 1"/>
<br><sub>템플릿 1 — 아티스트가 채우면 이런 페이지가 된다</sub>
</div>

---

## 목차

1. [담당 역할](#1-담당-역할)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [설계 판단](#3-설계-판단)
4. [데이터 모델](#4-데이터-모델)
5. [API](#5-api)
6. [실행 방법](#6-실행-방법)
7. [현재 상태](#7-현재-상태)

---

## 1. 담당 역할

2인 팀으로 진행했으며 **전체 162 커밋 중 99 커밋(약 61%)** 을 담당했다.

| | 담당 |
|---|---|
| **이종하** | **백엔드 전반** — 인증 3경로(Google OAuth / Email OTP / 로컬), JWT·bcrypt, DB 스키마 설계, Cloudinary 업로드, 관리자·메인페이지 API, Docker 구성 |
| 팀원 | 프론트엔드 UI 구현, 디자인 |
| 공통 | 기능 정의, 템플릿 구조 설계 |

---

## 2. 시스템 아키텍처

```mermaid
flowchart TB
    subgraph FE["Frontend — React 18 + TypeScript"]
        UI["Vite · Tailwind · React Router v6"]
    end

    subgraph BE["Backend — FastAPI (async)"]
        AUTH["auth<br/>OAuth · OTP · JWT"]
        PROF["profile<br/>템플릿 섹션 CRUD"]
        MAIN["main_page<br/>public + admin"]
        ADMIN["admin<br/>통계 · 유저 관리"]
        PAY["payment<br/>구독 플랜"]
    end

    subgraph EXT["External"]
        G["Google OAuth 2.0"]
        M["Gmail SMTP"]
        C["Cloudinary CDN<br/>image + audio"]
    end

    DB[("NeonDB<br/>Serverless PostgreSQL<br/>asyncpg")]

    UI -->|"Axios · Bearer JWT"| BE
    AUTH --> G
    AUTH --> M
    PROF --> C
    BE --> DB

    style AUTH fill:#1f6feb,color:#fff
    style PROF fill:#1f6feb,color:#fff
    style DB fill:#1f6feb,color:#fff
```

---

## 3. 설계 판단

### ① 인증 경로 3개를 단일 JWT로 수렴

로컬 가입, Google 소셜 로그인, 이메일 OTP 인증 — 진입 경로가 셋이지만 **이후 모든 요청은 하나의 JWT로 처리**되도록 설계했다.

```
로컬 가입   →  bcrypt 해싱 → users.password
Google      →  id_token 검증 → users.social_id (provider='google')
Email OTP   →  5분 유효 코드 → 검증 후 가입 진행
                      ↓
              JWT (Bearer) 발급 → 이후 동일
```

`users` 테이블에 `provider`(local/google/naver)와 `password NULL 허용`을 두어, 소셜 유저는 비밀번호 없이도 같은 테이블에서 관리된다. 신규 소셜 유저는 닉네임 설정 온보딩으로 분기시킨다.

### ② 템플릿별 독립 스키마 — JSON blob을 쓰지 않은 이유

가장 고민한 지점이다. 아티스트마다 채우는 내용이 다르므로 **JSON 컬럼 하나에 통째로 넣는 방법**이 가장 쉬웠다.

그렇게 하지 않은 이유:

- 나중에 **장르별·직업별 아티스트 검색**을 붙이려면 콘텐츠가 조회 가능해야 한다. JSON blob은 인덱싱이 어렵다
- 템플릿이 바뀔 때 **기존 데이터 마이그레이션 경로**가 없다
- 카드 순서(`order`), 카드 종류(YouTube / SoundCloud / 이미지 / 음원)마다 필요한 필드가 달라 **타입 안전성**이 필요했다

그래서 템플릿마다 접두사를 나눈 **정규화 스키마**(`t1_*`, `t2_*`)를 택했다. `users.active_template`으로 어느 세트를 쓸지 결정한다. 테이블 수는 늘어나지만, 각 카드가 독립 행이라 순서 변경·부분 수정·조회가 모두 단순해졌다.

### ③ 직업 분류를 코드가 아닌 DB에

아티스트의 직업(Vocal, Composer, Mixing Engineer…)을 상수로 박지 않고 **2단 카테고리 + 다대다**로 모델링했다.

```
career_categories (7개 대분류)
   └── career_items (세부 직업)
            └── user_jobs  ─ 다대다 ─  users
```

Performer / Player / Creator / Sound / Engineer / Developer / Visual 7개 카테고리를 서버 시작 시 `seed_categories()`로 자동 삽입한다. 직업이 추가돼도 **코드 배포 없이 DB 행만 추가**하면 되고, 나중에 "작곡가 찾기" 같은 필터를 붙일 때 조인 한 번으로 끝난다.

### ④ 전면 async

이 서비스의 요청 대부분은 **외부 I/O 대기**다 — Google 토큰 검증, Gmail SMTP 발송, Cloudinary 업로드, DB 조회.

FastAPI async + **asyncpg** 드라이버 + SQLModel(SQLAlchemy async) 조합으로 전 계층을 비동기로 맞췄다. 특히 음원(mp3) 업로드는 응답이 수 초 걸리는데, 동기 방식이면 그동안 워커가 묶인다.

### ⑤ 이미지와 오디오를 한 엔드포인트로

Cloudinary의 `resource_type="auto"`를 사용해 **업로드 엔드포인트를 하나로 유지**했다. 클라이언트는 파일 종류를 신경 쓰지 않고 `POST /profile/upload`에 보내면 URL을 받는다. 아티스트 포트폴리오 특성상 이미지와 음원이 섞여 들어오므로, 분기를 클라이언트에 두지 않는 편이 단순했다.

---

## 4. 데이터 모델

### 핵심 테이블

**`users`** — `id` · `email`(UNIQUE) · `nickname` · `password`(NULL 허용) · `profile_image` · `role`(user/admin) · `provider`(local/google/naver) · `social_id`(UNIQUE) · `active_template` · `is_active` · `created_at`

**직업 분류**
```
career_categories  id, name, order, is_active
   └── career_items      id, category_id → career_categories.id, name, order
          └── user_jobs      user_id → users.id, career_item_id → career_items.id
```

### 템플릿 1 스키마 (`t1_*`)

```
t1_name_sections          유저당 1행 — 썸네일, 이름, 영문명, 설명
   └── t1_name_section_jobs        직업 연결

t1_album_sections         유저당 1행
   ├── t1_youtube_cards           link, 프로젝트 정보
   ├── t1_soundcloud_cards        link, 프로젝트 정보
   ├── t1_image_cards             image_url (Cloudinary)
   └── t1_no_image_cards          mp3_url  (Cloudinary)

t1_contact_sections       전화 2 · 이메일 3 · SNS 3
t1_text_sections          유저당 N행
   └── t1_text_cards
          └── t1_text_card_body_items
```

카드 4종 모두 `order` 컬럼을 가져 아티스트가 배치를 바꿀 수 있다. 템플릿 2(`t2_*`)는 같은 패턴으로 별도 스키마를 갖는다.

---

## 5. API

### 인증 `/auth`
| | 엔드포인트 | 설명 |
|---|---|---|
| POST | `/auth/send-otp` | 이메일 OTP 발송 (5분 유효) |
| POST | `/auth/verify-otp` | OTP 검증 |
| POST | `/auth/signup` · `/auth/login` | 로컬 가입 / 로그인 → JWT |
| POST | `/auth/google` | Google `id_token` 검증 → JWT |
| POST/GET | `/auth/update-nickname` · `/auth/check-nickname` | 닉네임 설정·중복 확인 |

### 프로필 `/profile`
| | 엔드포인트 | 설명 |
|---|---|---|
| GET 🔒 | `/profile/me` | 전체 프로필 조회 |
| GET | `/profile/career-items` | 직업 카테고리 목록 |
| PUT 🔒 | `/profile/name-section` · `/album-section` · `/contact-section` · `/text-sections` | 섹션별 저장 |
| PUT 🔒 | `/profile/active-template` | 활성 템플릿 변경 |
| POST 🔒 | `/profile/upload` | 파일 → Cloudinary → URL |

### 그 외
| 라우터 | 내용 |
|---|---|
| `main_page` | 메인 페이지 콘텐츠 (public) + 스포트라이트 아티스트 설정 (admin) |
| `admin` | 가입 통계, 최근 활동, 유저 목록·상세 |
| `payment` | 구독 플랜 조회 · 가입 · 해지 |

🔒 = `Authorization: Bearer <token>` 필요 · Swagger UI: `http://localhost:8000/docs`

---

## 6. 실행 방법

```bash
docker compose up --build -d

# Frontend  http://localhost:5173
# Backend   http://localhost:8000
# API Docs  http://localhost:8000/docs
```

서버 시작 시 `init_db()` + `seed_categories()`가 자동 실행되어 테이블 생성과 직업 카테고리 시드가 끝난다.

**환경변수** (`.env` — `.gitignore` 등록됨)
```env
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
SECRET_KEY=              # JWT 서명키
GOOGLE_CLIENT_ID=
MAIL_USERNAME= / MAIL_PASSWORD= / MAIL_FROM=
CLOUDINARY_CLOUD_NAME= / CLOUDINARY_API_KEY= / CLOUDINARY_API_SECRET=
BACKEND_URL= / FRONTEND_URL=
```

---

## 7. 현재 상태

**완료**
- 인증 3경로(Google OAuth · Email OTP · 로컬) → 단일 JWT
- 템플릿 1·2 스키마 및 섹션별 편집 API
- Cloudinary 파일 업로드 (이미지 · MP3)
- 직업 카테고리 DB 구조 + 자동 시드
- 메인 페이지 CMS (스포트라이트 아티스트 관리)
- 관리자 대시보드 (통계 · 유저 관리)
- 구독 플랜 API
- Docker Compose 구성 및 Cloudtype 배포

**진행 / 예정**
- 아티스트 공개 포트폴리오 페이지 (비로그인 접근)
- 장르별·직업별 아티스트 검색 — ③에서 정규화를 택한 이유가 여기서 쓰인다
- JWT Private Route 보안 강화
- 결제 게이트웨이 실연동

---

## 저장소 구조

```
├── backend/
│   ├── app/
│   │   ├── api/          auth · profile · main_page · admin · payment
│   │   ├── core/         security(JWT·bcrypt) · deps(get_current_user)
│   │   ├── models/       user · category · template1 · template2 · main_page
│   │   ├── schemas/      Pydantic 저장 스키마
│   │   ├── cloudinary.py · database.py · main.py
│   │   └── scripts/      seed_categories.py
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── components/   AuthModals · Header · HeroSection · DiscoverSounds …
│       ├── pages/        Main · MyPage · EditProfile · Profile
│       ├── lib/          api.ts · assets.ts
│       └── types/
└── docker-compose.yml
```

---

<div align="center">

**이종하** · [GitHub](https://github.com/bell-ha) · [Portfolio](https://bell-ha.github.io) · [서비스 바로가기](https://www.seihi.co.kr/)

</div>
