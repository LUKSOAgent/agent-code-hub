import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { codeStore } from '../utils/codeStore'
import { Search, Filter, TrendingUp, Clock, Code2, Hash, User } from 'lucide-react'
import type { CodeSnippet } from '../types'

// Language badge colors
const languageColors: Record<string, string> = {
  solidity: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  javascript: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  typescript: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  python: 'bg-green-500/10 text-green-400 border-green-500/20',
  rust: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  go: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

export function Explore() {
  const [codes, setCodes] = useState<CodeSnippet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('popular')
  const navigate = useNavigate()

  const loadCodes = useCallback(() => {
    setLoading(true)
    
    // Get all codes from store
    let allCodes = codeStore.getAll()
    
    // Apply search filter
    if (searchQuery) {
      allCodes = codeStore.search(searchQuery)
    }
    
    // Apply language filter
    if (selectedLanguage !== 'all') {
      allCodes = allCodes.filter(c => c.language.toLowerCase() === selectedLanguage)
    }
    
    // Apply tag filter
    if (selectedTag) {
      allCodes = allCodes.filter(c => c.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()))
    }
    
    // Sort codes
    allCodes = [...allCodes].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.timestamp - a.timestamp
      } else {
        return b.likes - a.likes
      }
    })
    
    setCodes(allCodes)
    setLoading(false)
  }, [searchQuery, selectedLanguage, selectedTag, sortBy])

  useEffect(() => {
    loadCodes()
  }, [loadCodes])

  // Get unique languages and tags
  const allCodes = codeStore.getAll()
  const languages = ['all', ...Array.from(new Set(allCodes.map(c => c.language.toLowerCase())))]
  const allTags = Array.from(new Set(allCodes.flatMap(c => c.tags)))

  const getLanguageColor = (lang: string) => {
    return languageColors[lang.toLowerCase()] || languageColors.default
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes === 0 ? 'Just now' : `${minutes}m ago`
      }
      return `${hours}h ago`
    }
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Code</h1>
          <p className="text-slate-400">Discover smart contract code from the community</p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search code snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Languages</option>
                {languages.filter(l => l !== 'all').map(lang => (
                  <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  sortBy === 'popular' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  sortBy === 'newest' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                Newest
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16">
            <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No code snippets found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map((code) => (
              <div
                key={code.id}
                onClick={() => navigate(`/code/${code.id}`)}
                className="glass-card rounded-xl p-5 cursor-pointer hover:border-blue-500/30 transition-all hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getLanguageColor(code.language)}`}>
                      {code.language}
                    </span>
                  </div>
                  {code.isVerified && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                      Verified
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{code.title}</h3>
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
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[100px]">{code.author}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{code.likes} likes</span>
                    <span>{formatDate(code.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
