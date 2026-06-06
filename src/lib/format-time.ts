const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

export function formatRelativeTime(value?: string | Date | null): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const diff = Date.now() - date.getTime()
  if (diff < MINUTE) return 'Just now'
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE)
    return `${mins} min ago`
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR)
    return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
  }
  if (diff < DAY * 7) {
    const days = Math.floor(diff / DAY)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatTrendPct(pct?: number | null, direction?: 'up' | 'down'): string {
  if (pct == null) return '—'
  const sign = direction === 'down' ? '' : '+'
  return `${sign}${pct}% vs last month`
}
