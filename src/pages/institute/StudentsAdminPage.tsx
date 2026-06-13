import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreditCard, Download, FileSpreadsheet, FileUp, Info, Link2, Plus, Upload, X } from 'lucide-react'
import { SendPaymentLinkModal } from '@/components/payments/SendPaymentLinkModal'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { StudentDataTable, mapStudentToRow, type CourseOption } from '@/components/dashboard/StudentDataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildStudentMenuItems } from '@/components/students/student-actions'
import {
  useStudentsDashboard,
  useCreateStudent,
  useBulkImportStudents,
  useBulkImportSchema,
  useUpdateStudent,
  useDeleteStudent,
  useToggleStudentCourse,
  useSetStudentPrimaryCollection,
  useGenerateStudentOnboardingLink,
  useSendFeeReminder,
} from '@/hooks/useApi'
import {
  ASSIGN_COLLECTIONS_HINT,
  NO_COLLECTIONS_YET,
} from '@/lib/fee-collections'
import { formatInr } from '@/lib/institute-mock'
import {
  buildTemplateCsv,
  documentPendingLabel,
  downloadTemplateXlsx,
  parseBulkCsv,
  parseBulkSpreadsheet,
  PREVIEW_COLUMNS,
  previewCell,
  rowsToCsv,
  rowsToImportPayload,
} from '@/lib/student-bulk-import'
import { Modal } from '@/components/ui/modal'
import { StudentProfileModal } from '@/pages/institute/StudentProfileModal'
import { StudentProfilePanel } from '@/pages/institute/StudentProfilePanel'
import { cn } from '@/lib/utils'

function defaultAcademicYear() {
  const y = new Date().getFullYear()
  return `${y}-${y + 1}`
}

function normalizeCourseIds(raw?: { course_ids?: string[]; course_id?: string | null }) {
  const ids = [...(raw?.course_ids ?? [])]
  if (raw?.course_id && !ids.includes(raw.course_id)) {
    ids.push(raw.course_id)
  }
  return ids
}

function emptyStudentForm() {
  return {
    first_name: '',
    last_name: '',
    roll_no: '',
    primary_email: '',
    secondary_email: '',
    primary_phone: '',
    secondary_phone: '',
    academic_year: defaultAcademicYear(),
    admission_year: String(new Date().getFullYear()),
    dob: '',
    course_ids: [] as string[],
    primary_course_id: '',
  }
}

