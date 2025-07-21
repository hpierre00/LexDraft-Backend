from fastapi import APIRouter, HTTPException, Depends, UploadFile, Form, Body
from fastapi.security import HTTPAuthorizationCredentials
from app.services.ai_agent_generate import generate_legal_document
from app.services.ai_agent_evaluate import evaluate_legal_document
from app.services.ai_agent_template import edit_template_with_ai, fetch_template_from_supabase
from app.utils.auth_utils import get_current_user, security
from app.routes.document import save_document_to_supabase
from app.models.database import supabase
import logging
from typing import Dict, Any
import traceback

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate-document", tags=["AI Agents"])
async def generate_document(
    prompt: str = Body(..., embed=True),
    title: str = Body(..., embed=True),
    state_id: str = Body(None, embed=True),
    document_type_id: str = Body(None, embed=True),
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Generate a legal document using AI and save it to Supabase.
    Uses a template as context if available.
    
    Example form data:
    ```
    prompt: "Create a non-disclosure agreement for a software company"
    title: "Software NDA"
    state_id: "CA" (optional)
    document_type_id: "NDA" (optional)
    ```
    """
    try:
        logger.info(f"Generating document for user {user['id']} with title: {title}")
        user_id = user["id"]
        template_content = None
        state_name = None
        doc_type_name = None
        
        # Get template content from Supabase if state and document type are provided
        if state_id and document_type_id:
            try:
                template_response = supabase.from_("templates").select("""
                    content,
                    states:state_id(state_name),
                    document_types:document_type_id(document_type_name)
                """).eq("state_id", state_id).eq("document_type_id", document_type_id).single().execute()
                
                if template_response.data:
                    template_content = template_response.data["content"]
                    state_name = template_response.data["states"]["state_name"]
                    doc_type_name = template_response.data["document_types"]["document_type_name"]
                    logger.info(f"Found template for state: {state_name}, doc type: {doc_type_name}")
            except Exception as template_error:
                logger.error(f"Error fetching template: {str(template_error)}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Template not found for state_id: {state_id} and document_type_id: {document_type_id}"
                )
        
        # Generate document content using AI with optional template context
        try:
            content = generate_legal_document(
                prompt=prompt,
                user_id=user_id,
                title=title,
                template_content=template_content,
                state_name=state_name,
                document_type=doc_type_name
            )
            logger.info(f"Successfully generated document content for {title}")
        except Exception as ai_error:
            logger.error(f"AI generation failed: {str(ai_error)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate document: {str(ai_error)}"
            )
        
        # Save to Supabase
        try:
            doc_metadata = save_document_to_supabase(
                user_id=user_id,
                title=title,
                content=content,
                status="active",
                token=credentials.credentials
            )
            logger.info(f"Document saved successfully: {doc_metadata['id']}")
        except Exception as supabase_error:
            logger.error(f"Supabase save failed: {str(supabase_error)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=502,
                detail=f"AI generated but failed to save: {str(supabase_error)}"
            )
            
        return {
            "message": "Document generated and saved successfully",
            "document": doc_metadata,
            "template_used": {
                "state": state_name,
                "document_type": doc_type_name
            } if state_name and doc_type_name else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_document: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/edit-template", tags=["AI Agents"])
async def edit_template(
    template_path: str = Form(...),
    user_command: str = Form(...),
    title: str = Form(...),
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Edit a template using AI and save the updated document to Supabase.
    """
    try:
        logger.info(f"Editing template for user {user['id']}: {template_path}")
        user_id = user["id"]

        try:
            local_template_path = fetch_template_from_supabase(template_path)
            logger.info(f"Template fetched successfully: {local_template_path}")
        except Exception as fetch_error:
            logger.error(f"Template fetch failed: {str(fetch_error)}")
            raise HTTPException(
                status_code=404,
                detail=f"Template not found: {str(fetch_error)}"
            )

        try:
            updated_path = edit_template_with_ai(
                template_path=local_template_path,
                user_command=user_command,
                user_id=user_id,
                title=title
            )
            logger.info(f"Template edited successfully: {updated_path}")
        except Exception as edit_error:
            logger.error(f"Template edit failed: {str(edit_error)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to edit template: {str(edit_error)}"
            )

        return {
            "message": "Template edited successfully",
            "updated_path": updated_path
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in edit_template: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
