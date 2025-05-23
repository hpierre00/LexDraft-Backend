from pydantic import BaseModel
from typing import Optional

class DocumentCreate(BaseModel):
    title: str
    content: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: Optional[str]
    status: str
    created_at: str
    updated_at: str
