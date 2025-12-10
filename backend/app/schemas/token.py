
from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserInfo(BaseModel):
    """User info returned after login (excludes sensitive fields like google_id)"""
    id: int
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    """Response for login endpoints - includes token and user info"""
    access_token: str
    token_type: str
    user: UserInfo
