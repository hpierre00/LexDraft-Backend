from fastapi import APIRouter, HTTPException, Depends, Body, Path
from app.models.database import supabase
from app.utils.auth_utils import get_current_user
from app.models.schemas import ClientProfileCreate, ClientProfileResponse, ClientFolder
import logging
from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime

router = APIRouter()

logger = logging.getLogger(__name__)

async def is_attorney_user(user: dict = Depends(get_current_user)):
    """Dependency to check if the current user has the 'attorney' role."""
    try:
        profile_response = supabase.from_("profiles").select("role").eq("id", user["id"]).single().execute()
        if not profile_response.data or profile_response.data["role"] != "attorney":
            logger.warning(f"User {user['id']} attempted to access attorney-only endpoint without 'attorney' role.")
            raise HTTPException(status_code=403, detail="Access denied: Only attorneys can perform this action.")
        return user
    except HTTPException:
        raise # Re-raise HTTPException directly
    except Exception as e:
        logger.error(f"Error checking attorney role for user {user['id']}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during role check.")

# --- Client Profile Management ---

@router.post("/clients/create", tags=["Client Management"], response_model=ClientProfileResponse)
async def create_client_profile(
    client_profile: ClientProfileCreate = Body(...),
    attorney_user: dict = Depends(is_attorney_user) # Ensure only attorneys can create clients
) -> Dict[str, Any]:
    """
    Create a new client profile for the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} attempting to create client profile for {client_profile.full_name}")

        profile_data = client_profile.dict(exclude_unset=True)
        
        # Remove any potentially ambiguous 'id' or 'user_id' fields
        profile_data.pop("id", None)
        profile_data.pop("user_id", None)

        # Convert date_of_birth to string for JSON serialization if it exists
        if 'date_of_birth' in profile_data and profile_data['date_of_birth']:
            profile_data['date_of_birth'] = profile_data['date_of_birth'].isoformat()

        # Removed debug logging

        profile_data["attorney_id"] = attorney_id

        response = supabase.from_("client_profiles").insert(profile_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create client profile in database.")

        logger.info(f"Client profile created for attorney {attorney_id}: {response.data[0]['id']}")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating client profile: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/clients/list", tags=["Client Management"], response_model=List[ClientProfileResponse])
async def list_client_profiles(
    attorney_user: dict = Depends(is_attorney_user)
) -> List[Dict[str, Any]]:
    """
    List all client profiles for the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} requesting list of client profiles.")

        response = supabase.from_("client_profiles").select("*").eq("attorney_id", attorney_id).execute()

        if not response.data:
            return [] # No clients found

        logger.info(f"Found {len(response.data)} client profiles for attorney {attorney_id}.")
        return response.data
    except Exception as e:
        logger.error(f"Unexpected error listing client profiles for attorney {attorney_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/clients/{client_id}", tags=["Client Management"], response_model=ClientProfileResponse)
