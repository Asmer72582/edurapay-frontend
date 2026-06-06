import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, Filter } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Skeleton, Badge } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSuperAdminDashboard } from '@/hooks/useApi'

const paymentChannels = [
  { name: 'UPI', value: 42, color: '#7c3aed' },
  { name: 'Cards', value: 28, color: '#6366f1' },
  { name: 'Netbanking', value: 18, color: '#8b5cf6' },
  { name: 'Wallets', value: 8, color: '#a78bfa' },
  { name: 'EMI', value: 4, color: '#c4b5fd' },
]

const liveTransactions = [
  { id: 'TXN-9281', institute: 'Springfield Academy', amount: '₹12,400', method: 'UPI', status: 'completed', time: '2m ago' },
  { id: 'TXN-9280', institute: 'Delhi Public School', amount: '₹8,200', method: 'Card', status: 'completed', time: '5m ago' },
  { id: 'TXN-9279', institute: 'Ryan International', amount: '₹15,600', method: 'UPI', status: 'pending', time: '8m ago' },
  { id: 'TXN-9278', institute: 'Springfield Academy', amount: '₹6,800', method: 'Netbanking', status: 'completed', time: '12m ago' },
]

const settlementData = [
  { day: 'Mon', amount: 42 },
  { day: 'Tue', amount: 38 },
  { day: 'Wed', amount: 55 },
  { day: 'Thu', amount: 48 },
  { day: 'Fri', amount: 62 },
  { day: 'Sat', amount: 35 },
  { day: 'Sun', amount: 28 },
]

function formatCr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

export function SuperAdminDashboardPage() {
  const { data, isLoading, isError } = useSuperAdminDashboard()
  const [range, setRange] = useState<'7D' | '30D' | '12M'>('12M')

  const payload = data?.data as {
    totals?: Record<string, number>
    monthly_growth?: { month: string; institutes: number; revenue: number }[]
    recent_institutes?: { name: string; status: string; email?: string }[]
  } | undefined

  const gmvData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const api = payload?.monthly_growth ?? []
    return months.map((m, i) => ({
      month: m,
      current: api[i]?.revenue ?? Math.round(2800000 + i * 420000 + (i % 3) * 180000),
      previous: Math.round(2200000 + i * 350000),
    }))
  }, [payload?.monthly_growth])

  const totalRevenue = gmvData.reduce((s, d) => s + d.current, 0)
  const sparkFromApi = payload?.monthly_growth?.map((m) => ({ v: m.revenue / 100000 || 1 }))

  if (isError) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">Unable to load dashboard.</div>
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Workspace', to: '/app/super-admin' }, { label: 'Super Admin' }, { label: 'Overview' }]}
        title="Platform overview"
        description="Real-time revenue, settlements, and institute performance across EduraPay."
        actions={
          <>
            <div className="flex rounded-xl border border-border/60 bg-card p-1">
              {(['7D', '30D', '12M'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    range === r ? 'bg-violet-100 text-violet-700' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Filter className="mr-1.5 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
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
          <MetricCard label="Total Revenue" value={formatCr(totalRevenue)} trend="+18.4%" trendUp sparkline={sparkFromApi} />
          <MetricCard
            label="Active Institutes"
            value={String(payload?.totals?.institutes ?? 0)}
            trend="+6.2%"
            trendUp
          />
          <MetricCard label="Pending Settlements" value="₹38.6 L" trend="-4.1%" trendUp={false} />
          <MetricCard label="Failed Transactions" value="0.42%" trend="-0.08%" trendUp={false} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Gross Merchandise Volume</CardTitle>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatCr(totalRevenue)}</span>
                <Badge className="rounded-lg bg-emerald-50 text-emerald-700">+24.6% YoY</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gmvData}>
                  <defs>
                    <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip formatter={(v) => formatCr(Number(v ?? 0))} />
                  <Area type="monotone" dataKey="current" stroke="#7c3aed" fill="url(#gmvFill)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Payment channels</CardTitle>
            <p className="text-sm text-muted-foreground">5 active</p>
          </CardHeader>
          <CardContent>
            <div className="mx-auto h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentChannels} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {paymentChannels.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {paymentChannels.map((ch) => (
                <div key={ch.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: ch.color }} />
                    {ch.name}
                  </div>
                  <span className="font-medium">{ch.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Live transactions</CardTitle>
              <Badge className="mt-1 rounded-lg bg-emerald-50 text-emerald-700">Streaming</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              View all
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Transaction</th>
                  <th className="pb-3 pr-4 font-semibold">Institute</th>
                  <th className="pb-3 pr-4 font-semibold">Amount</th>
                  <th className="pb-3 pr-4 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {liveTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="py-3.5 pr-4">
                      <div className="font-medium">{tx.id}</div>
                      <div className="text-xs text-muted-foreground">{tx.time}</div>
                    </td>
                    <td className="py-3.5 pr-4">{tx.institute}</td>
                    <td className="py-3.5 pr-4 font-semibold">{tx.amount}</td>
                    <td className="py-3.5 pr-4">{tx.method}</td>
                    <td className="py-3.5">
                      <Badge
                        className={
                          tx.status === 'completed'
                            ? 'rounded-lg bg-emerald-50 text-emerald-700'
                            : 'rounded-lg bg-amber-50 text-amber-700'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Settlement payouts</CardTitle>
              <Badge className="mt-1 rounded-lg bg-violet-50 text-violet-700">T+1</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={settlementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {(payload?.recent_institutes?.length ?? 0) > 0 && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent institutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {payload!.recent_institutes!.map((inst, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="font-semibold">{inst.name}</div>
                  <div className="text-sm text-muted-foreground">{inst.email ?? '—'}</div>
                  <Badge className="mt-2 rounded-lg capitalize">{inst.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
