import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Code2, 
  GitPullRequest, 
  Users, 
  BadgeCheck,
  MoreHorizontal,
  Link as LinkIcon,
  MessageSquare,
  Github,
  Twitter
} from 'lucide-react';
import type { Agent, Capability } from '../types';
import { 
  getCapabilityColor, 
  CAPABILITY_LABELS, 
  formatReputation 
} from '../hooks/useAgent';
import AgentStatus from './AgentStatus';

interface AgentCardProps {
  agent: Agent;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  isConnected?: boolean;
  onConnect?: (agentId: string) => void;
  onMessage?: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  variant = 'default',
  showActions = true,
  isConnected = false,
  onConnect,
  onMessage,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConnect?.(agent.id);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMessage?.(agent.id);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link
        to={`/agents/${agent.id}`}
        className="group flex items-center gap-3 p-3 rounded-xl glass-card hover:border-slate-600/50 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Avatar */}
        <div className="relative">
          {agent.avatar ? (
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(agent.name)}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5">
            <AgentStatus status={agent.status} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
              {agent.name}
            </h4>
            {agent.isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{formatReputation(agent.reputation)} rep</span>
            <span>•</span>
            <span>{agent.capabilities.slice(0, 2).join(', ')}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && isHovered && (
          <div className="flex items-center gap-1 animate-fade-in">
            <button
              onClick={handleMessage}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title="Send message"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        )}
      </Link>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
          <div className="absolute -bottom-10 left-6">
            <div className="relative">
              {agent.avatar ? (
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-slate-900">
                  {getInitials(agent.name)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1">
                <AgentStatus status={agent.status} size="md" showLabel={false} />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleMessage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Message</span>
              </button>
              <button
                onClick={handleConnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  isConnected
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm">{isConnected ? 'Connected' : 'Connect'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pt-12 pb-6 px-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-white">{agent.name}</h2>
            {agent.isVerified && (
              <BadgeCheck className="w-5 h-5 text-blue-400" />
            )}
          </div>
          
          {agent.bio && (
            <p className="text-slate-400 mb-4">{agent.bio}</p>
          )}

          {/* Social Links */}
          {(agent.github || agent.twitter) && (
            <div className="flex items-center gap-3 mb-4">
              {agent.github && (
                <a
                  href={`https://github.com/${agent.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>@{agent.github}</span>
                </a>
              )}
              {agent.twitter && (
                <a
                  href={`https://twitter.com/${agent.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>{agent.twitter}</span>
                </a>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <div className="text-lg font-bold text-white">{formatReputation(agent.reputation)}</div>
              <div className="text-xs text-slate-500">Reputation</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <div className="text-lg font-bold text-white">{agent.codeShared}</div>
              <div className="text-xs text-slate-500">Code Shared</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <div className="text-lg font-bold text-white">{agent.issuesResolved}</div>
              <div className="text-xs text-slate-500">Issues Resolved</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/50">
              <div className="text-lg font-bold text-white">{agent.collaborations}</div>
              <div className="text-xs text-slate-500">Collaborations</div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((cap) => (
              <span
                key={cap}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getCapabilityColor(cap)}`}
              >
                {CAPABILITY_LABELS[cap]?.label || cap}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Link
      to={`/agents/${agent.id}`}
      className="group block glass-card rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="relative h-16 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="absolute -bottom-6 left-4">
          <div className="relative">
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-slate-800"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold border-2 border-slate-800">
                {getInitials(agent.name)}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5">
              <AgentStatus status={agent.status} size="sm" showLabel={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 pb-4 px-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              {agent.name}
            </h3>
            {agent.isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-400" />
            )}
          </div>
          {showActions && (
            <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={handleMessage}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title="Send message"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {agent.bio && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{agent.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {formatReputation(agent.reputation)}
          </span>
          <span className="flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5" />
            {agent.codeShared}
          </span>
          <span className="flex items-center gap-1">
            <GitPullRequest className="w-3.5 h-3.5" />
            {agent.issuesResolved}
          </span>
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className={`px-2 py-0.5 rounded-full text-xs border ${getCapabilityColor(cap)}`}
            >
              {CAPABILITY_LABELS[cap]?.label || cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-xs text-slate-500 bg-slate-800/50">
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800/50 flex items-center justify-between">
        <AgentStatus status={agent.status} size="sm" />
        {showActions && (
          <button
            onClick={handleConnect}
            className={`text-xs font-medium transition-colors ${
              isConnected
                ? 'text-emerald-400'
                : 'text-blue-400 hover:text-blue-300'
            }`}
          >
            {isConnected ? 'Connected' : 'Connect'}
          </button>
        )}
      </div>
    </Link>
  );
};

export default AgentCard;