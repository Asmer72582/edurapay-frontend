import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useFeePlans, useUpsertFeePlan } from '@/hooks/useApi'
import {
  academicYearFromRange,
  buildInstallments,
  CATEGORY_PRESETS,
  defaultAcademicYearRange,
  distributeMonths,
  dueDateForMonth,
  FEE_STEPS,
  formatInr,
  INSTALLMENT_PRESETS,
  MONTH_NAMES,
  monthKey,
  monthsBetween,
  parseMonthKey,
  SEGMENT_COLORS,
  type AcademicMonth,
  type FeeCategory,
  type FeePlanPayload,
  type FeeStep,
  type Installment,
} from '@/components/courses/course-fee-shared'

export type CourseFeeBuilderRef = {
  validate: () => boolean
  getPayload: (courseId: string, grade: string) => FeePlanPayload | null
  hasFeeConfigured: () => boolean
  save: (courseId: string, grade: string) => Promise<boolean>
}

type CourseFeeBuilderProps = {
  courseId?: string
  courseGrade: string
  showSaveButton?: boolean
  onSaved?: () => void
  /** Tighter layout for modals — lighter step panels */
  compact?: boolean
}

function toId(v: unknown) {
  return String((v as { id?: string; _id?: string })?.id ?? (v as { _id?: string })?._id ?? '')
}

