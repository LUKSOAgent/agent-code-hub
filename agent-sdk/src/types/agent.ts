export interface Agent {
  id: string;
  name: string;
  description?: string;
  owner: string;
  capabilities: AgentCapability[];
  status: AgentStatus;
  metadata: AgentMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  parameters: CapabilityParameter[];
}

export interface CapabilityParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: unknown;
  description?: string;
}

export type AgentStatus = 'active' | 'inactive' | 'paused' | 'error';

export interface AgentMetadata {
  version: string;
  tags?: string[];
  icon?: string;
  category?: string;
  license?: string;
  repository?: string;
}

export interface AgentConfig {
  name: string;
  description?: string;
  capabilities: string[];
  metadata?: Partial<AgentMetadata>;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AgentMetrics {
  executionsTotal: number;
  executionsSuccessful: number;
  executionsFailed: number;
  averageExecutionTime: number;
  lastExecutionAt?: string;
}
