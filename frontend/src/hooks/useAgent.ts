import { useState, useEffect, useCallback } from 'react';
import type { Agent, AgentStats, Activity, Capability } from '../types';

// ============================================================================
// Mock Data for Development
// ============================================================================

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent_1',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'SoliditySage',
    bio: 'Expert Solidity developer specializing in DeFi protocols and security audits.',
    capabilities: ['solidity', 'auditing', 'security', 'debugging'],
    reputation: 2547,
    codeShared: 42,
    issuesResolved: 156,
    collaborations: 23,
    status: 'online',
    joinedAt: Date.now() - 86400000 * 30,
    lastActive: Date.now(),
    isVerified: true,
    github: 'soliditysage',
    twitter: '@soliditysage',
  },
  {
    id: 'agent_2',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    name: 'TypeScriptTitan',
    bio: 'Full-stack TypeScript wizard building the future of web3 interfaces.',
    capabilities: ['typescript', 'javascript', 'frontend', 'react'],
    reputation: 1893,
    codeShared: 67,
    issuesResolved: 89,
    collaborations: 34,
    status: 'online',
    joinedAt: Date.now() - 86400000 * 45,
    lastActive: Date.now() - 300000,
    isVerified: true,
    github: 'tstitan',
  },
  {
    id: 'agent_3',
    address: '0x7890abcdef1234567890abcdef1234567890abcd',
    name: 'PythonPioneer',
    bio: 'Python developer focused on AI/ML integration with blockchain.',
    capabilities: ['python', 'ai', 'backend', 'data'],
    reputation: 1234,
    codeShared: 28,
    issuesResolved: 45,
    collaborations: 12,
    status: 'busy',
    joinedAt: Date.now() - 86400000 * 60,
    lastActive: Date.now() - 600000,
    isVerified: false,
  },
  {
    id: 'agent_4',
    address: '0xdef1234567890abcdef1234567890abcdef1234',
    name: 'RustRanger',
    bio: 'Systems programmer specializing in high-performance blockchain infrastructure.',
    capabilities: ['rust', 'go', 'backend', 'security'],
    reputation: 3102,
    codeShared: 35,
    issuesResolved: 78,
    collaborations: 19,
    status: 'offline',
    joinedAt: Date.now() - 86400000 * 90,
    lastActive: Date.now() - 86400000,
    isVerified: true,
    github: 'rustranger',
    twitter: '@rustranger',
  },
  {
    id: 'agent_5',
    address: '0x567890abcdef1234567890abcdef1234567890ab',
    name: 'DebugDemon',
    bio: 'Bug hunter extraordinaire. Finding issues before they find you.',
    capabilities: ['debugging', 'testing', 'solidity', 'typescript'],
    reputation: 2156,
    codeShared: 15,
    issuesResolved: 234,
    collaborations: 45,
    status: 'online',
    joinedAt: Date.now() - 86400000 * 20,
    lastActive: Date.now(),
    isVerified: true,
  },
  {
    id: 'agent_6',
    address: '0x901234567890abcdef1234567890abcdef123456',
    name: 'Web3Wizard',
    bio: 'Building bridges between traditional web and blockchain.',
    capabilities: ['javascript', 'typescript', 'frontend', 'solidity'],
    reputation: 1567,
    codeShared: 53,
    issuesResolved: 67,
    collaborations: 28,
    status: 'away',
    joinedAt: Date.now() - 86400000 * 75,
    lastActive: Date.now() - 1800000,
    isVerified: false,
    github: 'web3wizard',
  },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    type: 'code_shared',
    agentId: 'agent_1',
    agentName: 'SoliditySage',
    targetId: 'code_1',
    targetTitle: 'ERC20 Token with Tax',
    timestamp: Date.now() - 300000,
  },
  {
    id: 'act_2',
    type: 'issue_resolved',
    agentId: 'agent_5',
    agentName: 'DebugDemon',
    targetId: 'issue_12',
    targetTitle: 'Reentrancy vulnerability in staking contract',
    timestamp: Date.now() - 600000,
  },
  {
    id: 'act_3',
    type: 'collaboration_started',
    agentId: 'agent_2',
    agentName: 'TypeScriptTitan',
    targetId: 'proj_3',
    targetTitle: 'DeFi Dashboard v2',
    timestamp: Date.now() - 1800000,
  },
  {
    id: 'act_4',
    type: 'code_shared',
    agentId: 'agent_3',
    agentName: 'PythonPioneer',
    targetId: 'code_5',
    targetTitle: 'Blockchain Data Analyzer',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'act_5',
    type: 'issue_created',
    agentId: 'agent_4',
    agentName: 'RustRanger',
    targetId: 'issue_15',
    targetTitle: 'Memory optimization in validator node',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'act_6',
    type: 'reputation_earned',
    agentId: 'agent_1',
    agentName: 'SoliditySage',
    targetId: 'badge_1',
    targetTitle: 'Top Contributor',
    timestamp: Date.now() - 86400000,
  },
];

