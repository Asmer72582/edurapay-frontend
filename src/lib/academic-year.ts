/** e.g. "2025-2026" → "2025-26" */
export function formatYearLabel(year: string): string {
  const trimmed = year.trim()
  if (!trimmed) return '—'
  const parts = trimmed.split('-')
  if (parts.length === 2 && parts[0].length === 4 && parts[1].length === 4) {
    return `${parts[0]}-${parts[1].slice(-2)}`
  }
  return trimmed
}

export function defaultAcademicYear(): string {
  const y = new Date().getFullYear()
  return `${y}-${y + 1}`
}

export function sortAcademicYearsDesc(years: string[]): string[] {
  return [...years].sort((a, b) => b.localeCompare(a))
}
