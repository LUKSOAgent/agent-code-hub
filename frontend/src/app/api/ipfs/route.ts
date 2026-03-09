import { NextRequest, NextResponse } from 'next/server'

const NFT_STORAGE_API = 'https://api.nft.storage'

export async function POST(request: NextRequest) {
  const apiKey = process.env.NFT_STORAGE_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'NFT.Storage API key not configured' },
      { status: 500 }
    )
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    let body: BodyInit
    let headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    }

    if (contentType.includes('multipart/form-data')) {
      // File upload - forward FormData
      body = await request.arrayBuffer()
      headers['Content-Type'] = contentType
    } else {
      // JSON upload
      body = await request.text()
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${NFT_STORAGE_API}/upload`, {
      method: 'POST',
      headers,
      body,
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `NFT.Storage upload failed: ${error}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    const cid = result.value?.cid || result.cid

    if (!cid) {
      return NextResponse.json(
        { error: 'No CID returned from NFT.Storage' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cid })
  } catch (error) {
    console.error('IPFS upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
