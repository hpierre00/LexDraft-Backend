from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials
from app.models.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.models.database import supabase
from app.utils.auth_utils import get_current_user, security
import logging
from typing import Dict, Any, List, Optional
import traceback

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Utility function to save or update a document in Supabase
def save_document_to_supabase(user_id: str, title: str, content: str, status: str = "active", token: str = None) -> dict:
    """
    Save or update a document in the Supabase `documents` table.

    Parameters:
    - user_id (str): ID of the user.
    - title (str): Title of the document.
    - content (str): Content of the document.
    - status (str): Status of the document (default: "active").
    - token (str): User's session token for authentication.

    Returns:
    - dict: The saved document data.
    """
    try:
        # Set the auth token for this request
        if token:
            # For now, we'll use the same token for both access and refresh
            # In a production environment, you should get both tokens from the session
            supabase.auth.set_session(token, token)

        response = supabase.table("documents").insert({
            "user_id": user_id,
            "title": title,
            "content": content,
            "status": status
        }).execute()

        if not response.data:
            raise ValueError("No data returned from Supabase")

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving document: {str(e)}")

# Create Document
@router.post("/create", tags=["Documents"], response_model=DocumentResponse)
async def create_document(
    title: str,
    content: str,
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Create a new document.
    """
    try:
        logger.info(f"Creating document for user {user['id']}: {title}")
        
        try:
            document_data = {
                "user_id": user["id"],
                "title": title,
                "content": content,
                "status": "draft"
            }
            response = supabase.from_("documents").insert(document_data).execute()
            logger.info(f"Document created: {response.data[0]['id']}")
            return response.data[0]
        except Exception as db_error:
            logger.error(f"Database insert failed: {str(db_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating document: {str(db_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_document: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Get All Documents
@router.get("/list", tags=["Documents"], response_model=list[DocumentResponse])
async def list_documents(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
) -> Dict[str, List[Dict[str, Any]]]:
    """
    List documents with optional filters.
    """
    try:
        logger.info(f"Listing documents for user {user['id']} with filters: status={status}, search={search}")
        
        query = supabase.from_("documents").select("*")
        
        if status:
            query = query.eq("status", status)
        if search:
            query = query.or_(f"title.ilike.%{search}%,content.ilike.%{search}%")
            
        try:
            response = query.execute()
            logger.info(f"Found {len(response.data)} documents")
            return {"documents": response.data}
        except Exception as query_error:
            logger.error(f"Query failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching documents: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in list_documents: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Get Single Document
@router.get("/{document_id}", tags=["Documents"], response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get a specific document by ID.
    """
    try:
        logger.info(f"Getting document {document_id} for user {user['id']}")
        
        try:
            response = supabase.from_("documents").select("*").eq("id", document_id).single().execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document not found: {document_id}"
                )
            
            logger.info(f"Found document: {document_id}")
            return response.data
        except Exception as query_error:
            logger.error(f"Query failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching document: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_document: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Update Document
@router.put("/{document_id}", tags=["Documents"], response_model=DocumentResponse)
async def update_document(
    document_id: str,
    title: Optional[str] = None,
    content: Optional[str] = None,
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update a document.
    """
    try:
        logger.info(f"Updating document {document_id} for user {user['id']}")
        
        # Get current document
        try:
            current = supabase.from_("documents").select("*").eq("id", document_id).single().execute()
            if not current.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document not found: {document_id}"
                )
        except Exception as query_error:
            logger.error(f"Document fetch failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching document: {str(query_error)}"
            )

        # Prepare update data
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if content is not None:
            update_data["content"] = content
        if status is not None:
            update_data["status"] = status

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No update data provided"
            )

        try:
            response = supabase.from_("documents").update(update_data).eq("id", document_id).execute()
            logger.info(f"Document updated: {document_id}")
            return response.data[0]
        except Exception as update_error:
            logger.error(f"Update failed: {str(update_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error updating document: {str(update_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in update_document: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Delete (Archive) Document
@router.delete("/{document_id}", tags=["Documents"])
async def delete_document(
    document_id: str,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Delete a document.
    """
    try:
        logger.info(f"Deleting document {document_id} for user {user['id']}")
        
        try:
            response = supabase.from_("documents").delete().eq("id", document_id).execute()
            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document not found: {document_id}"
                )
            logger.info(f"Document deleted: {document_id}")
            return {"message": "Document deleted successfully"}
        except Exception as delete_error:
            logger.error(f"Delete failed: {str(delete_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting document: {str(delete_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in delete_document: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{document_id}/archive", tags=["Documents"])
async def archive_document(
    document_id: str,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Archive a document.
    """
    try:
        logger.info(f"Archiving document {document_id} for user {user['id']}")
        
        try:
            response = supabase.from_("documents").update({"status": "archived"}).eq("id", document_id).execute()
            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document not found: {document_id}"
                )
            logger.info(f"Document archived: {document_id}")
            return response.data[0]
        except Exception as archive_error:
            logger.error(f"Archive failed: {str(archive_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error archiving document: {str(archive_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in archive_document: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
