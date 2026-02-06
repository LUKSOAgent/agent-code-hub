import { useState, useCallback, useEffect } from 'react';
import { useWeb3, Web3Error } from '../contexts/Web3Context';
import { Hex, formatUnits, parseUnits } from 'viem';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: bigint;
}

export interface TokenBalance {
  raw: bigint;
  formatted: string;
  symbol: string;
}

const ERC20_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/**
 * Hook for fetching and managing token balances
 */
export function useTokenBalance(tokenAddress?: string, accountAddress?: string) {
  const { publicClient, address } = useWeb3();
  
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetAccount = accountAddress || address;

  const fetchBalance = useCallback(async () => {
    if (!publicClient || !tokenAddress || !targetAccount) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [rawBalance, decimals, symbol] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress as Hex,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [targetAccount as Hex],
        }).catch(() => 0n),
        publicClient.readContract({
          address: tokenAddress as Hex,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }).catch(() => 18),
        publicClient.readContract({
          address: tokenAddress as Hex,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }).catch(() => 'TOKEN'),
      ]);

      const formatted = formatUnits(rawBalance as bigint, decimals as number);
      
      setBalance({
        raw: rawBalance as bigint,
        formatted,
        symbol: symbol as string,
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch balance';
      setError(message);
      console.error('Error fetching token balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, tokenAddress, targetAccount]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

/**
 * Hook for fetching native token (LYX) balance
 */
export function useNativeBalance(accountAddress?: string) {
  const { publicClient, address } = useWeb3();
  
  const [balance, setBalance] = useState<{
    raw: bigint;
    formatted: string;
    symbol: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetAccount = accountAddress || address;

  const fetchBalance = useCallback(async () => {
    if (!publicClient || !targetAccount) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rawBalance = await publicClient.getBalance({
        address: targetAccount as Hex,
      });

      const formatted = formatUnits(rawBalance, 18);
      
      setBalance({
        raw: rawBalance,
        formatted,
        symbol: 'LYX',
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch balance';
      setError(message);
      console.error('Error fetching native balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, targetAccount]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

/**
 * Hook for fetching token metadata
 */
export function useTokenInfo(tokenAddress?: string) {
  const { publicClient } = useWeb3();
  
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    if (!publicClient || !tokenAddress) {
      setTokenInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress as Hex,
          abi: ERC20_ABI,
          functionName: 'name',
        }).catch(() => 'Unknown Token'),
        publicClient.readContract({
          address: tokenAddress as Hex,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }).catch(() => '???'),
        publicClient.readContract({
          address: tokenAddress as Hex,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }).catch(() => 18),
        publicClient.readContract({
          address: tokenAddress as Hex,
          abi: ERC20_ABI,
          functionName: 'totalSupply',
        }).catch(() => undefined),
      ]);

      setTokenInfo({
        address: tokenAddress,
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        totalSupply: totalSupply as bigint | undefined,
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch token info';
      setError(message);
      console.error('Error fetching token info:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, tokenAddress]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return {
    tokenInfo,
    isLoading,
    error,
    refetch: fetchInfo,
  };
}

/**
 * Hook for token transfers with transaction tracking
 */
export function useTokenTransfer() {
  const { executeTransaction } = useWeb3();
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const transfer = useCallback(async (
    tokenAddress: string,
    to: string,
    amount: bigint
  ): Promise<string> => {
    setIsTransferring(true);
    setError(null);

    try {
      const hash = await executeTransaction(
        tokenAddress,
        ERC20_ABI,
        'transfer',
        [to as Hex, amount]
      );
      setLastHash(hash);
      return hash;
    } catch (err: any) {
      const message = err?.message || 'Transfer failed';
      setError(message);
      throw new Web3Error(message, 'TRANSFER_FAILED', err);
    } finally {
      setIsTransferring(false);
    }
  }, [executeTransaction]);

  const transferFrom = useCallback(async (
    tokenAddress: string,
    from: string,
    to: string,
    amount: bigint
  ): Promise<string> => {
    setIsTransferring(true);
    setError(null);

    try {
      const hash = await executeTransaction(
        tokenAddress,
        ERC20_ABI,
        'transferFrom',
        [from as Hex, to as Hex, amount]
      );
      setLastHash(hash);
      return hash;
    } catch (err: any) {
      const message = err?.message || 'Transfer failed';
      setError(message);
      throw new Web3Error(message, 'TRANSFER_FAILED', err);
    } finally {
      setIsTransferring(false);
    }
  }, [executeTransaction]);

  const approve = useCallback(async (
    tokenAddress: string,
    spender: string,
    amount: bigint
  ): Promise<string> => {
    setIsTransferring(true);
    setError(null);

    try {
      const hash = await executeTransaction(
        tokenAddress,
        ERC20_ABI,
        'approve',
        [spender as Hex, amount]
      );
      setLastHash(hash);
      return hash;
    } catch (err: any) {
      const message = err?.message || 'Approval failed';
      setError(message);
      throw new Web3Error(message, 'APPROVAL_FAILED', err);
    } finally {
      setIsTransferring(false);
    }
  }, [executeTransaction]);

  return {
    transfer,
    transferFrom,
    approve,
    isTransferring,
    error,
    lastHash,
    reset: () => {
      setError(null);
      setLastHash(null);
    },
  };
}

/**
 * Utility function to format token amounts
 */
export function formatTokenAmount(amount: bigint, decimals: number = 18, displayDecimals: number = 4): string {
  const formatted = formatUnits(amount, decimals);
  const [whole, fraction] = formatted.split('.');
  
  if (!fraction || displayDecimals === 0) return whole;
  
  const truncatedFraction = fraction.slice(0, displayDecimals);
  return `${whole}.${truncatedFraction}`;
}

/**
 * Utility function to parse token amounts
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return 0n;
  }
}
