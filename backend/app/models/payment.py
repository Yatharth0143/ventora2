from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class SubscriptionRequest(BaseModel):
    plan: str = "founder_pro"
    card_number: str = "4111111111111111"  # Mock card
    expiry: str = "12/28"
    cvv: str = "123"


class Payment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str = ""
    amount: float = 999.0
    currency: str = "INR"
    status: PaymentStatus = PaymentStatus.PENDING
    plan: str = "founder_pro"
    mock_transaction_id: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

