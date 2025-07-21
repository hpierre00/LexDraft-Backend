from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum

class ResearchStatus(str, Enum):
    PRELIMINARY = "preliminary"
    QUESTIONS_PENDING = "questions_pending"
    COMPLETED = "completed"

class ResearchHistoryCreate(BaseModel):
    title: str = Field(..., max_length=255, description="Title of the research session")
    query: str = Field(..., description="The research query")
    preliminary_result: Optional[str] = Field(None, description="Initial research result")
    clarifying_questions: Optional[List[str]] = Field(None, description="List of clarifying questions")
    status: ResearchStatus = Field(ResearchStatus.PRELIMINARY, description="Status of the research")

class ResearchHistoryUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    clarifying_answers: Optional[Dict[str, str]] = Field(None, description="Answers to clarifying questions")
    final_result: Optional[str] = Field(None, description="Final research result")
    status: Optional[ResearchStatus] = Field(None)

class ResearchHistoryResponse(BaseModel):
    id: str
    user_id: str
    title: str
    query: str
    preliminary_result: Optional[str]
    clarifying_questions: Optional[List[str]]
    clarifying_answers: Optional[Dict[str, str]]
    final_result: Optional[str]
    status: ResearchStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResearchHistoryListResponse(BaseModel):
    id: str
    title: str
    query: str
    status: ResearchStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResearchHistoryListPaginated(BaseModel):
    items: List[ResearchHistoryListResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool 