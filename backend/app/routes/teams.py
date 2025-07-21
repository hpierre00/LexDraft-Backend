from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
import secrets
import string
from datetime import datetime, timedelta
import logging

from app.utils.auth_utils import get_current_user, security
from app.models.database import supabase
from app.models.team_schemas import (
    TeamCreate, TeamUpdate, TeamResponse, TeamDetails, TeamSummary,
    TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse,
    TeamInvitationCreate, TeamInvitationBulkCreate, TeamInvitationResponse, TeamInvitationAccept,
    DocumentCollaboratorCreate, DocumentCollaboratorUpdate, DocumentCollaboratorResponse,
    TeamDocumentShare, TeamDocumentResponse,
    NotificationCreate, NotificationResponse,
    TeamListFilter, MemberListFilter,
    TeamRole, InvitationStatus, NotificationType,
    EmailInvitationData
)
from app.services.email_service import email_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Team Management Routes

@router.post("/create", tags=["Teams"], response_model=TeamResponse)
async def create_team(
    team_data: TeamCreate,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a new team"""
    try:
        logger.info(f"Creating team '{team_data.name}' for user {user['id']}")
        
        team_insert_data = {
            "name": team_data.name,
            "description": team_data.description,
            "owner_id": user["id"]
        }
        
        response = supabase.from_("teams").insert(team_insert_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create team")
        
        created_team = response.data[0]
        
        # Add member count and user role
        created_team["member_count"] = 1
        created_team["user_role"] = TeamRole.OWNER
        
        logger.info(f"Team created successfully: {created_team['id']}")
        return created_team
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/list", tags=["Teams"], response_model=List[TeamResponse])
async def list_teams(
    search: Optional[str] = Query(None),
    role: Optional[TeamRole] = Query(None),
    is_active: Optional[bool] = Query(True),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """List teams for the current user"""
    try:
        logger.info(f"Listing teams for user {user['id']}")
        
        # Build query for teams where user is owner or member
        query = supabase.from_("teams").select("""
            id, name, description, owner_id, created_at, updated_at, is_active,
            team_members!inner(role)
        """).eq("team_members.user_id", user["id"])
        
        if search:
            query = query.ilike("name", f"%{search}%")
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
            
        if role:
            query = query.eq("team_members.role", role.value)
        
        query = query.range(offset, offset + limit - 1)
        response = query.execute()
        
        teams = []
        for team_data in response.data:
            # Get member count
            member_count_response = supabase.from_("team_members").select("id", count="exact").eq("team_id", team_data["id"]).execute()
            member_count = member_count_response.count or 0
            
            # Get user's role in this team - fix the data access
            user_role = TeamRole.VIEWER  # default
            if "team_members" in team_data and team_data["team_members"]:
                # team_members could be a list or a single object
                team_members_data = team_data["team_members"]
                if isinstance(team_members_data, list) and len(team_members_data) > 0:
                    user_role = team_members_data[0]["role"]
                elif isinstance(team_members_data, dict) and "role" in team_members_data:
                    user_role = team_members_data["role"]
            
            team_response = {
                "id": team_data["id"],
                "name": team_data["name"],
                "description": team_data["description"],
                "owner_id": team_data["owner_id"],
                "created_at": team_data["created_at"],
                "updated_at": team_data["updated_at"],
                "is_active": team_data["is_active"],
                "member_count": member_count,
                "user_role": user_role
            }
            teams.append(team_response)
        
        logger.info(f"Found {len(teams)} teams for user {user['id']}")
        return teams
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing teams: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{team_id}", tags=["Teams"], response_model=TeamDetails)
async def get_team_details(
    team_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get detailed team information"""
    try:
        logger.info(f"Getting team details for team {team_id}, user {user['id']}")
        
        # Check if user is a member of the team
        member_check = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not member_check.data:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this team")
        
        # Get team info
        team_response = supabase.from_("teams").select("*").eq("id", str(team_id)).single().execute()
        
        if not team_response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team = team_response.data
        
        # Get team members (without profiles join)
        members_response = supabase.from_("team_members").select("""
            id, team_id, user_id, role, joined_at, invited_by
        """).eq("team_id", str(team_id)).execute()
        
        members = []
        for member in members_response.data:
            # Get profile data separately
            try:
                profile_response = supabase.from_("profiles").select("email, full_name").eq("user_id", member["user_id"]).single().execute()
                profile = profile_response.data if profile_response.data else {}
            except Exception as profile_error:
                logger.warning(f"Could not fetch profile for user {member['user_id']}: {profile_error}")
                profile = {}
            
            member_data = {
                "id": member["id"],
                "team_id": member["team_id"],
                "user_id": member["user_id"],
                "role": member["role"],
                "joined_at": member["joined_at"],
                "invited_by": member.get("invited_by"),
                "user_email": profile.get("email"),
                "user_full_name": profile.get("full_name")
            }
            members.append(member_data)
        
        # Get pending invitations
        invitations_response = supabase.from_("team_invitations").select("""
            id, team_id, email, role, invited_by, status, invitation_token,
            created_at, expires_at, responded_at
        """).eq("team_id", str(team_id)).eq("status", "pending").execute()
        
        # Process invitations to ensure all required fields are present
        processed_invitations = []
        for invitation in invitations_response.data or []:
            processed_invitation = {
                "id": invitation["id"],
                "team_id": invitation["team_id"],
                "email": invitation["email"],
                "role": invitation["role"],
                "invited_by": invitation["invited_by"],
                "status": invitation["status"],
                "invitation_token": invitation["invitation_token"],
                "expires_at": invitation["expires_at"],
                "created_at": invitation["created_at"],
                "responded_at": invitation.get("responded_at"),  # This can be None for pending invitations
                "team_name": None,  # Will be filled if needed
                "invited_by_name": None  # Will be filled if needed
            }
            processed_invitations.append(processed_invitation)
        
        # Get recent team documents  
        documents_response = supabase.from_("team_documents").select("""
            id, team_id, document_id, shared_by, created_at
        """).eq("team_id", str(team_id)).limit(10).execute()
        
        # Get recent activities (notifications)
        activities_response = supabase.from_("notifications").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(10).execute()
        
        # Build response
        response_data = {
            "team": {
                "id": team["id"],
                "name": team["name"],
                "description": team["description"],
                "owner_id": team["owner_id"],
                "created_at": team["created_at"],
                "updated_at": team["updated_at"],
                "is_active": team["is_active"],
                "user_role": member_check.data[0]["role"]
            },
            "members": members,
            "pending_invitations": processed_invitations,
            "recent_documents": documents_response.data or [],
            "recent_activities": activities_response.data or []
        }
        
        logger.info(f"Team details retrieved for team {team_id}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting team details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{team_id}", tags=["Teams"], response_model=TeamResponse)
async def update_team(
    team_id: UUID,
    team_data: TeamUpdate,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Update team information (owner only)"""
    try:
        logger.info(f"Updating team {team_id} by user {user['id']}")
        
        # Check if user is team owner
        team_response = supabase.from_("teams").select("owner_id").eq("id", str(team_id)).single().execute()
        
        if not team_response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        if team_response.data["owner_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied: Only team owner can update team")
        
        # Update team
        update_data = team_data.dict(exclude_unset=True)
        if update_data:
            response = supabase.from_("teams").update(update_data).eq("id", str(team_id)).execute()
            
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to update team")
            
            updated_team = response.data[0]
            
            # Add member count and user role
            member_count_response = supabase.from_("team_members").select("id", count="exact").eq("team_id", str(team_id)).execute()
            updated_team["member_count"] = member_count_response.count or 0
            updated_team["user_role"] = TeamRole.OWNER
            
            logger.info(f"Team {team_id} updated successfully")
            return updated_team
        else:
            raise HTTPException(status_code=400, detail="No update data provided")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{team_id}", tags=["Teams"])
async def delete_team(
    team_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Delete team (owner only)"""
    try:
        logger.info(f"Deleting team {team_id} by user {user['id']}")
        
        # Check if user is team owner
        team_response = supabase.from_("teams").select("owner_id, name").eq("id", str(team_id)).single().execute()
        
        if not team_response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        if team_response.data["owner_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied: Only team owner can delete team")
        
        # Delete team (cascade will handle related records)
        supabase.from_("teams").delete().eq("id", str(team_id)).execute()
        
        logger.info(f"Team {team_id} deleted successfully")
        return {"message": f"Team '{team_response.data['name']}' deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Team Invitation Routes

def generate_invitation_token() -> str:
    """Generate a secure invitation token"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

@router.post("/{team_id}/invite", tags=["Team Invitations"], response_model=List[TeamInvitationResponse])
async def invite_team_members(
    team_id: UUID,
    invitation_data: TeamInvitationBulkCreate,
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Invite members to team"""
    try:
        logger.info(f"Inviting {len(invitation_data.emails)} members to team {team_id}")
        logger.info(f"Current user ID: {user['id']}")
        
        # Check if user can invite (owner or admin)
        member_check = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not member_check.data or member_check.data[0]["role"] not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied: Only team owner or admin can invite members")
        
        # Get team info for email
        team_response = supabase.from_("teams").select("name").eq("id", str(team_id)).single().execute()
        if not team_response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team_name = team_response.data["name"]
        
        # Get inviter info
        inviter_response = supabase.from_("profiles").select("full_name").eq("id", user["id"]).single().execute()
        inviter_name = inviter_response.data.get("full_name", "Team Admin") if inviter_response.data else "Team Admin"
        
        created_invitations = []
        skipped_emails = []
        
        for email in invitation_data.emails:
            try:
                # First, check if the user exists and get their ID
                user_profile = supabase.from_("profiles").select("id").eq("email", email).execute()
                user_id = None
                if user_profile.data:
                    user_id = user_profile.data[0]["id"]
                
                # Check if user is already a member (only if user exists)
                existing_member = None
                if user_id:
                    existing_member = supabase.from_("team_members").select("id").eq("team_id", str(team_id)).eq("user_id", user_id).execute()
                    if existing_member.data:
                        logger.warning(f"User {email} is already a member of team {team_id}")
                        skipped_emails.append({"email": email, "reason": "already_member"})
                        continue
                
                # Check for existing pending invitation
                existing_invitation = supabase.from_("team_invitations").select("id").eq("team_id", str(team_id)).eq("email", email).eq("status", "pending").execute()
                
                if existing_invitation.data:
                    logger.warning(f"Pending invitation already exists for {email}")
                    skipped_emails.append({"email": email, "reason": "pending_invitation"})
                    continue
                
                # Create invitation
                invitation_token = generate_invitation_token()
                expires_at = datetime.utcnow() + timedelta(days=7)  # 7 days expiration
                
                invitation_insert_data = {
                    "team_id": str(team_id),
                    "email": email,
                    "role": invitation_data.role.value,
                    "invited_by": user["id"],
                    "invitation_token": invitation_token,
                    "expires_at": expires_at.isoformat()
                }
                
                logger.info(f"Creating invitation with data: {invitation_insert_data}")
                response = supabase.from_("team_invitations").insert(invitation_insert_data).execute()
                logger.info(f"Invitation response: {response}")
                
                if response.data:
                    invitation = response.data[0]
                    
                    # Send email invitation
                    email_data = EmailInvitationData(
                        team_name=team_name,
                        invited_by_name=inviter_name,
                        invitation_token=invitation_token,
                        expires_at=expires_at,
                        role=invitation_data.role,
                        message=invitation_data.message
                    )
                    
                    email_sent = email_service.send_team_invitation(email_data, email)
                    
                    if not email_sent:
                        logger.warning(f"Failed to send invitation email to {email}")
                    
                    # Add team name and inviter name to response
                    invitation["team_name"] = team_name
                    invitation["invited_by_name"] = inviter_name
                    
                    created_invitations.append(invitation)
                    
                    # Create notification for existing users
                    if user_id:
                        notification_data = {
                            "user_id": user_id,
                            "type": NotificationType.TEAM_INVITATION.value,
                            "title": f"Team Invitation: {team_name}",
                            "message": f"You've been invited to join {team_name} by {inviter_name}",
                            "data": {
                                "team_id": str(team_id),
                                "invitation_token": invitation_token,
                                "role": invitation_data.role.value
                            },
                            "is_read": False,
                            "created_at": datetime.utcnow().isoformat()
                        }
                        notification_result = supabase.from_("notifications").insert(notification_data).execute()
                        if notification_result.data:
                            logger.info(f"Notification created for user {user_id} about team invitation")
                        else:
                            logger.warning(f"Failed to create notification for user {user_id}")
                    
                    logger.info(f"Invitation sent to {email}")
                    
            except Exception as e:
                logger.error(f"Failed to create invitation for {email}: {str(e)}")
                continue
        
        if not created_invitations:
            # If no invitations were created, provide detailed feedback
            if skipped_emails:
                skipped_details = []
                for skipped in skipped_emails:
                    if skipped["reason"] == "already_member":
                        skipped_details.append(f"{skipped['email']} is already a team member")
                    elif skipped["reason"] == "pending_invitation":
                        skipped_details.append(f"{skipped['email']} already has a pending invitation")
                
                detail_message = f"No new invitations were created. {', '.join(skipped_details)}"
                raise HTTPException(status_code=400, detail=detail_message)
            else:
                raise HTTPException(status_code=400, detail="No invitations were created")
        
        # If some invitations were created but some were skipped, include that info
        response_message = f"Created {len(created_invitations)} invitation(s) for team {team_id}"
        if skipped_emails:
            skipped_details = []
            for skipped in skipped_emails:
                if skipped["reason"] == "already_member":
                    skipped_details.append(f"{skipped['email']} is already a team member")
                elif skipped["reason"] == "pending_invitation":
                    skipped_details.append(f"{skipped['email']} already has a pending invitation")
            
            response_message += f". Skipped: {', '.join(skipped_details)}"
        
        logger.info(response_message)
        return created_invitations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inviting team members: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{team_id}/invitations", tags=["Team Invitations"], response_model=List[TeamInvitationResponse])
async def list_team_invitations(
    team_id: UUID,
    status: Optional[InvitationStatus] = Query(None),
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """List team invitations"""
    try:
        # Check if user can view invitations (owner or admin)
        member_check = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not member_check.data or member_check.data[0]["role"] not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied: Only team owner or admin can view invitations")
        
        query = supabase.from_("team_invitations").select("""
            id, team_id, email, role, invited_by, status, invitation_token,
            expires_at, created_at, responded_at,
            teams!inner(name),
            profiles!inner(full_name)
        """).eq("team_id", str(team_id))
        
        if status:
            query = query.eq("status", status.value)
        
        response = query.order("created_at", desc=True).execute()
        
        invitations = []
        for invitation in response.data:
            team = invitation.get("teams", {})
            profile = invitation.get("profiles", {})
            invitation_data = {
                "id": invitation["id"],
                "team_id": invitation["team_id"],
                "email": invitation["email"],
                "role": invitation["role"],
                "invited_by": invitation["invited_by"],
                "status": invitation["status"],
                "invitation_token": invitation["invitation_token"],
                "expires_at": invitation["expires_at"],
                "created_at": invitation["created_at"],
                "responded_at": invitation.get("responded_at"),
                "team_name": team.get("name"),
                "invited_by_name": profile.get("full_name")
            }
            invitations.append(invitation_data)
        
        return invitations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing team invitations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/invitations/accept", tags=["Team Invitations"], response_model=TeamMemberResponse)
async def accept_team_invitation(
    invitation_data: TeamInvitationAccept,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Accept team invitation"""
    try:
        logger.info(f"User {user['id']} accepting invitation with token {invitation_data.token}")
        
        # Find and validate invitation
        invitation_response = supabase.from_("team_invitations").select("*").eq("invitation_token", invitation_data.token).eq("status", "pending").single().execute()
        
        if not invitation_response.data:
            raise HTTPException(status_code=404, detail="Invalid or expired invitation")
        
        invitation = invitation_response.data
        
        # Check if invitation has expired
        expires_at = datetime.fromisoformat(invitation["expires_at"].replace('Z', '+00:00'))
        if expires_at < datetime.utcnow().replace(tzinfo=expires_at.tzinfo):
            # Mark as expired
            supabase.from_("team_invitations").update({"status": "expired"}).eq("id", invitation["id"]).execute()
            raise HTTPException(status_code=400, detail="Invitation has expired")
        
        # Get user email to verify
        user_response = supabase.from_("profiles").select("email").eq("id", user["id"]).single().execute()
        if not user_response.data or user_response.data["email"] != invitation["email"]:
            raise HTTPException(status_code=403, detail="Invitation email does not match your account")
        
        # Check if user is already a member
        existing_member = supabase.from_("team_members").select("id").eq("team_id", invitation["team_id"]).eq("user_id", user["id"]).execute()
        
        if existing_member.data:
            # Update invitation status anyway
            supabase.from_("team_invitations").update({"status": "accepted", "responded_at": datetime.utcnow().isoformat()}).eq("id", invitation["id"]).execute()
            raise HTTPException(status_code=400, detail="You are already a member of this team")
        
        # Add user to team
        member_data = {
            "team_id": invitation["team_id"],
            "user_id": user["id"],
            "role": invitation["role"],
            "invited_by": invitation["invited_by"]
        }
        
        member_response = supabase.from_("team_members").insert(member_data).execute()
        
        if not member_response.data:
            raise HTTPException(status_code=500, detail="Failed to add user to team")
        
        # Update invitation status
        supabase.from_("team_invitations").update({"status": "accepted", "responded_at": datetime.utcnow().isoformat()}).eq("id", invitation["id"]).execute()
        
        created_member = member_response.data[0]
        
        # Add user details to response
        created_member["user_email"] = user_response.data["email"]
        created_member["user_full_name"] = user_response.data.get("full_name")
        
        logger.info(f"User {user['id']} successfully joined team {invitation['team_id']}")
        return created_member
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting team invitation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Team Member Management Routes

@router.get("/{team_id}/members", tags=["Team Members"], response_model=List[TeamMemberResponse])
async def list_team_members(
    team_id: UUID,
    search: Optional[str] = Query(None),
    role: Optional[TeamRole] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """List team members"""
    try:
        # Check if user is a team member
        member_check = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not member_check.data:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this team")
        
        # Get team members (without profiles join)
        query = supabase.from_("team_members").select("""
            id, team_id, user_id, role, joined_at, invited_by
        """).eq("team_id", str(team_id))
        
        if role:
            query = query.eq("role", role.value)
        
        # Note: Search filtering will be done after fetching profiles
        query = query.range(offset, offset + limit - 1)
        response = query.execute()
        
        members = []
        for member in response.data:
            # Get profile data separately
            try:
                profile_response = supabase.from_("profiles").select("email, full_name").eq("user_id", member["user_id"]).single().execute()
                profile = profile_response.data if profile_response.data else {}
            except Exception as profile_error:
                logger.warning(f"Could not fetch profile for user {member['user_id']}: {profile_error}")
                profile = {}
            
            # Apply search filter if provided
            if search:
                full_name = profile.get("full_name", "").lower()
                email = profile.get("email", "").lower()
                search_lower = search.lower()
                if search_lower not in full_name and search_lower not in email:
                    continue
            
            member_data = {
                "id": member["id"],
                "team_id": member["team_id"],
                "user_id": member["user_id"],
                "role": member["role"],
                "joined_at": member["joined_at"],
                "invited_by": member.get("invited_by"),
                "user_email": profile.get("email"),
                "user_full_name": profile.get("full_name")
            }
            members.append(member_data)
        
        return members
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing team members: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{team_id}/members/{member_id}/role", tags=["Team Members"], response_model=TeamMemberResponse)
async def update_member_role(
    team_id: UUID,
    member_id: UUID,
    role_data: TeamMemberUpdate,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Update team member role (owner/admin only)"""
    try:
        logger.info(f"Updating role for member {member_id} in team {team_id}")
        
        # Check if user can update roles (owner or admin)
        user_member = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not user_member.data or user_member.data[0]["role"] not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied: Only team owner or admin can update member roles")
        
        # Get member info
        member_response = supabase.from_("team_members").select("""
            id, team_id, user_id, role,
            profiles!inner(email, full_name)
        """).eq("id", str(member_id)).eq("team_id", str(team_id)).single().execute()
        
        if not member_response.data:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        member = member_response.data
        
        # Prevent owner from changing their own role
        if member["user_id"] == user["id"] and member["role"] == "owner":
            raise HTTPException(status_code=400, detail="Team owner cannot change their own role")
        
        # Only owner can assign owner role
        if role_data.role == TeamRole.OWNER and user_member.data[0]["role"] != "owner":
            raise HTTPException(status_code=403, detail="Only team owner can assign owner role")
        
        old_role = member["role"]
        
        # Update member role
        update_response = supabase.from_("team_members").update({"role": role_data.role.value}).eq("id", str(member_id)).execute()
        
        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update member role")
        
        updated_member = update_response.data[0]
        
        # Add user details to response
        profile = member.get("profiles", {})
        updated_member["user_email"] = profile.get("email")
        updated_member["user_full_name"] = profile.get("full_name")
        
        # Send notification to the member about role change
        if member["user_id"] != user["id"]:
            # Get team name
            team_response = supabase.from_("teams").select("name").eq("id", str(team_id)).single().execute()
            team_name = team_response.data.get("name", "Team") if team_response.data else "Team"
            
            # Get updater name
            updater_response = supabase.from_("profiles").select("full_name").eq("id", user["id"]).single().execute()
            updater_name = updater_response.data.get("full_name", "Team Admin") if updater_response.data else "Team Admin"
            
            # Create notification
            notification_data = {
                "user_id": member["user_id"],
                "type": NotificationType.ROLE_CHANGED.value,
                "title": f"Role Updated in {team_name}",
                "message": f"Your role has been changed from {old_role.title()} to {role_data.role.value.title()} by {updater_name}",
                "data": {
                    "team_id": str(team_id),
                    "old_role": old_role,
                    "new_role": role_data.role.value,
                    "changed_by": user["id"]
                }
            }
            supabase.from_("notifications").insert(notification_data).execute()
            
            # Send email notification
            if profile.get("email"):
                email_service.send_role_change_notification(
                    profile["email"],
                    team_name,
                    TeamRole(old_role),
                    role_data.role,
                    updater_name
                )
        
        logger.info(f"Member {member_id} role updated to {role_data.role.value}")
        return updated_member
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating member role: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{team_id}/members/{member_id}", tags=["Team Members"])
async def remove_team_member(
    team_id: UUID,
    member_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Remove team member (owner/admin only)"""
    try:
        logger.info(f"Removing member {member_id} from team {team_id}")
        
        # Check if user can remove members (owner or admin)
        user_member = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not user_member.data or user_member.data[0]["role"] not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied: Only team owner or admin can remove members")
        
        # Get member info
        member_response = supabase.from_("team_members").select("""
            id, user_id, role,
            profiles!inner(full_name)
        """).eq("id", str(member_id)).eq("team_id", str(team_id)).single().execute()
        
        if not member_response.data:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        member = member_response.data
        
        # Prevent removing team owner
        if member["role"] == "owner":
            raise HTTPException(status_code=400, detail="Cannot remove team owner")
        
        # Remove member
        supabase.from_("team_members").delete().eq("id", str(member_id)).execute()
        
        member_name = member.get("profiles", {}).get("full_name", "Team member")
        
        logger.info(f"Member {member_id} removed from team {team_id}")
        return {"message": f"{member_name} has been removed from the team"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing team member: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/{team_id}/leave", tags=["Team Members"])
async def leave_team(
    team_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Leave team"""
    try:
        logger.info(f"User {user['id']} leaving team {team_id}")
        
        # Check if user is a member
        member_response = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).single().execute()
        
        if not member_response.data:
            raise HTTPException(status_code=403, detail="You are not a member of this team")
        
        # Prevent owner from leaving (they must transfer ownership first)
        if member_response.data["role"] == "owner":
            raise HTTPException(status_code=400, detail="Team owner cannot leave the team. Transfer ownership first or delete the team.")
        
        # Remove user from team
        supabase.from_("team_members").delete().eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        logger.info(f"User {user['id']} left team {team_id}")
        return {"message": "You have successfully left the team"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Will continue with document collaboration routes in the next part... 