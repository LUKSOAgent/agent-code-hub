import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCodeRegistry, useReputationToken } from '../hooks/useLukso'
import { useWeb3 } from '../contexts/Web3Context'
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Copy, Check } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'

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

interface VoteStats {
  upvoteCount: bigint
  downvoteCount: bigint
  score: bigint
}

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
  const { getCode, getVoteStats, vote, hasVotedOn } = useCodeRegistry()
  const { getReputation } = useReputationToken()
  
  const [code, setCode] = useState<CodeSnippet | null>(null)
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [reputation, setReputation] = useState<bigint>(0n)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      
      try {
        const codeData = await getCode(id)
        if (codeData) {
          setCode({ id, ...codeData } as CodeSnippet)
        }
        
        const stats = await getVoteStats(id)
        if (stats) {
          setVoteStats(stats)
        }
        
        if (address) {
          const voted = await hasVotedOn(id, address)
          setHasVoted(voted)
          
          const rep = await getReputation(address)
          setReputation(rep)
        }
      } catch (error) {
        console.error('Error loading code:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, getCode, getVoteStats, address, hasVotedOn, getReputation])

  const handleVote = async (isUpvote: boolean) => {
    if (!isConnected || !id || hasVoted || voting) return
    
    setVoting(true)
    try {
      await vote(id, isUpvote)
      setHasVoted(true)
      
      // Refresh vote stats
      const stats = await getVoteStats(id)
      if (stats) {
        setVoteStats(stats)
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVoting(false)
    }
  }

  const handleCopy = () => {
    if (code?.ipfsHash) {
      navigator.clipboard.writeText(code.ipfsHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    )
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </button>
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">Code snippet not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{code.name}</h1>
              <p className="text-slate-400">{code.description}</p>
            </div>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium">
              {code.language}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {code.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
            <span className="font-mono">
              Creator: {code.creator.slice(0, 6)}...{code.creator.slice(-4)}
            </span>
            <span>Version: {code.version}</span>
            <span>IPFS: {code.ipfsHash.slice(0, 10)}...</span>
          </div>
        </div>

        {/* Voting Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {voteStats?.upvoteCount.toString() || '0'}
                </div>
                <div className="text-sm text-slate-500">Upvotes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {voteStats?.downvoteCount.toString() || '0'}
                </div>
                <div className="text-sm text-slate-500">Downvotes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {voteStats?.score.toString() || '0'}
                </div>
                <div className="text-sm text-slate-500">Score</div>
              </div>
            </div>

            {isConnected && (
              <div className="flex items-center gap-3">
                {hasVoted ? (
                  <span className="text-slate-500">You have voted</span>
                ) : (
                  <>
                    <button
                      onClick={() => handleVote(true)}
                      disabled={voting}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Upvote
                    </button>
                    <button
                      onClick={() => handleVote(false)}
                      disabled={voting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Downvote
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {reputation > 0n && (
            <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-500">
              Your reputation: {reputation.toString()} (vote weight: {1 + Math.log2(Number(reputation) / 1e18 || 1)})
            </div>
          )}
        </div>

        {/* Code Preview Placeholder */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">IPFS Hash:</span>
              <code className="text-pink-400 text-sm">{code.ipfsHash}</code>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-8 text-center text-slate-500">
            <p>Code content loaded from IPFS</p>
            <p className="text-sm mt-2">View on: <a href={`https://ipfs.io/ipfs/${code.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">ipfs.io</a></p>
          </div>
        </div>

        {/* Comments Section Placeholder */}
        <div className="mt-8 bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-semibold text-white">Comments</h2>
          </div>
          <p className="text-slate-500">Comments coming soon...</p>
        </div>
      </div>
    </div>
  )
}
