import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, GitBranch, IndianRupee, Landmark, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { usePlatformPaymentSettings, useRouteConfig, useUpdatePlatformPaymentSettings } from '@/hooks/useApi'
import { Skeleton } from '@/components/ui/label'

export function RouteSetupPage() {
  const { data, isLoading } = useRouteConfig()
  const { data: settingsData, isLoading: settingsLoading } = usePlatformPaymentSettings()
  const updateSettings = useUpdatePlatformPaymentSettings()
  const route = data?.data?.route as Record<string, unknown> | undefined
  const checklist = (route?.env_checklist ?? {}) as Record<string, string>
  const platformCharge = Number(settingsData?.data?.platform_charge_inr ?? 22.6)
  const [chargeInput, setChargeInput] = useState('22.60')

  useEffect(() => {
    if (Number.isFinite(platformCharge)) {
      setChargeInput(platformCharge.toFixed(2))
    }
  }, [platformCharge])

  const savePlatformCharge = async () => {
    const value = parseFloat(chargeInput)
    if (!Number.isFinite(value) || value < 0 || value > 500) {
      toast.error('Enter a valid amount between ₹0 and ₹500.')
      return
    }
    try {
      await updateSettings.mutateAsync({ platform_charge_inr: Math.round(value * 100) / 100 })
      toast.success('Platform charge updated for all transactions.')
    } catch {
      toast.error('Could not update platform charge.')
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Route & settlements"
        description="Razorpay Route splits fees automatically when enabled. Configure the flat EduraPay charge applied on every online transaction."
        crumbs={[
          { label: 'Workspace', to: '/app/super-admin' },
          { label: 'Route setup' },
        ]}
      />

      {isLoading || settingsLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-violet-600" />
                Platform charge per transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                A flat EduraPay platform charge is added to every successful online payment (payment links, checkout,
                and gateway collections). The amount below applies platform-wide — institutes can choose whether parents
                pay it on top or the college absorbs it from settlement.
              </p>
              <div className="flex max-w-sm flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label>Charge amount (INR)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    step={0.01}
                    value={chargeInput}
                    onChange={(e) => setChargeInput(e.target.value)}
                    className="font-semibold tabular-nums"
                  />
                </div>
                <Button
                  className="rounded-xl bg-violet-600 hover:bg-violet-700"
                  onClick={savePlatformCharge}
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? 'Saving…' : 'Save charge'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current live charge: <span className="font-semibold text-foreground">₹{platformCharge.toFixed(2)}</span>{' '}
                per transaction. Example: ₹10,000 fee → student pays ₹{(10_000 + platformCharge).toFixed(2)} in parent-extra
                mode.
              </p>
            </CardContent>
          </Card>

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
