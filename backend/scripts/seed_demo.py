"""
데모 시드 — 페르소나 기반 더미 데이터

    cd backend
    set -a; . /tmp/seihi_test.env; set +a
    .venv_test/bin/python -m scripts.seed_demo

무엇을 넣는가
─────────────
아티스트 16명 + 관리자 1명. 랜덤 채우기가 아니라 사람마다 "이 서비스를 왜
쓰는가"가 다르고 그게 데이터 모양으로 드러나게 했습니다.

  · 세션 연주자   → 참여 앨범 이력이 길고 연락처가 완비돼 있다 (섭외를 받아야 하니까)
  · 싱어송라이터  → 사운드클라우드 자작곡이 주력, 곡 소개 텍스트가 길다
  · 믹싱 엔지니어 → 이미지보다 텍스트(장비·작업 방식)가 많다
  · 비주얼 아티스트 → 이미지 섹션이 핵심이라 템플릿 2를 쓴다
  · 시작한 학생   → 이름과 직업만 있다

이 편차가 요점입니다. 전부 꽉 찬 프로필만 있으면 빈 상태 UI를 못 보고
템플릿 1·2를 나눈 이유도 드러나지 않습니다.

로그인
──────
    비밀번호는 전원 동일: seihi1234!
    관리자: admin@demo.example.com

멱등성
──────
실행할 때마다 데모 계정(@demo.example.com)만 지우고 다시 넣습니다.
career_categories / career_items(기준정보)는 **건드리지 않습니다** —
그건 Alembic 마이그레이션이 관리합니다.

⚠️ scripts/seed_categories.py 가 왜 폐기됐는지 기억하십시오. 그 파일은
   DELETE FROM career_items 로 전 사용자의 직업 선택을 CASCADE로 날렸습니다.
   여기서는 삭제 대상을 데모 이메일 도메인으로만 한정하고, 아래 가드로
   운영 DB에서는 아예 실행되지 않게 막습니다.
"""

import asyncio
import os
import sys
from urllib.parse import urlsplit

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete, select, text  # noqa: E402

# ══════════════════════════════════════════════════════════════════
# 안전 가드 — 운영 DB에서는 절대 실행되지 않게
# ══════════════════════════════════════════════════════════════════
_URL = os.getenv("DATABASE_URL", "")
if not _URL:
    raise SystemExit("DATABASE_URL이 없습니다. set -a; . /tmp/seihi_test.env; set +a")

_HOST = urlsplit(_URL.replace("+asyncpg", "")).hostname or ""

# 블랙리스트가 아니라 화이트리스트입니다. 새 운영 호스트가 생겨도 자동으로 막힙니다.
_ALLOWED_HOSTS = {"localhost", "127.0.0.1", "::1"}
if _HOST not in _ALLOWED_HOSTS:
    raise SystemExit(
        f"이 스크립트는 로컬 DB에서만 실행할 수 있습니다. 현재 대상: {_HOST}\n"
        f"허용: {', '.join(sorted(_ALLOWED_HOSTS))}\n"
        "데모 데이터를 운영에 넣는 사고를 막기 위한 장치입니다."
    )
if "neon.tech" in _HOST:                       # 이중 안전장치
    raise SystemExit(f"운영(Neon) DB입니다. 중단합니다: {_HOST}")

from app.database import AsyncSessionLocal  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.models.user import User, UserRole, LoginProvider, SubscriptionPlan  # noqa: E402
from app.models.category import CareerItem, UserJob  # noqa: E402
from app.models.main_page import MainPageContent, DiscoverCard, SpotlightSetting  # noqa: E402
from app.models.template1 import (  # noqa: E402
    NameSection, NameSectionJob, AlbumSection,
    YoutubeCard, SoundcloudCard, ImageCard, NoImageCard,
    ContactSection, TextSection, TextCard, TextCardBodyItem,
)
from app.models.template2 import (  # noqa: E402
    T2NameSection, T2NameSectionJob, T2AlbumSection,
    T2YoutubeCard, T2SoundcloudCard, T2ImageCard, T2NoImageCard,
    T2ContactSection, T2TextSection, T2TextCard, T2TextCardBodyItem,
    T2ImageSection, T2ImageSectionImage,
)

