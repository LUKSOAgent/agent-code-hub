import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { CONTRACTS } from '../utils/constants';
import { CODE_REGISTRY_ABI, REPUTATION_TOKEN_ABI } from '../abi/contracts';
import { Hex } from 'viem';

// Re-export the wallet hook for convenience
export { useWeb3 }

export interface CodeSnippet {
  id: string
  creator: string
  ipfsHash: string
  name: string
  description: string
  tags: string[]
  language: string
  version: string
  createdAt: bigint
  updatedAt: bigint
  exists: boolean
}

export interface VoteStats {
  upvoteCount: bigint
  downvoteCount: bigint
  score: bigint
}

export interface Comment {
  id: bigint
  author: string
  content: string
  timestamp: bigint
  parentId: bigint
}

export interface CodeRegistryState {
  isLoading: boolean;
  error: string | null;
  lastAction: string | null;
}

/**
 * Hook for CodeRegistry contract interactions with full state management
 */
export function useCodeRegistry() {
  const { executeTransaction, publicClient, address } = useWeb3();
  
  const [state, setState] = useState<CodeRegistryState>({
    isLoading: false,
    error: null,
    lastAction: null,
  });

  const setLoading = useCallback((action: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      lastAction: action,
    }));
  }, []);

  const setError = useCallback((error: any) => {
    const message = error?.reason || error?.message || 'An error occurred';
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: message,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastAction: null,
    });
  }, []);

  const handleTransaction = useCallback(async (
    action: string,
    fn: () => Promise<string>
  ): Promise<string | null> => {
    setLoading(action);
    try {
      const hash = await fn();
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return hash;
    } catch (error: any) {
      setError(error);
      return null;
    }
  }, [setLoading, setError]);

  // ============ Write Functions ============

  const registerCode = useCallback(async (
    ipfsHash: string,
    name: string,
    description: string,
    tags: string[],
    language: string,
    version: string
  ): Promise<string | null> => {
    return handleTransaction('registerCode', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'registerCode',
        [ipfsHash, name, description, tags, language, version]
      )
    );
  }, [executeTransaction, handleTransaction]);

  const updateCode = useCallback(async (
    codeId: string,
    newIpfsHash: string,
    version: string
  ): Promise<string | null> => {
    return handleTransaction('updateCode', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'updateCode',
        [codeId, newIpfsHash, version]
      )
    );
  }, [executeTransaction, handleTransaction]);

  const deactivateCode = useCallback(async (codeId: string): Promise<string | null> => {
    return handleTransaction('deactivateCode', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'deactivateCode',
        [codeId]
      )
    );
  }, [executeTransaction, handleTransaction]);

  const forkCode = useCallback(async (
    parentId: string,
    ipfsHash: string,
    title: string,
    description: string,
    additionalDependencies: string[] = []
  ): Promise<string | null> => {
    return handleTransaction('forkCode', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'forkCode',
        [parentId, ipfsHash, title, description, additionalDependencies],
        0n // posting fee should be added here
      )
    );
  }, [executeTransaction, handleTransaction]);

  // ============ Voting Functions ============

  const vote = useCallback(async (codeId: string, isUpvote: boolean): Promise<string | null> => {
    return handleTransaction(isUpvote ? 'upvote' : 'downvote', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'vote',
        [codeId, isUpvote]
      )
    );
  }, [executeTransaction, handleTransaction]);

  const removeVote = useCallback(async (codeId: string): Promise<string | null> => {
    return handleTransaction('removeVote', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'removeVote',
        [codeId]
      )
    );
  }, [executeTransaction, handleTransaction]);

  // ============ Comment Functions ============

  const addComment = useCallback(async (
    codeId: string,
    content: string,
    parentId: string = '0'
  ): Promise<string | null> => {
    return handleTransaction('addComment', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'addComment',
        [codeId, content, BigInt(parentId)]
      )
    );
  }, [executeTransaction, handleTransaction]);

  // ============ Agent Coordination Functions ============

  const registerAgent = useCallback(async (agentAddress: string): Promise<string | null> => {
    return handleTransaction('registerAgent', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'registerAgent',
        [agentAddress as Hex]
      )
    );
  }, [executeTransaction, handleTransaction]);

  const unregisterAgent = useCallback(async (agentAddress: string): Promise<string | null> => {
    return handleTransaction('unregisterAgent', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'unregisterAgent',
        [agentAddress as Hex]
      )
    );
  }, [executeTransaction, handleTransaction]);

  const markAsReviewed = useCallback(async (codeId: string): Promise<string | null> => {
    return handleTransaction('markAsReviewed', () =>
      executeTransaction(
        CONTRACTS.luksoTestnet.codeRegistry,
        CODE_REGISTRY_ABI,
        'markAsReviewed',
        [codeId]
      )
    );
  }, [executeTransaction, handleTransaction]);

  // ============ Read Functions ============

  const getCode = useCallback(async (codeId: string): Promise<CodeSnippet | null> => {
    if (!publicClient) return null;
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as Hex,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getCode',
        args: [codeId as Hex],
      }) as any;
      
      return result as CodeSnippet;
    } catch (error) {
      console.error('Error fetching code:', error);
      return null;
    }
  }, [publicClient]);

  const getCodesByCreator = useCallback(async (creator: string): Promise<string[]> => {
    if (!publicClient) return [];
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as Hex,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getCodesByCreator',
        args: [creator as Hex],
      }) as string[];
    } catch (error) {
      console.error('Error fetching codes by creator:', error);
      return [];
    }
  }, [publicClient]);

  const getAllCodes = useCallback(async (): Promise<string[]> => {
    if (!publicClient) return [];
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as Hex,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getAllCodes',
        args: [],
      }) as string[];
    } catch (error) {
      console.error('Error fetching all codes:', error);
      return [];
    }
  }, [publicClient]);

  const getVoteStats = useCallback(async (codeId: string): Promise<VoteStats | null> => {
    if (!publicClient) return null;
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as Hex,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getVoteStats',
        args: [codeId],
      }) as [bigint, bigint, bigint];
      
      return {
        upvoteCount: result[0],
        downvoteCount: result[1],
        score: result[2],
      };
    } catch (error) {
      console.error('Error fetching vote stats:', error);
      return null;
    }
  }, [publicClient]);

  const hasVotedOn = useCallback(async (codeId: string, voter: string): Promise<boolean> => {
    if (!publicClient) return false;
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as Hex,
        abi: CODE_REGISTRY_ABI,
        functionName: 'hasVotedOn',
        args: [codeId, voter as Hex],
      }) as boolean;
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }, [publicClient]);

  // Note: Comment and reviewer view functions not available in current contract ABI

  return {
    // State
    ...state,
    clearError,
    reset,
    
    // Write functions
    registerCode,
    updateCode,
    deactivateCode,
    forkCode,
    // Voting
    vote,
    removeVote,
    // Comments
    addComment,
    // Agent coordination
    registerAgent,
    unregisterAgent,
    markAsReviewed,
    
    // Read functions
    getCode,
    getCodesByCreator,
    getAllCodes,
    getVoteStats,
    hasVotedOn,
  };
}

