import { CalendarDays, Copy, Link2, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { feePeriodFromPaymentRow } from '@/lib/fee-period'
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

export function PaymentLinkDetailPanel({
  link,
  onClose,
  onCopyLink,
  onOpenLink,
}: {
  link: Record<string, unknown> | null
  onClose: () => void
  onCopyLink?: (path: string) => void
  onOpenLink?: (path: string) => void
}) {
  if (!link) return null

  const role = useAuthStore((s) => s.user?.role ?? '')
  const isPlatformAdmin = role === 'super_admin' || role === 'platform_admin'

  const snap = (link.student_snapshot ?? {}) as Record<string, unknown>
  const split = (link.split ?? {}) as Record<string, unknown>
  const ctx = (link.payment_context ?? {}) as Record<string, unknown>
  const breakdown = (ctx.fee_category_breakdown ?? []) as { name: string; amount: number }[]
  const batchNames = (snap.batch_names ?? []) as string[]
  const installmentLabels = (ctx.installment_labels ?? []) as string[]
  const token = String(link.public_token ?? '')
  const payPath = token ? `/pay/${token}` : ''
  const status = String(link.status ?? 'pending')
  const feeAmount = Number(
    link.fee_amount_inr ?? link.display_amount_inr ?? split.institute_base_inr ?? link.amount_inr ?? 0,
  )
  const instituteBase = Number(split.institute_base_inr ?? feeAmount)
  const platformMarkup = Number(split.platform_markup_inr ?? 0)
  const markupPct = Number(split.platform_markup_bps ?? 0) / 100
  const razorpayMdr = Number(split.razorpay_mdr_inr ?? 0)
  const edurapayNet = Number(split.edurapay_net_inr ?? 0)
  const studentPayable = Number(ctx.student_payable_inr ?? link.amount_inr ?? feeAmount)
  const collectionName = String(ctx.collection_name ?? '').trim()
  const feePeriod = feePeriodFromPaymentRow(link)
  const settlementMode = String(ctx.settlement_mode ?? '')
  const gatewayNote = String(ctx.gateway_note ?? '')

  return (
    <div className="sticky top-20 space-y-3">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{String(snap.name ?? 'Payment link')}</CardTitle>
            <p className="text-xs text-muted-foreground">EduraPay payment link</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={status === 'expired' ? 'Expired' : status}
              variant={statusVariant(status)}
            />
            {link.created_at ? (
              <span className="text-xs text-muted-foreground">
                {new Date(String(link.created_at)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            ) : null}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums">{formatInr(isPlatformAdmin ? studentPayable : feeAmount)}</div>
            <div className="text-xs text-muted-foreground">
              {isPlatformAdmin ? 'Student pays (incl. convenience fee)' : 'Fee amount'}
            </div>
          </div>
          {payPath && status !== 'expired' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl"
                onClick={() => (onCopyLink ? onCopyLink(payPath) : copyText(`${window.location.origin}${payPath}`, 'Link'))}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy link
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
                onClick={() => (onOpenLink ? onOpenLink(payPath) : window.open(`${window.location.origin}${payPath}`, '_blank'))}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Open
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-violet-200/60 bg-violet-50/40 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CalendarDays className="h-4 w-4 text-violet-600" />
          <CardTitle className="text-sm">Fee & collection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          <p className="text-sm font-semibold text-violet-900">{feePeriod}</p>
          {collectionName ? (
            <p className="text-xs text-muted-foreground">
              Collection: <span className="font-medium text-foreground">{collectionName}</span>
            </p>
          ) : null}
          {batchNames.length > 0 && (
            <p className="text-xs text-muted-foreground">Enrolled: {batchNames.join(', ')}</p>
          )}
          {installmentLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {installmentLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-violet-200/80 bg-white px-2 py-0.5 text-[11px] font-medium text-violet-800"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
          {ctx.installment_due ? (
            <p className="text-xs text-muted-foreground">
              Due:{' '}
              {new Date(String(ctx.installment_due)).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          ) : null}
          {link.expires_at ? (
            <p className="text-xs text-muted-foreground">
              Link expires:{' '}
              {new Date(String(link.expires_at)).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {isPlatformAdmin ? 'Amount distribution' : 'College receives'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          {isPlatformAdmin ? (
            <>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                <div className="flex justify-between gap-2 py-1">
                  <span className="text-muted-foreground">College receives</span>
                  <span className="font-bold tabular-nums text-violet-900">{formatInr(instituteBase)}</span>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <span className="text-muted-foreground">Platform markup {markupPct > 0 ? `(${markupPct}%)` : ''}</span>
                  <span className="font-bold tabular-nums text-indigo-800">{formatInr(platformMarkup)}</span>
                </div>
                {razorpayMdr > 0 && (
                  <div className="flex justify-between gap-2 py-1 text-xs">
                    <span className="text-muted-foreground">— Razorpay MDR</span>
                    <span className="tabular-nums text-rose-700">{formatInr(razorpayMdr)}</span>
                  </div>
                )}
                {edurapayNet > 0 && (
                  <div className="flex justify-between gap-2 py-1 text-xs">
                    <span className="text-muted-foreground">— EduraPay net</span>
                    <span className="tabular-nums text-emerald-700">{formatInr(edurapayNet)}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between gap-2 border-t border-border/50 pt-2">
                  <span className="font-medium">Student pays</span>
                  <span className="font-bold tabular-nums">{formatInr(studentPayable || amount)}</span>
                </div>
              </div>
              {Boolean(split.route_applied) && (
                <p className="text-center text-xs font-medium text-violet-600">Razorpay Route split enabled</p>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
              <div className="flex justify-between gap-2 py-1">
                <span className="text-muted-foreground">Your settlement</span>
                <span className="font-bold tabular-nums text-violet-900">{formatInr(instituteBase || amount)}</span>
              </div>
              <p className="pt-1 text-[11px] text-muted-foreground">
                Gateway fees are handled separately by EduraPay. You receive the full fee amount.
              </p>
            </div>
          )}
          {settlementMode === 'manual' && gatewayNote && (
            <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900">{gatewayNote}</p>
          )}
        </CardContent>
      </Card>

      {breakdown.length > 0 && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fee line items</CardTitle>
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
          <CardTitle className="text-sm">Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0 text-sm">
          <Row label="Name" value={String(snap.name ?? '')} />
          <Row label="Roll no." value={String(snap.roll_no ?? '')} />
          <Row label="Email" value={String(snap.email ?? '')} />
          <Row label="Phone" value={String(snap.phone ?? '')} />
          {snap.customer_state ? <Row label="State" value={String(snap.customer_state)} /> : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">Link reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-4 pt-0 text-sm">
          <Row label="Link ID" value={String(link.id ?? link._id ?? '')} mono />
          {token ? (
            <button
              type="button"
              className="mt-2 flex w-full justify-between gap-3 border-t border-border/40 py-2 text-left text-sm hover:text-violet-700"
              onClick={() => copyText(token, 'Token')}
            >
              <span className="text-muted-foreground">Public token</span>
              <span className="max-w-[58%] truncate font-mono text-xs font-medium">{token.slice(0, 12)}…</span>
            </button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
