import type { Agent, AgentConfig, AgentExecution, AgentMetrics, ExecutionStatus } from '../types/agent';
import type { PaginatedResponse, PaginationParams } from '../types';
import type { AgentClient } from '../AgentClient';

export class AgentService {
  private client: AgentClient;

  constructor(client: AgentClient) {
    this.client = client;
  }

  async list(params?: PaginationParams): Promise<PaginatedResponse<Agent>> {
    return this.client.get<PaginatedResponse<Agent>>('/agents', params);
  }

  async getById(id: string): Promise<Agent> {
    return this.client.get<Agent>(`/agents/${id}`);
  }

  async create(config: AgentConfig): Promise<Agent> {
    return this.client.post<Agent>('/agents', config);
  }

  async update(id: string, config: Partial<AgentConfig>): Promise<Agent> {
    return this.client.patch<Agent>(`/agents/${id}`, config);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/agents/${id}`);
  }

  async execute(id: string, input: Record<string, unknown>): Promise<AgentExecution> {
    return this.client.post<AgentExecution>(`/agents/${id}/execute`, { input });
  }

  async getExecution(executionId: string): Promise<AgentExecution> {
    return this.client.get<AgentExecution>(`/agents/executions/${executionId}`);
  }

  async listExecutions(agentId: string, params?: PaginationParams): Promise<PaginatedResponse<AgentExecution>> {
    return this.client.get<PaginatedResponse<AgentExecution>>(`/agents/${agentId}/executions`, params);
  }

  async cancelExecution(executionId: string): Promise<AgentExecution> {
    return this.client.post<AgentExecution>(`/agents/executions/${executionId}/cancel`, {});
  }

  async getMetrics(agentId: string): Promise<AgentMetrics> {
    return this.client.get<AgentMetrics>(`/agents/${agentId}/metrics`);
  }

  async start(id: string): Promise<Agent> {
    return this.client.post<Agent>(`/agents/${id}/start`, {});
  }

  async stop(id: string): Promise<Agent> {
    return this.client.post<Agent>(`/agents/${id}/stop`, {});
  }

  async pause(id: string): Promise<Agent> {
    return this.client.post<Agent>(`/agents/${id}/pause`, {});
  }

  async resume(id: string): Promise<Agent> {
    return this.client.post<Agent>(`/agents/${id}/resume`, {});
  }

  async clone(id: string, name: string): Promise<Agent> {
    return this.client.post<Agent>(`/agents/${id}/clone`, { name });
  }

  async publish(id: string, visibility: 'public' | 'private'): Promise<Agent> {
    return this.client.post<Agent>(`/agents/${id}/publish`, { visibility });
  }

  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<Agent>> {
    return this.client.get<PaginatedResponse<Agent>>('/agents/search', { q: query, ...params });
  }

  async getByOwner(owner: string, params?: PaginationParams): Promise<PaginatedResponse<Agent>> {
    return this.client.get<PaginatedResponse<Agent>>(`/agents/owner/${owner}`, params);
  }

  async getByCapability(capability: string, params?: PaginationParams): Promise<PaginatedResponse<Agent>> {
    return this.client.get<PaginatedResponse<Agent>>(`/agents/capability/${capability}`, params);
  }

  async waitForExecution(
    executionId: string,
    timeout = 300000,
    pollInterval = 2000
  ): Promise<AgentExecution> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const execution = await this.getExecution(executionId);

      if (['completed', 'failed', 'cancelled'].includes(execution.status)) {
        return execution;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Execution ${executionId} timed out after ${timeout}ms`);
  }
}
