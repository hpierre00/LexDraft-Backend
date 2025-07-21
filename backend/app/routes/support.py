import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Dict
from app.models.database import supabase
from app.utils.auth_utils import get_current_user
import docx
from pypdf import PdfReader

router = APIRouter()

def extract_text_from_docx(file: io.BytesIO) -> str:
    document = docx.Document(file)
    return "\n".join([para.text for para in document.paragraphs])

def extract_text_from_pdf(file: io.BytesIO) -> str:
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

@router.post("")
async def support_form(
    type: str = Form(...),
    subject: str = Form(...),
    description: str = Form(...),
    attachment: UploadFile = File(None),
    user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Handles submission of the support form, with file content extraction.
    """
    try:
        user_id = user["id"]
        attachment_filename = None
        attachment_content = None

        if attachment:
            attachment_filename = attachment.filename
            file_content = await attachment.read()
            file_stream = io.BytesIO(file_content)

            if attachment.content_type == "application/pdf":
                attachment_content = extract_text_from_pdf(file_stream)
            elif attachment.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                attachment_content = extract_text_from_docx(file_stream)
            else:
                # For other file types, you might want to handle them differently
                # or raise an error. For now, we'll just store a message.
                attachment_content = "File content could not be extracted (unsupported format)."


        response = supabase.from_("support_tickets").insert({
            "user_id": user_id,
            "type": type,
            "subject": subject,
            "description": description,
            "attachment_filename": attachment_filename,
            "attachment_content": attachment_content
        }).execute()

        if response.data:
            return {"message": "Your support request has been sent successfully!"}
        else:
            raise HTTPException(status_code=500, detail="Could not save your support request.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 