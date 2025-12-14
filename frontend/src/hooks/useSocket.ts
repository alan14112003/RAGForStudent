/**
 * Custom hook for socket operations.
 * Provides socket lifecycle management and event subscription.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setConnectionStatus,
  setConnectionError,
} from '@/store/features/socketSlice';
import {
  getSocket,
  connectSocket,
  disconnectSocket,
} from '@/lib/socket';
import { SocketEventPayloads, SocketEventName } from '@/types/socket.types';

/**
 * Hook to manage socket connection lifecycle.
 * Connects when token is available, disconnects on logout.
 */
export function useSocketConnection() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const status = useAppSelector((state) => state.socket.status);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      dispatch(setConnectionStatus('disconnected'));
      return;
    }

    dispatch(setConnectionStatus('connecting'));
    const socket = connectSocket(token);

    socket.on('connect', () => {
      dispatch(setConnectionStatus('connected'));
    });

    socket.on('disconnect', () => {
      dispatch(setConnectionStatus('disconnected'));
    });

    socket.on('connect_error', (error) => {
      dispatch(setConnectionError(error.message));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [token, dispatch]);

  return { status };
}

/**
 * Hook to subscribe to a specific socket event.
 * Automatically unsubscribes on unmount or when dependencies change.
 */
export function useSocketEvent<T extends SocketEventName>(
  eventName: T,
  handler: (data: SocketEventPayloads[T]) => void,
  deps: React.DependencyList = [],
) {
  const handlerRef = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      return;
    }

    const eventHandler = (data: SocketEventPayloads[T]) => {
      handlerRef.current(data);
    };

    socket.on(eventName, eventHandler as any);

    return () => {
      socket.off(eventName, eventHandler as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, ...deps]);
}

/**
 * Get current socket connection status.
 */
export function useSocketStatus() {
  return useAppSelector((state) => state.socket.status);
}
