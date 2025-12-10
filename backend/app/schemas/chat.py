
from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel


class ChatMessageBase(BaseModel):
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    title: Optional[str] = None

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionUpdate(ChatSessionBase):
    pass

class ChatSessionSummary(ChatSessionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    source_count: int = 0

    class Config:
        from_attributes = True

class ChatSession(ChatSessionSummary):
    messages: List[ChatMessage] = []



class ChatRequest(BaseModel):
    question: str
    session_id: Optional[int] = None
    use_rag: bool = True
