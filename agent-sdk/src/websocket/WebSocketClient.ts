import type { WebSocketConfig, WebSocketState, WebSocketMessage, MessageType } from '../types/websocket';
import EventEmitter from 'eventemitter3';

let WebSocketImpl: typeof WebSocket;

if (typeof window !== 'undefined') {
  WebSocketImpl = WebSocket;
} else {
  const ws = require('isomorphic-ws');
  WebSocketImpl = ws as typeof WebSocket;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketState;
  private reconnectAttempts = 0;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private messageQueue: WebSocketMessage[] = [];

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
    this.state = {
      isConnected: false,
      isAuthenticated: false,
      subscriptions: [],
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocketImpl(this.config.url);

        this.ws.onopen = () => {
          this.state.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          this.startHeartbeat();
          this.processMessageQueue();

          if (this.config.authToken) {
            this.authenticate();
          }

          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error: Event) => {
          this.emit('error', error);
          if (!this.state.isConnected) {
            reject(error);
          }
        };

        this.ws.onclose = () => {
          this.handleClose();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.config.reconnect = false;
    this.ws?.close();
  }

  send<T>(message: Omit<WebSocketMessage<T>, 'id' | 'timestamp'>): void {
    const fullMessage: WebSocketMessage<T> = {
      ...message,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    if (this.state.isConnected && this.ws?.readyState === WebSocketImpl.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      this.messageQueue.push(fullMessage);
    }
  }

  subscribe(channel: string, filters?: Record<string, unknown>): void {
    this.send({
      type: 'subscribe',
      payload: { channel, filters },
    });

    if (!this.state.subscriptions.includes(channel)) {
      this.state.subscriptions.push(channel);
    }
  }

  unsubscribe(channel: string): void {
    this.send({
      type: 'unsubscribe',
      payload: { channel },
    });

    this.state.subscriptions = this.state.subscriptions.filter((c) => c !== channel);
  }

  authenticate(): void {
    if (!this.config.authToken) {
      throw new Error('No auth token provided');
    }

    this.send({
      type: 'auth',
      payload: { token: this.config.authToken },
    });
  }

  ping(): void {
    this.send({
      type: 'ping',
      payload: {},
    });
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getState(): WebSocketState {
    return { ...this.state };
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      if (message.type === 'pong') {
        this.state.lastPingAt = new Date().toISOString();
      } else if (message.type === 'auth') {
        this.state.isAuthenticated = true;
        this.emit('authenticated', message.payload);
      } else if (message.type === 'error') {
        this.emit('error', message.payload);
      }

      this.emit('message', message);
      this.emit(message.type, message.payload);
    } catch (error) {
      this.emit('error', error);
    }
  }

  private handleClose(): void {
    this.state.isConnected = false;
    this.state.isAuthenticated = false;
    this.emit('disconnected');

    if (this.config.reconnect && this.reconnectAttempts < (this.config.maxReconnectAttempts || 10)) {
      this.reconnectAttempts++;
      this.emit('reconnecting', this.reconnectAttempts);

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.config.reconnectInterval);
    }
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval) {
      this.heartbeatTimer = setInterval(() => {
        this.ping();
      }, this.config.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws?.send(JSON.stringify(message));
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
