import { useEffect, useMemo, useRef, useState } from 'react'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import { useQueryClient } from '@tanstack/react-query'
import { BookOpen, CalendarRange, Loader2, Pencil, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell, StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { CourseDetailsPanel } from '@/pages/institute/CourseDetailsPanel'
import { CollectionActionsMenu, collectionActionIcons, type CollectionActionItem } from '@/components/courses/CollectionActionsMenu'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'
import { CourseFeeBuilder, type CourseFeeBuilderRef } from '@/components/courses/CourseFeeBuilder'
import { AcademicYearRolloverWizard } from '@/components/courses/AcademicYearRolloverWizard'
import {
  useAssignCollectionToAll,
  useAssignCollectionToClass,
  useCoursesDashboard,
  useCreateCourse,
  useDeleteCollection,
  useDuplicateCollection,
  useUnassignCollectionFromAll,
  useUnassignCollectionFromClass,
  useUpdateCourse,
  useUpsertFeePlan,
} from '@/hooks/useApi'
import {
  ACTIVE_COLLECTIONS,
  ADD_COLLECTION,
  COLLECTION_NAME_LABEL,
  COLLECTION_NAME_HINT,
  COLLECTION_NAME_PLACEHOLDER,
  EDIT_COLLECTION,
  FEE_COLLECTIONS_DESCRIPTION,
  FEE_COLLECTIONS_TITLE,
  SAVE_COLLECTION_AND_FEES,
  SEARCH_COLLECTIONS,
} from '@/lib/fee-collections'

type Course = {
  id?: string
  _id?: string
  name: string
  grade?: string
  description?: string
  status?: string
  students_count?: number
  fee_total?: number
  fee_plan_name?: string
  fee_installments?: number
  has_fee_plan?: boolean
}

function toId(c: any) {
  return String(c?.id ?? c?._id ?? '')
}

export function CoursesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'inactive'>('all')
  const [selected, setSelected] = useState<Course | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<'details' | 'fees'>('fees')
  const [isMobile, setIsMobile] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [showRollover, setShowRollover] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState({ course_grade: '', description: '', status: 'active' as 'active' | 'inactive' | 'archived' })

  const [page, setPage] = useState(1)
  const [bulkAction, setBulkAction] = useState<{ courseId: string; label: string } | null>(null)
  const { data: dashboardData, isLoading, isFetching } = useCoursesDashboard(
    search,
    page,
    LIST_PAGE_SIZE,
    statusFilter,
  )
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const upsertFeePlan = useUpsertFeePlan()
  const assignAll = useAssignCollectionToAll()
  const assignToClass = useAssignCollectionToClass()
  const unassignAll = useUnassignCollectionFromAll()
  const unassignFromClass = useUnassignCollectionFromClass()
  const duplicateCollection = useDuplicateCollection()
  const deleteCollection = useDeleteCollection()
  const feeBuilderRef = useRef<CourseFeeBuilderRef>(null)

  const refreshCollections = () => {
    qc.invalidateQueries({ queryKey: ['courses-dashboard'] })
    qc.invalidateQueries({ queryKey: ['courses'] })
    qc.invalidateQueries({ queryKey: ['students'] })
    qc.invalidateQueries({ queryKey: ['fee-plans'] })
    qc.invalidateQueries({ queryKey: ['students-stats'] })
    qc.invalidateQueries({ queryKey: ['dashboard', 'institute'] })
  }

  const openPanel = (c: Course, tab: 'details' | 'fees' = 'fees') => {
    setSelected(c)
    setPanelTab(tab)
    setPanelOpen(true)
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  const coursePagination = useMemo(
    () => parsePaginated<Course>({ data: dashboardData?.data?.courses }),
    [dashboardData],
  )
  const filtered = coursePagination.items

  const tablePagination = useMemo(
    () => ({
      page: coursePagination.page,
      lastPage: coursePagination.lastPage,
      total: coursePagination.total,
      perPage: coursePagination.perPage,
      onPageChange: setPage,
      disabled: isLoading || isFetching,
    }),
    [coursePagination, isLoading, isFetching],
  )

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const activeCourses = filtered.filter((c) => (c.status ?? 'active') === 'active').length
  const archivedCourses = filtered.filter((c) => (c.status ?? 'active') === 'archived').length
  const feeConfigured = filtered.filter((c) => c.has_fee_plan).length
  const enrolledStudents = dashboardData?.data?.stats?.enrolled_students ?? 0

  const classCollections = useMemo(() => {
    const items = (dashboardData?.data?.course_options ?? []) as Course[]
    return items.filter((c) => (c.status ?? 'active') === 'active')
  }, [dashboardData])

  const studentsByClassId = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of classCollections) {
      counts.set(toId(c), c.students_count ?? 0)
    }
    for (const c of filtered) {
      const id = toId(c)
      if (!counts.has(id)) {
        counts.set(id, c.students_count ?? 0)
      }
    }
    return counts
  }, [classCollections, filtered])

  const openAdd = () => {
    setEditing(null)
    setForm({ course_grade: '', description: '', status: 'active' })
    setShowForm(true)
  }

  const openEdit = (c: Course) => {
    setEditing(c)
    setForm({
      course_grade: (c.grade ?? c.name ?? '') as string,
      description: c.description ?? '',
      status: (c.status as any) ?? 'active',
    })
    setShowForm(true)
  }

  const submit = async () => {
    try {
      if (editing) {
        const res = await updateCourse.mutateAsync({
          id: toId(editing),
          payload: {
            name: form.course_grade,
            grade: form.course_grade,
            description: form.description || null,
            status: form.status,
          },
        })
        const updated = (res as any)?.data?.course ?? null
        if (updated) {
          setSelected((prev) => (prev && toId(prev) === toId(updated) ? updated : prev))
        }
        qc.invalidateQueries({ queryKey: ['courses'] })
        toast.success('Collection updated.')
      } else {
        if (feeBuilderRef.current?.hasFeeConfigured() && !feeBuilderRef.current.validate()) {
          return
        }

        const res = await createCourse.mutateAsync({
          name: form.course_grade,
          grade: form.course_grade,
          description: form.description || null,
          status: form.status,
        })
        const created = (res as any)?.data?.course ?? null
        const courseId = created ? toId(created) : ''

        if (created && courseId && feeBuilderRef.current?.hasFeeConfigured()) {
          const payload = feeBuilderRef.current.getPayload(courseId, form.course_grade.trim())
          if (payload) {
            await upsertFeePlan.mutateAsync(payload)
            qc.invalidateQueries({ queryKey: ['fee-plans'] })
          }
        }

        qc.invalidateQueries({ queryKey: ['courses'] })
        if (created) {
          openPanel(created, 'fees')
        }
        toast.success(
          created && feeBuilderRef.current?.hasFeeConfigured()
            ? 'Collection and fee structure created.'
            : 'Collection created.',
        )
      }
      setShowForm(false)
    } catch {
      toast.error('Failed to save collection.')
    }
  }

  const setCourseStatus = async (c: Course, status: 'active' | 'archived') => {
    try {
      const res = await updateCourse.mutateAsync({ id: toId(c), payload: { status } })
      const updated = (res as any)?.data?.course ?? { ...c, status }
      qc.setQueryData(['courses', search, 50], (old: any) => {
        if (!old?.data?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((row: Course) => (toId(row) === toId(c) ? { ...row, ...updated } : row)),
          },
        }
      })
      if (selected && toId(selected) === toId(c)) {
        setSelected({ ...selected, ...updated })
      }
      qc.invalidateQueries({ queryKey: ['courses'] })
      toast.success(status === 'active' ? 'Collection is now live.' : 'Collection archived.')
    } catch {
      toast.error('Failed to update collection status.')
    }
  }

  const handleAssignAll = async (c: Course) => {
    if (!c.has_fee_plan) {
      toast.error('Configure fees for this collection before assigning to students.')
      openPanel(c, 'fees')
      return
    }
    if (!window.confirm(`Assign "${c.grade ?? c.name}" to all active students? New fee installments will be created where applicable.`)) {
      return
    }
    const courseId = toId(c)
    const toastId = toast.loading('Assigning to all active students…')
    setBulkAction({ courseId, label: `Assigning "${c.grade ?? c.name}" to all students…` })
    try {
      const res = await assignAll.mutateAsync(courseId)
      const stats = res.data?.stats
      toast.success(
        res.message ??
          `Assigned to ${stats?.assigned ?? 0} student(s)${stats?.already_enrolled ? ` (${stats.already_enrolled} already had it)` : ''}.`,
        { id: toastId },
      )
      refreshCollections()
      if (res.data?.course) setSelected(res.data.course as Course)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not assign collection to all students.', { id: toastId })
    } finally {
      setBulkAction(null)
    }
  }

  const handleAssignToClass = async (c: Course, source: Course) => {
    if (!c.has_fee_plan) {
      toast.error('Configure fees for this collection before assigning to students.')
      openPanel(c, 'fees')
      return
    }
    const classLabel = source.grade ?? source.name
    const count = studentsByClassId.get(toId(source)) ?? 0
    if (
      !window.confirm(
        `Assign "${c.grade ?? c.name}" to all ${count} student(s) in ${classLabel}? New fee installments will be created where applicable.`,
      )
    ) {
      return
    }
    const courseId = toId(c)
    const toastId = toast.loading(`Assigning to students in ${classLabel}…`)
    setBulkAction({ courseId, label: `Assigning "${c.grade ?? c.name}" to ${classLabel}…` })
    try {
      const res = await assignToClass.mutateAsync({ id: courseId, sourceCourseId: toId(source) })
      const stats = res.data?.stats
      toast.success(
        res.message ??
          `Assigned to ${stats?.assigned ?? 0} student(s) in ${classLabel}${stats?.already_enrolled ? ` (${stats.already_enrolled} already had it)` : ''}.`,
        { id: toastId },
      )
      refreshCollections()
      if (res.data?.course) setSelected(res.data.course as Course)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not assign collection to this class.', { id: toastId })
    } finally {
      setBulkAction(null)
    }
  }

  const handleUnassignAll = async (c: Course) => {
    if (!window.confirm(`Remove "${c.grade ?? c.name}" from every student? Unpaid installments for this collection will be cleared.`)) {
      return
    }
    const courseId = toId(c)
    const toastId = toast.loading('Removing collection from all students…')
    setBulkAction({ courseId, label: `Removing "${c.grade ?? c.name}" from all students…` })
    try {
      const res = await unassignAll.mutateAsync(courseId)
      toast.success(res.message ?? 'Collection removed from all students.', { id: toastId })
      refreshCollections()
      if (res.data?.course) setSelected(res.data.course as Course)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not unassign collection.', { id: toastId })
    } finally {
      setBulkAction(null)
    }
  }

  const handleUnassignFromClass = async (c: Course, source: Course) => {
    const classLabel = source.grade ?? source.name
    if (
      !window.confirm(
        `Remove "${c.grade ?? c.name}" from students in ${classLabel} only? Unpaid installments for this collection will be cleared for those students.`,
      )
    ) {
      return
    }
    const courseId = toId(c)
    const toastId = toast.loading(`Removing from students in ${classLabel}…`)
    setBulkAction({ courseId, label: `Removing "${c.grade ?? c.name}" from ${classLabel}…` })
    try {
      const res = await unassignFromClass.mutateAsync({ id: courseId, sourceCourseId: toId(source) })
      toast.success(res.message ?? `Collection removed from students in ${classLabel}.`, { id: toastId })
      refreshCollections()
      if (res.data?.course) setSelected(res.data.course as Course)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not unassign collection from this class.', { id: toastId })
    } finally {
      setBulkAction(null)
    }
  }

  const handleDuplicate = async (c: Course) => {
    try {
      const res = await duplicateCollection.mutateAsync(toId(c))
      toast.success(res.message ?? 'Collection duplicated.')
      refreshCollections()
      const copy = res.data?.course as Course | undefined
      if (copy) openPanel(copy, 'fees')
    } catch {
      toast.error('Could not duplicate collection.')
    }
  }

  const handleDelete = async (c: Course) => {
    if (
      !window.confirm(
        `Delete "${c.grade ?? c.name}" permanently? This cannot be undone. Collections with paid student fees cannot be deleted.`,
      )
    ) {
      return
    }
    try {
      await deleteCollection.mutateAsync(toId(c))
      toast.success('Collection deleted.')
      if (selected && toId(selected) === toId(c)) {
        setPanelOpen(false)
        setSelected(null)
      }
      refreshCollections()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not delete collection.')
    }
  }

  const quickActions = (c: Course): CollectionActionItem[] => {
    const isArchived = (c.status ?? 'active') === 'archived'
    const busy =
      bulkAction !== null ||
      assignAll.isPending ||
      assignToClass.isPending ||
      unassignAll.isPending ||
      unassignFromClass.isPending ||
      duplicateCollection.isPending ||
      deleteCollection.isPending

    const targetId = toId(c)
    const assignClassTargets = classCollections.filter((source) => toId(source) !== targetId)

    const items: CollectionActionItem[] = [
      {
        id: 'open',
        label: 'View details',
        icon: collectionActionIcons.open,
        onClick: () => openPanel(c, 'details'),
      },
      {
        id: 'edit',
        label: 'Edit collection',
        icon: collectionActionIcons.edit,
        onClick: () => openEdit(c),
      },
      {
        id: 'fees',
        label: 'Configure fees',
        icon: collectionActionIcons.fees,
        onClick: () => openPanel(c, 'fees'),
      },
      {
        id: 'assign-all',
        label: 'Assign to all students',
        icon: collectionActionIcons.assignAll,
        disabled: busy || isArchived,
        ...(assignClassTargets.length > 0
          ? {
              children: [
                {
                  id: 'assign-all-direct',
                  label: 'All active students',
                  icon: collectionActionIcons.assignAll,
                  disabled: busy || isArchived,
                  onClick: () => handleAssignAll(c),
                },
                ...assignClassTargets.map((source) => {
                  const sourceId = toId(source)
                  const label = String(source.grade ?? source.name)
                  const count = studentsByClassId.get(sourceId) ?? 0
                  return {
                    id: `assign-class-${sourceId}`,
                    label: `Entire ${label}`,
                    icon: collectionActionIcons.assignClass,
                    hint: count > 0 ? `${count}` : '0',
                    disabled: busy || isArchived || count === 0,
                    onClick: () => handleAssignToClass(c, source),
                  }
                }),
              ],
            }
          : { onClick: () => handleAssignAll(c) }),
      },
      {
        id: 'unassign-all',
        label: 'Unassign from all',
        icon: collectionActionIcons.unassignAll,
        disabled: busy || (c.students_count ?? 0) === 0,
        ...(assignClassTargets.length > 0 && (c.students_count ?? 0) > 0
          ? {
              children: [
                {
                  id: 'unassign-all-direct',
                  label: 'All enrolled students',
                  icon: collectionActionIcons.unassignAll,
                  disabled: busy || (c.students_count ?? 0) === 0,
                  onClick: () => handleUnassignAll(c),
                },
                ...assignClassTargets.map((source) => {
                  const sourceId = toId(source)
                  const label = String(source.grade ?? source.name)
                  const count = studentsByClassId.get(sourceId) ?? 0
                  return {
                    id: `unassign-class-${sourceId}`,
                    label: `From ${label} only`,
                    icon: collectionActionIcons.unassignClass,
                    hint: count > 0 ? `${count}` : '0',
                    disabled: busy || count === 0,
                    onClick: () => handleUnassignFromClass(c, source),
                  }
                }),
              ],
            }
          : { onClick: () => handleUnassignAll(c) }),
      },
      {
        id: 'duplicate',
        label: 'Duplicate collection',
        icon: collectionActionIcons.duplicate,
        disabled: busy,
        onClick: () => handleDuplicate(c),
      },
      isArchived
        ? {
            id: 'unarchive',
            label: 'Restore (unarchive)',
            icon: collectionActionIcons.unarchive,
            onClick: () => setCourseStatus(c, 'active'),
          }
        : {
            id: 'archive',
            label: 'Archive collection',
            icon: collectionActionIcons.archive,
            onClick: () => setCourseStatus(c, 'archived'),
          },
      {
        id: 'delete',
        label: 'Delete collection',
        icon: collectionActionIcons.delete,
        destructive: true,
        disabled: busy,
        onClick: () => handleDelete(c),
      },
    ]

    return items
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: FEE_COLLECTIONS_TITLE }]}
        title={FEE_COLLECTIONS_TITLE}
        description={FEE_COLLECTIONS_DESCRIPTION}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setShowRollover(true)}>
              <CalendarRange className="mr-1.5 h-4 w-4" />
              Start new year
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20" onClick={openAdd}>
              <Plus className="mr-1.5 h-4 w-4" />
              {ADD_COLLECTION}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={ACTIVE_COLLECTIONS}
          value={String(coursePagination.total)}
          trend={statusFilter === 'all' ? 'All collections' : `${statusFilter} filter`}
          trendUp
        />
        <MetricCard
          label="Enrolled students"
          value={String(enrolledStudents)}
          trend="Students linked to a collection"
          trendUp={enrolledStudents > 0}
        />
        <MetricCard label="Fee plans configured" value={String(feeConfigured)} trend={`${archivedCourses} archived`} trendUp={feeConfigured > 0} />
        <MetricCard label="Installments supported" value="1–24" trend="Flexible distributions" trendUp />
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? EDIT_COLLECTION : ADD_COLLECTION}
        description={editing ? 'Update name, status, or description.' : 'Set a name, then define total amount and installments.'}
        size={editing ? 'md' : 'lg'}
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={
                (editing ? updateCourse.isPending : createCourse.isPending || upsertFeePlan.isPending) ||
                !form.course_grade.trim()
              }
              className="min-w-[140px] rounded-lg bg-violet-600 font-semibold hover:bg-violet-700"
            >
              {editing
                ? updateCourse.isPending
                  ? 'Saving…'
                  : 'Save changes'
                : createCourse.isPending || upsertFeePlan.isPending
                  ? 'Saving…'
                  : SAVE_COLLECTION_AND_FEES}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {COLLECTION_NAME_LABEL}
              </Label>
              <Input
                className="h-10 rounded-lg"
                value={form.course_grade}
                onChange={(e) => setForm({ ...form, course_grade: e.target.value })}
                placeholder={COLLECTION_NAME_PLACEHOLDER}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' | 'archived' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description <span className="font-normal text-muted-foreground/70">(optional)</span>
            </Label>
            <textarea
              rows={2}
              className="flex min-h-[72px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Notes for staff (not shown to students)"
            />
          </div>

          {!editing && (
            <div className="border-t border-border/60 pt-5">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fee structure</h3>
                <span className="text-[11px] text-muted-foreground">Amount · line items · installments</span>
              </div>
              <CourseFeeBuilder ref={feeBuilderRef} courseGrade={form.course_grade} showSaveButton={false} compact />
            </div>
          )}
        </div>
      </Modal>

      {/* Mobile: course details in modal */}
      {panelOpen && selected && isMobile && (
        <Modal open={panelOpen} onClose={() => setPanelOpen(false)} title={selected.name} description="Collection details & fee structure" size="xl">
          <CourseDetailsPanel course={selected} initialTab={panelTab} onClose={() => setPanelOpen(false)} />
        </Modal>
      )}

      <div className={panelOpen && selected ? 'grid gap-6 lg:grid-cols-[1fr_420px]' : 'grid gap-6'}>
        <div className="relative min-w-0">
          {bulkAction && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-[1px]">
              <div className="mx-4 flex max-w-sm items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-lg">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-violet-600" />
                <p className="text-sm font-medium text-foreground">{bulkAction.label}</p>
              </div>
            </div>
          )}
          <TableShell
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={SEARCH_COLLECTIONS}
            countLabel={`${coursePagination.total.toLocaleString('en-IN')} collections`}
            pagination={tablePagination}
            filterSlot={
              <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'active', label: 'Active' },
                    { id: 'archived', label: 'Archived' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      statusFilter === tab.id
                        ? 'bg-white text-violet-700 shadow-sm dark:bg-card'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            }
          >
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[36%]" />
                <col className="w-[12%]" />
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border/60 bg-muted/25 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Collection</th>
                  <th className="px-5 py-3.5">Students</th>
                  <th className="px-5 py-3.5">Fee plan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td className="px-5 py-4" colSpan={5}>
                        <div className="flex animate-pulse items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 rounded bg-muted" />
                            <div className="h-3 w-48 rounded bg-muted" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        {coursePagination.total === 0
                          ? 'No collections yet. Add tuition, exam fees, ID card, books, or any fee type your institute collects.'
                          : 'No collections match this filter.'}
                      </p>
                      {coursePagination.total === 0 && (
                        <Button className="mt-4 rounded-lg bg-violet-600 font-semibold" onClick={openAdd}>
                          {ADD_COLLECTION}
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const isSelected = panelOpen && selected && toId(selected) === toId(c)
                    const archived = (c.status ?? 'active') === 'archived'
                    const inactive = c.status === 'inactive'
                    const statusKey = archived ? 'archived' : inactive ? 'inactive' : 'active'

                    return (
                      <tr
                        key={toId(c)}
                        className={cn(
                          'cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/20',
                          isSelected && 'bg-violet-50/80 dark:bg-violet-950/20',
                        )}
                        onClick={() => openPanel(c, 'fees')}
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/40">
                              <BookOpen className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="truncate font-bold text-foreground">{c.grade ?? c.name}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                {c.description?.trim() || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                            {bulkAction?.courseId === toId(c) ? (
                              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                            ) : (
                              <Users className="h-4 w-4 text-muted-foreground" />
                            )}
                            {c.students_count ?? 0}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {c.has_fee_plan ? (
                            <div>
                              <div className="font-bold tabular-nums">{formatInr(Number(c.fee_total ?? 0))}</div>
                              <div className="text-xs text-muted-foreground">
                                {c.fee_installments ?? 0} installments
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="text-sm font-semibold text-violet-600 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                openPanel(c, 'fees')
                              }}
                            >
                              Configure fees
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge
                            status={archived ? 'Archived' : statusKey === 'active' ? 'Live' : 'Inactive'}
                            variant={statusVariant(archived ? 'neutral' : statusKey === 'active' ? 'success' : 'warning')}
                          />
                        </td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg"
                              onClick={() => openEdit(c)}
                              aria-label="Edit collection"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <CollectionActionsMenu items={quickActions(c)} />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </TableShell>
        </div>

        {panelOpen && selected && !isMobile && (
          <div className="hidden min-w-0 lg:block">
            <CourseDetailsPanel course={selected} initialTab={panelTab} onClose={() => setPanelOpen(false)} />
          </div>
        )}
      </div>

      <AcademicYearRolloverWizard
        open={showRollover}
        onClose={() => setShowRollover(false)}
        onComplete={refreshCollections}
      />
    </div>
  )
}
