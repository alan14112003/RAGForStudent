/**
 * Socket event types for real-time communication.
 */

export interface StudioItemsUpdatedPayload {
  sessionId: number;
}

export type SocketEventPayloads = {
  'studio:items:updated': StudioItemsUpdatedPayload;
};

export type SocketEventName = keyof SocketEventPayloads;

export type SocketConnectionStatus = 'connecting' | 'connected' | 'disconnected';
