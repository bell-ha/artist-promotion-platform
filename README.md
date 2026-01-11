# 🎵 Artist Promotion Platform

아티스트 정보를 관리하고, 이미지를 업로드하여 CDN(Cloudinary)에 저장하는 **실서비스 구조의 풀스택 프로젝트**입니다.
Docker 기반으로 구성되어 있으며, 비동기 FastAPI + PostgreSQL + React(Vite)를 사용합니다.

---

## 📦 Tech Stack

### Backend

* **Python 3.11**
* **FastAPI**
* **SQLAlchemy (Async)**
* **asyncpg**
* **PostgreSQL (Neon DB)**
* **Cloudinary (이미지 업로드 & CDN)**
* **Uvicorn**
* **Docker**

### Frontend

* **React**
* **Vite**
* **Node.js 20**
* **Axios / Fetch**
* **Docker**

### Infra / DevOps

* **Docker Compose**
* **.env 환경변수 관리**
* **Cloudinary SaaS**
* **Neon Serverless PostgreSQL**

---

## 📁 Project Structure

```text
artist-promotion-platform/
├── docker-compose.yml
├── .env
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── cloudinary.py
│       └── models/
│           └── artist.py
│
└── frontend/
    ├── Dockerfile.dev
    ├── package.json
    └── src/
```

---

## ⚙️ Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://neondb_owner:비밀번호@ep-xxxx.neon.tech/neondb?sslmode=require

# Cloudinary
CLOUDINARY_CLOUD_NAME=dapo5jbz4
CLOUDINARY_API_KEY=xxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxx
```

> ⚠️ `.env` 파일은 **절대 Git에 커밋하지 않음**

---

## 🗄 Database Schema

### artists 테이블

```sql
CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  genre VARCHAR,
  country VARCHAR,
  image_url VARCHAR
);
```

---

## 🧠 Backend Architecture

### database.py

* Async SQLAlchemy 엔진 생성
* 세션 Dependency 제공 (`get_session`)

### cloudinary.py

* Cloudinary SDK 설정
* 이미지 업로드 함수 제공

### artist.py (Model)

* SQLAlchemy ORM 기반 Artist 모델
* `image_url` 컬럼 포함

---

## 🔌 API Endpoints

### GET /api/artists

아티스트 목록 조회

```json
[
  {
    "id": 1,
    "name": "Artist A",
    "genre": "Rock",
    "country": "KR",
    "image_url": "https://res.cloudinary.com/..."
  }
]
```

---

### POST /api/artists/{id}/image

아티스트 이미지 업로드

* **Request**

  * `multipart/form-data`
  * key: `file`

* **Flow**

  1. 파일 수신
  2. Cloudinary 업로드
  3. 업로드된 이미지 URL 반환
  4. DB `artists.image_url` 업데이트

* **Response**

```json
{
  "id": 1,
  "image_url": "https://res.cloudinary.com/..."
}
```

---

## 🐳 Docker Compose

```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## ▶️ How to Run

```bash
docker compose down
docker compose up --build
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:8000](http://localhost:8000)
* Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ✅ What Is Already Implemented

* [x] Async DB 연결 (Neon)
* [x] Artist CRUD 기반 구조
* [x] Cloudinary 이미지 업로드
* [x] 이미지 URL DB 저장
* [x] Docker 기반 로컬 실행
* [x] Swagger 테스트 완료

---

## 🚀 Next Possible Steps

* [ ] 프론트엔드 이미지 업로드 UI 연결
* [ ] 아티스트 생성 + 이미지 동시 업로드
* [ ] Cloudinary 이미지 교체 시 이전 이미지 삭제
* [ ] 인증 (JWT)
* [ ] 배포 (Cloudtype / Fly.io / Railway)

---

## 🧠 Notes for Future GPT / Developers

* **backend/app** 이 Python 패키지 루트
* `uvicorn app.main:app` 기준으로 실행
* Async SQLAlchemy + FastAPI Dependency 패턴 사용
* Cloudinary는 **백엔드에서만 접근**
* 프론트엔드는 이미지 파일만 서버로 전달
