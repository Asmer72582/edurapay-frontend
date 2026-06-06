import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, Download, FileText, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { Skeleton } from '@/components/ui/label'
import {
  useAuditCompliance,
  useAuditDashboard,
  useAuditEvents,
  useAuditReport,
} from '@/hooks/useApi'
import { apiDownload } from '@/lib/api'
import { exportAuditReportPdf } from '@/lib/audit-export'
import { formatInr } from '@/lib/institute-mock'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import type { AuditReportType } from '@/types/audit'
import { cn } from '@/lib/utils'

type Tab = 'dashboard' | 'compliance' | 'trail' | 'reports'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'trail', label: 'Audit trail' },
  { id: 'reports', label: 'Reports' },
]

const ENTITY_OPTIONS = [
  { value: 'all', label: 'All entities' },
  { value: 'auth', label: 'Login / auth' },
  { value: 'student', label: 'Students' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'payment', label: 'Payments' },
  { value: 'fee_plan', label: 'Fee plans' },
  { value: 'institute', label: 'Institute' },
] as const

const REPORT_OPTIONS: { value: AuditReportType; label: string }[] = [
  { value: 'full_audit_pack', label: 'Full audit pack (PDF)' },
  { value: 'financial_summary', label: 'Financial summary' },
  { value: 'student_wise_fees', label: 'Student-wise fee report' },
  { value: 'class_wise_collection', label: 'Class-wise collection' },
  { value: 'pending_fees', label: 'Pending fees' },
  { value: 'refunds', label: 'Refunds' },
  { value: 'scholarships', label: 'Scholarships & concessions' },
  { value: 'collections_daily', label: 'Daily collections' },
  { value: 'collections_monthly', label: 'Monthly collections' },
  { value: 'collections_yearly', label: 'Yearly collections' },
  { value: 'payment_reconciliation', label: 'Payment reconciliation' },
]

function fmt(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function defaultFromDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().slice(0, 10)
}

