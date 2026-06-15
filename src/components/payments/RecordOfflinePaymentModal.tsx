import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Banknote, Check, Loader2, Search, User } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import {
  useCourseOptions,
  useOfflinePaymentPreview,
  useRecordOfflinePayment,
  useStudents,
} from '@/hooks/useApi'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { formatInr } from '@/lib/institute-mock'
import { openInstituteFeeReceiptPrint } from '@/lib/fee-receipt-print'
import type { InstallmentStrategy } from '@/types/payment-link'
import { cn } from '@/lib/utils'

const STRATEGIES: { value: InstallmentStrategy; label: string; hint: string }[] = [
  { value: 'auto', label: 'Next due installment', hint: 'Current or earliest unpaid fee' },
  { value: 'specific_month', label: 'Specific month', hint: 'All unpaid fees due in the month you pick' },
  { value: 'all_outstanding', label: 'All outstanding fees', hint: 'Everything the student still owes' },
  { value: 'selected', label: 'Choose specific fees', hint: 'Pick exact installments' },
]

const OFFLINE_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI (offline)' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'manual', label: 'Manual / other' },
]

function currentDueMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function buildDueMonthOptions() {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let offset = -6; offset <= 18; offset += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    options.push({ value, label })
  }
  return options
}

const DUE_MONTH_OPTIONS = buildDueMonthOptions()

function toId(s: Record<string, unknown>) {
  return String(s.id ?? s._id ?? '')
}

function toCourseId(c: Record<string, unknown>) {
  return String(c.id ?? c._id ?? '')
}

function studentName(s: Record<string, unknown>) {
  return `${String(s.first_name ?? '')} ${String(s.last_name ?? '')}`.trim() || 'Student'
}

function studentInitials(s: Record<string, unknown>) {
  const first = String(s.first_name ?? '').charAt(0)
  const last = String(s.last_name ?? '').charAt(0)
  return (first + last).toUpperCase() || 'S'
}

function studentBalance(s: Record<string, unknown>) {
  const summary = s.fee_summary as { fees_total?: number; fees_paid?: number } | undefined
  if (summary) return Math.max(0, Number(summary.fees_total ?? 0) - Number(summary.fees_paid ?? 0))
  return Number(s.balance_due ?? s.outstanding ?? 0)
}

function collectionLabel(c: Record<string, unknown>) {
  return String(c.grade ?? c.name ?? 'Collection')
}

function installmentPickerLabel(
  installments: { id: string; label: string; amount_inr: number }[],
  inst: { label: string; amount_inr: number },
) {
  const duplicateLabels = installments.filter((row) => row.label === inst.label).length > 1
  return duplicateLabels ? `${inst.label} · ${formatInr(inst.amount_inr)} fee` : inst.label
}

function SectionTitle({
  step,
  title,
  hint,
  primary = false,
}: {
  step: string
  title: string
  hint?: string
  primary?: boolean
}) {
  return (
    <div className={cn('mb-3', primary && 'mb-4')}>
      <p className={cn('text-foreground', primary ? 'text-base font-bold' : 'text-sm font-bold')}>
        <span
          className={cn(
            'mr-2 inline-flex items-center justify-center rounded-full font-bold',
            primary ? 'h-7 w-7 bg-emerald-600 text-sm text-white' : 'h-6 w-6 bg-emerald-100 text-xs text-emerald-800',
          )}
        >
          {step}
        </span>
        {title}
      </p>
      {hint && (
        <p className={cn('mt-1 leading-relaxed text-muted-foreground', primary ? 'pl-9 text-sm' : 'pl-8 text-xs')}>
          {hint}
        </p>
      )}
    </div>
  )
}

