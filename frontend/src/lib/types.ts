export type UUID = string

export enum DocumentType {
  FILING = "Filing",
  LETTER = "Letter",
  PETITION = "Petition",
  MOTION = "Motion",
  NOTICE = "Notice",
}

export enum AreaOfLaw {
  FAMILY_LAW = "Family Law",
  MODIFICATIONS = "Modifications",
  CIVIL_LITIGATION = "Civil Litigation",
  PROBATE = "Probate",
  LANDLORD_TENANT = "Landlord-Tenant",
  BUSINESS_TRANSACTIONAL = "Business Transactional",
  LEGAL_AID = "Legal Aid",
  PRO_SE = "Pro Se",
  NDA = "NDA",
  EMPLOYMENT = "Employment",
  CONTRACTS = "Contracts",
  WILLS_AND_TRUSTS = "Wills and Trusts",
  REAL_ESTATE = "Real Estate",
}

export interface DocumentEvaluationResponse {
  risk_score: string
  loopholes: string[]
  strategy: string
  metadata: { [key: string]: string }
  evaluation_summary: string
  weaknesses: string[]
  strengths: string[]
  recommendations_for_update: string[]
  strategies_for_update: string[]
}

export interface ComplianceCheckResult {
  formatting: string
  required_clauses: string[]
  jurisdiction_fit: string
}

// Team Management Types
export enum TeamRole {
  OWNER = "owner",
  ADMIN = "admin", 
  EDITOR = "editor",
  VIEWER = "viewer"
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted", 
  REJECTED = "rejected",
  EXPIRED = "expired"
}

export enum NotificationType {
  TEAM_INVITATION = "team_invitation",
  DOCUMENT_SHARED = "document_shared",
  TEAM_ACTIVITY = "team_activity",
  ROLE_CHANGED = "role_changed"
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  member_count?: number;
  user_role?: TeamRole;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  invited_by?: string;
  user_email?: string;
  user_full_name?: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  status: InvitationStatus;
  invitation_token: string;
  expires_at: string;
  created_at: string;
  responded_at?: string;
  team_name?: string;
  invited_by_name?: string;
}

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id?: string;
  email?: string;
  role: TeamRole;
  shared_by: string;
  created_at: string;
  user_full_name?: string;
  shared_by_name?: string;
}

export interface TeamDocument {
  id: string;
  team_id: string;
  document_id: string;
  shared_by: string;
  created_at: string;
  document_title?: string;
  shared_by_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface TeamDetails {
  team: Team;
  members: TeamMember[];
  pending_invitations: TeamInvitation[];
  recent_documents: TeamDocument[];
  recent_activities: Notification[];
}

// API Request/Response Types
export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface InviteTeamMembersData {
  emails: string[];
  role: TeamRole;
  message?: string;
}

export interface ShareDocumentData {
  email?: string;
  user_id?: string;
  role: TeamRole;
}

export interface ShareTeamDocumentsData {
  document_ids: string[];
}