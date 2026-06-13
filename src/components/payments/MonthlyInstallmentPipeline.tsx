import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import {
  useInstallmentMonthlySummary,
  type InstallmentMonthRow,
  type InstallmentMonthlySummary,
} from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'edurapay.payments.installment_pipeline_open'
const FILTERS_KEY = 'edurapay.payments.installment_pipeline_filters'

type SavedFilters = {
  courseId: string
  academicYear: string
  month: string
}

function readSavedFilters(): SavedFilters {
  if (typeof window === 'undefined') {
    return { courseId: '', academicYear: '', month: '' }
  }
  try {
    const raw = window.localStorage.getItem(FILTERS_KEY)
    if (!raw) return { courseId: '', academicYear: '', month: '' }
    const parsed = JSON.parse(raw) as Partial<SavedFilters>
    return {
      courseId: parsed.courseId ?? '',
      academicYear: parsed.academicYear ?? '',
      month: parsed.month ?? '',
    }
  } catch {
    return { courseId: '', academicYear: '', month: '' }
  }
}

function StatCell({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  sub?: string
  tone: 'amber' | 'violet' | 'rose' | 'emerald'
}) {
  const tones: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-900',
    violet: 'bg-violet-100 text-violet-800',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-xl font-bold tabular-nums">{value}</div>
        {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}

function MonthRow({ row, maxAmount }: { row: InstallmentMonthRow; maxAmount: number }) {
  const collected = row.due_amount_inr > 0 ? Math.min(100, (row.paid_amount_inr / row.due_amount_inr) * 100) : 0
  const totalWidth = maxAmount > 0 ? Math.min(100, (row.due_amount_inr / maxAmount) * 100) : 0

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 transition-colors',
        row.is_current
          ? 'border-violet-300 bg-violet-50/60 dark:bg-violet-950/30'
          : row.is_past
            ? 'border-border/40 bg-muted/20'
            : 'border-border/50 bg-card',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold">{row.label}</span>
          {row.is_current && (
            <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
              Now
            </span>
          )}
          {row.overdue_count > 0 && (
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-700">
              {row.overdue_count} overdue
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold tabular-nums">{formatInr(row.due_amount_inr)}</div>
          <div className="text-[11px] text-muted-foreground">{row.due_count} installments</div>
        </div>
      </div>

      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted/40">
        <div className="h-full rounded-full bg-violet-200/70" style={{ width: `${totalWidth}%` }}>
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${collected}%` }} />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px]">
        <span className="text-emerald-700">
          Collected {formatInr(row.paid_amount_inr)}{' '}
          <span className="text-muted-foreground">({row.collection_pct.toFixed(0)}%)</span>
        </span>
        <span className={cn(row.pending_amount_inr > 0 ? 'text-amber-800' : 'text-muted-foreground')}>
          Pending {formatInr(row.pending_amount_inr)}
        </span>
      </div>
    </div>
  )
}

type MonthlyInstallmentPipelineProps = {
  /** Preloaded from GET /payments-dashboard when filters are default — avoids a second API call. */
  embeddedSummary?: InstallmentMonthlySummary | null
}

export function MonthlyInstallmentPipeline({ embeddedSummary }: MonthlyInstallmentPipelineProps) {
  const saved = readSavedFilters()
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })
  const [courseId, setCourseId] = useState(saved.courseId)
  const [academicYear, setAcademicYear] = useState(saved.academicYear)
  const [month, setMonth] = useState(saved.month)

  const filtersAreDefault = !courseId && !academicYear && !month
  const useEmbedded = filtersAreDefault && Boolean(embeddedSummary)

  const { data, isLoading, isFetching } = useInstallmentMonthlySummary(
    {
      course_id: courseId,
      academic_year: academicYear,
      month,
      months_back: 1,
      months_ahead: 6,
    },
    { enabled: !useEmbedded },
  )

  const payload = useEmbedded ? embeddedSummary : data?.data
  const summary = payload?.summary
  const months = payload?.months ?? []
  const filterOptions = payload?.filter_options

  const collectionOptions = useMemo(() => {
    const list = [{ value: '', label: 'All collections' }]
    for (const c of filterOptions?.collections ?? []) {
      list.push({ value: c.id, label: c.name })
    }
    return list
  }, [filterOptions?.collections])

  const yearOptions = useMemo(() => {
    const list = [{ value: '', label: 'All academic years' }]
    for (const y of filterOptions?.academic_years ?? []) {
      list.push({ value: y, label: y })
    }
    return list
  }, [filterOptions?.academic_years])

  const monthOptions = useMemo(() => {
    const list = [{ value: '', label: courseId && academicYear ? 'All months' : 'Current window' }]
    for (const m of filterOptions?.months ?? []) {
      list.push({ value: m.value, label: m.label })
    }
    return list
  }, [filterOptions?.months, courseId, academicYear])

  const maxAmount = months.reduce((acc, m) => Math.max(acc, m.due_amount_inr), 0)
  const scheduleMode = Boolean(courseId && academicYear)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
  }, [open])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify({ courseId, academicYear, month }))
  }, [courseId, academicYear, month])

  // Reset dependent filters when parent selection no longer valid.
  useEffect(() => {
    if (academicYear && !(filterOptions?.academic_years ?? []).includes(academicYear)) {
      setAcademicYear('')
      setMonth('')
    }
  }, [filterOptions?.academic_years, academicYear])

  useEffect(() => {
    if (month && !(filterOptions?.months ?? []).some((m) => m.value === month)) {
      setMonth('')
    }
  }, [filterOptions?.months, month])

  const handleCourseChange = (value: string) => {
    setCourseId(value)
    setAcademicYear('')
    setMonth('')
  }

  const handleYearChange = (value: string) => {
    setAcademicYear(value)
    setMonth('')
  }

  const toggle = () => setOpen((v) => !v)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle>Monthly installment pipeline</CardTitle>
            {summary && summary.overdue_count > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700">
                {summary.overdue_count} overdue
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {scheduleMode
              ? 'Installment months for the selected collection and academic year.'
              : 'How many installments are due, paid and pending across the months.'}
          </p>
          {!open && summary && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="text-amber-800">
                <span className="font-semibold">{summary.this_month_count}</span> due this month ·{' '}
                {formatInr(summary.this_month_pending_inr)} pending
              </span>
              <span className="text-muted-foreground">
                <span className="font-semibold">{summary.total_pending_count}</span> total pending ·{' '}
                {formatInr(summary.total_pending_amount_inr)}
              </span>
              <span className="text-emerald-700">Lifetime {summary.collection_pct.toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          {open && summary && (
            <div className="hidden text-right text-xs sm:block">
              <div className="text-muted-foreground">Lifetime collection</div>
              <div className="text-sm font-semibold text-emerald-700">
                {summary.collection_pct.toFixed(1)}% · {formatInr(summary.total_collected_amount_inr)} /{' '}
                {formatInr(summary.total_billed_amount_inr)}
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="installment-pipeline-body"
          >
            {open ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" /> Hide
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" /> Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {open && (
        <CardContent id="installment-pipeline-body" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-full">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Collection</label>
              <SelectField
                value={courseId}
                onChange={handleCourseChange}
                options={collectionOptions}
                placeholder="All collections"
                aria-label="Collection"
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Academic year</label>
              <SelectField
                value={academicYear}
                onChange={handleYearChange}
                options={yearOptions}
                placeholder="All academic years"
                disabled={courseId !== '' && yearOptions.length <= 1}
                aria-label="Academic year"
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Month</label>
              <SelectField
                value={month}
                onChange={setMonth}
                options={monthOptions}
                placeholder={scheduleMode ? 'All months' : 'Current window'}
                disabled={scheduleMode && monthOptions.length <= 1}
                aria-label="Month"
              />
            </div>
          </div>

          {isLoading || (isFetching && !summary) ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-40" />
            </>
          ) : !summary ? (
            <p className="text-sm text-muted-foreground">Installment data unavailable.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCell
                  icon={AlertTriangle}
                  tone="rose"
                  label="Overdue installments"
                  value={`${summary.overdue_count}`}
                  sub={`${formatInr(summary.overdue_amount_inr)} past due`}
                />
                <StatCell
                  icon={CalendarDays}
                  tone="violet"
                  label="This month due"
                  value={`${summary.this_month_count}`}
                  sub={`${formatInr(summary.this_month_pending_inr)} pending of ${formatInr(summary.this_month_due_inr)}`}
                />
                <StatCell
                  icon={CalendarRange}
                  tone="amber"
                  label="Next month due"
                  value={`${summary.next_month_count}`}
                  sub={`${formatInr(summary.next_month_pending_inr)} pending of ${formatInr(summary.next_month_due_inr)}`}
                />
                <StatCell
                  icon={Clock}
                  tone="emerald"
                  label="Total pending"
                  value={`${summary.total_pending_count}`}
                  sub={`${formatInr(summary.total_pending_amount_inr)} across all months`}
                />
              </div>

              {months.length > 0 ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {scheduleMode ? 'Fee schedule months' : 'Monthly breakdown'}
                    </h4>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      Green bar = collected · Violet bar = due
                    </span>
                  </div>
                  <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
                    {months.map((row) => (
                      <MonthRow key={row.month} row={row} maxAmount={maxAmount} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {scheduleMode
                    ? 'No installments found for this collection and academic year.'
                    : 'No installments scheduled yet.'}
                </p>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
