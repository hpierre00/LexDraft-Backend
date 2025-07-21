from pydantic import BaseModel, Field
from datetime import date, datetime
from uuid import UUID, uuid4
from typing import Optional, List, Dict
import enum

class RegisterRequest(BaseModel):
    email: str = Field(..., example="john.doe@example.com")
    password: str = Field(..., example="securepass123")
   

class LoginRequest(BaseModel):
    email: str = Field(..., example="john.doe@example.com")
    password: str = Field(..., example="securepass123")

class ProfileInfo(BaseModel):
    id: Optional[UUID] = Field(None, example=UUID('a1b2c3d4-e5f6-7890-1234-567890abcdef')) # Make id optional for input, will be set from auth.users.id
    user_id: Optional[UUID] = Field(None, example=UUID('550e8400-e29b-41d4-a716-446655440000')) # Make user_id optional for input, will be set by auth
    email: Optional[str] = Field(None, example="john.doe@example.com") # Make email optional for input, will be set by auth
    full_name: str = Field(..., example="John Doe")
    first_name: Optional[str] = Field(None, example="John")
    last_name: Optional[str] = Field(None, example="Doe")
    address: Optional[str] = Field(None, example="123 Main St")
    phone_number: Optional[str] = Field(None, example="555-123-4567")
    gender: Optional[str] = Field(None, example="Male")
    date_of_birth: Optional[date] = Field(None, example=date(1990, 1, 15))
    state: Optional[str] = Field(None, example="FL")
    city: Optional[str] = Field(None, example="Orlando")
    zip_code: Optional[str] = Field(None, example="32801")
    role: Optional[str] = Field(None, example="self", description="User's role: 'self' or 'attorney'") # Added role field

class ClientFolder(BaseModel):
    id: UUID = Field(default_factory=uuid4, example=UUID('a1b2c3d4-e5f6-7890-1234-567890abcdef'))
    attorney_id: UUID = Field(..., example=UUID('550e8400-e29b-41d4-a716-446655440000'))
    client_profile_id: UUID = Field(..., example=UUID('b2c3d4e5-f6a7-8901-2345-67890abcdef0'))
    folder_name: str = Field(..., example="Family Law Cases")
    created_at: datetime = Field(default_factory=datetime.utcnow, example=datetime.fromisoformat('2024-07-20T10:00:00Z'))

class ClientProfileCreate(BaseModel):
    full_name: str = Field(..., example="Alice Smith")
    address: Optional[str] = Field(None, example="456 Oak Ave")
    phone_number: Optional[str] = Field(None, example="555-987-6543")
    gender: Optional[str] = Field(None, example="Female")
    date_of_birth: Optional[date] = Field(None, example=date(1985, 5, 20))
    state: Optional[str] = Field(None, example="NY")
    city: Optional[str] = Field(None, example="New York")
    zip_code: Optional[str] = Field(None, example="10001")
    # Client profiles will automatically have role 'client'

class ClientProfileResponse(BaseModel):
    id: UUID = Field(..., example=UUID('b2c3d4e5-f6a7-8901-2345-67890abcdef0'))
    user_id: Optional[UUID] = Field(None, example=UUID('550e8400-e29b-41d4-a716-446655440000')) # Added user_id
    email: Optional[str] = Field(None, example="alice.smith@example.com") # Added email
    attorney_id: UUID = Field(..., example=UUID('550e8400-e29b-41d4-a716-446655440000'))
    full_name: str = Field(..., example="Alice Smith")
    address: Optional[str] = Field(None, example="456 Oak Ave")
    phone_number: Optional[str] = Field(None, example="555-987-6543")
    gender: Optional[str] = Field(None, example="Female")
    date_of_birth: Optional[date] = Field(None, example=date(1985, 5, 20))
    state: Optional[str] = Field(None, example="NY")
    city: Optional[str] = Field(None, example="New York")
    zip_code: Optional[str] = Field(None, example="10001")
    created_at: datetime = Field(default_factory=datetime.utcnow, example=datetime.fromisoformat('2024-07-20T10:00:00Z'))
    updated_at: datetime = Field(default_factory=datetime.utcnow, example=datetime.fromisoformat('2024-07-20T10:00:00Z'))

class DocumentType(str, enum.Enum):
    FILING = "Filing"
    LETTER = "Letter"
    PETITION = "Petition"
    MOTION = "Motion"
    NOTICE = "Notice"

