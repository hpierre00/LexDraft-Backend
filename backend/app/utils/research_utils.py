import logging
from typing import Optional, List, Dict, Any
from app.models.database import supabase
from app.models.research_schemas import (
    ResearchHistoryCreate, 
    ResearchHistoryUpdate, 
    ResearchHistoryResponse,
    ResearchHistoryListResponse,
    ResearchStatus
)

logger = logging.getLogger(__name__)

async def create_research_history(user_id: str, data: ResearchHistoryCreate) -> Optional[ResearchHistoryResponse]:
    """Create a new research history entry"""
    try:
        research_data = {
            "user_id": user_id,
            "title": data.title,
            "query": data.query,
            "preliminary_result": data.preliminary_result,
            "clarifying_questions": data.clarifying_questions,
            "status": data.status.value
        }
        
        response = supabase.from_("research_history").insert(research_data).execute()
        
        if response.data and len(response.data) > 0:
            return ResearchHistoryResponse(**response.data[0])
        else:
            logger.error(f"No data returned from Supabase insert: {response}")
            return None
    except Exception as e:
        logger.error(f"Error creating research history: {str(e)}", exc_info=True)
        return None

async def update_research_history(user_id: str, research_id: str, data: ResearchHistoryUpdate) -> Optional[ResearchHistoryResponse]:
    """Update an existing research history entry"""
    try:
        update_data = {}
        
        if data.title is not None:
            update_data["title"] = data.title
        if data.clarifying_answers is not None:
            update_data["clarifying_answers"] = data.clarifying_answers
        if data.final_result is not None:
            update_data["final_result"] = data.final_result
        if data.status is not None:
            update_data["status"] = data.status.value
            
        response = supabase.from_("research_history").update(update_data).eq("id", research_id).eq("user_id", user_id).execute()
        
        if response.data:
            return ResearchHistoryResponse(**response.data[0])
        return None
    except Exception as e:
        logger.error(f"Error updating research history: {str(e)}")
        return None

async def get_research_history(user_id: str, research_id: str) -> Optional[ResearchHistoryResponse]:
    """Get a specific research history entry"""
    try:
        response = supabase.from_("research_history").select("*").eq("id", research_id).eq("user_id", user_id).maybe_single().execute()
        
        if response.data:
            return ResearchHistoryResponse(**response.data)
        return None
    except Exception as e:
        logger.error(f"Error fetching research history: {str(e)}")
        return None

async def get_research_history_list(user_id: str, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
    """Get paginated list of research history entries"""
    try:
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Get total count
        count_response = supabase.from_("research_history").select("*", count="exact").eq("user_id", user_id).execute()
        total = count_response.count or 0
        
        # Get paginated data
        response = supabase.from_("research_history").select(
            "id, title, query, status, created_at, updated_at"
        ).eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
        
        items = [ResearchHistoryListResponse(**item) for item in response.data] if response.data else []
        
        result = {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "has_next": offset + per_page < total,
            "has_prev": page > 1
        }
        
        return result
    except Exception as e:
        logger.error(f"Error fetching research history list: {str(e)}", exc_info=True)
        return {
            "items": [],
            "total": 0,
            "page": page,
            "per_page": per_page,
            "has_next": False,
            "has_prev": False
        }

async def delete_research_history(user_id: str, research_id: str) -> bool:
    """Delete a research history entry"""
    try:
        response = supabase.from_("research_history").delete().eq("id", research_id).eq("user_id", user_id).execute()
        return len(response.data) > 0
    except Exception as e:
        logger.error(f"Error deleting research history: {str(e)}")
        return False

def generate_research_title(query: str) -> str:
    """Generate a title from the research query"""
    # Take first 50 characters and add ellipsis if longer
    title = query.strip()
    if len(title) > 50:
        title = title[:47] + "..."
    return title 