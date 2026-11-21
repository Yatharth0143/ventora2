from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.middleware.auth_middleware import get_current_user
from app.database import db
from app.services import hash_chain_service
from bson import ObjectId

router = APIRouter(prefix="/api/investors", tags=["investors"])


class VerifyInvestorRequest(BaseModel):
    portfolio_url: str
    linkedin_url: str


@router.get("/")
async def list_investors(
    search: Optional[str] = None,
    sector: Optional[str] = None,
    stage: Optional[str] = None,
    verified_only: Optional[bool] = False,
):
    query = {"role": "investor"}
    if verified_only:
        query["verified"] = True
    if sector and sector != "all":
        query["sector"] = {"$regex": sector, "$options": "i"}
    if stage and stage != "all":
        query["stage"] = {"$regex": stage, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sector": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.get_db().users.find(query).limit(50)
    investors = []
    async for inv in cursor:
        inv["_id"] = str(inv["_id"])
        investors.append(inv)
    return {"investors": investors}


@router.get("/{investor_id}")
async def get_investor(investor_id: str):
    try:
        inv = await db.get_db().users.find_one({"_id": ObjectId(investor_id), "role": "investor"})
        if not inv:
            raise HTTPException(status_code=404, detail="Investor not found")
        inv["_id"] = str(inv["_id"])
        return {"investor": inv}
    except Exception:
        raise HTTPException(status_code=404, detail="Investor not found")


@router.post("/{investor_id}/verify")
async def verify_investor(
    investor_id: str,
    req: VerifyInvestorRequest,
    current_user: dict = Depends(get_current_user)
):
    # Only the investor themselves or admin can verify
    if current_user["_id"] != investor_id:
        raise HTTPException(status_code=403, detail="Unauthorized to verify this account")

    await db.get_db().users.update_one(
        {"_id": ObjectId(investor_id)},
        {"$set": {
            "portfolio_url": req.portfolio_url,
            "linkedin_url": req.linkedin_url,
            "verified": True
        }}
    )

    # Log to tamper-evident hash chain
    await hash_chain_service.append_event(
        event_type="investor_verify",
        payload={"investor_id": investor_id, "portfolio_url": req.portfolio_url, "linkedin_url": req.linkedin_url},
        user_id=investor_id
    )

    updated = await db.get_db().users.find_one({"_id": ObjectId(investor_id)})
    updated["_id"] = str(updated["_id"])
    return {"investor": updated, "message": "Investor verified successfully"}

