# 🎵 Artist Promotion Platform: Full-Stack Project Archive

아티스트 정보를 관리하고, 이미지를 업로드하여 CDN(Cloudinary)에 저장하는 **비동기 실서비스 구조의 프로젝트**입니다. 본 가이드는 초기 설정부터 도커 연동, 발생했던 이슈 해결 과정까지 모두 기록합니다.

---

## 🏗️ Updated Project Structure

기존 구조에서 **SQLModel 기반의 비동기 DB 처리**와 **React-Router를 통한 페이지 라우팅**이 추가되었습니다.

```text
artist-promotion-platform/
├── docker-compose.yml       # 컨테이너 오케스트레이션 (Back/Front/DB 연결)
├── .env                     # Neon DB, Cloudinary 보안키 관리
│
├── backend/
│   ├── Dockerfile           # 운영/배포용 빌드 설정
│   ├── requirements.txt     # Python 의존성 (sqlmodel, cloudinary 등)
│   └── app/
│       ├── main.py          # CORS 설정 및 API 엔드포인트
│       ├── database.py      # SQLModel + AsyncSession 비동기 설정
│       ├── cloudinary.py    # 이미지 업로드 유틸리티
│       └── models/
│           ├── __init__.py  # 모델 통합 및 Base(SQLModel) 정의 (핵심 수정사항)
│           └── user.py      # User 및 UserRole 모델 (비동기 처리 최적화)
│
└── frontend/
    ├── Dockerfile.dev       # 개발용 도커 설정 (Hot-reload 지원)
    ├── package.json         # 라이브러리 명단 (react-router-dom, axios 추가됨)
    └── src/
        ├── main.jsx         # 스타일 및 라우터 엔트리 포인트
        ├── App.jsx          # Route 정의 (Main ↔ LoginPage)
        └── pages/
            ├── Main.jsx     # 아티스트 목록 조회 및 API 통신
            └── LoginPage.jsx # Axios 기반 로그인 처리

```

---

## 🛠️ 핵심 기술적 해결 기록 (Troubleshooting)

### 1. Backend: SQLModel 비동기 임포트 이슈

* **문제**: `ImportError: cannot import name 'Base' from 'app.database'` 발생.
* **원인**: 기존 SQLAlchemy의 `declarative_base()` 방식과 달리, **SQLModel**은 `SQLModel` 클래스 자체가 `Base` 역할을 수행함. `database.py`에 `Base`라는 명시적 객체가 없어 발생한 에러.
* **해결**: `models/__init__.py`에서 `Base = SQLModel`로 별칭을 지정하여 기존 코드와의 호환성을 유지하고, 비동기 엔진(`create_async_engine`)을 통해 Neon DB와 연결.

### 2. Frontend: 도커 환경의 라이브러리 부재 이슈

* **문제**: `Failed to resolve import "react-router-dom"` 발생.
* **원인**: 소스 코드에는 라이브러리를 사용하도록 적었으나, **`package.json` 명단에 누락**되어 도커 빌드 시 설치되지 않음. 도커의 볼륨 캐싱 때문에 코드만 바꾼다고 설치가 자동으로 되지 않는 특성 때문.
* **해결**:
1. `package.json`의 `dependencies`에 직접 라이브러리 명시.
2. `docker-compose up --build` 명령어를 통해 **도커 레이어 캐시를 무효화**하고 새로 `npm install`을 수행하도록 강제함.



---

## 🔗 로컬-서버 연동 메커니즘 (How it Works)

이번 프로젝트에서 가장 중요한 부분은 **내 컴퓨터와 도커 컨테이너 간의 실시간 동기화**입니다.

1. **개발 환경 (Development Flow)**:
* `volumes: - ./frontend:/app` 설정을 통해 내 Mac에서 코드를 수정하면 도커 컨테이너 안으로 즉시 반영됩니다.
* 단, 라이브러리(`node_modules`)는 컨테이너 내부 환경을 보호하기 위해 별도의 볼륨으로 격리하여 관리했습니다.


2. **네트워크 통신 (Network Flow)**:
* **Frontend → Backend**: 브라우저에서 실행되는 프론트엔드는 환경 변수 `VITE_API_URL`을 통해 도커 외부 포트(`8000`)로 백엔드 API에 요청을 보냅니다.
* **Backend → DB**: 백엔드는 `.env`에 정의된 `DATABASE_URL`을 통해 외부 클라우드 DB(Neon)에 비동기 쿼리를 보냅니다.
* **Backend → Cloudinary**: 사용자가 이미지를 업로드하면 백엔드가 이를 받아 Cloudinary 서버로 전송하고, 반환된 **Secure URL**만 DB에 저장합니다.



---

## 📝 최종 API 명세 및 상태

| 기능 | 엔드포인트 | 방식 | 상태 |
| --- | --- | --- | --- |
| **헬스 체크** | `/` | `GET` | ✅ 정상 |
| **아티스트 목록** | `/api/artists` | `GET` | ✅ DB 연동 완료 |
| **이미지 업로드** | `/api/artists/{id}/image` | `POST` | ✅ Cloudinary 저장 및 URL 업데이트 완료 |
| **CORS 허용** | `Middleware` | `ALL` | ✅ `allow_origins=["*"]` 설정 완료 |

---

## 🚀 향후 Cloudtype 배포 전략

이 프로젝트를 클라우드에 올릴 때 적용해야 할 핵심 설정입니다.

1. **환경 변수 주입**: Cloudtype 대시보드에서 `DATABASE_URL`, `CLOUDINARY_*` 변수를 입력합니다.
2. **CORS 보안 강화**: 배포 후 생성된 프론트엔드 도메인(예: `xxx.cloudtype.app`)을 백엔드 `main.py`의 `allow_origins` 리스트에 명시하여 보안을 강화합니다.
3. **Vite 환경 변수**: 배포용 빌드 시 `VITE_API_URL`이 실제 백엔드 배포 주소를 바라보도록 설정합니다.
