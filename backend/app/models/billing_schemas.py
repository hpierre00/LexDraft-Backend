# app/models/billing_schemas.py
from pydantic import BaseModel
from typing import Optional, Dict, Any

class CreateCheckoutSessionRequest(BaseModel):
    priceId: str

class CreateOneTimePaymentRequest(BaseModel):
    priceId: str
    quantity: int = 1

class UserStatusResponse(BaseModel):
    plan: str
    status: str
    stripeCustomerId: Optional[str] = None
    trial_ends_at: Optional[int] = None # Unix timestamp
    renews_at: Optional[int] = None     # Unix timestamp
    limits: Dict[str, Any] = {}
    usage: Dict[str, int] = {}
    features: Dict[str, bool] = {} # For easily checking feature flags