import { useEffect, useRef, useCallback, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import type { WebSocketEvent, WebSocketMessage, WebSocketEventType } from '../types';

interface UseWebSocketOptions {
  url?: string;
  onEvent?: (event: WebSocketEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  reconnectDecay?: number;
  maxReconnectInterval?: number;
  maxRetries?: number;
  debug?: boolean;
}

interface UseWebSocketReturn {
  socket: ReconnectingWebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  send: (message: WebSocketMessage) => boolean;
  sendEvent: (event: Omit<WebSocketEvent, 'timestamp'>) => boolean;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  lastPing: number | null;
  latency: number;
}

const DEFAULT_URL = process.env.VITE_WEBSOCKET_URL || 'wss://api.agentcodehub.io/ws';

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = DEFAULT_URL,
    onEvent,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 1000,
    reconnectDecay = 1.5,
    maxReconnectInterval = 30000,
    maxRetries = 10,
    debug = false,
  } = options;

  const socketRef = useRef<ReconnectingWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [latency, setLatency] = useState(0);
  
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pongTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const debugRef = useRef(debug);
  debugRef.current = debug;

  const log = useCallback((...args: any[]) => {
    if (debugRef.current) {
      console.log('[WebSocket]', ...args);
    }
  }, []);

  // Ping/Pong handling
  const sendPing = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const pingMessage: WebSocketMessage = {
        type: 'ping',
        timestamp: Date.now(),
      };
      socketRef.current.send(JSON.stringify(pingMessage));
      setLastPing(Date.now());
      
      // Set timeout for pong response
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
      }
      
      pongTimeoutRef.current = setTimeout(() => {
        log('Pong timeout - connection may be stale');
        socketRef.current?.reconnect();
      }, 10000);
    }
  }, [log]);

  const handlePong = useCallback((timestamp: number) => {
    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
    
    const now = Date.now();
    const newLatency = now - timestamp;
    setLatency(newLatency);
    log('Latency:', newLatency, 'ms');
  }, [log]);

  // Message handler
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      log('Received:', data.type);

      switch (data.type) {
        case 'pong':
          handlePong(data.timestamp);
          break;
          
        case 'event':
          if (data.event) {
            onEvent?.(data.event);
          }
          break;
          
        default:
          log('Unknown message type:', data.type);
      }
    } catch (err) {
      log('Failed to parse message:', err);
    }
  }, [onEvent, handlePong, log]);

  // Connect
  const connect = useCallback(() => {
    if (socketRef.current) {
      log('Already connected or connecting');
      return;
    }

    log('Connecting to:', url);
    setIsConnecting(true);

    const ws = new ReconnectingWebSocket(url, [], {
      connectionTimeout: 10000,
      maxRetries,
      reconnectionDelayGrowFactor: reconnectDecay,
      minReconnectionDelay: reconnectInterval,
      maxReconnectionDelay: maxReconnectInterval,
    });

    ws.onopen = () => {
      log('Connected');
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0;
      onConnect?.();
      
      // Start ping interval
      pingIntervalRef.current = setInterval(sendPing, 30000);
    };

    ws.onclose = () => {
      log('Disconnected');
      setIsConnected(false);
      setIsConnecting(false);
      
      // Clear intervals
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }
      
      onDisconnect?.();
    };

    ws.onerror = (error) => {
      log('Error:', error);
      onError?.(error);
    };

    ws.onmessage = handleMessage;

    socketRef.current = ws;
  }, [url, maxRetries, reconnectDecay, reconnectInterval, maxReconnectInterval, onConnect, onDisconnect, onError, handleMessage, sendPing, log]);

  // Disconnect
  const disconnect = useCallback(() => {
    log('Disconnecting');
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, [log]);

  // Send message
  const send = useCallback((message: WebSocketMessage): boolean => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      log('Cannot send - not connected');
      return false;
    }

    try {
      socketRef.current.send(JSON.stringify(message));
      log('Sent:', message.type);
      return true;
    } catch (err) {
      log('Failed to send:', err);
      return false;
    }
  }, [log]);

  // Send event
  const sendEvent = useCallback((event: Omit<WebSocketEvent, 'timestamp'>): boolean => {
    const message: WebSocketMessage = {
      type: 'event',
      event: {
        ...event,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };
    return send(message);
  }, [send]);

  // Subscribe to channel
  const subscribe = useCallback((channel: string) => {
    const message: WebSocketMessage = {
      type: 'subscribe',
      channel,
      timestamp: Date.now(),
    };
    send(message);
  }, [send]);

  // Unsubscribe from channel
  const unsubscribe = useCallback((channel: string) => {
    const message: WebSocketMessage = {
      type: 'unsubscribe',
      channel,
      timestamp: Date.now(),
    };
    send(message);
  }, [send]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && !isConnecting) {
        log('Page visible, reconnecting...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, isConnected, isConnecting, log]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    send,
    sendEvent,
    subscribe,
    unsubscribe,
    lastPing,
    latency,
  };
}

// ============================================================================
// Specialized hooks for common use cases
// ============================================================================

export function useChannel(channelId: string, onEvent?: (event: WebSocketEvent) => void) {
  const ws = useWebSocket({
    onEvent,
  });

  useEffect(() => {
    if (ws.isConnected) {
      ws.subscribe(channelId);
    }
    
    return () => {
      if (ws.isConnected) {
        ws.unsubscribe(channelId);
      }
    };
  }, [ws, channelId]);

  return ws;
}

export function usePresence(agentId: string) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  
  const ws = useWebSocket({
    onEvent: (event) => {
      if (event.type === 'presence_update' && event.sender === agentId) {
        setIsOnline(event.payload.status === 'online');
        setLastSeen(event.payload.lastSeen);
      }
    },
  });

  return {
    ...ws,
    isOnline,
    lastSeen,
  };
}

export function useTyping(channelId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const ws = useWebSocket({
    onEvent: (event) => {
      if (event.type === 'typing_started' && event.payload.channelId === channelId) {
        setTypingUsers(prev => new Set(prev).add(event.sender));
        
        // Clear existing timeout
        const existingTimeout = typingTimeoutRef.current.get(event.sender);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // Set new timeout
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(event.sender);
            return next;
          });
          typingTimeoutRef.current.delete(event.sender);
        }, 3000);
        
        typingTimeoutRef.current.set(event.sender, timeout);
      }
      
      if (event.type === 'typing_stopped' && event.payload.channelId === channelId) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(event.sender);
          return next;
        });
        
        const existingTimeout = typingTimeoutRef.current.get(event.sender);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          typingTimeoutRef.current.delete(event.sender);
        }
      }
    },
  });

  const sendTyping = useCallback((isTyping: boolean) => {
    ws.sendEvent({
      type: isTyping ? 'typing_started' : 'typing_stopped',
      payload: { channelId },
      sender: '', // Will be set by server
    });
  }, [ws, channelId]);

  useEffect(() => {
    return () => {
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    sendTyping,
    isTyping: typingUsers.size > 0,
  };
}

export default useWebSocket;