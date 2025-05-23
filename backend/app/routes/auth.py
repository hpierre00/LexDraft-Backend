from fastapi import APIRouter, HTTPException, Header, Depends, Body
from fastapi.security import HTTPAuthorizationCredentials
from app.utils.auth_utils import get_current_user, security
from app.models.database import supabase
import logging
from typing import Dict, Any
import traceback
import jwt
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", tags=["Authentication"])
async def register(
    email: str = Body(..., description="User's email address", example="john.doe@example.com"),
    password: str = Body(..., description="User's password (min 8 characters)", example="securepass123"),
    first_name: str = Body(..., description="User's first name", example="John"),
    last_name: str = Body(..., description="User's last name", example="Doe")
) -> Dict[str, Any]:
    """
    Register a new user.
    
    Request body:
    ```json
    {
        "email": "john.doe@example.com",
        "password": "securepass123",
        "first_name": "John",
        "last_name": "Doe"
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
            # Create user in Supabase Auth with metadata
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "first_name": first_name,
                        "last_name": last_name
                    }
                }
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to create user account"
                )
            
            user_id = auth_response.user.id
            logger.info(f"Auth user created: {user_id}")
            
            # Create profile immediately
            profile_data = {
                "id": user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "created_at": datetime.utcnow().isoformat()
            }
            
            try:
                profile_response = supabase.from_("profiles").insert(profile_data).execute()
                logger.info(f"Profile created for user: {user_id}")
            except Exception as profile_error:
                logger.error(f"Profile creation failed: {str(profile_error)}")
                # Don't fail registration if profile creation fails
                # The user can create profile later using setup-profile
            
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
    Get current user information.
    
    Headers:
    ```
    Authorization: Bearer <access_token>
    ```
    
    Returns:
    ```json
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2024-03-20T10:00:00Z",
        "updated_at": "2024-03-20T10:00:00Z"
    }
    ```
    """
    try:
        logger.info(f"Getting user info for: {user['id']}")
        
        try:
            response = supabase.from_("profiles").select("*").eq("id", user["id"]).single().execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail="User profile not found"
                )
            
            logger.info(f"Retrieved user info for: {user['id']}")
            return response.data
        except Exception as query_error:
            logger.error(f"Profile fetch failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching user profile: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_current_user_info: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

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
    refresh_token: str = Body(..., description="Refresh token from login response", example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
) -> Dict[str, Any]:
    """
    Refresh the access token.
    
    Request body:
    ```json
    {
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
    
    Returns:
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
    """
    try:
        logger.info("Refreshing access token")
        
        try:
            response = supabase.auth.refresh_session({
                "refresh_token": refresh_token
            })
            
            if not response.session:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid refresh token"
                )
            
            logger.info(f"Token refreshed successfully for user: {response.user.id}")
            return {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }
        except Exception as refresh_error:
            logger.error(f"Token refresh failed: {str(refresh_error)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in refresh_token: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/setup-profile", tags=["Authentication"])
async def setup_profile(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Create or update user profile after login.
    This endpoint should be called after the user has confirmed their email and logged in.
    
    Headers:
    ```
    Authorization: Bearer <access_token>
    ```
    
    Returns:
    ```json
    {
        "message": "Profile created successfully",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john.doe@example.com"
    }
    ```
    """
    try:
        logger.info(f"Setting up profile for user: {user['id']}")
        
        try:
            # Check if profile already exists
            profile_check = supabase.from_("profiles").select("id").eq("id", user["id"]).execute()
            
            if profile_check.data:
                logger.info(f"Profile already exists for user: {user['id']}")
                return {
                    "message": "Profile already exists",
                    "user_id": user["id"]
                }
            
            # Get user metadata from auth using session token
            auth_user = supabase.auth.get_user(credentials.credentials)
            user_metadata = auth_user.user.user_metadata if auth_user and auth_user.user else {}
            
            logger.info(f"User metadata: {user_metadata}")
            
            # Create profile
            profile_data = {
                "id": user["id"],
                "email": user["email"],
                "first_name": user_metadata.get("first_name"),
                "last_name": user_metadata.get("last_name"),
                "created_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Creating profile with data: {profile_data}")
            
            # Create profile with RLS bypass
            profile_response = supabase.from_("profiles").insert(profile_data).execute()
            
            if not profile_response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create profile"
                )
            
            logger.info(f"Profile created for user: {user['id']}")
            
            return {
                "message": "Profile created successfully",
                "user_id": user["id"],
                "email": user["email"]
            }
        except Exception as profile_error:
            logger.error(f"Profile creation failed: {str(profile_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating profile: {str(profile_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in setup_profile: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
