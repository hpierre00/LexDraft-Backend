from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from app.models.database import supabase

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

@router.post("/")
async def contact_form(contact_data: ContactForm) -> Dict[str, str]:
    """
    Handles submission of the contact form.
    """
    try:
        response = supabase.from_("contacts").insert({
            "name": contact_data.name,
            "email": contact_data.email,
            "message": contact_data.message
        }).execute()

        if response.data:
            return {"message": "Your message has been sent successfully!"}
        else:
            raise HTTPException(status_code=500, detail="Could not save your message.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 