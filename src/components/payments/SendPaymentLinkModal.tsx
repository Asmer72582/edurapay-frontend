import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Search,
  Send,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { useCourses, usePaymentLinkPreview, useSendPaymentLinks, useStudents } from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'
import type { InstallmentStrategy } from '@/types/payment-link'
import { cn } from '@/lib/utils'

type Mode = 'single' | 'multiple' | 'bulk'

const MODES: { id: Mode; label: string }[] = [
  { id: 'single', label: 'One' },
  { id: 'multiple', label: 'Several' },
  { id: 'bulk', label: 'All due' },
]

const STRATEGIES: { value: InstallmentStrategy; label: string }[] = [
  { value: 'auto', label: 'Next due' },
  { value: 'current_month', label: 'This month' },
  { value: 'overdue_only', label: 'Overdue' },
  { value: 'all_outstanding', label: 'All outstanding' },
  { value: 'selected', label: 'Pick fees' },
]

const EXPIRY_OPTIONS = [
  { value: '7', label: '7d' },
  { value: '14', label: '14d' },
  { value: '30', label: '30d' },
  { value: '60', label: '60d' },
]

function toId(s: Record<string, unknown>) {
  return String(s.id ?? s._id ?? '')
}

function toCourseId(c: Record<string, unknown>) {
  return String(c.id ?? c._id ?? '')
}

function studentName(s: Record<string, unknown>) {
  return `${String(s.first_name ?? '')} ${String(s.last_name ?? '')}`.trim() || 'Student'
}

function studentMeta(s: Record<string, unknown>) {
  const parts: string[] = []
  if (s.roll_no) parts.push(String(s.roll_no))
  return parts.join(' · ')
}

function collectionLabel(c: Record<string, unknown>) {
  return String(c.grade ?? c.name ?? 'Collection')
}

function studentBalance(s: Record<string, unknown>) {
  const summary = s.fee_summary as { fees_total?: number; fees_paid?: number } | undefined
  if (summary) return Math.max(0, Number(summary.fees_total ?? 0) - Number(summary.fees_paid ?? 0))
  return Number(s.balance_due ?? s.outstanding ?? 0)
}

