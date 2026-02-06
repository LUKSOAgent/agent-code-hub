import { IPFS_CONFIG } from './constants'

const NFT_STORAGE_API = 'https://api.nft.storage'

/**
 * Upload data to IPFS via NFT.Storage
 */
export async function uploadToIPFS(data: any): Promise<string> {
  const apiKey = import.meta.env.VITE_NFT_STORAGE_API_KEY || ''
  
  if (!apiKey) {
    console.warn('NFT.Storage API key not found, using mock hash')
    // Fallback to mock for development
    const jsonString = JSON.stringify(data)
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(jsonString)
    const hash = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hash))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return `Qm${hashHex.slice(0, 44)}`
  }

  try {
    const response = await fetch(`${NFT_STORAGE_API}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`NFT.Storage upload failed: ${error}`)
    }

    const result = await response.json()
    
    // NFT.Storage returns the CID in result.value.cid
    const cid = result.value?.cid || result.cid
    
    if (!cid) {
      throw new Error('No CID returned from NFT.Storage')
    }

    console.log('Uploaded to IPFS:', cid)
    return cid
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}

/**
 * Upload a file to IPFS via NFT.Storage
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_NFT_STORAGE_API_KEY || ''
  
  if (!apiKey) {
    throw new Error('NFT.Storage API key not configured')
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${NFT_STORAGE_API}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`NFT.Storage upload failed: ${error}`)
    }

    const result = await response.json()
    const cid = result.value?.cid || result.cid
    
    if (!cid) {
      throw new Error('No CID returned from NFT.Storage')
    }

    console.log('File uploaded to IPFS:', cid)
    return cid
  } catch (error) {
    console.error('IPFS file upload error:', error)
    throw error
  }
}

export function getIPFSUrl(hash: string): string {
  // Use ipfs.io gateway (reliable, no rate limits for viewing)
  return `https://ipfs.io/ipfs/${hash}`
}

export function getIPFSGatewayUrl(hash: string, gateway: string = 'https://ipfs.io'): string {
  return `${gateway}/ipfs/${hash}`
}

export async function fetchFromIPFS(hash: string): Promise<any> {
  try {
    const url = getIPFSUrl(hash)
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch from IPFS')
    return await response.json()
  } catch (error) {
    console.error('IPFS fetch error:', error)
    throw error
  }
}

/**
 * Check if a CID is available on IPFS
 */
export async function checkIPFSAvailability(hash: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(getIPFSUrl(hash), {
      method: 'HEAD',
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}