class AreaOfLaw(str, enum.Enum):
    FAMILY_LAW = "Family Law"
    MODIFICATIONS = "Modifications"
    CIVIL_LITIGATION = "Civil Litigation"
    PROBATE = "Probate"
    LANDLORD_TENANT = "Landlord-Tenant"
    BUSINESS_TRANSACTIONAL = "Business Transactional"
    LEGAL_AID = "Legal Aid"
    PRO_SE = "Pro Se"
    NDA = "NDA"
    EMPLOYMENT = "Employment"
    CONTRACTS = "Contracts"
    WILLS_AND_TRUSTS = "Wills and Trusts"
    REAL_ESTATE = "Real Estate"

class DocumentTemplate(BaseModel):
    id: UUID = Field(default_factory=uuid4, example=UUID('a1b2c3d4-e5f6-7890-1234-567890abcdef'))
    title: str = Field(..., example="Standard Employment Contract")
    document_type: DocumentType = Field(..., example=DocumentType.LETTER)
    area_of_law: AreaOfLaw = Field(..., example=AreaOfLaw.EMPLOYMENT)
    jurisdiction: str = Field(..., example="Florida")
    template_text: str = Field(..., example="This is the template text for an employment contract...")

class DocumentGenerateRequest(BaseModel):
    title: str = Field(..., example="My New Employment Contract")
    document_type: DocumentType = Field(..., example=DocumentType.LETTER)
    area_of_law: AreaOfLaw = Field(..., example=AreaOfLaw.EMPLOYMENT)
    client_profile_id: Optional[UUID] = Field(None, example=UUID('12345678-1234-5678-1234-567812345678'))
    notes: str = Field(..., example="This contract is for a software engineer. Include a non-compete clause.")
    jurisdiction: Optional[str] = Field(None, example="Florida", description="Jurisdiction for the document template")
    county: Optional[str] = Field(None, example="Broward County", description="County for court documents")
    date_of_application: Optional[str] = Field(None, example="2024-07-20", description="Date of application for the document")
    case_number: Optional[str] = Field(None, example="2023-CA-001234", description="Case number for court documents")

class DocumentEvaluationResponse(BaseModel):
    risk_score: str
    loopholes: List[str]
    strategy: str
    metadata: Dict[str, str]
    evaluation_summary: str
    weaknesses: List[str]
    strengths: List[str]
    recommendations_for_update: List[str]
    strategies_for_update: List[str]

class ComplianceCheckResult(BaseModel):
    formatting: str = Field(..., example="Pass")
    required_clauses: List[str] = Field(..., example=["Missing notarization section"])
    jurisdiction_fit: str = Field(..., example="Good")

class Document(BaseModel):
    id: UUID = Field(default_factory=uuid4, example=UUID('a1b2c3d4-e5f6-7890-1234-567890abcdef'))
    user_id: UUID = Field(..., example=UUID('550e8400-e29b-41d4-a716-446655440000'))
    title: str = Field(..., example="Legal Document")
    content: str = Field(..., example="This is the content of the legal document.")
    status: str = Field(..., example="draft")
    created_at: datetime = Field(default_factory=datetime.utcnow, example=datetime.fromisoformat('2024-07-20T10:00:00Z'))
    updated_at: datetime = Field(default_factory=datetime.utcnow, example=datetime.fromisoformat('2024-07-20T10:00:00Z'))
    evaluation_response: Optional[DocumentEvaluationResponse] = Field(None)
    client_profile_id: Optional[UUID] = Field(None, example=UUID('b2c3d4e5-f6a7-8901-2345-67890abcdef0'))
    compliance_check_results: Optional[ComplianceCheckResult] = Field(None)

class DocumentCreate(BaseModel):
    title: str = Field(..., example="My New Employment Contract")
    document_type: DocumentType = Field(..., example=DocumentType.LETTER)
    area_of_law: AreaOfLaw = Field(..., example=AreaOfLaw.EMPLOYMENT)
    client_profile_id: Optional[UUID] = Field(None, example=UUID('12345678-1234-5678-1234-567812345678'))
    notes: str = Field(..., example="This contract is for a software engineer. Include a non-compete clause.")
    jurisdiction: Optional[str] = Field(None, example="Florida", description="Jurisdiction for the document template")

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

class GenerateRequest(BaseModel):
    user_input: str
