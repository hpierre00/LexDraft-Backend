from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import Base
from database import engine
from .routes import router as blog_router

# Create the database tables for the blog models
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app
app = FastAPI(title="Lawverra Blog API")

# CORS configuration to allow frontend to access backend
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the blog router with a prefix
app.include_router(blog_router, prefix="/blog", tags=["blog"])

@app.get("/")
def root():
    """Root endpoint to verify the blog API is running."""
    return {"message": "Welcome to the Lawverra Blog API"}
