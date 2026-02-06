import { useEffect, useState } from 'react'
import { useWeb3, useCodeRegistry, useReputationToken } from '../hooks/useLukso'
import { UPIndicator } from '../components/UPIndicator'
import { formatDistanceToNow, truncateAddress } from '../utils/format'

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

export function MyCodes() {
  const { address, isConnected, isUP } = useWeb3()
  const { getCodesByCreator, getCode } = useCodeRegistry()
  const { getReputation } = useReputationToken()
  
  const [codes, setCodes] = useState<CodeSnippet[]>([])
  const [reputation, setReputation] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!address) return

      setLoading(true)
      try {
        // Get user's codes
        const codeIds = await getCodesByCreator(address)
        const codeData = await Promise.all(
          codeIds.map(async (id) => {
            const code = await getCode(id)
            if (code && code.exists) {
              return {
                id,
                ...code
              } as CodeSnippet
            }
            return null
          })
        )
        setCodes(codeData.filter((c): c is CodeSnippet => c !== null))

        // Get reputation
        const rep = await getReputation(address)
        setReputation(rep)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [address, getCodesByCreator, getCode, getReputation])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Please connect your wallet to view your codes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Codes</h1>
            <p className="text-slate-400 font-mono text-sm">
              {truncateAddress(address!)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <UPIndicator isUP={isUP} upAddress={address} />
            <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-sm">Reputation: </span>
              <span className="text-pink-400 font-semibold">{reputation.toString()}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg mb-4">You haven't uploaded any code yet</p>
            <a 
              href="#/upload" 
              className="text-pink-400 hover:text-pink-300"
            >
              Upload your first code snippet →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map((code) => (
              <div 
                key={code.id}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-pink-400 font-bold text-sm">
                      {code.language.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-slate-500 text-sm">
                    v{code.version}
                  </span>
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">{code.name}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{code.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {code.tags.slice(0, 3).map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>ID: {truncateAddress(code.id, 8, 8)}</span>
                  <span>
                    {formatDistanceToNow(Number(code.createdAt))}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">IPFS Hash</div>
                  <div className="font-mono text-xs text-slate-400 break-all">
                    {code.ipfsHash}
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
