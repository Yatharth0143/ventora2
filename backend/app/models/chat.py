from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    receiver_id: str
    text: str


class Message(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    sender_id: str = ""
    receiver_id: str = ""
    text: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class Conversation(BaseModel):
    user_id: str
    user_name: str
    user_picture: str = ""
    user_role: str = ""
    user_verified: bool = False
    last_message: str = ""
    last_timestamp: Optional[datetime] = None
    unread_count: int = 0