export function RecordOfflinePaymentModal({
  open,
  onClose,
  onRecorded,
  presetStudentId,
  presetCourseId,
}: {
  open: boolean
  onClose: () => void
  onRecorded: () => void
  presetStudentId?: string
  presetCourseId?: string
}) {
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [installmentStrategy, setInstallmentStrategy] = useState<InstallmentStrategy>('auto')
  const [dueMonth, setDueMonth] = useState(currentDueMonth)
  const [pickedInstallments, setPickedInstallments] = useState<string[]>([])
  const [method, setMethod] = useState('cash')
  const [amountInput, setAmountInput] = useState('')
  const [note, setNote] = useState('')
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10))

  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: coursesData, isLoading: coursesLoading } = useCourseOptions({ enabled: open })
  const { data: studentsData, isLoading: studentsLoading } = useStudents(debouncedSearch, 1, 100, { enabled: open })
  const record = useRecordOfflinePayment()

  const previewFilters = useMemo(
    () => ({
      course_id: courseId || undefined,
      installment_strategy: installmentStrategy,
      installment_ids:
        installmentStrategy === 'selected' && pickedInstallments.length > 0 ? pickedInstallments : undefined,
      due_month: installmentStrategy === 'specific_month' ? dueMonth : undefined,
    }),
    [courseId, installmentStrategy, pickedInstallments, dueMonth],
  )

  const previewEnabled =
    open &&
    studentId !== '' &&
    (installmentStrategy !== 'selected' || pickedInstallments.length > 0)

  const { data: previewData, isFetching: previewLoading } = useOfflinePaymentPreview(
    studentId,
    previewFilters,
    previewEnabled,
  )
  const preview = previewData?.data

  const feeListEnabled = open && studentId !== '' && installmentStrategy === 'selected'
  const { data: feeListData, isFetching: feeListLoading } = useOfflinePaymentPreview(
    studentId,
    { course_id: courseId || undefined, installment_strategy: 'all_outstanding' },
    feeListEnabled,
  )
  const availableInstallments = feeListData?.data?.installments ?? []

  const collections = useMemo(() => {
    const rows = (coursesData?.data?.data ?? []) as Record<string, unknown>[]
    return rows.filter((c) => (c.status ?? 'active') !== 'archived')
  }, [coursesData])

  const collectionOptions = useMemo(
    () => [
      { value: '', label: 'All collections' },
      ...collections.map((c) => ({ value: toCourseId(c), label: collectionLabel(c) })),
    ],
    [collections],
  )

  const enrolled = useMemo(() => {
    const rows = (studentsData?.data?.data ?? []) as Record<string, unknown>[]
    return rows.filter((s) => {
      const ids = [...((s.course_ids as string[]) ?? [])]
      if (ids.length === 0) return false
      if (!courseId) return true
      return ids.includes(courseId)
    })
  }, [studentsData, courseId])

  const suggestedAmount =
    preview?.ok && preview.preview
      ? preview.preview.student_payable_inr ?? preview.preview.institute_base_inr ?? 0
      : 0

  useEffect(() => {
    if (!open) return
    setSearch('')
    setCourseId(presetCourseId ?? '')
    setStudentId(presetStudentId ?? '')
    setInstallmentStrategy('auto')
    setDueMonth(currentDueMonth())
    setPickedInstallments([])
    setMethod('cash')
    setAmountInput('')
    setNote('')
    setPaidAt(new Date().toISOString().slice(0, 10))
  }, [open, presetStudentId, presetCourseId])

  useEffect(() => {
    if (suggestedAmount > 0 && amountInput === '') {
      setAmountInput(String(suggestedAmount))
    }
  }, [suggestedAmount, amountInput])

  useEffect(() => {
    setAmountInput('')
  }, [studentId, installmentStrategy, pickedInstallments, dueMonth, courseId])

  const parsedAmount = Number(amountInput)
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount >= 0.01
  const amountExceeds = suggestedAmount > 0 && amountValid && parsedAmount > suggestedAmount + 0.01

  const singleBlocked =
    !!studentId &&
    !previewLoading &&
    (preview?.ok === false || (installmentStrategy === 'selected' && pickedInstallments.length === 0))

  const canSubmit =
    !record.isPending &&
    !!studentId &&
    !singleBlocked &&
    amountValid &&
    !amountExceeds &&
    (installmentStrategy !== 'selected' || pickedInstallments.length > 0)

  const submit = async () => {
    try {
      const body: Record<string, unknown> = {
        student_id: studentId,
        installment_strategy: installmentStrategy,
        method,
        amount: parsedAmount,
        note: note.trim() || undefined,
        paid_at: paidAt || undefined,
      }
      if (courseId) body.course_id = courseId
      if (installmentStrategy === 'selected' && pickedInstallments.length > 0) {
        body.installment_ids = pickedInstallments
      }
      if (installmentStrategy === 'specific_month') {
        body.due_month = dueMonth
      }

      const res = await record.mutateAsync(body)
      const payload = res.data as { receipt_number?: string; payment_id?: string }
      toast.success(res.message || 'Offline payment recorded', {
        description: payload?.receipt_number ? `Receipt ${payload.receipt_number}` : undefined,
      })
      if (payload?.payment_id) {
        await openInstituteFeeReceiptPrint({ id: payload.payment_id })
      }
      onRecorded()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not record offline payment.')
    }
  }

  const selectedStudent = enrolled.find((s) => toId(s) === studentId)

  const footer = (
    <>
      <Button variant="outline" className="rounded-xl" onClick={onClose} disabled={record.isPending}>
        Cancel
      </Button>
      <Button
        className="min-w-[220px] gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold"
        onClick={submit}
        disabled={!canSubmit}
      >
        {record.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
        Record payment
      </Button>
    </>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record offline payment"
      description="Log cash or in-person fee collected at your institute counter."
      size="2xl"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Low-profile filters */}
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2 border-b border-border/40 pb-3">
          <div className="min-w-[140px] flex-1 sm:max-w-[200px]">
            <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Collection</Label>
            <SelectField
              value={courseId}
              onChange={(next) => {
                setCourseId(next)
                setStudentId('')
                setPickedInstallments([])
              }}
              options={collectionOptions}
              disabled={coursesLoading}
              truncate={false}
              aria-label="Collection"
            />
          </div>
          <div className="min-w-[160px] flex-1 sm:max-w-[220px]">
            <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Fee to apply</Label>
            <SelectField
              value={installmentStrategy}
              onChange={(v) => {
                setInstallmentStrategy(v as InstallmentStrategy)
                setPickedInstallments([])
              }}
              options={STRATEGIES.map((s) => ({ value: s.value, label: s.label }))}
              truncate={false}
              aria-label="Fee to apply"
            />
          </div>
          {installmentStrategy === 'specific_month' && (
            <div className="min-w-[140px] flex-1 sm:max-w-[180px]">
              <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Month</Label>
              <SelectField
                value={dueMonth}
                onChange={setDueMonth}
                options={DUE_MONTH_OPTIONS}
                truncate={false}
                aria-label="Due in month"
              />
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
          {/* Primary — student picker */}
          <div className="flex min-h-[380px] flex-col overflow-hidden rounded-xl border-2 border-emerald-200/80 bg-card shadow-sm lg:min-h-[440px]">
            <div className="border-b border-emerald-100 bg-emerald-50/50 px-4 py-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <SectionTitle
                step="1"
                title="Select student"
                hint="Search by name or roll number, then tap a student to continue."
                primary
              />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or roll no."
                  className="h-12 rounded-xl border-emerald-200/80 bg-background pl-11 text-base font-medium shadow-sm focus-visible:ring-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto p-2.5">
              {studentsLoading ? (
                <li className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading students…
                </li>
              ) : enrolled.length === 0 ? (
                <li className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
                  <User className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-semibold text-foreground">No students found</p>
                  <p className="text-xs text-muted-foreground">Try another search or collection filter.</p>
                </li>
              ) : (
                enrolled.map((s) => {
                  const id = toId(s)
                  const active = studentId === id
                  const roll = s.roll_no ? String(s.roll_no) : ''
                  const balance = studentBalance(s)
                  const email = String(s.primary_email ?? s.email ?? '')

                  return (
                    <li key={id} className="mb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStudentId(id)
                          setPickedInstallments([])
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all',
                          active
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-950/30'
                            : 'border-transparent bg-background hover:border-border hover:bg-muted/30',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                            active
                              ? 'bg-emerald-600 text-white'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {studentInitials(s)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{studentName(s)}</span>
                            {roll && (
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Roll {roll}
                              </span>
                            )}
                          </span>
                          {email && (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{email}</span>
                          )}
                        </span>
                        {balance > 0 && (
                          <span className="shrink-0 text-right">
                            <span className="block text-[10px] font-medium uppercase text-muted-foreground">Due</span>
                            <span className="text-sm font-bold tabular-nums text-rose-600">{formatInr(balance)}</span>
                          </span>
                        )}
                        {active && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>

          {/* Secondary — payment details */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-muted/5 p-4">
              <SectionTitle step="2" title="Payment details" hint="Amount is pre-filled from the selected fee." />

              {!studentId ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/40 px-6 py-10 text-center lg:min-h-[360px]">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <User className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Waiting for student</p>
                  <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                    Choose a student from the list to enter payment amount.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected student bar */}
                  {selectedStudent && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        {studentInitials(selectedStudent)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{studentName(selectedStudent)}</p>
                        {selectedStudent.roll_no && (
                          <p className="text-xs text-muted-foreground">
                            Roll no. <span className="font-semibold text-foreground">{String(selectedStudent.roll_no)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fee preview */}
                  <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white p-4 dark:from-emerald-950/30 dark:to-card">
                    {previewLoading ? (
                      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        <span className="font-medium">Calculating fee…</span>
                      </div>
                    ) : preview?.ok && preview.preview ? (
                      <>
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Amount due</p>
                        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-emerald-950">
                          {formatInr(suggestedAmount)}
                        </p>
                        <p className="mt-2 text-sm font-bold leading-snug text-emerald-900">
                          {preview.preview.period_label}
                        </p>
                        {preview.preview.line_items && preview.preview.line_items.length > 0 && (
                          <ul className="mt-3 space-y-1 border-t border-emerald-200/50 pt-3 text-xs">
                            {preview.preview.line_items.map((li, i) => (
                              <li key={i} className="flex justify-between gap-2">
                                <span className="text-emerald-900">{li.description}</span>
                                <span className="shrink-0 font-bold tabular-nums text-emerald-950">
                                  {formatInr(li.amount)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <div className="flex items-start gap-2 text-sm text-amber-800">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="font-medium">{preview?.error ?? 'No fee due for this selection.'}</span>
                      </div>
                    )}
                  </div>

                  {/* Fee picker */}
                  {installmentStrategy === 'selected' && (
                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Select fees</p>
                      {feeListLoading ? (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading fees…
                        </div>
                      ) : availableInstallments.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">No unpaid fees.</p>
                      ) : (
                        <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                          {availableInstallments.map((inst) => {
                            const on = pickedInstallments.includes(inst.id)
                            return (
                              <li key={inst.id}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPickedInstallments((prev) =>
                                      prev.includes(inst.id) ? prev.filter((x) => x !== inst.id) : [...prev, inst.id],
                                    )
                                  }
                                  className={cn(
                                    'flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors',
                                    on
                                      ? 'border-emerald-500 bg-emerald-50'
                                      : 'border-border/60 hover:border-emerald-200',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                      on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-border',
                                    )}
                                  >
                                    {on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                  </span>
                                  <span className="min-w-0 flex-1 text-xs font-medium">{installmentPickerLabel(availableInstallments, inst)}</span>
                                  <span className="shrink-0 text-xs font-bold tabular-nums text-rose-600">
                                    {formatInr(inst.balance_inr)}
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Form */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-foreground">Amount received (₹)</Label>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder={suggestedAmount > 0 ? String(suggestedAmount) : '0.00'}
                        className="h-11 rounded-xl text-base font-bold tabular-nums"
                      />
                      {amountExceeds && (
                        <p className="text-xs font-medium text-rose-600">
                          Cannot exceed <span className="font-bold">{formatInr(suggestedAmount)}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Payment method</Label>
                      <SelectField value={method} onChange={setMethod} options={OFFLINE_METHODS} aria-label="Payment method" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Date received</Label>
                      <Input
                        type="date"
                        value={paidAt}
                        onChange={(e) => setPaidAt(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-foreground">Note <span className="font-normal text-muted-foreground">(optional)</span></Label>
                      <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={500}
                        placeholder="e.g. Counter receipt #42"
                        className="h-10 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
