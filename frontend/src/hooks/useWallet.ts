import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient, usePublicClient, useDisconnect } from 'wagmi'
import { luksoTestnet } from 'wagmi/chains'

const LSP0_INTERFACE_ID = '0x24871b3a'
const ERC725X_INTERFACE_ID = '0x7545acac'
const ERC725Y_INTERFACE_ID = '0x629aa694'

export function useWallet() {
  const { address, isConnected: isWagmiConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient: any = usePublicClient()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  const [state, setState] = useState({
    isConnected: false,
    isUP: false,
    upProfile: null as any,
    isConnecting: false,
    error: null as string | null,
  })

  const detectUP = useCallback(async (addr: `0x${string}`) => {
    if (!publicClient) return false
    
    try {
      const code = await publicClient.getCode({ address: addr })
      if (!code || code === '0x') return false

      const supportsInterface = async (interfaceId: string) => {
        try {
          return await publicClient.readContract({
            address: addr,
            abi: [{ 
              type: 'function' as const, 
              name: 'supportsInterface', 
              inputs: [{ type: 'bytes4' as const, name: 'interfaceId' }], 
              outputs: [{ type: 'bool' as const }], 
              stateMutability: 'view' as const 
            }],
            functionName: 'supportsInterface',
            args: [interfaceId as `0x${string}`],
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

  // Update state when wagmi connection changes
  useEffect(() => {
    async function syncState() {
      if (isWagmiConnected && address) {
        const isUP = await detectUP(address as `0x${string}`)
        setState(s => ({
          ...s,
          isConnected: true,
          isUP,
          isConnecting: false,
          error: null,
        }))
      } else {
        setState(s => ({
          ...s,
          isConnected: false,
          isUP: false,
          upProfile: null,
        }))
      }
    }
    syncState()
  }, [isWagmiConnected, address, detectUP])

  const connect = useCallback(async () => {
    // RainbowKit handles the connection UI
    // This is called after user clicks ConnectButton
    setState(s => ({ ...s, isConnecting: true, error: null }))
  }, [])

  const disconnect = useCallback(() => {
    wagmiDisconnect()
    setState(s => ({
      ...s,
      isConnected: false,
      isUP: false,
      upProfile: null,
    }))
  }, [wagmiDisconnect])

  const executeTransaction = useCallback(async (
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[],
    value: bigint = 0n
  ): Promise<string> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    const { encodeFunctionData } = await import('viem')
    const data = encodeFunctionData({ abi, functionName, args })

    if (state.isUP) {
      // Route through UP.execute()
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

      return (walletClient as any).sendTransaction({
        account: address,
        to: address,
        data: executeData,
        value,
      })
    } else {
      // Direct contract call for EOA
      return walletClient.writeContract({
        account: address,
        address: contractAddress as `0x${string}`,
        abi,
        functionName,
        args,
        value,
        chain: luksoTestnet,
      } as any)
    }
  }, [walletClient, address, state.isUP])

  return {
    address: address || null,
    ...state,
    connect,
    disconnect,
    executeTransaction,
    walletClient,
    publicClient,
  }
}
