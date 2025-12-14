"""
Studio API endpoints for unified studio items (quiz + flashcard).
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.api import deps
from app.models.user import User
from app.models.chat import ChatSession
from app.schemas.studio import StudioItem, StudioItemsResponse
from sqlalchemy.future import select

router = APIRouter()


@router.get("/{session_id}/studio-items", response_model=StudioItemsResponse)
async def list_studio_items(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    List all studio items (quizzes and flashcards) for a chat session.
    Items are sorted by created_at descending (newest first).
    Uses a single UNION query for efficiency.
    """
    
    # Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Single UNION query to fetch both quiz and flashcard in one database call
    union_query = text("""
        SELECT 
            id,
            'quiz' as type,
            title,
            status,
            num_questions as item_count,
            quiz_type,
            created_at
        FROM quizzes
        WHERE session_id = :session_id
        
        UNION ALL
        
        SELECT 
            id,
            'flashcard' as type,
            title,
            status,
            num_cards as item_count,
            NULL as quiz_type,
            created_at
        FROM flashcard_sets
        WHERE session_id = :session_id
        
        ORDER BY created_at DESC
    """)

    result = await db.execute(union_query, {"session_id": session_id})
    rows = result.fetchall()

    # Map to StudioItem
    items = [
        StudioItem(
            id=row.id,
            type=row.type,
            title=row.title,
            status=row.status,
            item_count=row.item_count,
            quiz_type=row.quiz_type,
            created_at=row.created_at,
        )
        for row in rows
    ]

    return StudioItemsResponse(items=items, total=len(items))
