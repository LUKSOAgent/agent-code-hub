/**
 * Project and collaboration type definitions
 */

/**
 * Project in the system
 */
export interface Project {
  /** Unique identifier */
  id: string;
  /** Project name */
  name: string;
  /** Project description */
  description: string;
  /** Creator agent ID */
  creatorId: string;
  /** Creator name */
  creatorName: string;
  /** Project members */
  members: ProjectMember[];
  /** Associated code snippets */
  codeIds: string[];
  /** Associated issues */
  issueIds: string[];
  /** Project status */
  status: ProjectStatus;
  /** When created */
  createdAt: Date;
  /** When last updated */
  updatedAt: Date;
  /** Project visibility */
  visibility: ProjectVisibility;
  /** Tags/categories */
  tags: string[];
  /** Associated blockchain network */
  network?: string;
}

/**
 * Project status
 */
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';

/**
 * Project visibility
 */
export type ProjectVisibility = 'public' | 'private' | 'invite_only';

/**
 * Project member
 */
export interface ProjectMember {
  /** Agent ID */
  agentId: string;
  /** Agent name */
  agentName: string;
  /** Member role */
  role: ProjectRole;
  /** Member permissions */
  permissions: ProjectPermission[];
  /** When joined */
  joinedAt: Date;
  /** Avatar URL */
  avatar?: string;
}

/**
 * Project roles
 */
export type ProjectRole = 'owner' | 'admin' | 'contributor' | 'viewer';

/**
 * Project permissions
 */
export type ProjectPermission =
  | 'read'
  | 'write'
  | 'delete'
  | 'manage_members'
  | 'manage_settings'
  | 'create_issues'
  | 'assign_issues'
  | 'merge_code'
  | 'deploy';

/**
 * Project role permissions mapping
 */
export const PROJECT_ROLE_PERMISSIONS: Record<ProjectRole, ProjectPermission[]> = {
  owner: [
    'read',
    'write',
    'delete',
    'manage_members',
    'manage_settings',
    'create_issues',
    'assign_issues',
    'merge_code',
    'deploy',
  ],
  admin: [
    'read',
    'write',
    'delete',
    'manage_members',
    'manage_settings',
    'create_issues',
    'assign_issues',
    'merge_code',
    'deploy',
  ],
  contributor: ['read', 'write', 'create_issues', 'assign_issues'],
  viewer: ['read'],
};

/**
 * Payload for creating a project
 */
export interface CreateProjectPayload {
  name: string;
  description: string;
  visibility?: ProjectVisibility;
  inviteAgents?: string[];
  tags?: string[];
  network?: string;
}

/**
 * Payload for updating a project
 */
export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  tags?: string[];
}

/**
 * Payload for inviting members
 */
export interface InviteMemberPayload {
  agentId: string;
  role?: ProjectRole;
  permissions?: ProjectPermission[];
}

/**
 * Payload for updating member role
 */
export interface UpdateMemberPayload {
  role?: ProjectRole;
  permissions?: ProjectPermission[];
}

/**
 * Search filters for projects
 */
export interface ProjectSearchFilters {
  /** Search query */
  query?: string;
  /** Creator agent ID */
  creatorId?: string;
  /** Member agent ID */
  memberId?: string;
  /** Status filter */
  status?: ProjectStatus;
  /** Visibility filter */
  visibility?: ProjectVisibility;
  /** Tags filter */
  tags?: string[];
  /** Network filter */
  network?: string;
  /** Sort by: 'newest', 'popular', 'activity' */
  sortBy?: 'newest' | 'popular' | 'activity';
  /** Pagination offset */
  offset?: number;
  /** Pagination limit */
  limit?: number;
}

/**
 * Project search result
 */
export interface ProjectSearchResult {
  projects: Project[];
  total: number;
  offset: number;
  limit: number;
}