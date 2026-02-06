export function formatDistanceToNow(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return ''
  return `${address.slice(0, start)}...${address.slice(-end)}`
}
