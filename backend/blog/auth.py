from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Instantiate FastAPI's built-in HTTPBearer for simple token-based authentication.
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Placeholder authentication dependency. In a real application, decode and verify
    the JWT or token contained in `credentials.credentials` and return the user.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token",
        )
    # Return a dummy user dict for now.
    return {"sub": "anonymous"}


def check_permissions(user: dict = Depends(get_current_user)):
    """
    Placeholder authorization dependency. Add role or permission checks here.
    """
    # For now, simply return the user. Implement permission logic as needed.
    return user
