from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import get_current_user
from app.services import marketing_service

router = APIRouter(prefix="/api/marketing", tags=["marketing"])


@router.get("/{deck_id}")
async def get_marketing_report(deck_id: str, current_user: dict = Depends(get_current_user)):
    report = await marketing_service.analyze_deck(deck_id)
    return {"report": report}

