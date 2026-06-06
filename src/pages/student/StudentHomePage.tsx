import { useOutletContext } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PayLinkButton } from '@/components/student-portal/PayLinkButton'
import { formatInr } from '@/lib/institute-mock'
import type { PortalOverview } from '@/types/student-portal'

type Ctx = {
  overview?: PortalOverview
  instituteName: string
  activeStudentId?: string | null
}

export function StudentHomePage() {
  const { overview, instituteName, activeStudentId } = useOutletContext<Ctx>()
  if (!overview) return null

  const student = overview.student
  const guardian = student.guardian

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Welcome, {student.first_name} {student.last_name ?? ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          {student.roll_no && (
            <div>
              <span className="text-muted-foreground">Roll no.</span>
              <div className="font-medium">{student.roll_no}</div>
            </div>
          )}
          {student.academic_year && (
            <div>
              <span className="text-muted-foreground">Academic year</span>
              <div className="font-medium">{student.academic_year}</div>
            </div>
          )}
          {guardian?.name && (
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Guardian</span>
              <div className="font-medium">
                {guardian.name}
                {guardian.relation ? ` (${guardian.relation})` : ''}
                {guardian.phone ? ` · ${guardian.phone}` : ''}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Outstanding"
          value={formatInr(overview.totals.outstanding_inr)}
          trend={overview.totals.pending_links > 0 ? `${overview.totals.pending_links} link(s)` : 'Up to date'}
          trendUp={overview.totals.outstanding_inr <= 0}
          simple
        />
        <MetricCard label="Completed payments" value={String(overview.totals.completed_payments)} trend="All time" trendUp simple />
        <MetricCard
          label="Open disputes"
          value={String(overview.totals.open_disputes)}
          trend="Active"
          trendUp={overview.totals.open_disputes === 0}
          simple
        />
        <MetricCard label="Pay fees" value="Online" trend="Secure checkout" trendUp simple />
      </div>

      {overview.pending_payment_links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment links ready</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.pending_payment_links.map((link) => (
              <div
                key={link.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold">{link.period_label}</div>
                  <div className="text-sm text-muted-foreground">
                    Due {link.due_display ?? '—'} · {formatInr(link.student_payable_inr)}
                  </div>
                </div>
                <PayLinkButton
                  link={link}
                  instituteName={instituteName}
                  studentId={activeStudentId}
                  onPaid={() => window.location.reload()}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {overview.recent_payments.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent payments</CardTitle>
            <Link to="payments" className="text-sm text-violet-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview.recent_payments.map((p) => (
              <div key={p.id} className="flex justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                <span>{formatInr(p.amount_inr)}</span>
                <span className="text-muted-foreground">{p.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
