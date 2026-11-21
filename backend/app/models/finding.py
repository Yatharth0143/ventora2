from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FindingType(str, Enum):
    CONTRADICTION = "contradiction"
    NUMERIC_INCONSISTENCY = "numeric_inconsistency"
    MISSING_EVIDENCE = "missing_evidence"
    STRENGTH = "strength"


class Severity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Quote(BaseModel):
    text: str
    page_number: int
    section_title: str = ""


class NumericClaim(BaseModel):
    claimed_value: float
    claimed_unit: str
    normalized_value_inr: float
    compared_value: float
    compared_unit: str
    compared_normalized_inr: float
    discrepancy: str = ""


class Finding(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    deck_id: str = ""
    type: FindingType = FindingType.CONTRADICTION
    severity: Severity = Severity.MEDIUM
    title: str = ""
    description: str = ""
    quotes: List[Quote] = []
    numeric_claim: Optional[NumericClaim] = None
    is_translated: bool = False
    original_text: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

