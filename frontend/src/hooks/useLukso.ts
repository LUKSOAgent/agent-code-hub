import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { CONTRACTS } from '../utils/constants'
import { CODE_REGISTRY_ABI, CODE_ATTRIBUTION_ABI, REPUTATION_TOKEN_ABI } from '../abi/contracts'

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

  return {
    registerCode,
    updateCode,
    getCode,
    getCodesByCreator,
    getAllCodes,
  }
}

/**
 * Hook for CodeAttribution contract interactions
 */
export function useCodeAttribution() {
  const { executeTransaction, publicClient } = useWeb3()

  const addAttribution = useCallback(async (
    codeId: string,
    contributor: string,
    share: number
  ): Promise<string> => {
    return executeTransaction(
      CONTRACTS.luksoTestnet.codeAttribution,
      CODE_ATTRIBUTION_ABI as any,
      'addAttribution',
      [codeId, contributor, BigInt(share)]
    )
  }, [executeTransaction])

  const getAttributions = useCallback(async (codeId: string) => {
    if (!publicClient) return []
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.luksoTestnet.codeAttribution as `0x${string}`,
        abi: CODE_ATTRIBUTION_ABI,
        functionName: 'getAttributions',
        args: [codeId as `0x${string}`],
      })
    } catch (error) {
      console.error('Error fetching attributions:', error)
      return []
    }
  }, [publicClient])

  return {
    addAttribution,
    getAttributions,
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
        functionName: 'getReputation',
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
