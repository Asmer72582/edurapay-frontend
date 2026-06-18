import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Search,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import { useCourseOptions, useOutstandingPaymentLinkCount, usePaymentLinkPreview, useSendPaymentLinks, useStudents } from '@/hooks/useApi'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { formatInr } from '@/lib/institute-mock'
import type { InstallmentStrategy } from '@/types/payment-link'
import { cn } from '@/lib/utils'

type Mode = 'single' | 'multiple' | 'bulk'

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'single', label: 'One student', hint: 'Pick one person' },
  { id: 'multiple', label: 'Several', hint: 'Choose from list' },
  { id: 'bulk', label: 'All with balance', hint: 'Everyone due' },
]

const STRATEGIES_BASE: { value: InstallmentStrategy; label: string; hint: string }[] = [
  { value: 'auto', label: 'Next due installment', hint: 'Current or earliest unpaid fee' },
  { value: 'specific_month', label: 'Specific month', hint: 'All unpaid fees due in the month you pick' },
  { value: 'all_outstanding', label: 'All outstanding fees', hint: 'Everything the student still owes' },
]

const STRATEGY_SELECTED: { value: InstallmentStrategy; label: string; hint: string } = {
  value: 'selected',
  label: 'Choose specific fees',
  hint: 'Pick exact installments for one student',
}

const EXPIRY_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
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

function dueMonthLabel(value: string) {
  return DUE_MONTH_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function allStrategyOptions(mode: Mode) {
  return mode === 'single' ? [...STRATEGIES_BASE, STRATEGY_SELECTED] : STRATEGIES_BASE
}

function installmentPickerLabel(installments: { id: string; label: string; amount_inr: number }[], inst: { label: string; amount_inr: number }) {
  const duplicateLabels = installments.filter((row) => row.label === inst.label).length > 1
  return duplicateLabels ? `${inst.label} · ${formatInr(inst.amount_inr)} fee` : inst.label
}

function toId(s: Record<string, unknown>) {
  return String(s.id ?? s._id ?? '')
}

function toCourseId(c: Record<string, unknown>) {
  return String(c.id ?? c._id ?? '')
}

function studentName(s: Record<string, unknown>) {
  return `${String(s.first_name ?? '')} ${String(s.last_name ?? '')}`.trim() || 'Student'
}

function collectionLabel(c: Record<string, unknown>) {
  return String(c.grade ?? c.name ?? 'Collection')
}

function studentBalance(s: Record<string, unknown>) {
  const summary = s.fee_summary as { fees_total?: number; fees_paid?: number } | undefined
  if (summary) return Math.max(0, Number(summary.fees_total ?? 0) - Number(summary.fees_paid ?? 0))
  return Number(s.balance_due ?? s.outstanding ?? 0)
}

function strategyLabel(value: InstallmentStrategy, dueMonth?: string) {
  if (value === 'specific_month' && dueMonth) {
    return dueMonthLabel(dueMonth)
  }
  const match = allStrategyOptions('single').find((s) => s.value === value)
  return match?.label ?? value
}

function NotifyPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'border-violet-500 bg-violet-100 text-violet-800'
          : 'border-border/70 bg-background text-muted-foreground hover:border-violet-200',
      )}
    >
      {active && <Check className="mr-1.5 h-3.5 w-3.5" />}
      {label}
    </button>
  )
}