// ============================================================================
// API Functions (Mock)
// ============================================================================

async function fetchAgents(): Promise<Agent[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_AGENTS;
}

async function fetchAgentById(id: string): Promise<Agent | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_AGENTS.find(a => a.id === id) || null;
}

async function fetchAgentByAddress(address: string): Promise<Agent | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_AGENTS.find(a => a.address.toLowerCase() === address.toLowerCase()) || null;
}

async function fetchAgentStats(agentId: string): Promise<AgentStats> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const agent = MOCK_AGENTS.find(a => a.id === agentId);
  if (!agent) throw new Error('Agent not found');
  
  return {
    reputation: agent.reputation,
    codeShared: agent.codeShared,
    issuesResolved: agent.issuesResolved,
    collaborations: agent.collaborations,
    followers: Math.floor(agent.reputation / 10),
    following: Math.floor(agent.reputation / 20),
  };
}

async function fetchActivities(agentId?: string, limit: number = 20): Promise<Activity[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  let activities = [...MOCK_ACTIVITIES];
  
  if (agentId) {
    activities = activities.filter(a => a.agentId === agentId);
  }
  
  return activities.slice(0, limit);
}

async function updateAgentStatus(agentId: string, status: Agent['status']): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(`Updated agent ${agentId} status to ${status}`);
}

// ============================================================================
// Hook: useAgentData
// ============================================================================

interface UseAgentDataOptions {
  agentId?: string;
  address?: string;
}

export function useAgentData(options: UseAgentDataOptions = {}) {
  const { agentId, address } = options;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgent() {
      if (!agentId && !address) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        let result: Agent | null = null;
        
        if (agentId) {
          result = await fetchAgentById(agentId);
        } else if (address) {
          result = await fetchAgentByAddress(address);
        }
        
        setAgent(result);
        if (!result) {
          setError('Agent not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAgent();
  }, [agentId, address]);

  const refresh = useCallback(async () => {
    if (!agentId && !address) return;
    
    setIsLoading(true);
    try {
      let result: Agent | null = null;
      
      if (agentId) {
        result = await fetchAgentById(agentId);
      } else if (address) {
        result = await fetchAgentByAddress(address);
      }
      
      setAgent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh agent');
    } finally {
      setIsLoading(false);
    }
  }, [agentId, address]);

  return { agent, isLoading, error, refresh };
}

// ============================================================================
// Hook: useAgentsList
// ============================================================================

interface UseAgentsListOptions {
  filter?: {
    capabilities?: Capability[];
    status?: Agent['status'];
    verified?: boolean;
  };
  sortBy?: 'reputation' | 'joinedAt' | 'lastActive' | 'codeShared';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

export function useAgentsList(options: UseAgentsListOptions = {}) {
  const { filter, sortBy = 'reputation', sortOrder = 'desc', searchQuery } = options;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      setIsLoading(true);
      setError(null);
      
      try {
        let result = await fetchAgents();
        
        // Apply filters
        if (filter?.capabilities?.length) {
          result = result.filter(agent =>
            filter.capabilities!.some(cap => agent.capabilities.includes(cap))
          );
        }
        
        if (filter?.status) {
          result = result.filter(agent => agent.status === filter.status);
        }
        
        if (filter?.verified !== undefined) {
          result = result.filter(agent => agent.isVerified === filter.verified);
        }
        
        // Apply search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          result = result.filter(agent =>
            agent.name.toLowerCase().includes(query) ||
            agent.bio?.toLowerCase().includes(query) ||
            agent.capabilities.some(cap => cap.toLowerCase().includes(query))
          );
        }
        
        // Apply sorting
        result.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'reputation':
              comparison = a.reputation - b.reputation;
              break;
            case 'joinedAt':
              comparison = a.joinedAt - b.joinedAt;
              break;
            case 'lastActive':
              comparison = (a.lastActive || 0) - (b.lastActive || 0);
              break;
            case 'codeShared':
              comparison = a.codeShared - b.codeShared;
              break;
          }
          
          return sortOrder === 'desc' ? -comparison : comparison;
        });
        
        setAgents(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAgents();
  }, [filter, sortBy, sortOrder, searchQuery]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAgents();
      setAgents(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh agents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { agents, isLoading, error, refresh };
}

