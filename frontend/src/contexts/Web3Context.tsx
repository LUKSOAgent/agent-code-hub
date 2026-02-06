import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { luksoTestnet } from 'wagmi/chains';
import { CODE_REGISTRY_ABI } from '../abi/contracts';

const LSP0_INTERFACE_ID = '0x24871b3a';
const ERC725X_INTERFACE_ID = '0x7545acac';
const ERC725Y_INTERFACE_ID = '0x629aa694';

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  isUP: boolean;
  upAddress: string | null;
  executeTransaction: (contractAddress: string, abi: any, functionName: string, args: any[], value?: bigint) => Promise<string>;
  publicClient: any;
  walletClient: any;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  isUP: false,
  upAddress: null,
  executeTransaction: async () => '',
  publicClient: null,
  walletClient: null,
});

async function detectUniversalProfile(address: `0x${string}`, publicClient: any) {
  try {
    const code = await publicClient.getCode({ address });
    if (!code || code === '0x') return { isUP: false, upAddress: null };

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

    const isUP = supportsLSP0 || (supportsERC725X && supportsERC725Y);
    return { isUP, upAddress: isUP ? address : null };
  } catch {
    return { isUP: false, upAddress: null };
  }
}

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [isUP, setIsUP] = useState(false);
  const [upAddress, setUpAddress] = useState<string | null>(null);

  // Detect Universal Profile
  useEffect(() => {
    async function detectUP() {
      if (!address || !publicClient) {
        setIsUP(false);
        setUpAddress(null);
        return;
      }

      const result = await detectUniversalProfile(address as `0x${string}`, publicClient);
      setIsUP(result.isUP);
      setUpAddress(result.upAddress);
    }

    detectUP();
  }, [address, publicClient]);

  const executeTransaction = useCallback(async (
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[],
    value: bigint = 0n
  ): Promise<string> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const { encodeFunctionData } = await import('viem');

    // If user has a Universal Profile, route through UP.execute()
    if (isUP && upAddress) {
      const data = encodeFunctionData({
        abi,
        functionName,
        args,
      });

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
      });

      return (walletClient as any).sendTransaction({
        account: address as `0x${string}`,
        to: upAddress as `0x${string}`,
        data: executeData,
        value,
      });
    }

    // Direct contract call for EOA
    return walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args,
      chain: luksoTestnet,
      account: address as `0x${string}`,
      value,
    });
  }, [walletClient, address, isUP, upAddress]);

  return (
    <Web3Context.Provider
      value={{
        address: address || null,
        isConnected,
        isUP,
        upAddress,
        executeTransaction,
        publicClient,
        walletClient,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);
