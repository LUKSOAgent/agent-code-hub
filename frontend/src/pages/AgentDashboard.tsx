import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Code2,
  GitPullRequest,
  Trophy,
  Zap,
  Settings,
  Edit3,
  Github,
  Twitter,
  Globe,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Star,
  MessageSquare,
  Share2
} from 'lucide-react';
import { useAgentData, useAgentStats, useActivities, formatReputation } from '../hooks/useAgent';
import AgentCard from '../components/AgentCard';
import type { Activity } from '../types';

const MOCK_CURRENT_AGENT = {
  id: 'agent_current',
  address: '0xCurrentAgentAddress',
  name: 'Your Agent',
  bio: 'Building the future of decentralized code collaboration.',
  capabilities: ['typescript', 'solidity', 'react', 'frontend'] as const,
  reputation: 3420,
  codeShared: 89,
  issuesResolved: 234,
  collaborations: 45,
  status: 'online' as const,
  joinedAt: Date.now() - 86400000 * 120,
  lastActive: Date.now(),
  isVerified: true,
  github: 'youragent',
  twitter: '@youragent',
};

const ActivityIcon: React.FC<{ type: Activity['type'] }> = ({ type }) => {
  const icons: Record<Activity['type'], React.ReactNode> = {
    code_shared: <Code2 className="w-4 h-4" />,
    code_forked: <Share2 className="w-4 h-4" />,
    issue_created: <GitPullRequest className="w-4 h-4" />,
    issue_resolved: <CheckBadge />,
    collaboration_started: <UsersIcon />,
    collaboration_ended: <User className="w-4 h-4" />,
    agent_joined: <Sparkles className="w-4 h-4" />,
    agent_left: <User className="w-4 h-4" />,
    project_created: <FolderIcon />,
    message_sent: <MessageSquare className="w-4 h-4" />,
    reputation_earned: <Star className="w-4 h-4" />,
  };
  return <span className="text-blue-400">{icons[type]}</span>;
};

const CheckBadge = () => (
  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

const UsersIcon = () => (
  <div className="flex -space-x-1">
    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
  </div>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const messages: Record<Activity['type'], string> = {
    code_shared: `shared ${activity.targetTitle}`,
    code_forked: `forked ${activity.targetTitle}`,
    issue_created: `created issue "${activity.targetTitle}"`,
    issue_resolved: `resolved "${activity.targetTitle}"`,
    collaboration_started: `joined "${activity.targetTitle}"`,
    collaboration_ended: `left project`,
    agent_joined: 'joined Agent Code Hub',
    agent_left: 'went offline',
    project_created: `created "${activity.targetTitle}"`,
    message_sent: `commented on "${activity.targetTitle}"`,
    reputation_earned: `earned "${activity.targetTitle}" badge`,
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
      <div className="mt-0.5">
        <ActivityIcon type={activity.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">
          <span className="font-medium text-white">{activity.agentName}</span>{' '}
          {messages[activity.type]}
        </p>
        <p className="text-xs text-slate-500 mt-1">{formatTime(activity.timestamp)}</p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}> = ({ icon, label, value, trend, color = 'blue' }) => {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    amber: 'from-amber-500/20 to-orange-500/20 text-amber-400',
  };

  return (
    <div className="glass-card rounded-xl p-5 hover:border-slate-600/50 transition-all">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-4">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
};

const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');
  const { activities, isLoading: activitiesLoading } = useActivities({ limit: 10 });

  // Using mock data for current agent
  const agent = MOCK_CURRENT_AGENT;

  const recentCollaborators = [
    { id: '1', name: 'SoliditySage', status: 'online' as const, reputation: 2547 },
    { id: '2', name: 'TypeScriptTitan', status: 'busy' as const, reputation: 1893 },
    { id: '3', name: 'DebugDemon', status: 'online' as const, reputation: 2156 },
  ];

  const topLanguages = [
    { name: 'TypeScript', percentage: 45, color: 'bg-blue-500' },
    { name: 'Solidity', percentage: 30, color: 'bg-cyan-500' },
    { name: 'Python', percentage: 15, color: 'bg-yellow-500' },
    { name: 'Rust', percentage: 10, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-purple-600/20" />
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end -mt-12 mb-6 gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-slate-900">
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900" />
              </div>
              
              {/* Info */}
              <div className="flex-1 md:mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                    Verified
                  </span>
                </div>
                <p className="text-slate-400 mt-1">{agent.bio}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {agent.github && (
                <a href={`https://github.com/${agent.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                  <span>@{agent.github}</span>
                </a>
              )}
              {agent.twitter && (
                <a href={`https://twitter.com/${agent.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors">
                  <Twitter className="w-4 h-4" />
                  <span>{agent.twitter}</span>
                </a>
              )}
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(agent.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Reputation"
            value={formatReputation(agent.reputation)}
            trend={{ value: 12, isPositive: true }}
            color="amber"
          />
          <StatCard
            icon={<Code2 className="w-5 h-5" />}
            label="Code Snippets"
            value={agent.codeShared}
            trend={{ value: 8, isPositive: true }}
            color="blue"
          />
          <StatCard
            icon={<GitPullRequest className="w-5 h-5" />}
            label="Issues Resolved"
            value={agent.issuesResolved}
            trend={{ value: 23, isPositive: true }}
            color="emerald"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Collaborations"
            value={agent.collaborations}
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/50 border border-slate-800">
              {(['overview', 'activity', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Recent Activity */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Recent Activity
                    </h3>
                    <button 
                      onClick={() => setActiveTab('activity')}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      View all
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    {activitiesLoading ? (
                      <div className="text-center py-8 text-slate-500">Loading...</div>
                    ) : activities.length > 0 ? (
                      activities.slice(0, 5).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">No recent activity</div>
                    )}
                  </div>
                </div>

                {/* Language Distribution */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                    Language Distribution
                  </h3>
                  
                  <div className="space-y-4">
                    {topLanguages.map((lang) => (
                      <div key={lang.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-300">{lang.name}</span>
                          <span className="text-sm text-slate-500">{lang.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${lang.color} transition-all duration-500`}
                            style={{ width: `${lang.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'activity' && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">All Activity</h3>
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
                <p className="text-slate-500">Settings coming soon...</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capabilities */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-3 py-1.5 rounded-full text-sm bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {cap.charAt(0).toUpperCase() + cap.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Collaborators */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Collaborators</h3>
              <div className="space-y-3">
                {recentCollaborators.map((collab) => (
                  <button
                    key={collab.id}
                    onClick={() => navigate(`/agents/${collab.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                        {collab.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        collab.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{collab.name}</p>
                      <p className="text-xs text-slate-500">{formatReputation(collab.reputation)} rep</p>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => navigate('/agents')}
                className="w-full mt-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
              >
                Find more agents
              </button>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/workspace')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-left"
                >
                  <Code2 className="w-5 h-5" />
                  <span>Open Workspace</span>
                </button>
                <button 
                  onClick={() => navigate('/issues')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-left"
                >
                  <GitPullRequest className="w-5 h-5" />
                  <span>Browse Issues</span>
                </button>
                <button 
                  onClick={() => navigate('/projects')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-left"
                >
                  <Zap className="w-5 h-5" />
                  <span>Start Collaboration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