export function StudentsAdminPage() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''
  const [search, setSearch] = useState(initialSearch)
  const [page, setPage] = useState(1)
  const [showBulk, setShowBulk] = useState(false)
  const { data: dashboardData, isLoading, isFetching } = useStudentsDashboard(search, page, LIST_PAGE_SIZE)
  const createStudent = useCreateStudent()
  const bulkImport = useBulkImportStudents()
  const { data: bulkSchemaEnvelope } = useBulkImportSchema(showBulk)
  const bulkSchema = bulkSchemaEnvelope?.data
  const updateStudent = useUpdateStudent()
  const deleteStudent = useDeleteStudent()
  const sendFeeReminder = useSendFeeReminder()
  const toggleCourse = useToggleStudentCourse()
  const setPrimaryCollection = useSetStudentPrimaryCollection()
  const generateLink = useGenerateStudentOnboardingLink()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [selected, setSelected] = useState<ReturnType<typeof mapStudentToRow> | null>(null)
  const [editing, setEditing] = useState<ReturnType<typeof mapStudentToRow> | null>(null)
  const [form, setForm] = useState(emptyStudentForm)
  const [bulkText, setBulkText] = useState('')
  const [bulkFileName, setBulkFileName] = useState<string | null>(null)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [profileTab, setProfileTab] = useState<'student' | 'payment_history'>('payment_history')
  const [sendPayOpen, setSendPayOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [updatingBatchId, setUpdatingBatchId] = useState<string | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  const studentPagination = useMemo(
    () => parsePaginated<Record<string, unknown>>({ data: dashboardData?.data?.students }),
    [dashboardData],
  )

  const tablePagination = useMemo(
    () => ({
      page: studentPagination.page,
      lastPage: studentPagination.lastPage,
      total: studentPagination.total,
      perPage: studentPagination.perPage,
      onPageChange: setPage,
      disabled: isLoading || isFetching,
    }),
    [studentPagination, isLoading, isFetching],
  )

  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    setSearch(q)
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search])

  const rawStudents = studentPagination.items as {
    _id?: string
    id?: string
    first_name: string
    last_name?: string
    roll_no?: string
    email?: string
    phone?: string
    primary_email?: string
    primary_phone?: string
    secondary_email?: string
    secondary_phone?: string
    dob?: string
    admission_year?: number
    academic_year?: string
    grade?: string
    course_id?: string | null
    course_ids?: string[]
    fee_summary?: {
      fees_total?: number
      fees_paid?: number
      fee_status?: string
    }
    status: string
  }[]

  const courses = useMemo(() => {
    const items = (dashboardData?.data?.course_options ?? []) as {
      _id?: string
      id?: string
      name: string
      grade?: string
      status?: string
    }[]
    return items.map((c) => ({
      id: String(c.id ?? c._id ?? ''),
      name: c.name,
      grade: c.grade,
      status: c.status,
      has_fee_plan: Boolean((c as { has_fee_plan?: boolean }).has_fee_plan),
    })) satisfies CourseOption[]
  }, [dashboardData])

  const coursesById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const activeCourses = useMemo(
    () => courses.filter((c) => c.status !== 'archived' && c.status !== 'inactive'),
    [courses],
  )

  const toggleFormCourse = (courseId: string) => {
    setForm((prev) => {
      if (courseId === prev.primary_course_id) return prev
      const selected = prev.course_ids.includes(courseId)
      return {
        ...prev,
        course_ids: selected ? prev.course_ids.filter((id) => id !== courseId) : [...prev.course_ids, courseId],
      }
    })
  }

  const setPrimaryFormCourse = (courseId: string) => {
    setForm((prev) => {
      const additional = prev.course_ids.filter((id) => id !== courseId && id !== prev.primary_course_id)
      const nextIds = courseId ? [courseId, ...additional] : additional
      return {
        ...prev,
        primary_course_id: courseId,
        course_ids: nextIds,
      }
    })
  }

  const formCourseIds = useMemo(() => {
    const primary = form.primary_course_id
    const rest = form.course_ids.filter((id) => id !== primary)
    return primary ? [primary, ...rest] : rest
  }, [form.primary_course_id, form.course_ids])

  const additionalFormCourses = useMemo(
    () => activeCourses.filter((c) => c.id !== form.primary_course_id),
    [activeCourses, form.primary_course_id],
  )

  const total = studentPagination.total

  const stats = dashboardData?.data?.stats
  const statsLoading = isLoading && !dashboardData?.data?.stats

  const rows = useMemo(() => {
    return rawStudents.map((s, i) => mapStudentToRow(s, i, coursesById))
  }, [rawStudents, coursesById])

  const invalidateStudentData = () => {
    qc.invalidateQueries({ queryKey: ['students-dashboard'] })
    qc.invalidateQueries({ queryKey: ['students'] })
    qc.invalidateQueries({ queryKey: ['students-stats'] })
    qc.invalidateQueries({ queryKey: ['courses'] })
  }

  const handleBatchChange = async (student: ReturnType<typeof mapStudentToRow>, courseId: string, enrolled: boolean) => {
    setUpdatingBatchId(student.id)
    try {
      const res = await toggleCourse.mutateAsync({ id: student.id, courseId })
      const courseName = coursesById.get(courseId)?.name ?? 'course'
      toast.success(enrolled ? `Removed from ${courseName}` : `Added to ${courseName}`)
      if (res.data?.warning) {
        toast.warning(res.data.warning, { duration: 7000 })
      }
      invalidateStudentData()
      qc.invalidateQueries({ queryKey: ['students', 'profile', student.id] })
    } catch {
      toast.error('Could not update collections. Try again.')
    } finally {
      setUpdatingBatchId(null)
    }
  }

  const handleSetPrimaryClass = async (student: ReturnType<typeof mapStudentToRow>, courseId: string) => {
    if ((student.courseId ?? student.courseIds[0]) === courseId) return
    setUpdatingBatchId(student.id)
    try {
      const res = await setPrimaryCollection.mutateAsync({ id: student.id, courseId })
      const courseName = coursesById.get(courseId)?.name ?? 'class'
      toast.success(`Assigned ${courseName} as class fee collection`)
      if (res.data?.warning) {
        toast.warning(res.data.warning, { duration: 7000 })
      }
      invalidateStudentData()
      qc.invalidateQueries({ queryKey: ['students', 'profile', student.id] })
    } catch {
      toast.error('Could not assign class fee collection. Try again.')
    } finally {
      setUpdatingBatchId(null)
    }
  }

  const submit = async () => {
    try {
      await createStudent.mutateAsync({
        first_name: form.first_name,
        last_name: form.last_name,
        roll_no: form.roll_no,
        primary_email: form.primary_email,
        secondary_email: form.secondary_email || null,
        primary_phone: form.primary_phone,
        secondary_phone: form.secondary_phone || null,
        course_ids: formCourseIds,
        course_id: form.primary_course_id || undefined,
        academic_year: form.academic_year,
        admission_year: form.admission_year ? Number(form.admission_year) : null,
        dob: form.dob || null,
        status: 'active',
      })
      toast.success('Student added successfully!')
      setForm(emptyStudentForm())
      setShowForm(false)
      invalidateStudentData()
    } catch {
      toast.error('Failed to add student.')
    }
  }

  const submitEdit = async () => {
    if (!editing) return
    try {
      await updateStudent.mutateAsync({
        id: editing.id,
        payload: {
          first_name: form.first_name,
          last_name: form.last_name || null,
          roll_no: form.roll_no || null,
          primary_email: form.primary_email || null,
          secondary_email: form.secondary_email || null,
          primary_phone: form.primary_phone || null,
          secondary_phone: form.secondary_phone || null,
          course_ids: formCourseIds,
        course_id: form.primary_course_id || undefined,
          academic_year: form.academic_year || null,
          admission_year: form.admission_year ? Number(form.admission_year) : null,
          dob: form.dob || null,
        },
      })
      toast.success('Student updated!')
      setEditing(null)
      setForm(emptyStudentForm())
      setShowForm(false)
      invalidateStudentData()
      qc.invalidateQueries({ queryKey: ['students', 'profile', editing.id] })
    } catch {
      toast.error('Failed to update student.')
    }
  }

  const deactivate = async (s: ReturnType<typeof mapStudentToRow>) => {
    try {
      await updateStudent.mutateAsync({ id: s.id, payload: { status: 'inactive' } })
      toast.success('Student deactivated.')
      invalidateStudentData()
    } catch {
      toast.error('Failed to deactivate student.')
    }
  }

  const reactivate = async (s: ReturnType<typeof mapStudentToRow>) => {
    try {
      await updateStudent.mutateAsync({ id: s.id, payload: { status: 'active' } })
      toast.success('Student reactivated.')
      invalidateStudentData()
    } catch {
      toast.error('Failed to reactivate student.')
    }
  }

  const removeStudent = async (s: ReturnType<typeof mapStudentToRow>) => {
    const name = `${s.firstName} ${s.lastName ?? ''}`.trim()
    const confirmed = window.confirm(
      `Delete ${name}? This cannot be undone. Students with recorded payments cannot be deleted — deactivate instead.`,
    )
    if (!confirmed) return
    try {
      await deleteStudent.mutateAsync(s.id)
      toast.success('Student deleted.')
      if (selected?.id === s.id) {
        setSelected(null)
        setPanelOpen(false)
      }
      invalidateStudentData()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not delete student.')
    }
  }

  const sendReminder = async (s: ReturnType<typeof mapStudentToRow>) => {
    try {
      const res = await sendFeeReminder.mutateAsync({ student_id: s.id })
      toast.success(res.message ?? 'Fee reminder sent')
      qc.invalidateQueries({ queryKey: ['fee-reminders-logs'] })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not send reminder')
    }
  }

  const studentMenuItems = (s: ReturnType<typeof mapStudentToRow>) =>
    buildStudentMenuItems(s, {
      onView: () => {
        setProfileTab('student')
        setSelected(s)
        setPanelOpen(true)
      },
      onPaymentHistory: () => {
        setProfileTab('payment_history')
        setSelected(s)
        setPanelOpen(true)
      },
      onEdit: () => openEdit(s),
      onSendPaymentLink: () => {
        setSelected(s)
        setSendPayOpen(true)
      },
      onSendReminder: () => sendReminder(s),
      onCopyEmail: s.email
        ? () => {
            navigator.clipboard.writeText(s.email!)
            toast.success('Email copied')
          }
        : undefined,
      onCopyPhone: s.phone
        ? () => {
            navigator.clipboard.writeText(s.phone!)
            toast.success('Phone copied')
          }
        : undefined,
      onCopyRoll: () => {
        navigator.clipboard.writeText(s.studentCode)
        toast.success('Roll no. copied')
      },
      onDeactivate: () => deactivate(s),
      onReactivate: () => reactivate(s),
      onDelete: () => removeStudent(s),
    })

  const bulkPreview = useMemo(() => {
    if (!bulkSchema) return []
    return parseBulkCsv(bulkText, bulkSchema.csv_headers)
      .filter((s) => s.first_name?.trim())
      .slice(0, 50)
  }, [bulkText, bulkSchema])

  const doBulkImport = async () => {
    if (!bulkSchema) {
      toast.error('Import schema still loading. Try again in a moment.')
      return
    }

    let students: Array<Record<string, unknown>>
    if (bulkFile?.name.toLowerCase().endsWith('.xlsx')) {
      const rows = await parseBulkSpreadsheet(bulkFile, bulkSchema.csv_headers)
      students = rowsToImportPayload(rows)
    } else {
      students = rowsToImportPayload(parseBulkCsv(bulkText, bulkSchema.csv_headers))
    }

    if (students.length === 0) {
      toast.error('No valid rows found — first_name is required on each row.')
      return
    }

    try {
      const res = await bulkImport.mutateAsync({ students })
      const payload = res.data as { count?: number; warnings?: string[] }
      const count = payload.count ?? students.length
      toast.success(`Imported ${count} student${count === 1 ? '' : 's'}.`)
      const warnings = payload.warnings ?? []
      if (warnings.length > 0) {
        toast.info(
          `${warnings.length} row${warnings.length === 1 ? '' : 's'} missing ID document — share the onboarding link to collect documents.`,
          { duration: 9000 },
        )
      }
      setBulkText('')
      setBulkFileName(null)
      setBulkFile(null)
      setShowBulk(false)
      invalidateStudentData()
    } catch {
      toast.error('Bulk import failed. Check columns and course names, then try again.')
    }
  }

  const doGenerateLink = async () => {
    try {
      const res = await generateLink.mutateAsync({})
      const url = (res.data as { url: string }).url
      setOnboardingUrl(url)
      toast.success('Link generated!')
    } catch {
      toast.error('Failed to generate link.')
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyStudentForm())
    setShowForm(true)
  }

  const openEdit = (s: ReturnType<typeof mapStudentToRow>) => {
    const raw = rawStudents.find((r) => String(r.id ?? r._id ?? '') === s.id)
    setSelected(null)
    setEditing(s)
    setForm({
      first_name: raw?.first_name ?? s.firstName,
      last_name: raw?.last_name ?? s.lastName ?? '',
      roll_no: raw?.roll_no ?? (s.studentCode.startsWith('STU-') ? '' : s.studentCode),
      primary_email: raw?.primary_email ?? raw?.email ?? s.email ?? '',
      secondary_email: raw?.secondary_email ?? '',
      primary_phone: raw?.primary_phone ?? raw?.phone ?? s.phone ?? '',
      secondary_phone: raw?.secondary_phone ?? '',
      academic_year: raw?.academic_year ?? defaultAcademicYear(),
      admission_year: raw?.admission_year ? String(raw.admission_year) : String(new Date().getFullYear()),
      dob: raw?.dob ? String(raw.dob).slice(0, 10) : '',
      course_ids: normalizeCourseIds(raw),
      primary_course_id: String(raw?.course_id ?? normalizeCourseIds(raw)[0] ?? ''),
    })
    setShowForm(true)
  }

  return (
    <div className={cn('mx-auto w-full space-y-5', panelOpen && selected ? 'max-w-[1580px]' : 'max-w-[1400px]')}>
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Students' }]}
        title="Students"
        description="A unified roster across batches with smart fee tracking and outreach."
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowBulk(true)}>
              <Upload className="mr-1.5 h-4 w-4" />
              Bulk import
            </Button>
            {selected && (
              <Button variant="outline" className="rounded-xl" onClick={() => setSendPayOpen(true)}>
                <CreditCard className="mr-1.5 h-4 w-4" />
                Send pay link
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={async () => {
                setShowLink(true)
                setOnboardingUrl(null)
                await doGenerateLink()
              }}
              disabled={generateLink.isPending}
            >
              <Link2 className="mr-1.5 h-4 w-4" />
              {generateLink.isPending ? 'Generating…' : 'Onboarding link'}
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20"
              onClick={openAdd}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add student
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-4">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-3 h-7 w-16 rounded bg-muted" />
              <div className="mt-2 h-3 w-28 rounded bg-muted" />
            </div>
          ))
        ) : (
          <>
            <MetricCard
              simple
              label="Total students"
              value={(stats?.total_students ?? 0).toLocaleString('en-IN')}
              trend={
                (stats?.new_this_month ?? 0) > 0
                  ? `+${stats!.new_this_month} this month`
                  : 'No new this month'
              }
              trendUp={(stats?.new_this_month ?? 0) > 0}
            />
            <MetricCard
              simple
              label="Enrolled students"
              value={(stats?.enrolled_students ?? 0).toLocaleString('en-IN')}
              trend={`${(stats?.active_courses ?? 0).toLocaleString('en-IN')} active collections`}
              trendUp={(stats?.enrolled_students ?? 0) > 0}
            />
            <MetricCard
              simple
              label="On-time payment"
              value={`${stats?.on_time_payment_pct ?? 0}%`}
              trend={
                (stats?.students_with_fees ?? 0) > 0
                  ? `${stats!.students_with_fees} with fee schedules · ${stats?.total_installments ?? 0} installments`
                  : 'No fee schedules yet'
              }
              trendUp={(stats?.on_time_payment_pct ?? 0) >= 50}
            />
            <MetricCard
              simple
              label="Overdue fees"
              value={formatInr(stats?.overdue_amount ?? 0, true)}
              trend={
                (stats?.overdue_students ?? 0) === 1
                  ? '1 student · past-due installments'
                  : `${stats?.overdue_students ?? 0} students · past-due installments`
              }
              trendUp={(stats?.overdue_students ?? 0) === 0}
            />
          </>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditing(null)
        }}
        title={editing ? 'Edit student' : 'Add new student'}
        description="Student profile and fee collections. Charges are auto-assigned from each collection's fee plan."
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>First name</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Last name</Label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Roll number</Label>
            <Input value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} className="rounded-xl" placeholder="LKG-09834" />
          </div>
          <div className="space-y-2">
            <Label>Academic year</Label>
            <Input value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} className="rounded-xl" placeholder="2026-2027" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Class fee collection</Label>
            <p className="text-xs text-muted-foreground">
              Primary class or tuition program. Required for class-based fee assignment and payment links.
            </p>
            <div className="rounded-xl border border-border/60 p-3">
              {activeCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{NO_COLLECTIONS_YET}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeCourses.map((course) => {
                    const selected = form.primary_course_id === course.id
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setPrimaryFormCourse(course.id)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                          selected
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-border/60 bg-muted/20 text-foreground hover:bg-muted/40',
                        )}
                      >
                        {course.name}
                        {course.has_fee_plan === false && (
                          <span className="ml-1.5 text-[10px] font-normal text-amber-700">(no fees)</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Other fee collections</Label>
            <p className="text-xs text-muted-foreground">{ASSIGN_COLLECTIONS_HINT}</p>
            <div className="rounded-xl border border-border/60 p-3">
              {form.course_ids.filter((id) => id !== form.primary_course_id).length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {form.course_ids
                    .filter((id) => id !== form.primary_course_id)
                    .map((courseId) => {
                    const course = coursesById.get(courseId)
                    if (!course) return null
                    return (
                      <span
                        key={courseId}
                        className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                      >
                        {course.name}
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-violet-100"
                          aria-label={`Remove ${course.name}`}
                          onClick={() => toggleFormCourse(courseId)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
              {additionalFormCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select a class first, or all collections are already assigned.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {additionalFormCourses.map((course) => {
                    const selected = form.course_ids.includes(course.id)
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleFormCourse(course.id)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                          selected
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-border/60 bg-muted/20 text-foreground hover:bg-muted/40',
                        )}
                      >
                        {course.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date of birth</Label>
            <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Admission year</Label>
            <Input value={form.admission_year} onChange={(e) => setForm({ ...form, admission_year: e.target.value })} className="rounded-xl" placeholder="2026" />
          </div>
          <div className="space-y-2">
            <Label>Primary email</Label>
            <Input type="email" value={form.primary_email} onChange={(e) => setForm({ ...form, primary_email: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Secondary email</Label>
            <Input type="email" value={form.secondary_email} onChange={(e) => setForm({ ...form, secondary_email: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Primary phone</Label>
            <Input value={form.primary_phone} onChange={(e) => setForm({ ...form, primary_phone: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Secondary phone</Label>
            <Input value={form.secondary_phone} onChange={(e) => setForm({ ...form, secondary_phone: e.target.value })} className="rounded-xl" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={editing ? submitEdit : submit}
            disabled={(editing ? updateStudent.isPending : createStudent.isPending) || !form.first_name}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
          >
            {editing ? (updateStudent.isPending ? 'Saving...' : 'Save changes') : (createStudent.isPending ? 'Saving...' : 'Save student')}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal
        open={showBulk}
        onClose={() => setShowBulk(false)}
        title="Bulk import students"
        description={
          bulkSchema
            ? `Same fields as the onboarding link — ${bulkSchema.csv_headers.length} CSV columns plus documents collected separately.`
            : 'Loading import template…'
        }
        size="xl"
      >
        <div className="space-y-4">
          {bulkSchema?.documents && bulkSchema.documents.length > 0 && (
            <div className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="font-medium">Documents not included in CSV</p>
                <ul className="list-inside list-disc text-amber-900/90">
                  {bulkSchema.documents.map((doc) => (
                    <li key={doc.key}>
                      {doc.label}
                      {doc.note ? ` — ${doc.note}` : ''}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-amber-800 underline"
                  onClick={async () => {
                    setShowBulk(false)
                    setShowLink(true)
                    setOnboardingUrl(null)
                    await doGenerateLink()
                  }}
                >
                  Generate onboarding link to collect documents
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm font-medium hover:bg-muted/30">
                  <FileUp className="h-4 w-4" />
                  Import Excel / CSV
                  <input
                    type="file"
                    accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    className="hidden"
                    disabled={!bulkSchema}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file || !bulkSchema) return
                      setBulkFileName(file.name)
                      setBulkFile(file.name.toLowerCase().endsWith('.xlsx') ? file : null)
                      if (file.name.toLowerCase().endsWith('.xlsx')) {
                        const rows = await parseBulkSpreadsheet(file, bulkSchema.csv_headers)
                        setBulkText(rowsToCsv(bulkSchema.csv_headers, rows))
                      } else {
                        const text = await file.text()
                        setBulkText(text)
                      }
                    }}
                  />
                </label>
                {bulkFileName && <span className="text-sm text-muted-foreground">{bulkFileName}</span>}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={!bulkSchema}
                  onClick={() => {
                    if (!bulkSchema) return
                    downloadTemplateXlsx(bulkSchema)
                    toast.success('Excel template downloaded — fill it and import directly.')
                  }}
                >
                  <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                  Download Excel template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={!bulkSchema}
                  onClick={() => {
                    if (!bulkSchema) return
                    const template = buildTemplateCsv(bulkSchema)
                    navigator.clipboard?.writeText(template).catch(() => {})
                    toast.success('CSV template copied to clipboard.')
                  }}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Copy CSV template
                </Button>
              </div>

              {bulkFile?.name.toLowerCase().endsWith('.xlsx') ? (
                <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 px-4 py-3 text-sm text-violet-950">
                  <span className="font-medium">{bulkFileName}</span> ready to import. Preview below, or click Import students.
                </div>
              ) : (
                <textarea
                  value={bulkText}
                  onChange={(e) => {
                    setBulkText(e.target.value)
                    setBulkFile(null)
                    setBulkFileName(null)
                  }}
                  rows={12}
                  placeholder={bulkSchema ? 'Paste CSV with header row, or download the Excel template…' : 'Loading schema…'}
                  className="flex w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-xs"
                />
              )}

              {bulkSchema && (
                <details className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2 text-xs">
                  <summary className="cursor-pointer font-semibold text-foreground">Column reference</summary>
                  <div className="mt-2 max-h-40 space-y-3 overflow-y-auto">
                    {(['student', 'contact', 'enrollment', 'guardian', 'address'] as const).map((group) => {
                      const fields = bulkSchema.fields.filter((f) => f.bulk_csv && f.group === group)
                      if (fields.length === 0) return null
                      return (
                        <div key={group}>
                          <div className="mb-1 font-medium capitalize text-muted-foreground">{group}</div>
                          <ul className="space-y-0.5 text-muted-foreground">
                            {fields.map((f) => (
                              <li key={f.key}>
                                <code className="text-foreground">{f.key}</code>
                                {f.required ? ' *' : ''}
                                {f.note ? ` — ${f.note}` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                    {bulkSchema.courses.length > 0 && (
                      <div>
                        <div className="mb-1 font-medium text-muted-foreground">Available classes</div>
                        <p className="text-muted-foreground">{bulkSchema.courses.map((c) => c.name).join(' · ')}</p>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
                  onClick={doBulkImport}
                  disabled={bulkImport.isPending || !bulkSchema}
                >
                  {bulkImport.isPending ? 'Importing...' : 'Import students'}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setShowBulk(false)}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">Preview (first 50 rows)</div>
              <div className="overflow-x-auto rounded-2xl border border-border/60">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {PREVIEW_COLUMNS.map((col) => (
                        <th key={col.key} className="px-3 py-2">
                          {col.label}
                        </th>
                      ))}
                      <th className="px-3 py-2">Docs pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.map((s, i) => (
                      <tr key={i} className="border-b border-border/40 last:border-0">
                        {PREVIEW_COLUMNS.map((col) => (
                          <td key={col.key} className="max-w-[140px] truncate px-3 py-2">
                            {previewCell(s, col.key)}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-xs text-amber-700">
                          {bulkSchema ? documentPendingLabel(bulkSchema.documents) : '—'}
                        </td>
                      </tr>
                    ))}
                    {bulkPreview.length === 0 && (
                      <tr>
                        <td colSpan={PREVIEW_COLUMNS.length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          Add a CSV file or paste content to preview.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-muted-foreground">
                Include a header row matching the onboarding fields. Legacy columns <code>email</code> and <code>phone</code> map to
                primary contact fields. Separate multiple classes with <code>|</code> in <code>course_names</code>.
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Mobile: keep modal */}
      <SendPaymentLinkModal
        open={sendPayOpen}
        onClose={() => setSendPayOpen(false)}
        onSent={invalidateStudentData}
        presetStudentId={selected?.id}
      />

      <StudentProfileModal
        open={!!selected && isMobile}
        onClose={() => setSelected(null)}
        studentId={selected?.id ?? null}
        initialTab={profileTab}
        coursesById={coursesById}
        onEdit={(student) => {
          if (!student) return
          openEdit(mapStudentToRow(student, 0))
        }}
      />

      <Modal
        open={showLink}
        onClose={() => setShowLink(false)}
        title="Student self-onboarding link"
        description="Generate a shareable link like Google Form. Students can submit their details themselves."
        size="lg"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Shareable link</Label>
            <Input
              value={onboardingUrl ?? (generateLink.isPending ? 'Generating link…' : '')}
              readOnly
              placeholder="Click Generate link…"
              className="rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={!onboardingUrl}
              onClick={() => {
                if (!onboardingUrl) return
                navigator.clipboard?.writeText(onboardingUrl).catch(() => {})
                toast.success('Copied to clipboard.')
              }}
            >
              Copy link
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowLink(false)}>
              Close
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            This link is institute-scoped and creates a student under your institute after submission.
          </div>
        </div>
      </Modal>

      <div className={panelOpen && selected ? 'grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]' : 'grid gap-5'}>
        <div className="min-w-0">
          <StudentDataTable
            students={rows}
            total={total}
            search={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
            courses={courses}
            updatingStudentId={updatingBatchId}
            onBatchChange={handleBatchChange}
            onSetPrimaryClass={handleSetPrimaryClass}
            hideEnrollmentColumns={panelOpen && !!selected}
            selectedStudentId={panelOpen ? selected?.id ?? null : null}
            onOpen={(s) => {
              setProfileTab('payment_history')
              setSelected(s)
              setPanelOpen(true)
            }}
            onEdit={(s) => openEdit(s)}
            onDeactivate={(s) => deactivate(s)}
            onReactivate={(s) => reactivate(s)}
            onSendPaymentLink={(s) => {
              setSelected(s)
              setSendPayOpen(true)
            }}
            onDelete={(s) => removeStudent(s)}
            rowMenuItems={studentMenuItems}
            pagination={tablePagination}
          />
        </div>
        {panelOpen && selected && (
          <div className="hidden xl:block">
            <StudentProfilePanel
              studentId={selected.id}
              initialTab={profileTab}
              courses={courses}
              coursesById={coursesById}
              updatingStudentId={updatingBatchId}
              onSetPrimaryClass={(courseId) => handleSetPrimaryClass(selected, courseId)}
              onBatchChange={(courseId, enrolled) => handleBatchChange(selected, courseId, enrolled)}
              onClose={() => setPanelOpen(false)}
              onEdit={(student) => {
                if (!student) return
                openEdit(mapStudentToRow(student, 0))
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