DEMO_DOMAIN = "@demo.example.com"
DEMO_PASSWORD = "seihi1234!"

# 데모 계정의 user_id를 고정합니다.
# 자동 증가에 맡기면 스크립트를 돌릴 때마다 id가 바뀌어서 /artist/38 같은
# URL이 매번 다른 사람을 가리킵니다. README 스크린샷이나 시연 링크를
# 걸어두려면 id가 고정이어야 합니다.
# 실제 가입은 이 대역 뒤에서 이어지도록 마지막에 시퀀스를 밀어줍니다.
DEMO_ID_BASE = 9000


def img(slug: str, size: int = 800) -> str:
    """Cloudinary 업로드 없이 쓰는 공개 플레이스홀더. seed가 같으면 항상 같은 그림."""
    return f"https://picsum.photos/seed/seihi-{slug}/{size}/{size}"


# ══════════════════════════════════════════════════════════════════
# 페르소나
# ══════════════════════════════════════════════════════════════════
# density: full(꽉 참) / medium(절반) / minimal(이름·직업만) / empty(가입만)
# jobs: career_items.id — 마이그레이션 a7280831dc82 가 넣은 1~28

PERSONAS = [
    {
        "slug": "kang", "nickname": "강태훈", "name": "강태훈", "english_name": "Kang Taehun",
        "tpl": 1, "plan": "STANDARD", "density": "full",
        "jobs": [4, 9],  # 기타리스트 · 세션 연주자
        "tagline": "Session Guitarist",
        "desc1": "10년간 400곡이 넘는 세션에 참여했습니다. 발라드부터 시티팝까지 장르를 가리지 않습니다.",
        "desc2": "레코딩 세션과 라이브 서포트 모두 가능합니다. 스케줄은 메일로 문의 주세요.",
        # 세션 연주자는 "참여 이력"이 곧 이력서라 카드가 많고 연락처가 완비돼 있다
        "youtube": [
            ("2023 서울재즈페스티벌 라이브", "Main Stage", "김하늘 정규 2집", 2023),
            ("스튜디오 세션 - 새벽 세 시", "Recording", "이서준 싱글", 2022),
            ("기타 톤 메이킹 과정", "Studio Log", None, 2024),
        ],
        "soundcloud": [("Blue Hour (Guitar Stem)", "Stem", "데모", 2024)],
        "image_cards": [("함께한 앨범들", "Discography", "모음", 2024)],
        "no_image": [("Session Reel 2024", "Reel", None, 2024)],
        "texts": [
            ("참여 앨범", "최근 3년간 참여한 정규·미니 앨범입니다.", [
                ("김하늘 정규 2집 「밤의 결」", "전곡 일렉기타 세션", [
                    ("Role", "Electric Guitar / Arrangement"), ("Year", "2023")]),
                ("이서준 싱글 「새벽 세 시」", "어쿠스틱 · 일렉 기타", [
                    ("Role", "All Guitars"), ("Year", "2022")]),
                ("프로젝트 그룹 소요 EP", "기타 및 편곡 참여", [("Role", "Guitar / Arrangement")]),
            ]),
            ("장비", "세션에 들고 다니는 장비입니다.", [
                ("Guitars", "Fender Custom Shop 60s Strat / Gibson ES-335", []),
                ("Amps", "Two-Rock Studio Signature / Fender Deluxe Reverb", []),
            ]),
        ],
        "contact": {"phone1": "010-2201-8834", "email1": "taehun.session@demo.example.com",
                    "email2": "booking.kang@demo.example.com",
                    "instagram_url": "https://instagram.com/taehun.gtr",
                    "youtube_url": "https://youtube.com/@taehunsession",
                    "extra_description": "섭외 문의는 메일이 가장 빠릅니다. 평일 기준 하루 안에 회신드립니다."},
    },
    {
        "slug": "yoon", "nickname": "윤소미", "name": "윤소미", "english_name": "Yoon Somi",
        "tpl": 1, "plan": "FREE", "density": "full",
        "jobs": [1, 2, 15],  # 보컬 · 인디 싱어송라이터 · 탑라이너
        "tagline": "Singer-Songwriter",
        "desc1": "직접 쓰고 부릅니다. 방 안에서 만든 소리를 그대로 남기는 걸 좋아합니다.",
        "desc2": "2024년 첫 EP 「관성」을 냈습니다.",
        # ⚠️ FREE 플랜 한도(3개)를 정확히 채운 사용자. 한 장 더 올리면 403이 난다.
        "soundcloud": [
            ("관성", "Title", "EP 「관성」", 2024),
            ("겨울의 방식", "Track 2", "EP 「관성」", 2024),
            ("두 번째 여름", "Single", None, 2023),
        ],
        "texts": [
            ("곡 소개", "직접 쓴 곡에 대한 이야기입니다.", [
                ("관성", "관성이라는 단어를 오래 붙들고 있었습니다. 멈추지 못하는 것과 멈추지 않는 것은 다르다는 이야기를 하고 싶었습니다.",
                 [("작사·작곡", "윤소미"), ("편곡", "윤소미 · 박정우"), ("발매", "2024.03")]),
                ("겨울의 방식", "추운 계절을 견디는 각자의 방식에 대한 곡입니다. 기타 한 대와 목소리만으로 녹음했습니다.",
                 [("작사·작곡", "윤소미"), ("발매", "2024.03")]),
            ]),
        ],
        "contact": {"email1": "somi.songs@demo.example.com",
                    "instagram_url": "https://instagram.com/somi.songs",
                    "extra_description": "공연 문의 환영합니다."},
    },
    {
        "slug": "park", "nickname": "박정우", "name": "박정우", "english_name": "Park Jungwoo",
        "tpl": 1, "plan": "STANDARD", "density": "full",
        "jobs": [20, 19],  # 믹싱/마스터링 · 레코딩
        "tagline": "Mixing & Mastering Engineer",
        "desc1": "작은 방에서 시작해 지금은 홍대에 작업실을 두고 있습니다.",
        "desc2": "인디 밴드와 싱어송라이터 작업을 주로 합니다.",
        # 엔지니어는 보여줄 "그림"이 적고 설명할 "과정"이 많다 → 텍스트 위주
        "no_image": [("Mix Before / After 모음", "Reference", None, 2024),
                     ("2023 작업물 하이라이트", "Showreel", None, 2023)],
        "texts": [
            ("작업 방식", "의뢰 전에 읽어보시면 좋습니다.", [
                ("1차 믹스까지", "스템을 받은 뒤 3일 안에 1차 믹스를 보내드립니다. 레퍼런스 트랙을 함께 주시면 방향을 잡기 훨씬 수월합니다.",
                 [("소요", "3일"), ("수정", "2회 포함")]),
                ("마스터링", "믹스가 확정되면 마스터링을 진행합니다. 스트리밍 라우드니스 기준을 맞춰 드립니다.",
                 [("포맷", "WAV 24bit / 44.1kHz"), ("추가", "스트리밍용 · CD용 별도 산출")]),
            ]),
            ("장비", "메인 체인입니다.", [
                ("Monitoring", "Focal Trio6 Be / Genelec 8331A", []),
                ("Converter", "Antelope Orion 32+", []),
                ("Outboard", "API 2500 / Manley Massive Passive", []),
            ]),
            ("참여 작업", "최근 작업한 앨범입니다.", [
                ("윤소미 EP 「관성」", "믹싱 · 마스터링", [("Year", "2024")]),
                ("소요 EP", "믹싱", [("Year", "2023")]),
            ]),
        ],
        "contact": {"phone1": "010-3388-1092", "email1": "jungwoo.mix@demo.example.com",
                    "instagram_url": "https://instagram.com/jw.mixing",
                    "extra_description": "견적은 곡 수와 스템 개수에 따라 달라집니다. 편하게 문의 주세요."},
    },
    {
        "slug": "lee", "nickname": "이하린", "name": "이하린", "english_name": "Lee Harin",
        "tpl": 2, "plan": "PREMIUM", "density": "full",
        "jobs": [25, 27],  # 미디어아트 작가 · 설치미술가
        "tagline": "Media Artist",
        "activity_area": "서울 · 베를린",
        "desc1": "소리와 빛을 같은 재료로 다룹니다. 공간에 들어온 사람의 움직임이 작품의 일부가 됩니다.",
        "desc2": "2024년 베를린 레지던시에 참여했습니다.",
        # 템플릿 2를 쓰는 이유가 여기 있다 — 이미지 섹션이 포트폴리오의 본체
        "image_sections": [
            ("Resonance Field (2024)", "관람객의 위치에 따라 스피커 배열이 실시간으로 반응하는 설치 작업입니다.",
             ["harin-rf-1", "harin-rf-2", "harin-rf-3", "harin-rf-4"]),
            ("Still Noise (2023)", "정지한 화면과 움직이는 소리를 병치한 6채널 사운드 설치입니다.",
             ["harin-sn-1", "harin-sn-2", "harin-sn-3"]),
        ],
        "youtube": [("Resonance Field 도큐멘테이션", "Documentation", None, 2024)],
        "image_cards": [("Still Noise 전시 전경", "Installation View", None, 2023)],
        "texts": [
            ("전시", "최근 참여한 전시입니다.", [
                ("Resonance Field", "아르코미술관 개인전", [("Year", "2024"), ("Place", "서울")]),
                ("Still Noise", "베를린 Kunstraum 그룹전", [("Year", "2023"), ("Place", "베를린")]),
            ]),
        ],
        "contact": {"email1": "harin.studio@demo.example.com",
                    "instagram_url": "https://instagram.com/harin.media",
                    "extra_description": "전시 및 협업 제안은 메일로 부탁드립니다."},
    },
    {
        "slug": "choi", "nickname": "최민석", "name": "최민석", "english_name": "Choi Minseok",
        "tpl": 1, "plan": "PREMIUM", "density": "full",
        "jobs": [12, 16],  # 게임음악 작곡가 · 사운드 디자이너
        "tagline": "Game Composer / Sound Designer",
        "desc1": "인디 게임 사운드를 만듭니다. 음악과 효과음을 같이 설계하는 편이 결과가 좋습니다.",
        "desc2": "미들웨어(Wwise/FMOD) 구현까지 직접 합니다.",
        "youtube": [("「해무」 OST 전곡 플레이스루", "OST", "해무 OST", 2024),
                    ("적응형 음악 구현 데모", "Technical", None, 2023)],
        "soundcloud": [("해무 - 메인 테마", "Theme", "해무 OST", 2024),
                       ("해무 - 추격", "Battle", "해무 OST", 2024)],
        "no_image": [("효과음 팩 샘플", "SFX", None, 2023)],
        "texts": [
            ("참여 게임", "출시된 작품입니다.", [
                ("해무 (2024)", "음악 · 사운드 디자인 · Wwise 구현", [("Platform", "PC / Switch")]),
                ("리버스 로드 (2022)", "음악", [("Platform", "PC")]),
            ]),
            ("작업 범위", "어디까지 맡을 수 있는지 적어둡니다.", [
                ("음악", "테마 · 상황별 적응형 트랙", []),
                ("사운드 디자인", "UI · 환경음 · 캐릭터", []),
                ("구현", "Wwise / FMOD 연동 및 파라미터 설계", []),
            ]),
        ],
        "contact": {"email1": "minseok.game@demo.example.com",
                    "youtube_url": "https://youtube.com/@minseokgame",
                    "extra_description": "포트폴리오 전체는 메일로 요청 주시면 보내드립니다."},
    },
    {
        "slug": "han", "nickname": "한서윤", "name": "한서윤", "english_name": "Han Seoyun",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [3, 1], "tagline": "Musical Actor / Vocalist",
        "desc1": "무대에서 노래하는 사람입니다.",
        "youtube": [("「빛의 자리」 넘버 - 한 걸음", "Musical", None, 2024)],
        "texts": [("출연작", "", [("「빛의 자리」", "앙상블 · 커버", [("Year", "2024")])])],
        "contact": {"email1": "seoyun.stage@demo.example.com"},
    },
    {
        "slug": "jung", "nickname": "정도현", "name": "정도현", "english_name": "Jung Dohyun",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [6, 9], "tagline": "Drummer",
        "desc1": "밴드와 세션을 병행합니다. 그루브를 우선합니다.",
        "youtube": [("드럼 커버 - 회전목마", "Cover", None, 2024)],
        "no_image": [("연습실 세션 녹음", "Session", None, 2023)],
        "contact": {"phone1": "010-7745-2210", "email1": "dohyun.drums@demo.example.com"},
    },
    {
        "slug": "oh", "nickname": "오지민", "name": "오지민", "english_name": "Oh Jimin",
        "tpl": 2, "plan": "STANDARD", "density": "medium",
        "jobs": [14, 10], "tagline": "Beatmaker / Producer",
        "activity_area": "서울",
        "desc1": "샘플을 뒤지는 시간이 제일 깁니다. 힙합과 R&B 트랙을 만듭니다.",
        "soundcloud": [("Type Beat - Velvet", "Beat", None, 2024),
                       ("Type Beat - Rainy", "Beat", None, 2024)],
        "image_sections": [("아트워크", "직접 만든 커버 이미지입니다.",
                            ["jimin-art-1", "jimin-art-2", "jimin-art-3"])],
        "contact": {"email1": "jimin.beats@demo.example.com",
                    "instagram_url": "https://instagram.com/jimin.beats"},
    },
    {
        "slug": "shin", "nickname": "신유진", "name": "신유진", "english_name": "Shin Yujin",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [17, 16], "tagline": "Foley Artist",
        "desc1": "발소리부터 옷깃 소리까지, 화면에 없는 소리를 만듭니다.",
        "no_image": [("폴리 작업 릴", "Reel", None, 2024)],
        "texts": [("작업 목록", "", [("독립영화 「무른 땅」", "폴리 전반", [("Year", "2024")])])],
        "contact": {"email1": "yujin.foley@demo.example.com"},
    },
    {
        "slug": "bae", "nickname": "배현우", "name": "배현우", "english_name": "Bae Hyunwoo",
        "tpl": 2, "plan": "FREE", "density": "medium",
        "jobs": [24, 18], "tagline": "Audio Programmer",
        "activity_area": "성남",
        "desc1": "인터랙티브 오디오를 코드로 만듭니다. 웹오디오와 게임 미들웨어를 다룹니다.",
        "youtube": [("웹오디오 인터랙션 데모", "Demo", None, 2024)],
        "texts": [("기술", "", [("Web Audio API", "브라우저 기반 인터랙티브 사운드", []),
                              ("Wwise / FMOD", "게임 오디오 미들웨어 연동", [])])],
        "contact": {"email1": "hyunwoo.audio@demo.example.com"},
    },
    {
        "slug": "moon", "nickname": "문가영", "name": "문가영", "english_name": "Moon Gayoung",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [5, 8], "tagline": "Pianist",
        "desc1": "클래식을 전공했고 지금은 세션과 반주를 함께 합니다.",
        "youtube": [("쇼팽 발라드 4번", "Classical", None, 2023)],
        "contact": {"email1": "gayoung.piano@demo.example.com"},
    },
    {
        "slug": "im", "nickname": "임재현", "name": "임재현", "english_name": "Im Jaehyun",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [21, 22], "tagline": "Live PA Engineer",
        "desc1": "공연장 음향을 맡습니다. 작은 클럽부터 야외 페스티벌까지.",
        "texts": [("현장", "", [("2024 한강 뮤직페스타", "메인 스테이지 FOH", [("Year", "2024")])])],
        "contact": {"phone1": "010-9912-3355", "email1": "jaehyun.pa@demo.example.com"},
    },
    {
        "slug": "seo", "nickname": "서나은", "name": "서나은", "english_name": "Seo Naeun",
        "tpl": 2, "plan": "STANDARD", "density": "medium",
        "jobs": [11, 13], "tagline": "Film & Ad Composer",
        "activity_area": "서울",
        "desc1": "장면에 맞는 음악을 씁니다. 짧은 광고 음악도 좋아합니다.",
        "youtube": [("단편영화 「여름 끝」 스코어", "Score", None, 2024)],
        "image_sections": [("작업 현장", "녹음 세션 기록입니다.",
                            ["naeun-1", "naeun-2"])],
        "contact": {"email1": "naeun.score@demo.example.com"},
    },
    {
        "slug": "jo", "nickname": "조은결", "name": "조은결", "english_name": "Jo Eungyeol",
        "tpl": 2, "plan": "FREE", "density": "minimal",
        "jobs": [28, 26], "tagline": "Technical Director",
        "activity_area": "인천",
    },
    {
        "slug": "hwang", "nickname": "황시우", "name": "황시우", "english_name": "Hwang Siwoo",
        "tpl": 1, "plan": "FREE", "density": "minimal",
        "jobs": [7], "tagline": "Bassist",
    },
    {
        "slug": "noh", "nickname": "노아린", "name": None, "english_name": None,
        "tpl": 1, "plan": "FREE", "density": "empty",
        "jobs": [23, 18],
    },
]