function Pill({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
        active ? 'bg-violet-600 text-white shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted',
        className,
      )}
    >
      {children}
    </button>
  )
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
        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
        active
          ? 'border-violet-500 bg-violet-100 text-violet-800'
          : 'border-border/70 bg-background text-muted-foreground hover:border-violet-200',
      )}
    >
      {active && <Check className="mr-1 inline h-3 w-3" />}
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
  const [pickedInstallments, setPickedInstallments] = useState<string[]>([])
  const [expiresInDays, setExpiresInDays] = useState('30')
  const [customNote, setCustomNote] = useState('')
  const [allowPartial, setAllowPartial] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySms, setNotifySms] = useState(true)
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const { data: coursesData, isLoading: coursesLoading } = useCourses(open ? '' : '', 1, 100)
  const { data: studentsData, isLoading: studentsLoading } = useStudents(open ? search : '', 1, 150)
  const send = useSendPaymentLinks()

  const previewEnabled = open && mode === 'single' && studentId !== ''
  const { data: previewData, isFetching: previewLoading } = usePaymentLinkPreview(
    studentId,
    {
      course_id: courseId || undefined,
      installment_strategy: installmentStrategy,
      installment_ids:
        installmentStrategy === 'selected' && pickedInstallments.length > 0 ? pickedInstallments : undefined,
    },
    previewEnabled,
  )
  const preview = previewData?.data

  const collections = useMemo(() => {
    const rows = (coursesData?.data?.data ?? []) as Record<string, unknown>[]
    return rows.filter((c) => (c.status ?? 'active') !== 'archived')
  }, [coursesData])

  useEffect(() => {
    if (!open) return
    setMode(presetStudentId ? 'single' : 'single')
    setSearch('')
    setCourseId(presetCourseId ?? '')
    setStudentId(presetStudentId ?? '')
    setSelected(presetStudentId ? [presetStudentId] : [])
    setInstallmentStrategy('auto')
    setPickedInstallments([])
    setExpiresInDays('30')
    setCustomNote('')
    setAllowPartial(true)
    setNotifyEmail(true)
    setNotifySms(true)
    setNotifyWhatsapp(false)
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
  const recipientCount = mode === 'single' ? (studentId ? 1 : 0) : mode === 'multiple' ? selected.length : enrolled.length

  const submitLabel = useMemo(() => {
    if (send.isPending) return 'Sending…'
    if (mode === 'bulk') return `Send to all due (${enrolled.length})`
    if (mode === 'multiple') return selected.length ? `Send ${selected.length} link${selected.length === 1 ? '' : 's'}` : 'Send links'
    return 'Send link'
  }, [mode, selected.length, send.isPending, enrolled.length])

  const singleBlocked =
    mode === 'single' &&
    !!studentId &&
    !previewLoading &&
    (preview?.ok === false ||
      (installmentStrategy === 'selected' && pickedInstallments.length === 0))

  const canSubmit =
    !send.isPending &&
    !singleBlocked &&
    (mode === 'bulk' ? enrolled.length > 0 : mode === 'single' ? !!studentId : selected.length > 0)

  const submit = async () => {
    try {
      const body: Record<string, unknown> = {
        mode: mode === 'bulk' ? 'bulk' : mode,
        installment_strategy: installmentStrategy,
        expires_in_days: Number(expiresInDays),
        custom_note: customNote.trim() || undefined,
        allow_partial: allowPartial,
        notify_email: notifyEmail,
        notify_sms: notifySms,
        notify_whatsapp: notifyWhatsapp,
      }
      if (courseId) body.course_id = courseId
      if (installmentStrategy === 'selected' && pickedInstallments.length > 0) {
        body.installment_ids = pickedInstallments
      }
      if (mode === 'single') body.student_id = studentId
      if (mode === 'multiple') body.student_ids = selected

      const res = await send.mutateAsync(body)
      const payload = res.data as { count?: number; warnings?: string[] }
      toast.success(res.message || `Sent ${payload?.count ?? 0} link(s)`, {
        description: payload?.warnings?.[0],
        duration: payload?.warnings?.length ? 8000 : 4000,
      })
      onSent()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not send payment links.')
    }
  }

  const installments = preview?.installments ?? []
  const showFeePicker = mode === 'single' && installmentStrategy === 'selected'

  const footer = (
    <>
      <Button variant="outline" className="rounded-xl" onClick={onClose} disabled={send.isPending}>
        Cancel
      </Button>
      <Button
        className="min-w-[200px] gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
        onClick={submit}
        disabled={!canSubmit}
      >
        {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitLabel}
      </Button>
    </>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send payment link"
      description="Choose who to bill, confirm amount, and send — one screen."
      size="xl"
      footer={footer}
    >
      {/* Top controls — everything primary in one strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
        <div className="w-full min-w-[140px] flex-1 sm:max-w-[200px]">
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
            aria-label="Collection"
          />
        </div>

        <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
          {MODES.map((m) => (
            <Pill key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
              {m.label}
            </Pill>
          ))}
        </div>

        <div className="w-[130px]">
          <SelectField
            value={installmentStrategy}
            onChange={(v) => {
              setInstallmentStrategy(v as InstallmentStrategy)
              setPickedInstallments([])
            }}
            options={STRATEGIES.map((s) => ({ value: s.value, label: s.label }))}
            aria-label="Fees to include"
          />
        </div>

        <div className="w-[72px]">
          <SelectField
            value={expiresInDays}
            onChange={setExpiresInDays}
            options={EXPIRY_OPTIONS}
            aria-label="Expires"
          />
        </div>

        <div className="ml-auto flex flex-wrap gap-1.5">
          <NotifyPill label="Email" active={notifyEmail} onClick={() => setNotifyEmail((v) => !v)} />
          <NotifyPill label="SMS" active={notifySms} onClick={() => setNotifySms((v) => !v)} />
          <NotifyPill label="WhatsApp" active={notifyWhatsapp} onClick={() => setNotifyWhatsapp((v) => !v)} />
        </div>
      </div>

      {/* Main: students left, summary right — no page scroll for core flow */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Left — recipients */}
        <div className="min-h-[220px] rounded-xl border border-border/60">
          {mode === 'bulk' ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 p-6 text-center">
              <Sparkles className="h-8 w-8 text-violet-500" />
              <p className="text-sm font-medium">
                {enrolled.length} student{enrolled.length === 1 ? '' : 's'} with balance
                {courseId ? ' in this collection' : ''}
              </p>
              <p className="text-xs text-muted-foreground">One link each · {STRATEGIES.find((s) => s.value === installmentStrategy)?.label} fees</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-border/50 p-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or roll no…"
                    className="h-9 rounded-lg border-0 bg-muted/40 pl-8 text-sm shadow-none focus-visible:ring-1"
                  />
                </div>
                {mode === 'multiple' && (
                  <>
                    <button
                      type="button"
                      className="shrink-0 text-xs font-medium text-violet-600 hover:underline"
                      onClick={() => setSelected(enrolled.map(toId))}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-muted-foreground hover:underline"
                      onClick={() => setSelected([])}
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
              <ul className="max-h-[180px] overflow-y-auto">
                {studentsLoading ? (
                  <li className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </li>
                ) : enrolled.length === 0 ? (
                  <li className="py-12 text-center text-sm text-muted-foreground">No students found</li>
                ) : (
                  enrolled.map((s) => {
                    const id = toId(s)
                    const active = mode === 'single' ? studentId === id : selected.includes(id)
                    const balance = studentBalance(s)
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
                            'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/30',
                            active && 'bg-violet-50',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                              active ? 'border-violet-600 bg-violet-600 text-white' : 'border-border',
                            )}
                          >
                            {active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">{studentName(s)}</span>
                          {studentMeta(s) && (
                            <span className="hidden truncate text-xs text-muted-foreground sm:inline">{studentMeta(s)}</span>
                          )}
                          {balance > 0 && (
                            <span className="shrink-0 text-xs font-semibold text-rose-600">{formatInr(balance)}</span>
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

        {/* Right — amount & confirm */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-xl border border-violet-200/70 bg-gradient-to-b from-violet-50/90 to-card p-4">
            {mode === 'single' && studentId ? (
              previewLoading ? (
                <div className="flex h-full min-h-[120px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                  Calculating…
                </div>
              ) : preview?.ok && preview.preview ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-violet-700/80">Fee amount</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-violet-950">
                    {formatInr(
                      preview.preview.fee_amount_inr ??
                        preview.preview.institute_base_inr ??
                        preview.preview.gross_inr ??
                        0,
                    )}
                  </p>
                  <p className="mt-1 text-sm font-medium text-violet-900">{preview.preview.period_label}</p>
                  {preview.preview.line_items?.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-violet-200/50 pt-2 text-xs text-violet-900">
                      {preview.preview.line_items.map((li, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span className="truncate">{li.description}</span>
                          <span className="shrink-0 font-medium tabular-nums">{formatInr(li.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="flex min-h-[120px] items-start gap-2 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{preview?.error ?? 'Select fees or another student.'}</span>
                </div>
              )
            ) : (
              <div className="flex min-h-[120px] flex-col justify-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {recipientCount > 0
                    ? `${recipientCount} recipient${recipientCount === 1 ? '' : 's'}`
                    : 'Select recipients'}
                </p>
                <p className="mt-1 text-xs">
                  {mode === 'bulk'
                    ? 'Amount is calculated per student when sent.'
                    : 'Pick a student to preview the exact amount.'}
                </p>
              </div>
            )}
          </div>

          {showFeePicker && installments.length > 0 && (
            <div className="rounded-xl border border-border/60 p-2">
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tap fees to include
              </p>
              <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                {installments.map((inst) => {
                  const on = pickedInstallments.includes(inst.id)
                  return (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() =>
                        setPickedInstallments((prev) =>
                          prev.includes(inst.id) ? prev.filter((x) => x !== inst.id) : [...prev, inst.id],
                        )
                      }
                      className={cn(
                        'rounded-lg border px-2 py-1 text-left text-[11px] transition-colors',
                        on
                          ? 'border-violet-500 bg-violet-100 text-violet-900'
                          : 'border-border/70 hover:border-violet-200',
                      )}
                    >
                      <span className="font-semibold">{inst.label}</span>
                      <span className="ml-1 tabular-nums">{formatInr(inst.balance_inr)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center justify-between rounded-lg px-1 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            More options
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showMore && 'rotate-180')} />
          </button>

          {showMore && (
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={allowPartial}
                  onChange={(e) => setAllowPartial(e.target.checked)}
                />
                Allow partial payment
              </label>
              <Input
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                maxLength={500}
                placeholder="Note to student (optional)"
                className="h-9 rounded-lg text-sm"
              />
            </div>
          )}

          {selectedStudent && mode === 'single' && (
            <p className="truncate text-center text-xs text-muted-foreground">
              → {studentName(selectedStudent)}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
