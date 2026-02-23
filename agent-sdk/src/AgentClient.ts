import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { SDKConfig, APIError, PaginationParams } from './types';
import { AgentService } from './services/AgentService';
import { CodeService } from './services/CodeService';
import { IssueService } from './services/IssueService';
import { ProjectService } from './services/ProjectService';
import { ChatService } from './services/ChatService';
import { WebSocketClient } from './websocket/WebSocketClient';
import { WebSocketHandlers } from './websocket/handlers';
import { LUKSOProvider } from './blockchain/LUKSOProvider';
import type { BlockchainConfig } from './types';

export class AgentClient {
  private http: AxiosInstance;
  private config: SDKConfig;
  private wsClient?: WebSocketClient;
  private wsHandlers?: WebSocketHandlers;

  public agents: AgentService;
  public code: CodeService;
  public issues: IssueService;
  public projects: ProjectService;
  public chat: ChatService;

  constructor(config: SDKConfig) {
    this.config = {
      timeout: 30000,
      debug: false,
      ...config,
    };

    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();

    this.agents = new AgentService(this);
    this.code = new CodeService(this);
    this.issues = new IssueService(this);
    this.projects = new ProjectService(this);
    this.chat = new ChatService(this);
  }

  private setupInterceptors(): void {
    this.http.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log(`[SDK Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        if (this.config.apiKey) {
          config.headers.Authorization = `Bearer ${this.config.apiKey}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.http.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: AxiosError<APIError>) => {
        if (this.config.debug) {
          console.error('[SDK Error]', error.response?.data || error.message);
        }

        const apiError: APIError = {
          code: error.response?.data?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.message || error.message,
          status: error.response?.status || 500,
          details: error.response?.data?.details,
        };

        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.http.get(path, { params }) as Promise<T>;
  }

  async post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.http.post(path, data, config) as Promise<T>;
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.http.put(path, data) as Promise<T>;
  }

  async patch<T>(path: string, data?: unknown): Promise<T> {
    return this.http.patch(path, data) as Promise<T>;
  }

  async delete<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.http.delete(path, { params }) as Promise<T>;
  }

  connectWebSocket(authToken?: string): WebSocketClient {
    if (!this.config.websocketUrl) {
      throw new Error('WebSocket URL not configured');
    }

    this.wsClient = new WebSocketClient({
      url: this.config.websocketUrl,
      authToken: authToken || this.config.apiKey,
      reconnect: true,
    });

    this.wsHandlers = new WebSocketHandlers(this.wsClient);

    return this.wsClient;
  }

  getWebSocketClient(): WebSocketClient | undefined {
    return this.wsClient;
  }

  getWebSocketHandlers(): WebSocketHandlers | undefined {
    return this.wsHandlers;
  }

  createLUKSOProvider(config: BlockchainConfig): LUKSOProvider {
    return new LUKSOProvider(config);
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
    this.http.defaults.baseURL = baseUrl;
  }

  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
    this.http.defaults.timeout = timeout;
  }

  getConfig(): SDKConfig {
    return { ...this.config };
  }

  async health(): Promise<{ status: string; version: string }> {
    return this.get<{ status: string; version: string }>('/health');
  }

  async getMe(): Promise<{ id: string; username: string; email: string }> {
    return this.get<{ id: string; username: string; email: string }>('/me');
  }
}

export default AgentClient;
