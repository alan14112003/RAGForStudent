"""
Flashcard schemas for flashcard generation feature.
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class FlashcardStatus(str, Enum):
    """Trạng thái flashcard set"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================================================
# Request Schemas
# ============================================================================

class FlashcardGenerateRequest(BaseModel):
    """Request để tạo flashcard set từ documents"""
    document_ids: List[int] = Field(..., min_length=1, description="Danh sách ID documents để tạo flashcard")
    num_cards: int = Field(default=20, ge=10, le=50, description="Số lượng flashcard (10-50)")
    title: Optional[str] = None


# ============================================================================
# Response Schemas
# ============================================================================

class FlashcardResponse(BaseModel):
    """Response cho một flashcard"""
    id: int
    front_text: str
    back_text: str
    order_index: int

    class Config:
        from_attributes = True


class FlashcardSetResponse(BaseModel):
    """Response cho flashcard set"""
    id: int
    session_id: int
    title: str
    status: FlashcardStatus
    document_ids: Optional[List[int]] = None
    num_cards: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    cards: Optional[List[FlashcardResponse]] = None

    class Config:
        from_attributes = True


class FlashcardSetListItem(BaseModel):
    """Item trong danh sách flashcard set (không bao gồm cards)"""
    id: int
    session_id: int
    title: str
    status: FlashcardStatus
    num_cards: int
    created_at: datetime

    class Config:
        from_attributes = True


class FlashcardSetListResponse(BaseModel):
    """Response danh sách flashcard set"""
    items: List[FlashcardSetListItem]
    total: int
