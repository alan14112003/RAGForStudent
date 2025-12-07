
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core import config, database
from app.models.user import User
from app.schemas import token as token_schema

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{config.settings.API_STR}/auth/login/access-token")

async def get_db() -> Generator:
    async with database.SessionLocal() as session:
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, 
            config.settings.SECRET_KEY, 
            algorithms=[config.settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = token_schema.TokenPayload(sub=user_id)
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).filter(User.id == int(token_data.sub)))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

from app.services.rag.service import RagService
from app.services.llm import LLMService
from app.services.storage import MinIOService

def get_rag_service() -> RagService:
    return RagService(
        qdrant_url=config.settings.QDRANT_URL,
        qdrant_api_key=config.settings.QDRANT_API_KEY
    )

def get_llm_service() -> LLMService:
    return LLMService(
        api_key=config.settings.GOOGLE_API_KEY
    )

def get_storage_service() -> MinIOService:
    return MinIOService()
