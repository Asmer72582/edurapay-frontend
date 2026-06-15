import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { portalGet } from '@/lib/portal-api'
import { openPortalFeeReceiptPrint } from '@/lib/fee-receipt-print'
import { formatInr } from '@/lib/institute-mock'
import type { PortalPaymentDetail } from '@/types/student-portal'

export function StudentPaymentsPage() {
  const { activeStudentId } = useOutletContext<{ activeStudentId?: string | null }>()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['portal', 'payments', activeStudentId],
    queryFn: () => portalGet<{ payments: PortalPaymentDetail[] }>('/v1/portal/payments', activeStudentId),
  })

  const { data: detailData } = useQuery({
    queryKey: ['portal', 'payment', selectedId, activeStudentId],
    queryFn: () => portalGet<{ payment: PortalPaymentDetail }>(`/v1/portal/payments/${selectedId}`, activeStudentId),
    enabled: !!selectedId,
  })

  const payments = data?.data?.payments ?? []
  const detail = detailData?.data?.payment

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 && (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          )}
          {payments.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                selectedId === p.id ? 'border-violet-400 bg-violet-50/50' : 'border-border/60 hover:bg-muted/30'
              }`}
            >
              <span className="font-medium">{formatInr(p.amount_inr)}</span>
              <span className="text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
        </CardHeader>
        <CardContent>
          {!detail && <p className="text-sm text-muted-foreground">Select a payment to view details.</p>}
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount paid</span>
                <span className="font-semibold">{formatInr(detail.amount_inr)}</span>
              </div>
              {detail.period_label && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period</span>
                  <span>{detail.period_label}</span>
                </div>
              )}
              {detail.gst_breakdown && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
                  <div className="font-medium text-violet-800">Tax summary (indicative)</div>
                  <div className="flex justify-between">
                    <span>Total paid</span>
                    <span>{formatInr(detail.gst_breakdown.total_inr ?? detail.amount_inr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST @ {detail.gst_breakdown.gst_rate_percent}% (inclusive)</span>
                    <span>{formatInr(detail.gst_breakdown.gst_inclusive_inr ?? 0)}</span>
                  </div>
                </div>
              )}
              {detail.has_receipt && detail.receipt_number && (
                <Button
                  variant="outline"
                  className="h-9 w-full rounded-xl"
                  onClick={() => openPortalFeeReceiptPrint({ paymentId: detail.id, studentId: activeStudentId })}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  View / print receipt {detail.receipt_number}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
