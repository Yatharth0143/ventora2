from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.middleware.auth_middleware import get_current_user
from app.services import graph_service

router = APIRouter(prefix="/api/screener", tags=["screener"])


class BatchScreenRequest(BaseModel):
    deck_ids: list[str]


@router.post("/batch")
async def screen_decks(req: BatchScreenRequest, current_user: dict = Depends(get_current_user)):
    results = await graph_service.batch_screen(req.deck_ids)
    return {"results": results}

