import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient, useDisconnect } from 'wagmi';
import { luksoTestnet } from 'wagmi/chains';
import { PublicClient, WalletClient, Hex } from 'viem';
import { Web3Error } from '../contexts/Web3Context';

const LSP0_INTERFACE_ID = '0x24871b3a';
const ERC725X_INTERFACE_ID = '0x7545acac';
const ERC725Y_INTERFACE_ID = '0x629aa694';

export interface WalletState {
  isConnected: boolean;
  isUP: boolean;
  upProfile: any | null;
  isConnecting: boolean;
  error: string | null;
}

export interface UseWalletReturn extends WalletState {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
  isLoading: boolean;
  clearError: () => void;
}

async function detectUniversalProfile(address: Hex, publicClient: PublicClient): Promise<boolean> {
  try {
    const code = await publicClient.getCode({ address });
    if (!code || code === '0x') return false;

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
          args: [interfaceId as Hex],
        });
      } catch {
        return false;
      }
    };

    const [supportsLSP0, supportsERC725X, supportsERC725Y] = await Promise.all([
      supportsInterface(LSP0_INTERFACE_ID),
      supportsInterface(ERC725X_INTERFACE_ID),
      supportsInterface(ERC725Y_INTERFACE_ID),
    ]);

    return supportsLSP0 || (supportsERC725X && supportsERC725Y);
  } catch {
    return false;
  }
}

/**
 * Enhanced hook for wallet management with UP detection
 * 
 * Note: For most use cases, prefer using `useWeb3` from '../contexts/Web3Context'
 * This hook is kept for backward compatibility and specific wallet UI needs
 */
export function useWallet(): UseWalletReturn {
  const { address, isConnected: isWagmiConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isUP: false,
    upProfile: null,
    isConnecting: false,
    error: null,
  });

  // Sync with wagmi connection state and detect UP
  useEffect(() => {
    async function syncState() {
      if (isWagmiConnected && address && publicClient) {
        try {
          const isUP = await detectUniversalProfile(address as Hex, publicClient);
          setState(s => ({
            ...s,
            isConnected: true,
            isUP,
            isConnecting: false,
            error: null,
          }));
        } catch (err: any) {
          setState(s => ({
            ...s,
            isConnected: true,
            isUP: false,
            error: err?.message || 'Failed to detect wallet type',
          }));
        }
      } else {
        setState(s => ({
          ...s,
          isConnected: false,
          isUP: false,
          upProfile: null,
        }));
      }
    }

    syncState();
  }, [isWagmiConnected, address, publicClient]);

  const connect = useCallback(async () => {
    setState(s => ({ ...s, isConnecting: true, error: null }));
    
    // RainbowKit handles the actual connection UI
    // This is called before the user clicks ConnectButton
    // The actual connection state is managed by wagmi
  }, []);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setState({
      isConnected: false,
      isUP: false,
      upProfile: null,
      isConnecting: false,
      error: null,
    });
  }, [wagmiDisconnect]);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  return {
    address: address || null,
    ...state,
    connect,
    disconnect,
    walletClient: walletClient || null,
    publicClient: publicClient || null,
    isLoading: state.isConnecting,
    clearError,
  };
}

/**
 * Hook to detect if the current wallet is a Universal Profile
 */
export function useUPDetection() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [isUP, setIsUP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      if (!isConnected || !address || !publicClient) {
        setIsUP(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await detectUniversalProfile(address as Hex, publicClient);
        setIsUP(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to detect UP');
        setIsUP(false);
      } finally {
        setIsLoading(false);
      }
    }

    check();
  }, [isConnected, address, publicClient]);

  return { isUP, isLoading, error };
}

/**
 * Hook to check if the user is on the correct network
 */
export function useNetworkCheck(expectedChainId: number = luksoTestnet.id) {
  const { chainId } = useAccount();
  const { isConnected } = useAccount();

  return {
    isCorrectNetwork: !isConnected || chainId === expectedChainId,
    currentChainId: chainId,
    expectedChainId,
    isConnected,
  };
}
