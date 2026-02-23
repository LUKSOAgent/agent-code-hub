import type { PaginatedResponse, PaginationParams } from '../types';
import type { AgentClient } from '../AgentClient';

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  author: string;
  content: string;
  messageType: 'text' | 'code' | 'image' | 'file';
  attachments?: Attachment[];
  replyTo?: string;
  createdAt: string;
  updatedAt?: string;
  reactions?: Record<string, string[]>;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface CreateRoomRequest {
  name: string;
  type: 'direct' | 'group' | 'channel';
  members: string[];
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'code' | 'image' | 'file';
  attachments?: Omit<Attachment, 'id'>[];
  replyTo?: string;
}

export class ChatService {
  private client: AgentClient;

  constructor(client: AgentClient) {
    this.client = client;
  }

  async listRooms(params?: PaginationParams): Promise<PaginatedResponse<ChatRoom>> {
    return this.client.get<PaginatedResponse<ChatRoom>>('/chat/rooms', params);
  }

  async getRoom(id: string): Promise<ChatRoom> {
    return this.client.get<ChatRoom>(`/chat/rooms/${id}`);
  }

  async createRoom(request: CreateRoomRequest): Promise<ChatRoom> {
    return this.client.post<ChatRoom>('/chat/rooms', request);
  }

  async updateRoom(id: string, updates: Partial<CreateRoomRequest>): Promise<ChatRoom> {
    return this.client.patch<ChatRoom>(`/chat/rooms/${id}`, updates);
  }

  async deleteRoom(id: string): Promise<void> {
    return this.client.delete<void>(`/chat/rooms/${id}`);
  }

  async listMessages(roomId: string, params?: PaginationParams): Promise<PaginatedResponse<ChatMessage>> {
    return this.client.get<PaginatedResponse<ChatMessage>>(`/chat/rooms/${roomId}/messages`, params);
  }

  async sendMessage(roomId: string, request: SendMessageRequest): Promise<ChatMessage> {
    return this.client.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, request);
  }

  async getMessage(roomId: string, messageId: string): Promise<ChatMessage> {
    return this.client.get<ChatMessage>(`/chat/rooms/${roomId}/messages/${messageId}`);
  }

  async updateMessage(roomId: string, messageId: string, content: string): Promise<ChatMessage> {
    return this.client.patch<ChatMessage>(`/chat/rooms/${roomId}/messages/${messageId}`, { content });
  }

  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    return this.client.delete<void>(`/chat/rooms/${roomId}/messages/${messageId}`);
  }

  async addMember(roomId: string, userId: string): Promise<ChatRoom> {
    return this.client.post<ChatRoom>(`/chat/rooms/${roomId}/members`, { userId });
  }

  async removeMember(roomId: string, userId: string): Promise<ChatRoom> {
    return this.client.delete<ChatRoom>(`/chat/rooms/${roomId}/members/${userId}`);
  }

  async leaveRoom(roomId: string): Promise<void> {
    return this.client.post<void>(`/chat/rooms/${roomId}/leave`, {});
  }

  async addReaction(roomId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    return this.client.post<ChatMessage>(`/chat/rooms/${roomId}/messages/${messageId}/reactions`, { emoji });
  }

  async removeReaction(roomId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    return this.client.delete<ChatMessage>(`/chat/rooms/${roomId}/messages/${messageId}/reactions/${emoji}`);
  }

  async getDirectRoom(userId: string): Promise<ChatRoom> {
    return this.client.get<ChatRoom>(`/chat/direct/${userId}`);
  }

  async markAsRead(roomId: string, messageId: string): Promise<void> {
    return this.client.post<void>(`/chat/rooms/${roomId}/read`, { messageId });
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.client.get<{ count: number }>('/chat/unread');
    return response.count;
  }

  async searchMessages(query: string, roomId?: string, params?: PaginationParams): Promise<PaginatedResponse<ChatMessage>> {
    return this.client.get<PaginatedResponse<ChatMessage>>('/chat/search', {
      q: query,
      roomId,
      ...params,
    });
  }

  async uploadAttachment(roomId: string, file: File | Buffer, filename: string): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file as Blob, filename);

    return this.client.post<Attachment>(`/chat/rooms/${roomId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}
