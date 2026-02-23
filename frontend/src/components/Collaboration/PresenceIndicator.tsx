import React from 'react';
import { useAgent } from '../../contexts/AgentContext';
import type { Presence } from '../../types';

interface PresenceIndicatorProps {
  fileId?: string;
  showCurrentFile?: boolean;
  maxDisplay?: number;
  className?: string;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  fileId,
  showCurrentFile = false,
  maxDisplay = 5,
  className = '',
}) => {
  const { presence, currentAgent } = useAgent();

  // Filter presence by file if specified
  const filteredPresence = fileId
    ? Array.from(presence.values()).filter((p) => p.currentFile === fileId)
    : Array.from(presence.values());

  // Exclude current agent
  const otherPresence = filteredPresence.filter((p) => p.agentId !== currentAgent?.id);

  if (otherPresence.length === 0) {
    return (
      <div className={`text-sm text-slate-500 ${className}`}>
        No one else is viewing
      </div>
    );
  }

  const displayPresence = otherPresence.slice(0, maxDisplay);
  const remainingCount = otherPresence.length - maxDisplay;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {displayPresence.map((p) => (
          <PresenceAvatar
            key={p.agentId}
            presence={p}
            color={getAgentColor(p.agentId)}
          />
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400 font-medium">
            +{remainingCount}
          </div>
        )}
      </div>
      
      <div className="ml-3 text-sm text-slate-400">
        {displayPresence.length === 1 ? (
          <span>
            <span className="text-white font-medium">{displayPresence[0].agentName}</span>
            {showCurrentFile && displayPresence[0].currentFile && (
              <span> is viewing <span className="text-slate-300">{displayPresence[0].currentFile}</span></span>
            )}
            {!showCurrentFile && ' is viewing'}
          </span>
        ) : (
          <span>
            <span className="text-white font-medium">{otherPresence.length} agents</span> are viewing
          </span>
        )}
      </div>
    </div>
  );
};

// Individual presence avatar
interface PresenceAvatarProps {
  presence: Presence;
  color: string;
}

const PresenceAvatar: React.FC<PresenceAvatarProps> = ({ presence, color }) => {
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <div
      className="relative w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden"
      title={`${presence.agentName}${presence.currentFile ? ` - viewing ${presence.currentFile}` : ''}`}
      style={{ backgroundColor: color }}
    >
      {presence.agentAvatar ? (
        <img
          src={presence.agentAvatar}
          alt={presence.agentName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
          {getInitials(presence.agentName)}
        </div>
      )}
      
      {/* Online indicator */}
      <div
        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

// Generate consistent color for agent
const getAgentColor = (agentId: string): string => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#14b8a6', // teal
  ];
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Compact presence indicator (just avatars)
interface CompactPresenceIndicatorProps {
  fileId?: string;
  maxDisplay?: number;
  className?: string;
}

export const CompactPresenceIndicator: React.FC<CompactPresenceIndicatorProps> = ({
  fileId,
  maxDisplay = 3,
  className = '',
}) => {
  const { presence, currentAgent } = useAgent();

  const filteredPresence = fileId
    ? Array.from(presence.values()).filter((p) => p.currentFile === fileId)
    : Array.from(presence.values());

  const otherPresence = filteredPresence.filter((p) => p.agentId !== currentAgent?.id);

  if (otherPresence.length === 0) return null;

  const displayPresence = otherPresence.slice(0, maxDisplay);
  const remainingCount = otherPresence.length - maxDisplay;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-1.5">
        {displayPresence.map((p) => (
          <div
            key={p.agentId}
            className="w-6 h-6 rounded-full border border-slate-900 overflow-hidden"
            title={p.agentName}
            style={{ backgroundColor: getAgentColor(p.agentId) }}
          >
            {p.agentAvatar ? (
              <img src={p.agentAvatar} alt={p.agentName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-semibold">
                {p.agentName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px] text-slate-400 font-medium">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};

// Full presence list
interface PresenceListProps {
  fileId?: string;
  className?: string;
}

export const PresenceList: React.FC<PresenceListProps> = ({
  fileId,
  className = '',
}) => {
  const { presence, currentAgent } = useAgent();

  const filteredPresence = fileId
    ? Array.from(presence.values()).filter((p) => p.currentFile === fileId)
    : Array.from(presence.values());

  const otherPresence = filteredPresence.filter((p) => p.agentId !== currentAgent?.id);

  return (
    <div className={`space-y-2 ${className}`}>
      {otherPresence.map((p) => (
        <div
          key={p.agentId}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-full overflow-hidden"
            style={{ backgroundColor: getAgentColor(p.agentId) }}
          >
            {p.agentAvatar ? (
              <img src={p.agentAvatar} alt={p.agentName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                {p.agentName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{p.agentName}</p>
            {p.currentFile && (
              <p className="text-xs text-slate-500 truncate">Viewing: {p.currentFile}</p>
            )}
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getAgentColor(p.agentId) }}
          />
        </div>
      ))}
      {otherPresence.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No one else is viewing</p>
      )}
    </div>
  );
};

export default PresenceIndicator;