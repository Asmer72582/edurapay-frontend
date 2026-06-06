import { useEffect, useMemo, useState } from 'react'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import { useQueryClient } from '@tanstack/react-query'
import { Copy, Download, Link2, RefreshCw, Send } from 'lucide-react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell, StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { PaymentLinkDetailPanel } from '@/components/payments/PaymentLinkDetailPanel'
import { MonthlyInstallmentPipeline } from '@/components/payments/MonthlyInstallmentPipeline'
import { SendPaymentLinkModal } from '@/components/payments/SendPaymentLinkModal'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { SelectField } from '@/components/ui/select-field'
import { feePeriodFromPaymentRow } from '@/lib/fee-period'
import { formatInr } from '@/lib/institute-mock'
import { usePaymentLinks, usePaymentLinkStats } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'expired', label: 'Expired' },
]

function mapLink(row: Record<string, unknown>) {
  const snap = (row.student_snapshot ?? {}) as Record<string, unknown>
  const split = (row.split ?? {}) as Record<string, unknown>
  const token = String(row.public_token ?? '')
  const eduraPayPath = token ? `/pay/${token}` : ''
  const feeAmount = Number(
    row.fee_amount_inr ?? row.display_amount_inr ?? split.institute_base_inr ?? row.amount_inr ?? 0,
  )
  const received =
    String(row.status ?? '') === 'paid' || String(row.status ?? '') === 'partial' ? feeAmount : null
  return {
    id: String(row.id ?? row._id ?? ''),
    student: String(snap.name ?? '—'),
    feePeriod: feePeriodFromPaymentRow(row),
    feeAmount,
    received,
    status: String(row.status ?? 'pending'),
    publicToken: token,
    eduraPayPath,
    created: row.created_at ? String(row.created_at).slice(0, 10) : '—',
  }
}