export function SendPaymentLinkModal({
  open,
  onClose,
  onSent,
  presetStudentId,
  presetCourseId,
}: {
  open: boolean
  onClose: () => void
  onSent: () => void
  presetStudentId?: string
  presetCourseId?: string
}) {
  const [mode, setMode] = useState<Mode>('single')
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [installmentStrategy, setInstallmentStrategy] = useState<InstallmentStrategy>('auto')
  const [dueMonth, setDueMonth] = useState(currentDueMonth)
  const [pickedInstallments, setPickedInstallments] = useState<string[]>([])
  const [expiresInDays, setExpiresInDays] = useState('30')
  const [customNote, setCustomNote] = useState('')
  const [allowPartial, setAllowPartial] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true)
  const [showMore, setShowMore] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: coursesData, isLoading: coursesLoading } = useCourseOptions({ enabled: open })
  const { data: studentsData, isLoading: studentsLoading } = useStudents(debouncedSearch, 1, 100, { enabled: open })
  const send = useSendPaymentLinks()
  const { data: outstandingCountData, isLoading: outstandingCountLoading } = useOutstandingPaymentLinkCount(
    courseId,
    open && mode === 'bulk',
  )
  const outstandingCount = outstandingCountData?.data?.count
  const enrolledActiveCount = outstandingCountData?.data?.enrolled_active_count
  const fullyPaidCount = outstandingCountData?.data?.fully_paid_count

  const bulkCountHeadline = useMemo(() => {
    if (outstandingCountLoading) return 'Counting students…'
    if (typeof outstandingCount !== 'number') return 'Students with outstanding fees'
    const due = outstandingCount.toLocaleString('en-IN')
    if (typeof enrolledActiveCount === 'number' && enrolledActiveCount > outstandingCount) {
      return `${due} of ${enrolledActiveCount.toLocaleString('en-IN')} enrolled students have fees due`
    }
    return `${due} student${outstandingCount === 1 ? '' : 's'} with outstanding fees`
  }, [outstandingCountLoading, outstandingCount, enrolledActiveCount])

  const strategyOptions = useMemo(
    () => allStrategyOptions(mode).map((s) => ({ value: s.value, label: s.label })),
    [mode],
  )

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
    mode === 'single' &&
    studentId !== '' &&
    (installmentStrategy !== 'selected' || pickedInstallments.length > 0)

  const { data: previewData, isFetching: previewLoading } = usePaymentLinkPreview(
    studentId,
    previewFilters,
    previewEnabled,
  )
  const preview = previewData?.data

  const feeListEnabled = open && mode === 'single' && studentId !== '' && installmentStrategy === 'selected'
  const { data: feeListData, isFetching: feeListLoading } = usePaymentLinkPreview(
    studentId,
    {
      course_id: courseId || undefined,
      installment_strategy: 'all_outstanding',
    },
    feeListEnabled,
  )
  const availableInstallments = feeListData?.data?.installments ?? []

  const collections = useMemo(() => {
    const rows = (coursesData?.data?.data ?? []) as Record<string, unknown>[]
    return rows.filter((c) => (c.status ?? 'active') !== 'archived')
  }, [coursesData])

  const selectedCollectionLabel = useMemo(() => {
    if (!courseId) return 'All collections'
    const match = collections.find((c) => toCourseId(c) === courseId)
    return match ? collectionLabel(match) : 'Selected collection'
  }, [courseId, collections])

  useEffect(() => {
    if (!open) return
    setMode(presetStudentId ? 'single' : 'single')
    setSearch('')
    setCourseId(presetCourseId ?? '')
    setStudentId(presetStudentId ?? '')
    setSelected(presetStudentId ? [presetStudentId] : [])
    setInstallmentStrategy('auto')
    setDueMonth(currentDueMonth())
    setPickedInstallments([])
    setExpiresInDays('30')
    setCustomNote('')
    setAllowPartial(true)
    setNotifyEmail(true)
    setNotifyWhatsapp(true)
    setShowMore(false)
  }, [open, presetStudentId, presetCourseId])

  useEffect(() => {
    if (mode !== 'single' && installmentStrategy === 'selected') {
      setInstallmentStrategy('auto')
      setPickedInstallments([])
    }
  }, [mode, installmentStrategy])

  const enrolled = useMemo(() => {
    const rows = (studentsData?.data?.data ?? []) as Record<string, unknown>[]
    return rows.filter((s) => {
      const ids = [...((s.course_ids as string[]) ?? [])]
      if (ids.length === 0) return false
      if (!courseId) return true
      return ids.includes(courseId)
    })
  }, [studentsData, courseId])

  const collectionOptions = useMemo(
    () => [
      { value: '', label: 'All collections' },
      ...collections.map((c) => ({ value: toCourseId(c), label: collectionLabel(c) })),
    ],
    [collections],
  )

  const selectedStudent = enrolled.find((s) => toId(s) === studentId)
  const recipientCount = mode === 'single' ? (studentId ? 1 : 0) : mode === 'multiple' ? selected.length : null

  const submitLabel = useMemo(() => {
    if (send.isPending) return 'Sending payment links…'
    if (mode === 'bulk') {
      if (outstandingCountLoading) return 'Loading student count…'
      if (typeof outstandingCount === 'number') {
        return `Send to ${outstandingCount.toLocaleString('en-IN')} student${outstandingCount === 1 ? '' : 's'}`
      }
      return 'Send to all students with balance'
    }
    if (mode === 'multiple') {
      return selected.length
        ? `Send ${selected.length} payment link${selected.length === 1 ? '' : 's'}`
        : 'Select students to send'
    }
    return studentId
      ? installmentStrategy === 'selected' && pickedInstallments.length === 0
        ? 'Select fees to include'
        : 'Send payment link'
      : 'Select a student'
  }, [mode, selected.length, send.isPending, studentId, outstandingCount, outstandingCountLoading])

  const singleBlocked =
    mode === 'single' &&
    !!studentId &&
    !previewLoading &&
    (preview?.ok === false ||
      (installmentStrategy === 'selected' && pickedInstallments.length === 0))

  const canSubmit =
    !send.isPending &&
    !singleBlocked &&
    (mode === 'bulk' ? !outstandingCountLoading && (outstandingCount ?? 0) > 0 : mode === 'single' ? !!studentId : selected.length > 0)

  const submit = async () => {
    try {
      const body: Record<string, unknown> = {
        mode: mode === 'bulk' ? 'bulk' : mode,
        installment_strategy: installmentStrategy,
        expires_in_days: Number(expiresInDays),
        custom_note: customNote.trim() || undefined,
        allow_partial: allowPartial,
        notify_email: notifyEmail,
        notify_whatsapp: notifyWhatsapp,
      }
      if (courseId) body.course_id = courseId
      if (installmentStrategy === 'selected' && pickedInstallments.length > 0) {
        body.installment_ids = pickedInstallments
      }
      if (installmentStrategy === 'specific_month') {
        body.due_month = dueMonth
      }
      if (mode === 'single') body.student_id = studentId
      if (mode === 'multiple') body.student_ids = selected

      const res = await send.mutateAsync(body)
      const payload = res.data as {
        count?: number
        warnings?: string[]
        async?: boolean
        batch_id?: string
        total_students?: number
      }
      if (payload?.async) {
        const total = payload.total_students ?? payload.count
        const countLabel =
          typeof total === 'number' ? total.toLocaleString('en-IN') : outstandingCount?.toLocaleString('en-IN') ?? '—'
        toast.success(res.message || 'Payment links queued', {
          description: `Processing ${countLabel} student${total === 1 ? '' : 's'} in the background. Links will appear shortly.`,
          duration: 8000,
        })
      } else {
        toast.success(res.message || `Sent ${payload?.count ?? 0} link(s)`, {
          description: payload?.warnings?.[0],
          duration: payload?.warnings?.length ? 8000 : 4000,
        })
      }
      onSent()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not send payment links.')
    }
  }

  const installments = availableInstallments
  const showFeePicker = installmentStrategy === 'selected'

  const footer = (
    <>
      <Button variant="outline" className="rounded-xl" onClick={onClose} disabled={send.isPending}>
        Cancel
      </Button>
      <Button
        className="min-w-[220px] gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
        onClick={submit}
        disabled={!canSubmit}
      >
        {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span className="whitespace-normal text-center leading-snug">{submitLabel}</span>
      </Button>
    </>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send payment link"
      description="Choose students, confirm what fees to include, and send links by email or WhatsApp."
      size="2xl"
      footer={footer}
    >
      <div className="space-y-5">
        {/* Settings panel */}
        <div className="space-y-4 rounded-xl border border-border/60 bg-muted/15 p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fee collection
              </Label>
              <SelectField
                value={courseId}
                onChange={(next) => {
                  setCourseId(next)
                  setStudentId('')
                  setSelected([])
                  setPickedInstallments([])
                }}
                options={collectionOptions}
                disabled={coursesLoading}
                truncate={false}
                aria-label="Fee collection"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Limit links to students enrolled in a specific collection, or keep all collections.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Who receives the link
              </Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition-colors',
                      mode === m.id
                        ? 'border-violet-500 bg-violet-50 shadow-sm dark:bg-violet-950/30'
                        : 'border-border/60 bg-background hover:border-violet-200 hover:bg-muted/30',
                    )}
                  >
                    <p className={cn('text-sm font-semibold', mode === m.id ? 'text-violet-800 dark:text-violet-200' : 'text-foreground')}>
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{m.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fees to include
              </Label>
              <SelectField
                value={installmentStrategy}
                onChange={(v) => {
                  setInstallmentStrategy(v as InstallmentStrategy)
                  setPickedInstallments([])
                }}
                options={strategyOptions}
                truncate={false}
                aria-label="Fees to include"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {allStrategyOptions(mode).find((s) => s.value === installmentStrategy)?.hint ??
                  'How fees are calculated on each link.'}
              </p>
              {installmentStrategy === 'specific_month' && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Due in month
                  </Label>
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

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Link expires after
              </Label>
              <SelectField
                value={expiresInDays}
                onChange={setExpiresInDays}
                options={EXPIRY_OPTIONS}
                truncate={false}
                aria-label="Link expiry"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notify via
              </Label>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <NotifyPill label="Email" active={notifyEmail} onClick={() => setNotifyEmail((v) => !v)} />
                <NotifyPill label="WhatsApp" active={notifyWhatsapp} onClick={() => setNotifyWhatsapp((v) => !v)} />
              </div>
            </div>
          </div>

          {showFeePicker && (
            <div className="rounded-xl border border-violet-200/60 bg-violet-50/40 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
              <p className="text-sm font-semibold text-foreground">Choose fees to include</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {mode !== 'single'
                  ? 'Available only when sending to one student.'
                  : !studentId
                    ? 'Select a student below — their unpaid fees will appear here.'
                    : 'Select one or more installments. The amount updates as you pick.'}
              </p>

              {mode === 'single' && studentId && (
                <div className="mt-3">
                  {feeListLoading ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading unpaid fees…
                    </div>
                  ) : installments.length === 0 ? (
                    <p className="py-2 text-sm text-muted-foreground">No unpaid fees for this student.</p>
                  ) : (
                    <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                      {installments.map((inst) => {
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
                                'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                                on
                                  ? 'border-violet-500 bg-violet-100/80 dark:bg-violet-950/40'
                                  : 'border-border/70 bg-background hover:border-violet-200',
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                  on ? 'border-violet-600 bg-violet-600 text-white' : 'border-border',
                                )}
                              >
                                {on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                              </span>
                              <span className="min-w-0 flex-1 leading-snug">
                                {installmentPickerLabel(installments, inst)}
                              </span>
                              <span className="shrink-0 font-semibold tabular-nums text-rose-600">
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
            </div>
          )}
        </div>

        {/* Recipients + preview */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          <div className="min-h-[280px] overflow-hidden rounded-xl border border-border/60">
            <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                {mode === 'bulk' ? 'Bulk send summary' : 'Select students'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {mode === 'bulk'
                  ? `Each student with a balance in ${selectedCollectionLabel} gets their own link.`
                  : 'Search by name or roll number. Amounts shown are outstanding balances.'}
              </p>
            </div>

            {mode === 'bulk' ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/40">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">{bulkCountHeadline}</p>
                  {typeof fullyPaidCount === 'number' && fullyPaidCount > 0 && !outstandingCountLoading ? (
                    <p className="text-sm text-muted-foreground">
                      {fullyPaidCount.toLocaleString('en-IN')} enrolled student{fullyPaidCount === 1 ? '' : 's'}{' '}
                      {fullyPaidCount === 1 ? 'has' : 'have'} no outstanding fees and will be skipped.
                    </p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    Collection: <span className="font-medium text-foreground">{selectedCollectionLabel}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fees:{' '}
                    <span className="font-medium text-foreground">
                      {strategyLabel(installmentStrategy, dueMonth)}
                    </span>
                  </p>
                </div>
                <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Only students with unpaid fees on their enrolled collections receive a link. This may be fewer than
                  total enrolled students on the Students page.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-border/50 p-3">
                  <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or roll number"
                      className="h-10 rounded-xl border-border/60 bg-background pl-9"
                    />
                  </div>
                  {mode === 'multiple' && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setSelected(enrolled.map(toId))}
                      >
                        Select all
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setSelected([])}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <ul className="max-h-[240px] overflow-y-auto">
                  {studentsLoading ? (
                    <li className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading students…
                    </li>
                  ) : enrolled.length === 0 ? (
                    <li className="px-4 py-16 text-center text-sm leading-relaxed text-muted-foreground">
                      No students with an outstanding balance match this collection.
                    </li>
                  ) : (
                    enrolled.map((s) => {
                      const id = toId(s)
                      const active = mode === 'single' ? studentId === id : selected.includes(id)
                      const balance = studentBalance(s)
                      const roll = s.roll_no ? String(s.roll_no) : ''

                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (mode === 'single') {
                                setStudentId(id)
                                setPickedInstallments([])
                              } else {
                                setSelected((prev) =>
                                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                                )
                              }
                            }}
                            className={cn(
                              'flex w-full items-start gap-3 border-b border-border/30 px-4 py-3 text-left transition-colors hover:bg-muted/30',
                              active && 'bg-violet-50/90 dark:bg-violet-950/20',
                            )}
                          >
                            <span
                              className={cn(
                                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                active ? 'border-violet-600 bg-violet-600 text-white' : 'border-border',
                              )}
                            >
                              {active && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold leading-snug text-foreground">
                                {studentName(s)}
                              </span>
                              {roll && (
                                <span className="mt-0.5 block text-xs text-muted-foreground">Roll no. {roll}</span>
                              )}
                            </span>
                            {balance > 0 && (
                              <span className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-rose-600">
                                {formatInr(balance)}
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })
                  )}
                </ul>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-xl border border-violet-200/70 bg-gradient-to-b from-violet-50/90 to-card p-4 md:p-5">
              {mode === 'single' && studentId ? (
                installmentStrategy === 'selected' && pickedInstallments.length === 0 ? (
                  <div className="flex min-h-[160px] flex-col justify-center gap-2 text-sm">
                    <p className="font-semibold text-violet-900">Pick fees above</p>
                    <p className="leading-relaxed text-violet-800/80">
                      Select one or more installments in the list above to preview the link amount.
                    </p>
                  </div>
                ) : previewLoading ? (
                  <div className="flex min-h-[160px] items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                    Calculating fee amount…
                  </div>
                ) : preview?.ok && preview.preview ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-700/80">Amount due</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-violet-950">
                      {formatInr(
                        preview.preview.fee_amount_inr ??
                          preview.preview.institute_base_inr ??
                          preview.preview.gross_inr ??
                          0,
                      )}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-snug text-violet-900">
                      {preview.preview.period_label}
                    </p>
                    {preview.preview.line_items?.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-violet-200/50 pt-3 text-sm text-violet-900">
                        {preview.preview.line_items.map((li, i) => (
                          <li key={i} className="flex items-start justify-between gap-3">
                            <span className="min-w-0 leading-snug">{li.description}</span>
                            <span className="shrink-0 font-semibold tabular-nums">{formatInr(li.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <div className="flex min-h-[160px] items-start gap-2 text-sm leading-relaxed text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{preview?.error ?? 'Choose different fees or another student.'}</span>
                  </div>
                )
              ) : (
                <div className="flex min-h-[160px] flex-col justify-center gap-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4 text-violet-600" />
                    <p className="font-semibold">
                      {mode === 'bulk'
                        ? bulkCountHeadline
                        : recipientCount && recipientCount > 0
                          ? `${recipientCount} recipient${recipientCount === 1 ? '' : 's'} selected`
                          : 'No recipients yet'}
                    </p>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    {mode === 'bulk'
                      ? 'Each student receives a link for their own outstanding fees.'
                      : mode === 'multiple'
                        ? 'Select one or more students from the list to send individual links.'
                        : 'Select a student on the left to preview the exact amount before sending.'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="flex items-center justify-between rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              More options
              <ChevronDown className={cn('h-4 w-4 transition-transform', showMore && 'rotate-180')} />
            </button>

            {showMore && (
              <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                <label className="flex items-start gap-2.5 text-sm leading-snug">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded"
                    checked={allowPartial}
                    onChange={(e) => setAllowPartial(e.target.checked)}
                  />
                  <span>
                    <span className="font-medium text-foreground">Allow partial payment</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Students can pay less than the full amount on the link.
                    </span>
                  </span>
                </label>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Note to student (optional)</Label>
                  <Input
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    maxLength={500}
                    placeholder="e.g. Please pay before the due date"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            {selectedStudent && mode === 'single' && (
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Sending to <span className="font-semibold text-foreground">{studentName(selectedStudent)}</span>
                {selectedStudent.roll_no ? ` · Roll ${String(selectedStudent.roll_no)}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
