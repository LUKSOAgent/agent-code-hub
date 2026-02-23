import type { PaginatedResponse, PaginationParams } from '../types';
import type { AgentClient } from '../AgentClient';

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: ProjectMember[];
  repositories: string[];
  status: 'active' | 'archived' | 'planning';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  repositories?: string[];
  members?: { userId: string; role: string }[];
}

export class ProjectService {
  private client: AgentClient;

  constructor(client: AgentClient) {
    this.client = client;
  }

  async list(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    return this.client.get<PaginatedResponse<Project>>('/projects', params);
  }

  async get(id: string): Promise<Project> {
    return this.client.get<Project>(`/projects/${id}`);
  }

  async create(request: CreateProjectRequest): Promise<Project> {
    return this.client.post<Project>('/projects', request);
  }

  async update(id: string, updates: Partial<CreateProjectRequest>): Promise<Project> {
    return this.client.patch<Project>(`/projects/${id}`, updates);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/projects/${id}`);
  }

  async addMember(projectId: string, userId: string, role: ProjectMember['role'] = 'member'): Promise<Project> {
    return this.client.post<Project>(`/projects/${projectId}/members`, {
      userId,
      role,
    });
  }

  async removeMember(projectId: string, userId: string): Promise<Project> {
    return this.client.delete<Project>(`/projects/${projectId}/members/${userId}`);
  }

  async updateMemberRole(projectId: string, userId: string, role: ProjectMember['role']): Promise<Project> {
    return this.client.patch<Project>(`/projects/${projectId}/members/${userId}`, { role });
  }

  async addRepository(projectId: string, repositoryId: string): Promise<Project> {
    return this.client.post<Project>(`/projects/${projectId}/repositories`, { repositoryId });
  }

  async removeRepository(projectId: string, repositoryId: string): Promise<Project> {
    return this.client.delete<Project>(`/projects/${projectId}/repositories/${repositoryId}`);
  }

  async archive(id: string): Promise<Project> {
    return this.client.post<Project>(`/projects/${id}/archive`, {});
  }

  async activate(id: string): Promise<Project> {
    return this.client.post<Project>(`/projects/${id}/activate`, {});
  }

  async getMembers(id: string): Promise<ProjectMember[]> {
    return this.client.get<ProjectMember[]>(`/projects/${id}/members`);
  }

  async getRepositories(id: string): Promise<string[]> {
    return this.client.get<string[]>(`/projects/${id}/repositories`);
  }

  async listByUser(userId: string, params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    return this.client.get<PaginatedResponse<Project>>(`/users/${userId}/projects`, params);
  }

  async transferOwnership(id: string, newOwnerId: string): Promise<Project> {
    return this.client.post<Project>(`/projects/${id}/transfer`, { newOwnerId });
  }

  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    return this.client.get<PaginatedResponse<Project>>('/projects/search', { q: query, ...params });
  }
}
