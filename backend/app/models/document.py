from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.models.schemas import DocumentEvaluationResponse, ComplianceCheckResult

class DocumentCreate(BaseModel):
    title: str
    content: Optional[str] = None
    client_profile_id: Optional[UUID] = None

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
    evaluation_response: Optional[DocumentEvaluationResponse] = None
    client_profile_id: Optional[UUID] = None
    compliance_check_results: Optional[ComplianceCheckResult] = None
