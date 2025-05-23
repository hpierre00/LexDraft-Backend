# app/config.py
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "LegalDoc SaaS"
    PROJECT_VERSION: str = "1.0.0"
    CORS_ORIGINS: List[str] = ["*"]

    # Server configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG_MODE: bool = True
    WORKERS: int = 1
    LOG_LEVEL: str = "INFO"

    # Supabase configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str

    # OpenAI API Key
    OPENAI_API_KEY: str

    # --- Stripe Configuration ---
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    FRONTEND_URL: str = "http://localhost:3000" # Default value

    # --- Stripe Price IDs ---
    # It's often better to load these from env for flexibility
    PRICE_STARTER: str
    PRICE_PRO: str
    PRICE_PREMIUM: str
    PRICE_ENTERPRISE: Optional[str] = None # Make optional if not always used
    PRICE_DOC_PAYG: str
    PRICE_AI_REPORT: str

    class Config:
        env_file = ".env"
        case_sensitive = True # Keep if needed, but Stripe vars are usually upper

settings = Settings()

# --- Define Price ID to Plan Mapping ---
# This makes the code more readable than using raw price IDs everywhere
PRICE_ID_TO_PLAN = {
    settings.PRICE_STARTER: "starter",
    settings.PRICE_PRO: "pro",
    settings.PRICE_PREMIUM: "premium",
    # Handle optional enterprise price ID
    **( {settings.PRICE_ENTERPRISE: "enterprise"} if settings.PRICE_ENTERPRISE else {} )
}
PLAN_NAME_TO_PRICE_ID = {v: k for k, v in PRICE_ID_TO_PLAN.items()}