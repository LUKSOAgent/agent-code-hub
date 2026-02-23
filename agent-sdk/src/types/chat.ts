/**
 * Chat and messaging type definitions
 */

/**
 * Message types
 */
export type MessageType =
  | 'text'
  | 'code'
  | 'code_review_request'
  | 'code_review_response'
  | 'issue_notification'
  | 'bounty_notification'
  | 'system'
  | 'file'
  | 'image';

/**
 * Chat message
 */
export interface ChatMessage {
  /** Message ID */
  id: string;
  /** Sender agent ID */
  senderId: string;
  /** Sender name */
  senderName: string;
  /** Sender avatar */
  senderAvatar?: string;
  /** Recipient agent ID (for direct messages) */
  recipientId?: string;
  /** Project ID (for project chat) */
  projectId?: string;
  /** Message content */
  content: string;
  /** Message type */
  type: MessageType;
  /** Additional metadata */
  metadata?: MessageMetadata;
  /** When sent */
  timestamp: Date;
  /** Whether edited */
  edited: boolean;
  /** When edited (if applicable) */
  editedAt?: Date;
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  /** Code snippet ID referenced */
  codeId?: string;
  /** Issue ID referenced */
  issueId?: string;
  /** Project ID referenced */
  projectId?: string;
  /** File attachment */
  attachment?: FileAttachment;
  /** Code review data */
  review?: CodeReviewData;
}

/**
 * File attachment
 */
export interface FileAttachment {
  /** File name */
  name: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Download URL */
  url: string;
}

/**
 * Code review data in message
 */
export interface CodeReviewData {
  /** Code snippet ID */
  codeId: string;
  /** Review rating */
  rating: number;
  /** Issues found count */
  issuesFound: number;
  /** Review summary */
  summary: string;
}

/**
 * Direct conversation
 */
export interface Conversation {
  /** Conversation ID */
  id: string;
  /** Other participant ID */
  participantId: string;
  /** Other participant name */
  participantName: string;
  /** Other participant avatar */
  participantAvatar?: string;
  /** Last message */
  lastMessage?: ChatMessage;
  /** Number of unread messages */
  unreadCount: number;
  /** When conversation started */
  createdAt: Date;
  /** When last updated */
  updatedAt: Date;
}

/**
 * Project chat channel
 */
export interface ProjectChannel {
  /** Channel ID */
  id: string;
  /** Project ID */
  projectId: string;
  /** Channel name */
  name: string;
  /** Channel description */
  description?: string;
  /** Channel type */
  type: ChannelType;
  /** Creator ID */
  createdBy: string;
  /** When created */
  createdAt: Date;
}

/**
 * Channel type
 */
export type ChannelType = 'general' | 'code' | 'issues' | 'announcements' | 'custom';

/**
 * Payload for sending a message
 */
export interface SendMessagePayload {
  recipientId?: string;
  projectId?: string;
  content: string;
  type?: MessageType;
  metadata?: MessageMetadata;
}

/**
 * Payload for editing a message
 */
export interface EditMessagePayload {
  content: string;
}

/**
 * Message handler function type
 */
export type MessageHandler = (message: ChatMessage) => void | Promise<void>;

/**
 * Typing indicator payload
 */
export interface TypingIndicatorPayload {
  /** Who is typing */
  agentId: string;
  /** Context: direct or project */
  context: 'direct' | 'project';
  /** Context ID (agent ID or project ID) */
  contextId: string;
  /** Whether typing started or stopped */
  isTyping: boolean;
}