"""seed career categories

Revision ID: a7280831dc82
Revises: 6dc6b1f7f8fb
Create Date: 2026-09-08 16:02:26.603208

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel            # SQLModel이 str 컬럼을 AutoString으로 렌더링한다.
                           # 이 import가 없으면 생성된 리비전이 NameError로 죽는다.


# revision identifiers, used by Alembic.
revision: str = 'a7280831dc82'
down_revision: Union[str, Sequence[str], None] = '6dc6b1f7f8fb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CATEGORIES = [
    {"id": 1, "name": "PERFORMER", "order": 1, "is_active": True},
    {"id": 2, "name": "INSTRUMENTALIST", "order": 2, "is_active": True},
    {"id": 3, "name": "CREATOR", "order": 3, "is_active": True},
    {"id": 4, "name": "SOUND DESIGNER", "order": 4, "is_active": True},
    {"id": 5, "name": "AUDIO ENGINEER", "order": 5, "is_active": True},
    {"id": 6, "name": "AUDIO PROGRAMMER", "order": 6, "is_active": True},
    {"id": 7, "name": "VISUAL ARTIST", "order": 7, "is_active": True},
]

ITEMS = [
    {"id": 1, "category_id": 1, "name": "보컬", "order": 1, "is_active": True},
    {"id": 2, "category_id": 1, "name": "인디 싱어송라이터", "order": 2, "is_active": True},
    {"id": 3, "category_id": 1, "name": "뮤지컬배우", "order": 3, "is_active": True},
    {"id": 4, "category_id": 2, "name": "기타리스트", "order": 1, "is_active": True},
    {"id": 5, "category_id": 2, "name": "피아니스트", "order": 2, "is_active": True},
    {"id": 6, "category_id": 2, "name": "드러머", "order": 3, "is_active": True},
    {"id": 7, "category_id": 2, "name": "베이시스트", "order": 4, "is_active": True},
    {"id": 8, "category_id": 2, "name": "오케스트라 연주자", "order": 5, "is_active": True},
    {"id": 9, "category_id": 2, "name": "세션 연주자", "order": 6, "is_active": True},
    {"id": 10, "category_id": 3, "name": "대중음악 작곡가", "order": 1, "is_active": True},
    {"id": 11, "category_id": 3, "name": "영화음악 작곡가", "order": 2, "is_active": True},
    {"id": 12, "category_id": 3, "name": "게임음악 작곡가", "order": 3, "is_active": True},
    {"id": 13, "category_id": 3, "name": "광고음악 작곡가", "order": 4, "is_active": True},
    {"id": 14, "category_id": 3, "name": "비트메이커", "order": 5, "is_active": True},
    {"id": 15, "category_id": 3, "name": "탑라이너", "order": 6, "is_active": True},
    {"id": 16, "category_id": 4, "name": "사운드 디자이너", "order": 1, "is_active": True},
    {"id": 17, "category_id": 4, "name": "폴리 아티스트", "order": 2, "is_active": True},
    {"id": 18, "category_id": 4, "name": "인터랙티브 오디오 디자이너", "order": 3, "is_active": True},
    {"id": 19, "category_id": 5, "name": "레코딩 엔지니어", "order": 1, "is_active": True},
    {"id": 20, "category_id": 5, "name": "믹싱/마스터링 엔지니어", "order": 2, "is_active": True},
    {"id": 21, "category_id": 5, "name": "라이브 PA 엔지니어", "order": 3, "is_active": True},
    {"id": 22, "category_id": 5, "name": "방송 음향 감독", "order": 4, "is_active": True},
    {"id": 23, "category_id": 6, "name": "프론트엔드 개발자", "order": 1, "is_active": True},
    {"id": 24, "category_id": 6, "name": "백엔드 개발자", "order": 2, "is_active": True},
    {"id": 25, "category_id": 7, "name": "미디어아트 작가", "order": 1, "is_active": True},
    {"id": 26, "category_id": 7, "name": "미술 작가", "order": 2, "is_active": True},
    {"id": 27, "category_id": 7, "name": "설치미술가", "order": 3, "is_active": True},
    {"id": 28, "category_id": 7, "name": "공연 테크니컬 디렉터", "order": 4, "is_active": True},
]


def upgrade() -> None:
    """직업 카테고리 기준정보를 넣습니다.

    예전에는 서버가 뜰 때마다 database.py의 seed_categories()가 이 일을 했고,
    id를 auto-increment에 맡겨서 환경마다 "보컬"의 id가 달랐습니다. 그런데
    career_items.id는 t1/t2_name_section_jobs.career_item_id 와
    user_jobs.career_item_id 가 참조하는 의미 있는 값입니다. 여기서는 id를
    명시해 전 환경이 같은 값을 갖게 합니다.

    ⚠️ 이미 데이터가 있는 DB(운영)에서는 아무것도 하지 않고 넘어갑니다.
       운영의 실제 id와 아래 id가 다를 수 있으므로, 운영 덤프를 받아
       확인하기 전에는 이 값들이 운영과 같다고 가정하지 마십시오.
    """
    conn = op.get_bind()

    already = conn.execute(sa.text("SELECT 1 FROM career_categories LIMIT 1")).scalar()
    if already:
        return

    op.bulk_insert(
        sa.table(
            "career_categories",
            sa.column("id", sa.Integer),
            sa.column("name", sa.String),
            sa.column("order", sa.Integer),
            sa.column("is_active", sa.Boolean),
        ),
        CATEGORIES,
    )
    op.bulk_insert(
        sa.table(
            "career_items",
            sa.column("id", sa.Integer),
            sa.column("category_id", sa.Integer),
            sa.column("name", sa.String),
            sa.column("order", sa.Integer),
            sa.column("is_active", sa.Boolean),
        ),
        ITEMS,
    )

    # id를 직접 지정해 넣었으므로 시퀀스를 끝으로 밀어줍니다.
    # 이걸 빼면 다음 INSERT가 id 중복으로 실패합니다.
    conn.execute(sa.text(
        "SELECT setval('career_categories_id_seq', (SELECT MAX(id) FROM career_categories))"
    ))
    conn.execute(sa.text(
        "SELECT setval('career_items_id_seq', (SELECT MAX(id) FROM career_items))"
    ))


def downgrade() -> None:
    """이 리비전이 넣은 행만 지웁니다.

    ⚠️ career_items 를 지우면 t1/t2_name_section_jobs 의 참조가 CASCADE로
       함께 삭제됩니다(= 사용자의 직업 선택이 사라집니다). 사용자 데이터가
       들어 있는 DB에서는 이 downgrade를 돌리지 마십시오.
    """
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM career_items WHERE id <= :n"), {"n": 28})
    conn.execute(sa.text("DELETE FROM career_categories WHERE id <= :n"), {"n": 7})
