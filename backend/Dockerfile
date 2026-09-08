# 1. Python 경량 이미지
FROM python:3.11-slim

# 2. Python 환경 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. 작업 디렉토리
WORKDIR /app

# 4. 시스템 패키지 (PostgreSQL, SSL)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. 소스 복사
COPY app /app/app
COPY scripts /app/scripts
# 마이그레이션 — 이 두 줄이 없으면 컨테이너 안에 alembic이 없어서
# 아래 CMD의 `alembic upgrade head`가 그대로 실패합니다.
COPY alembic /app/alembic
COPY alembic.ini /app/alembic.ini

# 7. 포트
EXPOSE 8000

# 8. 마이그레이션 적용 후 서버 실행
#
# 스키마는 앱이 아니라 이 단계에서 만들어집니다(예전에는 기동 시 create_all이
# 했습니다). 마이그레이션이 실패하면 && 뒤가 실행되지 않으므로, 스키마가
# 어긋난 채로 서버가 뜨는 일은 없습니다.
#
# ALEMBIC_ALLOW_REMOTE=1 은 alembic/env.py의 원격 DB 차단을 푸는 플래그입니다.
# 운영 DB(Neon)는 원격이므로 배포 시에는 반드시 필요합니다. 실수로 로컬에서
# 운영에 거는 것을 막으려고 기본값을 차단으로 두고, 배포 설정에서만
# 명시적으로 허용합니다.
#
# ⚠️ 인스턴스를 2개 이상으로 늘리면 컨테이너들이 동시에 upgrade를 실행합니다.
#    그때는 이 줄에서 마이그레이션을 떼어 배포 전 별도 잡으로 분리하거나
#    pg_advisory_lock으로 감싸야 합니다. 현재는 단일 인스턴스라 이대로 둡니다.
CMD ["sh", "-c", "ALEMBIC_ALLOW_REMOTE=1 alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
