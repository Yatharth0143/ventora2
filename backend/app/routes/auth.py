from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.services import auth_service
from app.middleware.auth_middleware import get_current_user
from app.database import db
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    credential: str
    role: Optional[str] = "founder"


class DemoLoginRequest(BaseModel):
    email: str
    name: str
    role: Optional[str] = "founder"


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    stage: Optional[str] = None
    skills: Optional[list[str]] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    preferences: Optional[list[str]] = None
    bio: Optional[str] = None


class SetPreferencesRequest(BaseModel):
    preferences: list[str]


@router.post("/google")
async def google_login(req: GoogleLoginRequest):
    user_info = await auth_service.verify_google_token(req.credential)
    user = await auth_service.get_or_create_user(
        email=user_info["email"],
        name=user_info["name"],
        picture=user_info["picture"],
        google_id=user_info["google_id"],
        role=req.role or "founder",
    )
    token = auth_service.create_jwt(user["_id"], user["email"])
    return {"token": token, "user": user}


@router.post("/demo-login")
async def demo_login(req: DemoLoginRequest):
    user, token = await auth_service.demo_login(email=req.email, name=req.name, role=req.role or "founder")
    return {"token": token, "user": user}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}


@router.put("/profile")
async def update_profile(req: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if "preferences" in update_data:
        update_data["preferences_set"] = True
    if update_data:
        await db.get_db().users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_data}
        )
    updated_user = await db.get_db().users.find_one({"_id": ObjectId(current_user["_id"])})
    updated_user["_id"] = str(updated_user["_id"])
    return {"user": updated_user}


@router.post("/preferences")
async def set_preferences(req: SetPreferencesRequest, current_user: dict = Depends(get_current_user)):
    """Set user interest preferences (called on first login or from profile)."""
    await db.get_db().users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"preferences": req.preferences, "preferences_set": True}}
    )
    updated_user = await db.get_db().users.find_one({"_id": ObjectId(current_user["_id"])})
    updated_user["_id"] = str(updated_user["_id"])
    return {"user": updated_user}

