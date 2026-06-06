import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { portalGet, portalPost } from '@/lib/portal-api'
import type { PortalDispute, PortalPaymentDetail } from '@/types/student-portal'

const REASONS = [
  { value: 'wrong_amount', label: 'Wrong amount charged' },
  { value: 'duplicate', label: 'Duplicate payment' },
  { value: 'not_received', label: 'Service / credit not received' },
  { value: 'other', label: 'Other' },
]

export function StudentDisputesPage() {
  const { activeStudentId } = useOutletContext<{ activeStudentId?: string | null }>()
  const qc = useQueryClient()
  const [paymentId, setPaymentId] = useState('')
  const [reason, setReason] = useState('wrong_amount')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: disputesData } = useQuery({
    queryKey: ['portal', 'disputes', activeStudentId],
    queryFn: () => portalGet<{ disputes: PortalDispute[] }>('/v1/portal/disputes', activeStudentId),
  })

  const { data: paymentsData } = useQuery({
    queryKey: ['portal', 'payments', activeStudentId],
    queryFn: () => portalGet<{ payments: PortalPaymentDetail[] }>('/v1/portal/payments', activeStudentId),
  })

  const disputes = disputesData?.data?.disputes ?? []
  const completedPayments = (paymentsData?.data?.payments ?? []).filter((p) => p.status === 'completed')

  const submit = async () => {
    if (!paymentId) {
      toast.error('Select a payment')
      return
    }
    setSubmitting(true)
    try {
      await portalPost('/v1/portal/disputes', { payment_id: paymentId, reason, description }, activeStudentId)
      toast.success('Dispute submitted')
      setDescription('')
      qc.invalidateQueries({ queryKey: ['portal', 'disputes'] })
      qc.invalidateQueries({ queryKey: ['portal', 'overview'] })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not submit dispute')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Raise a dispute</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment</Label>
            <SelectField
              value={paymentId}
              onChange={setPaymentId}
              options={[
                { value: '', label: 'Select payment…' },
                ...completedPayments.map((p) => ({
                  value: p.id,
                  label: `${p.receipt_number || p.id} · ₹${p.amount_inr}`,
                })),
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <SelectField value={reason} onChange={setReason} options={REASONS} />
          </div>
          <div className="space-y-2">
            <Label>Details (optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue…" />
          </div>
          <Button className="w-full rounded-xl" onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit dispute'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your disputes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {disputes.length === 0 && (
            <p className="text-sm text-muted-foreground">No disputes filed yet.</p>
          )}
          {disputes.map((d) => (
            <div key={d.id} className="rounded-xl border border-border/60 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{REASONS.find((r) => r.value === d.reason)?.label ?? d.reason}</span>
                <StatusBadge status={d.status} variant={statusVariant(d.status)} />
              </div>
              {d.description && <p className="mt-1 text-muted-foreground">{d.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                Payment {d.payment_id}
                {d.created_at && ` · ${new Date(d.created_at).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
