export interface WebSocketMessage<T = unknown> {
  id: string;
  type: MessageType;
  payload: T;
  timestamp: string;
  sender?: string;
}

export type MessageType = 
  | 'agent.status'
  | 'agent.execution'
  | 'agent.output'
  | 'chat.message'
  | 'chat.typing'
  | 'code.update'
  | 'issue.update'
  | 'project.update'
  | 'notification'
  | 'error'
  | 'ping'
  | 'pong'
  | 'auth'
  | 'subscribe'
  | 'unsubscribe';

export interface WebSocketConfig {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  authToken?: string;
}

export interface WebSocketState {
  isConnected: boolean;
  isAuthenticated: boolean;
  lastPingAt?: string;
  subscriptions: string[];
}

export interface SubscribeMessage {
  channel: string;
  filters?: Record<string, unknown>;
}

export interface AuthMessage {
  token: string;
  userId: string;
}

export interface ChatMessagePayload {
  roomId: string;
  content: string;
  messageType?: 'text' | 'code' | 'image' | 'file';
  attachments?: Attachment[];
  replyTo?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

export interface NotificationPayload {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: Record<string, unknown>;
}
