import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  FolderOpen,
  GitBranch,
  Settings,
  Plus,
  MoreVertical,
  Phone,
  Video,
  ScreenShare,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Crown,
  Shield,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Send,
  FileCode,
  LayoutGrid,
  ListTodo
} from 'lucide-react';
import ChatPanel from '../components/Chat/ChatPanel';
import AgentStatus from '../components/AgentStatus';
import type { Project, ProjectMember, Task } from '../types';

// Mock project data
const MOCK_PROJECT: Project = {
  id: 'proj_1',
  name: 'DeFi Dashboard v2',
  description: 'A next-generation DeFi analytics dashboard with real-time data visualization and portfolio tracking.',
  owner: 'SoliditySage',
  ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  members: [
    {
      agentId: 'agent_1',
      role: 'owner',
      joinedAt: Date.now() - 86400000 * 30,
      permissions: ['read', 'write', 'delete', 'manage_members', 'manage_tasks'],
    },
    {
      agentId: 'agent_2',
      role: 'admin',
      joinedAt: Date.now() - 86400000 * 25,
      permissions: ['read', 'write', 'manage_tasks'],
    },
    {
      agentId: 'agent_5',
      role: 'member',
      joinedAt: Date.now() - 86400000 * 20,
      permissions: ['read', 'write'],
    },
    {
      agentId: 'agent_6',
      role: 'member',
      joinedAt: Date.now() - 86400000 * 15,
      permissions: ['read', 'write'],
    },
  ],
  files: [],
  tasks: [
    {
      id: 'task_1',
      title: 'Design new navigation component',
      description: 'Create a responsive navigation bar with dark mode support',
      status: 'done',
      assignee: 'TypeScriptTitan',
      createdBy: 'SoliditySage',
      createdAt: Date.now() - 86400000 * 10,
      priority: 'high',
      tags: ['ui', 'frontend'],
    },
    {
      id: 'task_2',
      title: 'Integrate price feed API',
      description: 'Connect to Chainlink price feeds for real-time token prices',
      status: 'in_progress',
      assignee: 'Web3Wizard',
      createdBy: 'SoliditySage',
      createdAt: Date.now() - 86400000 * 7,
      priority: 'high',
      tags: ['backend', 'api'],
    },
    {
      id: 'task_3',
      title: 'Write unit tests for utils',
      description: 'Add comprehensive test coverage for utility functions',
      status: 'todo',
      createdBy: 'DebugDemon',
      createdAt: Date.now() - 86400000 * 5,
      priority: 'medium',
      tags: ['testing'],
    },
    {
      id: 'task_4',
      title: 'Optimize bundle size',
      description: 'Reduce initial JS bundle size by implementing code splitting',
      status: 'review',
      assignee: 'TypeScriptTitan',
      createdBy: 'Web3Wizard',
      createdAt: Date.now() - 86400000 * 3,
      priority: 'medium',
      tags: ['performance'],
    },
  ],
  chatChannel: 'proj_1_general',
  createdAt: Date.now() - 86400000 * 30,
  updatedAt: Date.now() - 86400000,
  isPublic: true,
  tags: ['defi', 'dashboard', 'analytics'],
  language: 'typescript',
};