export function AuditCompliancePage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [from, setFrom] = useState(defaultFromDate)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [courseId, setCourseId] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [studentId, setStudentId] = useState('')
  const [auditorNotes, setAuditorNotes] = useState('')
  const [reportType, setReportType] = useState<AuditReportType>('full_audit_pack')
  const [exporting, setExporting] = useState<'csv' | 'pdf' | 'trail' | null>(null)

  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState('all')
  const [action, setAction] = useState('all')
  const [page, setPage] = useState(1)

  const sharedFilters = useMemo(
    () => ({
      from,
      to,
      course_id: courseId,
      academic_year: academicYear,
      student_id: studentId,
      auditor_notes: auditorNotes,
    }),
    [from, to, courseId, academicYear, studentId, auditorNotes],
  )

  const dashboard = useAuditDashboard(sharedFilters)
  const compliance = useAuditCompliance(sharedFilters)
  const reportQuery = useAuditReport(reportType, sharedFilters, tab === 'reports')
  const events = useAuditEvents({
    search,
    entity,
    action,
    from,
    to,
    course_id: courseId,
    academic_year: academicYear,
    student_id: studentId,
    page,
    per_page: LIST_PAGE_SIZE,
  })

  const dash = dashboard.data?.data
  const comp = compliance.data?.data
  const pagination = useMemo(() => parsePaginated<Record<string, unknown>>(events.data), [events.data])
  const trailRows = pagination.items

  const collectionOptions = useMemo(() => {
    const list = [{ value: '', label: 'All collections' }]
    for (const c of dash?.filter_options?.collections ?? []) {
      list.push({ value: c.id, label: c.name })
    }
    return list
  }, [dash?.filter_options?.collections])

  const yearOptions = useMemo(() => {
    const list = [{ value: '', label: 'All academic years' }]
    for (const y of dash?.filter_options?.academic_years ?? []) {
      list.push({ value: y, label: y })
    }
    return list
  }, [dash?.filter_options?.academic_years])

  const chartData = dash?.collection_analytics ?? []
  const m = dash?.metrics

  const exportTrailCsv = async () => {
    setExporting('trail')
    try {
      await apiDownload(
        '/v1/audit/events/export',
        {
          search: search || undefined,
          entity: entity !== 'all' ? entity : undefined,
          action: action !== 'all' ? action : undefined,
          from,
          to,
          course_id: courseId || undefined,
          academic_year: academicYear || undefined,
          student_id: studentId || undefined,
        },
        `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`,
      )
      toast.success('Audit trail exported.')
    } catch {
      toast.error('Export failed.')
    } finally {
      setExporting(null)
    }
  }

  const exportReportCsv = async () => {
    setExporting('csv')
    try {
      await apiDownload(
        '/v1/audit/reports/export.csv',
        {
          type: reportType,
          from,
          to,
          course_id: courseId || undefined,
          academic_year: academicYear || undefined,
          student_id: studentId || undefined,
          auditor_notes: auditorNotes || undefined,
        },
        `audit-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`,
      )
      toast.success('Excel-compatible CSV downloaded.')
    } catch {
      toast.error('Could not export report.')
    } finally {
      setExporting(null)
    }
  }

  const exportReportPdf = () => {
    const payload = reportQuery.data?.data
    if (!payload) {
      toast.error('Generate the report first.')
      return
    }
    setExporting('pdf')
    try {
      exportAuditReportPdf(payload)
      toast.success('PDF opened for print or save.')
    } finally {
      setExporting(null)
    }
  }

  const filterBar = (
    <div className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:grid-cols-6">
      <div className="space-y-1 lg:col-span-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From</div>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To</div>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collection</div>
        <SelectField value={courseId} onChange={setCourseId} options={collectionOptions} />
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic year</div>
        <SelectField value={academicYear} onChange={setAcademicYear} options={yearOptions} />
      </div>
      <div className="space-y-1 lg:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student id</div>
        <Input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Filter by student id (optional)"
          className="rounded-xl"
        />
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Workspace' }, { label: 'Audit & Compliance' }]}
        title="Audit & compliance"
        description="Dashboard KPIs, compliance monitoring, immutable audit trail, and auditor-ready PDF/Excel reports."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'default' : 'outline'}
            className="rounded-xl"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {filterBar}

      {tab === 'dashboard' && (
        <div className="space-y-6">
          {dashboard.isLoading ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Fees collected (period)" value={formatInr(m?.total_fees_collected_inr ?? 0, true)} />
                <MetricCard label="Pending fees" value={formatInr(m?.pending_fees_inr ?? 0, true)} />
                <MetricCard label="Overdue" value={formatInr(m?.overdue_payments_inr ?? 0, true)} />
                <MetricCard
                  label="Scholarships / concessions"
                  value={formatInr(m?.scholarships_concessions_inr ?? 0, true)}
                  trend={`${m?.scholarships_concessions_count ?? 0} active`}
                  simple
                />
                <MetricCard label="Refunds" value={formatInr(m?.refunds_inr ?? 0, true)} trend="No refund module yet" simple />
                <MetricCard
                  label="Reconciled"
                  value={String(m?.reconciled_transactions ?? 0)}
                  trend={`${m?.unreconciled_transactions ?? 0} unreconciled`}
                  simple
                />
                <MetricCard label="Collection rate" value={`${m?.collection_rate_pct ?? 0}%`} />
                <MetricCard label="Overdue students" value={String(m?.overdue_students ?? 0)} />
              </div>
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Collection analytics</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  {chartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No capture transactions in this period.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => formatInr(v)} />
                        <Area type="monotone" dataKey="collected_inr" stroke="#7c3aed" fill="#7c3aed33" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === 'compliance' && (
        <div className="space-y-4">
          {compliance.isLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-5">
                <div
                  className={cn(
                    'flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold',
                    (comp?.compliance_score ?? 0) >= 80
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : (comp?.compliance_score ?? 0) >= 60
                        ? 'bg-amber-500/15 text-amber-700'
                        : 'bg-rose-500/15 text-rose-700',
                  )}
                >
                  {comp?.compliance_score ?? 0}%
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Compliance score</h3>
                  <p className="text-sm text-muted-foreground">
                    {comp?.summary.total_findings ?? 0} findings · {comp?.summary.high_severity ?? 0} high severity
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {(comp?.findings ?? []).length === 0 ? (
                  <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                    No compliance issues detected for the selected filters.
                  </p>
                ) : (
                  (comp?.findings ?? []).map((f, i) => (
                    <div
                      key={`${f.code}-${i}`}
                      className="flex gap-3 rounded-xl border border-border/60 bg-card p-4"
                    >
                      <AlertTriangle
                        className={cn(
                          'mt-0.5 h-5 w-5 shrink-0',
                          f.severity === 'high'
                            ? 'text-rose-600'
                            : f.severity === 'medium'
                              ? 'text-amber-600'
                              : 'text-muted-foreground',
                        )}
                      />
                      <div>
                        <div className="font-medium">{f.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {f.code.replace(/_/g, ' ')} · {f.severity}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{f.detail}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'trail' && (
        <>
          <div className="flex justify-end">
            <Button variant="outline" className="rounded-xl" onClick={exportTrailCsv} disabled={exporting === 'trail'}>
              <Download className="mr-1.5 h-4 w-4" />
              Export trail (CSV)
            </Button>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4 lg:grid-cols-4">
            <SelectField
              value={entity}
              onChange={(v) => {
                setEntity(v)
                setPage(1)
              }}
              options={[...ENTITY_OPTIONS]}
              leadingIcon={Shield}
            />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search user, IP, entity id..."
              className="rounded-xl lg:col-span-3"
            />
          </div>
          <TableShell
            countLabel={`${pagination.total} events`}
            pagination={{
              page: pagination.page,
              lastPage: pagination.lastPage,
              total: pagination.total,
              perPage: pagination.perPage,
              onPageChange: setPage,
              disabled: events.isLoading || events.isFetching,
            }}
          >
            {events.isLoading ? (
              <Skeleton className="h-64 rounded-2xl" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3.5">Time</th>
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Action</th>
                      <th className="px-5 py-3.5">Entity</th>
                      <th className="px-5 py-3.5">Old → New</th>
                      <th className="px-5 py-3.5">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trailRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                          No events found.
                        </td>
                      </tr>
                    ) : (
                      trailRows.map((r) => {
                        const oldV = (r.old_values ?? {}) as Record<string, unknown>
                        const newV = (r.new_values ?? {}) as Record<string, unknown>
                        const changePreview =
                          Object.keys(oldV).length || Object.keys(newV).length
                            ? `${JSON.stringify(oldV).slice(0, 60)} → ${JSON.stringify(newV).slice(0, 60)}`
                            : '—'
                        return (
                          <tr key={String(r.id ?? r._id)} className="border-b border-border/40 hover:bg-muted/20">
                            <td className="px-5 py-4 whitespace-nowrap">{fmt(String(r.created_at ?? ''))}</td>
                            <td className="px-5 py-4">
                              <div className="font-medium">
                                {String(r.actor_name ?? r.actor_user_id ?? '—')}
                              </div>
                              <div className="text-xs text-muted-foreground">{String(r.actor_role ?? '')}</div>
                            </td>
                            <td className="px-5 py-4 font-semibold text-violet-700">{String(r.action ?? '')}</td>
                            <td className="px-5 py-4">
                              {String(r.entity ?? '')}
                              <div className="font-mono text-xs text-muted-foreground">{String(r.entity_id ?? '')}</div>
                            </td>
                            <td className="max-w-xs truncate px-5 py-4 text-xs text-muted-foreground">{changePreview}</td>
                            <td className="px-5 py-4 font-mono text-xs">{String(r.ip ?? '—')}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TableShell>
        </>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          <Card className="rounded-2xl border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Audit reports</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Report type</div>
                <SelectField value={reportType} onChange={(v) => setReportType(v as AuditReportType)} options={REPORT_OPTIONS} />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Auditor notes</div>
                <Input
                  value={auditorNotes}
                  onChange={(e) => setAuditorNotes(e.target.value)}
                  placeholder="Notes included in full audit pack PDF"
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-wrap gap-2 lg:col-span-2">
                <Button
                  className="rounded-xl"
                  variant="outline"
                  onClick={() => reportQuery.refetch()}
                  disabled={reportQuery.isFetching}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  Preview data
                </Button>
                <Button className="rounded-xl" onClick={exportReportPdf} disabled={exporting === 'pdf' || !reportQuery.data}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Export PDF
                </Button>
                <Button className="rounded-xl" variant="secondary" onClick={exportReportCsv} disabled={exporting === 'csv'}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Export Excel (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>
          {reportQuery.isFetching && <Skeleton className="h-32 rounded-2xl" />}
          {reportQuery.data?.data && (
            <Card className="rounded-2xl border-border/60">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {reportQuery.data.data.institution.name} · {reportQuery.data.data.report_type.replace(/_/g, ' ')} ·{' '}
                  {reportQuery.data.data.audit_period.from} – {reportQuery.data.data.audit_period.to}
                </p>
                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">
                  {JSON.stringify(reportQuery.data.data.sections, null, 2).slice(0, 4000)}
                  {(JSON.stringify(reportQuery.data.data.sections).length ?? 0) > 4000 ? '\n…' : ''}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
