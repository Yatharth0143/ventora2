import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from bson import ObjectId

from app.config import settings
from app.database import db
from app.models.user import UserRole, AccountTier


def create_jwt(user_id: str, email: str) -> str:
    payload = {
        "user_id": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


async def verify_google_token(credential: str) -> dict:
    try:
        # In case settings.GOOGLE_CLIENT_ID is empty, try validating without client audience check or fallback
        audience = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID != "YOUR_GOOGLE_CLIENT_ID_HERE" else None
        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            audience=audience
        )
        return {
            "email": id_info.get("email"),
            "name": id_info.get("name", ""),
            "picture": id_info.get("picture", ""),
            "google_id": id_info.get("sub", ""),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )


async def get_or_create_user(email: str, name: str, picture: str = "", google_id: str = "", role: str = "founder") -> dict:
    users_coll = db.get_db().users
    user = await users_coll.find_one({"email": email})
    if not user:
        new_user = {
            "email": email,
            "name": name,
            "picture": picture,
            "role": role if role in ["founder", "investor", "admin"] else UserRole.FOUNDER.value,
            "tier": AccountTier.FREE.value,
            "verified": False,
            "portfolio_url": "",
            "linkedin_url": "",
            "skills": [],
            "sector": "",
            "stage": "",
            "google_id": google_id,
            "findings_shown": {},
            "created_at": datetime.utcnow(),
        }
        res = await users_coll.insert_one(new_user)
        user = await users_coll.find_one({"_id": res.inserted_id})
    user["_id"] = str(user["_id"])
    return user


async def demo_login(email: str, name: str, role: str = "founder") -> tuple[dict, str]:
    user = await get_or_create_user(email=email, name=name, picture="", google_id="demo_" + email, role=role)
    token = create_jwt(user["_id"], user["email"])
    return user, token

