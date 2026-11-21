from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DeckSection(BaseModel):
    title: str = ""
    content: str = ""
    page_number: int = 0
    quotes: List[str] = []


class DeckCreate(BaseModel):
    title: str
    language: str = "auto"


class Deck(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    founder_id: str = ""
    title: str = ""
    file_url: str = ""
    cloudinary_public_id: str = ""
    original_filename: str = ""
    language: str = "en"
    sections: List[DeckSection] = []
    raw_text: str = ""
    parsed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "uploaded"  # uploaded, parsing, parsed, auditing, audited

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

