"""
Flashcard models for flashcard generation feature.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class FlashcardStatus(str, enum.Enum):
    """Trạng thái flashcard set"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class FlashcardSet(Base):
    """Bảng lưu trữ bộ flashcard"""
    __tablename__ = "flashcard_sets"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(Enum(FlashcardStatus), default=FlashcardStatus.PENDING)
    document_ids = Column(JSON, nullable=True)  # List of document IDs used
    num_cards = Column(Integer, default=20)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="flashcard_sets")
    cards = relationship("Flashcard", back_populates="flashcard_set", cascade="all, delete-orphan")


class Flashcard(Base):
    """Bảng lưu trữ từng flashcard"""
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_set_id = Column(Integer, ForeignKey("flashcard_sets.id"), nullable=False)
    front_text = Column(Text, nullable=False)  # Mặt câu hỏi
    back_text = Column(Text, nullable=False)   # Mặt trả lời
    order_index = Column(Integer, default=0)

    # Relationships
    flashcard_set = relationship("FlashcardSet", back_populates="cards")
