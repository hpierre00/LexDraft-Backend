from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, validator


class PostBase(BaseModel):
    title: str
    slug: str
    snippet: str
    content: str
    author_id: int
    category_id: int
    featured_image_url: Optional[str] = None
    featured_image_alt: Optional[str] = None
    status: str = "draft"
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    tags: Optional[List[str]] = []

    @validator('title')
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('title must not be empty')
        return v


class PostCreate(PostBase):
    """Schema for creating a blog post."""
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    snippet: Optional[str] = None
    content: Optional[str] = None
    author_id: Optional[int] = None
    category_id: Optional[int] = None
    featured_image_url: Optional[str] = None
    featured_image_alt: Optional[str] = None
    status: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    tags: Optional[List[str]] = None


class PostResponse(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
