# app/utils/auth_utils.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.models.database import supabase
import logging

logging.basicConfig(level=logging.DEBUG)

# Configure Bearer token scheme
security = HTTPBearer(
    scheme_name="Bearer",
    description="Enter your access token in the format: Bearer <token>",
    auto_error=True
)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to get current authenticated user
    """
    try:
        token = credentials.credentials
        logging.debug(f"Received token: {token}")  # Log the token
        user_response = supabase.auth.get_user(token)
        logging.debug(f"Supabase user response: {user_response}")  # Log the response

        # Check if the response contains a valid user
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Return a dictionary with only serializable fields
        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "email_confirmed": user_response.user.email_confirmed_at is not None
        }
    except Exception as e:
        logging.error(f"Error validating token: {e}")  # Log the error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def register_user(email: str, password: str):
    """User registration with proper error handling"""
    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed: User already exists"
            )
            
        return {
            "user_id": response.user.id,
            "email": response.user.email,
            "status": "confirmation_email_sent"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

def login_user(email: str, password: str):
    """User login with JWT token generation"""
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
            
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user_id": auth_response.user.id,
            "email": auth_response.user.email
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

def get_user_info(user = Depends(get_current_user)):
    """Get user info for authenticated users"""
    return {
        "user_id": user.id,
        "email": user.email,
        "email_confirmed": user.email_confirmed_at is not None
    }