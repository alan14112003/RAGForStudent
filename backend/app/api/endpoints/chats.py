
import shutil
import tempfile
import os
from pathlib import Path
import logging
from typing import Any, List, Optional
logger = logging.getLogger(__name__)


from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.document import Document, DocumentStatus
from app.schemas import chat as chat_schema
from app.services.rag.service import RagService, QueryWithLLMResult
from app.services.llm import LLMService
from app.services.storage import MinIOService

router = APIRouter()

@router.get("/", response_model=List[chat_schema.ChatSessionSummary])
async def list_chats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """List all chats for current user with source count."""
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.documents))
        .order_by(ChatSession.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    chats = result.scalars().all()
    
    # Build response with source_count
    return [
        chat_schema.ChatSessionSummary(
            id=chat.id,
            user_id=chat.user_id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
            source_count=len(chat.documents)
        )
        for chat in chats
    ]

@router.post("/", response_model=chat_schema.ChatSession)
async def create_chat(
    chat_in: chat_schema.ChatSessionCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Create a new chat session."""
    chat = ChatSession(
        user_id=current_user.id,
        title=chat_in.title or "New Chat"
    )
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    
    return chat_schema.ChatSession(
        id=chat.id,
        user_id=chat.user_id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages=[]
    )

@router.get("/{session_id}", response_model=chat_schema.ChatSession)
async def get_chat(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get chat session details with messages."""
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.messages))
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@router.post("/{session_id}/messages", response_model=chat_schema.ChatMessage)
async def send_message(
    session_id: int,
    request: chat_schema.ChatRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    rag_service: RagService = Depends(deps.get_rag_service),
    llm_service: LLMService = Depends(deps.get_llm_service),
) -> Any:
    """Send a message to the chat."""
    # 1. Get Chat
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.documents))
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    user_id_str = str(current_user.id)
    chat_id = chat.id
    has_docs = len(chat.documents) > 0

    # 2. Save User Message
    user_msg = ChatMessage(
        session_id=chat_id,
        role="user",
        content=request.question
    )
    db.add(user_msg)
    await db.commit() # Commit to get ID and ensure persistence
    
    # 3. Process with RAG or Social
    # Logic: If chat has documents, use RAG. Else Social.
    # We can also use request.use_rag flag to force behavior if needed.
    ai_response_content = ""
    sources = []

    try:
        if has_docs and request.use_rag:
            # Use RAG
            # Use user_id for collection separation
            # Pass user_id as string
            rag_result: QueryWithLLMResult = await rag_service.query_with_llm(
                user_id=user_id_str,
                session_id=str(chat_id),
                question=request.question,
                llm_service=llm_service,
                k=5
            )
            ai_response_content = rag_result.answer["content"]
            sources = rag_result.answer["references"]
        else:
            # Social Chat (No RAG)
            ai_response_content = llm_service.generate(prompt=request.question)
            sources = [] # No sources
            
        # 4. Save AI Message
        ai_msg = ChatMessage(
            session_id=chat_id,
            role="ai",
            content=ai_response_content,
            sources=sources
        )
        db.add(ai_msg)
        
        # Update Chat updated_at (optional if not auto)
        # chat.updated_at = ... (SQLAlchemy func.now() handles onupdate?)
        # We set onupdate=func.now() in model, so verify if it triggers on relation update? usually needs touch.
        # chat.title = chat.title # simple touch? REMOVED to avoid MissingGreenlet on expired object 
        
        await db.commit()
        await db.refresh(ai_msg)
        
        return ai_msg

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{session_id}/files", response_model=Any)
async def upload_file(
    session_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    storage_service: MinIOService = Depends(deps.get_storage_service),
    rag_service: RagService = Depends(deps.get_rag_service),
) -> Any:
    """Upload a file to the chat and ingest it."""
    # 1. Get Chat
    result = await db.execute(
        select(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    user_id_str = str(current_user.id)

    # 2. Save to MinIO
    # We need to save to temp file first to be able to upload path or fileobj
    # MinIOService supports upload_fileobj, but RagService needs a Path to ingest.
    # So best to save to temp file, Upload to MinIO (for persistence), and Ingest (for RAG).

    try:
        suffix = Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = Path(tmp.name)
        
        # Upload to MinIO
        # Object name: chat_{id}/{filename}
        object_name = f"chat_{chat.id}/{file.filename}"
        storage_service.upload_file(tmp_path, object_name=object_name, content_type=file.content_type)
        
        # 3. Add to DB Document
        doc = Document(
            session_id=chat.id,
            filename=file.filename,
            file_path=object_name,
            status=DocumentStatus.PENDING
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        doc_id = doc.id
        
        # 4. Ingest RAG
        # We use tmp_path for ingestion
        try:
            # Metadata: document_id, session_id...
            metadata = {
                "document_id": str(doc_id), # Use DB ID or let RagService gen UUID? 
                # RagService gens UUID. We should map them. 
                # RagService returns DocumentInfo with document_id.
                # Maybe store Rag's UUID in DB? or just use DB ID in metadata.
                "db_document_id": doc_id,
                "session_id": session_id,
                "file_name": file.filename
            }
            summary = await rag_service.ingest_file(
                user_id=user_id_str,
                session_id=str(session_id),
                file_path=tmp_path,
                metadata=metadata
            )
            
            doc.status = DocumentStatus.INDEXED
            await db.commit()
            
            return {"message": "File uploaded and indexed successfully", "document_id": doc_id, "rag_info": summary}
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            # Avoid accessing doc attributes if expired
            # doc.status = DocumentStatus.FAILED
            # await db.commit()
            
            # Use update statement instead
            from sqlalchemy import update
            await db.execute(
                update(Document)
                .where(Document.id == doc_id)
                .values(status=DocumentStatus.FAILED)
            )
            await db.commit()
            
            raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
        finally:
            # Cleanup temp file
            if tmp_path.exists():
                os.remove(tmp_path)
                
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Also log to logger if available

@router.get("/{session_id}/documents", response_model=List[Any]) # Use Any or create specific schema in list
async def get_chat_documents(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    storage_service: MinIOService = Depends(deps.get_storage_service),
) -> Any:
    """Get all documents for a chat session with content."""
    # 1. Get Chat to verify access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.documents))
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    from app.schemas.document import DocumentWithContent
    from app.services.rag.converter import ConverterFactory
    
    docs_with_content = []
    
    # 2. Iterate docs and fetch content
    for doc in chat.documents:
        content = ""
        tmp_path = None
        try:
            # Create temp file
            suffix = Path(doc.filename).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp_path = Path(tmp.name)
            
            # Download from MinIO
            storage_service.download_file(doc.file_path, tmp_path)
            
            # Extract content
            # Use ConverterFactory to extract text
            converter = ConverterFactory.create("file")
            # We assume simple extraction for now
            extracted_docs = converter.convert(str(tmp_path))
            
            # Join content
            content = "\n\n".join([d.page_content for d in extracted_docs])
            
        except Exception as e:
            logger.error(f"Failed to load content for doc {doc.id}: {e}")
            content = "Error loading content."
        finally:
            if tmp_path and tmp_path.exists():
                os.remove(tmp_path)
        
        # Create response object
        # We manually construct dict or Pydantic model
        docs_with_content.append({
            "id": doc.id,
            "session_id": doc.session_id,
            "filename": doc.filename,
            "file_path": doc.file_path,
            "status": doc.status,
            "created_at": doc.created_at,
            "content": content
        })

    return docs_with_content

@router.delete("/{session_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_document(
    session_id: int,
    document_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    storage_service: MinIOService = Depends(deps.get_storage_service),
    rag_service: RagService = Depends(deps.get_rag_service),
):
    """Delete a document from a chat session."""
    # 1. Get Chat to verify access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # 2. Get Document
    result = await db.execute(
        select(Document)
        .filter(Document.id == document_id, Document.session_id == session_id)
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 3. Delete from MinIO
    try:
        storage_service.delete_file(doc.file_path)
    except Exception as e:
        logger.error(f"Failed to delete file from MinIO: {e}")

    # 4. Delete from Qdrant
    try:
        # We stored the SQL document ID as 'document_id' in metadata during upload
        await rag_service.delete_document(str(session_id), str(doc.id))
    except Exception as e:
        logger.error(f"Failed to delete embeddings: {e}")

    # 5. Delete from DB
    await db.delete(doc)
    await db.commit()

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    storage_service: MinIOService = Depends(deps.get_storage_service),
    rag_service: RagService = Depends(deps.get_rag_service),
) -> None:
    """Delete a chat session and all associated resources."""
    # 1. Get Chat
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.documents))
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # 2. Delete files from MinIO for all documents
    for doc in chat.documents:
        if doc.file_path:
            try:
                storage_service.delete_file(doc.file_path)
            except Exception as e:
                logger.error(f"Failed to delete file {doc.file_path} from MinIO: {e}")

    # 3. Delete Qdrant Collection
    try:
        await rag_service.delete_chat_collection(str(session_id))
    except Exception as e:
        logger.error(f"Failed to delete Qdrant collection for session {session_id}: {e}")

    # 4. Delete from DB
    await db.delete(chat)
    await db.commit()
    
@router.put("/{session_id}", response_model=chat_schema.ChatSession)
async def update_chat(
    session_id: int,
    chat_in: chat_schema.ChatSessionUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Update a chat session (e.g. rename title)."""
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    if chat_in.title is not None:
        chat.title = chat_in.title
        
    await db.commit()
    await db.refresh(chat)
    
    # We need to return messages as well for consistent schema, but usually list is empty on update unless loaded
    # Re-fetch with messages just in case or return without messages if schema allows
    # The response model ChatSession expects messages.
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id)
        .options(selectinload(ChatSession.messages))
    )
    chat = result.scalars().first()
    
    return chat
