// WebSocket event types

export interface AgentPresenceEvent {
  address: string;
  timestamp: string;
}

export interface CodeCursorEvent {
  codeId: string;
  agent: string;
  position: {
    line: number;
    ch: number;
  };
}

export interface CodeSelectionEvent {
  codeId: string;
  agent: string;
  selection: {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
  };
}

export interface CodeCommentEvent {
  codeId: string;
  agent: string;
  line: number;
  comment: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  room: string;
  from: string;
  content: string;
  type: string;
  timestamp: string;
}

export interface DirectMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
}

export interface TypingEvent {
  room?: string;
  from?: string;
  agent?: string;
  isTyping: boolean;
}

export interface UserJoinedEvent {
  room: string;
  agent: string;
  timestamp: string;
}

export interface UserLeftEvent {
  room: string;
  agent: string;
  timestamp: string;
}

// WebSocket message type enum
export enum MessageType {
  // Agent events
  AGENT_ONLINE = 'agent:online',
  AGENT_OFFLINE = 'agent:offline',
  AGENT_HEARTBEAT = 'agent:heartbeat',
  AGENT_TYPING = 'agent:typing',

  // Code events
  CODE_JOIN = 'code:join',
  CODE_LEAVE = 'code:leave',
  CODE_CURSOR = 'code:cursor',
  CODE_SELECTION = 'code:selection',
  CODE_COMMENT = 'code:comment',
  CODE_USER_JOINED = 'code:user_joined',
  CODE_USER_LEFT = 'code:user_left',

  // Chat events
  CHAT_JOIN_GLOBAL = 'chat:join_global',
  CHAT_JOIN_PROJECT = 'chat:join_project',
  CHAT_LEAVE = 'chat:leave',
  CHAT_MESSAGE = 'chat:message',
  CHAT_DM = 'chat:dm',
  CHAT_HISTORY = 'chat:history',
  CHAT_TYPING = 'chat:typing',
  CHAT_USER_JOINED = 'chat:user_joined',
  CHAT_USER_LEFT = 'chat:user_left',
}