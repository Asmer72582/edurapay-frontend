import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarRange, CheckCircle2, Copy, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'
import {
  useAcademicYearRolloverExecute,
  useAcademicYearRolloverOptions,
  useAcademicYearRolloverPreview,
} from '@/hooks/useApi'

type RolloverCollection = {
  id: string
  name: string
  status: string
  has_fee_plan: boolean
  fee_total: number
  installment_count: number
  students_enrolled: number
}

type RolloverPreview = {
  from_academic_year: string
  to_academic_year: string
  month_shift: number
  collections: RolloverCollection[]
  students_to_remap: Array<{ id: string; name: string; academic_year: string }>
  archive_old: boolean
  remap_students: boolean
  summary: {
    collections_to_clone: number
    students_affected: number
    with_fee_plans: number
  }
}

const STEPS = ['Academic year', 'Collections', 'Options', 'Review'] as const

function formatYearLabel(year: string) {
  return year.replace('-', '–')
}

export function AcademicYearRolloverWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean
  onClose: () => void
  onComplete?: () => void
}) {
  const [step, setStep] = useState(0)
  const [fromYear, setFromYear] = useState('')
  const [toYear, setToYear] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [archiveOld, setArchiveOld] = useState(true)
  const [remapStudents, setRemapStudents] = useState(true)
  const [preview, setPreview] = useState<RolloverPreview | null>(null)
  const [availableCollections, setAvailableCollections] = useState<RolloverCollection[]>([])

  const options = useAcademicYearRolloverOptions(open)
  const previewMutation = useAcademicYearRolloverPreview()
  const executeMutation = useAcademicYearRolloverExecute()

  const optionsData = options.data?.data

  useEffect(() => {
    if (!open) return
    setStep(0)
    setPreview(null)
  }, [open])

  useEffect(() => {
    if (!open || !optionsData) return
    if (!fromYear) setFromYear(optionsData.suggested_from ?? '')
    if (!toYear) setToYear(optionsData.suggested_to ?? '')
  }, [open, optionsData, fromYear, toYear])

  const payload = useMemo(
    () => ({
      from_academic_year: fromYear.trim(),
      to_academic_year: toYear.trim(),
      course_ids: selectedIds.length > 0 ? selectedIds : undefined,
      archive_old: archiveOld,
      remap_students: remapStudents,
    }),
    [fromYear, toYear, selectedIds, archiveOld, remapStudents],
  )

  const loadPreview = async () => {
    try {
      const res = await previewMutation.mutateAsync(payload)
      const data = (res.data ?? res) as RolloverPreview
      setPreview(data)
      if (selectedIds.length === 0 && data.collections?.length) {
        setSelectedIds(data.collections.map((c) => c.id))
      }
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not generate rollover preview.')
      return null
    }
  }

  const goNext = async () => {
    if (step === 0) {
      if (!toYear.trim()) {
        toast.error('Enter the target academic year (e.g. 2026-2027).')
        return
      }
      if (fromYear.trim() === toYear.trim()) {
        toast.error('Target year must differ from the source year.')
        return
      }
      setStep(1)
      return
    }

    if (step === 1) {
      if (selectedIds.length === 0) {
        toast.error('Select at least one collection to roll over.')
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      const data = await loadPreview()
      if (data) setStep(3)
      return
    }
  }

  const handleExecute = async () => {
    if (!window.confirm(`Start ${formatYearLabel(toYear)}? This will clone collections, remap students, and archive the previous year.`)) {
      return
    }
    try {
      const res = await executeMutation.mutateAsync({
        ...payload,
        course_ids: selectedIds,
      })
      const stats = res.data as {
        collections_cloned?: number
        students_remapped?: number
        fee_plans_cloned?: number
      } | undefined
      toast.success(
        res.message ??
          `Rollover complete: ${stats?.collections_cloned ?? 0} collection(s), ${stats?.students_remapped ?? 0} student(s) updated.`,
      )
      onComplete?.()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Academic year rollover failed.')
    }
  }

  const toggleCollection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    setPreview(null)
  }

  const busy = previewMutation.isPending || executeMutation.isPending || options.isLoading

  const yearOptions = optionsData?.academic_years ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start new academic year"
      description="Clone fee collections, map students to the new year, and archive the previous one."
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button variant="ghost" className="rounded-lg" onClick={onClose} disabled={executeMutation.isPending}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => setStep((s) => s - 1)}
                disabled={busy}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button className="rounded-lg bg-violet-600 hover:bg-violet-700" onClick={goNext} disabled={busy}>
                {step === 2 && previewMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Preparing…
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="rounded-lg bg-violet-600 hover:bg-violet-700"
                onClick={handleExecute}
                disabled={executeMutation.isPending || !preview}
              >
                {executeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Rolling over…
                  </>
                ) : (
                  <>Start {formatYearLabel(toYear)}</>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
                i === step
                  ? 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-200'
                  : i < step
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border-border/60 text-muted-foreground',
              )}
            >
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="tabular-nums">{i + 1}</span>}
              {label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                From (current year)
              </Label>
              <Input
                list="rollover-from-years"
                className="h-10 rounded-lg"
                value={fromYear}
                onChange={(e) => {
                  setFromYear(e.target.value)
                  setPreview(null)
                }}
                placeholder="2025-2026"
              />
              <datalist id="rollover-from-years">
                {yearOptions.map((y) => (
                  <option key={y} value={y} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">Collections and students tagged with this year will be rolled forward.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                To (new year)
              </Label>
              <Input
                className="h-10 rounded-lg"
                value={toYear}
                onChange={(e) => {
                  setToYear(e.target.value)
                  setPreview(null)
                }}
                placeholder="2026-2027"
              />
              <p className="text-xs text-muted-foreground">
                Fee installment due dates shift forward by{' '}
                {fromYear && toYear ? `${Math.max(0, parseInt(toYear, 10) - parseInt(fromYear, 10)) || 1} year(s)` : 'one year'}.
              </p>
            </div>
            {options.isLoading && (
              <p className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading institute years…
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Active collections for {formatYearLabel(fromYear) || 'the current year'}. Fee structures will be cloned.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    setSelectedIds(availableCollections.map((c) => c.id))
                    setPreview(null)
                  }}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    setSelectedIds([])
                    setPreview(null)
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
            <RolloverCollectionPicker
              fromYear={fromYear}
              selectedIds={selectedIds}
              onToggle={toggleCollection}
              payload={{
                from_academic_year: fromYear.trim(),
                to_academic_year: toYear.trim(),
                archive_old: archiveOld,
                remap_students: remapStudents,
              }}
              onLoaded={(collections) => {
                setAvailableCollections(collections)
                if (selectedIds.length === 0 && collections.length) {
                  setSelectedIds(collections.map((c) => c.id))
                }
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-4 hover:bg-muted/30">
              <input
                type="checkbox"
                className="mt-1"
                checked={archiveOld}
                onChange={(e) => {
                  setArchiveOld(e.target.checked)
                  setPreview(null)
                }}
              />
              <div>
                <p className="font-medium">Archive previous collections</p>
                <p className="text-sm text-muted-foreground">
                  Mark {formatYearLabel(fromYear)} collections as archived and deactivate their fee plans.
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-4 hover:bg-muted/30">
              <input
                type="checkbox"
                className="mt-1"
                checked={remapStudents}
                onChange={(e) => {
                  setRemapStudents(e.target.checked)
                  setPreview(null)
                }}
              />
              <div>
                <p className="font-medium">Map students to new collections</p>
                <p className="text-sm text-muted-foreground">
                  Update enrollments and sync fee installments for the new academic year.
                </p>
              </div>
            </label>
          </div>
        )}

        {step === 3 && preview && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryTile
                icon={Copy}
                label="Collections to clone"
                value={String(preview.summary.collections_to_clone)}
                hint={`${preview.summary.with_fee_plans} with fee plans`}
              />
              <SummaryTile
                icon={Users}
                label="Students affected"
                value={String(preview.summary.students_affected)}
                hint={preview.remap_students ? 'Will be remapped' : 'No remapping'}
              />
              <SummaryTile
                icon={CalendarRange}
                label="Installment shift"
                value={`+${preview.month_shift} mo`}
                hint={`${formatYearLabel(preview.from_academic_year)} → ${formatYearLabel(preview.to_academic_year)}`}
              />
            </div>

            <div className="rounded-xl border border-border/60">
              <div className="border-b border-border/60 bg-muted/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Collections
              </div>
              <ul className="max-h-48 divide-y divide-border/40 overflow-y-auto">
                {preview.collections
                  .filter((c) => selectedIds.includes(c.id))
                  .map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">
                        {c.has_fee_plan ? `${formatInr(c.fee_total)} · ${c.installment_count} inst.` : 'No fee plan'} ·{' '}
                        {c.students_enrolled} students
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {preview.archive_old && (
              <p className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                Previous-year collections will be archived. Paid history is preserved; only active enrollments move forward.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Copy
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function RolloverCollectionPicker({
  fromYear,
  selectedIds,
  onToggle,
  payload,
  onLoaded,
}: {
  fromYear: string
  selectedIds: string[]
  onToggle: (id: string) => void
  payload: Record<string, unknown>
  onLoaded: (collections: RolloverCollection[]) => void
}) {
  const preview = useAcademicYearRolloverPreview()
  const [collections, setCollections] = useState<RolloverCollection[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await preview.mutateAsync(payload)
        if (cancelled) return
        const data = (res.data ?? res) as RolloverPreview
        setCollections(data.collections ?? [])
        onLoaded(data.collections ?? [])
        setLoaded(true)
      } catch {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when step opens
  }, [fromYear])

  if (preview.isPending && !loaded) {
    return (
      <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading collections…
      </p>
    )
  }

  if (collections.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
        No active collections found for {formatYearLabel(fromYear) || 'this year'}.
      </p>
    )
  }

  return (
    <ul className="max-h-72 divide-y divide-border/40 overflow-y-auto rounded-xl border border-border/60">
      {collections.map((c) => {
        const checked = selectedIds.includes(c.id)
        return (
          <li key={c.id}>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/20">
              <input type="checkbox" checked={checked} onChange={() => onToggle(c.id)} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.has_fee_plan
                    ? `${formatInr(c.fee_total)} · ${c.installment_count} installments`
                    : 'No fee plan yet'}{' '}
                  · {c.students_enrolled} enrolled
                </p>
              </div>
              <span className="text-xs capitalize text-muted-foreground">{c.status}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
