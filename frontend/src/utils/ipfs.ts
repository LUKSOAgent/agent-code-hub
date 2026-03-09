import { IPFS_CONFIG } from './constants'

/**
 * Upload data to IPFS via server-side API route
 */
export async function uploadToIPFS(data: any): Promise<string> {
  try {
    const response = await fetch('/api/ipfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'IPFS upload failed')
    }

    const { cid } = await response.json()
    console.log('Uploaded to IPFS:', cid)
    return cid
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}

/**
 * Upload a file to IPFS via server-side API route
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/ipfs', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'IPFS file upload failed')
    }

    const { cid } = await response.json()
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
