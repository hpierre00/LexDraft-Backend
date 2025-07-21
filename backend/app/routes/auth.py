from fastapi import APIRouter, HTTPException, Header, Depends, Body, UploadFile, File, Form
from fastapi.security import HTTPAuthorizationCredentials
from app.utils.auth_utils import get_current_user, security
from app.models.database import supabase
from app.utils import db_utils
from app.models.schemas import ProfileInfo, RefreshTokenRequest, ContactForm
import logging
from typing import Dict, Any, List
import traceback
import jwt
from datetime import datetime, timedelta
from uuid import UUID

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", tags=["Authentication"])
async def register(
    email: str = Body(..., description="User's email address", example="john.doe@example.com"),
    password: str = Body(..., description="User's password (min 8 characters)", example="securepass123")
) -> Dict[str, Any]:
    """
    Register a new user.
    
    Request body:
    ```json
    {
        "email": "john.doe@example.com",
        "password": "securepass123"
    }
    ```
    
    Returns:
    ```json
    {
        "message": "Registration successful. Please check your email to confirm your account.",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john.doe@example.com"
    }
    ```
    """
    try:
        logger.info(f"Registering new user: {email}")
        
        try:
            # Create user in Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to create user account"
                )
            
            user_id = auth_response.user.id
            logger.info(f"Auth user created: {user_id}")
            
            # Profile creation will now happen via /setup-profile
            
            return {
                "message": "Registration successful. Please check your email to confirm your account.",
                "user_id": user_id,
                "email": email
            }
        except Exception as db_error:
            logger.error(f"Registration failed: {str(db_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error during registration: {str(db_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in register: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/login", tags=["Authentication"])
