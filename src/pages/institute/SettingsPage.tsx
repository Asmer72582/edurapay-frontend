import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CreditCard, Loader2, Palette, Save, Shield, User } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentInstitute, useUpdateCurrentInstitute } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
const webhookBase = apiBase.replace(/\/api\/?$/, '')

const tabs = [
  { id: 'profile', label: 'Institute profile', icon: User },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'payments', label: 'Payment gateway', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
] as const

type TabId = (typeof tabs)[number]['id']

type FormState = {
  name: string
  email: string
  phone: string
  line1: string
  city: string
  state: string
  pincode: string
  primaryColor: string
}

function instituteToForm(institute: {
  name?: string
  email?: string
  phone?: string
  address?: { line1?: string; city?: string; state?: string; pincode?: string; postal_code?: string }
  branding?: { primary_color?: string }
}): FormState {
  const address = institute.address ?? {}
  return {
    name: institute.name ?? '',
    email: institute.email ?? '',
    phone: institute.phone ?? '',
    line1: address.line1 ?? '',
    city: address.city ?? '',
    state: address.state ?? '',
    pincode: address.pincode ?? address.postal_code ?? '',
    primaryColor: institute.branding?.primary_color ?? '#7c3aed',
  }
}

export function SettingsPage() {
  const qc = useQueryClient()
  const { data, isLoading, isError } = useCurrentInstitute()
  const update = useUpdateCurrentInstitute()
  const institute = data?.data?.institute

  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    primaryColor: '#7c3aed',
  })

  useEffect(() => {
    if (institute) {
      setForm(instituteToForm(institute))
    }
  }, [institute])

  const save = async () => {
    try {
      await update.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        branding: {
          primary_color: form.primaryColor,
        },
      })
      qc.invalidateQueries({ queryKey: ['workspace', 'institute'] })
      qc.invalidateQueries({ queryKey: ['workspace', 'branches'] })
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Could not save settings')
    }
  }

  if (isError) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">Unable to load institute settings.</div>
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Workspace' }, { label: 'Settings' }]}
        title="Settings"
        description="Configure institute profile, branding, payments, and security preferences."
        actions={
          <Button
            onClick={save}
            disabled={isLoading || update.isPending}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
          >
            {update.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {isLoading ? (
            <Skeleton className="h-96 rounded-2xl" />
          ) : (
            <>
              {activeTab === 'profile' && (
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle>Institute profile</CardTitle>
                    <CardDescription>Basic information visible to students and parents.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Institute name</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Address line</Label>
                      <Input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="rounded-xl" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'branding' && (
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle>Branding</CardTitle>
                    <CardDescription>Customize colors and logo for payment pages and receipts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.primaryColor}
                          onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                          className="h-10 w-14 cursor-pointer rounded-lg border border-border"
                        />
                        <Input
                          value={form.primaryColor}
                          onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                          className="max-w-[140px] rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      Logo upload coming soon (PNG, SVG — max 2MB)
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'payments' && (
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle>Payment gateway</CardTitle>
                    <CardDescription>Razorpay Route is configured at the platform level for your institute.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Gateway</Label>
                      <Input value="Razorpay" readOnly className="rounded-xl bg-muted/40" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Route account</Label>
                      <Input
                        value={institute?.razorpay_route_account_id ? `Linked (${institute.razorpay_route_status ?? 'active'})` : 'Not linked — contact platform admin'}
                        readOnly
                        className="rounded-xl bg-muted/40"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Webhook URL</Label>
                      <Input value={`${webhookBase}/api/webhooks/razorpay`} readOnly className="rounded-xl bg-muted/40" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Two-factor authentication and session management.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                      <div>
                        <div className="font-medium">Two-factor authentication</div>
                        <div className="text-sm text-muted-foreground">OTP login is enabled for your account</div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl" disabled>
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                      <div>
                        <div className="font-medium">Session timeout</div>
                        <div className="text-sm text-muted-foreground">Managed by your JWT token expiry</div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl" disabled>
                        Platform default
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
