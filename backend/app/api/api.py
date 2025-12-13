from fastapi import APIRouter
from app.api.endpoints import auth, users, chats, quizzes, flashcards, studio

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(chats.router, prefix="/chats", tags=["chats"])
api_router.include_router(quizzes.router, prefix="/chats", tags=["quizzes"])
api_router.include_router(flashcards.router, prefix="/chats", tags=["flashcards"])
api_router.include_router(studio.router, prefix="/chats", tags=["studio"])

