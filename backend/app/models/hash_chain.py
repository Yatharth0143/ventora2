from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class EventType(str, Enum):
    DECK_VIEW = "deck_view"
    FINDING_CLICK = "finding_click"
    CHAT_MESSAGE = "chat_message"
    PAYMENT = "payment"
    AUDIT_RUN = "audit_run"
    DECK_UPLOAD = "deck_upload"
    INVESTOR_VERIFY = "investor_verify"


class HashChainEntry(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    event_type: EventType
    payload: Dict[str, Any] = {}
    hash: str = ""
    previous_hash: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = ""

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

