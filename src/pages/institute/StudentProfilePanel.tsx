import { useEffect, useMemo, useState } from 'react'
import { History, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Skeleton } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentPaymentHistory } from '@/components/students/StudentPaymentHistory'
import {
  BatchPicker,
  ClassCollectionPicker,
  mapStudentToRow,
  type CourseOption,
} from '@/components/dashboard/StudentDataTable'
import { useStudentProfile } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

type Tab = 'student' | 'payment_history'

function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function normalizeCourseIds(raw?: { course_ids?: string[]; course_id?: string | null }) {
  const ids = [...(raw?.course_ids ?? [])]
  if (raw?.course_id && !ids.includes(raw.course_id)) {
    ids.push(raw.course_id)
  }
  return ids
}

export function StudentProfilePanel({
  studentId,
  courses = [],
  coursesById,
  initialTab = 'payment_history',
  updatingStudentId,
  onSetPrimaryClass,
  onBatchChange,
  onClose,
  onEdit,
}: {
  studentId: string | null
  courses?: CourseOption[]
  coursesById?: Map<string, CourseOption>
  initialTab?: Tab
  updatingStudentId?: string | null
  onSetPrimaryClass?: (courseId: string) => void
  onBatchChange?: (courseId: string, enrolled: boolean) => void
  onClose: () => void
  onEdit: (student: any) => void
}) {
  const [tab, setTab] = useState<Tab>(initialTab)
  useEffect(() => {
    if (studentId) setTab(initialTab)
  }, [studentId, initialTab])

  const profile = useStudentProfile(studentId ?? undefined)
  const payload = (profile.data?.data ?? profile.data ?? {}) as {
    student?: Record<string, unknown>
    summary?: { net_payable?: number; paid_amount?: number; unpaid_amount?: number }
    installments?: Array<Record<string, unknown>>
  }
  const student = payload.student
  const summary = payload.summary ?? { net_payable: 0, paid_amount: 0, unpaid_amount: 0 }
  const installments = (payload.installments ?? []) as Array<Record<string, unknown>>

  const enrolledBatchLabel = useMemo(() => {
    const ids = normalizeCourseIds(student as { course_ids?: string[]; course_id?: string | null })
    const names = ids.map((id) => coursesById?.get(id)?.name).filter((n): n is string => Boolean(n))
    return names.length > 0 ? names.join(', ') : 'Not assigned'
  }, [student, coursesById])

  const studentRow = useMemo(() => {
    if (!student) return null
    return mapStudentToRow(
      student as Parameters<typeof mapStudentToRow>[0],
      0,
      coursesById,
    )
  }, [student, coursesById])

  const tabs = useMemo(
    () => [
      { id: 'student' as const, label: 'Student Info', icon: Info },
      { id: 'payment_history' as const, label: 'Payment history', icon: History },
    ],
    [],
  )

  if (!studentId) {
    return (
      <div className="sticky top-20">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Select a student</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Click any student row to view profile and payment history.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="sticky top-16 max-h-[calc(100dvh-5rem)] space-y-3 overflow-y-auto overscroll-contain pb-4">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold">
                {profile.isLoading ? 'Loading…' : `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim()}
              </div>
              <div className="text-sm text-muted-foreground">
                {student?.grade ?? 'Grade —'} {student?.academic_year ? `· ${student.academic_year}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onEdit(student)} disabled={!student}>
                Edit
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose} aria-label="Close panel">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                  tab === t.id ? 'bg-violet-100 text-violet-700' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {studentRow && (onSetPrimaryClass || onBatchChange) && (
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold">Fee collections</p>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Class</p>
              {onSetPrimaryClass ? (
                <ClassCollectionPicker
                  student={studentRow}
                  courses={courses}
                  variant="panel"
                  isUpdating={updatingStudentId === studentRow.id}
                  onSelect={onSetPrimaryClass}
                />
              ) : (
                <p className="text-sm">{studentRow.grade ?? enrolledBatchLabel}</p>
              )}
            </div>
            {onBatchChange && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Other fees</p>
                <BatchPicker
                  student={studentRow}
                  courses={courses}
                  variant="panel"
                  isUpdating={updatingStudentId === studentRow.id}
                  excludeCourseId={studentRow.courseId ?? studentRow.courseIds[0]}
                  onToggle={onBatchChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        {profile.isLoading ? (
          <Skeleton className="h-12 rounded-xl" />
        ) : (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardContent className="grid grid-cols-3 divide-x divide-border/60 p-0">
              <div className="px-3 py-2.5 text-center">
                <div className="text-[11px] text-muted-foreground">Net payable</div>
                <div className="mt-0.5 text-sm font-semibold">{formatInr(Number(summary.net_payable ?? 0))}</div>
              </div>
              <div className="px-3 py-2.5 text-center">
                <div className="text-[11px] text-muted-foreground">Paid</div>
                <div className="mt-0.5 text-sm font-semibold text-emerald-600">{formatInr(Number(summary.paid_amount ?? 0))}</div>
              </div>
              <div className="px-3 py-2.5 text-center">
                <div className="text-[11px] text-muted-foreground">Unpaid</div>
                <div className="mt-0.5 text-sm font-semibold text-rose-600">{formatInr(Number(summary.unpaid_amount ?? 0))}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {tab === 'student' && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Student Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</div>
              <div className="mt-1 font-semibold">{`${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim() || '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3 sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee collections</div>
              <div className="mt-1 font-semibold">{enrolledBatchLabel}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roll no</div>
              <div className="mt-1 font-semibold">{student?.roll_no ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic year</div>
              <div className="mt-1 font-semibold">{student?.academic_year ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admission year</div>
              <div className="mt-1 font-semibold">{student?.admission_year ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date of birth</div>
              <div className="mt-1 font-semibold">{student?.dob ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary phone</div>
              <div className="mt-1 font-semibold">{student?.primary_phone ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secondary phone</div>
              <div className="mt-1 font-semibold">{student?.secondary_phone ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary email</div>
              <div className="mt-1 font-semibold">{student?.primary_email ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secondary email</div>
              <div className="mt-1 font-semibold">{student?.secondary_email ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3 sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="mt-1">
                <Badge className="rounded-lg capitalize">{student?.status ?? '—'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'payment_history' && (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="p-4">
            <StudentPaymentHistory
              installments={installments}
              isLoading={profile.isLoading}
              coursesById={coursesById}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