async def get_client_profile(
    client_id: UUID = Path(...),
    attorney_user: dict = Depends(is_attorney_user)
) -> Dict[str, Any]:
    """
    Get a specific client profile by ID for the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} requesting client profile {client_id}.")

        response = supabase.from_("client_profiles").select("*").eq("id", str(client_id)).eq("attorney_id", attorney_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Client profile not found or not accessible by this attorney.")

        logger.info(f"Client profile {client_id} retrieved for attorney {attorney_id}.")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting client profile {client_id} for attorney {attorney_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.put("/clients/{client_id}", tags=["Client Management"], response_model=ClientProfileResponse)
async def update_client_profile(
    client_id: UUID = Path(...),
    client_profile_update: ClientProfileCreate = Body(...), # Reuse ClientProfileCreate for update fields
    attorney_user: dict = Depends(is_attorney_user)
) -> Dict[str, Any]:
    """
    Update a client profile by ID for the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} attempting to update client profile {client_id}.")

        update_data = client_profile_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat() # Update timestamp

        # Convert date_of_birth to string for JSON serialization if it exists
        if 'date_of_birth' in update_data and update_data['date_of_birth']:
            update_data['date_of_birth'] = update_data['date_of_birth'].isoformat()

        response = supabase.from_("client_profiles").update(update_data).eq("id", str(client_id)).eq("attorney_id", attorney_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Client profile not found or not accessible by this attorney.")

        logger.info(f"Client profile {client_id} updated by attorney {attorney_id}.")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating client profile {client_id} for attorney {attorney_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.delete("/clients/{client_id}", tags=["Client Management"])
async def delete_client_profile(
    client_id: UUID = Path(...),
    attorney_user: dict = Depends(is_attorney_user)
) -> Dict[str, str]:
    """
    Delete a client profile by ID for the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} attempting to delete client profile {client_id}.")

        response = supabase.from_("client_profiles").delete().eq("id", str(client_id)).eq("attorney_id", attorney_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Client profile not found or not accessible by this attorney.")

        logger.info(f"Client profile {client_id} deleted by attorney {attorney_id}.")
        return {"message": "Client profile deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting client profile {client_id} for attorney {attorney_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# --- Client Folder Management ---

@router.post("/clients/{client_id}/folders/create", tags=["Client Management"], response_model=ClientFolder)
async def create_client_folder(
    client_id: UUID = Path(...),
    folder_name: str = Body(..., example="Family Law Cases"),
    attorney_user: dict = Depends(is_attorney_user)
) -> Dict[str, Any]:
    """
    Create a new folder for a specific client of the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} attempting to create folder '{folder_name}' for client {client_id}.")

        # Verify the client belongs to this attorney
        client_check = supabase.from_("client_profiles").select("id").eq("id", str(client_id)).eq("attorney_id", attorney_id).single().execute()
        if not client_check.data:
            raise HTTPException(status_code=404, detail="Client not found or not accessible by this attorney.")

        folder_data = {
            "attorney_id": attorney_id,
            "client_profile_id": str(client_id),
            "folder_name": folder_name,
            "created_at": datetime.utcnow().isoformat()
        }

        response = supabase.from_("client_folders").insert(folder_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create client folder in database.")

        logger.info(f"Client folder '{folder_name}' created for client {client_id} by attorney {attorney_id}: {response.data[0]['id']}")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating client folder: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/clients/{client_id}/folders/list", tags=["Client Management"], response_model=List[ClientFolder])
async def list_client_folders(
    client_id: UUID = Path(...),
    attorney_user: dict = Depends(is_attorney_user)
) -> List[Dict[str, Any]]:
    """
    List all folders for a specific client of the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} requesting list of folders for client {client_id}.")

        # Verify the client belongs to this attorney
        client_check = supabase.from_("client_profiles").select("id").eq("id", str(client_id)).eq("attorney_id", attorney_id).single().execute()
        if not client_check.data:
            raise HTTPException(status_code=404, detail="Client not found or not accessible by this attorney.")

        response = supabase.from_("client_folders").select("*").eq("attorney_id", attorney_id).eq("client_profile_id", str(client_id)).execute()

        if not response.data:
            return [] # No folders found for this client

        logger.info(f"Found {len(response.data)} folders for client {client_id} by attorney {attorney_id}.")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error listing client folders for client {client_id} by attorney {attorney_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.put("/clients/{client_id}/folders/{folder_id}", tags=["Client Management"], response_model=ClientFolder)
async def update_client_folder(
    client_id: UUID = Path(...),
    folder_id: UUID = Path(...),
    folder_name: str = Body(..., example="Updated Case Files"),
    attorney_user: dict = Depends(is_attorney_user)
) -> Dict[str, Any]:
    """
    Update a client folder by ID for a specific client of the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} attempting to update folder {folder_id} for client {client_id}.")

        # Verify the client belongs to this attorney and folder belongs to client/attorney
        folder_check = supabase.from_("client_folders").select("id").eq("id", str(folder_id)).eq("client_profile_id", str(client_id)).eq("attorney_id", attorney_id).single().execute()
        if not folder_check.data:
            raise HTTPException(status_code=404, detail="Folder not found or not accessible by this attorney for this client.")

        update_data = {
            "folder_name": folder_name,
            "updated_at": datetime.utcnow().isoformat()
        }

        response = supabase.from_("client_folders").update(update_data).eq("id", str(folder_id)).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update client folder in database.")

        logger.info(f"Client folder {folder_id} updated for client {client_id} by attorney {attorney_id}.")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating client folder {folder_id} for client {client_id} by attorney {attorney_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.delete("/clients/{client_id}/folders/{folder_id}", tags=["Client Management"])
async def delete_client_folder(
    client_id: UUID = Path(...),
    folder_id: UUID = Path(...),
    attorney_user: dict = Depends(is_attorney_user)
) -> Dict[str, str]:
    """
    Delete a client folder by ID for a specific client of the authenticated attorney.
    """
    try:
        attorney_id = attorney_user["id"]
        logger.info(f"Attorney {attorney_id} attempting to delete folder {folder_id} for client {client_id}.")

        # Verify the client belongs to this attorney and folder belongs to client/attorney
        folder_check = supabase.from_("client_folders").select("id").eq("id", str(folder_id)).eq("client_profile_id", str(client_id)).eq("attorney_id", attorney_id).single().execute()
        if not folder_check.data:
            raise HTTPException(status_code=404, detail="Folder not found or not accessible by this attorney for this client.")

        response = supabase.from_("client_folders").delete().eq("id", str(folder_id)).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to delete client folder from database.")

        logger.info(f"Client folder {folder_id} deleted for client {client_id} by attorney {attorney_id}.")
        return {"message": "Client folder deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting client folder {folder_id} for client {client_id} by attorney {attorney_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}") 