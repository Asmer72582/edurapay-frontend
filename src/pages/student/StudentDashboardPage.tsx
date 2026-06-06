import { CreditCard, Clock, CheckCircle } from 'lucide-react'
import { StatsGrid } from '@/components/landing/FeatureGrid'
import { Skeleton, Badge } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudentDashboard } from '@/hooks/useApi'

export function StudentDashboardPage() {
  const { data, isLoading, isError } = useStudentDashboard()
  const payload = data?.data as {
    student?: { first_name: string; last_name?: string; guardian?: { name: string; phone?: string } }
    totals?: Record<string, number>
    recent_payments?: { amount: string | number; status: string; currency?: string; created_at?: string }[]
  } | undefined

  if (isError) {
    return <div className="text-muted-foreground">Unable to load dashboard.</div>
  }

  const statItems = [
    { label: 'Total payments', value: payload?.totals?.total_payments ?? '—', icon: CreditCard },
    { label: 'Pending', value: payload?.totals?.pending ?? '—', icon: Clock },
    { label: 'Completed', value: payload?.totals?.completed ?? '—', icon: CheckCircle },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {payload?.student?.first_name ?? 'Student'}
        </h1>
        <p className="text-muted-foreground">View pending fees, payment history, and invoices.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-24" />
      ) : (
        <StatsGrid items={statItems} />
      )}

      {payload?.student?.guardian && (
        <Card>
          <CardHeader><CardTitle>Guardian details</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div>{payload.student.guardian.name}</div>
            {payload.student.guardian.phone && <div>{payload.student.guardian.phone}</div>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Recent payments</CardTitle></CardHeader>
        <CardContent>
          {(payload?.recent_payments ?? []).length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {(payload?.recent_payments ?? []).map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <div className="font-medium">₹{p.amount}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <Badge className={p.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
