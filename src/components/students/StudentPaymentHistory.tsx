import { useMemo, useState } from 'react'
import { ListOrdered } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/TableShell'
import { SelectField } from '@/components/ui/select-field'
import type { CourseOption } from '@/components/dashboard/StudentDataTable'
import { formatFeePeriodDisplay } from '@/lib/fee-period'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'

function installmentId(inst: Record<string, unknown>) {
  return String(inst.id ?? inst._id ?? '')
}

export function installmentPayStatus(inst: Record<string, unknown>) {
  const backendStatus = String(inst.pay_status ?? '').trim()
  if (backendStatus === 'paid') {
    return { label: 'Paid', variant: 'success' as const }
  }
  if (backendStatus === 'overdue') {
    return { label: 'Overdue', variant: 'danger' as const }
  }
  if (backendStatus === 'due_soon') {
    return { label: 'Due soon', variant: 'warning' as const }
  }

  const amount = Number(inst.amount ?? 0)
  const paid = Number(inst.paid_amount ?? 0)
  const unpaid = Math.max(0, amount - paid)
  if (unpaid <= 0.01) {
    return { label: 'Paid', variant: 'success' as const }
  }
  if (paid > 0.01) {
    return { label: 'Partial', variant: 'warning' as const }
  }
  const dueRaw = inst.due_date
  if (dueRaw) {
    const due = new Date(String(dueRaw))
    if (!Number.isNaN(due.getTime())) {
      const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
      const today = new Date()
      const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (dueDay < todayDay) {
        return { label: 'Overdue', variant: 'danger' as const }
      }
    }
  }
  return { label: 'Unpaid', variant: 'warning' as const }
}

function installmentPeriodLabel(inst: Record<string, unknown>) {
  const label = String(inst.label ?? '').trim()
  const due = inst.due_date ? String(inst.due_date).slice(0, 10) : ''
  if (due) {
    const period = formatFeePeriodDisplay(
      new Date(due).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    )
    if (period !== '—') return period
  }
  return formatFeePeriodDisplay(label) !== '—' ? formatFeePeriodDisplay(label) : label || 'Installment'
}

function courseIdFromInstallment(inst: Record<string, unknown>) {
  const meta = (inst.meta ?? {}) as Record<string, unknown>
  return String(meta.course_id ?? '').trim()
}

export function StudentPaymentHistory({
  installments,
  isLoading,
  coursesById,
  compact = false,
}: {
  installments: Record<string, unknown>[]
  isLoading?: boolean
  coursesById?: Map<string, CourseOption>
  compact?: boolean
}) {
  const [courseFilter, setCourseFilter] = useState('')

  const sorted = useMemo(
    () =>
      [...installments].sort((a, b) => {
        const da = a.due_date ? new Date(String(a.due_date)).getTime() : 0
        const db = b.due_date ? new Date(String(b.due_date)).getTime() : 0
        return da - db
      }),
    [installments],
  )

  const collectionOptions = useMemo(() => {
    const ids = new Set<string>()
    for (const inst of sorted) {
      const cid = courseIdFromInstallment(inst)
      if (cid) ids.add(cid)
    }
    const options = [{ value: '', label: 'All collections' }]
    for (const id of ids) {
      options.push({
        value: id,
        label: coursesById?.get(id)?.name ?? `Collection ${id.slice(-6)}`,
      })
    }
    return options
  }, [sorted, coursesById])

  const filtered = useMemo(() => {
    if (!courseFilter) return sorted
    return sorted.filter((inst) => courseIdFromInstallment(inst) === courseFilter)
  }, [sorted, courseFilter])

  const summary = useMemo(() => {
    let paid = 0
    let unpaid = 0
    for (const inst of filtered) {
      const amount = Number(inst.amount ?? 0)
      const paidAmt = Number(inst.paid_amount ?? 0)
      paid += paidAmt
      unpaid += Math.max(0, amount - paidAmt)
    }
    return { paid, unpaid, total: paid + unpaid }
  }, [filtered])

  const showCollectionFilter = collectionOptions.length > 2

  return (
    <div className={cn('space-y-3', compact && 'text-sm')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Payment history</span>
        </div>
        {showCollectionFilter && (
          <div className="w-full min-w-[180px] max-w-[240px]">
            <SelectField
              value={courseFilter}
              onChange={setCourseFilter}
              options={collectionOptions}
              aria-label="Filter by fee collection"
            />
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-border/50 rounded-lg border border-border/50 bg-muted/15 text-center text-xs">
          <div className="px-2 py-2">
            <div className="text-muted-foreground">Paid</div>
            <div className="mt-0.5 font-semibold text-emerald-700">{formatInr(summary.paid)}</div>
          </div>
          <div className="px-2 py-2">
            <div className="text-muted-foreground">Unpaid</div>
            <div className="mt-0.5 font-semibold text-rose-700">{formatInr(summary.unpaid)}</div>
          </div>
          <div className="px-2 py-2">
            <div className="text-muted-foreground">Total</div>
            <div className="mt-0.5 font-semibold">{formatInr(summary.total)}</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No installments yet. Assign a fee collection to generate the schedule and track paid vs unpaid amounts.
        </p>
      ) : (
        <ul className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
          {filtered.map((inst, i) => {
            const id = installmentId(inst) || String(i)
            const payStatus = installmentPayStatus(inst)
            const amount = Number(inst.amount ?? 0)
            const paid = Number(inst.paid_amount ?? 0)
            const unpaid = Math.max(0, amount - paid)
            const period = installmentPeriodLabel(inst)
            const courseId = courseIdFromInstallment(inst)
            const collectionName = courseId ? coursesById?.get(courseId)?.name : undefined

            return (
              <li
                key={id}
                className="rounded-xl border border-border/50 bg-white px-3 py-2.5 dark:bg-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{period}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {String(inst.label ?? '').trim() || `Installment ${i + 1}`}
                      {collectionName ? ` · ${collectionName}` : ''}
                      {inst.due_date
                        ? ` · Due ${new Date(String(inst.due_date)).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : ''}
                    </p>
                  </div>
                  <StatusBadge status={payStatus.label} variant={payStatus.variant} />
                </div>
                <div className="mt-2 flex justify-between gap-3 text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    Total <span className="font-semibold text-foreground">{formatInr(amount)}</span>
                  </span>
                  <span className="text-emerald-700">
                    Paid <span className="font-semibold">{formatInr(paid)}</span>
                  </span>
                  <span className={unpaid > 0.01 ? 'text-rose-700' : 'text-muted-foreground'}>
                    Due <span className="font-semibold">{formatInr(unpaid)}</span>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
