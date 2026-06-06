import { FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatInr } from '@/lib/institute-mock'
import { api } from '@/lib/api'

export type FeeReceiptRow = {
  id: string
  source: 'gateway' | 'invoice'
  receipt_number: string
  transaction_id: string
  student_name: string
  student_roll_no?: string
  class_name: string
  amount_inr: number
  paid_at?: string
  period_label?: string
  fee_categories: { name: string; amount: number }[]
}

export function FeeReceiptDetailPanel({
  receipt,
  onClose,
}: {
  receipt: FeeReceiptRow | null
  onClose: () => void
}) {
  if (!receipt) return null

  const printReceipt = async () => {
    try {
      const { data } = await api.get(`/v1/invoices/fee-receipts/${receipt.id}/preview`, {
        params: { source: receipt.source },
      })
      const html = data?.data?.html
      if (!html) {
        toast.error('Could not load receipt')
        return
      }
      const w = window.open('', '_blank')
      if (!w) {
        toast.error('Allow pop-ups to print receipt')
        return
      }
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => w.print(), 400)
    } catch {
      toast.error('Receipt preview failed')
    }
  }

  return (
    <div className="sticky top-20 space-y-3">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="min-w-0">
            <CardTitle className="text-base">{receipt.receipt_number || 'Fee receipt'}</CardTitle>
            <p className="text-sm text-muted-foreground">{receipt.student_name}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Class / collection</span>
                <span className="font-medium text-right">{receipt.class_name}</span>
              </div>
              {receipt.student_roll_no && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Roll no.</span>
                  <span className="font-medium">{receipt.student_roll_no}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Transaction</span>
                <span className="font-mono text-xs">{receipt.transaction_id}</span>
              </div>
              {receipt.period_label && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium">{receipt.period_label}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fee categories paid</p>
            <ul className="divide-y divide-border/40 rounded-xl border border-border/60">
              {receipt.fee_categories.map((cat) => (
                <li key={cat.name} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <span>{cat.name}</span>
                  <span className="font-semibold tabular-nums">{formatInr(cat.amount)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 bg-violet-50/50 px-3 py-2.5 text-sm font-bold dark:bg-violet-950/20">
                <span>Total paid</span>
                <span className="tabular-nums text-violet-700 dark:text-violet-300">{formatInr(receipt.amount_inr)}</span>
              </li>
            </ul>
          </div>

          <Button className="w-full rounded-xl bg-violet-600 hover:bg-violet-700" onClick={printReceipt}>
            <FileText className="mr-1.5 h-4 w-4" />
            View / print receipt
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
