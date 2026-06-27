import { CalendarDays, Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { usePaymentTransaction } from '@/hooks/useApi'
import { formatFeePeriodDisplay } from '@/lib/fee-period'
import { formatInr } from '@/lib/institute-mock'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('max-w-[58%] text-right font-medium', mono && 'font-mono text-xs')}>{value || '—'}</span>
    </div>
  )
}

function copyText(text: string, label: string) {
  if (!text) return
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied`)
}

export function TransactionDetailPanel({
  transactionId,
  onClose,
}: {
  transactionId: string | null
  onClose: () => void
}) {
  const { data, isLoading } = usePaymentTransaction(transactionId ?? undefined)
  const role = useAuthStore((s) => s.user?.role ?? '')
  const isPlatformAdmin = role === 'super_admin' || role === 'platform_admin'
  const tx = (data?.data?.transaction ?? {}) as Record<string, unknown>
  const payment = (tx.payment ?? null) as Record<string, unknown> | null
  const student = (tx.student ?? null) as Record<string, unknown> | null
  const split = (tx.split ?? {}) as Record<string, unknown>
  const link = (tx.payment_link ?? null) as Record<string, unknown> | null
  const breakdown = (link?.fee_category_breakdown ?? []) as { name: string; amount: number }[]
  const feePeriods = (tx.fee_periods ?? link?.fee_periods ?? []) as string[]
  const feePeriodDisplay = formatFeePeriodDisplay(
    String(tx.fee_period_display ?? link?.fee_period_display ?? ''),
  )

  if (!transactionId) return null

  if (isLoading) {
    return (
      <div className="sticky top-20 space-y-3">
        <Card className="animate-pulse rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="space-y-2 pb-2">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted/70" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-10 w-24 rounded bg-muted" />
            <div className="h-9 w-full rounded-xl bg-muted/60" />
          </CardContent>
        </Card>
        <Card className="animate-pulse rounded-2xl border-border/60 shadow-sm">
          <CardContent className="space-y-2 py-4">
            <div className="h-3 w-24 rounded bg-muted/70" />
            <div className="h-12 w-full rounded-xl bg-muted/60" />
          </CardContent>
        </Card>
        <Card className="animate-pulse rounded-2xl border-border/60 shadow-sm">
          <CardContent className="space-y-2 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-3 py-1">
                <div className="h-3 w-20 rounded bg-muted/70" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const gatewayTxId = String(tx.gateway_transaction_id ?? tx.transaction_id ?? '')

  return (
    <div className="sticky top-20 space-y-3">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="min-w-0">
            <CardTitle className="truncate font-mono text-sm">{String(tx.transaction_id ?? 'Transaction')}</CardTitle>
            <p className="text-sm text-muted-foreground">{String(tx.student_name ?? '')}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={String(tx.status_label ?? tx.status ?? '')}
              variant={statusVariant(String(tx.status_label ?? tx.status ?? ''))}
            />
            <span className="rounded-lg bg-muted/40 px-2 py-0.5 text-xs font-medium capitalize">{String(tx.type ?? '')}</span>
            <span className="text-xs text-muted-foreground">
              {tx.created_at ? new Date(String(tx.created_at)).toLocaleString('en-IN') : '—'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatInr(
                Number(
                  isPlatformAdmin
                    ? tx.amount
                    : tx.fee_amount_inr ?? tx.college_received_inr ?? split.institute_base_inr ?? tx.amount ?? 0,
                ),
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {isPlatformAdmin ? 'Student paid' : 'College received'} · {String(tx.gateway ?? '').toUpperCase()}
            </div>
          </div>
          {gatewayTxId && (
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl"
              onClick={() => copyText(gatewayTxId, 'Transaction ID')}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy transaction ID
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-violet-200/60 bg-violet-50/40 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CalendarDays className="h-4 w-4 text-violet-600" />
          <CardTitle className="text-sm">Fees paid for</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {feePeriods.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {feePeriods.map((period) => {
                const label = formatFeePeriodDisplay(String(period))
                return (
                  <span
                    key={label}
                    className="rounded-lg border border-violet-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-violet-900"
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          ) : (
            <p className="text-sm font-medium text-violet-900">{feePeriodDisplay !== '—' ? feePeriodDisplay : 'Period not recorded'}</p>
          )}
          {link?.installment_due ? (
            <p className="text-xs text-muted-foreground">
              Due date: {new Date(String(link.installment_due)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0 text-sm">
          <Row label="Name" value={String(student?.name ?? tx.student_name ?? '')} />
          <Row label="Roll no." value={String(student?.roll_no ?? tx.student_roll_no ?? '')} />
          <Row label="Email" value={String(student?.email ?? '')} />
          <Row label="Phone" value={String(student?.phone ?? '')} />
        </CardContent>
      </Card>

      {breakdown.length > 0 && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fee breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-4 pt-0 text-sm">
            {breakdown.map((row) => (
              <div key={row.name} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{row.name}</span>
                <span className="font-semibold tabular-nums">{formatInr(row.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0 text-sm">
          <Row label="Payment ID" value={String(payment?.id ?? tx.payment_id ?? '')} mono />
          <Row label="Payment status" value={String(payment?.status ?? tx.payment_status ?? '')} />
          <Row label="Gateway payment" value={String(payment?.gateway_payment_id ?? tx.gateway_payment_id ?? '')} mono />
          <Row label="Gateway order" value={String(payment?.gateway_order_id ?? '')} mono />
          {payment?.invoice_id ? <Row label="Invoice" value={String(payment.invoice_id)} mono /> : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Settlement</CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          {isPlatformAdmin ? (
            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              <div className="rounded-lg bg-violet-50 p-2">
                <div className="text-muted-foreground">College</div>
                <div className="font-semibold text-violet-800">
                  {formatInr(Number(split.institute_base_inr ?? split.institute_inr ?? 0))}
                </div>
                <div className="text-[10px] text-muted-foreground">Entered fee</div>
              </div>
              <div className="rounded-lg bg-indigo-50 p-2">
                <div className="text-muted-foreground">EduraPay fee</div>
                <div className="font-semibold text-indigo-800">
                  {formatInr(Number(split.platform_markup_inr ?? split.platform_inr ?? 0))}
                </div>
                <div className="text-[10px] text-muted-foreground">Flat per transaction</div>
              </div>
              <div className="rounded-lg bg-rose-50 p-2">
                <div className="text-muted-foreground">Razorpay</div>
                <div className="font-semibold text-rose-700">
                  {formatInr(Number(split.razorpay_mdr_inr ?? 0))}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {split.razorpay_mdr_bps != null
                    ? `${(Number(split.razorpay_mdr_bps) / 100).toFixed(2)}% MDR`
                    : 'Gateway MDR'}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <div className="text-muted-foreground">EduraPay net</div>
                <div className="font-semibold text-emerald-700">
                  {formatInr(Number(split.edurapay_net_inr ?? 0))}
                </div>
                <div className="text-[10px] text-muted-foreground">After MDR</div>
              </div>
              {Boolean(split.route_applied) && (
                <p className="col-span-3 text-center text-[10px] font-medium text-violet-600">Razorpay Route applied</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 bg-violet-50/50 p-3 text-center">
              <div className="text-muted-foreground">College settlement</div>
              <div className="text-lg font-semibold text-violet-800">
                {formatInr(Number(split.institute_base_inr ?? split.institute_inr ?? 0))}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                You receive the full fee amount. Gateway charges are handled by EduraPay.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
