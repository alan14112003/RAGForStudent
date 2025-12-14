"""
Socket logging configuration.
Provides dedicated file logging for socket-related events.
"""

import logging
import os
from datetime import datetime
from pathlib import Path


def setup_socket_logger() -> logging.Logger:
    """
    Configure and return a logger for socket events.
    Logs to both console and file.
    """
    logger = logging.getLogger('socket')
    logger.setLevel(logging.DEBUG)
    
    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger
    
    # Create logs directory if it doesn't exist
    log_dir = Path(__file__).parent.parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # File handler - socket.log
    file_handler = logging.FileHandler(
        log_dir / 'socket.log',
        encoding='utf-8',
    )
    file_handler.setLevel(logging.DEBUG)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Formatter - clear and readable
    formatter = logging.Formatter(
        '\n'
        '╔══════════════════════════════════════════════════════════════\n'
        '║ %(asctime)s | %(levelname)-8s\n'
        '╟──────────────────────────────────────────────────────────────\n'
        '║ %(message)s\n'
        '╚══════════════════════════════════════════════════════════════',
        datefmt='%Y-%m-%d %H:%M:%S',
    )
    
    simple_formatter = logging.Formatter(
        '[SOCKET] %(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%H:%M:%S',
    )
    
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(simple_formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


# Global socket logger instance
socket_logger = setup_socket_logger()


def log_connection(sid: str, user_id: int) -> None:
    """Log a new socket connection."""
    socket_logger.info(
        f'CONNECTION ESTABLISHED\n'
        f'║   Session ID: {sid}\n'
        f'║   User ID:    {user_id}\n'
        f'║   Time:       {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
    )


def log_disconnection(sid: str, user_id: int = None) -> None:
    """Log a socket disconnection."""
    user_info = f'User ID: {user_id}' if user_id else 'Unknown user'
    socket_logger.info(
        f'CONNECTION CLOSED\n'
        f'║   Session ID: {sid}\n'
        f'║   {user_info}\n'
        f'║   Time:       {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
    )


def log_room_join(sid: str, user_id: int, room: str) -> None:
    """Log a user joining a room."""
    socket_logger.info(
        f'ROOM JOIN\n'
        f'║   Session ID: {sid}\n'
        f'║   User ID:    {user_id}\n'
        f'║   Room:       {room}'
    )


def log_room_leave(sid: str, user_id: int, room: str) -> None:
    """Log a user leaving a room."""
    socket_logger.info(
        f'ROOM LEAVE\n'
        f'║   Session ID: {sid}\n'
        f'║   User ID:    {user_id}\n'
        f'║   Room:       {room}'
    )


def log_event_emit(event: str, room: str, data: dict = None) -> None:
    """Log an event being emitted."""
    data_str = str(data) if data else 'None'
    socket_logger.debug(
        f'EVENT EMITTED\n'
        f'║   Event:      {event}\n'
        f'║   Room:       {room}\n'
        f'║   Data:       {data_str}'
    )


def log_auth_failure(sid: str, reason: str) -> None:
    """Log an authentication failure."""
    socket_logger.warning(
        f'AUTH FAILED\n'
        f'║   Session ID: {sid}\n'
        f'║   Reason:     {reason}'
    )


def log_error(sid: str, error: str) -> None:
    """Log a socket error."""
    socket_logger.error(
        f'ERROR\n'
        f'║   Session ID: {sid}\n'
        f'║   Error:      {error}'
    )