/**
 * Hook for ReputationToken contract interactions
 */
export function useReputationToken() {
  const { publicClient } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReputation = useCallback(async (account: string): Promise<bigint> => {
    if (!publicClient) return 0n;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.reputationToken as Hex,
        abi: REPUTATION_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [account as Hex],
      }) as bigint;
      
      setIsLoading(false);
      return result;
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch reputation';
      setError(message);
      setIsLoading(false);
      return 0n;
    }
  }, [publicClient]);

  const balanceOf = getReputation; // Alias for clarity

  const getTokenInfo = useCallback(async () => {
    if (!publicClient) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [name, symbol, decimals] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.luksoTestnet.reputationToken as Hex,
          abi: REPUTATION_TOKEN_ABI,
          functionName: 'name',
        }),
        publicClient.readContract({
          address: CONTRACTS.luksoTestnet.reputationToken as Hex,
          abi: REPUTATION_TOKEN_ABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: CONTRACTS.luksoTestnet.reputationToken as Hex,
          abi: REPUTATION_TOKEN_ABI,
          functionName: 'decimals',
        }),
      ]);
      
      setIsLoading(false);
      return { name, symbol, decimals };
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch token info';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, [publicClient]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    getReputation,
    balanceOf,
    getTokenInfo,
    isLoading,
    error,
    clearError,
  };
}
