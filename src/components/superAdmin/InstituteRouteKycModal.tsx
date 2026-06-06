import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Link2,
  RefreshCw,
  User,
  Landmark,
} from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Badge } from '@/components/ui/label'
import { apiGet, apiPatch, apiPost } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Institute } from '@/types/api'

type RouteKyc = {
  route_enabled: boolean
  razorpay_configured: boolean
  razorpay_test_mode: boolean
  account_id: string
  status: string
  activation_status: string
  settlements_ready: boolean
  kyc_draft: Record<string, unknown>
  last_error: string
  last_error_reason?: string
}

type KycForm = {
  legal_business_name: string
  contact_name: string
  email: string
  phone: string
  street1: string
  city: string
  state: string
  postal_code: string
  stakeholder_name: string
  stakeholder_email: string
  pan: string
  account_number: string
  ifsc_code: string
  beneficiary_name: string
  business_type: string
}

const STEPS = [
  { id: 0, label: 'Business', short: 'Business details' },
  { id: 1, label: 'Stakeholder', short: 'Director / owner' },
  { id: 2, label: 'Bank', short: 'Settlement account' },
  { id: 3, label: 'Review', short: 'Submit & link' },
] as const

const statusLabels: Record<string, string> = {
  not_started: 'Not started',
  account_created: 'Account created',
  stakeholder_added: 'Stakeholder added',
  product_requested: 'Bank review',
  under_review: 'Under review',
  needs_clarification: 'Needs clarification',
  activated: 'Ready for settlements',
  manual_linked: 'Linked manually',
  suspended: 'Suspended',
}

const emptyForm = (): KycForm => ({
  legal_business_name: '',
  contact_name: '',
  email: '',
  phone: '',
  street1: '',
  city: '',
  state: '',
  postal_code: '',
  stakeholder_name: '',
  stakeholder_email: '',
  pan: '',
  account_number: '',
  ifsc_code: '',
  beneficiary_name: '',
  business_type: 'not_for_profit',
})

function instituteId(inst: Institute) {
  return String(inst._id ?? (inst as { id?: string }).id ?? '')
}

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="KYC progress" className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  done && 'bg-violet-600 text-white',
                  active && !done && 'bg-violet-600 text-white ring-4 ring-violet-200',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-center text-[10px] font-medium sm:block',
                  active ? 'text-violet-700' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn('mx-1 mb-5 h-0.5 flex-1 rounded-full sm:mb-6', i < current ? 'bg-violet-500' : 'bg-border')}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

function validateStep(step: number, form: KycForm): string | null {
  if (step === 0) {
    if (!form.legal_business_name.trim()) return 'Legal business name is required.'
    if (!form.contact_name.trim()) return 'Contact name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!form.phone.trim()) return 'Phone is required.'
    if (!form.street1.trim()) return 'Street address is required.'
    if (!form.city.trim()) return 'City is required.'
    if (!form.state.trim()) return 'State is required.'
    if (!/^\d{6}$/.test(form.postal_code.trim())) return 'Enter a valid 6-digit PIN code.'
    return null
  }
  if (step === 1) {
    if (!form.stakeholder_name.trim()) return 'Stakeholder name is required.'
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(form.pan.trim())) return 'Enter a valid 10-character PAN.'
    if (!form.stakeholder_email.trim()) return 'Stakeholder email is required.'
    return null
  }
  if (step === 2) {
    if (!form.beneficiary_name.trim()) return 'Beneficiary name is required.'
    if (!form.account_number.trim()) return 'Account number is required.'
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifsc_code.trim())) return 'Enter a valid IFSC code.'
    return null
  }
  return null
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value || '—'}</span>
    </div>
  )
}

