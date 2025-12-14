"""
Socket event emitters for studio items.
Provides helper functions to emit events to users.
"""

import asyncio
from typing import Optional
from .manager import socket_manager


async def emit_studio_items_updated(user_id: int, session_id: int) -> None:
    """
    Emit studio:items:updated event to a user.
    
    Args:
        user_id: ID of the user to notify
        session_id: ID of the chat session that was updated
    """
    await socket_manager.emit_to_user(
        user_id=user_id,
        event='studio:items:updated',
        data={'sessionId': session_id},
    )


def emit_studio_items_updated_sync(user_id: int, session_id: int) -> None:
    """
    Synchronous wrapper for emit_studio_items_updated.
    Used in background tasks that need to emit events.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(emit_studio_items_updated(user_id, session_id))
        else:
            loop.run_until_complete(emit_studio_items_updated(user_id, session_id))
    except RuntimeError:
        # No event loop available, create one
        asyncio.run(emit_studio_items_updated(user_id, session_id))
