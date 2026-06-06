import { useEffect, useMemo, useState } from 'react'
import { Award, History, Info } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge, Skeleton } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentPaymentHistory } from '@/components/students/StudentPaymentHistory'
import { StudentConcessionsPanel } from '@/components/students/StudentConcessionsPanel'
import { useStudentProfile } from '@/hooks/useApi'
import type { CourseOption } from '@/components/dashboard/StudentDataTable'
import { cn } from '@/lib/utils'

function normalizeCourseIds(raw?: { course_ids?: string[]; course_id?: string | null }) {
  const ids = [...(raw?.course_ids ?? [])]
  if (raw?.course_id && !ids.includes(raw.course_id)) {
    ids.push(raw.course_id)
  }
  return ids
}

type Tab = 'student' | 'concessions' | 'payment_history'

function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function StudentProfileModal({
  open,
  onClose,
  studentId,
  coursesById,
  initialTab = 'payment_history',
  onEdit,
}: {
  open: boolean
  onClose: () => void
  studentId: string | null
  coursesById?: Map<string, CourseOption>
  initialTab?: Tab
  onEdit: (student: any) => void
}) {
  const [tab, setTab] = useState<Tab>(initialTab)
  useEffect(() => {
    if (open && studentId) setTab(initialTab)
  }, [open, studentId, initialTab])

  const profile = useStudentProfile(studentId ?? undefined)
  const payload = (profile.data?.data ?? profile.data ?? {}) as {
    student?: Record<string, unknown>
    summary?: {
      gross_assigned?: number
      concession_total?: number
      net_payable?: number
      paid_amount?: number
      unpaid_amount?: number
    }
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

  const tabs = useMemo(
    () => [
      { id: 'student' as const, label: 'Student Info', icon: Info },
      { id: 'concessions' as const, label: 'Scholarships', icon: Award },
      { id: 'payment_history' as const, label: 'Payment history', icon: History },
    ],
    [],
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={student ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() : 'Student'}
      description={student ? `${student.grade ?? 'Grade —'} · ${student.academic_year ?? ''}` : 'Loading…'}
      size="xl"
    >
      <div className="space-y-4">
        {/* Header actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                  tab === t.id ? 'bg-violet-100 text-violet-700' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => onEdit(student)} disabled={!student}>
              Edit Student
            </Button>
          </div>
        </div>

        <div>
          {profile.isLoading ? (
            <Skeleton className="h-12 rounded-xl" />
          ) : (
            <Card className="rounded-xl border-border/60 shadow-sm">
              <CardContent className="grid grid-cols-2 divide-x divide-border/60 p-0 sm:grid-cols-4">
                <div className="px-3 py-2.5 text-center">
                  <div className="text-[11px] text-muted-foreground">Gross assigned</div>
                  <div className="mt-0.5 text-sm font-semibold">{formatInr(Number(summary.gross_assigned ?? summary.net_payable ?? 0))}</div>
                </div>
                <div className="px-3 py-2.5 text-center">
                  <div className="text-[11px] text-muted-foreground">Concession</div>
                  <div className="mt-0.5 text-sm font-semibold text-sky-600">
                    −{formatInr(Number(summary.concession_total ?? 0))}
                  </div>
                </div>
                <div className="px-3 py-2.5 text-center">
                  <div className="text-[11px] text-muted-foreground">Net payable</div>
                  <div className="mt-0.5 text-sm font-semibold">{formatInr(Number(summary.net_payable ?? 0))}</div>
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
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {profile.isLoading ? (
                <Skeleton className="h-24 rounded-xl sm:col-span-3" />
              ) : (
                <>
                  {[
                    ['Name', `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim() || '—'],
                    ['Fee collections', enrolledBatchLabel],
                    ['Roll no', student?.roll_no ?? '—'],
                    ['Academic year', student?.academic_year ?? '—'],
                    ['Admission year', student?.admission_year ?? '—'],
                    ['Date of birth', student?.dob ?? '—'],
                    ['Primary phone', student?.primary_phone ?? '—'],
                    ['Secondary phone', student?.secondary_phone ?? '—'],
                    ['Primary email', student?.primary_email ?? '—'],
                    ['Secondary email', student?.secondary_email ?? '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border/60 bg-muted/10 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
                      <div className="mt-1 font-medium">{v as string}</div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-border/60 bg-muted/10 p-3 sm:col-span-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
                    <div className="mt-1">
                      <Badge className="rounded-lg capitalize">{student?.status ?? '—'}</Badge>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'concessions' && studentId && (
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-5">
              <StudentConcessionsPanel
                studentId={studentId}
                academicYear={String(student?.academic_year ?? '')}
              />
            </CardContent>
          </Card>
        )}

        {tab === 'payment_history' && (
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-5">
              <StudentPaymentHistory
                installments={installments}
                isLoading={profile.isLoading}
                coursesById={coursesById}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  )
}

