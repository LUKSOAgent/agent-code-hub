import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Reply, 
  Edit2, 
  Trash2, 
  Smile,
  Check,
  X,
  CornerUpRight
} from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isGrouped?: boolean;
  isOwn?: boolean;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (message: ChatMessageType, newContent: string) => void;
  onDelete?: (message: ChatMessageType) => void;
  onReact?: (message: ChatMessageType, emoji: string) => void;
}

const commonEmojis = ['👍', '❤️', '😂', '🎉', '🤔', '👀'];

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isGrouped = false,
  isOwn = false,
  onReply,
  onEdit,
  onDelete,
  onReact,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleReaction = (emoji: string) => {
    onReact?.(message, emoji);
    setShowEmojiPicker(false);
  };

  // Render code blocks
  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    let match;

    // Handle code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        elements.push(
          <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ 
            __html: renderInlineElements(textBefore) 
          }} />
        );
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      elements.push(
        <div key={`code-${match.index}`} className="my-2 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-xs text-slate-500">{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 overflow-x-auto">
            <code className="text-sm text-slate-300 font-mono">{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      elements.push(
        <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ 
          __html: renderInlineElements(remainingText) 
        }} />
      );
    }

    return elements.length > 0 ? elements : content;
  };

  // Render inline elements (mentions, links, inline code)
  const renderInlineElements = (text: string): string => {
    // Escape HTML
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-sm font-mono">$1</code>');

    // Mentions
    html = html.replace(/@(\w+)/g, '<span class="text-blue-400 font-medium">@$1</span>');

    // Links
    html = html.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
    );

    return html;
  };

  return (
    <div
      className={`group flex gap-3 ${isGrouped ? 'mt-1' : 'mt-4'} ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isGrouped && (
        <div className="flex-shrink-0">
          {message.authorAvatar ? (
            <img
              src={message.authorAvatar}
              alt={message.author}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {message.author.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isGrouped && !isOwn ? 'ml-[52px]' : ''} ${isGrouped && isOwn ? 'mr-[52px]' : ''}`}>
        {/* Author and time */}
        {!isGrouped && (
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="font-semibold text-sm text-white">{message.author}</span>
            <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
            {message.isEdited && (
              <span className="text-xs text-slate-600">(edited)</span>
            )}
          </div>
        )}

        {/* Reply reference */}
        {message.replyTo && (
          <div className={`flex items-center gap-2 mb-1 text-xs text-slate-500 ${isOwn ? 'justify-end' : ''}`}>
            <CornerUpRight className="w-3 h-3" />
            <span>Replying to message</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`relative ${isOwn ? 'text-right' : ''}`}>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`inline-block max-w-full px-4 py-2 rounded-2xl text-left ${
                isOwn
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-slate-800 text-slate-200 rounded-bl-md'
              }`}
            >
              <div className="break-words">
                {renderContent(message.content)}
              </div>
            </div>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs transition-colors"
                  title={reaction.users.join(', ')}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-slate-400">{reaction.users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isEditing && showActions && (
        <div className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          {/* Emoji picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 p-2 rounded-xl bg-slate-800 border border-slate-700 shadow-xl z-10">
                <div className="flex items-center gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="p-1.5 rounded hover:bg-slate-700 transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onReply?.(message)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <Reply className="w-4 h-4" />
          </button>

          {isOwn && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(message)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;