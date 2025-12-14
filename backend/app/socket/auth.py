"""
Socket authentication utilities.
Validates JWT tokens for socket connections.
"""

from typing import Optional
from jose import jwt, JWTError
from app.core.config import settings


def verify_socket_token(token: str) -> Optional[int]:
    """
    Verify JWT token and extract user_id.
    
    Args:
        token: JWT access token
        
    Returns:
        user_id if valid, None otherwise
    """
    if not token:
        return None
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = payload.get('sub')
        if user_id is None:
            return None
        return int(user_id)
    except JWTError:
        return None
