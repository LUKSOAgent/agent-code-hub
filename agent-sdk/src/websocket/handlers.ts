import type { WebSocketClient } from './WebSocketClient';
import type { 
  WebSocketMessage, 
  ChatMessagePayload, 
  TypingIndicator, 
  NotificationPayload 
} from '../types/websocket';
import type { Agent, AgentExecution } from '../types/agent';
import type { Issue } from '../types/issue';
import type { CodeFile } from '../types/code';

export class WebSocketHandlers {
  private client: WebSocketClient;

  constructor(client: WebSocketClient) {
    this.client = client;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.client.on('agent.status', (payload: { agent: Agent; status: string }) => {
      this.handleAgentStatusUpdate(payload);
    });

    this.client.on('agent.execution', (payload: { execution: AgentExecution }) => {
      this.handleAgentExecutionUpdate(payload);
    });

    this.client.on('agent.output', (payload: { executionId: string; output: string }) => {
      this.handleAgentOutput(payload);
    });

    this.client.on('chat.message', (payload: ChatMessagePayload) => {
      this.handleChatMessage(payload);
    });

    this.client.on('chat.typing', (payload: TypingIndicator) => {
      this.handleTypingIndicator(payload);
    });

    this.client.on('code.update', (payload: { file: CodeFile; change: string }) => {
      this.handleCodeUpdate(payload);
    });

    this.client.on('issue.update', (payload: { issue: Issue; action: string }) => {
      this.handleIssueUpdate(payload);
    });

    this.client.on('notification', (payload: NotificationPayload) => {
      this.handleNotification(payload);
    });

    this.client.on('error', (error: Error | Record<string, unknown>) => {
      this.handleError(error);
    });
  }

  private handleAgentStatusUpdate(payload: { agent: Agent; status: string }): void {
    console.log(`Agent ${payload.agent.id} status changed to: ${payload.status}`);
  }

  private handleAgentExecutionUpdate(payload: { execution: AgentExecution }): void {
    const { execution } = payload;
    console.log(`Execution ${execution.id} status: ${execution.status}`);
  }

  private handleAgentOutput(payload: { executionId: string; output: string }): void {
    console.log(`Output from execution ${payload.executionId}:`, payload.output);
  }

  private handleChatMessage(payload: ChatMessagePayload): void {
    console.log(`New message in room ${payload.roomId}:`, payload.content);
  }

  private handleTypingIndicator(payload: TypingIndicator): void {
    const action = payload.isTyping ? 'typing' : 'stopped typing';
    console.log(`User ${payload.userId} is ${action} in room ${payload.roomId}`);
  }

  private handleCodeUpdate(payload: { file: CodeFile; change: string }): void {
    console.log(`Code updated in ${payload.file.path}: ${payload.change}`);
  }

  private handleIssueUpdate(payload: { issue: Issue; action: string }): void {
    console.log(`Issue ${payload.issue.id} ${payload.action}`);
  }

  private handleNotification(payload: NotificationPayload): void {
    console.log(`[${payload.type.toUpperCase()}] ${payload.title}: ${payload.message}`);
  }

  private handleError(error: Error | Record<string, unknown>): void {
    console.error('WebSocket error:', error);
  }

  public sendChatMessage(roomId: string, content: string, options?: Partial<ChatMessagePayload>): void {
    this.client.send<ChatMessagePayload>({
      type: 'chat.message',
      payload: {
        roomId,
        content,
        ...options,
      } as ChatMessagePayload,
    });
  }

  public sendTypingIndicator(roomId: string, isTyping: boolean): void {
    this.client.send<TypingIndicator>({
      type: 'chat.typing',
      payload: {
        roomId,
        userId: '',
        isTyping,
      },
    });
  }

  public subscribeToAgent(agentId: string): void {
    this.client.subscribe(`agent:${agentId}`);
  }

  public subscribeToRoom(roomId: string): void {
    this.client.subscribe(`room:${roomId}`);
  }

  public subscribeToRepository(repositoryId: string): void {
    this.client.subscribe(`repo:${repositoryId}`);
  }

  public subscribeToProject(projectId: string): void {
    this.client.subscribe(`project:${projectId}`);
  }
}
