# app/main.py
from fastapi import FastAPI, Depends
from dotenv import load_dotenv
from app.routes import auth, document, templates, ai_agents, billing  # Import billing router
from app.config import settings
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from app.utils.auth_utils import get_current_user, security
import logging  # Add logging configuration

# --- Basic Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logging.getLogger("httpx").setLevel(logging.WARNING) # Silence noisy httpx logs if needed
logging.getLogger("supabase").setLevel(logging.WARNING) # Silence Supabase logs unless debugging


# Load environment variables first
load_dotenv()

app = FastAPI(
    title="Lawverra API",
    description="API for Lawverra",
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    servers=[
        {"url": "http://localhost:8000", "description": "Local Development"},
        # {"url": "https://api.yourdomain.com", "description": "Production"}, # Uncomment later
    ],
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS, # Use origins from config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
# Existing Routers
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)
app.include_router(
    document.router,
    prefix="/api/v1/documents",
    tags=["Documents"],
    dependencies=[Depends(get_current_user)] # Apply auth dependency globally if needed
)
app.include_router(
    templates.router,
    prefix="/api/v1/templates",
    tags=["Templates"],
    dependencies=[Depends(get_current_user)] # Apply auth dependency globally if needed
)
app.include_router(
    ai_agents.router,
    prefix="/api/v1/ai",
    tags=["AI Agents"],
    dependencies=[Depends(get_current_user)] # Apply auth dependency globally if needed
)

# New Billing Router
app.include_router(
    billing.router,
    prefix="/api/v1/billing", # Define a prefix for billing endpoints
    tags=["Billing"]
    # Note: Authentication (Depends(get_current_user)) is applied PER ENDPOINT in billing.py
    # because the webhook endpoint must be public.
)

@app.get("/", include_in_schema=False)
def health_check():
    return {"status": "OK", "version": settings.PROJECT_VERSION}

# --- OpenAPI Customization ---
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"] = {
        "securitySchemes": {
            "Bearer": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Enter your access token in the format: Bearer <token>"
            }
        }
    }
    
    # Apply security globally
    openapi_schema["security"] = [{"Bearer": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# --- Add dependency import for routers if not already there ---
from fastapi import Depends
from app.utils.auth_utils import get_current_user