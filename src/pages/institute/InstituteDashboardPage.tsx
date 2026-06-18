import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  ChevronRight,
  Download,
  Link2,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Skeleton, Badge } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatInr } from '@/lib/institute-mock'
import { formatRelativeTime, formatTrendPct } from '@/lib/format-time'
import { useInstituteDashboard } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

const METHOD_COLORS: Record<string, string> = {
  UPI: '#7c3aed',
  Cards: '#6366f1',
  Netbanking: '#8b5cf6',
  Wallet: '#a78bfa',
  Cash: '#059669',
  'UPI (offline)': '#10b981',
  Cheque: '#34d399',
  'Bank transfer': '#6ee7b7',
  Online: '#6366f1',
  Others: '#c4b5fd',
}

const ACTION_ROUTES: Record<string, string> = {
  overdue_fees: '/app/institute/defaulters',
  open_links: '/app/institute/payments',
  pending_payments: '/app/institute/transactions',
  send_links: '/app/institute/payments',
}

const PRIORITY_STYLES = {
  high: 'border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20',
  medium: 'border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20',
  low: 'border-violet-200/80 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20',
}

function formatChartInr(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`
  return `₹${v}`
}

export function InstituteDashboardPage() {
  const { data, isLoading, isError } = useInstituteDashboard()
  const payload = data?.data
  const totals = payload?.totals

  const totalAssigned = totals?.total_fees_assigned_inr ?? payload?.fee_overview?.total_assigned_inr ?? 0
  const collected = totals?.fee_collected_inr ?? payload?.fee_overview?.collected_inr ?? 0
  const stillDue = totals?.fee_due_inr ?? payload?.fee_overview?.due_inr ?? 0
  const collectionPct = totals?.collection_pct ?? payload?.fee_overview?.collection_pct ?? 0

  const feeChartData = useMemo(() => {
    const fromApi = payload?.fee_overview?.chart
    if (fromApi && fromApi.length > 0) {
      return fromApi.filter((s) => s.amount_inr > 0)
    }
    const rows = []
    if (collected > 0) rows.push({ name: 'Collected', amount_inr: collected, color: '#7c3aed' })
    if (stillDue > 0) rows.push({ name: 'Still due', amount_inr: stillDue, color: '#d1d5db' })
    return rows
  }, [payload?.fee_overview?.chart, collected, stillDue])

  const collections = payload?.monthly_collections ?? []
  const totalCollections = totals?.total_collections ?? collections.reduce((s, m) => s + m.collections, 0)
  const channelData = useMemo(
    () =>
      (payload?.payment_methods ?? []).map((m) => ({
        name: m.method,
        value: m.pct,
        amount_inr: m.amount_inr,
        color: METHOD_COLORS[m.method] ?? '#c4b5fd',
      })),
    [payload?.payment_methods],
  )

  const weeklyData = payload?.weekly_collections ?? []
  const collectionsTrendUp = payload?.trends?.collections_direction !== 'down'
  const newStudents = payload?.trends?.new_students_this_month ?? totals?.new_students_this_month ?? 0
  const actionItems = payload?.action_items ?? []

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">
        Unable to load dashboard.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Overview' }, { label: 'Institute' }]}
        title="Institute overview"
        description="Fee assignments, collections, and what needs your attention."
        actions={
          <>
            <Link to="/app/institute/reports">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Download className="mr-1.5 h-4 w-4" />
                Export report
              </Button>
            </Link>
            <Link to="/app/institute/payments">
              <Button size="sm" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
                <Link2 className="mr-1.5 h-4 w-4" />
                Send payment link
              </Button>
            </Link>
          </>
        }
      />

      {/* Fee collection hero */}
      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
          <div className="border-b border-border/60 p-6 lg:border-b-0 lg:border-r">
            {isLoading ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fee collection progress</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{collectionPct}% received</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatInr(collected)} of {formatInr(totalAssigned)} assigned to students
                    </p>
                  </div>
                  <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {totals?.enrolled_students ?? totals?.students ?? 0} enrolled
                  </Badge>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Collected</span>
                    <span>Still due</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, collectionPct))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total fees</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{formatInr(totalAssigned)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Assigned to students</p>
                  </div>
                  <div className="rounded-xl border border-violet-200/60 bg-violet-50/40 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
                    <p className="text-xs font-medium uppercase tracking-wider text-violet-700 dark:text-violet-400">
                      Collected
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-violet-900 dark:text-violet-100">
                      {formatInr(collected)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Received so far</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Still due</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{formatInr(stillDue)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Not yet paid</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-6">
            {isLoading ? (
              <Skeleton className="h-44 w-44 rounded-full" />
            ) : feeChartData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No fee data yet.</p>
            ) : (
              <>
                <div className="h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feeChartData}
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="amount_inr"
                        nameKey="name"
                      >
                        {feeChartData.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 w-full space-y-1.5">
                  {feeChartData.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-semibold tabular-nums">{formatInr(c.amount_inr)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* KPI row */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            simple
            label="Paid online"
            value={formatInr(totals?.online_collected_inr ?? 0)}
            trend={
              totals?.online_collected_this_month_inr
                ? `${formatInr(totals.online_collected_this_month_inr)} this month`
                : 'Razorpay payments'
            }
            trendUp={(totals?.online_collected_inr ?? 0) > 0}
          />
          <MetricCard
            simple
            label="Paid at counter"
            value={formatInr(totals?.offline_collected_inr ?? 0)}
            trend={
              totals?.offline_collected_this_month_inr
                ? `${formatInr(totals.offline_collected_this_month_inr)} this month`
                : 'Cash & bank'
            }
            trendUp={(totals?.offline_collected_inr ?? 0) > 0}
          />
          <MetricCard
            simple
            label="Links sent"
            value={String(totals?.payment_links_sent ?? payload?.payment_links?.sent ?? 0)}
            trend={
              (totals?.open_payment_links ?? payload?.payment_links?.open ?? 0) > 0
                ? `${totals?.open_payment_links ?? payload?.payment_links?.open} unpaid · ${totals?.paid_payment_links ?? payload?.payment_links?.paid ?? 0} paid`
                : 'All links paid'
            }
            trendUp={(totals?.payment_links_sent ?? 0) > 0}
          />
          <MetricCard
            simple
            label="Overdue fees"
            value={formatInr(totals?.overdue_amount ?? 0)}
            trend={
              (totals?.overdue_students ?? 0) > 0
                ? `${totals?.overdue_students} student${(totals?.overdue_students ?? 0) === 1 ? '' : 's'}`
                : 'All on time'
            }
            trendUp={(totals?.overdue_students ?? 0) === 0}
          />
        </div>
      )}

      {/* Action items + students */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Needs attention</CardTitle>
              <p className="text-sm text-muted-foreground">Priority tasks for your team</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : actionItems.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">All caught up</p>
                  <p className="text-sm text-muted-foreground">No overdue fees or pending links right now.</p>
                </div>
              </div>
            ) : (
              actionItems.map((item) => (
                <Link
                  key={item.key}
                  to={ACTION_ROUTES[item.key] ?? '/app/institute/payments'}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:opacity-90',
                    PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.medium,
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-black/20">
                      {item.key === 'overdue_fees' ? (
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                      ) : item.key === 'send_links' ? (
                        <Link2 className="h-4 w-4 text-violet-600" />
                      ) : (
                        <Banknote className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.amount_inr != null && item.amount_inr > 0 && (
                        <p className="mt-1 text-sm font-bold tabular-nums text-foreground">
                          {formatInr(item.amount_inr)}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Students</CardTitle>
            <p className="text-sm text-muted-foreground">Enrollment snapshot</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-36 rounded-xl" />
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-violet-600" />
                    <span className="text-sm text-muted-foreground">Total students</span>
                  </div>
                  <span className="text-2xl font-bold tabular-nums">{totals?.students ?? 0}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
                    <p className="text-2xl font-bold tabular-nums">{totals?.active_students ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
                    <p className="text-2xl font-bold tabular-nums">{newStudents}</p>
                    <p className="text-xs text-muted-foreground">New this month</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
                    <p className="text-2xl font-bold tabular-nums">{totals?.on_time_payment_pct ?? 0}%</p>
                    <p className="text-xs text-muted-foreground">On time</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
                    <p className="text-2xl font-bold tabular-nums">{totals?.students_with_fees ?? 0}</p>
                    <p className="text-xs text-muted-foreground">With fees</p>
                  </div>
                </div>
                <Link to="/app/institute/students">
                  <Button variant="outline" size="sm" className="w-full rounded-xl">
                    View all students
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Monthly collections</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatInr(totalCollections)} total · last 6 months
              </p>
            </div>
            <Link to="/app/institute/reports">
              <Button variant="ghost" size="sm" className="text-primary">
                Details <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full rounded-xl" />
            ) : collections.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No collections yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={collections}>
                  <defs>
                    <linearGradient id="instGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatChartInr}
                  />
                  <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                  <Area
                    type="monotone"
                    dataKey="collections"
                    stroke="#7c3aed"
                    fill="url(#instGmv)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Payment channels</CardTitle>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-40 w-40 rounded-full" />
            ) : channelData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No payment data yet.</p>
            ) : (
              <>
                <div className="mx-auto h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={channelData} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                        {channelData.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {channelData.map((c) => (
                    <div key={c.name} className="flex justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="font-medium tabular-nums">
                        {c.value}% · {formatInr(c.amount_inr, true)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent payments</CardTitle>
            <Link to="/app/institute/transactions">
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : (payload?.recent_payments ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pr-4 font-semibold">Transaction</th>
                    <th className="pb-3 pr-4 font-semibold">Student</th>
                    <th className="pb-3 pr-4 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(payload?.recent_payments ?? []).map((p) => (
                    <tr key={p.id} className="border-b border-border/40 hover:bg-muted/20">
                      <td className="py-3.5 pr-4">
                        <div className="font-medium">{p.transaction_id}</div>
                        <div className="text-xs text-muted-foreground">{formatRelativeTime(p.created_at)}</div>
                      </td>
                      <td className="py-3.5 pr-4">{p.student_name}</td>
                      <td className="py-3.5 pr-4 font-semibold tabular-nums">{formatInr(p.amount)}</td>
                      <td className="py-3.5">
                        <StatusBadge
                          status={p.status_label ?? p.status}
                          variant={statusVariant(String(p.status_label ?? p.status))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">This month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-36 rounded-xl" />
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Collections</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatInr(totals?.collections_this_month ?? 0)}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-xs font-medium',
                      collectionsTrendUp ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {formatTrendPct(payload?.trends?.collections_pct, payload?.trends?.collections_direction)} vs last
                    month
                  </p>
                </div>
                <div className="h-36">
                  {weeklyData.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No collections this week.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={formatChartInr}
                          width={42}
                        />
                        <Tooltip
                          formatter={(v) => formatInr(Number(v ?? 0))}
                          labelFormatter={(_, items) => items?.[0]?.payload?.label ?? ''}
                        />
                        <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <p className="text-center text-xs text-muted-foreground">Daily collections · last 7 days</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
