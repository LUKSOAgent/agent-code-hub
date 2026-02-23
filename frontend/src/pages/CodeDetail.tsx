import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Copy, 
  Check,
  Heart,
  GitFork,
  Clock,
  Shield,
  ExternalLink,
  User
} from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { codeStore } from '../utils/codeStore'
import { Highlight, themes } from 'prism-react-renderer'
import type { CodeSnippet } from '../types'

const languageMap: Record<string, string> = {
  solidity: 'solidity',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  rust: 'rust',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  ruby: 'ruby',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  other: 'javascript'
}

export function CodeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { address, isConnected } = useWeb3()
  
  const [code, setCode] = useState<CodeSnippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    
    // Load from store
    const snippet = codeStore.get(id)
    if (snippet) {
      setCode(snippet)
      setLocalLikes(snippet.likes)
    }
    setLoading(false)
  }, [id])

  const handleCopy = () => {
    if (code?.code) {
      navigator.clipboard.writeText(code.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLike = () => {
    if (!code) return
    
    setIsLiked(!isLiked)
    setLocalLikes(prev => isLiked ? prev - 1 : prev + 1)
    
    // Update store
    codeStore.update(code.id, { likes: isLiked ? localLikes - 1 : localLikes + 1 })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      solidity: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      javascript: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      typescript: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
      python: 'text-green-400 bg-green-500/10 border-green-500/20',
      rust: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      go: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    }
    return colors[lang.toLowerCase()] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </button>
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">Code snippet not found</p>
            <p className="text-slate-500 text-sm mt-2">The code you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    )
  }

  const mappedLanguage = languageMap[code.language.toLowerCase()] || 'javascript'

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLanguageColor(code.language)}`}>
                  {code.language}
                </span>
                {code.isVerified && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{code.title}</h1>
              <p className="text-slate-400 text-lg">{code.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isLiked 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{localLikes}</span>
              </button>
              
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all"
              >
                <GitFork className="w-4 h-4" />
                <span className="font-medium">{code.forks}</span>
              </button>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                {code.author.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300">{code.author}</span>
              <span className="font-mono text-slate-600">
                ({code.authorAddress.slice(0, 6)}...{code.authorAddress.slice(-4)})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDate(code.timestamp)}</span>
            </div>

            {code.ipfsHash && (
              <a 
                href={`https://ipfs.io/ipfs/${code.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on IPFS
              </a>
            )}
          </div>

          {/* Tags */}
          {code.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {code.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-slate-800/50 text-slate-400 text-sm rounded-lg border border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Code Block */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-3 text-sm text-slate-500">{code.language}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <Highlight
              theme={themes.nightOwl}
              code={code.code}
              language={mappedLanguage}
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={`${className} p-4 text-sm leading-relaxed`} style={style}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="inline-block w-8 text-right mr-4 text-slate-600 select-none">
                        {i + 1}
                      </span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-semibold text-white">Comments</h2>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-sm rounded-full">0</span>
          </div>
          
          {isConnected ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Comments coming soon...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Connect your wallet to leave a comment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
