import os
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Path
from fastapi.responses import FileResponse
from typing import List, Dict, Any

from app.models.database import supabase
from app.utils.auth_utils import get_current_user
from app.utils.file_utils import save_and_parse_file
from app.services.langchain_agent import ChatLawyerAgent

router = APIRouter()

def get_openai_key():
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY environment variable not set.")
    return key

# NEW ENDPOINT: To fetch chat history for the frontend sidebar
@router.get("/chat-lawyer/sessions", tags=["Agents"], response_model=List[Dict[str, Any]])
async def list_chat_sessions(user: dict = Depends(get_current_user)):
    """
    Fetches a list of unique chat sessions for the authenticated user,
    ordered by the most recently updated.
    """
    try:
        user_id = user['id']
        # Fetch all session entries for the user, ordered so the most recent message in any session comes first

        response = supabase.from_("chat_histories").select("session_id, title, updated_at").eq("user_id", user_id).order("updated_at", desc=True).execute()
        # supabase-py does not have a .error attribute; errors are raised as exceptions or .data is None/empty
        if not response.data:
            # Return an empty list with 200 OK if no chat sessions are found
            return []

        # The query might return multiple rows for the same session_id (one for each message history update).
        # We need to de-duplicate to get a unique list of sessions.
        unique_sessions = {}
        for session in response.data:
            session_id = session['session_id']
            if session_id not in unique_sessions:
                unique_sessions[session_id] = {
                    "session_id": session_id,
                    "user_id": user_id,
                    "title": session.get('title', 'New Chat'),
                    "updated_at": session['updated_at']
                }
        
        # Return the unique sessions as a list
        return list(unique_sessions.values())

    except Exception as e:
        print(f"Error fetching chat sessions for user {user.get('id')}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching chat sessions.")

# NEW ENDPOINT: To fetch chat history for a specific session
@router.get("/chat-lawyer/sessions/{session_id}/history", tags=["Agents"], response_model=Dict[str, Any])
async def get_chat_history(session_id: str, user: dict = Depends(get_current_user)):
    """
    Fetches the chat history for a specific session.
    """
    try:
        user_id = user['id']
        
        response = supabase.from_("chat_histories").select("history, title").eq("session_id", session_id).eq("user_id", user_id).maybe_single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Chat session not found.")
        
        return {
            "session_id": session_id,
            "title": response.data.get('title', 'New Chat'),
            "history": response.data.get('history', [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching chat history for session {session_id}, user {user.get('id')}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching chat history.")

@router.post("/chat-lawyer/upload", tags=["Agents"])
async def upload_document_for_chat_context(file: UploadFile = File(...)):
    """
    Parses a document to provide text content that can be passed as context
    to the chat endpoint. This does not save the document to the database.
    """
    try:
        text = await save_and_parse_file(file)
        return {"contract_text": text, "message": "File parsed successfully. You can now include this text in your chat request."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")

@router.post("/chat-lawyer/chat", tags=["Agents"])
async def chat_lawyer(
    session_id: str = Form(...),
    message: str = Form(...),
    contract_text: str = Form(None),
    user: dict = Depends(get_current_user),
    openai_api_key: str = Depends(get_openai_key)
):
    """
    Handles a stateful, persistent chat message within a specific session for an authenticated user.
    """
    if not session_id:
        raise HTTPException(status_code=400, detail="A session_id is required.")

    # Fetch user profile data
    profile_data = {}
    try:
        from app.utils.db_utils import get_profile
        profile_response = await get_profile(user['id'])
        if profile_response:
            profile_data = profile_response
    except Exception as e:
        print(f"Warning: Could not fetch profile for user {user['id']}: {e}")
        # Continue without profile data rather than failing

    agent = ChatLawyerAgent(
        openai_api_key=openai_api_key, 
        user_id=user['id'], 
        session_id=session_id,
        profile_data=profile_data
    )
    
    try:
        response = await agent.arun(message, contract_text)
        return {"response": response}
    except Exception as e:
        print(f"Error during agent execution for user {user['id']}, session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")
    