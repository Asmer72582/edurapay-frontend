import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Link2,
  Phone,
  Search,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'
import { DefaulterDetailPanel } from '@/components/defaulters/DefaulterDetailPanel'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/label'
import {
  useDefaulters,
  useMarkDefaulterContacted,
  useSendFeeReminder,
  type DefaulterRow,
} from '@/hooks/useApi'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'edurapay.payments.unpaid_students_open'

type TabKey = 'this_month' | 'next_month' | 'overdue' | 'all'

function ymOffset(offset: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return ym
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

function statusTone(status: DefaulterRow['status'], daysOverdue: number): string {
  if (status === 'overdue') return daysOverdue > 14 ? 'overdue' : 'pending'
  if (status === 'due_soon') return 'pending'
  return 'partial'
}

function statusText(row: DefaulterRow): string {
  if (row.status === 'overdue') return row.days_overdue > 0 ? `${row.days_overdue}d overdue` : 'Overdue'
  if (row.status === 'due_soon') return 'Due soon'
  return 'Outstanding'
}

export function UnpaidStudentsPanel({
  onSendLink,
}: {
  onSendLink?: (studentId: string) => void
}) {
  const qc = useQueryClient()
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })
  const [tab, setTab] = useState<TabKey>('this_month')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [page, setPage] = useState(1)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    setPage(1)
    setSelectedKey(null)
  }, [tab, search])

  const params = useMemo(() => {
    switch (tab) {
      case 'this_month':
        return { filter: 'all', month: ymOffset(0) }
      case 'next_month':
        return { filter: 'all', month: ymOffset(1) }
      case 'overdue':
        return { filter: 'overdue' }
      case 'all':
      default:
        return { filter: 'all' }
    }
  }, [tab])

  const { data, isLoading, isFetching } = useDefaulters({
    ...params,
    search,
    page,
    per_page: 8,
    includeStats: false,
  })

  const sendReminder = useSendFeeReminder()
  const markContacted = useMarkDefaulterContacted()

  const payload = data?.data
  const rows: DefaulterRow[] = (payload?.data as DefaulterRow[] | undefined) ?? []
  const lastPage = (payload?.last_page as number | undefined) ?? 1
  const total = (payload?.total as number | undefined) ?? 0

  const selectedRow = useMemo(() => {
    if (!selectedKey) return null
    return rows.find((r) => `${r.student_id}-${r.installment_id}` === selectedKey) ?? null
  }, [rows, selectedKey])

  const openRow = (row: DefaulterRow) => {
    setSelectedKey(`${row.student_id}-${row.installment_id}`)
  }

  const closePanel = () => setSelectedKey(null)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['defaulters'] })
    qc.invalidateQueries({ queryKey: ['installments-monthly'] })
    qc.invalidateQueries({ queryKey: ['payment-links-stats'] })
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

  const handleSendLink = (row: DefaulterRow) => {
    if (onSendLink) {
      onSendLink(row.student_id)
    } else {
      toast.info('Use the "Send payment link" button to send a new link.')
    }
  }

  const handleMarkContacted = async (row: DefaulterRow) => {
    try {
      await markContacted.mutateAsync({
        student_id: row.student_id,
        installment_id: row.installment_id,
      })
      toast.success('Marked as contacted')
      invalidate()
    } catch {
      toast.error('Could not mark as contacted')
    }
  }

  const tabs: { key: TabKey; label: string; sub?: string }[] = [
    { key: 'this_month', label: 'This month', sub: monthLabel(ymOffset(0)) },
    { key: 'next_month', label: 'Next month', sub: monthLabel(ymOffset(1)) },
    { key: 'overdue', label: 'Overdue' },
    { key: 'all', label: 'All pending' },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-rose-600" />
            <CardTitle>Students with unpaid installments</CardTitle>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            See who hasn't paid this month's installment. Click any student for full details and quick actions.
          </p>
          {!open && total > 0 && (
            <p className="mt-2 text-xs text-amber-800">
              <span className="font-semibold">{total}</span> unpaid in current view — expand to see who and follow up.
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="self-start rounded-lg sm:self-center"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="unpaid-students-body"
        >
          {open ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" /> Hide
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" /> Show
            </>
          )}
        </Button>
      </CardHeader>

      {open && (
        <CardContent id="unpaid-students-body" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={tab === t.key ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.sub && (
                  <span className="ml-1 text-[10px] opacity-80">· {t.sub}</span>
                )}
              </Button>
            ))}
            <div className="relative ml-auto max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, roll, phone…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          <div
            className={cn(
              !isMobile && selectedRow ? 'grid gap-4 lg:grid-cols-[1fr_380px]' : 'grid gap-4',
            )}
          >
            <div className="overflow-x-auto rounded-xl border border-border/50">
              {isLoading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No unpaid installments in this view.
                  <br />
                  <span className="text-emerald-700">All caught up.</span>
                </div>
              ) : (
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5">Student</th>
                      <th className="px-4 py-2.5">Period</th>
                      <th className="px-4 py-2.5 text-right">Amount due</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const key = `${row.student_id}-${row.installment_id}`
                      const isSelected = selectedKey === key
                      return (
                        <tr
                          key={key}
                          className={cn(
                            'cursor-pointer border-b border-border/40 transition-colors last:border-0',
                            isSelected
                              ? 'border-l-[3px] border-l-violet-500 bg-violet-50/70 dark:bg-violet-950/30'
                              : 'hover:bg-muted/20',
                          )}
                          onClick={() => openRow(row)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium">{row.student_name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {row.roll_no ? `${row.roll_no} · ` : ''}
                              {row.collection_name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-violet-800">
                            <div className="font-medium">{row.period_label}</div>
                            {row.installment_label && row.installment_label !== row.period_label && (
                              <div className="text-[11px] text-muted-foreground">{row.installment_label}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">
                            {formatInr(row.amount_due_inr)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              status={statusText(row)}
                              variant={statusVariant(statusTone(row.status, row.days_overdue))}
                            />
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg"
                                onClick={() => remind(row)}
                                disabled={sendReminder.isPending}
                                title="Send reminder"
                              >
                                <Bell className="h-3.5 w-3.5" />
                              </Button>
                              {row.phone && (
                                <a
                                  className="inline-flex h-8 items-center rounded-lg px-2 text-xs hover:bg-muted/40"
                                  href={`tel:${row.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  title={`Call ${row.phone}`}
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg text-violet-700"
                                onClick={() => handleSendLink(row)}
                                title="Send payment link"
                              >
                                <Link2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {lastPage > 1 && (
                <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
                  <span>
                    {total.toLocaleString('en-IN')} unpaid · page {page} of {lastPage}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      disabled={page <= 1 || isFetching}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      disabled={page >= lastPage || isFetching}
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {!isMobile && selectedRow && (
              <DefaulterDetailPanel
                row={selectedRow}
                onClose={closePanel}
                onRemind={remind}
                onSendLink={handleSendLink}
                onMarkContacted={handleMarkContacted}
                remindPending={sendReminder.isPending}
              />
            )}
          </div>

          {isMobile && selectedRow && (
            <Modal open={Boolean(selectedRow)} onClose={closePanel} title="Student details" size="lg">
              <DefaulterDetailPanel
                row={selectedRow}
                onClose={closePanel}
                onRemind={remind}
                onSendLink={handleSendLink}
                onMarkContacted={handleMarkContacted}
                remindPending={sendReminder.isPending}
              />
            </Modal>
          )}
        </CardContent>
      )}
    </Card>
  )
}
