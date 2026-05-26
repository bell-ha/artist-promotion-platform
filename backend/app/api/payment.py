from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_session
from app.models.user import User, SubscriptionPlan
from app.core.deps import get_current_user

router = APIRouter(prefix="/payment", tags=["Payment"])


class SubscribeRequest(BaseModel):
    plan: str  # "standard" | "premium"


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
