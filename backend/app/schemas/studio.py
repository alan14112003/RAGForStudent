"""
Studio schemas for unified studio items (quiz + flashcard).
"""

from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class StudioItem(BaseModel):
    """Unified studio item representing either a quiz or flashcard set."""
    id: int
    type: Literal['quiz', 'flashcard']
    title: str
    status: str
    item_count: int  # num_questions for quiz, num_cards for flashcard
    quiz_type: Optional[str] = None  # Only for quiz type items
    created_at: datetime

    class Config:
        from_attributes = True


class StudioItemsResponse(BaseModel):
    """Response containing list of studio items."""
    items: list[StudioItem]
    total: int
