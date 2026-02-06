import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCodeRegistry } from '../hooks/useLukso'
import { formatDistanceToNow } from '../utils/format'
import { ThumbsUp, ThumbsDown, TrendingUp, Filter, AlertCircle, RefreshCw } from 'lucide-react'
import { SkeletonGrid, EmptyState, ErrorEmptyState } from '../components'

interface CodeSnippet {
  id: string
  creator: string
  ipfsHash: string
  name: string
  description: string
  tags: string[]
  language: string
  version: string
  createdAt: bigint
  updatedAt: bigint
  exists: boolean
}

interface CodeWithVotes extends CodeSnippet {
  upvotes: bigint
  downvotes: bigint
  score: bigint
}

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
  const [codes, setCodes] = useState<CodeWithVotes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('popular')
  const { getAllCodes, getCode, getVoteStats } = useCodeRegistry()
  const navigate = useNavigate()

  const loadCodes = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const codeIds = await getAllCodes()
      const codeData = await Promise.all(
        codeIds.map(async (id) => {
          try {
            const code = await getCode(id)
            const votes = await getVoteStats(id)
            if (code && code.exists) {
              return {
                id,
                ...code,
                upvotes: votes?.upvoteCount || 0n,
                downvotes: votes?.downvoteCount || 0n,
                score: votes?.score || 0n
              } as CodeWithVotes
            }
            return null
          } catch (err) {
            console.warn(`Failed to load code ${id}:`, err)
            return null
          }
        })
      )
      setCodes(codeData.filter((c): c is CodeWithVotes => c !== null))
    } catch (err) {
      console.error('Error loading codes:', err)
      setError('Failed to load code snippets. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [getAllCodes, getCode, getVoteStats])

  useEffect(() => {
    loadCodes()
  }, [loadCodes])

  const languages = ['all', ...Array.from(new Set(codes.map(c => c.language.toLowerCase())))]
  
  let filteredCodes = selectedLanguage === 'all' 
    ? codes 
    : codes.filter(c => c.language.toLowerCase() === selectedLanguage)
  
  // Sort codes
  filteredCodes = [...filteredCodes].sort((a, b) => {
    if (sortBy === 'newest') {
      return Number(b.createdAt) - Number(a.createdAt)
    } else {
      return Number(b.score) - Number(a.score)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-pulse">
            <div>
              <div className="h-8 w-48 bg-slate-800 rounded mb-2" />
              <div className="h-4 w-64 bg-slate-800 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-slate-800 rounded-lg" />
              <div className="h-10 w-32 bg-slate-800 rounded-lg" />
            </div>
          </div>
          
          {/* Grid skeleton */}
          <SkeletonGrid count={6} columns={3} type="code-card" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ErrorEmptyState onRetry={loadCodes} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Explore Code</h1>
            <p className="text-slate-400 text-sm mt-1">
              Discover smart contracts, utilities, and code snippets
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
                className="pl-9 pr-8 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                  appearance-none cursor-pointer transition-all hover:bg-slate-800"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 pr-8 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                  appearance-none cursor-pointer transition-all hover:bg-slate-800"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-medium">{filteredCodes.length}</span> code snippets
            {selectedLanguage !== 'all' && (
              <span> in <span className="text-blue-400">{selectedLanguage}</span></span>
            )}
          </p>
        </div>

        {/* Empty state */}
        {filteredCodes.length === 0 ? (
          <EmptyState
            type="search"
            title="No code snippets found"
            description={
              selectedLanguage !== 'all'
                ? `No ${selectedLanguage} code snippets available. Try selecting a different language.`
                : "No code snippets available yet. Be the first to upload one!"
            }
            actionLabel="Upload Code"
            actionHref="#/upload"
          />
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCodes.map((code, index) => (
              <div 
                key={code.id}
                onClick={() => navigate(`/code/${code.id}`)}
                className="group bg-slate-900 rounded-xl border border-slate-800 p-5 
                  hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20
                  transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/code/${code.id}`)
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${languageColors[code.language.toLowerCase()] || languageColors.default}
                    bg-opacity-10 border`}
                  >
                    <span className="font-bold text-sm">
                      {code.language.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 
                    px-2 py-1 rounded-full text-xs font-medium"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>{code.score.toString()}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {code.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{code.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {code.tags.slice(0, 3).map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {code.tags.length > 3 && (
                    <span className="px-2 py-1 text-slate-500 text-xs">
                      +{code.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-xs">
                      {code.creator.slice(0, 6)}...{code.creator.slice(-4)}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {formatDistanceToNow(Number(code.createdAt))}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1 text-xs">
                      <ThumbsUp className="w-3 h-3" />
                      {code.upvotes.toString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <ThumbsDown className="w-3 h-3" />
                      {code.downvotes.toString()}
                    </span>
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

export default Explore
