"""
Flashcard API endpoints for flashcard generation feature.
"""

import tempfile
import os
from pathlib import Path
import logging
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.chat import ChatSession
from app.models.document import Document
from app.models.flashcard import FlashcardSet, Flashcard, FlashcardStatus
from app.schemas import flashcard as flashcard_schema
from app.services.flashcard import FlashcardService
from app.services.storage import MinIOService

logger = logging.getLogger(__name__)

router = APIRouter()


async def _get_documents_content(
    document_ids: List[int],
    session_id: int,
    db: AsyncSession,
    storage_service: MinIOService
) -> str:
    """Helper to get combined content from multiple documents."""
    from app.services.rag.converter import ConverterFactory
    
    # Get documents
    result = await db.execute(
        select(Document).filter(
            Document.id.in_(document_ids),
            Document.session_id == session_id
        )
    )
    docs = result.scalars().all()
    
    if not docs:
        raise HTTPException(status_code=404, detail="No documents found")
    
    all_content = []
    
    for doc in docs:
        tmp_path = None
        try:
            suffix = Path(doc.filename).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp_path = Path(tmp.name)
            
            storage_service.download_file(doc.file_path, tmp_path)
            
            converter = ConverterFactory.create("file")
            extracted_docs = converter.convert(str(tmp_path))
            content = "\n\n".join([d.page_content for d in extracted_docs])
            
            all_content.append(f"=== {doc.filename} ===\n{content}")
            
        except Exception as e:
            logger.error(f"Failed to load content for doc {doc.id}: {e}")
        finally:
            if tmp_path and tmp_path.exists():
                os.remove(tmp_path)
    
    return "\n\n".join(all_content)


async def _generate_flashcards_background(
    flashcard_set_id: int,
    session_id: int,
    user_id: int,
    document_ids: List[int],
    num_cards: int,
    db_session_factory,
    storage_service: MinIOService,
    flashcard_service: FlashcardService
):
    """Background task to generate flashcards."""
    async with db_session_factory() as db:
        try:
            # Update status to generating
            result = await db.execute(select(FlashcardSet).filter(FlashcardSet.id == flashcard_set_id))
            flashcard_set = result.scalars().first()
            if not flashcard_set:
                logger.error(f"FlashcardSet {flashcard_set_id} not found")
                return
            
            flashcard_set.status = FlashcardStatus.GENERATING
            await db.commit()
            
            # Get document content
            content = await _get_documents_content(
                document_ids, session_id, db, storage_service
            )
            
            if not content:
                flashcard_set.status = FlashcardStatus.FAILED
                await db.commit()
                return
            
            # Generate flashcards
            cards = await flashcard_service.generate_flashcards(
                content=content,
                num_cards=num_cards
            )
            
            # Save cards to database
            for card in cards:
                flashcard = Flashcard(
                    flashcard_set_id=flashcard_set_id,
                    front_text=card["front_text"],
                    back_text=card["back_text"],
                    order_index=card["order_index"]
                )
                db.add(flashcard)
            
            # Update flashcard set status
            flashcard_set.status = FlashcardStatus.COMPLETED
            flashcard_set.num_cards = len(cards)
            await db.commit()
            
            logger.info(f"FlashcardSet {flashcard_set_id} generated with {len(cards)} cards")
            
            # Emit socket event to notify user
            from app.socket import emit_studio_items_updated
            await emit_studio_items_updated(user_id, session_id)
            
        except Exception as e:
            logger.error(f"Failed to generate flashcard set {flashcard_set_id}: {e}")
            try:
                result = await db.execute(select(FlashcardSet).filter(FlashcardSet.id == flashcard_set_id))
                flashcard_set = result.scalars().first()
                if flashcard_set:
                    flashcard_set.status = FlashcardStatus.FAILED
                    await db.commit()
            except Exception:
                pass


@router.post("/{session_id}/flashcards", response_model=flashcard_schema.FlashcardSetListItem)
async def generate_flashcards(
    session_id: int,
    request: flashcard_schema.FlashcardGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
    storage_service: MinIOService = Depends(deps.get_storage_service),
    flashcard_service: FlashcardService = Depends(deps.get_flashcard_service),
) -> Any:
    """Generate a new flashcard set from selected documents."""
    # 1. Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # 2. Verify documents exist
    result = await db.execute(
        select(Document).filter(
            Document.id.in_(request.document_ids),
            Document.session_id == session_id
        )
    )
    docs = result.scalars().all()
    if len(docs) != len(request.document_ids):
        raise HTTPException(status_code=400, detail="One or more documents not found")
    
    # 3. Generate title if not provided
    title = request.title
    if not title:
        doc_names = [d.filename for d in docs[:2]]
        title = f"Flashcard: {', '.join(doc_names)}"
        if len(docs) > 2:
            title += f" và {len(docs) - 2} tài liệu khác"
    
    # 4. Create flashcard set record
    flashcard_set = FlashcardSet(
        session_id=session_id,
        title=title,
        status=FlashcardStatus.PENDING,
        document_ids=request.document_ids,
        num_cards=request.num_cards
    )
    db.add(flashcard_set)
    await db.commit()
    await db.refresh(flashcard_set)
    
    # 5. Start background generation
    from app.core.database import SessionLocal
    background_tasks.add_task(
        _generate_flashcards_background,
        flashcard_set_id=flashcard_set.id,
        session_id=session_id,
        user_id=user_id,
        document_ids=request.document_ids,
        num_cards=request.num_cards,
        db_session_factory=SessionLocal,
        storage_service=storage_service,
        flashcard_service=flashcard_service
    )
    
    return flashcard_set


@router.get("/{session_id}/flashcards", response_model=flashcard_schema.FlashcardSetListResponse)
async def list_flashcard_sets(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
) -> Any:
    """List all flashcard sets for a chat session."""
    # Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get flashcard sets
    result = await db.execute(
        select(FlashcardSet)
        .filter(FlashcardSet.session_id == session_id)
        .order_by(FlashcardSet.created_at.desc())
    )
    flashcard_sets = result.scalars().all()
    
    return flashcard_schema.FlashcardSetListResponse(
        items=flashcard_sets,
        total=len(flashcard_sets)
    )


@router.get("/{session_id}/flashcards/{set_id}", response_model=flashcard_schema.FlashcardSetResponse)
async def get_flashcard_set(
    session_id: int,
    set_id: int,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
) -> Any:
    """Get a specific flashcard set with all cards."""
    # Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get flashcard set with cards
    result = await db.execute(
        select(FlashcardSet)
        .filter(FlashcardSet.id == set_id, FlashcardSet.session_id == session_id)
        .options(selectinload(FlashcardSet.cards))
    )
    flashcard_set = result.scalars().first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    # Sort cards by order_index
    flashcard_set.cards = sorted(flashcard_set.cards, key=lambda c: c.order_index)
    
    return flashcard_set


@router.delete("/{session_id}/flashcards/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard_set(
    session_id: int,
    set_id: int,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
):
    """Delete a flashcard set."""
    # Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get and delete flashcard set
    result = await db.execute(
        select(FlashcardSet)
        .filter(FlashcardSet.id == set_id, FlashcardSet.session_id == session_id)
    )
    flashcard_set = result.scalars().first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    await db.delete(flashcard_set)
    await db.commit()
    
    # Emit socket event to notify user
    from app.socket import emit_studio_items_updated
    await emit_studio_items_updated(user_id, session_id)
