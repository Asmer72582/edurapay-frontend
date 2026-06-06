import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, FileText, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectField } from '@/components/ui/select-field'
import { useCollectionReport } from '@/hooks/useApi'
import { apiDownload } from '@/lib/api'
import { formatInr } from '@/lib/institute-mock'
import { exportCollectionReportPdf } from '@/lib/report-export'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

const ranges = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
] as const

const METHOD_COLORS: Record<string, string> = {
  UPI: '#7c3aed',
  Cards: '#6366f1',
  Netbanking: '#8b5cf6',
  Wallet: '#a78bfa',
  Others: '#c4b5fd',
}

export function ReportsPage() {
  const user = useAuthStore((s) => s.user)
  const [period, setPeriod] = useState<string>('12m')
  const [courseId, setCourseId] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)

  const { data, isLoading, isFetching, refetch } = useCollectionReport({
    course_id: courseId,
    academic_year: academicYear,
    period,
  })

  const report = data?.data

  const collectionOptions = useMemo(() => {
    const list = [{ value: '', label: 'All collections' }]
    for (const c of report?.filter_options?.collections ?? []) {
      list.push({ value: c.id, label: c.name })
    }
    return list
  }, [report?.filter_options?.collections])

  const yearOptions = useMemo(() => {
    const list = [{ value: '', label: 'All academic years' }]
    for (const y of report?.filter_options?.academic_years ?? []) {
      list.push({ value: y, label: y })
    }
    return list
  }, [report?.filter_options?.academic_years])

  const periodChartData = report?.by_period ?? []
  const collectionChartData = report?.by_collection ?? []
  const methodData = report?.payment_methods ?? []
  const summary = report?.summary

  const instituteLabel = user?.name?.trim() || 'Institute'

  const downloadCsv = async () => {
    setExporting('csv')
    try {
      await apiDownload(
        '/v1/reports/export.csv',
        {
          course_id: courseId || undefined,
          academic_year: academicYear || undefined,
          period,
        },
        `edurapay-collection-report-${new Date().toISOString().slice(0, 10)}.csv`,
      )
      toast.success('CSV downloaded.')
    } catch {
      toast.error('Could not export CSV.')
    } finally {
      setExporting(null)
    }
  }

  const downloadPdf = () => {
    if (!report) {
      toast.error('Report data is not ready yet.')
      return
    }
    setExporting('pdf')
    try {
      exportCollectionReportPdf(report, instituteLabel)
      toast.success('PDF print dialog opened — save as PDF from your browser.')
    } catch {
      toast.error('Could not open PDF export.')
    } finally {
      setExporting(null)
    }
  }

  const busy = isLoading || isFetching

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Engagement' }, { label: 'Reports' }]}
        title="Reports & analytics"
        description="Collection-wise and period-wise fee reports for trustees and compliance. Export CSV or PDF."
        actions={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <SelectField
                  value={courseId}
                  onChange={setCourseId}
                  options={collectionOptions}
                  aria-label="Filter by collection"
                />
              </div>
              <div className="w-44">
                <SelectField
                  value={academicYear}
                  onChange={setAcademicYear}
                  options={yearOptions}
                  aria-label="Filter by academic year"
                />
              </div>
              <div className="flex rounded-xl border border-border/60 bg-card p-1">
                {ranges.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setPeriod(r.value)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                      period === r.value ? 'bg-violet-100 text-violet-700' : 'text-muted-foreground',
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={busy}
              onClick={() => refetch()}
            >
              <RefreshCw className={cn('mr-1.5 h-4 w-4', busy && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!report || exporting !== null}
              onClick={() => void downloadCsv()}
            >
              {exporting === 'csv' ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!report || exporting !== null}
              onClick={downloadPdf}
            >
              {exporting === 'pdf' ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-1.5 h-4 w-4" />
              )}
              Export PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Collected"
          value={summary ? formatInr(summary.collected_inr, true) : '—'}
          trend={summary ? `${summary.collection_rate_pct}% of assigned` : 'Loading…'}
          trendUp={!!summary && summary.collection_rate_pct >= 80}
        />
        <MetricCard
          label="Pending"
          value={summary ? formatInr(summary.pending_inr, true) : '—'}
          trend="Not yet overdue"
          trendUp
        />
        <MetricCard
          label="Overdue"
          value={summary ? formatInr(summary.overdue_inr, true) : '—'}
          trend={summary ? `${summary.overdue_ratio_pct}% of outstanding` : '—'}
          trendUp={false}
        />
        <MetricCard
          label="Students with fees"
          value={summary ? String(summary.students_with_fees) : '—'}
          trend={summary ? formatInr(summary.total_assigned_inr, true) + ' assigned' : '—'}
          trendUp
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Period-wise collections</CardTitle>
            <p className="text-sm text-muted-foreground">
              Collected (payments) vs pending and overdue for installments due in each period.
            </p>
          </CardHeader>
          <CardContent className="h-80">
            {busy ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading report…
              </div>
            ) : periodChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No period data for the selected filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodChartData}>
                  <defs>
                    <linearGradient id="reportCollections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="period_label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (Number(v) >= 100000 ? `₹${Number(v) / 100000}L` : `₹${Number(v) / 1000}k`)}
                  />
                  <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="collected_inr"
                    name="Collected"
                    stroke="#7c3aed"
                    fill="url(#reportCollections)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending_inr"
                    name="Pending"
                    stroke="#f59e0b"
                    fill="transparent"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="overdue_inr"
                    name="Overdue"
                    stroke="#f43f5e"
                    fill="transparent"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
            <p className="text-sm text-muted-foreground">By completed transaction amount in range.</p>
          </CardHeader>
          <CardContent>
            {methodData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No completed payments in this period.</p>
            ) : (
              <>
                <div className="mx-auto h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={methodData} innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="amount_inr" nameKey="method">
                        {methodData.map((e) => (
                          <Cell key={e.method} fill={METHOD_COLORS[e.method] ?? '#c4b5fd'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {methodData.map((m) => (
                    <div key={m.method} className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: METHOD_COLORS[m.method] ?? '#c4b5fd' }}
                        />
                        {m.method}
                      </span>
                      <span className="font-medium tabular-nums">
                        {m.pct}% · {formatInr(m.amount_inr)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Collection-wise breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {collectionChartData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No fee collections match the current filters.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionChartData} margin={{ bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="course_name"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (Number(v) >= 100000 ? `₹${Number(v) / 100000}L` : `₹${Number(v) / 1000}k`)}
                />
                <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                <Legend />
                <Bar dataKey="collected_inr" name="Collected" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending_inr" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue_inr" name="Overdue" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {collectionChartData.length > 0 && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Collection detail table</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Collection</th>
                  <th className="px-4 py-3">Academic year</th>
                  <th className="px-4 py-3 text-right">Collected</th>
                  <th className="px-4 py-3 text-right">Pending</th>
                  <th className="px-4 py-3 text-right">Overdue</th>
                  <th className="px-4 py-3 text-right">Assigned</th>
                  <th className="px-4 py-3 text-right">Students</th>
                </tr>
              </thead>
              <tbody>
                {collectionChartData.map((row) => (
                  <tr key={row.course_id} className="border-b border-border/40">
                    <td className="px-4 py-3 font-medium">{row.course_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.academic_year || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInr(row.collected_inr)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInr(row.pending_inr)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-rose-600">{formatInr(row.overdue_inr)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInr(row.total_assigned_inr)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.student_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
