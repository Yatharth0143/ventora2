from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import get_current_user
from app.services import graph_service, matching_service
from app.database import db
from fastapi import APIRouter, Depends, HTTPException
router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("/conflict/{founder_id}/{investor_id}")
async def check_conflict(founder_id: str, investor_id: str, current_user: dict = Depends(get_current_user)):
    if founder_id != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    result = await graph_service.check_conflict(founder_id, investor_id)
    return result


@router.get("/cofounders/{founder_id}")
async def get_cofounders(founder_id: str, current_user: dict = Depends(get_current_user)):
    if founder_id != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    matches = await graph_service.find_cofounders(founder_id)
    return {"matches": matches}


@router.get("/matches/{founder_id}")
async def get_matches(founder_id: str, current_user: dict = Depends(get_current_user)):
    if founder_id != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    cursor = db.get_db().users.find({"role": "investor"}).limit(30)
    investors = []
    async for inv in cursor:
        inv["_id"] = str(inv["_id"])
        investors.append(inv)

    ranked = await matching_service.rank_investors(founder_id, investors)
    safe_investors = []
    for inv in ranked:
        safe_investors.append({
            key: inv[key]
            for key in (
                "_id", "name", "picture", "sector", "stage",
                "verified", "portfolio_url", "linkedin_url",
                "fit_score", "match_score", "reason", "match_reason"
            )
            if key in inv
        })
    return {"investors": safe_investors}

