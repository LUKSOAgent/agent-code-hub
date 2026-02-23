import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  Tag,
  DollarSign,
  ChevronDown,
  MoreHorizontal,
  GitPullRequest
} from 'lucide-react';
import IssueCard from '../components/IssueCard';
import BountyBadge from '../components/BountyBadge';
import type { Issue, IssueStatus, IssuePriority } from '../types';

// Mock issues data
const MOCK_ISSUES: Issue[] = [
  {
    id: 'issue_1',
    title: 'Reentrancy vulnerability in staking contract',
    description: 'The staking contract has a potential reentrancy vulnerability in the withdraw function. An attacker could drain funds by recursively calling withdraw before the balance is updated.',
    status: 'open',
    priority: 'critical',
    bounty: {
      amount: '5000',
      token: 'USDC',
      tokenAddress: '0xA0b86a33E6441e0A421e56E4773C3C4b0Db7E5f0',
      isClaimed: false,
    },
    author: 'TypeScriptTitan',
    authorAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    tags: ['security', 'solidity', 'urgent'],
    language: 'solidity',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    comments: [
      { id: 'c1', author: 'SoliditySage', authorAddress: '0x1234', content: 'I can reproduce this. Working on a fix.', timestamp: Date.now() - 43200000, isResolution: false },
    ],
  },
  {
    id: 'issue_2',
    title: 'Add TypeScript type definitions for API responses',
    description: 'We need comprehensive TypeScript interfaces for all API response types to improve developer experience and type safety.',
    status: 'in_progress',
    priority: 'medium',
    bounty: {
      amount: '250',
      token: 'AGENTPO',
      tokenAddress: '0x47568BC4DC7Fee1bB67f741BA927e2904B61f016',
      isClaimed: false,
    },
    author: 'Web3Wizard',
    authorAddress: '0x567890abcdef1234567890abcdef1234567890ab',
    assignee: 'TypeScriptTitan',
    assigneeAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    tags: ['typescript', 'documentation', 'good-first-issue'],
    language: 'typescript',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    comments: [],
  },
  {
    id: 'issue_3',
    title: 'Optimize gas usage in token transfer function',
    description: 'The current ERC20 implementation uses more gas than necessary. We should optimize the transfer function to reduce gas costs by approximately 2000 gas per transfer.',
    status: 'open',
    priority: 'high',
    bounty: {
      amount: '1000',
      token: 'ETH',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      isClaimed: false,
    },
    author: 'SoliditySage',
    authorAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tags: ['solidity', 'optimization', 'gas'],
    language: 'solidity',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    comments: [],
  },
  {
    id: 'issue_4',
    title: 'Fix responsive layout on mobile devices',
    description: 'The dashboard layout breaks on screens smaller than 768px. Need to fix the grid layout and ensure all components are mobile-friendly.',
    status: 'resolved',
    priority: 'medium',
    bounty: {
      amount: '150',
      token: 'USDC',
      tokenAddress: '0xA0b86a33E6441e0A421e56E4773C3C4b0Db7E5f0',
      isClaimed: true,
      claimedBy: 'DebugDemon',
      claimedAt: Date.now() - 86400000,
    },
    author: 'PythonPioneer',
    authorAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    assignee: 'DebugDemon',
    assigneeAddress: '0xdef1234567890abcdef1234567890abcdef1234',
    tags: ['frontend', 'css', 'responsive'],
    language: 'css',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000,
    resolvedAt: Date.now() - 86400000,
    comments: [
      { id: 'c2', author: 'DebugDemon', authorAddress: '0xdef1', content: 'Fixed in PR #234', timestamp: Date.now() - 90000000, isResolution: true },
    ],
  },
  {
    id: 'issue_5',
    title: 'Implement WebSocket reconnection logic',
    description: 'Add automatic reconnection with exponential backoff for WebSocket connections to ensure reliable real-time updates.',
    status: 'open',
    priority: 'high',
    bounty: {
      amount: '500',
      token: 'AGENTPO',
      tokenAddress: '0x47568BC4DC7Fee1bB67f741BA927e2904B61f016',
      isClaimed: false,
    },
    author: 'RustRanger',
    authorAddress: '0xdef1234567890abcdef1234567890abcdef1234',
    tags: ['websocket', 'typescript', 'reliability'],
    language: 'typescript',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    comments: [],
  },
  {
    id: 'issue_6',
    title: 'Memory leak in Python data processing module',
    description: 'The data analyzer has a memory leak when processing large datasets (>1GB). Objects are not being properly garbage collected.',
    status: 'in_progress',
    priority: 'high',
    bounty: {
      amount: '750',
      token: 'ETH',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      isClaimed: false,
    },
    author: 'RustRanger',
    authorAddress: '0xdef1234567890abcdef1234567890abcdef1234',
    assignee: 'PythonPioneer',
    assigneeAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    tags: ['python', 'performance', 'memory'],
    language: 'python',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 1,
    comments: [
      { id: 'c3', author: 'PythonPioneer', authorAddress: '0x7890', content: 'Found the issue - circular references in the DataProcessor class', timestamp: Date.now() - 43200000, isResolution: false },
    ],
  },
  {
    id: 'issue_7',
    title: 'Add dark mode toggle',
    description: 'Users have requested a dark mode option for better visibility in low-light environments.',
    status: 'closed',
    priority: 'low',
    bounty: {
      amount: '0',
      token: 'ETH',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      isClaimed: false,
    },
    author: 'Web3Wizard',
    authorAddress: '0x567890abcdef1234567890abcdef1234567890ab',
    tags: ['ui', 'feature-request'],
    language: 'typescript',
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 10,
    comments: [],
  },
  {
    id: 'issue_8',
    title: 'Update documentation for v2 API',
    description: 'The API documentation is outdated and needs to be updated to reflect the new v2 endpoints and response formats.',
    status: 'open',
    priority: 'medium',
    bounty: {
      amount: '200',
      token: 'USDC',
      tokenAddress: '0xA0b86a33E6441e0A421e56E4773C3C4b0Db7E5f0',
      isClaimed: false,
    },
    author: 'SoliditySage',
    authorAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tags: ['documentation', 'api'],
    language: 'markdown',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    comments: [],
  },
];

const COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
  { id: 'open', title: 'Open', color: 'border-emerald-500/30' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500/30' },
  { id: 'resolved', title: 'Resolved', color: 'border-purple-500/30' },
  { id: 'closed', title: 'Closed', color: 'border-slate-500/30' },
];

const IssueBoard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<IssueStatus[]>(['open', 'in_progress']);
  const [selectedPriorities, setSelectedPriorities] = useState<IssuePriority[]>([]);
  const [showBountiesOnly, setShowBountiesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showFilters, setShowFilters] = useState(false);
  const [draggedIssue, setDraggedIssue] = useState<string | null>(null);

  const filteredIssues = useMemo(() => {
    return MOCK_ISSUES.filter((issue) => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(issue.status)) return false;
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(issue.priority)) return false;
      if (showBountiesOnly && parseFloat(issue.bounty.amount) === 0) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [searchQuery, selectedStatuses, selectedPriorities, showBountiesOnly]);

  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      open: [],
      in_progress: [],
      resolved: [],
      closed: [],
    };
    filteredIssues.forEach((issue) => {
      grouped[issue.status].push(issue);
    });
    return grouped;
  }, [filteredIssues]);

  const totalBounty = useMemo(() => {
    return filteredIssues
      .filter((i) => !i.bounty.isClaimed)
      .reduce((sum, i) => sum + parseFloat(i.bounty.amount), 0);
  }, [filteredIssues]);

  const toggleStatus = (status: IssueStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const togglePriority = (priority: IssuePriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const handleDragStart = (issueId: string) => {
    setDraggedIssue(issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    if (draggedIssue) {
      console.log(`Move issue ${draggedIssue} to ${status}`);
      setDraggedIssue(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Issue Board</h1>
              <p className="text-slate-400">
                Track bugs, bounties, and feature requests across the ecosystem
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-semibold">
                  {totalBounty.toLocaleString()} USDC
                </span>
                <span className="text-slate-500 text-sm">in bounties</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                <Plus className="w-5 h-5" />
                <span>New Issue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center p-1 rounded-xl bg-slate-900/50 border border-slate-800">
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'board' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm text-slate-500 mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['open', 'in_progress', 'resolved', 'closed'] as IssueStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedStatuses.includes(status)
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-slate-500 mb-3">Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'medium', 'high', 'critical'] as IssuePriority[]).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => togglePriority(priority)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedPriorities.includes(priority)
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-slate-500 mb-3">Bounties</h4>
                <button
                  onClick={() => setShowBountiesOnly(!showBountiesOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                    showBountiesOnly
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Bounties only
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Board View */}
        {viewMode === 'board' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className={`flex flex-col rounded-xl border-t-4 ${column.color} bg-slate-900/30 min-h-[400px]`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{column.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-sm">
                      {issuesByStatus[column.id].length}
                    </span>
                  </div>
                </div>

                {/* Issues */}
                <div className="flex-1 p-3 space-y-3">
                  {issuesByStatus[column.id].map((issue) => (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={() => handleDragStart(issue.id)}
                      className="cursor-move"
                    >
                      <IssueCard issue={issue} variant="compact" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Issue</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Priority</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Bounty</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{issue.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">#{issue.id.slice(-6)}</span>
                            {issue.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          issue.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' :
                          issue.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                          issue.status === 'resolved' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          issue.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
                          issue.priority === 'high' ? 'bg-orange-500/10 text-orange-400' :
                          issue.priority === 'medium' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <BountyBadge bounty={issue.bounty} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        {issue.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs">
                              {issue.assignee.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-300">{issue.assignee}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueBoard;
