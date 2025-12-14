
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.applications import Starlette
from starlette.routing import Mount
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.api import api_router
from app.socket import socket_manager
# Import socket events to register handlers at startup
from app.socket import events  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("[STARTUP] Socket event handlers registered")
    
    yield
    # Shutdown: Close DB connection
    await engine.dispose()


# CORS origins for REST API
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

# Add origins from settings if available
if settings.BACKEND_CORS_ORIGINS:
    for origin in settings.BACKEND_CORS_ORIGINS:
        origins.append(str(origin).rstrip("/"))


# Create sub-app for REST API with CORS
rest_app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_STR}/openapi.json",
    lifespan=lifespan,
)

rest_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rest_app.include_router(api_router, prefix=settings.API_STR)


@rest_app.get("/")
def root():
    return {"message": "Welcome to RAG Student Assistant API"}


# Main app that routes to either REST or Socket.IO
app = Starlette(
    routes=[
        Mount("/socket.io", app=socket_manager.app),
        Mount("/", app=rest_app),
    ],
)
