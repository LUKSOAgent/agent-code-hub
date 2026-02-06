import { useState } from 'react'
import { Wallet, User } from 'lucide-react'

interface UPIndicatorProps {
  isUP: boolean
  upAddress: string | null
  profileName?: string
  showDetails?: boolean
}

export function UPIndicator({ isUP, upAddress, profileName, showDetails = false }: UPIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!upAddress) return null

  return (
    <div className="relative inline-flex items-center">
      <div 
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isUP 
            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
            : 'bg-slate-700 text-slate-300 border border-slate-600'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isUP ? (
          <User className="w-3.5 h-3.5" />
        ) : (
          <Wallet className="w-3.5 h-3.5" />
        )}
        <span>
          {isUP 
            ? (profileName || 'Universal Profile') 
            : 'Standard Wallet'
          }
        </span>
        {isUP && (
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        )}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg border border-slate-700 whitespace-nowrap z-50">
          {isUP 
            ? `Connected via LUKSO Universal Profile: ${upAddress.slice(0, 6)}...${upAddress.slice(-4)}`
            : `Connected via standard wallet: ${upAddress.slice(0, 6)}...${upAddress.slice(-4)}`
          }
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}

      {/* Extended details panel */}
      {showDetails && isUP && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-lg z-50 min-w-[200px]">
          <div className="text-xs text-slate-400 mb-1">Address</div>
          <div className="text-sm text-white font-mono break-all">
            {upAddress}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            This transaction will be executed via your KeyManager
          </div>
        </div>
      )}
    </div>
  )
}
