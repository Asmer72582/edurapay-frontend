import { ChevronDown, Loader2, Mail, Pencil, Phone, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  CollectionActionsMenu,
  type CollectionActionItem,
} from '@/components/courses/CollectionActionsMenu'
import { TablePaginationControls, type TablePaginationProps } from '@/components/ui/table-pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface StudentRow {
  id: string
  firstName: string
  lastName?: string
  studentCode: string
  batch: string
  batches: string[]
  courseIds: string[]
  courseId?: string | null
  grade?: string
  email?: string
  phone?: string
  feesPaid: number
  feesTotal: number
  feeStatus: 'paid' | 'partial' | 'overdue' | 'due' | 'none'
  accountStatus: 'active' | 'inactive'
}

export interface CourseOption {
  id: string
  name: string
  grade?: string
  status?: string
}

const avatarColors = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
]

const statusStyles = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  due: 'bg-sky-50 text-sky-700 border-sky-200',
  none: 'bg-muted/50 text-muted-foreground border-border/60',
}

function initials(first: string, last?: string) {
  return `${first.charAt(0)}${(last ?? first).charAt(last ? 0 : 1)}`.toUpperCase()
}

function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

interface StudentDataTableProps {
  students: StudentRow[]
  total?: number
  search: string
  onSearchChange: (v: string) => void
  onOpen?: (student: StudentRow) => void
  onEdit?: (student: StudentRow) => void
  onDeactivate?: (student: StudentRow) => void
  onReactivate?: (student: StudentRow) => void
  onSendPaymentLink?: (student: StudentRow) => void
  onDelete?: (student: StudentRow) => void
  rowMenuItems?: (student: StudentRow) => CollectionActionItem[]
  onBatchChange?: (student: StudentRow, courseId: string, enrolled: boolean) => void
  courses?: CourseOption[]
  updatingStudentId?: string | null
  selectedStudentId?: string | null
  isLoading?: boolean
  pagination?: TablePaginationProps | null
}

