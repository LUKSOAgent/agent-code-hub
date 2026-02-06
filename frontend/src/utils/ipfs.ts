import { IPFS_CONFIG } from './constants'

// Simple IPFS upload function using a public gateway for demo
// In production, use a proper IPFS client or pinning service
export async function uploadToIPFS(data: any): Promise<string> {
  // For demo purposes, we'll simulate an IPFS hash
  // In production, use ipfs-http-client or a pinning service like Pinata
  const jsonString = JSON.stringify(data)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(jsonString)
  
  // Create a hash-like string (this is just for demo)
  const hash = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hash))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Return IPFS-style hash (Qm... format simulation)
  return `Qm${hashHex.slice(0, 44)}`
}

export function getIPFSUrl(hash: string): string {
  return `${IPFS_CONFIG.gateway}/${hash}`
}

export async function fetchFromIPFS(hash: string): Promise<any> {
  try {
    const response = await fetch(getIPFSUrl(hash))
    if (!response.ok) throw new Error('Failed to fetch from IPFS')
    return await response.json()
  } catch (error) {
    console.error('IPFS fetch error:', error)
    throw error
  }
}
