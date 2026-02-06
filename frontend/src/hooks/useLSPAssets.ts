import { useState, useCallback, useEffect } from 'react';
import { useWeb3, Web3Error } from '../contexts/Web3Context';
import { Hex } from 'viem';

// LSP7 Digital Asset interface - fungible and non-fungible tokens
export const LSP7_DIGITAL_ASSET_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'tokenOwner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bool', name: 'force', type: 'bool' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'transfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// LSP8 Identifiable Digital Asset interface - NFTs with unique IDs
export const LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: 'tokenId', type: 'bytes32' }],
    name: 'tokenOwnerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenOwner', type: 'address' }],
    name: 'tokenIdsOf',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
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
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'bytes32', name: 'tokenId', type: 'bytes32' },
      { internalType: 'bool', name: 'force', type: 'bool' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'transfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface LSP7Asset {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  isNFT: boolean;
}

export interface LSP8NFT {
  contractAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  metadata?: any;
}

export interface LSP8Collection {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  ownedTokenIds: string[];
}

/**
 * Hook for LSP7 Digital Assets (fungible tokens and divisible NFTs)
 */
export function useLSP7Asset(assetAddress?: string) {
  const { publicClient, address } = useWeb3();
  
  const [asset, setAsset] = useState<LSP7Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAsset = useCallback(async () => {
    if (!publicClient || !assetAddress || !address) {
      setAsset(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [name, symbol, decimals, balance] = await Promise.all([
        publicClient.readContract({
          address: assetAddress as Hex,
          abi: LSP7_DIGITAL_ASSET_ABI,
          functionName: 'name',
        }).catch(() => 'Unknown Asset'),
        publicClient.readContract({
          address: assetAddress as Hex,
          abi: LSP7_DIGITAL_ASSET_ABI,
          functionName: 'symbol',
        }).catch(() => '???'),
        publicClient.readContract({
          address: assetAddress as Hex,
          abi: LSP7_DIGITAL_ASSET_ABI,
          functionName: 'decimals',
        }).catch(() => 18),
        publicClient.readContract({
          address: assetAddress as Hex,
          abi: LSP7_DIGITAL_ASSET_ABI,
          functionName: 'balanceOf',
          args: [address as Hex],
        }).catch(() => 0n),
      ]);

      setAsset({
        address: assetAddress,
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        balance: balance as bigint,
        isNFT: (decimals as number) === 0,
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch LSP7 asset';
      setError(message);
      console.error('Error fetching LSP7 asset:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, assetAddress, address]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  return {
    asset,
    isLoading,
    error,
    refetch: fetchAsset,
  };
}

/**
 * Hook for LSP8 Identifiable Digital Assets (NFTs)
 */
export function useLSP8Collection(collectionAddress?: string, ownerAddress?: string) {
  const { publicClient, address } = useWeb3();
  
  const [collection, setCollection] = useState<LSP8Collection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetOwner = ownerAddress || address;

  const fetchCollection = useCallback(async () => {
    if (!publicClient || !collectionAddress || !targetOwner) {
      setCollection(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [name, symbol, totalSupply, tokenIds] = await Promise.all([
        publicClient.readContract({
          address: collectionAddress as Hex,
          abi: LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI,
          functionName: 'name',
        }).catch(() => 'Unknown Collection'),
        publicClient.readContract({
          address: collectionAddress as Hex,
          abi: LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI,
          functionName: 'symbol',
        }).catch(() => '???'),
        publicClient.readContract({
          address: collectionAddress as Hex,
          abi: LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI,
          functionName: 'totalSupply',
        }).catch(() => 0n),
        publicClient.readContract({
          address: collectionAddress as Hex,
          abi: LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI,
          functionName: 'tokenIdsOf',
          args: [targetOwner as Hex],
        }).catch(() => []),
      ]);

      setCollection({
        address: collectionAddress,
        name: name as string,
        symbol: symbol as string,
        totalSupply: totalSupply as bigint,
        ownedTokenIds: (tokenIds as string[]).map(id => id),
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch LSP8 collection';
      setError(message);
      console.error('Error fetching LSP8 collection:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, collectionAddress, targetOwner]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return {
    collection,
    isLoading,
    error,
    refetch: fetchCollection,
  };
}

/**
 * Hook for transferring LSP7 assets
 */
export function useLSP7Transfer() {
  const { executeTransaction } = useWeb3();
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const transfer = useCallback(async (
    assetAddress: string,
    to: string,
    amount: bigint,
    force: boolean = false,
    data: string = '0x'
  ): Promise<string> => {
    setIsTransferring(true);
    setError(null);

    try {
      const hash = await executeTransaction(
        assetAddress,
        LSP7_DIGITAL_ASSET_ABI,
        'transfer',
        [
          null, // from - the contract will use msg.sender
          to as Hex,
          amount,
          force,
          data as Hex,
        ]
      );
      setLastHash(hash);
      return hash;
    } catch (err: any) {
      const message = err?.message || 'LSP7 transfer failed';
      setError(message);
      throw new Web3Error(message, 'LSP7_TRANSFER_FAILED', err);
    } finally {
      setIsTransferring(false);
    }
  }, [executeTransaction]);

  return {
    transfer,
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
 * Hook for transferring LSP8 NFTs
 */
export function useLSP8Transfer() {
  const { executeTransaction } = useWeb3();
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const transfer = useCallback(async (
    collectionAddress: string,
    to: string,
    tokenId: string,
    force: boolean = false,
    data: string = '0x'
  ): Promise<string> => {
    setIsTransferring(true);
    setError(null);

    try {
      const hash = await executeTransaction(
        collectionAddress,
        LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI,
        'transfer',
        [
          null, // from - the contract will use msg.sender
          to as Hex,
          tokenId as Hex,
          force,
          data as Hex,
        ]
      );
      setLastHash(hash);
      return hash;
    } catch (err: any) {
      const message = err?.message || 'LSP8 transfer failed';
      setError(message);
      throw new Web3Error(message, 'LSP8_TRANSFER_FAILED', err);
    } finally {
      setIsTransferring(false);
    }
  }, [executeTransaction]);

  return {
    transfer,
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
 * Detect if a contract address is an LSP7 or LSP8 asset
 */
export function useAssetTypeDetector(contractAddress?: string) {
  const { publicClient } = useWeb3();
  const [assetType, setAssetType] = useState<'lsp7' | 'lsp8' | 'unknown' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const detect = useCallback(async () => {
    if (!publicClient || !contractAddress) {
      setAssetType(null);
      return;
    }

    setIsLoading(true);

    try {
      // Try to call LSP7-specific function (decimals)
      await publicClient.readContract({
        address: contractAddress as Hex,
        abi: LSP7_DIGITAL_ASSET_ABI,
        functionName: 'decimals',
      });
      setAssetType('lsp7');
      return;
    } catch {
      // Not LSP7, try LSP8
    }

    try {
      // Try to call LSP8-specific function (totalSupply)
      await publicClient.readContract({
        address: contractAddress as Hex,
        abi: LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI,
        functionName: 'totalSupply',
      });
      setAssetType('lsp8');
      return;
    } catch {
      // Not LSP8 either
    }

    setAssetType('unknown');
    setIsLoading(false);
  }, [publicClient, contractAddress]);

  useEffect(() => {
    detect();
  }, [detect]);

  return { assetType, isLoading, detect };
}
