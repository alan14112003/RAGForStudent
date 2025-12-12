from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class SummaryScope(str, Enum):
    """Phạm vi tóm tắt"""
    FULL = "full"           # Toàn bộ tài liệu
    CHAPTER = "chapter"     # Từng chapter/section


class SummaryFormat(str, Enum):
    """Định dạng tóm tắt"""
    BULLET = "bullet"              # Danh sách bullet points
    EXECUTIVE = "executive"        # Executive summary (đoạn văn)
    TABLE = "table"                # Bảng tóm tắt


class SummaryRequest(BaseModel):
    """Request để tóm tắt tài liệu"""
    scope: SummaryScope = SummaryScope.FULL
    format: SummaryFormat = SummaryFormat.BULLET
    chapter_indices: Optional[List[int]] = None  # Nếu scope=CHAPTER, hỗ trợ nhiều chương


class ChapterInfo(BaseModel):
    """Thông tin về chapter/section trong tài liệu"""
    index: int
    title: str
    start_char: int
    end_char: int


class ChaptersResponse(BaseModel):
    """Response trả về danh sách chapters"""
    document_id: int
    chapters: List[ChapterInfo]


class SummaryMessageInfo(BaseModel):
    """Thông tin message tóm tắt được tạo"""
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class SummaryResponse(BaseModel):
    """Response trả về kết quả tóm tắt"""
    document_id: int
    scope: SummaryScope
    format: SummaryFormat
    summary: str
    chapter_title: Optional[str] = None  # Nếu scope=CHAPTER
    chapters: Optional[List[ChapterInfo]] = None  # Table of contents (optional)
    message: SummaryMessageInfo  # Chat message được tạo

