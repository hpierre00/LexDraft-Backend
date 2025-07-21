from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

# Enums
class TeamRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class NotificationType(str, Enum):
    TEAM_INVITATION = "team_invitation"
    DOCUMENT_SHARED = "document_shared"
    TEAM_ACTIVITY = "team_activity"
    ROLE_CHANGED = "role_changed"

# Team Models
class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, example="Legal Team Alpha")
    description: Optional[str] = Field(None, max_length=1000, example="Primary legal document review team")

class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None

class TeamResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool
    member_count: Optional[int] = None
    user_role: Optional[TeamRole] = None  # Current user's role in this team

# Team Member Models
class TeamMemberCreate(BaseModel):
    user_id: UUID
    role: TeamRole = TeamRole.VIEWER

class TeamMemberUpdate(BaseModel):
    role: TeamRole

class TeamMemberResponse(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    role: TeamRole
    joined_at: datetime
    invited_by: Optional[UUID]
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None

# Team Invitation Models
class TeamInvitationCreate(BaseModel):
    email: EmailStr
    role: TeamRole = TeamRole.VIEWER
    message: Optional[str] = Field(None, max_length=500, example="You've been invited to join our legal team!")

class TeamInvitationBulkCreate(BaseModel):
    emails: List[EmailStr] = Field(..., min_items=1, max_items=50)
    role: TeamRole = TeamRole.VIEWER
    message: Optional[str] = Field(None, max_length=500)

class TeamInvitationResponse(BaseModel):
    id: UUID
    team_id: UUID
    email: str
    role: TeamRole
    invited_by: UUID
    status: InvitationStatus
    invitation_token: str
    expires_at: datetime
    created_at: datetime
    responded_at: Optional[datetime]
    team_name: Optional[str] = None
    invited_by_name: Optional[str] = None

class TeamInvitationAccept(BaseModel):
    token: str

# Document Collaboration Models
class DocumentCollaboratorCreate(BaseModel):
    email: Optional[EmailStr] = None
    user_id: Optional[UUID] = None
    role: TeamRole = TeamRole.VIEWER

class DocumentCollaboratorUpdate(BaseModel):
    role: TeamRole

class DocumentCollaboratorResponse(BaseModel):
    id: UUID
    document_id: UUID
    user_id: Optional[UUID]
    email: Optional[str]
    role: TeamRole
    shared_by: UUID
    created_at: datetime
    user_full_name: Optional[str] = None
    shared_by_name: Optional[str] = None

# Team Document Models
class TeamDocumentShare(BaseModel):
    document_id: UUID

class TeamDocumentResponse(BaseModel):
    id: UUID
    team_id: UUID
    document_id: UUID
    shared_by: UUID
    created_at: datetime
    document_title: Optional[str] = None
    shared_by_name: Optional[str] = None

# Notification Models
class NotificationCreate(BaseModel):
    user_id: UUID
    type: NotificationType
    title: str
    message: str
    data: Optional[dict] = None
    expires_at: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    is_read: bool = True

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: NotificationType
    title: str
    message: str
    data: Optional[dict]
    is_read: bool
    created_at: datetime
    expires_at: Optional[datetime]

# Dashboard/Summary Models
class TeamSummary(BaseModel):
    total_teams: int
    owned_teams: int
    member_teams: int
    recent_invitations: List[TeamInvitationResponse]
    recent_activities: List[NotificationResponse]

class TeamDetails(BaseModel):
    team: TeamResponse
    members: List[TeamMemberResponse]
    pending_invitations: List[TeamInvitationResponse]
    recent_documents: List[TeamDocumentResponse]
    recent_activities: List[NotificationResponse]

# Search and Filter Models
class TeamListFilter(BaseModel):
    search: Optional[str] = None
    role: Optional[TeamRole] = None
    is_active: Optional[bool] = True
    limit: int = Field(50, ge=1, le=100)
    offset: int = Field(0, ge=0)

class MemberListFilter(BaseModel):
    search: Optional[str] = None
    role: Optional[TeamRole] = None
    limit: int = Field(50, ge=1, le=100)
    offset: int = Field(0, ge=0)

# Email notification models
class EmailInvitationData(BaseModel):
    team_name: str
    invited_by_name: str
    invitation_token: str
    expires_at: datetime
    role: TeamRole
    message: Optional[str] = None 