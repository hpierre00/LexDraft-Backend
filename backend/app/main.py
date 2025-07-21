# app/main.py
from fastapi import FastAPI, Depends
from dotenv import load_dotenv
from app.routes import auth, document, templates, ai_agents, billing, clients, agents, admin, contact, support, research, teams, teams_documents
from app.config import settings
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from app.utils.auth_utils import get_current_user, security
import logging  # Add logging configuration

# --- Basic Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Set specific loggers to WARNING or ERROR to reduce noise
logging.getLogger("httpx").setLevel(logging.WARNING)  # Only show warnings and errors
logging.getLogger("supabase").setLevel(logging.WARNING)  # Only show warnings and errors
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)  # Only show warnings and errors for access logs
logging.getLogger("uvicorn.error").setLevel(logging.INFO)  # Keep error logs
logging.getLogger("fastapi").setLevel(logging.WARNING)  # Only show warnings and errors


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

# New Clients Router
app.include_router(
    clients.router,
    prefix="/api/v1/attorney",
    tags=["Client Management"]
)

# --- Register Chat Lawyer Agent Router ---
app.include_router(
    agents.router,
    prefix="/api/v1/agents",
    tags=["Agents"]
)

# New Contact Router
app.include_router(
    contact.router,
    prefix="/api/v1/contact",
    tags=["Contact"]
)

# New Support Router
app.include_router(
    support.router,
    prefix="/api/v1/support",
    tags=["Support"]
)

# New Admin Router
app.include_router(
    admin.router,
    prefix="/api/v1/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_user)]
)

# New Research Router
app.include_router(
    research.router,
    prefix="/api/v1/research",
    tags=["Legal Research"],
    dependencies=[Depends(get_current_user)]
)

# Team Management Routes
app.include_router(
    teams.router,
    prefix="/api/v1/teams",
    tags=["Teams"],
    dependencies=[Depends(get_current_user)]
)

# Team Document Collaboration Routes
app.include_router(
    teams_documents.router,
    prefix="/api/v1/collaboration",
    tags=["Team Collaboration"],
    dependencies=[Depends(get_current_user)]
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