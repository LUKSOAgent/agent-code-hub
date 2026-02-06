import { useState, useEffect, useCallback } from 'react'
import { 
  createWalletClient, 
  createPublicClient, 
  http, 
  custom
} from 'viem'
import { luksoTestnet } from 'viem/chains'

const LSP0_INTERFACE_ID = '0x24871b3a'
const ERC725X_INTERFACE_ID = '0x7545acac'
const ERC725Y_INTERFACE_ID = '0x629aa694'

export function useWallet() {
  const publicClient: any = createPublicClient({
    chain: luksoTestnet as any,
    transport: http('https://rpc.testnet.lukso.network'),
  })

  const [state, setState] = useState({
    address: null as `0x${string}` | null,
    isConnected: false,
    isUP: false,
    upProfile: null as any,
    walletClient: null as any,
    publicClient,
    isConnecting: false,
    error: null as string | null,
  })

  const detectUP = useCallback(async (address: `0x${string}`) => {
    try {
      const code = await publicClient.getCode({ address })
      if (!code || code === '0x') return false

      const supportsInterface = async (interfaceId: string) => {
        try {
          return await publicClient.readContract({
            address,
            abi: [{ 
              type: 'function' as const, 
              name: 'supportsInterface', 
              inputs: [{ type: 'bytes4' as const, name: 'interfaceId' }], 
              outputs: [{ type: 'bool' as const }], 
              stateMutability: 'view' as const 
            }],
            functionName: 'supportsInterface',
            args: [interfaceId],
          })
        } catch {
          return false
        }
      }

      const [supportsLSP0, supportsERC725X, supportsERC725Y] = await Promise.all([
        supportsInterface(LSP0_INTERFACE_ID),
        supportsInterface(ERC725X_INTERFACE_ID),
        supportsInterface(ERC725Y_INTERFACE_ID),
      ])

      return supportsLSP0 || (supportsERC725X && supportsERC725Y)
    } catch {
      return false
    }
  }, [publicClient])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(s => ({ ...s, error: 'No wallet found. Install MetaMask or Universal Profile extension.' }))
      return
    }

    setState(s => ({ ...s, isConnecting: true, error: null }))

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      if (!accounts?.length) {
        throw new Error('No accounts returned')
      }

      const address = accounts[0] as `0x${string}`
      const walletClient = createWalletClient({
        chain: luksoTestnet as any,
        transport: custom(window.ethereum),
      })

      const isUP = await detectUP(address)

      setState(s => ({
        ...s,
        address,
        isConnected: true,
        isUP,
        walletClient,
        isConnecting: false,
      }))

      localStorage.setItem('walletConnected', 'true')
    } catch (err: any) {
      setState(s => ({ 
        ...s, 
        isConnecting: false, 
        error: err?.message || 'Failed to connect' 
      }))
    }
  }, [detectUP])

  const disconnect = useCallback(() => {
    setState(s => ({
      ...s,
      address: null,
      isConnected: false,
      isUP: false,
      upProfile: null,
      walletClient: null,
    }))
    localStorage.removeItem('walletConnected')
  }, [])

  const executeTransaction = useCallback(async (
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[],
    value: bigint = 0n
  ): Promise<string> => {
    if (!state.walletClient || !state.address) {
      throw new Error('Wallet not connected')
    }

    const { encodeFunctionData } = await import('viem')
    const data = encodeFunctionData({ abi, functionName, args })

    const [account] = await state.walletClient.getAddresses()

    const txParams: any = {
      account,
      data,
      value,
      kzg: undefined,
    }

    if (state.isUP) {
      const executeData = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'execute',
          inputs: [
            { type: 'uint256', name: 'operation' },
            { type: 'address', name: 'to' },
            { type: 'uint256', name: 'value' },
            { type: 'bytes', name: 'data' },
          ],
          outputs: [{ type: 'bytes' }],
          stateMutability: 'payable',
        }],
        functionName: 'execute',
        args: [0n, contractAddress as `0x${string}`, value, data],
      })

      txParams.to = state.address
      txParams.data = executeData
    } else {
      txParams.to = contractAddress
    }

    return state.walletClient.sendTransaction(txParams)
  }, [state.walletClient, state.address, state.isUP])

  useEffect(() => {
    const autoConnect = async () => {
      if (localStorage.getItem('walletConnected') === 'true' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          })
          
          if (accounts?.length > 0) {
            const address = accounts[0] as `0x${string}`
            const walletClient = createWalletClient({
              chain: luksoTestnet as any,
              transport: custom(window.ethereum),
            })
            const isUP = await detectUP(address)
            
            setState(s => ({
              ...s,
              address,
              isConnected: true,
              isUP,
              walletClient,
            }))
          }
        } catch (err) {
          localStorage.removeItem('walletConnected')
        }
      }
    }
    autoConnect()
  }, [detectUP])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== state.address) {
        connect()
      }
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [state.address, connect, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    executeTransaction,
    publicClient,
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
