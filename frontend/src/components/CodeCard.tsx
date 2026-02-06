import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  GitFork, 
  Clock, 
  Shield, 
  Copy,
  Check,
  FileCode,
  AlertCircle
} from 'lucide-react';
import type { CodeSnippet } from '../types';

interface CodeCardProps {
  code: CodeSnippet;
  variant?: 'default' | 'compact';
  onLike?: (id: string) => Promise<void>;
  onCopy?: (code: string) => void;
}

// Language configuration with proper color schemes
const languageConfigs: Record<string, { 
  bg: string; 
  text: string; 
  border: string;
  icon: string;
}> = {
  solidity: { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-400', 
    border: 'border-blue-500/30',
    icon: 'text-blue-500'
  },
  javascript: { 
    bg: 'bg-yellow-500/10', 
    text: 'text-yellow-400', 
    border: 'border-yellow-500/30',
    icon: 'text-yellow-500'
  },
  typescript: { 
    bg: 'bg-blue-400/10', 
    text: 'text-blue-300', 
    border: 'border-blue-400/30',
    icon: 'text-blue-400'
  },
  python: { 
    bg: 'bg-green-500/10', 
    text: 'text-green-400', 
    border: 'border-green-500/30',
    icon: 'text-green-500'
  },
  rust: { 
    bg: 'bg-orange-500/10', 
    text: 'text-orange-400', 
    border: 'border-orange-500/30',
    icon: 'text-orange-500'
  },
  go: { 
    bg: 'bg-cyan-500/10', 
    text: 'text-cyan-400', 
    border: 'border-cyan-500/30',
    icon: 'text-cyan-500'
  },
  java: { 
    bg: 'bg-red-500/10', 
    text: 'text-red-400', 
    border: 'border-red-500/30',
    icon: 'text-red-500'
  },
  cpp: { 
    bg: 'bg-purple-500/10', 
    text: 'text-purple-400', 
    border: 'border-purple-500/30',
    icon: 'text-purple-500'
  },
  default: { 
    bg: 'bg-slate-500/10', 
    text: 'text-slate-400', 
    border: 'border-slate-500/30',
    icon: 'text-slate-500'
  }
};

const CodeCard: React.FC<CodeCardProps> = ({ code, variant = 'default', onLike, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Format date with proper localization
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  // Handle copy with error handling
  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      setCopyError(false);
      onCopy?.(code.code);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, [code.code, onCopy]);

  // Handle like with loading state
  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLikeLoading) return;
    
    setIsLikeLoading(true);
    try {
      await onLike?.(code.id);
      setIsLiked(!isLiked);
    } catch (err) {
      // Revert on error
    } finally {
      setIsLikeLoading(false);
    }
  }, [code.id, isLiked, isLikeLoading, onLike]);

  const langConfig = languageConfigs[code.language.toLowerCase()] || languageConfigs.default;

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link
        to={`/code/${code.id}`}
        className="group flex items-center gap-4 p-4 rounded-xl glass-card 
          hover:border-slate-600/50 transition-all duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        aria-label={`View ${code.title} - ${code.language}`}
      >
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg ${langConfig.bg} flex items-center justify-center flex-shrink-0 
          group-hover:scale-110 transition-transform duration-300`}
        >
          <FileCode className={`w-5 h-5 ${langConfig.icon}`} aria-hidden="true" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
            {code.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${langConfig.bg} ${langConfig.text} ${langConfig.border}`}>
              {code.language}
            </span>
            {code.isVerified && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Shield className="w-3 h-3" aria-hidden="true" />
                <span className="sr-only">Verified</span>
              </span>
            )}
            <span className="text-xs text-slate-500">{formatDate(code.timestamp)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1" title={`${code.likes} likes`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />
            <span className="text-xs">{code.likes + (isLiked ? 1 : 0)}</span>
          </div>
          <div className="flex items-center gap-1" title={`${code.forks} forks`}>
            <GitFork className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs">{code.forks}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <article className="group rounded-xl glass-card overflow-hidden transition-all duration-300
      hover:border-slate-600/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
    >
      <Link
        to={`/code/${code.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/50"
        aria-label={`View ${code.title}`}
      >
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Tags row */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full border ${langConfig.bg} ${langConfig.text} ${langConfig.border}`}>
                  {code.language}
                </span>
                {code.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {code.title}
              </h3>
              
              {/* Description */}
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {code.description}
              </p>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${copied 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : copyError
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }
                opacity-0 group-hover:opacity-100 focus:opacity-100
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
              `}
              title={copied ? 'Copied!' : copyError ? 'Failed to copy' : 'Copy code'}
              aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
              aria-live="polite"
            >
              {copied ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : copyError ? (
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Tags */}
          {code.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {code.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {code.tags.length > 3 && (
                <span className="text-xs text-slate-500 px-2 py-1">
                  +{code.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Code Preview */}
        <div className="px-5 pb-5">
          <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800 
            group-hover:border-slate-700 transition-colors"
          >
            <pre className="p-3 text-xs text-slate-300 overflow-x-auto line-clamp-3 font-mono">
              <code>{code.code}</code>
            </pre>
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/30 flex items-center justify-between">
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 
            flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          >
            {code.author.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-slate-400 truncate max-w-[120px]">{code.author}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-slate-500">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={isLikeLoading}
            className={`
              flex items-center gap-1.5 text-sm transition-colors
              ${isLiked ? 'text-red-400' : 'hover:text-red-400'}
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md px-1 -mx-1
            `}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            aria-pressed={isLiked}
          >
            <Heart 
              className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current scale-110' : ''} ${isLikeLoading ? 'animate-pulse' : ''}`} 
              aria-hidden="true" 
            />
            <span>{code.likes + (isLiked ? 1 : 0)}</span>
          </button>
          
          {/* Forks */}
          <div className="flex items-center gap-1.5 text-sm" title={`${code.forks} forks`}>
            <GitFork className="w-4 h-4" aria-hidden="true" />
            <span>{code.forks}</span>
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-1.5 text-sm" title={new Date(code.timestamp).toLocaleString()}>
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{formatDate(code.timestamp)}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CodeCard;
