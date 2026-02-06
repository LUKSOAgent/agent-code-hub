import { useWeb3 } from '../contexts/Web3Context'

export function WalletButton() {
  const { isConnected, isConnecting, address, isUP, connect, disconnect } = useWeb3()

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium"
      >
        Connecting...
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 
                   text-white rounded-lg text-sm font-medium border border-slate-700
                   transition-colors"
      >
        {isUP && (
          <span className="w-2 h-2 bg-pink-500 rounded-full" title="Universal Profile" />
        )}
        <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg 
                 text-sm font-medium transition-colors"
    >
      Connect Wallet
    </button>
  )
}
