
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.services import auth
from app.models.user import User
from app.schemas import user as user_schema
from app.schemas import token as token_schema
from pydantic import BaseModel

class DevLoginRequest(BaseModel):
    email: str
    full_name: str = "Dev User"


router = APIRouter()

@router.post("/login/google", response_model=token_schema.LoginResponse)
async def login_google(
    token: str = Body(..., embed=True),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Login with Google ID Token.
    Verifies the token, creates/updates user, returns access token.
    """
    # 1. Verify Google Token
    google_info = auth.verify_google_token(token)
    if not google_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google Token",
        )
    
    email = google_info.get("email")
    google_id = google_info.get("sub")
    full_name = google_info.get("name")
    avatar_url = google_info.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Email not found in token")

    # 2. Check if user exists
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()

    if not user:
        # Create new user
        user = User(
            email=email,
            google_id=google_id,
            full_name=full_name,
            avatar_url=avatar_url
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update user info if needed (optional, keeping it simple here)
        user.full_name = full_name
        user.avatar_url = avatar_url
        # If we wanted to link account if google_id is missing but email matches?
        # Assuming email is trusted from Google.
        if not user.google_id:
            user.google_id = google_id
        await db.commit()
        await db.refresh(user)
    
    # 3. Create Access Token
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "created_at": user.created_at,
        }
    }

@router.post("/login/dev", response_model=token_schema.LoginResponse)
async def login_dev(
    login_data: DevLoginRequest,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Dev Login for testing without Google.
    """
    email = login_data.email
    full_name = login_data.full_name
    
    # Check if user exists
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()

    if not user:
        # Create new user
        user = User(
            email=email,
            full_name=full_name,
            avatar_url="https://ui-avatars.com/api/?name=Dev+User",
            google_id="dev_google_id_" + email # Dummy Google ID
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Create Access Token
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "created_at": user.created_at,
        }
    }
