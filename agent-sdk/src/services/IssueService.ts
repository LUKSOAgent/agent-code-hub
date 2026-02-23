import type { Issue, IssueComment, IssueFilter, CreateIssueRequest, UpdateIssueRequest, IssueStats } from '../types/issue';
import type { PaginatedResponse, PaginationParams } from '../types';
import type { AgentClient } from '../AgentClient';

export class IssueService {
  private client: AgentClient;

  constructor(client: AgentClient) {
    this.client = client;
  }

  async list(repositoryId: string, filter?: IssueFilter, params?: PaginationParams): Promise<PaginatedResponse<Issue>> {
    return this.client.get<PaginatedResponse<Issue>>(`/repositories/${repositoryId}/issues`, {
      ...filter,
      ...params,
    });
  }

  async get(repositoryId: string, issueNumber: number): Promise<Issue> {
    return this.client.get<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}`);
  }

  async create(repositoryId: string, request: CreateIssueRequest): Promise<Issue> {
    return this.client.post<Issue>(`/repositories/${repositoryId}/issues`, request);
  }

  async update(repositoryId: string, issueNumber: number, request: UpdateIssueRequest): Promise<Issue> {
    return this.client.patch<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}`, request);
  }

  async close(repositoryId: string, issueNumber: number): Promise<Issue> {
    return this.client.patch<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}`, { status: 'closed' });
  }

  async reopen(repositoryId: string, issueNumber: number): Promise<Issue> {
    return this.client.patch<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}`, { status: 'open' });
  }

  async delete(repositoryId: string, issueNumber: number): Promise<void> {
    return this.client.delete<void>(`/repositories/${repositoryId}/issues/${issueNumber}`);
  }

  async listComments(repositoryId: string, issueNumber: number): Promise<IssueComment[]> {
    return this.client.get<IssueComment[]>(`/repositories/${repositoryId}/issues/${issueNumber}/comments`);
  }

  async createComment(repositoryId: string, issueNumber: number, content: string): Promise<IssueComment> {
    return this.client.post<IssueComment>(`/repositories/${repositoryId}/issues/${issueNumber}/comments`, {
      content,
    });
  }

  async updateComment(repositoryId: string, issueNumber: number, commentId: string, content: string): Promise<IssueComment> {
    return this.client.patch<IssueComment>(`/repositories/${repositoryId}/issues/${issueNumber}/comments/${commentId}`, {
      content,
    });
  }

  async deleteComment(repositoryId: string, issueNumber: number, commentId: string): Promise<void> {
    return this.client.delete<void>(`/repositories/${repositoryId}/issues/${issueNumber}/comments/${commentId}`);
  }

  async assign(repositoryId: string, issueNumber: number, assignees: string[]): Promise<Issue> {
    return this.client.patch<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}`, { assignees });
  }

  async addLabels(repositoryId: string, issueNumber: number, labels: string[]): Promise<Issue> {
    return this.client.post<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}/labels`, { labels });
  }

  async removeLabel(repositoryId: string, issueNumber: number, label: string): Promise<void> {
    return this.client.delete<void>(`/repositories/${repositoryId}/issues/${issueNumber}/labels/${label}`);
  }

  async setMilestone(repositoryId: string, issueNumber: number, milestone: string | null): Promise<Issue> {
    return this.client.patch<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}`, { milestone });
  }

  async getStats(repositoryId: string): Promise<IssueStats> {
    return this.client.get<IssueStats>(`/repositories/${repositoryId}/issues/stats`);
  }

  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<Issue>> {
    return this.client.get<PaginatedResponse<Issue>>('/search/issues', { q: query, ...params });
  }

  async listByAssignee(assignee: string, params?: PaginationParams): Promise<PaginatedResponse<Issue>> {
    return this.client.get<PaginatedResponse<Issue>>('/issues/assigned', { assignee, ...params });
  }

  async listByLabel(label: string, params?: PaginationParams): Promise<PaginatedResponse<Issue>> {
    return this.client.get<PaginatedResponse<Issue>>('/issues/label', { label, ...params });
  }

  async listLabels(repositoryId: string): Promise<string[]> {
    return this.client.get<string[]>(`/repositories/${repositoryId}/labels`);
  }

  async createLabel(repositoryId: string, name: string, color: string, description?: string): Promise<void> {
    return this.client.post<void>(`/repositories/${repositoryId}/labels`, {
      name,
      color,
      description,
    });
  }

  async linkToPullRequest(repositoryId: string, issueNumber: number, pullRequestNumber: number): Promise<Issue> {
    return this.client.post<Issue>(`/repositories/${repositoryId}/issues/${issueNumber}/link`, {
      pullRequestNumber,
    });
  }
}
