from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.middleware.auth_middleware import get_current_user
from app.database import db
from app.services import hash_chain_service
from bson import ObjectId
from app.config import settings
router = APIRouter(prefix="/api/investors", tags=["investors"])


class VerifyInvestorRequest(BaseModel):
    portfolio_url: str
    linkedin_url: str

@router.get("/")
async def list_investors(
    current_user: dict = Depends(get_current_user),
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

    public_fields = {
        "_id", "name", "picture", "sector", "stage",
        "verified", "portfolio_url", "linkedin_url"
    }

    investors = []
    async for inv in cursor:
        safe_inv = {k: v for k, v in inv.items() if k in public_fields}
        safe_inv["_id"] = str(safe_inv["_id"])
        investors.append(safe_inv)

    return {"investors": investors}

@router.get("/{investor_id}")
async def get_investor(
    investor_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        inv = await db.get_db().users.find_one(
    {"_id": ObjectId(investor_id), "role": "investor"},
    {
        "name": 1,
        "picture": 1,
        "sector": 1,
        "stage": 1,
        "verified": 1,
        "portfolio_url": 1,
        "linkedin_url": 1,
    }
)
        if not inv:
            raise HTTPException(status_code=404, detail="Investor not found")
        public_fields = (
            "_id", "name", "picture", "sector", "stage",
            "verified", "portfolio_url", "linkedin_url"
    )

        safe_inv = {key: inv[key] for key in public_fields if key in inv}
        safe_inv["_id"] = str(safe_inv["_id"])

        return {"investor": safe_inv}
    
    except Exception:
        raise HTTPException(status_code=404, detail="Investor not found")


@router.post("/{investor_id}/verify")
async def verify_investor(
    investor_id: str,
    req: VerifyInvestorRequest,
    current_user: dict = Depends(get_current_user)
):
    # Only the investor themselves or admin can verify
    admin_emails = {
        email.strip().lower()
        for email in settings.ADMIN_EMAILS.split(",")
        if email.strip()
    }

    if current_user.get("email", "").lower() not in admin_emails:
        raise HTTPException(status_code=403, detail="Admin access required")

    await db.get_db().users.update_one(
        {"_id": ObjectId(investor_id), "role": "investor"},
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

    updated = await db.get_db().users.find_one(
        {"_id": ObjectId(investor_id), "role": "investor"},
        {
            "name": 1,
            "picture": 1,
            "sector": 1,
            "stage": 1,
            "verified": 1,
            "portfolio_url": 1,
            "linkedin_url": 1,
        }
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Investor not found")

    updated["_id"] = str(updated["_id"])
    return {"investor": updated, "message": "Investor verified successfully"}

