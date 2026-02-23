import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { 
  Agent, 
  AgentStatus, 
  Activity, 
  Presence, 
  WebSocketEvent,
  ChatMessage,
  ChatChannel
} from '../types';

// ============================================================================
// State Types
// ============================================================================

interface AgentState {
  // Current user
  currentAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  
  // All agents
  agents: Map<string, Agent>;
  onlineAgents: Set<string>;
  
  // Activities
  activities: Activity[];
  
  // Presence
  presence: Map<string, Presence>;
  
  // Chat
  channels: Map<string, ChatChannel>;
  messages: Map<string, ChatMessage[]>;
  activeChannel: string | null;
  typingUsers: Map<string, Set<string>>;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

// ============================================================================
// Context Type
// ============================================================================

interface AgentContextType extends AgentState {
  // Agent actions
  setCurrentAgent: (agent: Agent | null) => void;
  updateAgentStatus: (status: AgentStatus) => void;
  updateAgentProfile: (updates: Partial<Agent>) => void;
  
  // Agent interactions
  connectWithAgent: (agentId: string) => Promise<void>;
  disconnectFromAgent: (agentId: string) => void;
  isConnectedWith: (agentId: string) => boolean;
  
  // Activities
  addActivity: (activity: Activity) => void;
  clearActivities: () => void;
  
  // Presence
  updatePresence: (presence: Presence) => void;
  removePresence: (agentId: string) => void;
  getPresence: (agentId: string) => Presence | undefined;
  
  // Chat
  setActiveChannel: (channelId: string | null) => void;
  addMessage: (channelId: string, message: ChatMessage) => void;
  updateMessage: (channelId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  addChannel: (channel: ChatChannel) => void;
  markChannelAsRead: (channelId: string) => void;
  setTyping: (channelId: string, userId: string, isTyping: boolean) => void;
  isTyping: (channelId: string, userId: string) => boolean;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  dismissNotification: (notificationId: string) => void;
  
  // WebSocket events
  handleWebSocketEvent: (event: WebSocketEvent) => void;
}

// ============================================================================
// Context Creation
// ============================================================================

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  
  // State refs for stable callbacks
  const stateRef = useRef<AgentState>({
    currentAgent: null,
    isLoading: false,
    error: null,
    agents: new Map(),
    onlineAgents: new Set(),
    activities: [],
    presence: new Map(),
    channels: new Map(),
    messages: new Map(),
    activeChannel: null,
    typingUsers: new Map(),
    notifications: [],
    unreadCount: 0,
  });
  
  // Force re-render helper
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  
  // Helper to update state and trigger re-render
  const updateState = useCallback((updates: Partial<AgentState>) => {
    stateRef.current = { ...stateRef.current, ...updates };
    forceUpdate();
  }, []);
  
  // ============================================================================
  // Agent Actions
  // ============================================================================
  
  const setCurrentAgent = useCallback((agent: Agent | null) => {
    updateState({ currentAgent: agent });
  }, [updateState]);
  
  const updateAgentStatus = useCallback((status: AgentStatus) => {
    if (stateRef.current.currentAgent) {
      const updatedAgent = { ...stateRef.current.currentAgent, status };
      updateState({ currentAgent: updatedAgent });
    }
  }, [updateState]);
  
  const updateAgentProfile = useCallback((updates: Partial<Agent>) => {
    if (stateRef.current.currentAgent) {
      const updatedAgent = { ...stateRef.current.currentAgent, ...updates };
      updateState({ currentAgent: updatedAgent });
    }
  }, [updateState]);
  
  // ============================================================================
  // Agent Interactions
  // ============================================================================
  
  const connectWithAgent = useCallback(async (agentId: string) => {
    // TODO: Implement API call
    console.log('Connecting with agent:', agentId);
  }, []);
  
  const disconnectFromAgent = useCallback((agentId: string) => {
    // TODO: Implement API call
    console.log('Disconnecting from agent:', agentId);
  }, []);
  
  const isConnectedWith = useCallback((agentId: string): boolean => {
    // TODO: Implement connection check
    return false;
  }, []);
  
  // ============================================================================
  // Activities
  // ============================================================================
  
  const addActivity = useCallback((activity: Activity) => {
    const newActivities = [activity, ...stateRef.current.activities].slice(0, 100);
    updateState({ activities: newActivities });
  }, [updateState]);
  
  const clearActivities = useCallback(() => {
    updateState({ activities: [] });
  }, [updateState]);
  
  // ============================================================================
  // Presence
  // ============================================================================
  
  const updatePresence = useCallback((presence: Presence) => {
    const newPresence = new Map(stateRef.current.presence);
    newPresence.set(presence.agentId, presence);
    
    const newOnlineAgents = new Set(stateRef.current.onlineAgents);
    if (presence.status === 'online') {
      newOnlineAgents.add(presence.agentId);
    } else {
      newOnlineAgents.delete(presence.agentId);
    }
    
    updateState({ presence: newPresence, onlineAgents: newOnlineAgents });
  }, [updateState]);
  
