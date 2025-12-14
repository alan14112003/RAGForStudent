"""
Quiz API endpoints for Q&A generation feature.
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
from app.models.quiz import Quiz, QuizQuestion, QuizStatus, QuizType, QuestionType
from app.schemas import quiz as quiz_schema
from app.services.quiz import QuizService
from app.services.storage import MinIOService
from app.services.rag.converter import ConverterFactory
from app.socket import emit_studio_items_updated
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

router = APIRouter()


async def _get_documents_content(
    document_ids: List[int],
    session_id: int,
    db: AsyncSession,
    storage_service: MinIOService
) -> str:
    """Helper to get combined content from multiple documents."""
    
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


async def _generate_quiz_background(
    quiz_id: int,
    session_id: int,
    user_id: int,
    document_ids: List[int],
    quiz_type: QuizType,
    num_questions: int,
    db_session_factory,
    storage_service: MinIOService,
    quiz_service: QuizService
):
    """Background task to generate quiz questions."""
    async with db_session_factory() as db:
        try:
            # Update status to generating
            result = await db.execute(select(Quiz).filter(Quiz.id == quiz_id))
            quiz = result.scalars().first()
            if not quiz:
                logger.error(f"Quiz {quiz_id} not found")
                return
            
            quiz.status = QuizStatus.GENERATING
            await db.commit()
            
            # Get document content
            content = await _get_documents_content(
                document_ids, session_id, db, storage_service
            )
            
            if not content:
                quiz.status = QuizStatus.FAILED
                await db.commit()
                return
            
            # Generate questions
            questions = await quiz_service.generate_questions(
                content=content,
                quiz_type=quiz_type,
                num_questions=num_questions
            )
            
            # Save questions to database
            for q in questions:
                question = QuizQuestion(
                    quiz_id=quiz_id,
                    question_text=q["question_text"],
                    question_type=q["question_type"],
                    options=q["options"],
                    correct_answers=q["correct_answers"],
                    explanation=q.get("explanation", ""),
                    order_index=q["order_index"]
                )
                db.add(question)
            
            # Update quiz status
            quiz.status = QuizStatus.COMPLETED
            quiz.num_questions = len(questions)
            await db.commit()
            
            logger.info(f"Quiz {quiz_id} generated with {len(questions)} questions")
            
            # Emit socket event to notify user
            await emit_studio_items_updated(user_id, session_id)
            
        except Exception as e:
            logger.error(f"Failed to generate quiz {quiz_id}: {e}")
            try:
                result = await db.execute(select(Quiz).filter(Quiz.id == quiz_id))
                quiz = result.scalars().first()
                if quiz:
                    quiz.status = QuizStatus.FAILED
                    await db.commit()
            except Exception:
                pass


@router.post("/{session_id}/quizzes", response_model=quiz_schema.QuizListItem)
async def generate_quiz(
    session_id: int,
    request: quiz_schema.QuizGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
    storage_service: MinIOService = Depends(deps.get_storage_service),
    quiz_service: QuizService = Depends(deps.get_quiz_service),
) -> Any:
    """Generate a new quiz from selected documents."""
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
        title = f"Quiz: {', '.join(doc_names)}"
        if len(docs) > 2:
            title += f" và {len(docs) - 2} tài liệu khác"
    
    # 4. Create quiz record
    quiz = Quiz(
        session_id=session_id,
        title=title,
        quiz_type=request.quiz_type,
        status=QuizStatus.PENDING,
        document_ids=request.document_ids,
        num_questions=request.num_questions
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    
    # 5. Start background generation
    background_tasks.add_task(
        _generate_quiz_background,
        quiz_id=quiz.id,
        session_id=session_id,
        user_id=user_id,
        document_ids=request.document_ids,
        quiz_type=request.quiz_type,
        num_questions=request.num_questions,
        db_session_factory=SessionLocal,
        storage_service=storage_service,
        quiz_service=quiz_service
    )
    
    return quiz


@router.get("/{session_id}/quizzes", response_model=quiz_schema.QuizListResponse)
async def list_quizzes(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
) -> Any:
    """List all quizzes for a chat session."""
    # Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get quizzes
    result = await db.execute(
        select(Quiz)
        .filter(Quiz.session_id == session_id)
        .order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()
    
    return quiz_schema.QuizListResponse(
        items=quizzes,
        total=len(quizzes)
    )


@router.get("/{session_id}/quizzes/{quiz_id}", response_model=quiz_schema.QuizResponse)
async def get_quiz(
    session_id: int,
    quiz_id: int,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
) -> Any:
    """Get a specific quiz with all questions."""
    # Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get quiz with questions
    result = await db.execute(
        select(Quiz)
        .filter(Quiz.id == quiz_id, Quiz.session_id == session_id)
        .options(selectinload(Quiz.questions))
    )
    quiz = result.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Sort questions by order_index
    quiz.questions = sorted(quiz.questions, key=lambda q: q.order_index)
    
    return quiz


@router.delete("/{session_id}/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    session_id: int,
    quiz_id: int,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Depends(deps.get_current_user_id),
):
    """Delete a quiz."""
    # Verify chat access
    result = await db.execute(
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get and delete quiz
    result = await db.execute(
        select(Quiz)
        .filter(Quiz.id == quiz_id, Quiz.session_id == session_id)
    )
    quiz = result.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    await db.delete(quiz)
    await db.commit()
    
    # Emit socket event to notify user
    await emit_studio_items_updated(user_id, session_id)
