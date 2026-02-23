import type { CodeRepository, CodeFile, CodeSnippet, CodeReview, CodeDiff, LanguageStats } from '../types/code';
import type { PaginatedResponse, PaginationParams } from '../types';
import type { AgentClient } from '../AgentClient';

export class CodeService {
  private client: AgentClient;

  constructor(client: AgentClient) {
    this.client = client;
  }

  async listRepositories(params?: PaginationParams): Promise<PaginatedResponse<CodeRepository>> {
    return this.client.get<PaginatedResponse<CodeRepository>>('/repositories', params);
  }

  async getRepository(id: string): Promise<CodeRepository> {
    return this.client.get<CodeRepository>(`/repositories/${id}`);
  }

  async createRepository(name: string, description?: string, visibility: 'public' | 'private' = 'private'): Promise<CodeRepository> {
    return this.client.post<CodeRepository>('/repositories', { name, description, visibility });
  }

  async updateRepository(id: string, updates: Partial<CodeRepository>): Promise<CodeRepository> {
    return this.client.patch<CodeRepository>(`/repositories/${id}`, updates);
  }

  async deleteRepository(id: string): Promise<void> {
    return this.client.delete<void>(`/repositories/${id}`);
  }

  async getFile(repositoryId: string, path: string, ref = 'main'): Promise<CodeFile> {
    return this.client.get<CodeFile>(`/repositories/${repositoryId}/files`, { path, ref });
  }

  async getFileContent(repositoryId: string, path: string, ref = 'main'): Promise<string> {
    const file = await this.getFile(repositoryId, path, ref);
    return file.content;
  }

  async createFile(
    repositoryId: string,
    path: string,
    content: string,
    message: string,
    branch = 'main'
  ): Promise<CodeFile> {
    return this.client.post<CodeFile>(`/repositories/${repositoryId}/files`, {
      path,
      content,
      message,
      branch,
    });
  }

  async updateFile(
    repositoryId: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch = 'main'
  ): Promise<CodeFile> {
    return this.client.put<CodeFile>(`/repositories/${repositoryId}/files`, {
      path,
      content,
      message,
      sha,
      branch,
    });
  }

  async deleteFile(repositoryId: string, path: string, message: string, sha: string, branch = 'main'): Promise<void> {
    return this.client.delete<void>(`/repositories/${repositoryId}/files`, {
      path,
      message,
      sha,
      branch,
    });
  }

  async listFiles(repositoryId: string, path = '', ref = 'main'): Promise<CodeFile[]> {
    return this.client.get<CodeFile[]>(`/repositories/${repositoryId}/files/list`, { path, ref });
  }

  async getDiff(repositoryId: string, base: string, head: string): Promise<CodeDiff[]> {
    return this.client.get<CodeDiff[]>(`/repositories/${repositoryId}/diff`, { base, head });
  }

  async createPullRequest(
    repositoryId: string,
    title: string,
    body: string,
    head: string,
    base: string
  ): Promise<Record<string, unknown>> {
    return this.client.post<Record<string, unknown>>(`/repositories/${repositoryId}/pulls`, {
      title,
      body,
      head,
      base,
    });
  }

  async listPullRequests(repositoryId: string, params?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.client.get<PaginatedResponse<Record<string, unknown>>>(`/repositories/${repositoryId}/pulls`, params);
  }

  async getPullRequest(repositoryId: string, number: number): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>(`/repositories/${repositoryId}/pulls/${number}`);
  }

  async mergePullRequest(repositoryId: string, number: number, message?: string): Promise<Record<string, unknown>> {
    return this.client.put<Record<string, unknown>>(`/repositories/${repositoryId}/pulls/${number}/merge`, {
      message,
    });
  }

  async createReview(
    repositoryId: string,
    pullRequestNumber: number,
    status: 'approve' | 'request_changes' | 'comment',
    body?: string
  ): Promise<CodeReview> {
    return this.client.post<CodeReview>(`/repositories/${repositoryId}/pulls/${pullRequestNumber}/reviews`, {
      status,
      body,
    });
  }

  async listSnippets(params?: PaginationParams): Promise<PaginatedResponse<CodeSnippet>> {
    return this.client.get<PaginatedResponse<CodeSnippet>>('/snippets', params);
  }

  async createSnippet(title: string, code: string, language: string, description?: string): Promise<CodeSnippet> {
    return this.client.post<CodeSnippet>('/snippets', {
      title,
      code,
      language,
      description,
    });
  }

  async getSnippet(id: string): Promise<CodeSnippet> {
    return this.client.get<CodeSnippet>(`/snippets/${id}`);
  }

  async deleteSnippet(id: string): Promise<void> {
    return this.client.delete<void>(`/snippets/${id}`);
  }

  async getLanguageStats(repositoryId: string): Promise<LanguageStats[]> {
    return this.client.get<LanguageStats[]>(`/repositories/${repositoryId}/languages`);
  }

  async searchCode(query: string, params?: PaginationParams): Promise<PaginatedResponse<CodeFile>> {
    return this.client.get<PaginatedResponse<CodeFile>>('/search/code', { q: query, ...params });
  }

  async forkRepository(repositoryId: string, name?: string): Promise<CodeRepository> {
    return this.client.post<CodeRepository>(`/repositories/${repositoryId}/fork`, { name });
  }

  async starRepository(repositoryId: string): Promise<void> {
    return this.client.post<void>(`/repositories/${repositoryId}/star`, {});
  }

  async unstarRepository(repositoryId: string): Promise<void> {
    return this.client.delete<void>(`/repositories/${repositoryId}/star`);
  }
}
