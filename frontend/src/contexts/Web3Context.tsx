import { createContext, useContext, ReactNode } from 'react'
import { useWallet } from '../hooks/useWallet'

interface Web3ContextType {
  address: `0x${string}` | null
  isConnected: boolean
  isUP: boolean
  upProfile: any
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  executeTransaction: (
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[],
    value?: bigint
  ) => Promise<string>
  publicClient: any
  walletClient: any
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Web3Provider({ children }: { children: ReactNode }) {
  const wallet = useWallet()

  return (
    <Web3Context.Provider value={wallet as Web3ContextType}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}