export function InstituteRouteKycModal({
  institute,
  open,
  onClose,
}: {
  institute: Institute | null
  open: boolean
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [route, setRoute] = useState<RouteKyc | null>(null)
  const [manualId, setManualId] = useState('')
  const [form, setForm] = useState<KycForm>(emptyForm)

  const id = institute ? instituteId(institute) : ''

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await apiGet<{ route: RouteKyc }>(`/v1/institutes/${id}/route`)
      const r = res.data?.route ?? null
      setRoute(r)
      const draft = (r?.kyc_draft ?? {}) as Record<string, string>
      setForm({
        legal_business_name: draft.legal_business_name ?? institute?.name ?? '',
        contact_name: draft.contact_name ?? institute?.name ?? '',
        email: draft.email ?? institute?.email ?? '',
        phone: draft.phone ?? institute?.phone ?? '',
        street1: draft.street1 ?? '',
        city: draft.city ?? institute?.address?.city ?? '',
        state: draft.state ?? institute?.address?.state ?? '',
        postal_code: draft.postal_code ?? '',
        stakeholder_name: draft.stakeholder_name ?? draft.contact_name ?? '',
        stakeholder_email: draft.stakeholder_email ?? draft.email ?? institute?.email ?? '',
        pan: draft.pan ?? '',
        account_number: draft.account_number ?? '',
        ifsc_code: draft.ifsc_code ?? '',
        beneficiary_name: draft.beneficiary_name ?? institute?.name ?? '',
        business_type: draft.business_type ?? 'not_for_profit',
      })
      setManualId(r?.account_id ?? '')
    } catch {
      toast.error('Could not load Route KYC status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && institute) {
      setStep(0)
      load()
    }
  }, [open, id])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['institutes'] })
    qc.invalidateQueries({ queryKey: ['institute-route', id] })
  }

  const saveDraft = async () => {
    if (!id) return
    setSavingDraft(true)
    try {
      await apiPatch(`/v1/institutes/${id}/route/draft`, form)
    } catch {
      /* non-blocking */
    } finally {
      setSavingDraft(false)
    }
  }

  const goNext = async () => {
    const err = validateStep(step, form)
    if (err) {
      toast.error(err)
      return
    }
    await saveDraft()
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const submitKyc = async () => {
    if (!id) return
    for (let i = 0; i < 3; i++) {
      const err = validateStep(i, form)
      if (err) {
        toast.error(err)
        setStep(i)
        return
      }
    }
    setSubmitting(true)
    try {
      const res = await apiPost<{ route: RouteKyc; skipped_razorpay?: boolean }>(
        `/v1/institutes/${id}/route/submit`,
        form,
      )
      setRoute(res.data?.route ?? null)
      toast.success(
        res.message ??
          (res.data?.skipped_razorpay
            ? 'KYC saved (Route API off — enable in .env after Razorpay approval)'
            : 'Route KYC submitted'),
      )
      invalidate()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Razorpay rejected the KYC request. Check details and try again.'
      toast.error(msg)
      load()
    } finally {
      setSubmitting(false)
    }
  }

  const syncStatus = async () => {
    if (!id) return
    try {
      const res = await apiPost<{ route: RouteKyc }>(`/v1/institutes/${id}/route/sync`, {})
      setRoute(res.data?.route ?? null)
      toast.success('Status synced from Razorpay')
      invalidate()
    } catch {
      toast.error('Sync failed')
    }
  }

  const linkManual = async () => {
    if (!id || !manualId.trim()) return
    try {
      const res = await apiPatch<{ route: RouteKyc }>(`/v1/institutes/${id}/route/link`, {
        razorpay_route_account_id: manualId.trim(),
      })
      setRoute(res.data?.route ?? null)
      toast.success('Account ID linked')
      invalidate()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Link failed'
      toast.error(msg)
    }
  }

  if (!institute) return null

  const ready = route?.settlements_ready
  const status = route?.status ?? 'not_started'
  const businessTypeLabel =
    {
      not_for_profit: 'Not for profit (school/trust)',
      private_limited: 'Private limited',
      partnership: 'Partnership',
      proprietorship: 'Proprietorship',
    }[form.business_type] ?? form.business_type

  return (
    <Modal open={open} onClose={onClose} title="Route KYC & settlements" size="2xl">
      <div className="space-y-5">
        {/* Institute header — always visible */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-4">
          <Building2 className="h-5 w-5 text-violet-600" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{institute.name}</div>
            <div className="text-xs text-muted-foreground">{institute.email}</div>
          </div>
          <Badge className={ready ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}>
            {ready ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Settlements ready
              </span>
            ) : (
              statusLabels[status] ?? status
            )}
          </Badge>
          {route?.razorpay_test_mode && <Badge className="bg-blue-100 text-blue-800">Test mode</Badge>}
        </div>

        {!route?.route_enabled && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Set <code className="text-xs">RAZORPAY_ROUTE_ENABLED=true</code> in backend .env to enable Route
            settlements.
          </p>
        )}

        {route?.account_id && (
          <div className="rounded-lg border border-violet-200/60 bg-violet-50/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Linked account: </span>
            <code className="font-mono text-xs">{route.account_id}</code>
            {route.activation_status && (
              <span className="ml-2 text-violet-800">({route.activation_status})</span>
            )}
          </div>
        )}

        {route?.last_error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            <p>{route.last_error}</p>
            {route.last_error_reason === 'route_not_enabled' && (
              <p className="mt-2 text-xs text-rose-800">
                Enable Route on your Razorpay merchant, or create the linked account in Dashboard → Route → Linked
                Accounts and paste the <code className="text-[11px]">acc_…</code> ID on step 4.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading KYC status…</p>
        ) : (
          <>
            <StepIndicator current={step} />

            <div className="min-h-[300px] rounded-xl border border-border/60 bg-background p-5 sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold">
                  Step {step + 1} of {STEPS.length}: {STEPS[step].short}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {step === 0 && 'Legal entity and registered address as per institute records.'}
                  {step === 1 && 'Director or owner PAN details for Razorpay verification.'}
                  {step === 2 && 'Bank account where college fee settlements will be credited.'}
                  {step === 3 && 'Confirm details, submit to Razorpay, or link an existing account.'}
                </p>
              </div>

              {/* Step 1 — Business */}
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Legal business name</Label>
                    <Input
                      value={form.legal_business_name}
                      onChange={(e) => setForm({ ...form, legal_business_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Contact name</Label>
                    <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Business type</Label>
                    <select
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      value={form.business_type}
                      onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                    >
                      <option value="not_for_profit">Not for profit (school/trust)</option>
                      <option value="private_limited">Private limited</option>
                      <option value="partnership">Partnership</option>
                      <option value="proprietorship">Proprietorship</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Registered address — street</Label>
                    <Input value={form.street1} onChange={(e) => setForm({ ...form, street1: e.target.value })} placeholder="Street" />
                  </div>
                  <div className="space-y-1">
                    <Label>City</Label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>State</Label>
                    <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>PIN code</Label>
                    <Input
                      value={form.postal_code}
                      onChange={(e) => setForm({ ...form, postal_code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {/* Step 2 — Stakeholder */}
              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="mb-1 flex items-center gap-2 text-violet-700 sm:col-span-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Stakeholder (director / owner)</span>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Name (as per PAN)</Label>
                    <Input
                      value={form.stakeholder_name}
                      onChange={(e) => setForm({ ...form, stakeholder_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>PAN</Label>
                    <Input
                      value={form.pan}
                      onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase().slice(0, 10) })}
                      placeholder="ABCDE1234F"
                      className="font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Stakeholder email</Label>
                    <Input
                      type="email"
                      value={form.stakeholder_email}
                      onChange={(e) => setForm({ ...form, stakeholder_email: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3 — Bank */}
              {step === 2 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="mb-1 flex items-center gap-2 text-violet-700 sm:col-span-2">
                    <Landmark className="h-4 w-4" />
                    <span className="text-sm font-medium">Settlement bank account</span>
                  </div>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    College fee settlements are transferred to this account via Razorpay Route after each successful
                    payment.
                  </p>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Beneficiary name</Label>
                    <Input
                      value={form.beneficiary_name}
                      onChange={(e) => setForm({ ...form, beneficiary_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Account number</Label>
                    <Input
                      value={form.account_number}
                      onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>IFSC</Label>
                    <Input
                      value={form.ifsc_code}
                      onChange={(e) => setForm({ ...form, ifsc_code: e.target.value.toUpperCase().slice(0, 11) })}
                      placeholder="HDFC0001234"
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Step 4 — Review */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business</p>
                    <ReviewRow label="Legal name" value={form.legal_business_name} />
                    <ReviewRow label="Type" value={businessTypeLabel} />
                    <ReviewRow label="Contact" value={form.contact_name} />
                    <ReviewRow label="Email / phone" value={`${form.email} · ${form.phone}`} />
                    <ReviewRow
                      label="Address"
                      value={`${form.street1}, ${form.city}, ${form.state} ${form.postal_code}`}
                    />
                  </div>
                  <div className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stakeholder</p>
                    <ReviewRow label="Name" value={form.stakeholder_name} />
                    <ReviewRow label="PAN" value={form.pan} />
                    <ReviewRow label="Email" value={form.stakeholder_email} />
                  </div>
                  <div className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bank</p>
                    <ReviewRow label="Beneficiary" value={form.beneficiary_name} />
                    <ReviewRow label="Account" value={form.account_number} />
                    <ReviewRow label="IFSC" value={form.ifsc_code} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
                      disabled={submitting || !route?.razorpay_configured}
                      onClick={submitKyc}
                    >
                      {submitting ? 'Submitting to Razorpay…' : 'Submit Route KYC'}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={syncStatus}>
                      <RefreshCw className="mr-1.5 h-4 w-4" />
                      Sync status
                    </Button>
                  </div>

                  <div className="rounded-xl border border-dashed border-border/80 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Link2 className="h-4 w-4" /> Already created in Razorpay Dashboard?
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Paste the linked account ID from Route → Linked Accounts if you onboarded manually.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="acc_xxxxxxxx"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" className="shrink-0 rounded-xl" onClick={linkManual}>
                        Link ID
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={goBack}
                disabled={step === 0 || savingDraft}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <span className="text-xs text-muted-foreground">
                {savingDraft ? 'Saving draft…' : `Step ${step + 1} of ${STEPS.length}`}
              </span>
              {step < STEPS.length - 1 ? (
                <Button className="rounded-xl" onClick={goNext} disabled={savingDraft}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" className="rounded-xl text-muted-foreground" onClick={() => setStep(0)}>
                  Edit from start
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
