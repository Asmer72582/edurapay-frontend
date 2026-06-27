import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Building2, ShieldCheck } from 'lucide-react'
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
  const [feeMarkupMode, setFeeMarkupMode] = useState<MarkupMode>('parent_extra')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    markupMode: 'parent_extra' as MarkupMode,
  })
  const [savingModeId, setSavingModeId] = useState<string | null>(null)

  const submit = async () => {
    try {
      await createInstitute.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: 'approved',
        address: { city: form.city, state: form.state },
        platform_markup_mode: form.markupMode,
      })
      toast.success('Institute created!')
      setForm({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        markupMode: 'parent_extra',
      })
      qc.invalidateQueries({ queryKey: ['institutes'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'super-admin'] })
    } catch {
      toast.error('Failed to create institute.')
    }
  }

  const openFeeEditor = (inst: Institute) => {
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

  const saveFeeMode = async () => {
    if (!feeInstitute) return
    try {
      await updateInstitute.mutateAsync({
        id: instituteId(feeInstitute),
        platform_markup_mode: feeMarkupMode,
      })
      toast.success('Fee mode updated for this college.')
      setFeeInstitute(null)
      qc.invalidateQueries({ queryKey: ['institutes'] })
    } catch {
      toast.error('Could not update fee mode.')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Institute management</h1>
        <p className="text-muted-foreground">
          Onboard institutes and complete Razorpay Route KYC so college settlements work automatically. Platform charge
          per transaction is set globally under Route setup.
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
              <Label>Who pays the platform charge?</Label>
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
              <p className="text-xs text-muted-foreground">
                {form.markupMode === 'parent_extra'
                  ? 'Flat platform charge added at student checkout. College gets the full entered fee.'
                  : 'Flat platform charge deducted from college settlement. Parent pays only the entered fee.'}
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
                          <div
                            className={cn(
                              'inline-grid min-w-[11rem] grid-cols-2 gap-0.5 rounded-lg border border-border/60 bg-muted/20 p-0.5',
                              savingModeId === instituteId(inst) && 'opacity-60 pointer-events-none',
                            )}
                          >
                            <button
                              type="button"
                              title="Parent pays fee + platform charge"
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
                              title="Platform charge deducted from college"
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
                              Fee mode
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
        title={feeInstitute ? `Fee mode — ${feeInstitute.name}` : 'Fee mode'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Who pays the platform charge?</Label>
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
                ? 'Parent pays entered fee plus the flat platform charge. College receives the full entered amount.'
                : 'Parent pays only the entered fee. The flat platform charge is deducted from the college settlement.'}
            </p>
          </div>
          <Button className="w-full rounded-xl" onClick={saveFeeMode} disabled={updateInstitute.isPending}>
            {updateInstitute.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
