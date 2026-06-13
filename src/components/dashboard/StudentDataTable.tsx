import { ChevronDown, Loader2, Mail, Pencil, Phone, Search, X } from 'lucide-react'
import {
  CollectionActionsMenu,
  type CollectionActionItem,
} from '@/components/courses/CollectionActionsMenu'
import { TablePaginationControls, type TablePaginationProps } from '@/components/ui/table-pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AnchoredMenuPortal } from '@/components/ui/anchored-menu'
import { useMemo, useRef, useState } from 'react'

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
  has_fee_plan?: boolean
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
  onSetPrimaryClass?: (student: StudentRow, courseId: string) => void
  courses?: CourseOption[]
  updatingStudentId?: string | null
  selectedStudentId?: string | null
  hideEnrollmentColumns?: boolean
  isLoading?: boolean
  pagination?: TablePaginationProps | null
}

export function ClassCollectionPicker({
  student,
  courses,
  onSelect,
  isUpdating,
  variant = 'table',
}: {
  student: StudentRow
  courses: CourseOption[]
  onSelect: (courseId: string) => void
  isUpdating?: boolean
  variant?: 'table' | 'panel'
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const activeCourses = courses.filter((c) => c.status !== 'archived' && c.status !== 'inactive')
  const primaryId = student.courseId ?? student.courseIds[0] ?? ''
  const primaryCourse = primaryId ? courses.find((c) => c.id === primaryId) : undefined
  const unassigned = !primaryCourse && !student.grade
  const menuHeight = variant === 'panel' ? 280 : 320

  return (
    <div className={cn(variant === 'panel' ? 'w-full' : 'inline-block min-w-[120px] max-w-[200px]')}>
      <button
        ref={triggerRef}
        type="button"
        disabled={isUpdating}
        className={cn(
          'inline-flex w-full items-center justify-between gap-1 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors',
          unassigned
            ? 'border-dashed border-violet-300 bg-violet-50/60 text-violet-700 hover:bg-violet-50'
            : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/50',
          isUpdating && 'opacity-70',
        )}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <span className="truncate">
          {isUpdating ? 'Updating…' : primaryCourse?.name ?? student.grade ?? 'Assign class'}
        </span>
        <ChevronDown className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      <AnchoredMenuPortal
        open={open}
        triggerRef={triggerRef}
        menuRef={menuRef}
        menuWidth={256}
        menuHeight={menuHeight}
        onClose={() => setOpen(false)}
      >
        <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Class fee collection
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {activeCourses.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              No collections yet. Create one under Fee collections.
            </div>
          ) : (
            activeCourses.map((course) => {
              const active = course.id === primaryId
              return (
                <button
                  key={course.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/40',
                    active && 'bg-violet-50/80',
                  )}
                  onClick={() => {
                    onSelect(course.id)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 truncate font-medium">{course.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {course.has_fee_plan === false ? 'No fees' : active ? 'Current' : 'Set'}
                  </span>
                </button>
              )
            })
          )}
        </div>
        {variant === 'table' && (
          <div className="border-t border-border/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            Primary class or tuition collection for this student.
          </div>
        )}
      </AnchoredMenuPortal>
    </div>
  )
}

export function BatchPicker({
  student,
  courses,
  onToggle,
  isUpdating,
  excludeCourseId,
  variant = 'table',
}: {
  student: StudentRow
  courses: CourseOption[]
  onToggle: (courseId: string, enrolled: boolean) => void
  isUpdating?: boolean
  excludeCourseId?: string
  variant?: 'table' | 'panel'
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const activeCourses = courses.filter((c) => c.status !== 'archived' && c.status !== 'inactive')

  const enrolledIds = (student.courseIds ?? []).filter((id) => id !== excludeCourseId)
  const enrolledCourses = enrolledIds
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is CourseOption => Boolean(c))
  const availableCourses = activeCourses.filter((c) => !enrolledIds.includes(c.id) && c.id !== excludeCourseId)
  const unassigned = enrolledCourses.length === 0
  const menuHeight = Math.min(360, 120 + availableCourses.length * 40 + enrolledCourses.length * 36)

  const handleToggle = (courseId: string, enrolled: boolean) => {
    onToggle(courseId, enrolled)
    if (!enrolled) setOpen(false)
  }

  return (
    <div className={cn(variant === 'panel' ? 'w-full' : 'inline-block max-w-[240px]')}>
      <div className="flex flex-wrap items-center gap-1">
        {enrolledCourses.map((course) => (
          <span
            key={course.id}
            className="inline-flex max-w-full items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 pl-2 pr-0.5 text-xs font-medium"
          >
            <span className="max-w-[88px] truncate">{course.name}</span>
            <button
              type="button"
              disabled={isUpdating}
              className="rounded-md p-0.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
              aria-label={`Remove ${course.name}`}
              onClick={(e) => {
                e.stopPropagation()
                handleToggle(course.id, true)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          ref={triggerRef}
          type="button"
          disabled={isUpdating}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors',
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
          {unassigned ? 'Add fee' : 'Add'}
        </button>
      </div>
      <AnchoredMenuPortal
        open={open}
        triggerRef={triggerRef}
        menuRef={menuRef}
        menuWidth={256}
        menuHeight={menuHeight}
        onClose={() => setOpen(false)}
      >
        {enrolledCourses.length > 0 && (
          <>
            <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Enrolled
            </div>
            <div className="max-h-32 overflow-y-auto py-1">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="truncate font-medium">{course.name}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    onClick={() => handleToggle(course.id, true)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {enrolledCourses.length > 0 ? 'Add fee' : 'Other fee collections'}
        </div>
        <div className="max-h-44 overflow-y-auto py-1">
          {availableCourses.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              {activeCourses.length === 0
                ? 'No collections yet. Add one from Fee collections.'
                : 'All other fees are already assigned.'}
            </div>
          ) : (
            availableCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/40"
                onClick={() => handleToggle(course.id, false)}
              >
                <span className="truncate font-medium">{course.name}</span>
                <span className="text-xs text-violet-600">Add</span>
              </button>
            ))
          )}
        </div>
      </AnchoredMenuPortal>
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
  onSetPrimaryClass,
  courses = [],
  updatingStudentId,
  selectedStudentId,
  hideEnrollmentColumns = false,
  isLoading,
  pagination,
}: StudentDataTableProps) {
  const rows = useMemo(() => students, [students])
  const showEnrollment = !hideEnrollmentColumns && (onBatchChange || onSetPrimaryClass)
  const colCount = showEnrollment ? 7 : 5

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
      {hideEnrollmentColumns && (
        <p className="border-b border-border/50 bg-violet-50/50 px-4 py-2 text-xs text-violet-800">
          Class and fee assignments are shown in the student panel on the right.
        </p>
      )}
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
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Student</th>
              {showEnrollment && <th className="min-w-[130px] px-4 py-3">Class</th>}
              {showEnrollment && <th className="min-w-[150px] px-4 py-3">Other fees</th>}
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Fees</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td colSpan={colCount} className="px-4 py-4">
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                  </td>
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-muted-foreground">
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
                    <td className="align-middle px-4 py-3">
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
                    {showEnrollment && (
                      <td className="align-middle px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {onSetPrimaryClass ? (
                          <ClassCollectionPicker
                            student={s}
                            courses={courses}
                            isUpdating={updatingStudentId === s.id}
                            onSelect={(courseId) => onSetPrimaryClass(s, courseId)}
                          />
                        ) : (
                          <Badge className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 font-medium text-foreground">
                            {s.grade ?? s.batch}
                          </Badge>
                        )}
                      </td>
                    )}
                    {showEnrollment && (
                      <td className="align-middle px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {onBatchChange ? (
                          <BatchPicker
                            student={s}
                            courses={courses}
                            isUpdating={updatingStudentId === s.id}
                            excludeCourseId={s.courseId ?? s.courseIds[0]}
                            onToggle={(courseId, enrolled) => onBatchChange(s, courseId, enrolled)}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    )}
                    <td className="align-middle px-4 py-3">
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
                    <td className="align-middle px-4 py-3">
                      <div className="min-w-[120px]">
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
                    <td className="align-middle px-4 py-3">
                      <Badge className={cn('rounded-lg border px-2.5 py-1 capitalize', statusStyles[s.feeStatus])}>
                        {s.feeStatus === 'none' ? 'No fees' : s.feeStatus}
                      </Badge>
                    </td>
                    <td className="align-middle px-4 py-3 text-right">
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
    courseId: s.course_id ?? courseIds[0] ?? null,
    grade: s.grade,
    email: s.primary_email ?? s.email,
    phone: s.primary_phone ?? s.phone,
    feesPaid,
    feesTotal,
    feeStatus,
    accountStatus: s.status === 'inactive' ? 'inactive' : 'active',
  }
}
