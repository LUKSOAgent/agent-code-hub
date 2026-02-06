import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCodeRegistry } from '../hooks/useLukso'
import { formatDistanceToNow } from '../utils/format'

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

export function Explore() {
  const [codes, setCodes] = useState<CodeSnippet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const { getAllCodes, getCode } = useCodeRegistry()
  const navigate = useNavigate()

  useEffect(() => {
    const loadCodes = async () => {
      try {
        const codeIds = await getAllCodes()
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
      } catch (error) {
        console.error('Error loading codes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCodes()
  }, [getAllCodes, getCode])

  const languages = ['all', ...new Set(codes.map(c => c.language))]
  
  const filteredCodes = selectedLanguage === 'all' 
    ? codes 
    : codes.filter(c => c.language === selectedLanguage)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Explore Code Snippets</h1>
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : lang}
              </option>
            ))}
          </select>
        </div>

        {filteredCodes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No code snippets found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCodes.map((code) => (
              <div 
                key={code.id}
                onClick={() => navigate(`/code/${code.id}`)}
                className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-pink-500/50 transition-colors cursor-pointer"
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
                  <span className="font-mono">
                    {code.creator.slice(0, 6)}...{code.creator.slice(-4)}
                  </span>
                  <span>
                    {formatDistanceToNow(Number(code.createdAt))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
