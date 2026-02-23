import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile,
  Command,
  AtSign,
  Hash,
  Image as ImageIcon,
  FileText,
  Code,
  X
} from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  replyTo?: string | null;
  onCancelReply?: () => void;
}

interface Suggestion {
  type: 'mention' | 'channel' | 'emoji';
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false,
  replyTo,
  onCancelReply,
}) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const commonEmojis = [
    '😀', '😂', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥',
    '👏', '😍', '🤯', '😭', '😤', '💯', '✨', '🚀', '💪', '🙏',
    '👀', '💀', '🤡', '🌟', '💡', '📌', '✅', '❌', '⚠️', '❓',
  ];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  }, [isTyping, onTyping]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    handleTyping();

    // Check for suggestions
    const lastWord = value.split(/\s+/).pop() || '';
    
    if (lastWord.startsWith('@')) {
      setSuggestionQuery(lastWord.slice(1));
      setSuggestions([
        { type: 'mention', value: '@soliditysage', label: 'SoliditySage' },
        { type: 'mention', value: '@typescripttitan', label: 'TypeScriptTitan' },
        { type: 'mention', value: '@pythonpioneer', label: 'PythonPioneer' },
      ]);
    } else if (lastWord.startsWith('#')) {
      setSuggestionQuery(lastWord.slice(1));
      setSuggestions([
        { type: 'channel', value: '#general', label: 'General' },
        { type: 'channel', value: '#solidity', label: 'Solidity' },
        { type: 'channel', value: '#typescript', label: 'TypeScript' },
      ]);
    } else if (lastWord.startsWith(':')) {
      setSuggestionQuery(lastWord.slice(1));
      setSuggestions([
        { type: 'emoji', value: ':fire:', label: '🔥 Fire' },
        { type: 'emoji', value: ':rocket:', label: '🚀 Rocket' },
        { type: 'emoji', value: ':sparkles:', label: '✨ Sparkles' },
      ]);
    } else {
      setSuggestions([]);
      setSuggestionQuery('');
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertSuggestion(suggestions[selectedSuggestion]);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestions([]);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Insert suggestion
  const insertSuggestion = (suggestion: Suggestion) => {
    const words = content.split(/\s+/);
    words.pop();
    words.push(suggestion.value);
    setContent(words.join(' ') + ' ');
    setSuggestions([]);
    textareaRef.current?.focus();
  };

  // Handle send
  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent('');
      setSuggestions([]);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
    }
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Insert code block
  const insertCodeBlock = () => {
    const codeBlock = '\n```solidity\n// Your code here\n```\n';
    setContent((prev) => prev + codeBlock);
    textareaRef.current?.focus();
  };

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-slate-800/50 p-4">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 bg-slate-800/50 rounded-lg">
          <span className="text-sm text-slate-400">Replying to message</span>
          <button
            onClick={onCancelReply}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-2 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.value}
              onClick={() => insertSuggestion(suggestion)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                index === selectedSuggestion
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {suggestion.type === 'mention' && <AtSign className="w-4 h-4" />}
              {suggestion.type === 'channel' && <Hash className="w-4 h-4" />}
              {suggestion.type === 'emoji' && <span>{suggestion.label.split(' ')[0]}</span>}
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pr-24 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-blue-500/50 resize-none min-h-[44px] max-h-[200px]"
          rows={1}
        />

        {/* Toolbar */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {/* Emoji picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              type="button"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 p-3 rounded-xl bg-slate-800 border border-slate-700 shadow-xl z-20">
                <div className="grid grid-cols-10 gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="p-1.5 rounded hover:bg-slate-700 transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code block */}
          <button
            onClick={insertCodeBlock}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            type="button"
            title="Insert code block"
          >
            <Code className="w-5 h-5" />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>+ K for commands</span>
          </span>
          <span>@ to mention</span>
          <span># for channels</span>
        </div>
        <span>Shift + Enter for new line</span>
      </div>
    </div>
  );
};

export default ChatInput;