"""
Quiz models for Q&A generation feature.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class QuizType(str, enum.Enum):
    """Loại quiz"""
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    MIXED = "mixed"


class QuizStatus(str, enum.Enum):
    """Trạng thái quiz"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class QuestionType(str, enum.Enum):
    """Loại câu hỏi"""
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"


class Quiz(Base):
    """Bảng lưu trữ quiz"""
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    quiz_type = Column(Enum(QuizType), default=QuizType.MIXED)
    status = Column(Enum(QuizStatus), default=QuizStatus.PENDING)
    document_ids = Column(JSON, nullable=True)  # List of document IDs used
    num_questions = Column(Integer, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    """Bảng lưu trữ câu hỏi trong quiz"""
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), default=QuestionType.SINGLE_CHOICE)
    options = Column(JSON, nullable=False)  # List of option strings
    correct_answers = Column(JSON, nullable=False)  # List of correct indices
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
