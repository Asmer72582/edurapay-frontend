import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Bell, Download, FileText, History, IndianRupee, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import {
  useInvoice,
  useInvoiceAudit,
  useRecordInvoicePayment,
  useSendInvoiceReminder,
} from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

function toId(v: Record<string, unknown>) {
  return String(v.id ?? v._id ?? '')
}

type Tab = 'summary' | 'payments' | 'audit'

export function InvoiceDetailPanel({
  invoiceId,
  onClose,
}: {
  invoiceId: string | null
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('summary')
  const [payAmount, setPayAmount] = useState('')
  const qc = useQueryClient()
  const detail = useInvoice(invoiceId ?? undefined)
  const audit = useInvoiceAudit(invoiceId ?? undefined)
  const recordPay = useRecordInvoicePayment()
  const remind = useSendInvoiceReminder()

  const payload = detail.data?.data
  const invoice = (payload?.invoice ?? {}) as Record<string, unknown>
  const payments = (payload?.payments ?? []) as Record<string, unknown>[]
  const snap = (invoice.student_snapshot ?? {}) as Record<string, unknown>
  const gst = (invoice.gst ?? {}) as Record<string, unknown>
  const lines = (invoice.line_items ?? []) as Record<string, unknown>[]
  const auditRows = (audit.data?.data?.audit_trail ?? []) as Record<string, unknown>[]

  const downloadPdf = async () => {
    if (!invoiceId) return
    try {
      const { data } = await api.get(`/v1/invoices/${invoiceId}/preview`)
      const html = data?.data?.html
      if (!html) {
        toast.error('Could not load preview')
        return
      }
      const w = window.open('', '_blank')
      if (!w) {
        toast.error('Allow pop-ups to download PDF')
        return
      }
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => w.print(), 400)
    } catch {
      toast.error('PDF preview failed')
    }
  }

  const sendReminder = async () => {
    if (!invoiceId) return
    try {
      const res = await remind.mutateAsync(invoiceId)
      toast.success(res.message ?? 'Reminder sent')
    } catch {
      toast.error('Reminder failed')
    }
  }

  const addPayment = async () => {
    if (!invoiceId) return
    const amount = Number(payAmount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    try {
      await recordPay.mutateAsync({ id: invoiceId, payload: { amount, method: 'manual' } })
      toast.success('Payment recorded — receipt generated')
      setPayAmount('')
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoices-stats'] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    } catch {
      toast.error('Could not record payment')
    }
  }

  if (!invoiceId) return null

  return (
    <div className="sticky top-20 space-y-3">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div>
            <CardTitle className="text-base">{String(invoice.invoice_number ?? 'Invoice')}</CardTitle>
            <p className="text-sm text-muted-foreground">{String(snap.name ?? '')}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={String(invoice.status ?? 'sent')} variant={statusVariant(String(invoice.status ?? 'sent'))} />
            <span className="text-xs text-muted-foreground">
              Due {invoice.due_at ? String(invoice.due_at).slice(0, 10) : '—'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-muted/30 p-2">
              <div className="text-muted-foreground">Total</div>
              <div className="font-semibold">{formatInr(Number(invoice.total_amount ?? 0))}</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2">
              <div className="text-muted-foreground">Paid</div>
              <div className="font-semibold text-emerald-700">{formatInr(Number(invoice.paid_amount ?? 0))}</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-2">
              <div className="text-muted-foreground">Due</div>
              <div className="font-semibold text-rose-700">{formatInr(Number(invoice.balance_due ?? 0))}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={downloadPdf}>
              <Download className="mr-1 h-3.5 w-3.5" />
              PDF
            </Button>
            {Number(invoice.balance_due ?? 0) > 0 && (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={sendReminder} disabled={remind.isPending}>
                <Bell className="mr-1 h-3.5 w-3.5" />
                Remind
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 rounded-xl border border-border/60 bg-muted/20 p-1">
        {(
          [
            { id: 'summary' as const, label: 'Summary', icon: FileText },
            { id: 'payments' as const, label: 'Payments', icon: IndianRupee },
            { id: 'audit' as const, label: 'Audit', icon: History },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold',
              tab === t.id ? 'bg-card text-violet-700 shadow-sm' : 'text-muted-foreground',
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-4 text-sm">
            {lines.map((line, i) => (
              <div key={i} className="flex justify-between border-b border-border/40 pb-2">
                <div>
                  <div className="font-medium">{String(line.description)}</div>
                  <div className="text-xs text-muted-foreground">HSN {String(line.hsn_sac ?? '—')}</div>
                </div>
                <div className="font-semibold">{formatInr(Number(line.amount ?? 0))}</div>
              </div>
            ))}
            <div className="space-y-1 text-xs text-muted-foreground">
              {Number(gst.cgst) > 0 && (
                <div className="flex justify-between">
                  <span>CGST / SGST</span>
                  <span>
                    {formatInr(Number(gst.cgst))} / {formatInr(Number(gst.sgst))}
                  </span>
                </div>
              )}
              {Number(gst.igst) > 0 && (
                <div className="flex justify-between">
                  <span>IGST</span>
                  <span>{formatInr(Number(gst.igst))}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'payments' && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-4">
            {Number(invoice.balance_due ?? 0) > 0 && (
              <div className="space-y-2 rounded-xl border border-dashed border-violet-200 bg-violet-50/30 p-3">
                <Label className="text-xs">Record partial payment</Label>
                <div className="flex gap-2">
                  <Input
                    className="rounded-xl"
                    placeholder="Amount"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                  <Button className="rounded-xl" size="sm" onClick={addPayment} disabled={recordPay.isPending}>
                    Add
                  </Button>
                </div>
              </div>
            )}
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              payments.map((p) => (
                <div key={toId(p)} className="rounded-xl border border-border/50 bg-muted/10 p-3 text-sm">
                  <div className="font-semibold">{formatInr(Number(p.amount ?? 0))}</div>
                  <div className="text-xs text-muted-foreground">
                    {String(p.receipt_number ?? '')} · {p.paid_at ? String(p.paid_at).slice(0, 10) : ''}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'audit' && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="max-h-64 space-y-2 overflow-y-auto p-4">
            {auditRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit entries yet.</p>
            ) : (
              auditRows.map((log) => (
                <div key={toId(log)} className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-xs">
                  <div className="font-semibold capitalize">
                    {String(log.action)} · {log.created_at ? String(log.created_at).slice(0, 16).replace('T', ' ') : ''}
                  </div>
                  <div className="text-muted-foreground">{JSON.stringify(log.meta ?? {})}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
