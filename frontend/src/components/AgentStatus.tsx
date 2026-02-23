import React from 'react';
import type { Agent } from '../types';
import { getStatusColor } from '../hooks/useAgent';

interface AgentStatusProps {
  status: Agent['status'];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

const statusLabels: Record<Agent['status'], string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  away: 'Away',
};

const sizeClasses = {
  sm: {
    dot: 'w-2.5 h-2.5',
    label: 'text-xs',
    gap: 'gap-1.5',
  },
  md: {
    dot: 'w-3 h-3',
    label: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    dot: 'w-4 h-4',
    label: 'text-base',
    gap: 'gap-2.5',
  },
};

export const AgentStatus: React.FC<AgentStatusProps> = ({
  status,
  size = 'md',
  showLabel = true,
  pulse = true,
  className = '',
}) => {
  const statusColor = getStatusColor(status);
  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${classes.gap} ${className}`}>
      <span className="relative flex">
        <span
          className={`${classes.dot} rounded-full ${statusColor} ${
            pulse && status === 'online' ? 'animate-pulse' : ''
          }`}
        />
        {pulse && status === 'online' && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${statusColor} opacity-75 animate-ping`}
            style={{ animationDuration: '2s' }}
          />
        )}
      </span>
      {showLabel && (
        <span className={`${classes.label} font-medium text-slate-400`}>
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
};

// Specialized variants
export const AgentStatusBadge: React.FC<AgentStatusProps> = (props) => {
  const { status } = props;
  
  const bgColors: Record<Agent['status'], string> = {
    online: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    offline: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
    busy: 'bg-red-500/10 border-red-500/20 text-red-400',
    away: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bgColors[status]}`}>
      <AgentStatus {...props} showLabel={false} pulse={false} />
      <span className="text-sm font-medium">{statusLabels[status]}</span>
    </div>
  );
};

// Presence indicator for multiple users
interface PresenceIndicatorProps {
  agents: Array<{ id: string; name: string; status: Agent['status']; avatar?: string }>;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  agents,
  maxDisplay = 3,
  size = 'md',
  className = '',
}) => {
  const onlineAgents = agents.filter(a => a.status === 'online');
  const displayAgents = onlineAgents.slice(0, maxDisplay);
  const remainingCount = onlineAgents.length - maxDisplay;

  if (onlineAgents.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-slate-500 text-sm ${className}`}>
        <span className="w-2 h-2 rounded-full bg-slate-500" />
        <span>No one online</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {displayAgents.map((agent) => (
          <div
            key={agent.id}
            className={`relative ${sizeClasses[size]} rounded-full border-2 border-slate-900 overflow-hidden`}
            title={agent.name}
          >
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={`${sizeClasses[size]} rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-slate-400 font-medium`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      {onlineAgents.length === 1 ? (
        <span className="ml-3 text-sm text-slate-400">{onlineAgents[0].name} is online</span>
      ) : (
        <span className="ml-3 text-sm text-slate-400">
          {onlineAgents.length} agents online
        </span>
      )}
    </div>
  );
};

export default AgentStatus;