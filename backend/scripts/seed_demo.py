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

# 데모 카드가 실제로 재생되도록 쓰는 공개 영상 (저장소 소유자가 지정)
DEMO_YOUTUBE_URL = "https://youtu.be/9XcBXUVszUQ"
DEMO_SOUNDCLOUD_URL = "https://soundcloud.com/walter-morales-music/rachmaninoff-piano-concerto-no"
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
    # ── 강태훈 · 세션 기타리스트 ─────────────────────────────────
    # 목소리: 섭외를 받는 입장이라 "무엇을 어떤 조건으로 할 수 있는가"를
    #         먼저 적는다. 담백하고 실무적.
    {
        "slug": "kang", "nickname": "강태훈", "name": "강태훈", "english_name": "Kang Taehun",
        "tpl": 1, "plan": "STANDARD", "density": "full",
        "jobs": [4, 9],
        "tagline": "세션 기타 — 레코딩과 라이브",
        "desc1": "레코딩 세션에서 기타를 칩니다. 발라드와 시티팝 의뢰가 가장 많고, 최근에는 재즈 편성에도 종종 불려 갑니다.",
        "desc2": "곡을 먼저 듣고 어떤 톤이 필요한지 정한 다음 장비를 고릅니다.\n"
                 "스튜디오 세션과 원격 녹음 모두 합니다. 원격은 DI와 앰프 시뮬레이션을 함께 보내드리고, "
                 "나중에 리앰핑하실 수 있게 소스를 따로 남겨 둡니다.",
        "youtube": [
            {"title": "김하늘 정규 2집 「밤의 결」", "sub": "전곡 기타 세션",
             "album": "밤의 결", "cat": "Recording Session · Electric & Acoustic", "year": 2023,
             "desc": "아홉 곡 전부에 기타로 참여했습니다. 프로듀서가 겨울 새벽 같은 소리를 원해서 "
                     "리버브를 거의 걸지 않고 앰프 잔향만으로 공간을 만들었습니다. 3번 트랙 솔로는 원 테이크입니다."},
            {"title": "2023 서울재즈페스티벌", "sub": "메인 스테이지 서포트",
             "album": "3인조 편성 라이브", "cat": "Live Support", "year": 2023,
             "desc": "3인조 편성에서 기타를 맡았습니다. 야외라 앰프 없이 라인으로 갔고, "
                     "페달보드만으로 톤을 잡아야 해서 리허설 때 세팅을 세 번 갈아엎었습니다."},
        ],
        "soundcloud": [
            {"title": "「새벽 세 시」 기타 스템", "sub": "이서준 싱글",
             "album": "새벽 세 시", "cat": "Session · Guitar Stem", "year": 2022,
             "desc": "어쿠스틱 두 대와 일렉 한 대를 겹쳤습니다. 노래가 조용해서 피크 소리가 남지 않게 손가락으로 쳤습니다."},
        ],
        "image_cards": [
            {"title": "참여 앨범", "sub": "2021 – 2024",
             "album": "참여 앨범 모음", "cat": "Selected Works", "year": 2024,
             "desc": "정규 4장, 미니 7장, 싱글 30여 곡에 참여했습니다. 주요 작업은 아래 목록에 적어 두었습니다."},
        ],
        "no_image": [
            {"title": "세션 릴", "sub": "2024년 정리본",
             "album": "세션 릴 2024", "cat": "Demo Reel", "year": 2024,
             "desc": "장르별로 30초씩 이어 붙였습니다. 발라드, 시티팝, 펑크, 재즈 순서입니다."},
        ],
        "texts": [
            ("참여 앨범", "최근 3년간 참여한 작업입니다. 전체 목록은 메일로 요청 주시면 보내드립니다.", [
                ("김하늘 정규 2집 「밤의 결」",
                 "전곡 일렉·어쿠스틱 기타. 편곡 회의부터 참여했습니다.",
                 [("역할", "Electric / Acoustic Guitar, Arrangement"),
                  ("발매", "2023.09"), ("비고", "3·5·7번 트랙 솔로")]),
                ("이서준 싱글 「새벽 세 시」",
                 "어쿠스틱 기타 위주. 데모 단계에서 코드 진행을 같이 다듬었습니다.",
                 [("역할", "All Guitars"), ("발매", "2022.11")]),
                ("프로젝트 그룹 소요 EP 「같은 자리」",
                 "네 곡 중 세 곡에 참여했고 그중 두 곡은 편곡도 맡았습니다.",
                 [("역할", "Guitar, Arrangement"), ("발매", "2023.04")]),
            ]),
            ("장비", "세션에 들고 가는 것들입니다. 스튜디오에 있는 장비를 쓰는 편이 나을 때는 그렇게 합니다.", [
                ("기타", "곡에 따라 고릅니다. 대부분 첫 번째나 두 번째로 해결됩니다.",
                 [("Electric", "Fender Custom Shop 60s Stratocaster"),
                  ("Semi-hollow", "Gibson ES-335"), ("Acoustic", "Martin D-18")]),
                ("앰프 · 이펙터", "라인 녹음일 때는 앰프 캡처 프로파일을 씁니다.",
                 [("Amp", "Two-Rock Studio Signature / Fender Deluxe Reverb"),
                  ("Pedals", "Klon Centaur, Strymon Timeline, Analog Man Chorus")]),
            ]),
            ("작업 방식", "", [
                ("스튜디오 세션", "서울 기준으로 이동합니다. 반나절(4시간) 단위로 잡습니다.",
                 [("준비물", "가이드 음원과 코드 시트, 또는 참고 트랙")]),
                ("원격 녹음", "24bit / 48kHz WAV로 보내드립니다. 수정은 두 번까지 포함입니다.",
                 [("전달", "DI + 앰프 시뮬 2벌"), ("소요", "의뢰 후 3일 이내")]),
            ]),
        ],
        "contact": {"phone1": "010-2201-8834", "email1": "taehun.session@demo.example.com",
                    "email2": "booking.kang@demo.example.com",
                    "instagram_url": "https://instagram.com/taehun.gtr",
                    "youtube_url": "https://youtube.com/@taehunsession",
                    "extra_description": "섭외 문의는 메일이 가장 빠릅니다. 평일 기준 하루 안에 회신드립니다. "
                                         "이미 일정이 잡힌 날짜는 인스타그램에 올려 둡니다."},
    },

    # ── 윤소미 · 싱어송라이터 ────────────────────────────────────
    # 목소리: 곡을 만든 사람의 개인적인 어조. 조용하고 짧은 문장.
    # FREE 한도(3개)를 정확히 채운 계정.
    {
        "slug": "yoon", "nickname": "윤소미", "name": "윤소미", "english_name": "Yoon Somi",
        "tpl": 1, "plan": "FREE", "density": "full",
        "jobs": [1, 2, 15],
        "tagline": "노래를 쓰고 부릅니다",
        "desc1": "방에서 만든 소리를 그대로 두는 걸 좋아합니다. 기타 한 대와 목소리로 시작해서 꼭 필요한 것만 더합니다.",
        "desc2": "2024년 3월에 첫 EP 「관성」을 냈습니다.\n"
                 "공연은 작은 자리를 좋아합니다. 50석 아래면 마이크 없이도 합니다.",
        "soundcloud": [
            {"title": "관성", "sub": "EP 「관성」 타이틀",
             "album": "관성", "cat": "Title Track", "year": 2024,
             "desc": "관성이라는 말을 오래 붙들고 있었습니다. 멈추지 못하는 것과 멈추지 않는 것은 다르다는 "
                     "이야기를 하고 싶었습니다. 2절에서 드럼이 빠지는 부분이 이 곡의 전부입니다."},
            {"title": "겨울의 방식", "sub": "EP 수록곡",
             "album": "관성", "cat": "Track 2", "year": 2024,
             "desc": "추운 계절을 견디는 각자의 방식에 대한 곡입니다. 기타 한 대와 목소리만 녹음했고 "
                     "후반 작업도 거의 하지 않았습니다."},
            {"title": "두 번째 여름", "sub": "싱글",
             "album": None, "cat": "Single", "year": 2023,
             "desc": "EP 이전에 낸 곡입니다. 지금 들으면 고치고 싶은 데가 많지만 그때의 목소리라 그대로 둡니다."},
        ],
        "texts": [
            ("곡 이야기", "직접 쓴 곡에 대해 적어 둡니다.", [
                ("관성", "가사를 먼저 쓰고 멜로디를 붙였습니다. 원래 4분이 넘었는데 2절을 통째로 덜어냈습니다.",
                 [("작사·작곡", "윤소미"), ("편곡", "윤소미, 박정우"),
                  ("믹싱", "박정우"), ("발매", "2024.03")]),
                ("겨울의 방식", "새벽에 한 번에 녹음했습니다. 숨소리가 들어간 채로 두었습니다.",
                 [("작사·작곡", "윤소미"), ("발매", "2024.03")]),
            ]),
            ("공연", "", [
                ("정기 공연", "두 달에 한 번 홍대에서 합니다. 일정은 인스타그램에 올립니다.",
                 [("편성", "솔로 또는 기타 듀오")]),
            ]),
        ],
        "contact": {"email1": "somi.songs@demo.example.com",
                    "instagram_url": "https://instagram.com/somi.songs",
                    "extra_description": "공연 문의 환영합니다. 작은 자리도 좋습니다."},
    },

    # ── 박정우 · 믹싱/마스터링 엔지니어 ──────────────────────────
    # 목소리: 절차와 조건을 순서대로 적는 설명체. 숫자가 많다.
    {
        "slug": "park", "nickname": "박정우", "name": "박정우", "english_name": "Park Jungwoo",
        "tpl": 1, "plan": "STANDARD", "density": "full",
        "jobs": [20, 19],
        "tagline": "믹싱과 마스터링",
        "desc1": "인디 밴드와 싱어송라이터 작업을 주로 합니다. 작은 방에서 시작해 지금은 홍대에 작업실을 두고 있습니다.",
        "desc2": "곡이 원래 가진 소리를 크게 바꾸지 않는 쪽을 좋아합니다.\n"
                 "무엇을 고치고 싶은지 말로 설명하기 어려우시면 레퍼런스 트랙을 두세 곡 보내주세요. 그게 가장 정확합니다.",
        "no_image": [
            {"title": "Before / After 모음", "sub": "2024년 작업분",
             "album": "믹스 전후 비교", "cat": "Mixing Sample", "year": 2024,
             "desc": "같은 구간을 믹스 전후로 이어 붙였습니다. 보컬 위치와 저역 정리가 어떻게 달라지는지 들으실 수 있습니다."},
            {"title": "2023 작업물 하이라이트", "sub": "8곡 발췌",
             "album": "2023 하이라이트", "cat": "Showreel", "year": 2023,
             "desc": "장르가 섞여 있습니다. 순서대로 밴드, 어쿠스틱, 일렉트로닉입니다."},
        ],
        "texts": [
            ("작업 순서", "의뢰하시기 전에 읽어보시면 좋습니다.", [
                ("1. 스템 확인", "받은 파일을 먼저 확인합니다. 클리핑이나 위상 문제가 있으면 이 단계에서 알려드립니다.",
                 [("포맷", "24bit WAV, 곡 시작점 통일"), ("소요", "1일")]),
                ("2. 1차 믹스", "레퍼런스를 기준으로 방향을 잡아 보내드립니다.",
                 [("소요", "스템 확인 후 3일"), ("전달", "MP3 + WAV")]),
                ("3. 수정", "두 번까지 포함입니다. 몇 분 몇 초에 무엇이 걸리는지 적어주시면 정확합니다.",
                 [("예시", "1분 12초 스네어가 너무 뒤에 있음")]),
                ("4. 마스터링", "믹스가 확정되면 진행합니다. 스트리밍용과 CD용을 따로 만들어 드립니다.",
                 [("기준", "스트리밍 -14 LUFS")]),
            ]),
            ("장비", "메인 체인입니다. 전부 쓰지는 않고 곡에 따라 고릅니다.", [
                ("모니터링", "두 대를 번갈아 들으며 확인합니다.",
                 [("Main", "Focal Trio6 Be"), ("Sub", "Genelec 8331A"),
                  ("헤드폰", "Sennheiser HD650")]),
                ("아웃보드 · 컨버터", "",
                 [("컴프레서", "API 2500"), ("EQ", "Manley Massive Passive"),
                  ("컨버터", "Antelope Orion 32+")]),
            ]),
            ("참여 작업", "", [
                ("윤소미 EP 「관성」", "믹싱과 마스터링을 맡았습니다.", [("발매", "2024.03")]),
                ("소요 EP 「같은 자리」", "믹싱.", [("발매", "2023.04")]),
            ]),
        ],
        "contact": {"phone1": "010-3388-1092", "email1": "jungwoo.mix@demo.example.com",
                    "instagram_url": "https://instagram.com/jw.mixing",
                    "extra_description": "견적은 곡 수와 스템 개수에 따라 달라집니다. "
                                         "데모를 먼저 들어보고 말씀드리니 편하게 문의 주세요."},
    },

    # ── 이하린 · 미디어아트 작가 (템플릿 2) ──────────────────────
    # 목소리: 전시 캡션 문체. 문장이 길고 개념을 먼저 말한다.
    {
        "slug": "lee", "nickname": "이하린", "name": "이하린", "english_name": "Lee Harin",
        "tpl": 2, "plan": "PREMIUM", "density": "full",
        "jobs": [25, 27],
        "tagline": "소리와 빛을 같은 재료로 다룹니다",
        "activity_area": "서울 · 베를린",
        "desc1": "공간에 들어온 사람의 움직임이 작품의 일부가 되는 설치 작업을 합니다. "
                 "소리를 먼저 만들고, 그것이 놓일 자리를 나중에 정합니다.",
        "desc2": "2024년 베를린 Kunstraum 레지던시에 참여했습니다.\n"
                 "전시 외에 공연과 무대의 사운드 설계도 함께 합니다.",
        "image_sections": [
            ("Resonance Field (2024)",
             "관람객의 위치에 따라 여덟 대의 스피커가 서로 다른 지연 시간으로 반응합니다. "
             "아무도 없을 때 이 작업은 소리를 내지 않습니다. 전시장이 비는 시간에도 작품이 계속 존재하는가 — "
             "그 질문에서 시작했습니다. 아르코미술관, 2024.",
             ["harin-rf-1", "harin-rf-2", "harin-rf-3", "harin-rf-4"]),
            ("Still Noise (2023)",
             "정지한 화면과 움직이는 소리를 나란히 놓았습니다. 6채널로 재생되는 소리는 모두 전시장 자체를 "
             "녹음한 것이고, 화면은 같은 장소를 찍은 사진입니다. 보는 것과 듣는 것 중 무엇이 먼저 공간을 "
             "만드는지 보려 했습니다. 베를린 Kunstraum 그룹전, 2023.",
             ["harin-sn-1", "harin-sn-2", "harin-sn-3"]),
        ],
        "youtube": [
            {"title": "Resonance Field 도큐멘테이션", "sub": "설치 기록 영상",
             "album": "Resonance Field", "cat": "Documentation", "year": 2024,
             "desc": "전시 기간에 촬영한 기록입니다. 관람객이 들어오고 나가는 동안 스피커 배열이 "
                     "어떻게 반응하는지 볼 수 있습니다."},
        ],
        "image_cards": [
            {"title": "Still Noise 전시 전경", "sub": "베를린 Kunstraum",
             "album": "Still Noise", "cat": "Installation View", "year": 2023,
             "desc": "6채널 스피커와 인화지 12장으로 구성했습니다."},
        ],
        "texts": [
            ("전시", "최근 참여한 전시입니다.", [
                ("Resonance Field", "개인전. 8채널 사운드 설치와 적외선 센서 배열.",
                 [("장소", "아르코미술관, 서울"), ("기간", "2024.05 – 2024.07")]),
                ("Still Noise", "그룹전 「Quiet Machines」 참여.",
                 [("장소", "Kunstraum, 베를린"), ("기간", "2023.09 – 2023.11")]),
            ]),
            ("작업 방식", "쓰는 도구와 협업 범위입니다.", [
                ("사운드", "Max/MSP로 실시간 처리하고 Reaper에서 다중 채널을 정리합니다.",
                 [("채널", "6 – 16채널 경험"), ("센서", "적외선 · 초음파 거리 센서")]),
                ("협업", "전시 공간이 정해진 뒤에 설계를 시작합니다. 도면과 잔향 측정 자료가 있으면 빠릅니다.",
                 [("소요", "설계부터 설치까지 6 – 10주")]),
            ]),
        ],
        "contact": {"email1": "harin.studio@demo.example.com",
                    "instagram_url": "https://instagram.com/harin.media",
                    "extra_description": "전시와 협업 제안은 메일로 부탁드립니다. "
                                         "포트폴리오 PDF는 요청하시면 보내드립니다."},
    },

    # ── 최민석 · 게임음악 작곡가 ─────────────────────────────────
    # 목소리: 기능 중심. "어디까지 맡을 수 있는가"를 명확히 구분해 적는다.
    {
        "slug": "choi", "nickname": "최민석", "name": "최민석", "english_name": "Choi Minseok",
        "tpl": 1, "plan": "PREMIUM", "density": "full",
        "jobs": [12, 16],
        "tagline": "게임 음악과 사운드 디자인, 구현까지",
        "desc1": "인디 게임 사운드를 만듭니다. 음악과 효과음을 한 사람이 같이 설계하면 결과가 낫다고 생각해서 둘 다 맡습니다.",
        "desc2": "Wwise와 FMOD 연동까지 직접 합니다. 작곡가에게 파일만 받아 엔진에 붙이는 과정에서 생기는 손실이 없습니다.\n"
                 "프로토타입 단계부터 참여하는 쪽을 좋아합니다.",
        "youtube": [
            {"title": "「해무」 OST", "sub": "전곡 플레이스루",
             "album": "해무 OST", "cat": "Original Soundtrack", "year": 2024,
             "desc": "PC와 Switch로 출시한 어드벤처 게임입니다. 안개가 짙어질수록 현악이 빠지고 저역만 남도록 "
                     "설계했습니다. 트랙이 아니라 상태로 만든 음악입니다."},
            {"title": "적응형 음악 구현 데모", "sub": "Wwise 파라미터 설명",
             "album": None, "cat": "Technical Demo", "year": 2023,
             "desc": "플레이어 체력에 따라 레이어가 어떻게 붙고 떨어지는지 게임 화면과 함께 보여줍니다."},
        ],
        "soundcloud": [
            {"title": "해무 — 메인 테마", "sub": "오프닝",
             "album": "해무 OST", "cat": "Theme", "year": 2024,
             "desc": "게임에서 가장 먼저 들리는 곡입니다. 3분짜리 한 곡이지만 실제로는 여덟 개 레이어로 나뉘어 있습니다."},
            {"title": "해무 — 추격", "sub": "전투 상황",
             "album": "해무 OST", "cat": "Battle", "year": 2024,
             "desc": "루프 지점을 네 군데 두어서 추격이 언제 끝나든 마디가 맞게 떨어집니다."},
        ],
        "no_image": [
            {"title": "효과음 팩 발췌", "sub": "환경음 · UI",
             "album": None, "cat": "Sound Design", "year": 2023,
             "desc": "직접 녹음한 소스로 만들었습니다. 발소리는 실제 자갈밭에서, 문소리는 폐교에서 땄습니다."},
        ],
        "texts": [
            ("참여 게임", "", [
                ("해무 (2024)", "음악 전곡, 사운드 디자인, Wwise 구현까지 맡았습니다.",
                 [("플랫폼", "PC / Nintendo Switch"), ("분량", "OST 22곡, 효과음 약 400개")]),
                ("리버스 로드 (2022)", "음악만 참여했습니다.",
                 [("플랫폼", "PC"), ("분량", "OST 9곡")]),
            ]),
            ("맡을 수 있는 범위", "전부 필요하지 않으시면 일부만 맡아도 됩니다.", [
                ("음악", "테마곡과 상황별 적응형 트랙.",
                 [("형식", "레이어 분리 / 수직·수평 전환")]),
                ("사운드 디자인", "UI, 환경음, 캐릭터 폴리.",
                 [("납품", "정리된 네이밍 규칙과 함께 전달")]),
                ("구현", "Wwise / FMOD 연동, 파라미터 설계, RTPC 세팅.",
                 [("협업", "엔진 개발자와 직접 이야기합니다")]),
            ]),
        ],
        "contact": {"email1": "minseok.game@demo.example.com",
                    "youtube_url": "https://youtube.com/@minseokgame",
                    "extra_description": "포트폴리오 전체와 효과음 목록은 메일로 요청 주시면 보내드립니다."},
    },

    # ── 한서윤 · 뮤지컬배우 ──────────────────────────────────────
    {
        "slug": "han", "nickname": "한서윤", "name": "한서윤", "english_name": "Han Seoyun",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [3, 1],
        "tagline": "무대에서 노래합니다",
        "desc1": "뮤지컬 앙상블과 커버로 무대에 섭니다. 성악을 전공했고 지금은 대중음악 발성도 같이 훈련하고 있습니다.",
        "youtube": [
            {"title": "「빛의 자리」 넘버 — 한 걸음", "sub": "커버 무대",
             "album": "빛의 자리", "cat": "Musical Number", "year": 2024,
             "desc": "앙상블로 참여한 작품에서 한 회차를 커버로 섰던 날의 영상입니다."},
        ],
        "texts": [
            ("출연작", "", [
                ("「빛의 자리」", "앙상블 · 여주인공 커버.",
                 [("극장", "대학로 소극장"), ("기간", "2024.03 – 2024.06")]),
            ]),
        ],
        "contact": {"email1": "seoyun.stage@demo.example.com"},
    },

    # ── 정도현 · 드러머 ──────────────────────────────────────────
    # 목소리: 짧고 소박하다.
    {
        "slug": "jung", "nickname": "정도현", "name": "정도현", "english_name": "Jung Dohyun",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [6, 9],
        "tagline": "드럼 — 밴드와 세션",
        "desc1": "밴드 활동과 세션을 같이 합니다. 화려한 것보다 곡이 흔들리지 않는 쪽을 먼저 생각합니다.",
        "youtube": [
            {"title": "「회전목마」 드럼 커버", "sub": "원곡 편곡 그대로",
             "album": None, "cat": "Drum Cover", "year": 2024,
             "desc": "원곡 그루브를 그대로 따라 친 영상입니다. 심벌은 최대한 적게 썼습니다."},
        ],
        "no_image": [
            {"title": "연습실 세션 녹음", "sub": "3인 편성",
             "album": None, "cat": "Session", "year": 2023,
             "desc": "베이스, 기타와 함께 한 번에 녹음했습니다. 편집하지 않았습니다."},
        ],
        "contact": {"phone1": "010-7745-2210", "email1": "dohyun.drums@demo.example.com"},
    },

    # ── 오지민 · 비트메이커 (템플릿 2) ───────────────────────────
    # 목소리: 캐주얼하고 문장이 짧다.
    {
        "slug": "oh", "nickname": "오지민", "name": "오지민", "english_name": "Oh Jimin",
        "tpl": 2, "plan": "STANDARD", "density": "medium",
        "jobs": [14, 10],
        "tagline": "비트 만듭니다",
        "activity_area": "서울",
        "desc1": "힙합과 R&B 트랙을 만듭니다. 샘플 뒤지는 시간이 제일 깁니다.",
        "desc2": "비트 구매도 되고 커스텀 작업도 합니다. 커버 이미지는 직접 만듭니다.",
        "soundcloud": [
            {"title": "Velvet", "sub": "Type Beat",
             "album": None, "cat": "Beat · 88BPM", "year": 2024,
             "desc": "느린 템포에 리버스 신스를 깔았습니다. 랩보다 노래에 어울립니다."},
            {"title": "Rainy", "sub": "Type Beat",
             "album": None, "cat": "Beat · 140BPM", "year": 2024,
             "desc": "드럼을 반박자 밀어 놓았습니다. 처음 들으면 어색한데 벌스가 올라가면 맞습니다."},
        ],
        "image_sections": [
            ("아트워크",
             "비트마다 커버를 직접 만듭니다. 음악을 먼저 만들고, 그 소리에 맞는 그림을 나중에 고릅니다.",
             ["jimin-art-1", "jimin-art-2", "jimin-art-3"]),
        ],
        "contact": {"email1": "jimin.beats@demo.example.com",
                    "instagram_url": "https://instagram.com/jimin.beats"},
    },

    # ── 신유진 · 폴리 아티스트 ───────────────────────────────────
    # 목소리: 구체적인 사물 이름이 계속 나온다.
    {
        "slug": "shin", "nickname": "신유진", "name": "신유진", "english_name": "Shin Yujin",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [17, 16],
        "tagline": "폴리 — 화면에 없는 소리를 만듭니다",
        "desc1": "발소리, 옷깃, 문고리 같은 것들을 만듭니다. 대부분 화면에 보이는 물건과는 다른 물건으로 냅니다.",
        "no_image": [
            {"title": "폴리 작업 릴", "sub": "2024년 정리본",
             "album": None, "cat": "Foley Reel", "year": 2024,
             "desc": "독립영화 두 편에서 발췌했습니다. 눈길 걷는 소리는 전분을 채운 가죽 주머니로 냈습니다."},
        ],
        "texts": [
            ("작업 목록", "", [
                ("독립영화 「무른 땅」", "폴리 전반을 맡았습니다. 발소리 위주의 영화라 신발을 열두 켤레 준비했습니다.",
                 [("러닝타임", "94분"), ("연도", "2024")]),
            ]),
        ],
        "contact": {"email1": "yujin.foley@demo.example.com"},
    },

    # ── 배현우 · 오디오 프로그래머 (템플릿 2) ────────────────────
    # 목소리: 기술 문서에 가깝다.
    {
        "slug": "bae", "nickname": "배현우", "name": "배현우", "english_name": "Bae Hyunwoo",
        "tpl": 2, "plan": "FREE", "density": "medium",
        "jobs": [24, 18],
        "tagline": "인터랙티브 오디오를 코드로 만듭니다",
        "activity_area": "성남",
        "desc1": "웹과 게임에서 소리가 상황에 반응하도록 만듭니다. 음악을 만드는 쪽이 아니라 "
                 "만들어진 소리를 움직이게 하는 쪽입니다.",
        "desc2": "사운드 디자이너나 작곡가와 함께 일할 때 가장 잘 맞습니다.",
        "youtube": [
            {"title": "웹오디오 인터랙션 데모", "sub": "브라우저에서 동작",
             "album": None, "cat": "Web Audio API", "year": 2024,
             "desc": "마우스 위치에 따라 필터와 지연이 실시간으로 바뀝니다. 라이브러리 없이 Web Audio API만 썼습니다."},
        ],
        "texts": [
            ("기술", "다뤄본 것들입니다.", [
                ("Web Audio API", "브라우저 기반 실시간 처리. 지연 시간 관리가 핵심입니다.",
                 [("사용", "AudioWorklet, ConvolverNode")]),
                ("Wwise / FMOD", "게임 미들웨어 연동과 파라미터 설계.",
                 [("엔진", "Unity, Unreal")]),
            ]),
        ],
        "contact": {"email1": "hyunwoo.audio@demo.example.com"},
    },

    # ── 문가영 · 피아니스트 ──────────────────────────────────────
    # 데모 링크(라흐마니노프)와 내용이 자연스럽게 맞는 계정.
    # 목소리: 정중하고 레퍼토리 이야기를 한다.
    {
        "slug": "moon", "nickname": "문가영", "name": "문가영", "english_name": "Moon Gayoung",
        "tpl": 1, "plan": "FREE", "density": "full",
        "jobs": [5, 8],
        "tagline": "피아노 — 독주와 반주",
        "desc1": "클래식을 전공했고 지금은 독주회와 반주, 오케스트라 객원 연주를 병행합니다. "
                 "러시아 후기 낭만 레퍼토리를 가장 오래 붙들고 있습니다.",
        "desc2": "반주는 성악과 기악 모두 합니다. 악보를 미리 주시면 리허설 한 번으로 맞출 수 있습니다.\n"
                 "녹음 세션도 받습니다.",
        "youtube": [
            {"title": "라흐마니노프 교향곡 2번", "sub": "객원 연주",
             "album": "Rachmaninoff Symphony No.2", "cat": "Orchestra · Guest", "year": 2024,
             "desc": "3악장의 그 선율 때문에 오래 준비한 무대입니다. 오케스트라 안에서 건반은 거의 들리지 않지만, "
                     "현이 쉬는 두 마디에만 남는 소리가 있습니다."},
        ],
        "soundcloud": [
            {"title": "라흐마니노프 피아노 협주곡", "sub": "2악장 발췌",
             "album": "Piano Concerto", "cat": "Solo · Recording", "year": 2023,
             "desc": "2악장만 따로 녹음했습니다. 페달을 평소보다 얕게 밟아서 화성이 겹치지 않게 했습니다."},
        ],
        "no_image": [
            {"title": "쇼팽 발라드 4번", "sub": "독주회 실황",
             "album": None, "cat": "Recital", "year": 2023,
             "desc": "예술의전당 리사이틀홀 독주회 실황입니다. 편집하지 않은 원 테이크입니다."},
        ],
        "texts": [
            ("연주 이력", "", [
                ("독주회", "2년에 한 번 정도 엽니다.",
                 [("2023", "예술의전당 리사이틀홀"), ("2021", "금호아트홀 연세")]),
                ("객원 · 협연", "오케스트라 객원 건반으로 참여합니다.",
                 [("2024", "KBS교향악단 정기연주회"), ("2022", "경기필하모닉 협연")]),
            ]),
            ("반주 · 세션", "받는 일과 조건입니다.", [
                ("반주", "성악과 기악 모두 합니다. 콩쿠르와 입시 반주 경험이 많습니다.",
                 [("준비", "악보를 일주일 전에 주시면 좋습니다"), ("리허설", "기본 1회, 필요하면 추가")]),
                ("녹음 세션", "스튜디오 피아노 상태에 따라 조율을 먼저 요청드릴 수 있습니다.",
                 [("장르", "클래식 · 영화음악 · 발라드")]),
            ]),
        ],
        "contact": {"phone1": "010-4417-9930", "email1": "gayoung.piano@demo.example.com",
                    "extra_description": "반주 문의는 곡명과 일정을 함께 보내주시면 빠릅니다."},
    },

    # ── 임재현 · 라이브 PA 엔지니어 ──────────────────────────────
    # 목소리: 현장 이야기. 조건과 장비를 먼저 말한다.
    {
        "slug": "im", "nickname": "임재현", "name": "임재현", "english_name": "Im Jaehyun",
        "tpl": 1, "plan": "FREE", "density": "medium",
        "jobs": [21, 22],
        "tagline": "라이브 음향 — FOH",
        "desc1": "공연장에서 소리를 잡습니다. 작은 클럽부터 야외 페스티벌까지 하고, 밴드 편성이 가장 익숙합니다.",
        "desc2": "현장에 일찍 갑니다. 사운드체크 시간을 넉넉히 주시는 편이 결과가 좋습니다.",
        "texts": [
            ("현장 이력", "최근 맡은 공연입니다.", [
                ("2024 한강 뮤직페스타", "메인 스테이지 FOH를 맡았습니다. 야외라 바람 방향에 따라 EQ를 두 번 다시 잡았습니다.",
                 [("규모", "3천석"), ("콘솔", "DiGiCo SD10")]),
                ("클럽 정기 공연", "월 2회 고정으로 들어갑니다.",
                 [("장소", "홍대 라이브클럽"), ("콘솔", "Allen & Heath SQ-5")]),
            ]),
        ],
        "contact": {"phone1": "010-9912-3355", "email1": "jaehyun.pa@demo.example.com"},
    },

    # ── 서나은 · 영화/광고 음악 (템플릿 2) ───────────────────────
    # 목소리: 장면 이야기부터 시작한다.
    {
        "slug": "seo", "nickname": "서나은", "name": "서나은", "english_name": "Seo Naeun",
        "tpl": 2, "plan": "STANDARD", "density": "medium",
        "jobs": [11, 13],
        "tagline": "장면에 붙는 음악",
        "activity_area": "서울",
        "desc1": "영화와 광고 음악을 씁니다. 편집본을 먼저 보고 어디에 음악이 없어야 하는지부터 정합니다.",
        "desc2": "짧은 광고 음악도 좋아합니다. 30초 안에 끝나는 이야기가 따로 있습니다.",
        "youtube": [
            {"title": "단편영화 「여름 끝」 스코어", "sub": "본편 삽입곡",
             "album": "여름 끝", "cat": "Film Score", "year": 2024,
             "desc": "23분짜리 단편에 음악은 네 번만 들어갑니다. 마지막 장면에는 음악을 넣었다가 뺐고, 그게 맞았습니다."},
        ],
        "image_sections": [
            ("녹음 세션",
             "현악 사중주 녹음 현장입니다. 스코어링 스테이지가 아니라 작은 스튜디오에서 나눠 녹음했습니다.",
             ["naeun-1", "naeun-2"]),
        ],
        "texts": [
            ("작업", "", [
                ("단편영화 「여름 끝」", "음악 전곡. 감독과 편집 단계부터 이야기했습니다.",
                 [("연도", "2024"), ("편성", "현악 4중주 + 피아노")]),
            ]),
        ],
        "contact": {"email1": "naeun.score@demo.example.com"},
    },

    # ── 이름과 직업만 있는 계정 (빈 상태 UI 확인용) ──────────────
    {
        "slug": "jo", "nickname": "조은결", "name": "조은결", "english_name": "Jo Eungyeol",
        "tpl": 2, "plan": "FREE", "density": "minimal",
        "jobs": [28, 26],
        "tagline": "무대 기술 감독",
        "activity_area": "인천",
    },
    {
        "slug": "hwang", "nickname": "황시우", "name": "황시우", "english_name": "Hwang Siwoo",
        "tpl": 1, "plan": "FREE", "density": "minimal",
        "jobs": [7],
        "tagline": "베이스",
    },
    # ── 가입만 하고 아무것도 쓰지 않은 계정 ──────────────────────
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

        def common(c, i, extra=None):
            """카드 하나를 모델 kwargs로 바꾼다.

            project_subtitle 과 description 도 템플릿이 실제로 렌더하므로
            (ArtistTemplate1.tsx 123·185행) 비워 두지 않고 채운다.
            """
            d = dict(album_section_id=alb.id, order=i,
                     project_title=c["title"],
                     project_subtitle=c.get("sub"),
                     album_name=c.get("album"),
                     category_desc=c.get("cat"),
                     year=c.get("year"),
                     description=c.get("desc"),
                     composer=c.get("credit", p.get("name")))
            d.update(extra or {})
            return d

        for i, t in enumerate(p.get("youtube") or []):
            # 데모용 유튜브 링크. 가짜 id를 쓰면 임베드가 "재생할 수 없음"으로
            # 떠서 화면이 망가져 보이므로, 실제로 재생되는 공개 영상 하나를
            # 모든 카드에 공통으로 쓴다. 데모 데이터라는 점은 계정 도메인
            # (@demo.example.com)으로 드러난다.
            session.add(m["yt"](**common(t, i, {"link": DEMO_YOUTUBE_URL})))
        for i, t in enumerate(p.get("soundcloud") or []):
            # 데모용 사운드클라우드 링크. 가짜 경로를 쓰면 임베드 플레이어가
            # 비어서 화면이 망가져 보이므로, 실제로 재생되는 공개 트랙을 쓴다.
            session.add(m["sc"](**common(t, i, {"link": DEMO_SOUNDCLOUD_URL})))
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