export function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sendOpen, setSendOpen] = useState(false)
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading, isFetching } = usePaymentLinks(search, status, page, LIST_PAGE_SIZE)
  const { data: statsData } = usePaymentLinkStats()

  const pagination = useMemo(() => parsePaginated<Record<string, unknown>>(data), [data])
  const rawLinks = pagination.items
  const rows = useMemo(() => rawLinks.map(mapLink), [rawLinks])

  useEffect(() => {
    setPage(1)
  }, [search, status])
  const selectedRawLink = useMemo(
    () => rawLinks.find((r) => String(r.id ?? r._id ?? '') === selectedLinkId) ?? null,
    [rawLinks, selectedLinkId],
  )

  const stats = statsData?.data

  const tablePagination = useMemo(
    () => ({
      page: pagination.page,
      lastPage: pagination.lastPage,
      total: pagination.total,
      perPage: pagination.perPage,
      onPageChange: setPage,
      disabled: isLoading || isFetching,
    }),
    [pagination, isLoading, isFetching],
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const copyLink = (path: string) => {
    const full = `${window.location.origin}${path}`
    navigator.clipboard.writeText(full)
    toast.success('EduraPay link copied')
  }

  const openPayPage = (path: string) => {
    window.open(`${window.location.origin}${path}`, '_blank', 'noopener,noreferrer')
  }

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['payment-links'] })
    qc.invalidateQueries({ queryKey: ['payment-links-stats'] })
    qc.invalidateQueries({ queryKey: ['invoices'] })
    qc.invalidateQueries({ queryKey: ['invoices-stats'] })
  }

  const openLink = (id: string) => {
    setSelectedLinkId(id)
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setSelectedLinkId(null)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Payments' }]}
        title="Payments"
        description="Send EduraPay payment links and track pending collections."
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={invalidate}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Sync
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => toast.info('Export from payment link list via copy links')}>
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600" onClick={() => setSendOpen(true)}>
              <Link2 className="mr-1.5 h-4 w-4" />
              Send payment link
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          simple
          label="Payment links sent"
          value={String(stats?.total_links ?? 0)}
          trend={[
            `${formatInr(stats?.total_fee_assigned_inr ?? stats?.total_link_value_inr ?? 0, true)} total fee on links`,
            (stats?.expired_links ?? 0) > 0
              ? `${stats.expired_links} closed (paid via another link)`
              : null,
          ]
            .filter(Boolean)
            .join(' · ')}
          trendUp={(stats?.total_links ?? 0) > 0}
        />
        <MetricCard
          simple
          label="College received"
          value={formatInr(stats?.college_received_inr ?? stats?.college_collected_inr ?? 0, true)}
          trend={`${stats?.paid_links ?? stats?.paid ?? 0} link${(stats?.paid_links ?? stats?.paid ?? 0) === 1 ? '' : 's'} fully paid`}
          trendUp={(stats?.college_received_inr ?? stats?.college_collected_inr ?? 0) > 0}
        />
        <MetricCard
          simple
          label="College still due"
          value={formatInr(stats?.college_outstanding_inr ?? stats?.college_pending_inr ?? 0, true)}
          trend={`${stats?.open_links ?? stats?.outstanding_links ?? 0} unpaid link${(stats?.open_links ?? stats?.outstanding_links ?? 0) === 1 ? '' : 's'}${
            (stats?.partial_links ?? stats?.partial ?? 0) > 0
              ? ` (${stats.partial_links ?? stats.partial} part-paid)`
              : ''
          }`}
          trendUp={(stats?.open_links ?? stats?.outstanding_links ?? 0) === 0}
        />
        <MetricCard
          simple
          label="Fees still due"
          value={formatInr(stats?.college_outstanding_inr ?? stats?.pending_link_value_inr ?? 0, true)}
          trend={`${stats?.open_links ?? stats?.outstanding_links ?? 0} open link${(stats?.open_links ?? stats?.outstanding_links ?? 0) === 1 ? '' : 's'}`}
          trendUp={(stats?.open_links ?? stats?.outstanding_links ?? 0) === 0}
        />
      </div>

      <MonthlyInstallmentPipeline />

      <div className={panelOpen && selectedLinkId ? 'grid gap-6 lg:grid-cols-[1fr_380px]' : 'grid gap-6'}>
        <TableShell
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search students, tokens..."
          countLabel={`${pagination.total.toLocaleString('en-IN')} payment links`}
          filterSlot={
            <div className="w-[160px]">
              <SelectField
                value={status}
                onChange={setStatus}
                options={STATUS_OPTIONS}
                aria-label="Filter by status"
              />
            </div>
          }
          pagination={tablePagination}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Fee period</th>
                  <th className="px-5 py-3.5">Fee amount</th>
                  <th className="px-5 py-3.5">Received</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      Loading payment links…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      No payment links yet. Send a link to a student, multiple students, or bulk for all due balances.
                    </td>
                  </tr>
                ) : (
                  rows.map((link) => {
                    const isSelected = panelOpen && selectedLinkId === link.id
                    return (
                      <tr
                        key={link.id}
                        className={cn(
                          'cursor-pointer border-b border-border/40 transition-colors',
                          isSelected
                            ? 'border-l-[3px] border-l-violet-500 bg-violet-50/80'
                            : 'hover:bg-muted/20',
                        )}
                        onClick={() => openLink(link.id)}
                      >
                        <td className="px-5 py-4 font-medium">{link.student}</td>
                        <td className="px-5 py-4">
                          <span className="line-clamp-2 text-sm font-medium text-violet-800" title={link.feePeriod}>
                            {link.feePeriod}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold">{formatInr(link.feeAmount)}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {link.received != null ? (
                            <span className="font-medium text-emerald-800">{formatInr(link.received)}</span>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge
                            status={link.status === 'expired' ? 'Expired' : link.status}
                            variant={statusVariant(link.status)}
                          />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{link.created}</td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            {link.eduraPayPath && link.status !== 'expired' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-lg"
                                  onClick={() => copyLink(link.eduraPayPath)}
                                >
                                  <Copy className="mr-1 h-3.5 w-3.5" />
                                  Copy
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-lg text-primary"
                                  onClick={() => openPayPage(link.eduraPayPath)}
                                >
                                  <Send className="mr-1 h-3.5 w-3.5" />
                                  Open
                                </Button>
                              </>
                            )}
                            {link.status === 'expired' && (
                              <span className="text-xs text-muted-foreground">Paid elsewhere</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </TableShell>

        {panelOpen && selectedRawLink && !isMobile && (
          <PaymentLinkDetailPanel
            link={selectedRawLink}
            onClose={closePanel}
            onCopyLink={copyLink}
            onOpenLink={openPayPage}
          />
        )}
      </div>

      {panelOpen && selectedRawLink && isMobile && (
        <Modal open={panelOpen} onClose={closePanel} title="Payment link details" size="lg">
          <PaymentLinkDetailPanel
            link={selectedRawLink}
            onClose={closePanel}
            onCopyLink={copyLink}
            onOpenLink={openPayPage}
          />
        </Modal>
      )}

      <SendPaymentLinkModal open={sendOpen} onClose={() => setSendOpen(false)} onSent={invalidate} />
    </div>
  )
}
