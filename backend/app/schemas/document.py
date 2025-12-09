from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.document import DocumentStatus

class DocumentBase(BaseModel):
    filename: str
    status: DocumentStatus = DocumentStatus.PENDING

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    session_id: int
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentWithContent(Document):
    content: str

