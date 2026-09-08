<div align="center">

# SEIHI — 아티스트 포트폴리오 플랫폼

**음악 아티스트가 코드 없이 자신의 포트폴리오 페이지를 만들고 공개하는 웹 서비스**

[![FastAPI](https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/NeonDB-Serverless_PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/운영-중단-lightgrey)]()

2인 팀 · 2025.12 ~ 2026.05 · **운영 중단 (재개발 중)**

</div>

---

## 한눈에 보기

| | |
|---|---|
| **문제** | 음악 아티스트는 자기 작업을 모아 보여줄 곳이 없다. 인스타는 흐르고, 사운드클라우드는 음원만, 웹사이트는 만들 줄 모른다 |
| **접근** | 템플릿을 고르고 칸을 채우면 포트폴리오 페이지가 되는 서비스 |
| **까다로운 지점** | 아티스트마다 보여줄 것이 다르다 — 누구는 앨범, 누구는 세션 이력, 누구는 영상. **가변적인 콘텐츠 구조를 어떻게 저장할 것인가** |
| **규모** | 백엔드 라우터 6개 · 테이블 20+ · 인증 경로 3개 · 프론트 React 18 + TS |
| **배포** | Docker Compose → Cloudtype · 2026.05까지 운영 후 중단 |

<div align="center">
<img src="docs/images/01-main.png" width="820" alt="메인 페이지"/>
<br><sub>메인 — 스포트라이트와 디스커버 카드는 관리자가 CMS에서 고른다</sub>
</div>

---

## 템플릿을 왜 둘로 나눴나

아티스트마다 보여줄 것이 다르다. 같은 틀에 넣으면 누군가는 항상 어색해진다.

<div align="center">
<table>
<tr>
<td width="50%"><img src="docs/images/02-template1.png" alt="템플릿 1"/></td>
<td width="50%"><img src="docs/images/03-template2.png" alt="템플릿 2"/></td>
</tr>
<tr>
<td align="center"><b>템플릿 1</b> — 세션 연주자<br><sub>참여 앨범과 음원 카드가 중심. 섭외를 받는 것이 목적이라 이력과 연락처가 위로 온다</sub></td>
<td align="center"><b>템플릿 2</b> — 미디어아트 작가<br><sub>이미지 갤러리가 본체. 전시 도큐멘테이션을 여러 장 묶어 보여준다</sub></td>
</tr>
</table>
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
#
# 백엔드를 다른 포트로 띄우려면 frontend/.env.local 에 VITE_API_URL 을 지정한다.
```

스키마 생성과 직업 카테고리 시드는 **Alembic 마이그레이션**이 담당한다. 컨테이너는 `alembic upgrade head`를 먼저 돌리고, 실패하면 서버를 띄우지 않는다.

```bash
cd backend && alembic upgrade head    # 직접 실행할 때
```

### 둘러보기용 계정

데모 데이터를 넣으면 아티스트 16명이 생긴다.

```bash
cd backend && ./.venv/bin/python -m scripts.seed_demo
```

비밀번호는 전부 `seihi1234!` 입니다.

| 이메일 | 역할 | 무엇을 볼 수 있나 |
|---|---|---|
| `admin@demo.example.com` | 관리자 | 가입 통계, 회원 관리, 메인 페이지 CMS(스포트라이트·디스커버) |
| `lee@demo.example.com` | 아티스트 · **템플릿 2** · PREMIUM | 이미지 섹션이 본체인 미디어아트 작가. 템플릿 2를 쓰는 이유 |
| `kang@demo.example.com` | 아티스트 · 템플릿 1 · STANDARD | 카드 6개로 꽉 찬 세션 연주자 프로필 |
| `yoon@demo.example.com` | 아티스트 · 템플릿 1 · **FREE** | 앨범 카드 3개로 한도가 꽉 찬 상태. 하나 더 추가하면 403 |
| `cho@demo.example.com` | 아티스트 · 템플릿 2 · FREE | 이름과 직업만 있는 빈 프로필 |
| `noh@demo.example.com` | 아티스트 · FREE | 가입만 하고 아무것도 안 쓴 상태 |

밀도를 일부러 다르게 뒀다. 전부 채워진 프로필만 있으면 빈 상태 화면을 볼 수 없고, 플랜 한도가 실제로 걸리는 장면도 만들 수 없다.

⚠️ 이 스크립트는 접속 호스트가 `localhost`/`127.0.0.1`일 때만 실행된다. 삭제 범위도 `@demo.example.com` 계정으로 한정한다.

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

**운영을 멈추고 정리한 것 (2026.09)**

운영하던 중 구조적으로 위험한 지점들이 드러나 서비스를 내리고 정리했다.

| 무엇이 문제였나 | 어떻게 고쳤나 |
|---|---|
| 서버가 뜰 때마다 운영 DB에 `ALTER TABLE`·FK 재생성·`DROP TYPE`이 실행됐다. 변경 이력도 롤백 수단도 없었다 | Alembic 도입. 마이그레이션이 실패하면 서버가 뜨지 않는다 |
| 그 결과 모델 정의와 운영 스키마가 어긋나, **빈 DB에서는 기동조차 되지 않았다.** 하나뿐인 운영 DB만 우연히 동작하고 있었다 | 드리프트를 판정해 모델에 반영. 빈 DB에서 재현 확인 |
| FK `ON DELETE CASCADE` 27개가 운영에만 있고 모델에는 없었다 | 모델에 명시. 없는 채로 새 환경을 만들면 사용자 삭제가 FK 위반으로 죽는다 |
| 회원가입이 이메일 인증을 확인하지 않아 `signup`을 직접 호출하면 미인증 주소로 가입됐다 | 인증 상태를 확인하고 소비. 5회 오입력 폐기, 재발송 쿨다운 |
| 구독 플랜이 아무 기능도 제한하지 않는 표시용 문자열이었다 | 앨범 카드 한도 연결 (FREE 3 / STANDARD 10 / PREMIUM 무제한) |
| 공개 목록이 템플릿 1만 조회해, 템플릿 2만 작성한 사용자는 영영 노출되지 않았다 | 두 경로가 같은 함수를 쓰도록 통합 |
| `profile.py` 898줄 중 약 600줄이 템플릿 1·2의 같은 코드였다 | 레지스트리로 통합. 271줄 + 서비스 531줄 |
| bcrypt가 async 엔드포인트에서 직접 호출돼 이벤트 루프를 막았다 | `to_thread`로 분리 |

**남은 것**
- 아티스트 공개 포트폴리오 페이지 (비로그인 접근)
- 장르별·직업별 아티스트 검색 — ③에서 정규화를 택한 이유가 여기서 쓰인다
- 결제 게이트웨이 실연동 (현재는 플랜 상태 관리와 권한 제한까지)
- 모바일 레이아웃 — 고정 픽셀 폭이 남아 있어 좁은 화면에서 넘친다

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

**이종하** · [GitHub](https://github.com/bell-ha) · [Portfolio](https://bell-ha.github.io)

</div>
