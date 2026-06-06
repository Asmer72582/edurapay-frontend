export type FeeStep = 1 | 2 | 3

export type FeeCategory = { name: string; amount: number }

export type Installment = { label: string; due_date: string; amount: number }

export type FeePlanPayload = {
  course_id: string
  name: string
  grade: string
  academic_year: string
  currency: string
  total_amount: number
  categories: FeeCategory[]
  installments: Installment[]
  status: 'active'
}

export const INSTALLMENT_PRESETS = [1, 2, 3, 4, 6, 8, 12]

export const CATEGORY_PRESETS = [
  'College Fee',
  'Tuition',
  'Exam Fee',
  'ID Card',
  'Books',
  'Stationery',
  'Transport',
  'Library',
  'Lab',
  'Sports',
  'Hostel',
  'Uniform',
  'Development Fee',
  'Other',
]

export const FEE_STEPS = [
  { id: 1 as const, label: 'Overall fee' },
  { id: 2 as const, label: 'Line items' },
  { id: 3 as const, label: 'Installments' },
]

export const SEGMENT_COLORS = ['bg-violet-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

export function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function distributeEqually(total: number, count: number): number[] {
  const n = Math.max(1, count)
  const base = Math.floor(total / n)
  const rem = total - base * n
  return Array.from({ length: n }, (_, i) => base + (i === 0 ? rem : 0))
}

export type AcademicMonth = { year: number; month: number }

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function monthKey(m: AcademicMonth): string {
  return `${m.year}-${String(m.month + 1).padStart(2, '0')}`
}

export function parseMonthKey(value: string): AcademicMonth | null {
  if (!value) return null
  const [y, m] = value.split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null
  return { year: y, month: Math.max(0, Math.min(11, m - 1)) }
}

/** Inclusive list of months between start and end. */
export function monthsBetween(start: AcademicMonth, end: AcademicMonth): AcademicMonth[] {
  const out: AcademicMonth[] = []
  let y = start.year
  let m = start.month
  const endIdx = end.year * 12 + end.month
  while (y * 12 + m <= endIdx) {
    out.push({ year: y, month: m })
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
  }
  return out
}

export function defaultAcademicYearRange(): { start: AcademicMonth; end: AcademicMonth } {
  const now = new Date()
  const y = now.getFullYear()
  // Indian academic year typically June → May of next year
  return {
    start: { year: y, month: 5 },
    end: { year: y + 1, month: 4 },
  }
}

/** Pick `count` evenly-distributed months from the inclusive range. */
export function distributeMonths(
  start: AcademicMonth,
  end: AcademicMonth,
  count: number,
): AcademicMonth[] {
  const range = monthsBetween(start, end)
  if (range.length === 0) return []
  if (count <= 1) return [range[0]]
  if (count >= range.length) return range.slice(0, count)
  const out: AcademicMonth[] = []
  const step = (range.length - 1) / (count - 1)
  for (let i = 0; i < count; i++) {
    const idx = Math.round(i * step)
    out.push(range[Math.min(range.length - 1, idx)])
  }
  return out
}

export function dueDateForMonth(m: AcademicMonth, day = 5): string {
  const safeDay = Math.min(day, new Date(m.year, m.month + 1, 0).getDate())
  return new Date(m.year, m.month, safeDay).toISOString().slice(0, 10)
}

export function buildInstallments(
  total: number,
  count: number,
  range?: { start: AcademicMonth; end: AcademicMonth },
): Installment[] {
  const amounts = distributeEqually(total, count)
  const months = range
    ? distributeMonths(range.start, range.end, count)
    : Array.from({ length: count }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() + i)
        return { year: d.getFullYear(), month: d.getMonth() } as AcademicMonth
      })
  return amounts.map((amount, i) => {
    const m = months[i] ?? months[months.length - 1]
    return {
      label: `${MONTH_NAMES[m.month]} ${m.year}`,
      due_date: dueDateForMonth(m),
      amount,
    }
  })
}

export function defaultAcademicYear() {
  const y = new Date().getFullYear()
  return `${y}-${y + 1}`
}

export function academicYearFromRange(start: AcademicMonth, end: AcademicMonth): string {
  if (start.year === end.year) return String(start.year)
  return `${start.year}-${end.year}`
}