async def login(
    email: str = Body(..., description="User's email address", example="john.doe@example.com"),
    password: str = Body(..., description="User's password", example="securepass123")
) -> Dict[str, Any]:
    """
    Login a user.
    
    Request body:
    ```json
    {
        "email": "john.doe@example.com",
        "password": "securepass123"
    }
    ```
    
    Returns:
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john.doe@example.com"
    }
    ```
    """
    try:
        logger.info(f"Login attempt for user: {email}")
        
        try:
            # Authenticate with Supabase
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                logger.warning(f"Login failed - Invalid credentials for: {email}")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password"
                )
            
            if not auth_response.session:
                logger.warning(f"Login failed - No session for: {email}")
                raise HTTPException(
                    status_code=401,
                    detail="Authentication failed - no session created"
                )
            
            logger.info(f"User logged in successfully: {auth_response.user.id}")
            
            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "user_id": auth_response.user.id,
                "email": email
            }
        except Exception as auth_error:
            error_msg = str(auth_error)
            logger.error(f"Login failed: {error_msg}")
            
            # Handle specific Supabase errors
            if "Invalid login credentials" in error_msg:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password"
                )
            elif "Email not confirmed" in error_msg:
                raise HTTPException(
                    status_code=401,
                    detail="Please confirm your email before logging in"
                )
            else:
                raise HTTPException(
                    status_code=401,
                    detail=f"Authentication failed: {error_msg}"
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in login: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/me", tags=["Authentication"])
async def get_current_user_info(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current user information. If profile doesn't exist, create it using setup_profile.
    """
    try:
        logger.info(f"Getting user info for: {user['id']}")

        response = supabase.from_("profiles").select("*").eq("id", user["id"]).execute()

        # Check if profile exists
        if response.data and len(response.data) > 0:
            logger.info(f"Retrieved user info for: {user['id']}")
            return response.data[0]

        # Profile does not exist
        logger.warning(f"No profile found for user {user['id']}, creating with defaults...")

        fallback_profile_info = ProfileInfo(
            user_id=UUID(user["id"]),
            full_name=user["email"].split("@")[0].capitalize(),
            email=user["email"],
            address=None,
            phone_number=None,
            gender=None,
            date_of_birth=None,
            state=None,
            city=None,
            zip_code=None,
            role="self",
        )

        result = await _setup_profile_internal(fallback_profile_info, user, mark_as_complete=False)
        logger.info(f"Profile created for user {user['id']}")
        return result["profile"]

    except HTTPException:
        raise  # Preserve any manually raised HTTP exceptions
    except Exception as e:
        logger.error(f"Unexpected error getting user info for {user['id']}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.put("/me", tags=["Authentication"])
async def update_my_profile(
    profile_info: ProfileInfo = Body(...),
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update authenticated user's profile information.
    """
    try:
        user_id = user["id"]
        logger.info(f"User {user_id} attempting to update their profile.")

        update_data = profile_info.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Ensure profile setup is marked as complete after the first update
        update_data["profile_setup_complete"] = True

        # Admins manage these fields manually
        update_data.pop("is_admin", None)

        if 'date_of_birth' in update_data and update_data['date_of_birth']:
            update_data['date_of_birth'] = update_data['date_of_birth'].isoformat()

        response = supabase.from_("profiles").update(update_data).eq("id", user_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found or no changes applied.")

        logger.info(f"User {user_id} profile updated successfully.")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating user profile {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.post("/logout", tags=["Authentication"])
async def logout(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, str]:
    """
    Logout the current user.
    
    Headers:
    ```
    Authorization: Bearer <access_token>
    ```
    
    Returns:
    ```json
    {
        "message": "Logged out successfully"
    }
    ```
    """
    try:
        logger.info(f"Logging out user: {user['id']}")
        
        try:
            supabase.auth.sign_out()
            logger.info(f"User logged out successfully: {user['id']}")
            return {"message": "Logged out successfully"}
        except Exception as logout_error:
            logger.error(f"Logout failed: {str(logout_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error during logout: {str(logout_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in logout: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/refresh", tags=["Authentication"])
async def refresh_token(
    body: RefreshTokenRequest
) -> Dict[str, Any]:
    """
    Refresh an access token using a refresh token.
    
    Request body:
    ```json
    {
        "refresh_token": "your_refresh_token_string"
    }
    ```
    
    Returns:
    ```json
    {
        "access_token": "new_access_token",
        "refresh_token": "new_refresh_token",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john.doe@example.com"
    }
    ```
    """
    try:
        logger.info("Attempting to refresh token...")
        # Use the refresh_token from the request body
        auth_response = supabase.auth.refresh_session(refresh_token=body.refresh_token)
        
        if not auth_response.user or not auth_response.session:
            logger.warning("Refresh failed - Invalid refresh token or no session.")
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token or session expired"
            )
        
        logger.info(f"Token refreshed for user: {auth_response.user.id}")
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user_id": auth_response.user.id,
            "email": auth_response.user.email
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token refresh: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

async def _setup_profile_internal(
    profile_info: ProfileInfo,
    user: dict,
    mark_as_complete: bool = True
) -> Dict[str, Any]:
    """
    Setup or update user profile information.
    """
    try:
        user_id = user["id"]
        logger.info(f"User {user_id} attempting to set up their profile.")

        # Check if profile already exists
        select_response = supabase.from_("profiles").select("id").eq("id", user_id).execute()

        profile_data = profile_info.dict(exclude_unset=True)
        profile_data["updated_at"] = datetime.utcnow().isoformat()
        profile_data["id"] = str(user_id)  # Convert UUID to string
        profile_data["email"] = user["email"]
        
        # Convert any UUID fields to strings for JSON serialization
        for key, value in profile_data.items():
            if isinstance(value, UUID):
                profile_data[key] = str(value)

        # Set profile_setup_complete based on context
        profile_data["profile_setup_complete"] = mark_as_complete

        if select_response.data:
            # Profile exists, update it
            # Do not update the is_admin or role fields, as they are managed by the admin
            profile_data.pop("is_admin", None)
            profile_data.pop("role", None)
            response = supabase.from_("profiles").update(profile_data).eq("id", user_id).execute()
        else:
            # Profile does not exist, insert it
            response = supabase.from_("profiles").insert(profile_data).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to set up profile.")

        logger.info(f"User {user_id} profile setup completed successfully.")
        return {"profile": response.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in setup_profile for user {user['id']}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/setup-profile", tags=["Authentication"])
async def setup_profile(
    profile_info: ProfileInfo = Body(...),
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Setup or update user profile information.
    """
    return await _setup_profile_internal(profile_info, user, mark_as_complete=True)
