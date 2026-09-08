from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_session
from app.models.user import User, SubscriptionPlan
from app.core.deps import get_current_user

router = APIRouter(prefix="/payment", tags=["Payment"])


class SubscribeRequest(BaseModel):
    plan: str  # "standard" | "premium"


# ── 플랜별 앨범 카드 한도 ────────────────────────────────────
# 유튜브+사운드클라우드+이미지+음원 카드 합계 기준. t1/t2 앨범 섹션
# 저장 라우터(현재 services/portfolio.py, github-49 소유)가 카드를
# 실제로 저장하기 전에 check_album_card_limit()을 호출해야 한다 —
# 저장 후에 검사하면 이미 DB에 초과분이 들어간 뒤라 의미가 없다.
# t1·t2 양쪽 다 걸어야 한다: 하나만 걸면 다른 템플릿으로 우회된다.
# T2ImageSection(이미지 갤러리)은 의도적으로 이 한도에서 제외했다 —
# "포트폴리오 카드 개수"로 좁게 정의해야 한도 초과 메시지가
# 사용자에게 설명 가능하기 때문이다.
PLAN_ALBUM_CARD_LIMITS: dict[SubscriptionPlan, Optional[int]] = {
    SubscriptionPlan.FREE: 3,
    SubscriptionPlan.STANDARD: 10,
    SubscriptionPlan.PREMIUM: None,  # 무제한
}


def check_album_card_limit(user: User, total_cards: int) -> None:
    """앨범 카드 총 개수가 user의 플랜 한도를 넘으면 403을 던진다.

    total_cards는 호출하는 쪽에서 저장하려는 youtube_cards +
    soundcloud_cards + image_cards + no_image_cards의 길이 합을 넘긴다
    (t1/t2 공용 — 카드 종류 구성은 같다).
    """
    limit = PLAN_ALBUM_CARD_LIMITS[user.subscription_plan]
    if limit is not None and total_cards > limit:
        raise HTTPException(
            status_code=403,
            detail=(
                f"{user.subscription_plan.value} 플랜은 앨범 카드를 최대 {limit}개까지 등록할 수 있습니다. "
                f"(현재 요청: {total_cards}개) 더 등록하려면 플랜을 업그레이드해주세요."
            ),
        )


@router.get("/my-plan")
async def get_my_plan(
    current_user: User = Depends(get_current_user),
):
    return {
        "plan": current_user.subscription_plan.value,
        "nickname": current_user.nickname,
        "email": current_user.email,
    }


@router.post("/subscribe")
async def subscribe(
    data: SubscribeRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        plan = SubscriptionPlan(data.plan.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 플랜입니다.")

    if plan == SubscriptionPlan.FREE:
        raise HTTPException(status_code=400, detail="무료 플랜으로는 구독할 수 없습니다. 취소 API를 사용해주세요.")

    current_user.subscription_plan = plan
    session.add(current_user)
    await session.commit()
    return {"status": "success", "plan": plan.value}


@router.post("/cancel")
async def cancel_subscription(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    current_user.subscription_plan = SubscriptionPlan.FREE
    session.add(current_user)
    await session.commit()
    return {"status": "success", "plan": "free"}
