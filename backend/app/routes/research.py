from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict
import logging

from app.utils.auth_utils import get_current_user
from app.services.ai_agent_research import conduct_deep_research
from app.utils.db_utils import get_profile
from app.utils.research_utils import (
    create_research_history, 
    update_research_history,
    get_research_history,
    get_research_history_list,
    delete_research_history,
    generate_research_title
)
from app.models.research_schemas import (
    ResearchHistoryCreate,
    ResearchHistoryUpdate, 
    ResearchHistoryResponse,
    ResearchHistoryListPaginated,
    ResearchStatus
)

router = APIRouter()

class ResearchRequest(BaseModel):
    query: str
    clarifying_answers: Optional[Dict[str, str]] = None
    save_to_history: bool = True
    research_id: Optional[str] = None  # For updating existing research

class ResearchResponse(BaseModel):
    result: str
    success: bool
    message: Optional[str] = None
    research_id: Optional[str] = None  # ID of saved research

@router.post("/conduct", response_model=ResearchResponse)
async def conduct_research(
    request: ResearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Conduct legal research on a given query.
    If clarifying_answers are not provided, the system will generate clarifying questions.
    If clarifying_answers are provided, it will conduct focused research.
    """
    try:
        user_id = current_user.get("id")
        
        # Verify user profile exists
        user_profile = await get_profile(user_id)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Conduct the research
        research_result = await conduct_deep_research(
            query=request.query,
            clarifying_answers=request.clarifying_answers
        )
        
        research_id = None
        
        # Save to history if requested
        if request.save_to_history:
            try:
                if request.research_id:
                    # Update existing research
                    if request.clarifying_answers:
                        # This is the final result
                        update_data = ResearchHistoryUpdate(
                            clarifying_answers=request.clarifying_answers,
                            final_result=research_result,
                            status=ResearchStatus.COMPLETED
                        )
                    else:
                        # This is updating preliminary result
                        update_data = ResearchHistoryUpdate(
                            final_result=research_result
                        )
                    
                    updated_research = await update_research_history(
                        user_id=user_id,
                        research_id=request.research_id,
                        data=update_data
                    )
                    if updated_research:
                        research_id = updated_research.id
                else:
                    # Create new research entry
                    title = generate_research_title(request.query)
                    
                    # Determine status and extract clarifying questions
                    clarifying_questions = None
                    status = ResearchStatus.PRELIMINARY
                    
                    if research_result and "### Clarifying Questions:" in research_result:
                        # Extract questions from result
                        lines = research_result.split('\n')
                        questions = []
                        in_questions_section = False
                        
                        for line in lines:
                            if "### Clarifying Questions:" in line:
                                in_questions_section = True
                                continue
                            elif line.startswith("### ") and in_questions_section:
                                break
                            elif in_questions_section and line.strip() and line.strip()[0].isdigit() and '.' in line:
                                questions.append(line.strip().split('.', 1)[1].strip())
                        
                        if questions:
                            clarifying_questions = questions
                            status = ResearchStatus.QUESTIONS_PENDING
                    elif request.clarifying_answers:
                        status = ResearchStatus.COMPLETED
                    
                    create_data = ResearchHistoryCreate(
                        title=title,
                        query=request.query,
                        preliminary_result=research_result,
                        clarifying_questions=clarifying_questions,
                        status=status
                    )
                    
                    created_research = await create_research_history(
                        user_id=user_id,
                        data=create_data
                    )
                    if created_research:
                        research_id = created_research.id
                        logging.info(f"Successfully created research history with ID: {research_id}")
                    else:
                        logging.error("Failed to create research history - no data returned")
            except Exception as e:
                logging.error(f"Failed to save research to history: {str(e)}", exc_info=True)
        
        return ResearchResponse(
            result=research_result,
            success=True,
            message="Research completed successfully",
            research_id=research_id
        )
    
    except Exception as e:
        logging.error(f"Error conducting research: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to conduct research: {str(e)}")

@router.get("/history", response_model=ResearchHistoryListPaginated)
async def get_research_history_list_endpoint(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user)
):
    """Get paginated list of research history for the current user."""
    try:
        user_id = current_user.get("id")
        
        result = await get_research_history_list(
            user_id=user_id,
            page=page,
            per_page=per_page
        )
        
        return ResearchHistoryListPaginated(**result)
    except Exception as e:
        logging.error(f"Error fetching research history list: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch research history")

@router.get("/history/{research_id}", response_model=ResearchHistoryResponse)
async def get_research_history_detail(
    research_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed research history by ID."""
    try:
        user_id = current_user.get("id")
        
        research = await get_research_history(user_id=user_id, research_id=research_id)
        if not research:
            raise HTTPException(status_code=404, detail="Research not found")
        
        return research
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching research history detail: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch research history")

@router.put("/history/{research_id}", response_model=ResearchHistoryResponse)
async def update_research_history_endpoint(
    research_id: str,
    update_data: ResearchHistoryUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update research history entry."""
    try:
        user_id = current_user.get("id")
        
        updated_research = await update_research_history(
            user_id=user_id,
            research_id=research_id,
            data=update_data
        )
        
        if not updated_research:
            raise HTTPException(status_code=404, detail="Research not found")
        
        return updated_research
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating research history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update research history")

@router.delete("/history/{research_id}")
async def delete_research_history_endpoint(
    research_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete research history entry."""
    try:
        user_id = current_user.get("id")
        
        success = await delete_research_history(user_id=user_id, research_id=research_id)
        if not success:
            raise HTTPException(status_code=404, detail="Research not found")
        
        return {"message": "Research deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting research history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete research history")

@router.get("/health")
async def health_check():
    """Health check endpoint for the research service."""
    return {"status": "healthy", "service": "legal_research"} 