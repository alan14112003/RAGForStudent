/**
 * Socket.IO client configuration.
 * Provides singleton socket instance with auto-reconnection.
 */

import { io, Socket } from 'socket.io-client';
import { SocketEventPayloads } from '@/types/socket.types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

type TypedSocket = Socket<SocketEventPayloads, Record<string, never>>;

let socket: TypedSocket | null = null;

/**
 * Get or create the socket instance.
 * Does not connect automatically - use connectSocket() to connect.
 */
export function getSocket(): TypedSocket | null {
  return socket;
}

/**
 * Initialize and connect the socket with authentication.
 */
export function connectSocket(token: string): TypedSocket {
  if (socket?.connected) {
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    path: '/socket.io/',
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: {
      token,
    },
    transports: ["websocket"],
  }) as TypedSocket;

  return socket;
}

/**
 * Disconnect the socket.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected.
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