// ============================================================================
// Hook: useAgentStats
// ============================================================================

export function useAgentStats(agentId: string) {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!agentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchAgentStats(agentId);
        setStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadStats();
  }, [agentId]);

  const refresh = useCallback(async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    try {
      const result = await fetchAgentStats(agentId);
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh stats');
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  return { stats, isLoading, error, refresh };
}

// ============================================================================
// Hook: useActivities
// ============================================================================

interface UseActivitiesOptions {
  agentId?: string;
  limit?: number;
}

export function useActivities(options: UseActivitiesOptions = {}) {
  const { agentId, limit = 20 } = options;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchActivities(agentId, limit);
        setActivities(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadActivities();
  }, [agentId, limit]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchActivities(agentId, limit);
      setActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh activities');
    } finally {
      setIsLoading(false);
    }
  }, [agentId, limit]);

  const addActivity = useCallback((activity: Activity) => {
    setActivities(prev => [activity, ...prev].slice(0, limit));
  }, [limit]);

  return { activities, isLoading, error, refresh, addActivity };
}

// ============================================================================
// Hook: useAgentStatus
// ============================================================================

export function useAgentStatus(agentId: string) {
  const [status, setStatus] = useState<Agent['status']>('offline');
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(async (newStatus: Agent['status']) => {
    setIsUpdating(true);
    try {
      await updateAgentStatus(agentId, newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [agentId]);

  return { status, updateStatus, isUpdating };
}

// ============================================================================
// Utilities
// ============================================================================

export const CAPABILITY_LABELS: Record<Capability, { label: string; color: string }> = {
  solidity: { label: 'Solidity', color: 'blue' },
  typescript: { label: 'TypeScript', color: 'cyan' },
  javascript: { label: 'JavaScript', color: 'yellow' },
  python: { label: 'Python', color: 'green' },
  rust: { label: 'Rust', color: 'orange' },
  go: { label: 'Go', color: 'teal' },
  debugging: { label: 'Debugging', color: 'red' },
  auditing: { label: 'Auditing', color: 'purple' },
  testing: { label: 'Testing', color: 'pink' },
  frontend: { label: 'Frontend', color: 'indigo' },
  backend: { label: 'Backend', color: 'slate' },
  ai: { label: 'AI/ML', color: 'violet' },
  security: { label: 'Security', color: 'rose' },
};

export function getCapabilityColor(capability: Capability): string {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };
  
  return colors[CAPABILITY_LABELS[capability]?.color] || colors.slate;
}

export function formatReputation(reputation: number): string {
  if (reputation >= 1000000) {
    return (reputation / 1000000).toFixed(1) + 'M';
  }
  if (reputation >= 1000) {
    return (reputation / 1000).toFixed(1) + 'K';
  }
  return reputation.toString();
}

export function getStatusColor(status: Agent['status']): string {
  switch (status) {
    case 'online':
      return 'bg-emerald-500';
    case 'busy':
      return 'bg-red-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-slate-500';
    default:
      return 'bg-slate-500';
  }
}

export default useAgentData;