# ══════════════════════════════════════════════════════════════════
# 템플릿별 모델 묶음 — services/portfolio.py 의 TEMPLATES 와 같은 발상
# ══════════════════════════════════════════════════════════════════

T = {
    1: dict(ns=NameSection, job=NameSectionJob, alb=AlbumSection,
            yt=YoutubeCard, sc=SoundcloudCard, ic=ImageCard, ni=NoImageCard,
            ct=ContactSection, ts=TextSection, tc=TextCard, bi=TextCardBodyItem,
            isec=None, iimg=None),
    2: dict(ns=T2NameSection, job=T2NameSectionJob, alb=T2AlbumSection,
            yt=T2YoutubeCard, sc=T2SoundcloudCard, ic=T2ImageCard, ni=T2NoImageCard,
            ct=T2ContactSection, ts=T2TextSection, tc=T2TextCard, bi=T2TextCardBodyItem,
            isec=T2ImageSection, iimg=T2ImageSectionImage),
}

CONTACT_FIELDS = ("phone1", "phone2", "email1", "email2", "email3",
                  "instagram_url", "tiktok_url", "youtube_url", "extra_description")


async def build_person(session, p, password_hash):
    """페르소나 하나를 DB에 넣는다."""
    m = T[p["tpl"]]

    user = User(
        id=p["user_id"],
        email=f'{p["slug"]}{DEMO_DOMAIN}',
        nickname=p["nickname"],
        password=password_hash,
        provider=LoginProvider.LOCAL,
        role=UserRole.USER,
        is_active=True,
        active_template=p["tpl"],
        subscription_plan=SubscriptionPlan[p["plan"]],
        profile_image=img(p["slug"], 300),
    )
    session.add(user)
    await session.flush()

    # 직업은 밀도와 무관하게 모두 넣는다 — 카테고리 목록에서 검색되려면 필요하다.
    # (user_jobs 와 name_section_jobs 둘 다 채운다: 전자는 사용자 속성,
    #  후자는 공개 프로필이 조인하는 쪽이다)
    for jid in p["jobs"]:
        session.add(UserJob(user_id=user.id, career_item_id=jid))

    if p["density"] == "empty":
        return user   # 가입만 하고 아무것도 안 쓴 사용자

    ns_kwargs = dict(
        user_id=user.id,
        name=p.get("name"), english_name=p.get("english_name"),
        tagline=p.get("tagline"),
        description1=p.get("desc1"), description2=p.get("desc2"),
        thumbnail_url=img(p["slug"]),
    )
    if p["tpl"] == 2:
        ns_kwargs["activity_area"] = p.get("activity_area")
    ns = m["ns"](**ns_kwargs)
    session.add(ns)
    await session.flush()
    for jid in p["jobs"]:
        session.add(m["job"](name_section_id=ns.id, career_item_id=jid))

    if p["density"] == "minimal":
        return user   # 이름과 직업만 있는 사용자

    # ── 앨범 섹션 ──
    cards = (p.get("youtube") or []) + (p.get("soundcloud") or []) + \
            (p.get("image_cards") or []) + (p.get("no_image") or [])
    if cards:
        alb = m["alb"](user_id=user.id)
        session.add(alb)
        await session.flush()

        def common(t, i, extra=None):
            title, cat, album, year = t
            d = dict(album_section_id=alb.id, order=i, project_title=title,
                     category_desc=cat, album_name=album, year=year,
                     composer=p.get("name"), description=None)
            d.update(extra or {})
            return d

        for i, t in enumerate(p.get("youtube") or []):
            session.add(m["yt"](**common(t, i, {"link": f'https://youtu.be/demo-{p["slug"]}-{i}'})))
        for i, t in enumerate(p.get("soundcloud") or []):
            session.add(m["sc"](**common(t, i, {"link": f'https://soundcloud.com/demo/{p["slug"]}-{i}'})))
        for i, t in enumerate(p.get("image_cards") or []):
            session.add(m["ic"](**common(t, i, {"image_url": img(f'{p["slug"]}-card{i}', 600),
                                                "hyperlink": None})))
        for i, t in enumerate(p.get("no_image") or []):
            session.add(m["ni"](**common(t, i, {"mp3_url": f'https://example.invalid/{p["slug"]}-{i}.mp3'})))

    # ── 텍스트 섹션 ──
    for si, (title, desc, items) in enumerate(p.get("texts") or []):
        ts = m["ts"](user_id=user.id, order=si, title=title, description=desc)
        session.add(ts)
        await session.flush()
        for ci, (ct_title, ct_detail, bodies) in enumerate(items):
            tc = m["tc"](text_section_id=ts.id, order=ci, title=ct_title, detail=ct_detail)
            session.add(tc)
            await session.flush()
            for bi_, (b_title, b_content) in enumerate(bodies):
                session.add(m["bi"](text_card_id=tc.id, order=bi_,
                                    title=b_title, content=b_content))

    # ── 이미지 섹션 (템플릿 2 전용) ──
    for si, (title, desc, slugs) in enumerate(p.get("image_sections") or []):
        isec = m["isec"](user_id=user.id, order=si, title=title, description=desc)
        session.add(isec)
        await session.flush()
        for ii, s in enumerate(slugs[:4]):        # 저장 API와 같은 4개 제한
            session.add(m["iimg"](image_section_id=isec.id, order=ii, image_url=img(s, 900)))

    # ── 연락처 ──
    if p.get("contact"):
        session.add(m["ct"](user_id=user.id,
                            **{f: p["contact"].get(f) for f in CONTACT_FIELDS}))

    return user


