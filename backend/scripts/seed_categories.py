"""
⚠️ 폐기된 스크립트입니다. 실행하지 마세요.

이 파일은 두 가지 이유로 위험합니다.

1) 데이터를 지웁니다.
   실행하자마자 DELETE FROM user_jobs / career_items / career_categories 를
   순서대로 돌렸습니다. 그런데 t1_name_section_jobs.career_item_id 와
   t2_name_section_jobs.career_item_id 는 career_items 를 ON DELETE CASCADE 로
   참조합니다. 즉 career_items 를 지우는 순간 **모든 사용자의 직업 선택이
   함께 삭제됩니다.** 에러도 나지 않고 조용히 사라집니다.

2) 데이터가 실제와 다릅니다.
   여기 있던 카테고리는 영문("Performer", "Vocal", ...)인데 운영에 들어 있는
   것은 한글("PERFORMER", "보컬", ...)입니다. 실행하면 기준정보가 통째로
   다른 값으로 바뀝니다.

카테고리 기준정보는 이제 Alembic 데이터 마이그레이션이 관리합니다.
새 환경을 만들 때는 아래 한 줄이면 스키마와 기준정보가 함께 준비됩니다.

    alembic upgrade head

기준정보를 바꿔야 한다면 새 마이그레이션 리비전을 추가하십시오.
그래야 변경 이력이 남고 되돌릴 수 있습니다.
"""

raise SystemExit(__doc__)
