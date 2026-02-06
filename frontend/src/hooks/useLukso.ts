import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { CONTRACTS } from '../utils/constants'
import { CODE_REGISTRY_ABI, REPUTATION_TOKEN_ABI } from '../abi/contracts'

// Re-export the wallet hook for convenience
export { useWeb3 }

interface CodeSnippet {
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

interface VoteStats {
  upvoteCount: bigint
  downvoteCount: bigint
  score: bigint
}

interface Comment {
  id: bigint
  author: string
  content: string
  timestamp: bigint
  parentId: bigint
}

/**
 * Hook for CodeRegistry contract interactions
 */
export function useCodeRegistry() {
  const { executeTransaction, publicClient, address } = useWeb3()

  const registerCode = useCallback(async (
    ipfsHash: string,
    name: string,
    description: string,
    tags: string[],
    language: string,
    version: string
  ): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeRegistry,
      CODE_REGISTRY_ABI as any,
      'registerCode',
      [ipfsHash, name, description, tags, language, version]
    )
  }, [executeTransaction])

  const updateCode = useCallback(async (
    codeId: string,
    newIpfsHash: string,
    version: string
  ): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeRegistry,
      CODE_REGISTRY_ABI as any,
      'updateCode',
      [codeId, newIpfsHash, version]
    )
  }, [executeTransaction])

  const getCode = useCallback(async (codeId: string): Promise<CodeSnippet | null> => {
    if (!publicClient) return null
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getCode',
        args: [codeId as `0x${string}`],
      }) as any
      
      return result as CodeSnippet
    } catch (error) {
      console.error('Error fetching code:', error)
      return null
    }
  }, [publicClient])

  const getCodesByCreator = useCallback(async (creator: string): Promise<string[]> => {
    if (!publicClient) return []
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getCodesByCreator',
        args: [creator as `0x${string}`],
      }) as string[]
    } catch (error) {
      console.error('Error fetching codes by creator:', error)
      return []
    }
  }, [publicClient])

  const getAllCodes = useCallback(async (): Promise<string[]> => {
    if (!publicClient) return []
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getAllCodes',
        args: [],
      }) as string[]
    } catch (error) {
      console.error('Error fetching all codes:', error)
      return []
    }
  }, [publicClient])

  // ============ Voting Functions ============

  const vote = useCallback(async (codeId: string, isUpvote: boolean): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeRegistry,
      CODE_REGISTRY_ABI as any,
      'vote',
      [codeId, isUpvote]
    )
  }, [executeTransaction])

  const removeVote = useCallback(async (codeId: string): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeRegistry,
      CODE_REGISTRY_ABI as any,
      'removeVote',
      [codeId]
    )
  }, [executeTransaction])

  const getVoteStats = useCallback(async (codeId: string): Promise<VoteStats | null> => {
    if (!publicClient) return null
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getVoteStats',
        args: [codeId],
      }) as [bigint, bigint, bigint]
      
      return {
        upvoteCount: result[0],
        downvoteCount: result[1],
        score: result[2],
      }
    } catch (error) {
      console.error('Error fetching vote stats:', error)
      return null
    }
  }, [publicClient])

  const hasVotedOn = useCallback(async (codeId: string, voter: string): Promise<boolean> => {
    if (!publicClient) return false
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'hasVotedOn',
        args: [codeId, voter as `0x${string}`],
      }) as boolean
    } catch (error) {
      console.error('Error checking vote status:', error)
      return false
    }
  }, [publicClient])

  // ============ Comment Functions ============

  const addComment = useCallback(async (
    codeId: string,
    content: string,
    parentId: string = '0'
  ): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeRegistry,
      CODE_REGISTRY_ABI as any,
      'addComment',
      [codeId, content, BigInt(parentId)]
    )
  }, [executeTransaction])

  const getCodeComments = useCallback(async (codeId: string): Promise<bigint[]> => {
    if (!publicClient) return []
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getCodeComments',
        args: [codeId],
      }) as bigint[]
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }, [publicClient])

  const getComment = useCallback(async (codeId: string, commentId: bigint): Promise<Comment | null> => {
    if (!publicClient) return null
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getComment',
        args: [codeId, commentId],
      }) as any
      
      return {
        id: result[0],
        author: result[1],
        content: result[2],
        timestamp: result[3],
        parentId: result[4],
      }
    } catch (error) {
      console.error('Error fetching comment:', error)
      return null
    }
  }, [publicClient])

  // ============ Agent Coordination Functions ============

  const registerAgent = useCallback(async (agentAddress: string): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeRegistry,
      CODE_REGISTRY_ABI as any,
      'registerAgent',
      [agentAddress as `0x${string}`]
    )
  }, [executeTransaction])

  const markAsReviewed = useCallback(async (codeId: string): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeRegistry,
      CODE_REGISTRY_ABI as any,
      'markAsReviewed',
      [codeId]
    )
  }, [executeTransaction])

  const getCodeReviewers = useCallback(async (codeId: string): Promise<string[]> => {
    if (!publicClient) return []
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeRegistry as `0x${string}`,
        abi: CODE_REGISTRY_ABI,
        functionName: 'getCodeReviewers',
        args: [codeId],
      }) as string[]
    } catch (error) {
      console.error('Error fetching reviewers:', error)
      return []
    }
  }, [publicClient])

  return {
    registerCode,
    updateCode,
    getCode,
    getCodesByCreator,
    getAllCodes,
    // Voting
    vote,
    removeVote,
    getVoteStats,
    hasVotedOn,
    // Comments
    addComment,
    getCodeComments,
    getComment,
    // Agent coordination
    registerAgent,
    markAsReviewed,
    getCodeReviewers,
  }
}

/**
 * Hook for ReputationToken contract interactions
 */
export function useReputationToken() {
  const { publicClient } = useWeb3()

  const getReputation = useCallback(async (account: string): Promise<bigint> => {
    if (!publicClient) return 0n
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.reputationToken as `0x${string}`,
        abi: REPUTATION_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`],
      }) as bigint
    } catch (error) {
      console.error('Error fetching reputation:', error)
      return 0n
    }
  }, [publicClient])

  const balanceOf = useCallback(async (account: string): Promise<bigint> => {
    if (!publicClient) return 0n
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.reputationToken as `0x${string}`,
        abi: REPUTATION_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`],
      }) as bigint
    } catch (error) {
      console.error('Error fetching balance:', error)
      return 0n
    }
  }, [publicClient])

  return {
    getReputation,
    balanceOf,
  }
}
