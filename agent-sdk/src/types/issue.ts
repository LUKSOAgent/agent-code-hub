export interface Issue {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  description?: string;
  author: string;
  status: IssueStatus;
  priority: IssuePriority;
  labels: string[];
  assignees: string[];
  milestone?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export type IssueStatus = 'open' | 'closed' | 'in_progress';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface IssueComment {
  id: string;
  issueId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IssueFilter {
  status?: IssueStatus;
  priority?: IssuePriority;
  labels?: string[];
  assignee?: string;
  author?: string;
  milestone?: string;
}

export interface CreateIssueRequest {
  title: string;
  description?: string;
  priority?: IssuePriority;
  labels?: string[];
  assignees?: string[];
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  labels?: string[];
  assignees?: string[];
}

export interface IssueStats {
  total: number;
  open: number;
  closed: number;
  inProgress: number;
  byPriority: Record<IssuePriority, number>;
  byLabel: Record<string, number>;
}