for _i, _p in enumerate(PERSONAS, start=1):
    _p["user_id"] = DEMO_ID_BASE + _i


async def main():
    print(f"대상 DB: {_HOST}  (데모 전용)")
    password_hash = get_password_hash(DEMO_PASSWORD)   # 한 번만 해싱해서 재사용

    async with AsyncSessionLocal() as session:
        # ── 기존 데모 데이터만 삭제 ──
        # users를 지우면 t1_*/t2_*/user_jobs 는 ON DELETE CASCADE 로 함께 사라지고,
        # discover_cards/spotlight_settings 의 artist_id 는 SET NULL 이 된다.
        # career_categories / career_items 는 건드리지 않는다.
        old = (await session.execute(
            select(User).where(User.email.like(f"%{DEMO_DOMAIN}"))
        )).scalars().all()
        if old:
            for u in old:
                await session.delete(u)
            await session.commit()
        print(f"기존 데모 계정 {len(old)}개 삭제")

        # ── 아티스트 ──
        made = {}
        for p in PERSONAS:
            u = await build_person(session, p, password_hash)
            made[p["slug"]] = u
        await session.commit()
        print(f"아티스트 {len(PERSONAS)}명 생성")

        # ── 관리자 ──
        session.add(User(
            id=DEMO_ID_BASE + len(PERSONAS) + 1,
            email=f"admin{DEMO_DOMAIN}", nickname="관리자",
            password=password_hash, provider=LoginProvider.LOCAL,
            role=UserRole.ADMIN, is_active=True, active_template=1,
            subscription_plan=SubscriptionPlan.PREMIUM,
        ))
        await session.commit()
        print("관리자 1명 생성")

        # 명시 id로 넣었으므로 시퀀스를 끝으로 민다.
        # 안 하면 이후 실제 회원가입이 id 중복으로 실패한다.
        await session.execute(text(
            "SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))"))
        await session.commit()

        # ── 메인 페이지 CMS ──
        content = (await session.execute(
            select(MainPageContent).where(MainPageContent.id == 1)
        )).scalar_one_or_none()
        if not content:
            content = MainPageContent(id=1)
            session.add(content)
        content.hero_bg1_url = img("hero-1", 1600)
        content.hero_bg2_url = img("hero-2", 1600)

        sp = (await session.execute(
            select(SpotlightSetting).where(SpotlightSetting.id == 1)
        )).scalar_one_or_none()
        if not sp:
            sp = SpotlightSetting(id=1)
            session.add(sp)
        sp.subtitle = "이번 달 가장 주목할 사운드 컬렉션"
        sp.artist_id = made["lee"].id            # 미디어아트 작가 이하린
        sp.title = "Resonance Field"
        sp.artist_name = "이하린"
        sp.genre = "Media Art / Sound Installation"
        sp.image_url = img("harin-rf-1", 1200)

        await session.execute(delete(DiscoverCard))
        for i, slug in enumerate(["kang", "yoon", "park", "choi", "oh", "seo"]):
            session.add(DiscoverCard(slot_order=i, artist_id=made[slug].id,
                                     image_url=img(slug, 600)))
        await session.commit()
        print("메인 페이지 CMS 설정 (스포트라이트 1 · 디스커버 카드 6)")

        # ── 요약 ──
        print("\n" + "─" * 62)
        n_users = (await session.execute(text("SELECT count(*) FROM users"))).scalar()
        n_t2 = (await session.execute(text("SELECT count(*) FROM users WHERE active_template=2"))).scalar()
        n_jobs = (await session.execute(text("SELECT count(*) FROM user_jobs"))).scalar()
        print(f"사용자 {n_users}명 (템플릿2 {n_t2}명) · 직업 연결 {n_jobs}건")
        for plan in ("FREE", "STANDARD", "PREMIUM"):
            c = (await session.execute(text(
                "SELECT count(*) FROM users WHERE subscription_plan::text = :p"), {"p": plan})).scalar()
            print(f"  {plan:9s} {c}명")
        print("\n고정 id (README/시연 링크용):")
        for _p in PERSONAS:
            print(f"  /artist/{_p['user_id']}  {_p['nickname']}  (템플릿 {_p['tpl']}, {_p['density']})")
        print(f"\n로그인: 아무 계정 / 비밀번호 {DEMO_PASSWORD}")
        print(f"관리자: admin{DEMO_DOMAIN}")


if __name__ == "__main__":
    asyncio.run(main())
