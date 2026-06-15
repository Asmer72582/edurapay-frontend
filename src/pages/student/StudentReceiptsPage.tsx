import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { portalGet } from '@/lib/portal-api'
import { openPortalFeeReceiptPrint } from '@/lib/fee-receipt-print'
import { formatInr } from '@/lib/institute-mock'

type ReceiptRow = {
  payment_id: string
  receipt_number: string
  amount_inr: number
  paid_at?: string
}

export function StudentReceiptsPage() {
  const { activeStudentId } = useOutletContext<{ activeStudentId?: string | null }>()

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'receipts', activeStudentId],
    queryFn: () => portalGet<{ receipts: ReceiptRow[] }>('/v1/portal/receipts', activeStudentId),
  })

  const receipts = data?.data?.receipts ?? []

  const download = (paymentId: string) => {
    void openPortalFeeReceiptPrint({ paymentId, studentId: activeStudentId })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-violet-600" />
          Receipts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && receipts.length === 0 && (
          <p className="text-sm text-muted-foreground">Receipts appear here after successful online payments.</p>
        )}
        <div className="space-y-2">
          {receipts.map((r) => (
            <div
              key={r.payment_id}
              className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-semibold">{r.receipt_number}</div>
                <div className="text-sm text-muted-foreground">
                  {formatInr(r.amount_inr)}
                  {r.paid_at && ` · ${new Date(r.paid_at).toLocaleDateString()}`}
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => download(r.payment_id)}>
                <Download className="mr-1.5 h-4 w-4" />
                View / Print
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
