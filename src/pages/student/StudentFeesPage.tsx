import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PayLinkButton } from '@/components/student-portal/PayLinkButton'
import { portalGet } from '@/lib/portal-api'
import { formatInr } from '@/lib/institute-mock'
import type { PortalOverview } from '@/types/student-portal'

type FeesPayload = {
  payment_links: PortalOverview['pending_payment_links']
  installments: PortalOverview['pending_installments']
}

export function StudentFeesPage() {
  const { instituteName, activeStudentId } = useOutletContext<{
    instituteName: string
    activeStudentId?: string | null
  }>()

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['portal', 'fees', activeStudentId],
    queryFn: () => portalGet<FeesPayload>('/v1/portal/fees', activeStudentId),
  })

  const fees = data?.data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pay online</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (fees?.payment_links ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No active payment links. Check back when your institute sends a link.</p>
          )}
          <div className="space-y-3">
            {(fees?.payment_links ?? []).map((link) => (
              <div
                key={link.id}
                className="flex flex-col gap-3 rounded-xl border border-violet-200/60 bg-violet-50/30 p-4 dark:bg-violet-950/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold">{link.period_label}</div>
                  <div className="text-sm text-muted-foreground">
                    {link.due_display && <>Due {link.due_display} · </>}
                    Total {formatInr(link.student_payable_inr)}
                  </div>
                </div>
                <PayLinkButton link={link} instituteName={instituteName} studentId={activeStudentId} onPaid={() => refetch()} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(fees?.installments ?? []).filter((i) => i.amount_inr > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Installment schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {fees?.installments
              .filter((i) => i.amount_inr > 0)
              .map((inst) => (
                <div key={inst.id} className="flex justify-between rounded-lg border border-border/50 px-3 py-2">
                  <span>
                    {inst.label}
                    {inst.due_date && <span className="text-muted-foreground"> · due {inst.due_date}</span>}
                  </span>
                  <span className="font-semibold tabular-nums">{formatInr(inst.amount_inr)}</span>
                </div>
              ))}
            <p className="pt-2 text-xs text-muted-foreground">
              Pay via the payment link your institute sends for each installment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
