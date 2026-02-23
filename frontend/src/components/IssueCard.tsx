import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  Tag,
  CheckCircle2,
  Circle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import type { Issue, IssueStatus, IssuePriority } from '../types';
import BountyBadge from './BountyBadge';

interface IssueCardProps {
  issue: Issue;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onStatusChange?: (issueId: string, status: IssueStatus) => void;
  onAssign?: (issueId: string) => void;
}

const statusConfig: Record<IssueStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  open: {
    label: 'Open',
    icon: <Circle className="w-4 h-4" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  in_progress: {
    label: 'In Progress',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
  },
  resolved: {
    label: 'Resolved',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
  },
  closed: {
    label: 'Closed',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10 border-slate-500/20',
  },
};

const priorityConfig: Record<IssuePriority, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  low: {
    label: 'Low',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    icon: <div className="w-2 h-2 rounded-full bg-slate-400" />,
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    icon: <div className="w-2 h-2 rounded-full bg-blue-400" />,
  },
  high: {
    label: 'High',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    icon: <div className="w-2 h-2 rounded-full bg-orange-400" />,
  },
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  variant = 'default',
  showActions = true,
  onStatusChange,
  onAssign,
}) => {
  const status = statusConfig[issue.status];
  const priority = priorityConfig[issue.priority];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link
        to={`/issues/${issue.id}`}
        className="group flex items-center gap-3 p-3 rounded-xl glass-card hover:border-slate-600/50 transition-all duration-300"
      >
        {/* Status indicator */}
        <div className={`flex-shrink-0 ${status.color}`}>
          {status.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
            {issue.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>#{issue.id.slice(-4)}</span>
            <span>•</span>
            <span>{formatDate(issue.createdAt)}</span>
            {issue.comments.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {issue.comments.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bounty */}
        {parseFloat(issue.bounty.amount) > 0 && (
          <BountyBadge bounty={issue.bounty} size="sm" />
        )}
      </Link>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${status.bgColor} ${status.color}`}>
                  {status.icon}
                  {status.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${priority.bgColor} ${priority.color}`}>
                  {priority.icon}
                  {priority.label} Priority
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{issue.title}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Opened by {issue.author}</span>
                <span>{formatDate(issue.createdAt)}</span>
                {issue.language && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {issue.language}
                  </span>
                )}
              </div>
            </div>
            
            {/* Bounty */}
            {parseFloat(issue.bounty.amount) > 0 && (
              <BountyBadge bounty={issue.bounty} size="lg" showClaimed={true} />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-slate-800/50">
          <p className="text-slate-300 whitespace-pre-wrap">{issue.description}</p>
          
          {/* Tags */}
          {issue.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Tag className="w-4 h-4 text-slate-500" />
              {issue.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Assignee & Actions */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {issue.assignee ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                  {issue.assignee.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{issue.assignee}</p>
                  <p className="text-xs text-slate-500">Assigned</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onAssign?.(issue.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Circle className="w-4 h-4" />
                <span>Assign to me</span>
              </button>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {issue.status !== 'resolved' && (
                <button
                  onClick={() => onStatusChange?.(issue.id, 'resolved')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as resolved</span>
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Comment</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Link
      to={`/issues/${issue.id}`}
      className="group block glass-card rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className={`${status.color}`}>
              {status.icon}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${priority.bgColor} ${priority.color}`}>
              {priority.label}
            </span>
          </div>
          
          {parseFloat(issue.bounty.amount) > 0 && (
            <BountyBadge bounty={issue.bounty} size="sm" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {issue.title}
        </h3>

        {/* Description preview */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {issue.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>#{issue.id.slice(-6)}</span>
            <span>{formatDate(issue.createdAt)}</span>
            {issue.language && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800">
                {issue.language}
              </span>
            )}
          </div>
          
          {issue.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{issue.comments.length}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {issue.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400"
              >
                {tag}
              </span>
            ))}
            {issue.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs text-slate-500">
                +{issue.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Assignee bar */}
      {issue.assignee && (
        <div className="px-5 py-3 border-t border-slate-800/50 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
            {issue.assignee.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm text-slate-400">Assigned to {issue.assignee}</span>
        </div>
      )}
    </Link>
  );
};

export default IssueCard;
