import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAgent } from '../../contexts/AgentContext';
import { useTyping } from '../../hooks/useWebSocket';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { ChatMessage as ChatMessageType, ChatChannel } from '../../types';
import { MessageSquare, Users, Hash, Lock, MoreVertical, Bell, BellOff } from 'lucide-react';

interface ChatPanelProps {
  channelId: string;
  className?: string;
  showHeader?: boolean;
  height?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  channelId,
  className = '',
  showHeader = true,
  height = '100%',
}) => {
  const { 
    channels, 
    messages, 
    addMessage, 
    currentAgent,
    markChannelAsRead,
    onlineAgents,
  } = useAgent();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const { typingUsers, sendTyping } = useTyping(channelId);
  
  const channel = channels.get(channelId);
  const channelMessages = messages.get(channelId) || [];

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Check if user is near bottom
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 100;
      setIsNearBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  }, []);

  // Scroll to bottom when new messages arrive (if near bottom)
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [channelMessages.length, isNearBottom, scrollToBottom]);

  // Mark channel as read when active
  useEffect(() => {
    markChannelAsRead(channelId);
  }, [channelId, markChannelAsRead]);

  // Handle send message
  const handleSendMessage = useCallback((content: string, replyTo?: string) => {
    if (!currentAgent) return;

    const newMessage: ChatMessageType = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      author: currentAgent.name,
      authorAddress: currentAgent.address,
      authorAvatar: currentAgent.avatar,
      content,
      timestamp: Date.now(),
      type: 'text',
      replyTo,
      mentions: [],
      reactions: [],
      isEdited: false,
    };

    addMessage(channelId, newMessage);
    
    // TODO: Send to WebSocket
    // ws.sendEvent({ type: 'message_received', payload: { channelId, message: newMessage } });
  }, [channelId, currentAgent, addMessage]);

  // Handle typing
  const handleTyping = useCallback(() => {
    sendTyping(true);
  }, [sendTyping]);

  // Group messages by date
  const groupedMessages = channelMessages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessageType[]>);

  // Get channel icon
  const getChannelIcon = () => {
    if (!channel) return <Hash className="w-5 h-5" />;
    
    switch (channel.type) {
      case 'global':
        return <MessageSquare className="w-5 h-5" />;
      case 'project':
        return <Hash className="w-5 h-5" />;
      case 'direct':
        return <Users className="w-5 h-5" />;
      case 'issue':
        return <Hash className="w-5 h-5" />;
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  if (!channel) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-slate-900/50 ${className}`}>
        <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-500">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-900/50 ${className}`} style={{ height }}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="text-slate-400">{getChannelIcon()}</div>
            <div>
              <h3 className="font-semibold text-white">{channel.name}</h3>
              <p className="text-xs text-slate-500">
                {channel.participants.length} participants • {onlineAgents.size} online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-2">
            {/* Date divider */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 rounded-full bg-slate-800/50 text-xs text-slate-500">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            {/* Messages */}
            {dateMessages.map((message, index) => {
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const isGrouped = prevMessage && 
                prevMessage.author === message.author &&
                message.timestamp - prevMessage.timestamp < 300000; // 5 minutes

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isGrouped={isGrouped}
                  isOwn={message.authorAddress === currentAgent?.address}
                  onReply={(msg) => handleSendMessage('', msg.id)}
                />
              );
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {typingUsers.length === 1 
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        placeholder={`Message #${channel.name}`}
      />
    </div>
  );
};

export default ChatPanel;