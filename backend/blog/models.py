from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, func

from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from database import Base  # import Base from top-level database module

class PostStatus(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    published = "published"
    archived = "archived"


class BlogCategory(Base):
    __tablename__ = "blog_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)

    # Relationship to posts
    posts = relationship("BlogPost", back_populates="category")


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    snippet = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)

    
    category_id = Column(Integer, ForeignKey("blog_categories.id"), nullable=True)

   author_id    = Column(Integer, nullable=False)
    featured_image_alt = Column(String(255), nullable=True)
    status = Column(Enum(PostStatus), default=PostStatus.draft, nullable=False)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)
    tags = Column(ARRAY(String), default=[])

    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)

    is_featured = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)

    # Relationships 
    category = relationship("BlogCategory", back_populates="posts")
