import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Building2, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { apiGet, apiPost } from '@/lib/api'
import { formatFeePeriodDisplay } from '@/lib/fee-period'
import { formatInr } from '@/lib/institute-mock'
import { openRazorpayCheckoutModal } from '@/lib/razorpay-checkout'
import { cn } from '@/lib/utils'

function PaidWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-2xl"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/35 via-transparent to-emerald-100/25" />
      <div
        className={cn(
          'relative -rotate-[14deg] rounded-2xl px-8 py-4 sm:px-12 sm:py-5',
          'border-[3px] border-double border-emerald-500/50',
          'bg-emerald-500/[0.08] shadow-[0_0_0_1px_rgba(16,185,129,0.18),inset_0_0_24px_rgba(16,185,129,0.1)]',
        )}
      >
        <span
          className={cn(
            'block text-center font-black uppercase leading-none tracking-[0.28em] text-emerald-600/60',
            'text-[3.25rem] sm:text-[4.5rem]',
            '[text-shadow:2px_2px_0_rgba(5,150,105,0.1)]',
          )}
        >
          PAID
        </span>
      </div>
    </div>
  )
}

type FeeRow = { name: string; amount: number }

type PayMeta = {
  amount_inr: number
  student_payable_inr?: number
  currency: string
  status: string
  already_paid?: boolean
  institute_name: string
  institute_city?: string
  student_name: string
  batch_names?: string[]
  fee_category_breakdown?: FeeRow[]
  period_label?: string
  due_display?: string
  gateway_ready?: boolean
}

export function PayPage() {
  const { token } = useParams<{ token: string }>()
  const [search] = useSearchParams()
  const [meta, setMeta] = useState<PayMeta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [confirmingReturn, setConfirmingReturn] = useState(false)

  const fetchMeta = useCallback(() => {
    if (!token) return Promise.resolve()
    return apiGet<{ payment_link: PayMeta }>(`/v1/public/pay/${token}`)
      .then((res) => {
        const link = res.data?.payment_link
        if (!link) {
          setError(res.message || 'Payment link unavailable.')
          setMeta(null)
          return
        }
        setMeta(link)
        setError(null)
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        setError(err.response?.data?.message ?? 'This payment link is invalid or has expired.')
        setMeta(null)
      })
  }, [token])

  useEffect(() => {
    setLoading(true)
    fetchMeta().finally(() => setLoading(false))
  }, [fetchMeta])

  useEffect(() => {
    if (search.get('status') !== 'return' || !token) return
    setConfirmingReturn(true)
    const poll = async () => {
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 1500))
        await fetchMeta()
        const res = await apiGet<{ status: string }>(`/v1/public/pay/${token}/status`)
        if (res.data?.status === 'paid' || res.data?.status === 'partial') {
          setConfirmingReturn(false)
          return
        }
      }
      setConfirmingReturn(false)
    }
    poll()
  }, [search, token, fetchMeta])

  const handlePay = async () => {
    if (!token || !meta) return
    setPaying(true)
    try {
      const orderRes = await apiPost<{
        order_id: string
        amount_paise: number
        currency: string
        key_id: string
        checkout_description?: string
        student_payable_inr?: number
        prefill?: { name?: string; email?: string; contact?: string }
      }>(`/v1/public/pay/${token}/order`)

      const order = orderRes.data
      if (!order?.order_id || !order.key_id) {
        toast.error('Could not start payment. Please try again.')
        return
      }

      const feePeriod = meta.period_label ? formatFeePeriodDisplay(meta.period_label) : ''
      const description =
        order.checkout_description ||
        (feePeriod && feePeriod !== '—' ? feePeriod : 'Fee payment')

      await openRazorpayCheckoutModal({
        keyId: order.key_id,
        orderId: order.order_id,
        amountPaise: order.amount_paise,
        currency: order.currency,
        name: meta.institute_name,
        description,
        prefill: order.prefill ?? { name: meta.student_name },
        onSuccess: async (response) => {
          try {
            await apiPost(`/v1/public/pay/${token}/verify`, response)
            toast.success('Payment successful')
            await fetchMeta()
          } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } }
            toast.error(axiosErr.response?.data?.message ?? 'Payment verification failed')
          }
        },
        onFailure: (message) => {
          if (message !== 'Payment cancelled') {
            toast.error(message)
          }
        },
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not start payment.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error || !meta) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-rose-600">{error ?? 'Link unavailable'}</p>
      </div>
    )
  }

  const returned = search.get('status') === 'return'
  const paid = meta.status === 'paid' || meta.already_paid
  const batches = (meta.batch_names ?? []).filter(Boolean)
  const breakdown = (meta.fee_category_breakdown ?? []).filter((row) => row.name && row.amount > 0)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Card
        className={cn(
          'relative overflow-hidden rounded-2xl border-border/60 shadow-xl',
          paid && 'border-emerald-200/80',
        )}
      >
        {paid && <PaidWatermark />}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-center text-white">
          <div className="text-xs font-medium uppercase tracking-widest text-white/80">EduraPay</div>
          <div className="mt-1 text-sm text-white/90">Secure fee payment</div>
        </div>
        <CardContent className={cn('relative space-y-5 p-6', paid && 'opacity-[0.92]')}>
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paying</div>
              <div className="text-lg font-bold leading-tight">{meta.institute_name}</div>
              {meta.institute_city && <div className="text-xs text-muted-foreground">{meta.institute_city}</div>}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold tracking-tight">
              {formatInr(meta.student_payable_inr ?? meta.amount_inr)}
            </div>
            {meta.period_label && formatFeePeriodDisplay(meta.period_label) !== '—' && (
              <div className="mt-2 text-sm font-medium text-violet-700">
                {formatFeePeriodDisplay(meta.period_label)}
              </div>
            )}
            {meta.due_display && (
              <div className="mt-0.5 text-xs text-muted-foreground">Due by {meta.due_display}</div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-border/50 bg-muted/10 px-4 py-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Student</span>
              <span className="text-right font-semibold">{meta.student_name}</span>
            </div>
            {batches.length > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Collection</span>
                <span className="text-right font-medium">{batches.join(', ')}</span>
              </div>
            )}
          </div>

          {breakdown.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee breakdown</div>
              <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/10 px-4 py-3 text-sm">
                {breakdown.map((row) => (
                  <div key={row.name} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{row.name}</span>
                    <span className="font-semibold tabular-nums">{formatInr(row.amount)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between gap-3 border-t border-border/60 pt-2 font-semibold">
                  <span>Total payable</span>
                  <span className="tabular-nums">{formatInr(meta.student_payable_inr ?? meta.amount_inr)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Secured by EduraPay · Powered by Razorpay
          </div>

          {!paid && meta.gateway_ready && (
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-6 text-base"
              disabled={paying}
              onClick={handlePay}
            >
              {paying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening secure payment…
                </>
              ) : (
                `Pay ${formatInr(meta.student_payable_inr ?? meta.amount_inr)}`
              )}
            </Button>
          )}

          {!paid && !meta.gateway_ready && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
              Online payment is not configured yet. Ask your institute to add Razorpay API keys.
            </p>
          )}

          {confirmingReturn && (
            <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming your payment…
            </p>
          )}

          {paid && (
            <div className="relative z-10 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-800">Payment received</p>
              <p className="mt-0.5 text-xs text-emerald-700/90">
                Thank you — your institute will confirm shortly.
              </p>
            </div>
          )}

          {!paid && returned && !confirmingReturn && (
            <p className="text-center text-sm font-medium text-emerald-700">
              Payment received. Thank you — your institute will confirm shortly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
