"""
Quiz schemas for Q&A generation feature.
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class QuizType(str, Enum):
    """Loại quiz"""
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    MIXED = "mixed"


class QuizStatus(str, Enum):
    """Trạng thái quiz"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class QuestionType(str, Enum):
    """Loại câu hỏi"""
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"


# ============================================================================
# Request Schemas
# ============================================================================

class QuizGenerateRequest(BaseModel):
    """Request để tạo quiz từ documents"""
    document_ids: List[int] = Field(..., min_length=1, description="Danh sách ID documents để tạo quiz")
    quiz_type: QuizType = QuizType.MIXED
    num_questions: int = Field(default=10, ge=10, le=30, description="Số lượng câu hỏi (10-30)")
    title: Optional[str] = None


# ============================================================================
# Response Schemas
# ============================================================================

class QuizQuestionResponse(BaseModel):
    """Response cho một câu hỏi trong quiz"""
    id: int
    question_text: str
    question_type: QuestionType
    options: List[str]
    correct_answers: List[int]
    explanation: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True


class QuizResponse(BaseModel):
    """Response cho quiz"""
    id: int
    session_id: int
    title: str
    quiz_type: QuizType
    status: QuizStatus
    document_ids: Optional[List[int]] = None
    num_questions: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    questions: Optional[List[QuizQuestionResponse]] = None

    class Config:
        from_attributes = True


class QuizListItem(BaseModel):
    """Item trong danh sách quiz (không bao gồm questions)"""
    id: int
    session_id: int
    title: str
    quiz_type: QuizType
    status: QuizStatus
    num_questions: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuizListResponse(BaseModel):
    """Response danh sách quiz"""
    items: List[QuizListItem]
    total: int