function BatchPicker({
  student,
  courses,
  onToggle,
  isUpdating,
}: {
  student: StudentRow
  courses: CourseOption[]
  onToggle: (courseId: string, enrolled: boolean) => void
  isUpdating?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const activeCourses = courses.filter((c) => c.status !== 'archived' && c.status !== 'inactive')

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const enrolledIds = student.courseIds ?? []
  const enrolledCourses = enrolledIds
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is CourseOption => Boolean(c))
  const availableCourses = activeCourses.filter((c) => !enrolledIds.includes(c.id))
  const unassigned = enrolledIds.length === 0 && !student.grade

  return (
    <div className="relative inline-block max-w-[260px]" ref={ref}>
      <div className="flex flex-wrap items-center gap-1">
        {enrolledCourses.map((course) => (
          <span
            key={course.id}
            className="inline-flex max-w-full items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 pl-2 pr-0.5 text-xs font-medium"
          >
            <span className="max-w-[90px] truncate">{course.name}</span>
            <button
              type="button"
              disabled={isUpdating}
              className="rounded-md p-0.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
              aria-label={`Remove ${course.name}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(course.id, true)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          disabled={isUpdating}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium transition-colors',
            unassigned
              ? 'border-dashed border-violet-300 bg-violet-50/60 text-violet-700 hover:bg-violet-50'
              : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/70',
            isUpdating && 'opacity-70',
          )}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
          )}
          {unassigned ? 'Assign' : 'Add'}
        </button>
      </div>
      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {enrolledCourses.length > 0 && (
            <>
              <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Enrolled
              </div>
              <div className="max-h-40 overflow-y-auto py-1">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="truncate font-medium">{course.name}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      onClick={() => onToggle(course.id, true)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {enrolledCourses.length > 0 ? 'Add collection' : 'Fee collections'}
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {availableCourses.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                {activeCourses.length === 0
                  ? 'No collections yet. Add one from Fee collections.'
                  : 'All collections are already assigned.'}
              </div>
            ) : (
              availableCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/40"
                  onClick={() => onToggle(course.id, false)}
                >
                  <span className="truncate font-medium">{course.name}</span>
                  <span className="text-xs text-violet-600">Add</span>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
            Use × on a course chip or Remove to unassign. Fees update automatically.
          </div>
        </div>
      )}
    </div>
  )
}

export function StudentDataTable({
  students,
  total,
  search,
  onSearchChange,
  onOpen,
  onEdit,
  onDeactivate,
  onReactivate,
  onSendPaymentLink,
  onDelete,
  rowMenuItems,
  onBatchChange,
  courses = [],
  updatingStudentId,
  selectedStudentId,
  isLoading,
  pagination,
}: StudentDataTableProps) {
  const rows = useMemo(() => students, [students])
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, ID, collection, parent..."
            className="h-10 rounded-xl border-border/60 bg-muted/30 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            Filter
          </Button>
          {pagination ? (
            <TablePaginationControls {...pagination} />
          ) : (
            <span className="text-sm text-muted-foreground">
              Showing {students.length} of {total ?? students.length}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3.5">Student</th>
              <th className="px-5 py-3.5">Collections</th>
              <th className="px-5 py-3.5">Contact</th>
              <th className="px-5 py-3.5">Fees</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                  </td>
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  No students found. Add your first student to get started.
                </td>
              </tr>
            ) : (
              rows.map((s, idx) => {
                const pct = s.feesTotal > 0 ? Math.round((s.feesPaid / s.feesTotal) * 100) : 0
                const isSelected = selectedStudentId != null && s.id === selectedStudentId
                return (
                  <tr
                    key={s.id}
                    className={cn(
                      'cursor-pointer border-b border-border/40 transition-colors',
                      isSelected
                        ? 'border-l-[3px] border-l-violet-500 bg-violet-50/80 hover:bg-violet-50'
                        : 'hover:bg-muted/20',
                    )}
                    onClick={() => onOpen?.(s)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                            avatarColors[idx % avatarColors.length],
                          )}
                        >
                          {initials(s.firstName, s.lastName)}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {s.firstName} {s.lastName ?? ''}
                          </div>
                          <div className="text-xs text-muted-foreground">{s.studentCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {onBatchChange ? (
                        <BatchPicker
                          student={s}
                          courses={courses}
                          isUpdating={updatingStudentId === s.id}
                          onToggle={(courseId, enrolled) => onBatchChange(s, courseId, enrolled)}
                        />
                      ) : (
                        <Badge className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 font-medium text-foreground">
                          {s.batch}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-muted-foreground">
                        {s.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{s.email}</span>
                          </div>
                        )}
                        {s.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[140px]">
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="font-medium">{formatInr(s.feesPaid)}</span>
                          <span className="text-muted-foreground">{formatInr(s.feesTotal)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              'h-2 rounded-full transition-all',
                              s.feeStatus === 'paid' && 'bg-emerald-500',
                              s.feeStatus === 'partial' && 'bg-amber-500',
                              (s.feeStatus === 'overdue' || s.feeStatus === 'due') && 'bg-rose-500',
                              s.feeStatus === 'none' && 'bg-muted',
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={cn('rounded-lg border px-2.5 py-1 capitalize', statusStyles[s.feeStatus])}>
                        {s.feeStatus === 'none' ? 'No fees' : s.feeStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          aria-label="Edit student"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(s)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <CollectionActionsMenu items={rowMenuItems?.(s) ?? []} />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Derive display fields from API student record */
export function mapStudentToRow(
  s: {
    _id?: string
    id?: string
    first_name: string
    last_name?: string
    roll_no?: string
    email?: string
    phone?: string
    primary_email?: string
    primary_phone?: string
    grade?: string
    course_id?: string | null
    course_ids?: string[]
    status?: string
    fee_summary?: {
      fees_total?: number
      fees_paid?: number
      fee_status?: string
    }
  },
  index: number,
  coursesById?: Map<string, CourseOption>,
): StudentRow {
  const id = s.id ?? s._id ?? String(index)
  const courseIds = [...(s.course_ids ?? [])]
  if (s.course_id && !courseIds.includes(s.course_id)) {
    courseIds.push(s.course_id)
  }
  const batches = courseIds
    .map((cid) => coursesById?.get(cid)?.name)
    .filter((name): name is string => Boolean(name))
  const batch =
    batches.length > 0
      ? batches.length === 1
        ? batches[0]
        : `${batches[0]} +${batches.length - 1}`
      : 'Unassigned'

  const summary = s.fee_summary
  const feesTotal = Math.round(Number(summary?.fees_total ?? 0))
  const feesPaid = Math.round(Number(summary?.fees_paid ?? 0))
  const rawStatus = summary?.fee_status ?? 'none'
  const feeStatus: StudentRow['feeStatus'] =
    rawStatus === 'paid' || rawStatus === 'partial' || rawStatus === 'overdue' || rawStatus === 'due' || rawStatus === 'none'
      ? rawStatus
      : feesTotal === 0
        ? 'none'
        : feesPaid >= feesTotal
          ? 'paid'
          : feesPaid > 0
            ? 'partial'
            : 'due'

  return {
    id,
    firstName: s.first_name,
    lastName: s.last_name,
    studentCode: s.roll_no?.trim() || `STU-${1000 + index}`,
    batch,
    batches,
    courseIds,
    courseId: courseIds[0] ?? null,
    grade: s.grade,
    email: s.primary_email ?? s.email,
    phone: s.primary_phone ?? s.phone,
    feesPaid,
    feesTotal,
    feeStatus,
    accountStatus: s.status === 'inactive' ? 'inactive' : 'active',
  }
}