  const removePresence = useCallback((agentId: string) => {
    const newPresence = new Map(stateRef.current.presence);
    newPresence.delete(agentId);
    
    const newOnlineAgents = new Set(stateRef.current.onlineAgents);
    newOnlineAgents.delete(agentId);
    
    updateState({ presence: newPresence, onlineAgents: newOnlineAgents });
  }, [updateState]);
  
  const getPresence = useCallback((agentId: string): Presence | undefined => {
    return stateRef.current.presence.get(agentId);
  }, []);
  
  // ============================================================================
  // Chat
  // ============================================================================
  
  const setActiveChannel = useCallback((channelId: string | null) => {
    updateState({ activeChannel: channelId });
    
    // Mark channel as read
    if (channelId) {
      const channel = stateRef.current.channels.get(channelId);
      if (channel) {
        const updatedChannel = { ...channel, unreadCount: 0 };
        const newChannels = new Map(stateRef.current.channels);
        newChannels.set(channelId, updatedChannel);
        updateState({ channels: newChannels });
      }
    }
  }, [updateState]);
  
  const addMessage = useCallback((channelId: string, message: ChatMessage) => {
    const newMessages = new Map(stateRef.current.messages);
    const channelMessages = newMessages.get(channelId) || [];
    newMessages.set(channelId, [...channelMessages, message]);
    
    // Update channel's last message time
    const newChannels = new Map(stateRef.current.channels);
    const channel = newChannels.get(channelId);
    if (channel) {
      newChannels.set(channelId, { 
        ...channel, 
        lastMessageAt: message.timestamp,
        unreadCount: stateRef.current.activeChannel === channelId ? 0 : (channel.unreadCount + 1)
      });
    }
    
    // Calculate total unread
    const unreadCount = Array.from(newChannels.values()).reduce((sum, ch) => sum + ch.unreadCount, 0);
    
    updateState({ messages: newMessages, channels: newChannels, unreadCount });
  }, [updateState]);
  
  const updateMessage = useCallback((channelId: string, messageId: string, updates: Partial<ChatMessage>) => {
    const newMessages = new Map(stateRef.current.messages);
    const channelMessages = newMessages.get(channelId) || [];
    const messageIndex = channelMessages.findIndex(m => m.id === messageId);
    
    if (messageIndex >= 0) {
      channelMessages[messageIndex] = { ...channelMessages[messageIndex], ...updates };
      newMessages.set(channelId, [...channelMessages]);
      updateState({ messages: newMessages });
    }
  }, [updateState]);
  
  const deleteMessage = useCallback((channelId: string, messageId: string) => {
    const newMessages = new Map(stateRef.current.messages);
    const channelMessages = newMessages.get(channelId) || [];
    newMessages.set(channelId, channelMessages.filter(m => m.id !== messageId));
    updateState({ messages: newMessages });
  }, [updateState]);
  
  const addChannel = useCallback((channel: ChatChannel) => {
    const newChannels = new Map(stateRef.current.channels);
    newChannels.set(channel.id, channel);
    updateState({ channels: newChannels });
  }, [updateState]);
  
  const markChannelAsRead = useCallback((channelId: string) => {
    const newChannels = new Map(stateRef.current.channels);
    const channel = newChannels.get(channelId);
    if (channel) {
      newChannels.set(channelId, { ...channel, unreadCount: 0 });
      const unreadCount = Array.from(newChannels.values()).reduce((sum, ch) => sum + ch.unreadCount, 0);
      updateState({ channels: newChannels, unreadCount });
    }
  }, [updateState]);
  
  const setTyping = useCallback((channelId: string, userId: string, isTyping: boolean) => {
    const newTypingUsers = new Map(stateRef.current.typingUsers);
    const channelTypers = newTypingUsers.get(channelId) || new Set();
    
    if (isTyping) {
      channelTypers.add(userId);
    } else {
      channelTypers.delete(userId);
    }
    
    newTypingUsers.set(channelId, channelTypers);
    updateState({ typingUsers: newTypingUsers });
  }, [updateState]);
  
  const isTyping = useCallback((channelId: string, userId: string): boolean => {
    return stateRef.current.typingUsers.get(channelId)?.has(userId) || false;
  }, []);
  
  // ============================================================================
  // Notifications
  // ============================================================================
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };
    
    const newNotifications = [newNotification, ...stateRef.current.notifications].slice(0, 50);
    const unreadCount = newNotifications.filter(n => !n.read).length;
    
