import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Building2, Percent, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label, Badge, Skeleton } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { InstituteRouteKycModal } from '@/components/superAdmin/InstituteRouteKycModal'
import { useInstitutes, useCreateInstitute, useUpdateInstitute } from '@/hooks/useApi'
import { Modal } from '@/components/ui/modal'
import type { Institute } from '@/types/api'
import { cn } from '@/lib/utils'

type MarkupMode = 'parent_extra' | 'college_absorb'

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const routeStatusColors: Record<string, string> = {
  activated: 'bg-emerald-100 text-emerald-800',
  manual_linked: 'bg-emerald-100 text-emerald-800',
  not_started: 'bg-gray-100 text-gray-700',
  needs_clarification: 'bg-rose-100 text-rose-800',
}

function instituteId(inst: Institute) {
  return String(inst._id ?? inst.id ?? '')
}

export function InstitutesAdminPage() {
  const { data, isLoading } = useInstitutes()
  const createInstitute = useCreateInstitute()
  const updateInstitute = useUpdateInstitute()
  const qc = useQueryClient()
  const institutes = data?.data?.data ?? []

  const [kycInstitute, setKycInstitute] = useState<Institute | null>(null)
  const [feeInstitute, setFeeInstitute] = useState<Institute | null>(null)
  const [feePercent, setFeePercent] = useState('3')
  const [feeMarkupMode, setFeeMarkupMode] = useState<MarkupMode>('parent_extra')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    convenienceFeePercent: '3',
    markupMode: 'parent_extra' as MarkupMode,
  })
  const [savingModeId, setSavingModeId] = useState<string | null>(null)

  const submit = async () => {
    try {
      const pct = parseFloat(form.convenienceFeePercent)
      const bps = Number.isFinite(pct) ? Math.round(pct * 100) : 300
      await createInstitute.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: 'approved',
        address: { city: form.city, state: form.state },
        platform_markup_bps: bps,
        platform_markup_mode: form.markupMode,
      })
      toast.success('Institute created!')
      setForm({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        convenienceFeePercent: '3',
        markupMode: 'parent_extra',
      })
      qc.invalidateQueries({ queryKey: ['institutes'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'super-admin'] })
    } catch {
      toast.error('Failed to create institute.')
    }
  }

  const openFeeEditor = (inst: Institute) => {
    const bps = (inst as Institute).platform_markup_bps
    setFeePercent(bps != null && !Number.isNaN(Number(bps)) ? String(Number(bps) / 100) : '3')
    const mode = inst.platform_markup_mode === 'college_absorb' ? 'college_absorb' : 'parent_extra'
    setFeeMarkupMode(mode)
    setFeeInstitute(inst)
  }

  const saveMarkupMode = async (inst: Institute, mode: MarkupMode) => {
    const id = instituteId(inst)
    const current = inst.platform_markup_mode === 'college_absorb' ? 'college_absorb' : 'parent_extra'
    if (current === mode) return

    setSavingModeId(id)
    try {
      await updateInstitute.mutateAsync({ id, platform_markup_mode: mode })
      toast.success(mode === 'parent_extra' ? 'Set to Parent extra' : 'Set to College fee')
      qc.invalidateQueries({ queryKey: ['institutes'] })
    } catch {
      toast.error('Could not update fee mode.')
    } finally {
      setSavingModeId(null)
    }
  }

  const saveConvenienceFee = async () => {
    if (!feeInstitute) return
    const pct = parseFloat(feePercent)
    if (!Number.isFinite(pct) || pct < 0 || pct > 50) {
      toast.error('Enter a valid percent between 0 and 50.')
      return
    }
    try {
      await updateInstitute.mutateAsync({
        id: instituteId(feeInstitute),
        platform_markup_bps: Math.round(pct * 100),
        platform_markup_mode: feeMarkupMode,
      })
      toast.success('Fee settings updated for this college.')
      setFeeInstitute(null)
      qc.invalidateQueries({ queryKey: ['institutes'] })
    } catch {
      toast.error('Could not update convenience fee.')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Institute management</h1>
        <p className="text-muted-foreground">
          Onboard institutes and complete Razorpay Route KYC so college settlements work automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Register institute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Institute name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Springfield Academy" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Who pays the platform fee?</Label>
              <div className="grid max-w-md grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
                <button
                  type="button"
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    form.markupMode === 'parent_extra'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/60',
                  )}
                  onClick={() => setForm({ ...form, markupMode: 'parent_extra' })}
                >
                  Parent extra
                </button>
                <button
                  type="button"
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    form.markupMode === 'college_absorb'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/60',
                  )}
                  onClick={() => setForm({ ...form, markupMode: 'college_absorb' })}
                >
                  College fee
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Platform fee %</Label>
              <Input
                type="number"
                min={0}
                max={50}
                step={0.01}
                value={form.convenienceFeePercent}
                onChange={(e) => setForm({ ...form, convenienceFeePercent: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {form.markupMode === 'parent_extra'
                  ? 'Added on top at student checkout. College gets the full entered fee.'
                  : 'Deducted from college settlement. Parent pays only the entered fee.'}
              </p>
            </div>
          </div>
          <Button onClick={submit} disabled={createInstitute.isPending || !form.name || !form.email || !form.phone}>
            {createInstitute.isPending ? 'Creating...' : 'Create institute'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> All institutes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Location</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Convenience fee</th>
                    <th className="pb-3 pr-4 font-medium">Fee mode</th>
                    <th className="pb-3 pr-4 font-medium">Route KYC</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutes.map((inst) => {
                    const routeStatus = String(
                      (inst as Institute & { razorpay_route_status?: string }).razorpay_route_status ?? 'not_started',
                    )
                    const accountId = String(
                      (inst as Institute & { razorpay_route_account_id?: string }).razorpay_route_account_id ?? '',
                    )
                    return (
                      <tr key={instituteId(inst)} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 font-medium">{inst.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{inst.email ?? '—'}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {[inst.address?.city, inst.address?.state].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={statusColors[inst.status] ?? ''}>{inst.status}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {inst.platform_markup_bps != null ? (
                            <span className="font-semibold tabular-nums">
                              {(Number(inst.platform_markup_bps) / 100).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Default</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div
                            className={cn(
                              'inline-grid min-w-[11rem] grid-cols-2 gap-0.5 rounded-lg border border-border/60 bg-muted/20 p-0.5',
                              savingModeId === instituteId(inst) && 'opacity-60 pointer-events-none',
                            )}
                          >
                            <button
                              type="button"
                              title="Parent pays fee + platform %"
                              className={cn(
                                'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                                inst.platform_markup_mode !== 'college_absorb'
                                  ? 'bg-violet-600 text-white'
                                  : 'text-muted-foreground hover:bg-muted/60',
                              )}
                              onClick={() => saveMarkupMode(inst, 'parent_extra')}
                            >
                              Parent extra
                            </button>
                            <button
                              type="button"
                              title="Platform % deducted from college"
                              className={cn(
                                'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                                inst.platform_markup_mode === 'college_absorb'
                                  ? 'bg-sky-600 text-white'
                                  : 'text-muted-foreground hover:bg-muted/60',
                              )}
                              onClick={() => saveMarkupMode(inst, 'college_absorb')}
                            >
                              College fee
                            </button>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={routeStatusColors[routeStatus] ?? 'bg-amber-100 text-amber-900'}>
                            {routeStatus === 'activated' || routeStatus === 'manual_linked'
                              ? 'Ready'
                              : routeStatus.replace(/_/g, ' ')}
                          </Badge>
                          {accountId && (
                            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{accountId}</div>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => openFeeEditor(inst)}
                            >
                              <Percent className="mr-1 h-3.5 w-3.5" />
                              Fee settings
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => setKycInstitute(inst)}
                            >
                              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                              Route KYC
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {institutes.length === 0 && <p className="py-4 text-sm text-muted-foreground">No institutes yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <InstituteRouteKycModal
        institute={kycInstitute}
        open={Boolean(kycInstitute)}
        onClose={() => setKycInstitute(null)}
      />

      <Modal
        open={Boolean(feeInstitute)}
        onClose={() => setFeeInstitute(null)}
        title={feeInstitute ? `Fee settings — ${feeInstitute.name}` : 'Fee settings'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Who pays the platform fee?</Label>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  feeMarkupMode === 'parent_extra'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/60',
                )}
                onClick={() => setFeeMarkupMode('parent_extra')}
              >
                Parent extra
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  feeMarkupMode === 'college_absorb'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/60',
                )}
                onClick={() => setFeeMarkupMode('college_absorb')}
              >
                College fee
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {feeMarkupMode === 'parent_extra'
                ? 'Parent pays entered fee plus the % below. College receives the full entered amount.'
                : 'Parent pays only the entered fee. The % below is deducted from the college settlement.'}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Platform fee %</Label>
            <Input
              type="number"
              min={0}
              max={50}
              step={0.01}
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
            />
          </div>
          <Button className="w-full rounded-xl" onClick={saveConvenienceFee} disabled={updateInstitute.isPending}>
            {updateInstitute.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
