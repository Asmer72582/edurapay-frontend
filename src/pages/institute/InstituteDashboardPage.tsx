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
import { ArrowUpRight, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Skeleton } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatInr } from '@/lib/institute-mock'
import { formatRelativeTime, formatTrendPct } from '@/lib/format-time'
import { useInstituteDashboard } from '@/hooks/useApi'

const METHOD_COLORS: Record<string, string> = {
  UPI: '#7c3aed',
  Cards: '#6366f1',
  Netbanking: '#8b5cf6',
  Wallet: '#a78bfa',
  Others: '#c4b5fd',
}

export function InstituteDashboardPage() {
  const { data, isLoading, isError } = useInstituteDashboard()
  const payload = data?.data

  const collections = payload?.monthly_collections ?? []
  const totalCollections = payload?.totals?.total_collections ?? collections.reduce((s, m) => s + m.collections, 0)
  const channelData = useMemo(
    () =>
      (payload?.payment_methods ?? []).map((m) => ({
        name: m.method,
        value: m.pct,
        color: METHOD_COLORS[m.method] ?? '#c4b5fd',
      })),
    [payload?.payment_methods],
  )

  const weeklyData = payload?.weekly_collections ?? []
  const collectionsTrendUp = payload?.trends?.collections_direction !== 'down'
  const newStudents = payload?.trends?.new_students_this_month ?? payload?.totals?.new_students_this_month ?? 0
  const overdueStudents = payload?.totals?.overdue_students ?? 0

  if (isError) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">Unable to load dashboard.</div>
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Overview' }, { label: 'Institute' }]}
        title="Institute overview"
        description="Real-time collections, student activity, and payment performance."
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
                View payments
              </Button>
            </Link>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total collections"
            value={formatInr(totalCollections, true)}
            trend={formatTrendPct(payload?.trends?.collections_pct, payload?.trends?.collections_direction)}
            trendUp={collectionsTrendUp}
          />
          <MetricCard
            label="Total students"
            value={String(payload?.totals?.students ?? 0)}
            trend={newStudents > 0 ? `+${newStudents} this month` : 'No new enrollments'}
            trendUp={newStudents > 0}
          />
          <MetricCard
            label="Overdue fees"
            value={formatInr(payload?.totals?.overdue_amount ?? 0, true)}
            trend={overdueStudents > 0 ? `${overdueStudents} students` : 'All clear'}
            trendUp={overdueStudents === 0}
          />
          <MetricCard
            label="Active students"
            value={String(payload?.totals?.active_students ?? 0)}
            trend={`${payload?.totals?.pending_payments ?? 0} pending payments`}
            trendUp={(payload?.totals?.pending_payments ?? 0) === 0}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Monthly collections</CardTitle>
              <p className="text-sm text-muted-foreground">Completed payments over the last 6 months</p>
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
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No collections yet.</div>
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
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                  <Area type="monotone" dataKey="collections" stroke="#7c3aed" fill="url(#instGmv)" strokeWidth={2.5} />
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
                      <span className="font-medium">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
                      <td className="py-3.5 pr-4 font-semibold">{formatInr(p.amount)}</td>
                      <td className="py-3.5">
                        <StatusBadge status={p.status} variant={statusVariant(p.status)} />
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
            <CardTitle className="text-lg">Recent students</CardTitle>
            <Link to="/app/institute/students">
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(payload?.recent_students ?? []).length === 0 && !isLoading ? (
              <p className="text-sm text-muted-foreground">No students yet.</p>
            ) : (
              (payload?.recent_students ?? []).map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 p-3">
                  <div>
                    <div className="font-medium">
                      {s.first_name} {s.last_name ?? ''}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.primary_email ?? s.email ?? '—'}</div>
                  </div>
                  <StatusBadge status={s.status} variant={statusVariant(s.status)} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Daily collections</CardTitle>
          <p className="text-sm text-muted-foreground">Completed payments over the last 7 days</p>
        </CardHeader>
        <CardContent className="h-48">
          {isLoading ? (
            <Skeleton className="h-full rounded-xl" />
          ) : weeklyData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No collections this week.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
                <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} labelFormatter={(_, items) => items?.[0]?.payload?.label ?? ''} />
                <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
