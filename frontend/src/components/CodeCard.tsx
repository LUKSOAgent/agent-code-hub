import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  GitFork, 
  Clock, 
  Shield, 
  MoreHorizontal,
  Copy,
  Check,
  FileCode
} from 'lucide-react'
import type { CodeSnippet } from '../types'

interface CodeCardProps {
  code: CodeSnippet
  variant?: 'default' | 'compact'
}

const CodeCard: React.FC<CodeCardProps> = ({ code, variant = 'default' }) => {
  const [copied, setCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(code.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const languageColors: Record<string, string> = {
    solidity: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    typescript: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    python: 'bg-green-500/20 text-green-400 border-green-500/30',
    rust: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    go: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    default: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  const languageColor = languageColors[code.language.toLowerCase()] || languageColors.default

  if (variant === 'compact') {
    return (
      <Link
        to={`/code/${code.id}`}
        className="group flex items-center gap-4 p-4 rounded-xl glass-card hover-lift"
      >
        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
          <FileCode className="w-5 h-5 text-slate-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
            {code.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${languageColor}`}>
              {code.language}
            </span>
            <span className="text-xs text-slate-500">{formatDate(code.timestamp)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <div className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-xs">{code.likes + (isLiked ? 1 : 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            <span className="text-xs">{code.forks}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/code/${code.id}`}
      className="group block rounded-xl glass-card overflow-hidden hover-lift"
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${languageColor}`}>
                {code.language}
              </span>
              {code.isVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {code.title}
            </h3>
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
              {code.description}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
        <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
          <pre className="p-3 text-xs text-slate-300 overflow-x-auto line-clamp-3">
            <code>{code.code}</code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
            {code.author.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-slate-400">{code.author}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm hover:text-red-400 transition-colors ${
              isLiked ? 'text-red-400' : ''
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{code.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <div className="flex items-center gap-1 text-sm">
            <GitFork className="w-4 h-4" />
            <span>{code.forks}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatDate(code.timestamp)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CodeCard
