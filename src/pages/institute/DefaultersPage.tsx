import { useEffect, useMemo, useState } from 'react'
import { TablePaginationControls } from '@/components/ui/table-pagination'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { DefaulterDetailPanel } from '@/components/defaulters/DefaulterDetailPanel'
import type { CourseOption } from '@/components/dashboard/StudentDataTable'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCircle2, Link2, Phone, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { CollectionActionsMenu, type CollectionActionItem } from '@/components/courses/CollectionActionsMenu'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { SendPaymentLinkModal } from '@/components/payments/SendPaymentLinkModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { SelectField } from '@/components/ui/select-field'
import {
  useCourseOptions,
  useDefaulters,
  useMarkDefaulterContacted,
  useSendFeeReminder,
  type DefaulterRow,
} from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'

const FILTER_OPTIONS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_soon', label: 'Due in 7 days' },
  { value: 'outstanding', label: 'All outstanding' },
  { value: 'all', label: 'All unpaid' },
]

const CONTACT_OPTIONS = [
  { value: 'all', label: 'Any contact status' },
  { value: 'not_contacted', label: 'Not contacted' },
  { value: 'contacted', label: 'Contacted' },
]

function formatWhen(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusLabel(row: DefaulterRow) {
  if (row.status === 'overdue') {
    return row.days_overdue > 0 ? `${row.days_overdue}d overdue` : 'Overdue'
  }
  if (row.status === 'due_soon') return 'Due soon'
  return 'Outstanding'
}

export function DefaultersPage() {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 400)
  const [filter, setFilter] = useState('overdue')
  const [courseId, setCourseId] = useState('')
  const [contacted, setContacted] = useState('all')
  const [sendOpen, setSendOpen] = useState(false)
  const [presetStudentId, setPresetStudentId] = useState<string | undefined>()
  const [contactRow, setContactRow] = useState<DefaulterRow | null>(null)
  const [contactNotes, setContactNotes] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [page, setPage] = useState(1)

  const qc = useQueryClient()
  const { data, isLoading, isFetching, refetch } = useDefaulters({
    filter,
    course_id: courseId,
    search,
    contacted,
    page,
    per_page: LIST_PAGE_SIZE,
    includeStats: true,
  })
  const { data: coursesData } = useCourseOptions()
  const sendReminder = useSendFeeReminder()
  const markContacted = useMarkDefaulterContacted()

  const payload = data?.data
  const stats = payload?.stats
  const listPagination = useMemo(
    () =>
      parsePaginated<DefaulterRow>({
        data: payload
          ? {
              data: payload.data ?? [],
              current_page: payload.current_page ?? 1,
              last_page: payload.last_page ?? 1,
              per_page: payload.per_page ?? LIST_PAGE_SIZE,
              total: payload.total ?? 0,
            }
          : undefined,
      }),
    [payload],
  )
  const rows = listPagination.items

  const tablePagination = useMemo(
    () => ({
      page: listPagination.page,
      lastPage: listPagination.lastPage,
      total: listPagination.total,
      perPage: listPagination.perPage,
      onPageChange: setPage,
      disabled: isLoading || isFetching,
    }),
    [listPagination, isLoading, isFetching],
  )

  useEffect(() => {
    setPage(1)
  }, [search, filter, courseId, contacted])

  const collectionOptions = useMemo(() => {
    const list = [{ value: '', label: 'All collections' }]
    const courses = (coursesData?.data?.data ?? []) as Record<string, unknown>[]
    for (const c of courses) {
      if ((c.status ?? 'active') === 'archived') continue
      const id = String(c.id ?? c._id ?? '')
      const label = String(c.grade ?? c.name ?? 'Collection')
      list.push({ value: id, label })
    }
    return list
  }, [coursesData])

  const coursesById = useMemo(() => {
    const map = new Map<string, CourseOption>()
    const courses = (coursesData?.data?.data ?? []) as Record<string, unknown>[]
    for (const c of courses) {
      const id = String(c.id ?? c._id ?? '')
      if (!id) continue
      map.set(id, { id, name: String(c.grade ?? c.name ?? 'Collection') })
    }
    return map
  }, [coursesData])

  const selectedRow = useMemo(() => {
    if (!selectedKey) return null
    return rows.find((r) => `${r.student_id}-${r.installment_id}` === selectedKey) ?? null
  }, [rows, selectedKey])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    if (selectedKey && !rows.some((r) => `${r.student_id}-${r.installment_id}` === selectedKey)) {
      setSelectedKey(null)
      setPanelOpen(false)
    }
  }, [rows, selectedKey])

  const openRow = (row: DefaulterRow) => {
    const key = `${row.student_id}-${row.installment_id}`
    setSelectedKey(key)
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setSelectedKey(null)
  }

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['defaulters'] })
    qc.invalidateQueries({ queryKey: ['defaulters-stats'] })
    qc.invalidateQueries({ queryKey: ['fee-reminders-logs'] })
  }

  const remind = async (row: DefaulterRow) => {
    try {
      const res = await sendReminder.mutateAsync({
        student_id: row.student_id,
        installment_id: row.installment_id,
      })
      toast.success(res.message ?? 'Reminder sent')
      invalidate()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not send reminder')
    }
  }

  const openSendLink = (row: DefaulterRow) => {
    setPresetStudentId(row.student_id)
    setSendOpen(true)
  }

  const submitContacted = async () => {
    if (!contactRow) return
    try {
      await markContacted.mutateAsync({
        student_id: contactRow.student_id,
        installment_id: contactRow.installment_id,
        notes: contactNotes.trim() || undefined,
      })
      toast.success('Marked as contacted')
      setContactRow(null)
      setContactNotes('')
      invalidate()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr.response?.data?.message ?? 'Could not save')
    }
  }

  const rowActions = (row: DefaulterRow): CollectionActionItem[] => [
    {
      id: 'remind',
      label: 'Send reminder',
      icon: Bell,
      onClick: () => remind(row),
    },
    {
      id: 'link',
      label: 'Send payment link',
      icon: Link2,
      onClick: () => openSendLink(row),
    },
    {
      id: 'contact',
      label: row.contacted_at ? 'Mark contacted again' : 'Mark contacted',
      icon: row.contacted_at ? CheckCircle2 : Phone,
      onClick: () => {
        setContactRow(row)
        setContactNotes('')
      },
    },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Defaulters' }]}
        title="Defaulters"
        description="Past-due installments by student and collection. Paying an installment clears it; due today is not overdue until tomorrow."
        actions={
          <Button variant="outline" className="rounded-xl" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Overdue amount"
          value={formatInr(stats?.overdue_amount_inr ?? 0, true)}
          trend={`${stats?.overdue_students ?? 0} students · ${stats?.overdue_rows ?? 0} installments`}
          trendUp={(stats?.overdue_rows ?? 0) === 0}
        />
        <MetricCard
          label="Due in 7 days"
          value={formatInr(stats?.due_soon_amount_inr ?? 0, true)}
          trend={`${stats?.due_soon_rows ?? 0} installments`}
        />
        <MetricCard
          label="Reminders (7d)"
          value={String(stats?.reminders_sent_7d ?? 0)}
          trend="Email, SMS, WhatsApp"
        />
        <MetricCard
          label="Contacted (7d)"
          value={String(stats?.contacted_7d ?? 0)}
          trend="Staff follow-ups logged"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1">
          <Label className="text-xs text-slate-500">Search</Label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="Student, roll, collection, period…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Label className="text-xs text-slate-500">Status</Label>
          <SelectField className="mt-1" value={filter} onChange={setFilter} options={FILTER_OPTIONS} />
        </div>
        <div className="w-full sm:w-52">
          <Label className="text-xs text-slate-500">Collection</Label>
          <SelectField className="mt-1" value={courseId} onChange={setCourseId} options={collectionOptions} />
        </div>
        <div className="w-full sm:w-48">
          <Label className="text-xs text-slate-500">Contact</Label>
          <SelectField className="mt-1" value={contacted} onChange={setContacted} options={CONTACT_OPTIONS} />
        </div>
        <div className="flex w-full items-end justify-end sm:ml-auto sm:w-auto">
          <TablePaginationControls {...tablePagination} />
        </div>
      </div>

      <div
        className={cn(
          'grid gap-6',
          panelOpen && selectedRow && !isMobile && 'lg:grid-cols-[1fr_380px]',
        )}
      >
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Collection</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-right">Due</th>
                <th className="px-4 py-3">Last reminder</th>
                <th className="px-4 py-3">Last link</th>
                <th className="px-4 py-3">Contacted</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Loading defaulters…
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No matching outstanding fees. Try changing filters.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const key = `${row.student_id}-${row.installment_id}`
                const isSelected = panelOpen && selectedKey === key
                return (
                <tr
                  key={key}
                  className={cn(
                    'cursor-pointer border-b border-slate-50 transition-colors hover:bg-violet-50/30',
                    isSelected && 'bg-violet-50/80',
                  )}
                  onClick={() => openRow(row)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{row.student_name}</div>
                    {row.roll_no ? (
                      <div className="text-xs text-slate-500">{row.roll_no}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.collection_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800">{row.period_label || '—'}</div>
                    <div className="text-xs text-slate-500">Due {formatWhen(row.due_date)}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold tabular-nums text-slate-900">
                      {formatInr(row.amount_due_inr, true)}
                    </div>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge
                        status={statusLabel(row)}
                        variant={statusVariant(
                          row.status === 'overdue' ? 'overdue' : row.status === 'due_soon' ? 'pending' : 'partial',
                        )}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div>{formatWhen(row.last_reminder_at)}</div>
                    {row.last_reminder_channels?.length > 0 ? (
                      <div className="mt-0.5 text-slate-400">{row.last_reminder_channels.join(', ')}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div>{formatWhen(row.last_payment_link_at)}</div>
                    {row.last_payment_link_status ? (
                      <div className="mt-0.5 capitalize text-slate-400">{row.last_payment_link_status}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {row.contacted_at ? (
                      <span className="text-emerald-700">{formatWhen(row.contacted_at)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <CollectionActionsMenu items={rowActions(row)} />
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {panelOpen && selectedRow && !isMobile && (
        <DefaulterDetailPanel
          row={selectedRow}
          coursesById={coursesById}
          onClose={closePanel}
          onRemind={remind}
          onSendLink={openSendLink}
          onMarkContacted={(r) => {
            setContactRow(r)
            setContactNotes('')
          }}
          remindPending={sendReminder.isPending}
        />
      )}
      </div>

      {panelOpen && selectedRow && isMobile && (
        <Modal open={panelOpen} onClose={closePanel} title="Defaulter details" size="lg">
          <DefaulterDetailPanel
            row={selectedRow}
            coursesById={coursesById}
            onClose={closePanel}
            onRemind={remind}
            onSendLink={openSendLink}
            onMarkContacted={(r) => {
              setContactRow(r)
              setContactNotes('')
            }}
            remindPending={sendReminder.isPending}
          />
        </Modal>
      )}

      <SendPaymentLinkModal
        open={sendOpen}
        onClose={() => {
          setSendOpen(false)
          setPresetStudentId(undefined)
        }}
        onSent={() => {
          invalidate()
          qc.invalidateQueries({ queryKey: ['payment-links'] })
        }}
        presetStudentId={presetStudentId}
        presetCourseId={courseId || undefined}
      />

      <Modal
        open={!!contactRow}
        onClose={() => {
          setContactRow(null)
          setContactNotes('')
        }}
        title="Mark as contacted"
      >
        {contactRow ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{contactRow.student_name}</span>
              {' · '}
              {contactRow.collection_name} · {contactRow.period_label}
            </p>
            <div>
              <Label htmlFor="contact-notes">Notes (optional)</Label>
              <Input
                id="contact-notes"
                className="mt-1 rounded-xl"
                placeholder="Called parent, will pay Friday…"
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setContactRow(null)}>
                Cancel
              </Button>
              <Button
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
                disabled={markContacted.isPending}
                onClick={submitContacted}
              >
                {markContacted.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
