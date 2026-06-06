/** Display fee period as month name (e.g. "June 2026"), not "Installment 3". */
export function formatFeePeriodDisplay(raw: string): string {
  const text = raw.trim()
  if (!text || text === '—') return '—'

  const paren = text.match(/\(([A-Za-z]+\s+\d{4})\)/)
  if (paren) return paren[1]

  const monthYear = text.match(/\b([A-Za-z]+)\s+(\d{4})\b/)
  if (monthYear && !/^installment$/i.test(monthYear[1])) {
    return `${monthYear[1]} ${monthYear[2]}`
  }

  const stripped = text
    .replace(/^installment\s*\d+\s*/i, '')
    .replace(/\s+installment\s*$/i, '')
    .replace(/\s+fee\s*$/i, '')
    .trim()

  if (/^installment\s*\d+$/i.test(stripped)) return '—'

  const again = stripped.match(/\b([A-Za-z]+)\s+(\d{4})\b/)
  if (again && !/^installment$/i.test(again[1])) {
    return `${again[1]} ${again[2]}`
  }

  return stripped || '—'
}

export function feePeriodFromPaymentRow(row: Record<string, unknown>): string {
  const fromApi = String(row.fee_period_display ?? '').trim()
  if (fromApi && fromApi !== '—') return formatFeePeriodDisplay(fromApi)

  const ctx = (row.payment_context ?? {}) as Record<string, unknown>
  const label = String(ctx.period_label ?? '').trim()
  if (label) return formatFeePeriodDisplay(label)

  const labels = ctx.installment_labels
  if (Array.isArray(labels) && labels.length > 0) {
    const parsed = labels
      .map((l) => formatFeePeriodDisplay(String(l)))
      .filter((l) => l && l !== '—')
    if (parsed.length > 0) return parsed.join(', ')
  }

  return '—'
}
