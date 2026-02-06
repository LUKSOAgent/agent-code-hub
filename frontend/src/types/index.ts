import type React from 'react'

export interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  author: string
  authorAddress: string
  timestamp: number
  tags: string[]
  likes: number
  forks: number
  isVerified: boolean
  license?: string
  ipfsHash?: string
}

export interface User {
  address: string
  name?: string
  avatar?: string
  bio?: string
  reputation: number
  codeCount: number
  totalLikes: number
  joinedAt: number
  github?: string
  twitter?: string
  website?: string
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: number
  likes: number
}

export interface FilterOptions {
  language?: string
  tags?: string[]
  author?: string
  sortBy: 'newest' | 'popular' | 'trending'
  timeRange?: 'day' | 'week' | 'month' | 'all'
}

export type Theme = 'dark' | 'light'

export interface Web3ContextType {
  isConnected: boolean
  address: string | null
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

// Universal Profile types
export interface UPProfile {
  name?: string
  description?: string
  profileImage?: string
  backgroundImage?: string
  tags?: string[]
  links?: UPLink[]
}

export interface UPLink {
  title: string
  url: string
}

export interface UniversalProfile {
  address: string
  profile?: UPProfile
  isVerified: boolean
}

// Contract types
export interface CodeRegistration {
  ipfsHash: string
  name: string
  description: string
  tags: string[]
  language: string
  version: string
}

export interface CodeUpdate {
  codeId: string
  newIpfsHash: string
  version: string
}

export interface Attribution {
  contributor: string
  share: bigint
}

export interface ReputationData {
  address: string
  reputation: bigint
  balance: bigint
}

// Transaction types
export interface TransactionCall {
  contractAddress: string
  abi: any[]
  functionName: string
  args: any[]
  value?: bigint
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'success' | 'failed'
  error?: string
}
