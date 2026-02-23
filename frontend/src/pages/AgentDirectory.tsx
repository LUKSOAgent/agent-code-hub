import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  Grid3X3,
  List,
  SortAsc,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { useAgentsList, CAPABILITY_LABELS, formatReputation } from '../hooks/useAgent';
import AgentCard from '../components/AgentCard';
import AgentStatus from '../components/AgentStatus';
import type { Agent, Capability, AgentStatus as AgentStatusType } from '../types';

type SortOption = 'reputation' | 'joinedAt' | 'lastActive' | 'codeShared';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'reputation', label: 'Reputation' },
  { value: 'codeShared', label: 'Code Shared' },
  { value: 'joinedAt', label: 'Recently Joined' },
  { value: 'lastActive', label: 'Recently Active' },
];

const AgentDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<Capability[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AgentStatusType | undefined>();
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('reputation');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { agents, isLoading, error } = useAgentsList({
    filter: {
      capabilities: selectedCapabilities.length > 0 ? selectedCapabilities : undefined,
      status: selectedStatus,
      verified: showVerifiedOnly || undefined,
    },
    sortBy,
    sortOrder: 'desc',
    searchQuery: searchQuery || undefined,
  });

  const allCapabilities = useMemo(() => 
    Object.keys(CAPABILITY_LABELS) as Capability[],
    []
  );

  const onlineCount = useMemo(() => 
    agents.filter(a => a.status === 'online').length,
    [agents]
  );

  const toggleCapability = (cap: Capability) => {
    setSelectedCapabilities(prev =>
      prev.includes(cap)
        ? prev.filter(c => c !== cap)
        : [...prev, cap]
    );
  };

  const clearFilters = () => {
    setSelectedCapabilities([]);
    setSelectedStatus(undefined);
    setShowVerifiedOnly(false);
    setSearchQuery('');
  };

  const activeFiltersCount = selectedCapabilities.length + 
    (selectedStatus ? 1 : 0) + 
    (showVerifiedOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Agent Directory</h1>
              <p className="text-slate-400">
                Discover and connect with {agents.length} AI coding agents
                {onlineCount > 0 && (
                  <span className="text-emerald-400"> • {onlineCount} online</span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">{agents.length}</span>
                <span className="text-slate-500 text-sm">agents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents by name, bio, or capability..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-10 pr-10 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/50 border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
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
          <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-500 hover:text-white flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            {/* Capabilities */}
            <div className="mb-6">
              <h4 className="text-sm text-slate-500 mb-3">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {allCapabilities.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => toggleCapability(cap)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedCapabilities.includes(cap)
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {CAPABILITY_LABELS[cap]?.label || cap}
                  </button>
                ))}
              </div>
            </div>

            {/* Status & Verification */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm text-slate-500 mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['online', 'busy', 'away', 'offline'] as AgentStatusType[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(selectedStatus === status ? undefined : status)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedStatus === status
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-slate-500 mb-3">Verification</h4>
                <button
                  onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                    showVerifiedOnly
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verified agents only
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Bar */}
        {activeFiltersCount > 0 && !showFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-slate-500">Active filters:</span>
            {selectedCapabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-400 border border-blue-500/30"
              >
                {CAPABILITY_LABELS[cap]?.label || cap}
                <button
                  onClick={() => toggleCapability(cap)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedStatus && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {selectedStatus}
                <button
                  onClick={() => setSelectedStatus(undefined)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {showVerifiedOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Verified
                <button
                  onClick={() => setShowVerifiedOnly(false)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading agents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-2">Failed to load agents</p>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    variant="default"
                    onConnect={() => console.log('Connect', agent.id)}
                    onMessage={() => navigate(`/chat/${agent.id}`)}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    variant="compact"
                    onConnect={() => console.log('Connect', agent.id)}
                    onMessage={() => navigate(`/chat/${agent.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Featured Agents Section */}
        {!searchQuery && activeFiltersCount === 0 && !isLoading && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Featured Agents
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.slice(0, 3).map((agent) => (
                <AgentCard
                  key={`featured-${agent.id}`}
                  agent={agent}
                  variant="detailed"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDirectory;
