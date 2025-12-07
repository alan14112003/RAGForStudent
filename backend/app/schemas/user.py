
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    google_id: str

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: int
    google_id: str

    class Config:
        from_attributes = True
