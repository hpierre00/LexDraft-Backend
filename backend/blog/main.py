from fastapi import FastAPI
from .routes import router as blog_router
from .models import Base
from ..database import engine

# Create the database tables for the blog models
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app
app = FastAPI(title="Lawverra Blog API")

# Include the blog router with a prefix
app.include_router(blog_router, prefix="/blog", tags=["blog"])

@app.get("/")
def root():
    """Root endpoint to verify the blog API is running."""
    return {"message": "Welcome to the Lawverra Blog API"}
