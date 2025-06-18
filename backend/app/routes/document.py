from fastapi import APIRouter, HTTPException, Depends, Query, File, UploadFile, Body
from fastapi.security import HTTPAuthorizationCredentials
from app.models.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.models.database import supabase
from app.utils.auth_utils import get_current_user, security
import logging
from typing import Dict, Any, List, Optional
import traceback
from fastapi.responses import FileResponse
import os
import tempfile
import markdown # Import markdown library
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from starlette.background import BackgroundTask # Import BackgroundTask
from app.services.ai_agent_evaluate import evaluate_legal_document # Import the evaluation function
from reportlab.lib import colors
from bs4 import BeautifulSoup

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
            created_document = response.data[0]
            logger.info(f"Document created: {created_document['id']}")

            # Perform AI evaluation
            logger.info(f"Evaluating document {created_document['id']} with AI.")
            ai_evaluation_response = await evaluate_legal_document(document_content=content)
            logger.info(f"AI evaluation complete for document {created_document['id']}.")

            # Update the document with the evaluation response
            updated_response = supabase.from_("documents").update(
                {"evaluation_response": ai_evaluation_response}
            ).eq("id", created_document['id']).execute()
            
            # Return the updated document data including the evaluation response
            return updated_response.data[0]

        except Exception as db_error:
            logger.error(f"Database insert/update failed: {str(db_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating/evaluating document: {str(db_error)}"
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
) -> List[Dict[str, Any]]:
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
            return response.data
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

# Download Document
@router.get("/{document_id}/download", tags=["Documents"])
async def download_document(
    document_id: str,
    user: dict = Depends(get_current_user)
) -> FileResponse:
    """
    Download a specific document by ID as a PDF file.
    """
    temp_file_pdf_path = ""
    try:
        logger.info(f"Downloading document {document_id} for user {user['id']}")
        
        logger.debug(f"Attempting to fetch document {document_id} from Supabase.")
        response = supabase.from_("documents").select("title", "content").eq("id", document_id).single().execute()
        
        if not response.data:
            logger.warning(f"Document {document_id} not found for user {user['id']}")
            raise HTTPException(
                status_code=404,
                detail=f"Document not found: {document_id}"
            )
        
        document_title = response.data["title"]
        document_content = response.data["content"]
        logger.info(f"Document {document_id} fetched successfully. Title: {document_title}")
        
        # Convert Markdown to HTML
        logger.debug("Converting Markdown to HTML.")
        html_content = markdown.markdown(document_content)
        
        # Clean HTML using BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        clean_html = str(soup)
        logger.debug("HTML cleaned successfully.")

        # Create a temporary PDF file
        logger.debug("Attempting to create temporary PDF file.")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file_pdf:
            temp_file_pdf_path = temp_file_pdf.name
            doc = SimpleDocTemplate(
                temp_file_pdf_path,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )

            # Create styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                alignment=TA_CENTER,
                spaceAfter=30,
                textColor=colors.black
            )
            body_style = ParagraphStyle(
                'CustomBody',
                parent=styles['Normal'],
                spaceAfter=12,
                textColor=colors.black
            )

            # Build the PDF content
            story = []
            story.append(Paragraph(document_title, title_style))
            story.append(Spacer(1, 12))

            # Split content into paragraphs and add to story
            paragraphs = clean_html.split('\n')
            for para in paragraphs:
                if para.strip():
                    try:
                        story.append(Paragraph(para, body_style))
                        story.append(Spacer(1, 12))
                    except Exception as e:
                        logger.warning(f"Skipping problematic paragraph: {str(e)}")
                        continue

            # Build the PDF
            doc.build(story)
            logger.info(f"PDF generated successfully for document {document_id}")

        # Define a cleanup function to delete the temporary file after the response is sent
        def cleanup():
            os.remove(temp_file_pdf_path)
            logger.info(f"Temporary file {temp_file_pdf_path} cleaned up.")

        # Return the file as a response with background task for cleanup
        file_name = f"{document_title.replace(' ', '_')}.pdf"
        logger.info(f"Returning PDF file: {file_name}")
        return FileResponse(
            path=temp_file_pdf_path,
            filename=file_name,
            media_type="application/pdf",
            background=BackgroundTask(cleanup)
        )

    except HTTPException:
        if os.path.exists(temp_file_pdf_path):
            os.remove(temp_file_pdf_path)
        raise
    except Exception as e:
        logger.critical(f"Critical error in download_document: {str(e)}\n{traceback.format_exc()}")
        if os.path.exists(temp_file_pdf_path):
            os.remove(temp_file_pdf_path)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Upload Evaluation
@router.post("/upload", tags=["Documents"], response_model=DocumentResponse)
async def upload_document_for_evaluation(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Upload a document for evaluation. The content of the file will be saved.
    """
    try:
        logger.info(f"User {user['id']} attempting to upload file: {file.filename}")
        
        # Read file content
        content = await file.read()
        decoded_content = content.decode("utf-8")
        logger.debug(f"File {file.filename} content decoded.")

        # Use the uploaded filename as the document title
        document_title = file.filename.split(".")[0] if "." in file.filename else file.filename
        logger.debug(f"Document title derived: {document_title}")

        # Perform AI evaluation
        logger.info(f"Initiating AI evaluation for document: {document_title}")
        evaluation_response = evaluate_legal_document(document_content=decoded_content)
        logger.info(f"AI evaluation completed for document: {document_title}")

        document_data = {
            "user_id": user["id"],
            "title": document_title,
            "content": decoded_content,
            "status": "for_evaluation", # You might want a specific status for uploaded documents
            "evaluation_response": evaluation_response # Add evaluation response
        }
        logger.debug("Document data prepared for Supabase insertion.")

        response = supabase.from_("documents").insert(document_data).execute()
        logger.info(f"Document uploaded and saved to Supabase: {response.data[0]['id']}")
        return response.data[0]

    except UnicodeDecodeError:
        logger.error(f"File decoding error for user {user['id']} file {file.filename}")
        raise HTTPException(status_code=400, detail="Could not decode file content. Please ensure it's a valid text file (e.g., Markdown or plain text).")
    except Exception as e:
        logger.error(f"Unexpected error in upload_document_for_evaluation: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Update Document
@router.put("/{document_id}", tags=["Documents"], response_model=DocumentResponse)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate = Body(...),
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update an existing document.
    """
    try:
        logger.info(f"Updating document {document_id} for user {user['id']}")

        update_data = document_update.dict(exclude_unset=True)

        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")

        try:
            response = supabase.from_("documents").update(update_data).eq("id", document_id).eq("user_id", user['id']).execute()

            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document not found or not authorized: {document_id}"
                )

            logger.info(f"Document {document_id} updated successfully.")
            return response.data[0]
        except Exception as db_error:
            logger.error(f"Database update failed: {str(db_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error updating document: {str(db_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.critical(f"Critical error in update_document for {document_id}: {str(e)}\n{traceback.format_exc()}")
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
