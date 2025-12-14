"""
Socket.IO event handlers.
Handles connection, disconnection, and custom events.
"""

from .manager import sio, socket_manager
from .auth import verify_socket_token
from .logging import (
    log_connection,
    log_disconnection,
    log_auth_failure,
)


@sio.event
async def connect(sid: str, environ: dict, auth: dict = None):
    """
    Handle new socket connection.
    Validates token and joins user to their room.
    """
    token = None
    
    # Get token from auth object
    if auth and isinstance(auth, dict):
        token = auth.get('token')
    
    if not token:
        log_auth_failure(sid, 'No token provided')
        return False
    
    user_id = verify_socket_token(token)
    if not user_id:
        log_auth_failure(sid, 'Invalid token')
        return False
    
    # Store user_id in session for later use
    await sio.save_session(sid, {'user_id': user_id})
    
    # Join user's room
    await socket_manager.join_user_room(sid, user_id)
    
    log_connection(sid, user_id)
    return True


@sio.event
async def disconnect(sid: str):
    """
    Handle socket disconnection.
    Removes socket from user's room.
    """
    session = await sio.get_session(sid)
    user_id = session.get('user_id') if session else None
    
    if user_id:
        await socket_manager.leave_user_room(sid, user_id)
    
    log_disconnection(sid, user_id)

