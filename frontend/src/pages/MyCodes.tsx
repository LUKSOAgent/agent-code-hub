import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { codeStore } from '../utils/codeStore'
import { Code2, Clock, Hash, ExternalLink } from 'lucide-react'
import type { CodeSnippet } from '../types'

export function MyCodes() {
  const { address, isConnected } = useWeb3()
  const navigate = useNavigate()
  
  const [codes, setCodes] = useState<CodeSnippet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) {
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Get user's codes from store (filter by author address)
    const allCodes = codeStore.getAll()
    const userCodes = allCodes.filter(code => 
      code.authorAddress.toLowerCase() === address.toLowerCase()
    )
    
    setCodes(userCodes)
    setLoading(false)
  }, [address])

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

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mx-auto mb-6">
            <Code2 className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-slate-400 mb-6">
            Please connect your wallet to view your code snippets.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Codes</h1>
          <p className="text-slate-400 font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-xl">
            <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-4">You haven't uploaded any code yet</p>
            <button 
              onClick={() => navigate('/upload')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Upload your first code snippet →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map((code) => (
              <div 
                key={code.id}
                onClick={() => navigate(`/code/${code.id}`)}
                className="glass-card rounded-xl p-6 cursor-pointer hover:border-blue-500/30 transition-all hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getLanguageColor(code.language)}`}>
                    {code.language}
                  </span>
                  {code.isVerified && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                      Verified
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">{code.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{code.description}</p>

                {/* Code Preview */}
                <div className="bg-slate-950 rounded-lg p-3 mb-4 overflow-hidden">
                  <pre className="text-xs text-slate-500 line-clamp-3 font-mono">
                    {code.code}
                  </pre>
                </div>

                {/* Tags */}
                {code.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {code.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                    {code.tags.length > 3 && (
                      <span className="text-xs text-slate-500">+{code.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(code.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{code.likes} likes</span>
                  </div>
                </div>

                {/* IPFS Link */}
                {code.ipfsHash && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <a
                      href={`https://ipfs.io/ipfs/${code.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Hash className="w-3 h-3" />
                      <span className="font-mono truncate">{code.ipfsHash.slice(0, 16)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
