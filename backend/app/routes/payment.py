from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.middleware.auth_middleware import get_current_user
from app.services import payment_service

router = APIRouter(prefix="/api/payment", tags=["payment"])


class MockSubscribeRequest(BaseModel):
    plan: str = "founder_pro"
    card_number: Optional[str] = "4111111111111111"
    expiry: Optional[str] = "12/28"
    cvv: Optional[str] = "123"


@router.post("/subscribe")
async def subscribe(req: MockSubscribeRequest, current_user: dict = Depends(get_current_user)):
    result = await payment_service.process_subscription(
        user_id=current_user["_id"],
        plan=req.plan,
        card_info=req.dict()
    )
    return result


@router.get("/status")
async def get_status(current_user: dict = Depends(get_current_user)):
    status = await payment_service.get_subscription_status(current_user["_id"])
    return status


@router.post("/cancel")
async def cancel(current_user: dict = Depends(get_current_user)):
    res = await payment_service.cancel_subscription(current_user["_id"])
    return res

