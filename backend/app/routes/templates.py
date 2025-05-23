from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form, Query
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from app.models.database import supabase
from app.utils.auth_utils import get_current_user, security
from docx import Document
import io
import logging
import traceback
import os

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Helper to validate state and document type
def validate_state_and_document_type(state: str, document_type: str):
    # Validate state
    state_check = supabase.from_("states").select("state_id").eq("state_name", state).execute()
    if not state_check.data:
        raise HTTPException(status_code=400, detail="Invalid state provided")

    # Validate document type (case-insensitive match)
    doc_type_check = supabase.from_("document_types").select("document_type_id").ilike("document_type_name", document_type).execute()
    if not doc_type_check.data:
        raise HTTPException(status_code=400, detail="Invalid document type provided")

# Create Template
@router.post("/create", tags=["Templates"])
async def create_template(
    state: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = Form(...),
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Create a new template.
    
    Example form data:
    ```
    state: "California"
    document_type: "Non-Disclosure Agreement"
    file: [template.docx]
    ```
    
    Returns:
    ```json
    {
        "message": "Template created successfully",
        "file_path": "legal-templates/California/Non-Disclosure Agreement/template.docx"
    }
    ```
    """
    try:
        logger.info(f"Creating template for user {user['id']}: {file.filename}")
        
        if not file.filename.endswith('.docx'):
            raise HTTPException(
                status_code=400,
                detail="Only .docx files are supported"
            )

        # Validate state and document type
        try:
            state_response = supabase.from_("states").select("state_id").eq("state_name", state).single().execute()
            if not state_response.data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid state: {state}"
                )
            state_id = state_response.data["state_id"]
            logger.info(f"Validated state: {state} (ID: {state_id})")
        except Exception as state_error:
            logger.error(f"State validation failed: {str(state_error)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error validating state: {str(state_error)}"
            )

        try:
            doc_type_response = supabase.from_("document_types").select("document_type_id").eq("document_type_name", document_type).single().execute()
            if not doc_type_response.data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid document type: {document_type}"
                )
            doc_type_id = doc_type_response.data["document_type_id"]
            logger.info(f"Validated document type: {document_type} (ID: {doc_type_id})")
        except Exception as doc_type_error:
            logger.error(f"Document type validation failed: {str(doc_type_error)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error validating document type: {str(doc_type_error)}"
            )

        # Create storage path
        storage_path = f"legal-templates/{state}/{document_type}/{file.filename}"
        
        # Extract content from DOCX
        try:
            content = ""
            with open(f"/tmp/{file.filename}", "wb") as f:
                f.write(await file.read())
            doc = Document(f"/tmp/{file.filename}")
            content = "\n".join([para.text for para in doc.paragraphs])
            logger.info(f"Extracted content from {file.filename}")
        except Exception as content_error:
            logger.error(f"Content extraction failed: {str(content_error)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error extracting content from file: {str(content_error)}"
            )

        # Upload to Supabase storage
        try:
            with open(f"/tmp/{file.filename}", "rb") as f:
                supabase.storage.from_("legal-templates").upload(
                    storage_path,
                    f.read(),
                    {"content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
                )
            logger.info(f"File uploaded to storage: {storage_path}")
        except Exception as upload_error:
            logger.error(f"File upload failed: {str(upload_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error uploading file: {str(upload_error)}"
            )

        # Insert into database
        try:
            template_data = {
                "state_id": state_id,
                "document_type_id": doc_type_id,
                "template_name": file.filename,
                "file_path": storage_path,
                "content": content
            }
            response = supabase.from_("templates").insert(template_data).execute()
            logger.info(f"Template registered in database: {response.data[0]['id']}")
        except Exception as db_error:
            logger.error(f"Database insert failed: {str(db_error)}")
            # Try to clean up uploaded file
            try:
                supabase.storage.from_("legal-templates").remove([storage_path])
            except:
                pass
            raise HTTPException(
                status_code=500,
                detail=f"Error registering template: {str(db_error)}"
            )

        return {
            "message": "Template created successfully",
            "file_path": storage_path
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_template: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# List Templates with Filters
@router.get("/list", tags=["Templates"])
async def list_templates(
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    document_type_id: Optional[str] = Query(None, description="Filter by document type ID"),
    search: Optional[str] = Query(None, description="Search in template name or content"),
    user: dict = Depends(get_current_user)
) -> Dict[str, List[Dict[str, Any]]]:
    """
    List templates with optional filters.
    
    Query parameters:
    - state_id: Filter by state ID
    - document_type_id: Filter by document type ID
    - search: Search in template name or content
    """
    try:
        logger.info(f"Listing templates for user {user['id']} with filters: state_id={state_id}, doc_type_id={document_type_id}, search={search}")
        
        query = supabase.from_("templates").select("""
            *,
            states:state_id(state_id, state_name),
            document_types:document_type_id(document_type_id, document_type_name)
        """)

        if state_id:
            query = query.eq("state_id", state_id)
        if document_type_id:
            query = query.eq("document_type_id", document_type_id)
        if search:
            query = query.or_(f"template_name.ilike.%{search}%,content.ilike.%{search}%")

        try:
            response = query.execute()
            logger.info(f"Found {len(response.data)} templates")
            return {"templates": response.data}
        except Exception as query_error:
            logger.error(f"Query failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching templates: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in list_templates: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Get Template by ID with Full Details
@router.get("/{template_id}", tags=["Templates"])
async def get_template(
    template_id: str,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get a specific template by ID with full details including state and document type info.
    """
    try:
        logger.info(f"Getting template {template_id} for user {user['id']}")
        
        try:
            response = supabase.from_("templates").select("""
                *,
                states:state_id(state_id, state_name),
                document_types:document_type_id(document_type_id, document_type_name)
            """).eq("id", template_id).single().execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Template not found: {template_id}"
                )
            
            logger.info(f"Found template: {template_id}")
            return response.data
        except Exception as query_error:
            logger.error(f"Query failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching template: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_template: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Get Templates by State
@router.get("/state/{state_id}", tags=["Templates"])
async def get_templates_by_state(
    state_id: str,
    user: dict = Depends(get_current_user)
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get all templates for a specific state.
    """
    try:
        logger.info(f"Getting templates for state {state_id} for user {user['id']}")
        
        try:
            response = supabase.from_("templates").select("""
                *,
                document_types:document_type_id(document_type_id, document_type_name)
            """).eq("state_id", state_id).execute()
            
            logger.info(f"Found {len(response.data)} templates for state {state_id}")
            return {"templates": response.data}
        except Exception as query_error:
            logger.error(f"Query failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching templates: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_templates_by_state: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Get Templates by Document Type
@router.get("/type/{document_type_id}", tags=["Templates"])
async def get_templates_by_document_type(
    document_type_id: str,
    user: dict = Depends(get_current_user)
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get all templates of a specific document type.
    """
    try:
        logger.info(f"Getting templates for document type {document_type_id} for user {user['id']}")
        
        try:
            response = supabase.from_("templates").select("""
                *,
                states:state_id(state_id, state_name)
            """).eq("document_type_id", document_type_id).execute()
            
            logger.info(f"Found {len(response.data)} templates for document type {document_type_id}")
            return {"templates": response.data}
        except Exception as query_error:
            logger.error(f"Query failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching templates: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_templates_by_document_type: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Search Templates
@router.get("/search", tags=["Templates"])
async def search_templates(
    query: str = Query(...),
    user: dict = Depends(get_current_user)
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Search templates by name or content.
    """
    try:
        logger.info(f"Searching templates for user {user['id']} with query: {query}")
        
        try:
            response = supabase.from_("templates").select("""
                *,
                states:state_id(state_id, state_name),
                document_types:document_type_id(document_type_id, document_type_name)
            """).or_(f"template_name.ilike.%{query}%,content.ilike.%{query}%").execute()
            
            logger.info(f"Found {len(response.data)} templates matching query")
            return {"templates": response.data}
        except Exception as query_error:
            logger.error(f"Query failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error searching templates: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in search_templates: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Delete Template
@router.delete("/{template_id}", tags=["Templates"])
async def delete_template(
    template_id: str,
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Delete a template by ID.
    """
    try:
        logger.info(f"Deleting template {template_id} for user {user['id']}")
        
        # Get template info first
        try:
            template = supabase.from_("templates").select("file_path").eq("id", template_id).single().execute()
            if not template.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Template not found: {template_id}"
                )
            file_path = template.data["file_path"]
        except Exception as query_error:
            logger.error(f"Template fetch failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching template: {str(query_error)}"
            )

        # Delete from storage
        try:
            supabase.storage.from_("legal-templates").remove([file_path])
            logger.info(f"Deleted file from storage: {file_path}")
        except Exception as storage_error:
            logger.error(f"Storage deletion failed: {str(storage_error)}")
            # Continue with database deletion even if storage deletion fails

        # Delete from database
        try:
            supabase.from_("templates").delete().eq("id", template_id).execute()
            logger.info(f"Deleted template from database: {template_id}")
        except Exception as db_error:
            logger.error(f"Database deletion failed: {str(db_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting template: {str(db_error)}"
            )

        return {"message": "Template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in delete_template: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
