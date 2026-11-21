from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import get_current_user
from app.services import graph_service, matching_service
from app.database import db

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("/conflict/{founder_id}/{investor_id}")
async def check_conflict(founder_id: str, investor_id: str):
    result = await graph_service.check_conflict(founder_id, investor_id)
    return result


@router.get("/cofounders/{founder_id}")
async def get_cofounders(founder_id: str, current_user: dict = Depends(get_current_user)):
    matches = await graph_service.find_cofounders(founder_id)
    return {"matches": matches}


@router.get("/matches/{founder_id}")
async def get_matches(founder_id: str, current_user: dict = Depends(get_current_user)):
    cursor = db.get_db().users.find({"role": "investor"}).limit(30)
    investors = []
    async for inv in cursor:
        inv["_id"] = str(inv["_id"])
        investors.append(inv)

    ranked = await matching_service.rank_investors(founder_id, investors)
    return {"investors": ranked}

