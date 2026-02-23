import type React from 'react'

// ============================================================================
// Base Types
// ============================================================================

export interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  author: string
  authorAddress: string
  timestamp: number
  tags: string[]
  likes: number
  forks: number
  isVerified: boolean
  license?: string
  ipfsHash?: string
  version?: string
  collaborators?: string[]
}

export interface User {
  address: string
  name?: string
  avatar?: string
  bio?: string
  reputation: number
  codeCount: number
  totalLikes: number
  joinedAt: number
  github?: string
  twitter?: string
  website?: string
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: number
  likes: number
}

export interface FilterOptions {
  language?: string
  tags?: string[]
  author?: string
  sortBy: 'newest' | 'popular' | 'trending'
  timeRange?: 'day' | 'week' | 'month' | 'all'
}

export type Theme = 'dark' | 'light'

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
  id: string
  address: string
  name: string
  avatar?: string
  bio?: string
  capabilities: Capability[]
  reputation: number
  codeShared: number
  issuesResolved: number
  collaborations: number
  status: AgentStatus
  joinedAt: number
  lastActive: number
  isVerified: boolean
  github?: string
  twitter?: string
  website?: string
}

export type AgentStatus = 'online' | 'offline' | 'busy' | 'away'

export type Capability = 
  | 'solidity' 
  | 'typescript' 
  | 'javascript' 
  | 'python' 
  | 'rust' 
  | 'go'
  | 'debugging'
  | 'auditing'
  | 'testing'
  | 'frontend'
  | 'backend'
  | 'ai'
  | 'security'

export interface AgentStats {
  reputation: number
  codeShared: number
  issuesResolved: number
  collaborations: number
  followers: number
  following: number
}

export interface Activity {
  id: string
  type: ActivityType
  agentId: string
  agentName: string
  agentAvatar?: string
  targetId?: string
  targetTitle?: string
  targetType?: string
  timestamp: number
  metadata?: Record<string, any>
}

export type ActivityType = 
  | 'code_shared'
  | 'code_forked'
  | 'issue_created'
  | 'issue_resolved'
  | 'collaboration_started'
  | 'collaboration_ended'
  | 'agent_joined'
  | 'agent_left'
  | 'project_created'
  | 'message_sent'
  | 'reputation_earned'

export interface AgentConnection {
  agentId: string
  connectedAt: number
  status: 'pending' | 'accepted' | 'blocked'
}

// ============================================================================
// Issue Types
// ============================================================================

export interface Issue {
  id: string
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  bounty: Bounty
  author: string
  authorAddress: string
  assignee?: string
  assigneeAddress?: string
  tags: string[]
  language?: string
  createdAt: number
  updatedAt: number
  resolvedAt?: number
  comments: IssueComment[]
  attachments?: Attachment[]
}

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical'

export interface Bounty {
  amount: string
  token: string
  tokenAddress: string
  isClaimed: boolean
  claimedBy?: string
  claimedAt?: number
}

export interface IssueComment {
  id: string
  author: string
  authorAddress: string
  content: string
  timestamp: number
  isResolution: boolean
}

export interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size: number
}

// ============================================================================
// Project Types
// ============================================================================

export interface Project {
  id: string
  name: string
  description: string
  owner: string
  ownerAddress: string
  members: ProjectMember[]
  files: ProjectFile[]
  tasks: Task[]
  chatChannel: string
  createdAt: number
  updatedAt: number
  isPublic: boolean
  tags: string[]
  language?: string
}

export interface ProjectMember {
  agentId: string
  role: ProjectRole
  joinedAt: number
  permissions: Permission[]
}

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'
export type Permission = 'read' | 'write' | 'delete' | 'manage_members' | 'manage_tasks'

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  lastModified: number
  modifiedBy: string
  version: number
  isDirectory: boolean
  children?: ProjectFile[]
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  assignee?: string
  createdBy: string
  createdAt: number
  dueDate?: number
  completedAt?: number
  priority: TaskPriority
  tags: string[]
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

// ============================================================================
// Chat Types
// ============================================================================

export interface ChatMessage {
  id: string
  channelId: string
  author: string
  authorAddress: string
  authorAvatar?: string
  content: string
  timestamp: number
  type: MessageType
  replyTo?: string
  mentions: string[]
  reactions: Reaction[]
  attachments?: Attachment[]
  isEdited: boolean
  editedAt?: number
}

export type MessageType = 'text' | 'code' | 'image' | 'file' | 'system'

export interface Reaction {
  emoji: string
  users: string[]
}

export interface ChatChannel {
  id: string
  name: string
  type: ChannelType
  participants: string[]
  createdAt: number
  lastMessageAt?: number
  unreadCount: number
  isDirectMessage: boolean
}

export type ChannelType = 'global' | 'project' | 'direct' | 'issue'

// ============================================================================
// Collaboration Types
// ============================================================================

export interface Presence {
  agentId: string
  agentName: string
  agentAvatar?: string
  status: AgentStatus
  currentFile?: string
  cursorPosition?: CursorPosition
  selection?: Selection
  lastSeen: number
}

export interface CursorPosition {
  line: number
  column: number
}

export interface Selection {
  start: CursorPosition
  end: CursorPosition
}

export interface InlineComment {
  id: string
  fileId: string
  line: number
  column: number
  author: string
  content: string
  timestamp: number
  resolved: boolean
  replies: InlineCommentReply[]
}

export interface InlineCommentReply {
  id: string
  author: string
  content: string
  timestamp: number
}

export interface Version {
  id: string
  codeId: string
  version: string
  author: string
  authorAddress: string
  timestamp: number
  changes: string
  ipfsHash: string
}

// ============================================================================
// WebSocket Types
// ============================================================================

export type WebSocketEventType =
  | 'agent_joined'
  | 'agent_left'
  | 'agent_status_changed'
  | 'code_shared'
  | 'code_updated'
  | 'message_received'
  | 'typing_started'
  | 'typing_stopped'
  | 'cursor_moved'
  | 'selection_changed'
  | 'comment_added'
  | 'comment_resolved'
  | 'issue_created'
  | 'issue_updated'
  | 'issue_assigned'
  | 'file_changed'
  | 'task_created'
  | 'task_updated'
  | 'presence_update'
  | 'collaboration_invite'
  | 'collaboration_accepted'
  | 'error'

export interface WebSocketEvent {
  type: WebSocketEventType
  payload: any
  timestamp: number
  sender: string
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'event' | 'ping' | 'pong'
  channel?: string
  event?: WebSocketEvent
  timestamp: number
}

// ============================================================================
// Web3 Types
// ============================================================================

export interface Web3ContextType {
  isConnected: boolean
  address: string | null
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

// Universal Profile types
export interface UPProfile {
  name?: string
  description?: string
  profileImage?: string
  backgroundImage?: string
  tags?: string[]
  links?: UPLink[]
}

export interface UPLink {
  title: string
  url: string
}

export interface UniversalProfile {
  address: string
  profile?: UPProfile
  isVerified: boolean
}

// Contract types
export interface CodeRegistration {
  ipfsHash: string
  name: string
  description: string
  tags: string[]
  language: string
  version: string
}

export interface CodeUpdate {
  codeId: string
  newIpfsHash: string
  version: string
}

export interface Attribution {
  contributor: string
  share: bigint
}

export interface ReputationData {
  address: string
  reputation: bigint
  balance: bigint
}

// Transaction types
export interface TransactionCall {
  contractAddress: string
  abi: any[]
  functionName: string
  args: any[]
  value?: bigint
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'success' | 'failed'
  error?: string
}