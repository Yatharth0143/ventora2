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
    founder_name: str = ""
    founder_picture: str = ""
    title: str = ""
    description: str = ""
    file_url: str = ""
    video_url: str = ""
    thumbnail_url: str = ""
    cloudinary_public_id: str = ""
    video_public_id: str = ""
    original_filename: str = ""
    language: str = "en"
    tags: List[str] = []
    sectors: List[str] = []
    stage: str = ""
    sections: List[DeckSection] = []
    raw_text: str = ""
    parsed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "uploaded"
    likes: List[str] = []
    bookmarks: List[str] = []
    views: int = 0
    is_garbage_idea: bool = False

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
