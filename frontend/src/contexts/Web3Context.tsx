import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { luksoTestnet } from 'wagmi/chains';
import { PublicClient, WalletClient, Hex } from 'viem';

const LSP0_INTERFACE_ID = '0x24871b3a';
const ERC725X_INTERFACE_ID = '0x7545acac';
const ERC725Y_INTERFACE_ID = '0x629aa694';

export interface TransactionState {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'failed';
  error: string | null;
}

export interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  isUP: boolean;
  upAddress: string | null;
  executeTransaction: (
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[],
    value?: bigint
  ) => Promise<string>;
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  transaction: TransactionState;
  resetTransaction: () => void;
  isTransactionPending: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  isUP: false,
  upAddress: null,
  executeTransaction: async () => '',
  publicClient: null,
  walletClient: null,
  transaction: { hash: null, status: 'idle', error: null },
  resetTransaction: () => {},
  isTransactionPending: false,
});

export class Web3Error extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'Web3Error';
  }
}

async function detectUniversalProfile(address: Hex, publicClient: PublicClient) {
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
  const [transaction, setTransaction] = useState<TransactionState>({
    hash: null,
    status: 'idle',
    error: null,
  });

  // Detect Universal Profile
  useEffect(() => {
    async function detectUP() {
      if (!address || !publicClient) {
        setIsUP(false);
        setUpAddress(null);
        return;
      }

      const result = await detectUniversalProfile(address as Hex, publicClient);
      setIsUP(result.isUP);
      setUpAddress(result.upAddress);
    }

    detectUP();
  }, [address, publicClient]);

  const resetTransaction = useCallback(() => {
    setTransaction({ hash: null, status: 'idle', error: null });
  }, []);

  const executeTransaction = useCallback(async (
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[],
    value: bigint = 0n
  ): Promise<string> => {
    if (!walletClient || !address) {
      throw new Web3Error('Wallet not connected', 'WALLET_NOT_CONNECTED');
    }

    if (!publicClient) {
      throw new Web3Error('Public client not available', 'CLIENT_UNAVAILABLE');
    }

    setTransaction({ hash: null, status: 'pending', error: null });

    try {
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
          args: [0n, contractAddress as Hex, value, data],
        });

        const hash = await (walletClient as any).sendTransaction({
          account: address as Hex,
          to: upAddress as Hex,
          data: executeData,
          value,
        });

        setTransaction({ hash, status: 'success', error: null });
        return hash;
      }

      // Direct contract call for EOA
      const hash = await walletClient.writeContract({
        address: contractAddress as Hex,
        abi,
        functionName,
        args,
        chain: luksoTestnet,
        account: address as Hex,
        value,
      });

      setTransaction({ hash, status: 'success', error: null });
      return hash;
    } catch (error: any) {
      const errorMessage = error?.message || 'Transaction failed';
      const userFriendlyError = getUserFriendlyError(error);
      setTransaction({ 
        hash: null, 
        status: 'failed', 
        error: userFriendlyError 
      });
      throw new Web3Error(userFriendlyError, 'TRANSACTION_FAILED', error);
    }
  }, [walletClient, address, publicClient, isUP, upAddress]);

  return (
    <Web3Context.Provider
      value={{
        address: address || null,
        isConnected,
        isUP,
        upAddress,
        executeTransaction,
        publicClient: publicClient || null,
        walletClient: walletClient || null,
        transaction,
        resetTransaction,
        isTransactionPending: transaction.status === 'pending',
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

function getUserFriendlyError(error: any): string {
  const message = error?.message || '';
  const reason = error?.reason || '';
  
  // MetaMask / Wallet errors
  if (message.includes('User denied') || message.includes('rejected')) {
    return 'Transaction was rejected by user';
  }
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  if (message.includes('gas required exceeds allowance')) {
    return 'Transaction would exceed gas limit';
  }
  
  // Contract errors
  if (reason.includes('AlreadyVoted')) {
    return 'You have already voted on this code';
  }
  if (reason.includes('CodeNotFound')) {
    return 'Code snippet not found';
  }
  if (reason.includes('NotAuthor')) {
    return 'Only the author can perform this action';
  }
  if (reason.includes('NotRegisteredAgent')) {
    return 'Only registered agents can perform this action';
  }
  if (reason.includes('DuplicateContent')) {
    return 'This content already exists';
  }
  if (reason.includes('InvalidIPFSHash')) {
    return 'Invalid IPFS hash provided';
  }
  if (reason.includes('EmptyContent') || reason.includes('EmptyTitle')) {
    return 'Content cannot be empty';
  }
  
  // Network errors
  if (message.includes('network changed') || message.includes('chain')) {
    return 'Network mismatch. Please ensure you are on the correct network';
  }
  if (message.includes('timeout')) {
    return 'Transaction timed out. Please try again';
  }
  
  return reason || message || 'Transaction failed. Please try again';
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3ContextProvider');
  }
  return context;
};
