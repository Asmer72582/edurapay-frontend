import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  Search,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge, Label, Skeleton } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { PageHeader } from '@/components/dashboard/PageHeader'
import {
  useMarkSettlementPaid,
  useRouteConfig,
  useSettlementIncomeSummary,
  useSettlementStats,
  useSettlements,
} from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid_manual: 'bg-emerald-100 text-emerald-800',
  paid_route: 'bg-violet-100 text-violet-800',
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Banknote
  label: string
  value: string
  sub?: string
  accent: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-6">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-0.5 truncate text-xl font-bold tabular-nums">{value}</div>
          {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

export function SettlementsAdminPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [markId, setMarkId] = useState<string | null>(null)
  const [utr, setUtr] = useState('')
  const [notes, setNotes] = useState('')

  const { data: routeData } = useRouteConfig()
  const route = routeData?.data?.route as Record<string, unknown> | undefined
  const { data: statsData, isLoading: statsLoading } = useSettlementStats()
  const { data: incomeData, isLoading: incomeLoading } = useSettlementIncomeSummary()
  const { data, isLoading } = useSettlements(status, search, page)
  const markPaid = useMarkSettlementPaid()

  const stats = statsData?.data?.stats ?? {}
  const platformIncome = incomeData?.data?.platform ?? {}
  const collegesIncome = incomeData?.data?.colleges ?? []
  const rows = data?.data?.data ?? []
  const mdrPct = ((Number(platformIncome.razorpay_mdr_bps ?? stats.razorpay_mdr_bps ?? 236)) / 100).toFixed(2)

  const submitMarkPaid = async () => {
    if (!markId || !utr.trim()) {
      toast.error('Enter bank UTR / reference')
      return
    }
    try {
      await markPaid.mutateAsync({ id: markId, payout_reference: utr.trim(), notes: notes || undefined })
      toast.success('Marked as paid to college')
      setMarkId(null)
      setUtr('')
      setNotes('')
      qc.invalidateQueries({ queryKey: ['settlements'] })
      qc.invalidateQueries({ queryKey: ['settlements-stats'] })
      qc.invalidateQueries({ queryKey: ['settlements-income-summary'] })
    } catch {
      toast.error('Could not update settlement')
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settlements & platform revenue"
        description="Every successful online transaction includes a flat EduraPay platform charge (configurable under Route setup). The college receives the base fee amount; Razorpay deducts its MDR on the gross transaction and the remainder of the platform charge is EduraPay net revenue."
        crumbs={[
          { label: 'Workspace', to: '/app/super-admin' },
          { label: 'Settlements' },
        ]}
      />

      {route && (
        <div className="rounded-xl border border-violet-200/60 bg-violet-50/40 px-4 py-3 text-sm text-violet-950">
          <strong>Settlement mode:</strong>{' '}
          {route.manual_settlements_active
            ? 'Manual bank transfer (RAZORPAY_ROUTE_ENABLED=false)'
            : 'Automatic via Razorpay Route'}
          {typeof route.help === 'string' && <p className="mt-1 text-xs text-violet-800">{route.help}</p>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard
              icon={Landmark}
              label="College — pending payout"
              value={formatInr(Number(stats.pending_amount_inr ?? 0))}
              sub={`${Number(stats.pending_count ?? 0)} pending · paid ${formatInr(Number(stats.college_paid_inr ?? 0))}`}
              accent="bg-amber-100 text-amber-900"
            />
            <StatCard
              icon={Building2}
              label="Gross received from students"
              value={formatInr(Number(stats.gross_received_inr ?? 0))}
              sub={`Markup ${formatInr(Number(stats.platform_markup_total_inr ?? 0))}`}
              accent="bg-violet-100 text-violet-800"
            />
            <StatCard
              icon={CreditCard}
              label={`Razorpay MDR (${((Number(stats.razorpay_mdr_bps ?? 236)) / 100).toFixed(2)}%)`}
              value={formatInr(Number(stats.razorpay_mdr_total_inr ?? 0))}
              sub="Deducted by Razorpay from platform settlement"
              accent="bg-rose-100 text-rose-700"
            />
            <StatCard
              icon={Wallet}
              label="EduraPay net revenue"
              value={formatInr(Number(stats.edurapay_net_total_inr ?? 0))}
              sub="Markup minus Razorpay MDR"
              accent="bg-emerald-100 text-emerald-700"
            />
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Pending
          </div>
          <div className="mt-1 text-base font-semibold">{Number(stats.pending_count ?? 0)} payouts</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Paid manually
          </div>
          <div className="mt-1 text-base font-semibold">{Number(stats.paid_manual_count ?? 0)} payouts</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Banknote className="h-3.5 w-3.5 text-violet-600" /> Paid via Route
          </div>
          <div className="mt-1 text-base font-semibold">{Number(stats.paid_route_count ?? 0)} payouts</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total income generated</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cumulative share from {Number(platformIncome.payment_count ?? 0)} completed payments — college base,
            Razorpay MDR ({mdrPct}%), and EduraPay net.
          </p>
        </CardHeader>
        <CardContent>
          {incomeLoading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-violet-200/60 bg-violet-50/40 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-wider text-violet-800">College income</div>
                <div className="mt-1 text-2xl font-bold tabular-nums text-violet-950">
                  {formatInr(Number(platformIncome.college_income_inr ?? 0))}
                </div>
                <div className="mt-1 text-[11px] text-violet-800">
                  Base fee share · paid {formatInr(Number(stats.college_paid_inr ?? 0))} · pending{' '}
                  {formatInr(Number(stats.pending_amount_inr ?? 0))}
                </div>
              </div>
              <div className="rounded-xl border border-rose-200/60 bg-rose-50/40 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-wider text-rose-800">Razorpay income</div>
                <div className="mt-1 text-2xl font-bold tabular-nums text-rose-950">
                  {formatInr(Number(platformIncome.razorpay_income_inr ?? 0))}
                </div>
                <div className="mt-1 text-[11px] text-rose-800">MDR deducted on gross student payments</div>
              </div>
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-wider text-emerald-800">EduraPay income</div>
                <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-950">
                  {formatInr(Number(platformIncome.edurapay_income_inr ?? 0))}
                </div>
                <div className="mt-1 text-[11px] text-emerald-800">
                  Markup {formatInr(Number(platformIncome.platform_markup_inr ?? 0))} minus MDR
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income by college</CardTitle>
          <p className="text-sm text-muted-foreground">
            Per-institute totals for college base, Razorpay MDR, and EduraPay net across all completed payments.
          </p>
        </CardHeader>
        <CardContent>
          {incomeLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : collegesIncome.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No completed payments yet. Income totals appear after students pay.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">College</th>
                    <th className="pb-2 pr-4 text-right">Payments</th>
                    <th className="pb-2 pr-4 text-right">Students paid</th>
                    <th className="pb-2 pr-4 text-right">EduraPay fee</th>
                    <th className="pb-2 pr-4 text-right">College income</th>
                    <th className="pb-2 pr-4 text-right">Paid out</th>
                    <th className="pb-2 pr-4 text-right">Pending</th>
                    <th className="pb-2 pr-4 text-right">Razorpay</th>
                    <th className="pb-2 pr-4 text-right">EduraPay</th>
                  </tr>
                </thead>
                <tbody>
                  {collegesIncome.map((row) => (
                    <tr key={row.institute_id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-medium">{row.institute_name}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{row.payment_count}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{formatInr(row.student_paid_gross_inr)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-indigo-800">
                        {formatInr(row.platform_markup_inr)}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums text-violet-800">
                        {formatInr(row.college_income_inr)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-emerald-700">
                        {formatInr(row.college_paid_inr)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-amber-700">
                        {formatInr(row.college_pending_inr)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-rose-700">
                        {formatInr(row.razorpay_income_inr)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-emerald-700">
                        {formatInr(row.edurapay_income_inr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/30 font-semibold">
                    <td className="py-3 pr-4">Platform total</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{Number(platformIncome.payment_count ?? 0)}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatInr(Number(platformIncome.student_paid_gross_inr ?? 0))}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-indigo-800">
                      {formatInr(Number(platformIncome.platform_markup_inr ?? 0))}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-violet-800">
                      {formatInr(Number(platformIncome.college_income_inr ?? 0))}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-emerald-700">
                      {formatInr(Number(stats.college_paid_inr ?? 0))}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-amber-700">
                      {formatInr(Number(stats.pending_amount_inr ?? 0))}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-rose-700">
                      {formatInr(Number(platformIncome.razorpay_income_inr ?? 0))}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-emerald-700">
                      {formatInr(Number(platformIncome.edurapay_income_inr ?? 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Payout queue</CardTitle>
          <div className="flex flex-wrap gap-2">
            {['pending', 'paid_manual', 'paid_route', 'all'].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={status === s ? 'default' : 'outline'}
                className="rounded-lg capitalize"
                onClick={() => {
                  setStatus(s)
                  setPage(1)
                }}
              >
                {s.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Student, fee period, UTR…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Institute</th>
                    <th className="pb-2 pr-4">Student</th>
                    <th className="pb-2 pr-4">Fee period</th>
                    <th className="pb-2 pr-4 text-right">Student paid</th>
                    <th className="pb-2 pr-4 text-right">EduraPay fee</th>
                    <th className="pb-2 pr-4 text-right">College</th>
                    <th className="pb-2 pr-4 text-right">Razorpay MDR</th>
                    <th className="pb-2 pr-4 text-right">EduraPay net</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const r = row as Record<string, unknown>
                    const id = String(r.id ?? '')
                    const st = String(r.status ?? '')
                    return (
                      <tr key={id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 font-medium">{String(r.institute_name ?? '—')}</td>
                        <td className="py-3 pr-4">{String(r.student_name ?? '—')}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{String(r.fee_period_label ?? '—')}</td>
                        <td className="py-3 pr-4 text-right font-semibold tabular-nums">{formatInr(Number(r.total_inr ?? 0))}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-indigo-800">
                          {formatInr(Number(r.platform_markup_inr ?? 0))}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold tabular-nums text-violet-800">
                          {formatInr(Number(r.amount_inr ?? 0))}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-rose-700">
                          {formatInr(Number(r.razorpay_mdr_inr ?? 0))}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-emerald-700">
                          {formatInr(Number(r.edurapay_net_inr ?? 0))}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={statusBadge[st] ?? ''}>{st.replace(/_/g, ' ')}</Badge>
                          {r.payout_reference && (
                            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                              {String(r.payout_reference)}
                            </div>
                          )}
                        </td>
                        <td className="py-3">
                          {st === 'pending' && (
                            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setMarkId(id)}>
                              Mark paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No settlements in this filter. They are created when students complete payment.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={Boolean(markId)} onClose={() => setMarkId(null)} title="Mark college payout paid" size="md">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Bank UTR / reference</Label>
            <Input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="NEFT UTR or transaction ID" />
          </div>
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button className="w-full rounded-xl" disabled={markPaid.isPending} onClick={submitMarkPaid}>
            {markPaid.isPending ? 'Saving…' : 'Confirm paid to college'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