export const CourseFeeBuilder = forwardRef<CourseFeeBuilderRef, CourseFeeBuilderProps>(function CourseFeeBuilder(
  { courseId = '', courseGrade, showSaveButton = true, onSaved, compact = false },
  ref,
) {
  const [step, setStep] = useState<FeeStep>(1)
  const [yearRange, setYearRange] = useState<{ start: AcademicMonth; end: AcademicMonth }>(() => defaultAcademicYearRange())
  const academicYear = academicYearFromRange(yearRange.start, yearRange.end)
  const [planName, setPlanName] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [useCategories, setUseCategories] = useState(false)
  const [categories, setCategories] = useState<FeeCategory[]>([])
  const [installmentCount, setInstallmentCount] = useState(4)
  const [installments, setInstallments] = useState<Installment[]>([])
  const [customizeInstallments, setCustomizeInstallments] = useState(false)
  const [loadedPlanId, setLoadedPlanId] = useState<string | null>(null)
  const skipCountSync = useRef(false)

  const feePlans = useFeePlans(courseId ? { course_id: courseId, per_page: 20 } : undefined)
  const upsert = useUpsertFeePlan()

  useEffect(() => {
    setPlanName(courseGrade.trim() ? `${courseGrade.trim()} Fee Plan` : '')
    setLoadedPlanId(null)
    setStep(1)
    setUseCategories(false)
    setCategories([])
    setCustomizeInstallments(false)
    setYearRange(defaultAcademicYearRange())
    if (!courseId) {
      setTotalAmount(0)
      setInstallments([])
    }
  }, [courseGrade, courseId])

  const loadPlan = (p: Record<string, unknown>) => {
    skipCountSync.current = true
    setLoadedPlanId(toId(p))
    setPlanName(String(p.name))
    const inst = (p.installments ?? []) as Installment[]
    if (inst.length > 0) {
      const sortedDates = inst
        .map((x) => (x.due_date ? new Date(x.due_date) : null))
        .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime())
      if (sortedDates.length > 0) {
        const first = sortedDates[0]
        const last = sortedDates[sortedDates.length - 1]
        setYearRange({
          start: { year: first.getFullYear(), month: first.getMonth() },
          end: { year: last.getFullYear(), month: last.getMonth() },
        })
      }
    } else {
      setYearRange(defaultAcademicYearRange())
    }
    setTotalAmount(Number(p.total_amount ?? 0))
    const cats = (p.categories ?? []) as FeeCategory[]
    setUseCategories(cats.length > 0)
    setCategories(cats.map((c) => ({ name: c.name, amount: Number(c.amount ?? 0) })))
    setInstallmentCount(Math.max(1, inst.length || 4))
    setInstallments(
      inst.length > 0
        ? inst.map((x, i) => ({
            label: x.label ?? `Installment ${i + 1}`,
            due_date: x.due_date,
            amount: Number(x.amount ?? 0),
          }))
        : buildInstallments(Number(p.total_amount ?? 0), 4, yearRange),
    )
    setCustomizeInstallments(true)
    setStep(3)
  }

  useEffect(() => {
    if (!courseId) return
    const plans = (feePlans.data?.data?.data ?? []) as Record<string, unknown>[]
    if (plans.length === 0 || loadedPlanId) return
    loadPlan(plans[0])
  }, [feePlans.data, courseId, loadedPlanId])

  useEffect(() => {
    if (skipCountSync.current) {
      skipCountSync.current = false
      return
    }
    if (!customizeInstallments && totalAmount > 0) {
      setInstallments(buildInstallments(totalAmount, installmentCount, yearRange))
    } else if (customizeInstallments) {
      const months = distributeMonths(yearRange.start, yearRange.end, installmentCount)
      setInstallments((prev) => {
        const amounts = buildInstallments(totalAmount, installmentCount, yearRange).map((x) => x.amount)
        return Array.from({ length: installmentCount }).map((_, i) => {
          const m = months[i] ?? months[months.length - 1]
          const monthLabel = m ? `${MONTH_NAMES[m.month]} ${m.year}` : `Installment ${i + 1}`
          return {
            label: prev[i]?.label ?? monthLabel,
            due_date: prev[i]?.due_date ?? (m ? dueDateForMonth(m) : new Date().toISOString().slice(0, 10)),
            amount: prev[i]?.amount ?? amounts[i] ?? 0,
          }
        })
      })
    }
  }, [installmentCount, yearRange])

  const categorySum = useMemo(() => categories.reduce((s, c) => s + (Number(c.amount) || 0), 0), [categories])
  const installmentSum = useMemo(() => installments.reduce((s, x) => s + (Number(x.amount) || 0), 0), [installments])
  const installmentsBalanced = totalAmount > 0 && installmentSum === totalAmount

  useEffect(() => {
    if (step >= 2 && categories.length > 0) {
      const sum = categories.reduce((s, c) => s + (Number(c.amount) || 0), 0)
      setTotalAmount(sum)
      if (step === 3 && !customizeInstallments && sum > 0) {
        setInstallments(buildInstallments(sum, installmentCount, yearRange))
      }
    }
  }, [categories, step, customizeInstallments, installmentCount])

  const setCategoryAmount = (idx: number, amount: number) => {
    setUseCategories(true)
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, amount } : c)))
  }

  const removeCategory = (idx: number) => {
    setCategories((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length === 0) setUseCategories(false)
      return next
    })
  }

  const generateInstallments = () => {
    setInstallments(buildInstallments(totalAmount, installmentCount, yearRange))
    setCustomizeInstallments(false)
  }

  const goToStep2 = () => {
    if (!totalAmount || totalAmount <= 0) {
      toast.error('Enter the overall fee amount first.')
      return false
    }
    if (!planName.trim()) {
      toast.error('Enter a plan name.')
      return false
    }
    setStep(2)
    return true
  }

  const skipCategories = () => {
    setUseCategories(false)
    setCategories([])
    generateInstallments()
    setStep(3)
  }

  const goToStep3 = () => {
    if (useCategories && categories.length > 0 && categorySum <= 0) {
      toast.error('Add amounts to your categories first.')
      return false
    }
    generateInstallments()
    setStep(3)
    return true
  }

  const addCategory = (name = '') => {
    setUseCategories(true)
    const remaining = Math.max(0, totalAmount - categorySum)
    setCategories((prev) => [...prev, { name: name || `Category ${prev.length + 1}`, amount: remaining }])
  }

  const resolvedInstallments = (): Installment[] => {
    if (installments.length > 0) return installments
    if (totalAmount > 0) return buildInstallments(totalAmount, installmentCount, yearRange)
    return []
  }

  const resolvedInstallmentSum = () => resolvedInstallments().reduce((s, x) => s + (Number(x.amount) || 0), 0)

  const getPayload = (id: string, grade: string): FeePlanPayload | null => {
    const inst = resolvedInstallments()
    const sum = inst.reduce((s, x) => s + (Number(x.amount) || 0), 0)
    if (!grade.trim() || totalAmount <= 0 || sum !== totalAmount) return null
    return {
      course_id: id,
      name: planName.trim() || `${grade} Fee Plan`,
      grade: grade.trim(),
      academic_year: academicYear,
      currency: 'INR',
      total_amount: totalAmount,
      categories: useCategories && categories.length > 0 ? categories : [],
      installments: inst,
      status: 'active',
    }
  }

  const validate = () => {
    if (!courseGrade.trim()) {
      toast.error('Enter the collection name first.')
      return false
    }
    if (totalAmount <= 0) {
      toast.error('Enter the overall fee amount.')
      setStep(1)
      return false
    }
    if (!planName.trim()) {
      toast.error('Enter a plan name.')
      setStep(1)
      return false
    }
    const inst = resolvedInstallments()
    if (resolvedInstallmentSum() !== totalAmount) {
      toast.error('Installments must match the overall fee.')
      setStep(3)
      if (!installments.length) setInstallments(inst)
      return false
    }
    if (!installments.length) setInstallments(inst)
    return true
  }

  const save = async (id: string, grade: string) => {
    if (!validate()) return false
    const payload = getPayload(id, grade)
    if (!payload) return false
    try {
      await upsert.mutateAsync(payload)
      onSaved?.()
      return true
    } catch {
      toast.error('Failed to save fee structure.')
      return false
    }
  }

  useImperativeHandle(ref, () => ({
    validate,
    getPayload,
    hasFeeConfigured: () => totalAmount > 0,
    save,
  }))

  const saveFeePlan = async () => {
    if (!courseId) {
      toast.error('Save the collection first.')
      return
    }
    const ok = await save(courseId, courseGrade)
    if (ok) toast.success('Fee structure saved.')
  }

  const stepIcons = [IndianRupee, Layers, Calendar]

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      {!compact && (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          Set the total amount, fee line items (college fee, exam, ID card, books, etc.), and when installments are due.
        </div>
      )}

      <div
        className={cn(
          'flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1.5',
          compact && 'p-1',
        )}
      >
        {FEE_STEPS.map((s, i) => {
          const Icon = stepIcons[i]
          return (
            <div key={s.id} className="flex flex-1 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (s.id === 1) setStep(1)
                  else if (s.id === 2 && totalAmount > 0) setStep(2)
                  else if (s.id === 3 && totalAmount > 0) {
                    if (!installments.length) generateInstallments()
                    setStep(3)
                  }
                }}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-center transition-all',
                  step === s.id
                    ? 'bg-white font-bold text-violet-700 shadow-sm ring-1 ring-violet-200 dark:bg-card'
                    : step > s.id
                      ? 'font-medium text-emerald-700'
                      : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className={cn('leading-tight', compact ? 'text-[10px] font-semibold' : 'text-xs font-bold')}>
                  {s.label}
                </span>
              </button>
              {i < FEE_STEPS.length - 1 && (
                <div className={cn('h-0.5 w-3 shrink-0 rounded-full', step > s.id ? 'bg-emerald-400' : 'bg-border')} />
              )}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardContent className={cn('space-y-5', compact ? 'p-4' : 'p-5')}>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Overall annual fee
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  inputMode="numeric"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(Number(e.target.value || 0))}
                  placeholder="127000"
                  className="h-12 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-2xl font-bold tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan name</Label>
              <Input
                className="h-10 rounded-lg"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. Class 10 — 2026 Fee Plan"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Academic year
                </Label>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {monthsBetween(yearRange.start, yearRange.end).length} months · {academicYear}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="month"
                  aria-label="From month"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  value={monthKey(yearRange.start)}
                  onChange={(e) => {
                    const next = parseMonthKey(e.target.value)
                    if (!next) return
                    setYearRange((prev) => {
                      const endIdx = prev.end.year * 12 + prev.end.month
                      const startIdx = next.year * 12 + next.month
                      return { start: next, end: startIdx > endIdx ? next : prev.end }
                    })
                  }}
                />
                <input
                  type="month"
                  aria-label="To month"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  value={monthKey(yearRange.end)}
                  min={monthKey(yearRange.start)}
                  onChange={(e) => {
                    const next = parseMonthKey(e.target.value)
                    if (!next) return
                    setYearRange((prev) => {
                      const startIdx = prev.start.year * 12 + prev.start.month
                      const endIdx = next.year * 12 + next.month
                      return { start: prev.start, end: endIdx < startIdx ? prev.start : next }
                    })
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Installments are distributed evenly across these months.
              </p>
            </div>

            <Button
              type="button"
              className="w-full rounded-lg bg-violet-600 font-semibold text-white hover:bg-violet-700"
              onClick={goToStep2}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">Step 2 · Fee line items</div>
                  <div className="text-xs text-muted-foreground">
                    {categories.length > 0
                      ? `Total updates to ${formatInr(categorySum)} as you add items`
                      : 'Add college fee, exam fee, ID card, books, transport — or any lines you collect'}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORY_PRESETS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => addCategory(name)}
                    className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  >
                    + {name}
                  </button>
                ))}
              </div>

              {categories.length > 0 && (
                <div className="rounded-xl bg-violet-50 px-3 py-2 text-sm dark:bg-violet-950/30">
                  <div className="text-xs text-muted-foreground">Overall annual fee</div>
                  <div className="text-lg font-bold text-violet-700 dark:text-violet-300">{formatInr(categorySum)}</div>
                </div>
              )}

              {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  No line items yet. Use quick-add chips above or add a custom fee line, or skip to installments.
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-xl border border-border/60 p-2">
                      <Input
                        className="h-9 flex-1 rounded-lg"
                        value={cat.name}
                        placeholder="Fee name (e.g. Exam Fee)"
                        onChange={(e) =>
                          setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, name: e.target.value } : c)))
                        }
                      />
                      <div className="relative w-28">
                        <IndianRupee className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="h-9 rounded-lg pl-7"
                          inputMode="numeric"
                          value={cat.amount ? String(cat.amount) : ''}
                          onChange={(e) => setCategoryAmount(idx, Number(e.target.value || 0))}
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-lg" onClick={() => removeCategory(idx)}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button type="button" variant="outline" size="sm" className="w-full rounded-xl" onClick={() => addCategory()}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add fee line
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={skipCategories}>
              Skip line items
            </Button>
            <Button type="button" className="rounded-xl bg-violet-600" onClick={goToStep3}>
              Generate installments
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">Step 3 · Installments</div>
                  <div className="text-xs text-muted-foreground">Auto-generated · customize if needed</div>
                </div>
                <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              </div>

              <div className="rounded-xl bg-muted/30 p-3 text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Overall fee</span>
                  <span>{formatInr(totalAmount)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {INSTALLMENT_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setInstallmentCount(n)
                      setInstallments(buildInstallments(totalAmount, n, yearRange))
                      setCustomizeInstallments(false)
                    }}
                    className={cn(
                      'h-8 min-w-[2rem] rounded-lg px-2.5 text-xs font-semibold',
                      installmentCount === n ? 'bg-violet-600 text-white' : 'bg-muted/50 text-muted-foreground',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                <div>
                  <div className="text-xs text-muted-foreground">Installment total</div>
                  <div className={cn('font-bold', installmentsBalanced ? 'text-emerald-600' : 'text-amber-600')}>
                    {formatInr(installmentSum)} / {formatInr(totalAmount)}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setInstallments(buildInstallments(totalAmount, installmentCount, yearRange))
                    setCustomizeInstallments(false)
                  }}
                >
                  Regenerate
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full rounded-xl"
                onClick={() => setCustomizeInstallments((v) => !v)}
              >
                {customizeInstallments ? <ChevronUp className="mr-1.5 h-4 w-4" /> : <ChevronDown className="mr-1.5 h-4 w-4" />}
                {customizeInstallments ? 'Hide customization' : 'Customize installments'}
              </Button>
            </CardContent>
          </Card>

          <div className="max-h-48 space-y-2 overflow-y-auto">
            {installments.map((it, idx) => (
              <div key={idx} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white', SEGMENT_COLORS[idx % SEGMENT_COLORS.length])}>
                      {idx + 1}
                    </span>
                    {customizeInstallments ? (
                      <Input
                        className="h-7 w-28 border-0 p-0 text-sm font-semibold shadow-none"
                        value={it.label}
                        onChange={(e) =>
                          setInstallments((prev) => prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                        }
                      />
                    ) : (
                      <span className="text-sm font-semibold">{it.label}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold">{formatInr(it.amount)}</span>
                </div>
                {customizeInstallments ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <IndianRupee className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-9 rounded-lg pl-7"
                        inputMode="numeric"
                        value={it.amount ? String(it.amount) : ''}
                        onChange={(e) =>
                          setInstallments((prev) => prev.map((x, i) => (i === idx ? { ...x, amount: Number(e.target.value || 0) } : x)))
                        }
                      />
                    </div>
                    <Input
                      className="h-9 rounded-lg"
                      type="date"
                      value={it.due_date}
                      onChange={(e) =>
                        setInstallments((prev) => prev.map((x, i) => (i === idx ? { ...x, due_date: e.target.value } : x)))
                      }
                    />
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Due {new Date(it.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {showSaveButton && courseId && (
            <Button
              type="button"
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-5 shadow-md"
              disabled={upsert.isPending || !installmentsBalanced}
              onClick={saveFeePlan}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {upsert.isPending ? 'Saving…' : 'Save fee structure'}
            </Button>
          )}
        </div>
      )}

    </div>
  )
})
