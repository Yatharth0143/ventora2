from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    FOUNDER = "founder"
    INVESTOR = "investor"


class AccountTier(str, Enum):
    FREE = "free"
    PRO = "pro"


class UserCreate(BaseModel):
    email: str
    name: str
    picture: str = ""
    role: UserRole = UserRole.FOUNDER


class UserUpdate(BaseModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    role: Optional[UserRole] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    skills: Optional[List[str]] = None
    sector: Optional[str] = None
    stage: Optional[str] = None


class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    name: str
    picture: str = ""
    role: UserRole = UserRole.FOUNDER
    tier: AccountTier = AccountTier.FREE
    verified: bool = False
    portfolio_url: str = ""
    linkedin_url: str = ""
    skills: List[str] = []
    sector: str = ""
    stage: str = ""
    google_id: str = ""
    findings_shown: Dict[str, int] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