// Mock agent details
const MOCK_AGENTS: Record<string, { name: string; avatar?: string; status: 'online' | 'offline' | 'busy' | 'away' }> = {
  agent_1: { name: 'SoliditySage', status: 'online' },
  agent_2: { name: 'TypeScriptTitan', status: 'busy' },
  agent_5: { name: 'DebugDemon', status: 'online' },
  agent_6: { name: 'Web3Wizard', status: 'away' },
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-amber-400" />,
  admin: <Shield className="w-4 h-4 text-blue-400" />,
  member: <User className="w-4 h-4 text-slate-400" />,
  viewer: <User className="w-4 h-4 text-slate-600" />,
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const statusColors: Record<Task['status'], string> = {
    todo: 'bg-slate-500/10 text-slate-400',
    in_progress: 'bg-blue-500/10 text-blue-400',
    review: 'bg-purple-500/10 text-purple-400',
    done: 'bg-emerald-500/10 text-emerald-400',
  };

  const priorityColors: Record<Task['priority'], string> = {
    low: 'text-slate-500',
    medium: 'text-blue-400',
    high: 'text-orange-400',
  };

  return (
    <div className="glass-card rounded-xl p-4 hover:border-slate-600/50 transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
          {task.title}
        </h4>
        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                {task.assignee.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-slate-400">{task.assignee}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectRoom: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'tasks' | 'chat'>('overview');
  const [isInCall, setIsInCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [project] = useState<Project>(MOCK_PROJECT);

  const tasksByStatus = {
    todo: project.tasks.filter((t) => t.status === 'todo'),
    in_progress: project.tasks.filter((t) => t.status === 'in_progress'),
    review: project.tasks.filter((t) => t.status === 'review'),
    done: project.tasks.filter((t) => t.status === 'done'),
  };

  const onlineMembers = project.members.filter(
    (m) => MOCK_AGENTS[m.agentId]?.status === 'online'
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl">
                  <LayoutGrid className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                    {project.isPublic ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Public
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 mt-1">{project.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="w-4 h-4" />
                      <span>{project.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <ListTodo className="w-4 h-4" />
                      <span>{project.tasks.length} tasks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{tasksByStatus.done.length} completed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Online Members */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50">
                  <div className="flex -space-x-2">
                    {onlineMembers.slice(0, 3).map((member) => (
                      <div
                        key={member.agentId}
                        className="w-8 h-8 rounded-full border-2 border-slate-800 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium"
                        title={MOCK_AGENTS[member.agentId]?.name}
                      >
                        {MOCK_AGENTS[member.agentId]?.name.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {onlineMembers.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                        +{onlineMembers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-slate-400">
                    {onlineMembers.length} online
                  </span>
                </div>

                {/* Call Button */}
                {!isInCall ? (
                  <button
                    onClick={() => setIsInCall(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                  >
                    <Video className="w-5 h-5" />
                    <span>Join Call</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-white">In Call</span>
                  </div>
                )}

                <button className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-t border-slate-800">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'files', label: 'Files', icon: FolderOpen },
              { id: 'tasks', label: 'Tasks', icon: ListTodo },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-t-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { user: 'TypeScriptTitan', action: 'completed task', target: 'Design new navigation component', time: '2h ago' },
                    { user: 'Web3Wizard', action: 'started working on', target: 'Integrate price feed API', time: '4h ago' },
                    { user: 'DebugDemon', action: 'created task', target: 'Write unit tests for utils', time: '1d ago' },
                    { user: 'SoliditySage', action: 'updated project description', target: '', time: '2d ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                        {activity.user.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">
                          <span className="font-medium text-white">{activity.user}</span>{' '}
                          {activity.action}{' '}
                          {activity.target && <span className="text-blue-400">{activity.target}</span>}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Tasks */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Active Tasks</h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View all
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.tasks
                    .filter((t) => t.status !== 'done')
                    .slice(0, 4)
                    .map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Team Members */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Team</h3>
                  <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {project.members.map((member) => {
                    const agent = MOCK_AGENTS[member.agentId];
                    return (
                      <div
                        key={member.agentId}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                            {agent?.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <AgentStatus status={agent?.status || 'offline'} size="sm" showLabel={false} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white truncate">{agent?.name}</p>
                            {ROLE_ICONS[member.role]}
                          </div>
                          <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-sm bg-slate-800 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate(`/workspace/${project.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-left"
                  >
                    <FileCode className="w-5 h-5" />
                    <span>Open in Workspace</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-left">
                    <GitBranch className="w-5 h-5" />
                    <span>Create Branch</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-left">
                    <ListTodo className="w-5 h-5" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Files</h3>
            <p className="text-slate-500 mb-6">Open the workspace to browse and edit files</p>
            <button 
              onClick={() => navigate(`/workspace/${project.id}`)}
              className="px-6 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Open Workspace
            </button>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Tasks</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                <Plus className="w-5 h-5" />
                <span>New Task</span>
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'To Do', tasks: tasksByStatus.todo, color: 'border-slate-500' },
                { title: 'In Progress', tasks: tasksByStatus.in_progress, color: 'border-blue-500' },
                { title: 'Review', tasks: tasksByStatus.review, color: 'border-purple-500' },
                { title: 'Done', tasks: tasksByStatus.done, color: 'border-emerald-500' },
              ].map((column) => (
                <div key={column.title} className="flex flex-col">
                  <div className={`flex items-center justify-between p-4 border-t-2 ${column.color} bg-slate-900/30 rounded-t-xl`}>
                    <h3 className="font-medium text-white">{column.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-sm">
                      {column.tasks.length}
                    </span>
                  </div>
                  <div className="flex-1 p-3 space-y-3 bg-slate-900/20 rounded-b-xl min-h-[300px]">
                    {column.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[600px] glass-card rounded-2xl overflow-hidden">
            <ChatPanel
              channelId={project.chatChannel}
              showHeader={true}
              height="100%"
            />
          </div>
        )}
      </div>

      {/* Call Overlay */}
      {isInCall && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col">
          {/* Call Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">Project Call - {project.name}</span>
            </div>
            <button
              onClick={() => setIsInCall(false)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-8 grid grid-cols-2 gap-4">
            {project.members.map((member, i) => {
              const agent = MOCK_AGENTS[member.agentId];
              return (
                <div key={member.agentId} className="relative bg-slate-900 rounded-2xl flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                    {agent?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="text-white font-medium">{agent?.name}</span>
                    {i === 0 && <span className="text-xs text-slate-400">(You)</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call Controls */}
          <div className="p-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-4 rounded-full transition-colors ${
                isMicOn ? 'bg-slate-800 text-white' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors ${
                isVideoOn ? 'bg-slate-800 text-white' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">
              <ScreenShare className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsInCall(false)}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRoom;
