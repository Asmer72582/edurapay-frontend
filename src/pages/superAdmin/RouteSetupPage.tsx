import { Link } from 'react-router-dom'
import { Building2, GitBranch, Landmark, Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useRouteConfig } from '@/hooks/useApi'
import { Skeleton } from '@/components/ui/label'

export function RouteSetupPage() {
  const { data, isLoading } = useRouteConfig()
  const route = data?.data?.route as Record<string, unknown> | undefined
  const checklist = (route?.env_checklist ?? {}) as Record<string, string>

  return (
    <div className="space-y-8">
      <PageHeader
        title="Route & settlements"
        description="Razorpay Route splits fees automatically when enabled. Until then, use manual college payouts."
        crumbs={[
          { label: 'Workspace', to: '/app/super-admin' },
          { label: 'Route setup' },
        ]}
      />

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-violet-600" />
                Razorpay Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge className={route?.route_enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}>
                  RAZORPAY_ROUTE_ENABLED={route?.route_enabled ? 'true' : 'false'}
                </Badge>
                <Badge className={route?.razorpay_configured ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
                  API keys {route?.razorpay_configured ? 'OK' : 'missing'}
                </Badge>
                {route?.razorpay_test_mode && <Badge className="bg-blue-100 text-blue-800">Test mode</Badge>}
              </div>
              <p className="text-muted-foreground">
                {String(route?.help ?? '')}
              </p>
              <ul className="space-y-2 rounded-lg bg-muted/30 p-3 text-xs">
                {Object.entries(checklist).map(([key, val]) => (
                  <li key={key}>
                    <code className="text-[11px]">{key}</code>: {val}
                  </li>
                ))}
              </ul>
              <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
                <li>Request Route from Razorpay (₹40L+ turnover / routepriority@razorpay.com).</li>
                <li>Set <code>RAZORPAY_ROUTE_ENABLED=true</code> and platform <code>acc_…</code> in backend .env.</li>
                <li>Complete per-institute KYC under Institutes → Route KYC.</li>
              </ol>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/app/super-admin/institutes">
                  <Building2 className="mr-2 h-4 w-4" />
                  Institute Route KYC
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-600" />
                Manual settlements (active now)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Students pay your Razorpay account. EduraPay records how much each college is owed (fee base). After you
                NEFT/IMPS to the college, mark the row paid with UTR.
              </p>
              <Button asChild className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
                <Link to="/app/super-admin/settlements">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Open payout queue
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
