"""
Socket.IO server manager.
Handles server instance, room management, and event emission.
"""

import socketio
from typing import Any

from .logging import log_room_join, log_room_leave, log_event_emit


class SocketManager:
    """
    Manages Socket.IO server instance and user rooms.
    """
    
    def __init__(self):
        # Socket.IO handles its own CORS - use specific origins
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins=[
                'http://localhost:3000',
                'http://localhost:8000',
            ],
            logger=False,
            engineio_logger=False,
        )
        # Since we mount at /socket.io, set socketio_path to empty
        self.app = socketio.ASGIApp(
            self.sio,
            socketio_path='',
        )
        # Track user_id -> set of session_ids
        self._user_sessions: dict[int, set[str]] = {}
    
    def get_user_room(self, user_id: int) -> str:
        """Get room name for a user."""
        return f'user_{user_id}'
    
    async def join_user_room(self, sid: str, user_id: int) -> None:
        """Add a socket to user's room."""
        room = self.get_user_room(user_id)
        await self.sio.enter_room(sid, room)
        
        # Track session
        if user_id not in self._user_sessions:
            self._user_sessions[user_id] = set()
        self._user_sessions[user_id].add(sid)
        
        log_room_join(sid, user_id, room)
    
    async def leave_user_room(self, sid: str, user_id: int) -> None:
        """Remove a socket from user's room."""
        room = self.get_user_room(user_id)
        await self.sio.leave_room(sid, room)
        
        # Remove session tracking
        if user_id in self._user_sessions:
            self._user_sessions[user_id].discard(sid)
            if not self._user_sessions[user_id]:
                del self._user_sessions[user_id]
        
        log_room_leave(sid, user_id, room)
    
    async def emit_to_user(
        self,
        user_id: int,
        event: str,
        data: Any = None,
    ) -> None:
        """Emit event to a specific user's room."""
        room = self.get_user_room(user_id)
        await self.sio.emit(event, data, room=room)
        log_event_emit(event, room, data)
    
    def get_active_user_ids(self) -> list[int]:
        """Get list of currently connected user IDs."""
        return list(self._user_sessions.keys())


# Global socket manager instance
socket_manager = SocketManager()
sio = socket_manager.sio

