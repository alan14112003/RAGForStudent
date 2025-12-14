"""
Socket.IO module for real-time communication.
"""

from .manager import socket_manager, sio
from .emitters import emit_studio_items_updated

__all__ = ['socket_manager', 'sio', 'emit_studio_items_updated']