    updateState({ notifications: newNotifications, unreadCount });
  }, [updateState]);
  
  const markNotificationAsRead = useCallback((notificationId: string) => {
    const newNotifications = stateRef.current.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    const unreadCount = newNotifications.filter(n => !n.read).length;
    updateState({ notifications: newNotifications, unreadCount });
  }, [updateState]);
  
  const dismissNotification = useCallback((notificationId: string) => {
    const newNotifications = stateRef.current.notifications.filter(n => n.id !== notificationId);
    const unreadCount = newNotifications.filter(n => !n.read).length;
    updateState({ notifications: newNotifications, unreadCount });
  }, [updateState]);
  
  const clearNotifications = useCallback(() => {
    updateState({ notifications: [], unreadCount: 0 });
  }, [updateState]);
  
  // ============================================================================
  // WebSocket Event Handler
  // ============================================================================
  
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    switch (event.type) {
      case 'agent_joined':
        addActivity({
          id: `act_${Date.now()}`,
          type: 'agent_joined',
          agentId: event.sender,
          agentName: event.payload.agentName,
          agentAvatar: event.payload.agentAvatar,
          timestamp: event.timestamp,
        });
        addNotification({
          type: 'info',
          title: 'Agent Joined',
          message: `${event.payload.agentName} is now online`,
        });
        break;
        
      case 'agent_left':
        removePresence(event.sender);
        addActivity({
          id: `act_${Date.now()}`,
          type: 'agent_left',
          agentId: event.sender,
          agentName: event.payload.agentName,
          timestamp: event.timestamp,
        });
        break;
        
      case 'agent_status_changed':
        updatePresence({
          agentId: event.sender,
          agentName: event.payload.agentName,
          status: event.payload.status,
          lastSeen: Date.now(),
        });
        break;
        
      case 'code_shared':
        addActivity({
          id: `act_${Date.now()}`,
          type: 'code_shared',
          agentId: event.sender,
          agentName: event.payload.agentName,
          targetId: event.payload.codeId,
          targetTitle: event.payload.codeTitle,
          timestamp: event.timestamp,
        });
        addNotification({
          type: 'info',
          title: 'New Code Shared',
          message: `${event.payload.agentName} shared "${event.payload.codeTitle}"`,
          action: {
            label: 'View',
            handler: () => window.location.href = `/code/${event.payload.codeId}`,
          },
        });
        break;
        
      case 'message_received':
        addMessage(event.payload.channelId, event.payload.message);
        if (stateRef.current.activeChannel !== event.payload.channelId) {
          addNotification({
            type: 'info',
            title: 'New Message',
            message: `${event.payload.message.author}: ${event.payload.message.content.substring(0, 50)}...`,
          });
        }
        break;
        
      case 'presence_update':
        updatePresence(event.payload);
        break;
        
      case 'cursor_moved':
      case 'selection_changed':
        updatePresence({
          agentId: event.sender,
          agentName: event.payload.agentName,
          status: 'online',
          currentFile: event.payload.fileId,
          cursorPosition: event.payload.position,
          selection: event.payload.selection,
          lastSeen: Date.now(),
        });
        break;
        
      case 'typing_started':
        setTyping(event.payload.channelId, event.sender, true);
        break;
        
      case 'typing_stopped':
        setTyping(event.payload.channelId, event.sender, false);
        break;
        
      case 'issue_created':
        addActivity({
          id: `act_${Date.now()}`,
          type: 'issue_created',
          agentId: event.sender,
          agentName: event.payload.agentName,
          targetId: event.payload.issueId,
          targetTitle: event.payload.issueTitle,
          timestamp: event.timestamp,
        });
        break;
        
      case 'issue_resolved':
        addActivity({
          id: `act_${Date.now()}`,
          type: 'issue_resolved',
          agentId: event.sender,
          agentName: event.payload.agentName,
          targetId: event.payload.issueId,
          targetTitle: event.payload.issueTitle,
          timestamp: event.timestamp,
        });
        addNotification({
          type: 'success',
          title: 'Issue Resolved',
          message: `${event.payload.agentName} resolved "${event.payload.issueTitle}"`,
        });
        break;
        
      case 'error':
        addNotification({
          type: 'error',
          title: 'Error',
          message: event.payload.message,
        });
        break;
    }
  }, [addActivity, addMessage, addNotification, removePresence, setTyping, updatePresence]);
  
  // ============================================================================
  // Load current agent on mount
  // ============================================================================
  
  useEffect(() => {
    if (address && !stateRef.current.currentAgent) {
      // TODO: Fetch agent data from API
      // For now, create a mock agent
      const mockAgent: Agent = {
        id: `agent_${address}`,
        address,
        name: `Agent ${address.slice(0, 6)}`,
        capabilities: ['solidity', 'typescript', 'debugging'],
        reputation: 100,
        codeShared: 5,
        issuesResolved: 3,
        collaborations: 2,
        status: 'online',
        joinedAt: Date.now(),
        lastActive: Date.now(),
        isVerified: false,
      };
      setCurrentAgent(mockAgent);
    }
  }, [address, setCurrentAgent]);
  
  // ============================================================================
  // Context Value
  // ============================================================================
  
  const contextValue: AgentContextType = {
    ...stateRef.current,
    setCurrentAgent,
    updateAgentStatus,
    updateAgentProfile,
    connectWithAgent,
    disconnectFromAgent,
    isConnectedWith,
    addActivity,
    clearActivities,
    updatePresence,
    removePresence,
    getPresence,
    setActiveChannel,
    addMessage,
    updateMessage,
    deleteMessage,
    addChannel,
    markChannelAsRead,
    setTyping,
    isTyping,
    addNotification,
    markNotificationAsRead,
    dismissNotification,
    clearNotifications,
    handleWebSocketEvent,
  };
  
  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

export default AgentContext;