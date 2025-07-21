from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from uuid import UUID
import logging
from datetime import datetime

from app.utils.auth_utils import get_current_user, security
from app.models.database import supabase
from app.models.team_schemas import (
    DocumentCollaboratorCreate, DocumentCollaboratorUpdate, DocumentCollaboratorResponse,
    TeamDocumentShare, TeamDocumentResponse,
    NotificationCreate, NotificationResponse,
    TeamRole, NotificationType
)
from app.services.email_service import email_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Document Collaboration Routes

@router.post("/documents/{document_id}/share", tags=["Document Collaboration"], response_model=List[DocumentCollaboratorResponse])
async def share_document(
    document_id: UUID,
    collaborators: List[DocumentCollaboratorCreate],
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Share document with users or email addresses"""
    try:
        logger.info(f"Sharing document {document_id} with {len(collaborators)} collaborators")
        
        # Check if user owns the document
        doc_response = supabase.from_("documents").select("user_id, title").eq("id", str(document_id)).single().execute()
        
        if not doc_response.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if doc_response.data["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied: You can only share documents you own")
        
        document_title = doc_response.data["title"]
        
        # Get sharer info
        sharer_response = supabase.from_("profiles").select("full_name").eq("id", user["id"]).single().execute()
        sharer_name = sharer_response.data.get("full_name", "Document owner") if sharer_response.data else "Document owner"
        
        created_collaborators = []
        
        for collaborator in collaborators:
            try:
                # Validate that either user_id or email is provided
                if not collaborator.user_id and not collaborator.email:
                    logger.warning("Skipping collaborator: neither user_id nor email provided")
                    continue
                
                # If user_id is provided, get the email
                target_email = collaborator.email
                target_user_id = collaborator.user_id
                
                if collaborator.user_id:
                    user_response = supabase.from_("profiles").select("email").eq("id", str(collaborator.user_id)).single().execute()
                    if user_response.data:
                        target_email = user_response.data["email"]
                    else:
                        logger.warning(f"User {collaborator.user_id} not found")
                        continue
                
                # If email is provided but no user_id, try to find the user
                if collaborator.email and not collaborator.user_id:
                    user_response = supabase.from_("profiles").select("id").eq("email", collaborator.email).execute()
                    if user_response.data:
                        target_user_id = user_response.data[0]["id"]
                
                # Check if collaboration already exists
                existing_collab = supabase.from_("document_collaborators").select("id")
                if target_user_id:
                    existing_collab = existing_collab.eq("document_id", str(document_id)).eq("user_id", str(target_user_id))
                else:
                    existing_collab = existing_collab.eq("document_id", str(document_id)).eq("email", target_email)
                
                existing_collab = existing_collab.execute()
                
                if existing_collab.data:
                    logger.warning(f"Collaboration already exists for document {document_id} and user/email")
                    continue
                
                # Create collaboration record
                collab_data = {
                    "document_id": str(document_id),
                    "role": collaborator.role.value,
                    "shared_by": user["id"]
                }
                
                if target_user_id:
                    collab_data["user_id"] = str(target_user_id)
                if target_email:
                    collab_data["email"] = target_email
                
                response = supabase.from_("document_collaborators").insert(collab_data).execute()
                
                if response.data:
                    created_collab = response.data[0]
                    
                    # Add user details to response
                    if target_user_id:
                        user_details = supabase.from_("profiles").select("full_name").eq("id", str(target_user_id)).single().execute()
                        created_collab["user_full_name"] = user_details.data.get("full_name") if user_details.data else None
                    
                    created_collab["shared_by_name"] = sharer_name
                    created_collaborators.append(created_collab)
                    
                    # Send notification to existing users
                    if target_user_id:
                        notification_data = {
                            "user_id": str(target_user_id),
                            "type": NotificationType.DOCUMENT_SHARED.value,
                            "title": f"Document Shared: {document_title}",
                            "message": f"{sharer_name} shared a document with you: {document_title}",
                            "data": {
                                "document_id": str(document_id),
                                "shared_by": user["id"],
                                "role": collaborator.role.value
                            }
                        }
                        supabase.from_("notifications").insert(notification_data).execute()
                    
                    # Send email notification
                    if target_email:
                        email_service.send_document_shared_notification(
                            target_email,
                            document_title,
                            sharer_name
                        )
                    
                    logger.info(f"Document {document_id} shared with {target_email or target_user_id}")
                    
            except Exception as e:
                logger.error(f"Failed to share document with collaborator: {str(e)}")
                continue
        
        if not created_collaborators:
            raise HTTPException(status_code=400, detail="No collaborations were created")
        
        logger.info(f"Document {document_id} shared with {len(created_collaborators)} collaborators")
        return created_collaborators
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/documents/{document_id}/collaborators", tags=["Document Collaboration"], response_model=List[DocumentCollaboratorResponse])
async def list_document_collaborators(
    document_id: UUID,
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """List document collaborators"""
    try:
        # Check if user has access to the document (owner or collaborator)
        doc_response = supabase.from_("documents").select("user_id").eq("id", str(document_id)).single().execute()
        
        if not doc_response.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        is_owner = doc_response.data["user_id"] == user["id"]
        
        if not is_owner:
            # Check if user is a collaborator
            collab_check = supabase.from_("document_collaborators").select("id").eq("document_id", str(document_id)).eq("user_id", user["id"]).execute()
            if not collab_check.data:
                raise HTTPException(status_code=403, detail="Access denied: You don't have access to this document")
        
        # Get collaborators with user details
        response = supabase.from_("document_collaborators").select("""
            id, document_id, user_id, email, role, shared_by, created_at,
            profiles:user_id(full_name),
            shared_profiles:shared_by(full_name)
        """).eq("document_id", str(document_id)).execute()
        
        collaborators = []
        for collab in response.data:
            user_profile = collab.get("profiles", {})
            shared_profile = collab.get("shared_profiles", {})
            
            collab_data = {
                "id": collab["id"],
                "document_id": collab["document_id"],
                "user_id": collab.get("user_id"),
                "email": collab.get("email"),
                "role": collab["role"],
                "shared_by": collab["shared_by"],
                "created_at": collab["created_at"],
                "user_full_name": user_profile.get("full_name") if user_profile else None,
                "shared_by_name": shared_profile.get("full_name") if shared_profile else None
            }
            collaborators.append(collab_data)
        
        return collaborators
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing document collaborators: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/documents/{document_id}/collaborators/{collaborator_id}", tags=["Document Collaboration"], response_model=DocumentCollaboratorResponse)
async def update_document_collaborator(
    document_id: UUID,
    collaborator_id: UUID,
    update_data: DocumentCollaboratorUpdate,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Update document collaborator role"""
    try:
        logger.info(f"Updating collaborator {collaborator_id} for document {document_id}")
        
        # Check if user owns the document
        doc_response = supabase.from_("documents").select("user_id").eq("id", str(document_id)).single().execute()
        
        if not doc_response.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if doc_response.data["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied: Only document owner can update collaborator roles")
        
        # Update collaborator
        response = supabase.from_("document_collaborators").update({"role": update_data.role.value}).eq("id", str(collaborator_id)).eq("document_id", str(document_id)).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Collaborator not found")
        
        updated_collab = response.data[0]
        
        # Add user details to response
        if updated_collab.get("user_id"):
            user_details = supabase.from_("profiles").select("full_name").eq("id", updated_collab["user_id"]).single().execute()
            updated_collab["user_full_name"] = user_details.data.get("full_name") if user_details.data else None
        
        sharer_details = supabase.from_("profiles").select("full_name").eq("id", user["id"]).single().execute()
        updated_collab["shared_by_name"] = sharer_details.data.get("full_name") if sharer_details.data else None
        
        logger.info(f"Collaborator {collaborator_id} role updated to {update_data.role.value}")
        return updated_collab
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating document collaborator: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/documents/{document_id}/collaborators/{collaborator_id}", tags=["Document Collaboration"])
async def remove_document_collaborator(
    document_id: UUID,
    collaborator_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Remove document collaborator"""
    try:
        logger.info(f"Removing collaborator {collaborator_id} from document {document_id}")
        
        # Check if user owns the document or is removing themselves
        doc_response = supabase.from_("documents").select("user_id").eq("id", str(document_id)).single().execute()
        
        if not doc_response.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get collaborator info
        collab_response = supabase.from_("document_collaborators").select("user_id, email").eq("id", str(collaborator_id)).eq("document_id", str(document_id)).single().execute()
        
        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaborator not found")
        
        is_owner = doc_response.data["user_id"] == user["id"]
        is_self_removal = collab_response.data.get("user_id") == user["id"]
        
        if not is_owner and not is_self_removal:
            raise HTTPException(status_code=403, detail="Access denied: You can only remove yourself or be removed by the document owner")
        
        # Remove collaborator
        supabase.from_("document_collaborators").delete().eq("id", str(collaborator_id)).execute()
        
        logger.info(f"Collaborator {collaborator_id} removed from document {document_id}")
        return {"message": "Collaborator removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing document collaborator: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Team Document Sharing Routes

@router.post("/teams/{team_id}/documents/share", tags=["Team Documents"], response_model=List[TeamDocumentResponse])
async def share_documents_with_team(
    team_id: UUID,
    documents: List[TeamDocumentShare],
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Share documents with team"""
    try:
        logger.info(f"Sharing {len(documents)} documents with team {team_id}")
        
        # Check if user can share documents with team (editor+ role)
        member_check = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not member_check.data or member_check.data[0]["role"] not in ["owner", "admin", "editor"]:
            raise HTTPException(status_code=403, detail="Access denied: Only team members with editor+ role can share documents")
        
        # Get team info
        team_response = supabase.from_("teams").select("name").eq("id", str(team_id)).single().execute()
        team_name = team_response.data.get("name", "Team") if team_response.data else "Team"
        
        # Get sharer info
        sharer_response = supabase.from_("profiles").select("full_name").eq("id", user["id"]).single().execute()
        sharer_name = sharer_response.data.get("full_name", "Team member") if sharer_response.data else "Team member"
        
        shared_documents = []
        
        for doc_share in documents:
            try:
                # Check if user owns the document or has permission to share it
                doc_response = supabase.from_("documents").select("user_id, title").eq("id", str(doc_share.document_id)).single().execute()
                
                if not doc_response.data:
                    logger.warning(f"Document {doc_share.document_id} not found")
                    continue
                
                if doc_response.data["user_id"] != user["id"]:
                    logger.warning(f"User {user['id']} does not own document {doc_share.document_id}")
                    continue
                
                # Check if document is already shared with team
                existing_share = supabase.from_("team_documents").select("id").eq("team_id", str(team_id)).eq("document_id", str(doc_share.document_id)).execute()
                
                if existing_share.data:
                    logger.warning(f"Document {doc_share.document_id} already shared with team {team_id}")
                    continue
                
                # Share document with team
                share_data = {
                    "team_id": str(team_id),
                    "document_id": str(doc_share.document_id),
                    "shared_by": user["id"]
                }
                
                response = supabase.from_("team_documents").insert(share_data).execute()
                
                if response.data:
                    shared_doc = response.data[0]
                    shared_doc["document_title"] = doc_response.data["title"]
                    shared_doc["shared_by_name"] = sharer_name
                    shared_documents.append(shared_doc)
                    
                    # Notify all team members
                    team_members = supabase.from_("team_members").select("user_id").eq("team_id", str(team_id)).neq("user_id", user["id"]).execute()
                    
                    for member in team_members.data:
                        notification_data = {
                            "user_id": member["user_id"],
                            "type": NotificationType.DOCUMENT_SHARED.value,
                            "title": f"Document Shared in {team_name}",
                            "message": f"{sharer_name} shared a document in {team_name}: {doc_response.data['title']}",
                            "data": {
                                "team_id": str(team_id),
                                "document_id": str(doc_share.document_id),
                                "shared_by": user["id"]
                            }
                        }
                        supabase.from_("notifications").insert(notification_data).execute()
                        
                        # Send email notification
                        member_profile = supabase.from_("profiles").select("email").eq("id", member["user_id"]).single().execute()
                        if member_profile.data and member_profile.data.get("email"):
                            email_service.send_document_shared_notification(
                                member_profile.data["email"],
                                doc_response.data["title"],
                                sharer_name,
                                team_name
                            )
                    
                    logger.info(f"Document {doc_share.document_id} shared with team {team_id}")
                    
            except Exception as e:
                logger.error(f"Failed to share document {doc_share.document_id}: {str(e)}")
                continue
        
        if not shared_documents:
            raise HTTPException(status_code=400, detail="No documents were shared")
        
        logger.info(f"Shared {len(shared_documents)} documents with team {team_id}")
        return shared_documents
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing documents with team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/teams/{team_id}/documents", tags=["Team Documents"], response_model=List[TeamDocumentResponse])
async def list_team_documents(
    team_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """List documents shared with team"""
    try:
        # Check if user is a team member
        member_check = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not member_check.data:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this team")
        
        # Get team documents with document and sharer details
        response = supabase.from_("team_documents").select("""
            id, team_id, document_id, shared_by, created_at,
            documents!inner(title, status),
            profiles!inner(full_name)
        """).eq("team_id", str(team_id)).eq("documents.status", "active").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        team_documents = []
        for doc in response.data:
            document = doc.get("documents", {})
            profile = doc.get("profiles", {})
            
            doc_data = {
                "id": doc["id"],
                "team_id": doc["team_id"],
                "document_id": doc["document_id"],
                "shared_by": doc["shared_by"],
                "created_at": doc["created_at"],
                "document_title": document.get("title"),
                "shared_by_name": profile.get("full_name")
            }
            team_documents.append(doc_data)
        
        return team_documents
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing team documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/teams/{team_id}/documents/{team_document_id}", tags=["Team Documents"])
async def remove_document_from_team(
    team_id: UUID,
    team_document_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Remove document from team sharing"""
    try:
        logger.info(f"Removing document {team_document_id} from team {team_id}")
        
        # Check if user can remove documents (editor+ role or document owner)
        member_check = supabase.from_("team_members").select("role").eq("team_id", str(team_id)).eq("user_id", user["id"]).execute()
        
        if not member_check.data:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this team")
        
        # Get team document info
        team_doc_response = supabase.from_("team_documents").select("""
            shared_by, document_id,
            documents!inner(user_id, title)
        """).eq("id", str(team_document_id)).eq("team_id", str(team_id)).single().execute()
        
        if not team_doc_response.data:
            raise HTTPException(status_code=404, detail="Team document not found")
        
        team_doc = team_doc_response.data
        document = team_doc.get("documents", {})
        
        # Check permissions
        user_role = member_check.data[0]["role"]
        is_document_owner = document.get("user_id") == user["id"]
        is_sharer = team_doc["shared_by"] == user["id"]
        can_remove = user_role in ["owner", "admin", "editor"] or is_document_owner or is_sharer
        
        if not can_remove:
            raise HTTPException(status_code=403, detail="Access denied: You don't have permission to remove this document")
        
        # Remove document from team
        supabase.from_("team_documents").delete().eq("id", str(team_document_id)).execute()
        
        document_title = document.get("title", "Document")
        
        logger.info(f"Document {team_document_id} removed from team {team_id}")
        return {"message": f"'{document_title}' has been removed from team sharing"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing document from team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Notification Routes

@router.get("/notifications", tags=["Notifications"], response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """List user notifications"""
    try:
        query = supabase.from_("notifications").select("*").eq("user_id", user["id"])
        
        if unread_only:
            query = query.eq("is_read", False)
        
        # Clean up expired notifications
        supabase.from_("notifications").delete().lt("expires_at", datetime.utcnow().isoformat()).execute()
        
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        response = query.execute()
        
        # Process notifications to handle data field (both JSON string and dict formats)
        processed_notifications = []
        for notification in response.data or []:
            # Handle data field - convert JSON string to dict if needed
            if notification.get("data"):
                if isinstance(notification["data"], str):
                    try:
                        import json
                        notification["data"] = json.loads(notification["data"])
                    except (json.JSONDecodeError, ValueError):
                        notification["data"] = None
            
            processed_notifications.append(notification)
        
        return processed_notifications
        
    except Exception as e:
        logger.error(f"Error listing notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/notifications/{notification_id}/read", tags=["Notifications"], response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Mark notification as read"""
    try:
        response = supabase.from_("notifications").update({"is_read": True}).eq("id", str(notification_id)).eq("user_id", user["id"]).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        # Process the notification data field (handle both JSON string and dict formats)
        notification = response.data[0]
        if notification.get("data"):
            if isinstance(notification["data"], str):
                try:
                    import json
                    notification["data"] = json.loads(notification["data"])
                except (json.JSONDecodeError, ValueError):
                    notification["data"] = None
        
        return notification
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/notifications/mark-all-read", tags=["Notifications"])
async def mark_all_notifications_read(
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Mark all notifications as read"""
    try:
        supabase.from_("notifications").update({"is_read": True}).eq("user_id", user["id"]).eq("is_read", False).execute()
        
        return {"message": "All notifications marked as read"}
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/notifications/unread-count", tags=["Notifications"])
async def get_unread_notification_count(
    user: dict = Depends(get_current_user)
) -> Dict[str, int]:
    """Get count of unread notifications"""
    try:
        # Clean up expired notifications first
        supabase.from_("notifications").delete().lt("expires_at", datetime.utcnow().isoformat()).execute()
        
        response = supabase.from_("notifications").select("id", count="exact").eq("user_id", user["id"]).eq("is_read", False).execute()
        
        return {"count": response.count or 0}
        
    except Exception as e:
        logger.error(f"Error getting unread notification count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/notifications/{notification_id}", tags=["Notifications"])
async def delete_notification(
    notification_id: UUID,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Delete notification"""
    try:
        response = supabase.from_("notifications").delete().eq("id", str(notification_id)).eq("user_id", user["id"]).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")