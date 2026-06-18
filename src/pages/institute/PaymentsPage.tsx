import { useEffect, useMemo, useState } from 'react'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import { useQueryClient } from '@tanstack/react-query'
import { Banknote, Copy, Download, Link2, Loader2, RefreshCw, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell, StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { PaymentLinkDetailPanel } from '@/components/payments/PaymentLinkDetailPanel'
import { TransactionDetailPanel } from '@/components/payments/TransactionDetailPanel'
import { RecordOfflinePaymentModal } from '@/components/payments/RecordOfflinePaymentModal'
import { SendPaymentLinkModal } from '@/components/payments/SendPaymentLinkModal'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { SelectField } from '@/components/ui/select-field'
import { feePeriodFromPaymentRow, formatFeePeriodDisplay } from '@/lib/fee-period'
import { formatInr } from '@/lib/institute-mock'
import { usePaymentTransactions, usePaymentsDashboard } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'expired', label: 'Expired' },
]

const HISTORY_CHANNEL_OPTIONS = [
  { value: 'all', label: 'All payments' },
  { value: 'online', label: 'Paid online' },
  { value: 'offline', label: 'Paid direct' },
]

function mapPaymentHistory(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ''),
    transactionId: String(row.transaction_id ?? '—'),
    student: String(row.student_name ?? '—'),
    rollNo: String(row.student_roll_no ?? ''),
    feePeriod: formatFeePeriodDisplay(String(row.fee_period_display ?? '—')),
    amount: Number(row.fee_amount_inr ?? row.college_received_inr ?? row.amount ?? 0),
    statusLabel: String(row.status_label ?? row.status ?? ''),
    channel: String(row.channel ?? ''),
    methodLabel: String(row.method_label ?? row.gateway ?? ''),
    created: row.created_at
      ? new Date(String(row.created_at)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
  }
}

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
  const [offlineOpen, setOfflineOpen] = useState(false)
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [page, setPage] = useState(1)
  const [historySearch, setHistorySearch] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyChannel, setHistoryChannel] = useState('all')
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [txPanelOpen, setTxPanelOpen] = useState(false)
  const qc = useQueryClient()

  const { data: dashboardData, isLoading, isFetching } = usePaymentsDashboard(
    search,
    status,
    page,
    LIST_PAGE_SIZE,
  )

  const { data: historyData, isLoading: historyLoading, isFetching: historyFetching } = usePaymentTransactions(
    historySearch,
    'completed',
    'capture',
    historyPage,
    LIST_PAGE_SIZE,
    historyChannel,
  )

  const pagination = useMemo(
    () => parsePaginated<Record<string, unknown>>({ data: dashboardData?.data?.payment_links }),
    [dashboardData],
  )
  const rawLinks = pagination.items
  const rows = useMemo(() => rawLinks.map(mapLink), [rawLinks])

  const historyPagination = useMemo(() => parsePaginated<Record<string, unknown>>(historyData), [historyData])
  const historyRows = useMemo(
    () => historyPagination.items.map(mapPaymentHistory),
    [historyPagination.items],
  )

  const historyTablePagination = useMemo(
    () => ({
      page: historyPagination.page,
      lastPage: historyPagination.lastPage,
      total: historyPagination.total,
      perPage: historyPagination.perPage,
      onPageChange: setHistoryPage,
      disabled: historyLoading || historyFetching,
    }),
    [historyPagination, historyLoading, historyFetching],
  )

  useEffect(() => {
    setPage(1)
  }, [search, status])

  useEffect(() => {
    setHistoryPage(1)
  }, [historySearch, historyChannel])
  const selectedRawLink = useMemo(
    () => rawLinks.find((r) => String(r.id ?? r._id ?? '') === selectedLinkId) ?? null,
    [rawLinks, selectedLinkId],
  )

  const stats = dashboardData?.data?.stats

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
    qc.invalidateQueries({ queryKey: ['payments-dashboard'] })
    qc.invalidateQueries({ queryKey: ['payment-links'] })
    qc.invalidateQueries({ queryKey: ['payment-links-stats'] })
    qc.invalidateQueries({ queryKey: ['installments-monthly'] })
    qc.invalidateQueries({ queryKey: ['invoices'] })
    qc.invalidateQueries({ queryKey: ['invoices-stats'] })
    qc.invalidateQueries({ queryKey: ['payment-transactions'] })
    qc.invalidateQueries({ queryKey: ['payment-transactions-stats'] })
    qc.invalidateQueries({ queryKey: ['dashboard', 'institute'] })
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
        description="Send payment links and see what’s collected vs still pending."
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
            <Button variant="outline" className="rounded-xl" onClick={() => setOfflineOpen(true)}>
              <Banknote className="mr-1.5 h-4 w-4" />
              Record offline payment
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
          label="Total fees"
          value={formatInr(stats?.total_fees_assigned_inr ?? 0)}
          trend="All enrolled students"
          trendUp={(stats?.total_fees_assigned_inr ?? 0) > 0}
        />
        <MetricCard
          simple
          label="Collected"
          value={formatInr(stats?.fee_collected_inr ?? 0)}
          trend="Received so far"
          trendUp={(stats?.fee_collected_inr ?? 0) > 0}
        />
        <MetricCard
          simple
          label="Still due"
          value={formatInr(stats?.fee_due_inr ?? 0)}
          trend={
            (stats?.total_fees_assigned_inr ?? 0) > 0
              ? `${Math.round(((stats?.fee_collected_inr ?? 0) / (stats?.total_fees_assigned_inr ?? 1)) * 100)}% received`
              : 'No fees set up yet'
          }
          trendUp={(stats?.fee_due_inr ?? 0) === 0}
        />
        <MetricCard
          simple
          label="Links sent"
          value={String(stats?.payment_links_sent ?? stats?.total_links ?? 0)}
          trend={
            (stats?.open_links ?? 0) > 0
              ? `${stats?.open_links} unpaid · ${stats?.paid_links ?? 0} paid`
              : `${stats?.paid_links ?? 0} fully paid`
          }
          trendUp={(stats?.payment_links_sent ?? stats?.total_links ?? 0) > 0}
        />
        <MetricCard
          simple
          label="Unpaid link total"
          value={formatInr(stats?.payment_link_sent_amount_inr ?? 0)}
          trend="Open links only"
          trendUp={(stats?.payment_link_sent_amount_inr ?? 0) > 0}
        />
        <MetricCard
          simple
          label="Paid online"
          value={formatInr(stats?.online_collected_inr ?? 0)}
          trend={`${stats?.online_payments_count ?? 0} Razorpay payment${(stats?.online_payments_count ?? 0) === 1 ? '' : 's'}`}
          trendUp={(stats?.online_collected_inr ?? 0) > 0}
        />
        <MetricCard
          simple
          label="Paid at counter"
          value={formatInr(stats?.offline_collected_inr ?? 0)}
          trend={`${stats?.offline_payments_count ?? 0} cash or bank payment${(stats?.offline_payments_count ?? 0) === 1 ? '' : 's'}`}
          trendUp={(stats?.offline_collected_inr ?? 0) > 0}
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">Payment links</h2>
          <span className="text-sm text-muted-foreground">Links waiting for payment</span>
        </div>
      </div>

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

      <div className="space-y-2 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">Payment history</h2>
          <Link to="/app/institute/transactions" className="text-sm font-medium text-primary hover:underline">
            View all transactions
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Completed payments — online and paid direct at counter.</p>
      </div>

      <div className={txPanelOpen && selectedTxId ? 'grid gap-6 lg:grid-cols-[1fr_380px]' : 'grid gap-6'}>
        <TableShell
          search={historySearch}
          onSearchChange={setHistorySearch}
          searchBusy={historyLoading || historyFetching}
          searchPlaceholder="Search student, roll no., transaction ID…"
          countLabel={
            <span className="inline-flex items-center gap-1.5">
              {(historyLoading || historyFetching) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              )}
              {`${historyPagination.total.toLocaleString('en-IN')} paid`}
            </span>
          }
          filterSlot={
            <div className="w-[160px]">
              <SelectField
                value={historyChannel}
                onChange={setHistoryChannel}
                options={HISTORY_CHANNEL_OPTIONS}
                aria-label="Filter payment type"
              />
            </div>
          }
          pagination={historyTablePagination}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Transaction</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Fee period</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Paid on</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      Loading payment history…
                    </td>
                  </tr>
                ) : historyRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      No completed payments yet. Online checkouts and offline recordings appear here.
                    </td>
                  </tr>
                ) : (
                  historyRows.map((tx) => {
                    const isSelected = txPanelOpen && selectedTxId === tx.id
                    return (
                      <tr
                        key={tx.id}
                        className={cn(
                          'cursor-pointer border-b border-border/40 transition-colors',
                          isSelected
                            ? 'border-l-[3px] border-l-emerald-500 bg-emerald-50/80'
                            : 'hover:bg-muted/20',
                        )}
                        onClick={() => {
                          setSelectedTxId(tx.id)
                          setTxPanelOpen(true)
                        }}
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-[180px] truncate font-mono text-xs font-semibold" title={tx.transactionId}>
                            {tx.transactionId}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-foreground">{tx.student}</div>
                          {tx.rollNo && <div className="text-xs text-muted-foreground">Roll {tx.rollNo}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="line-clamp-2 text-sm font-medium text-violet-800" title={tx.feePeriod}>
                            {tx.feePeriod}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold tabular-nums text-emerald-800">{formatInr(tx.amount)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                              tx.channel === 'offline'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-violet-100 text-violet-800',
                            )}
                          >
                            {tx.methodLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={tx.statusLabel} variant={statusVariant(tx.statusLabel)} />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{tx.created}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </TableShell>

        {txPanelOpen && selectedTxId && !isMobile && (
          <TransactionDetailPanel
            transactionId={selectedTxId}
            onClose={() => {
              setTxPanelOpen(false)
              setSelectedTxId(null)
            }}
          />
        )}
      </div>

      {txPanelOpen && selectedTxId && isMobile && (
        <Modal
          open={txPanelOpen}
          onClose={() => {
            setTxPanelOpen(false)
            setSelectedTxId(null)
          }}
          title="Payment details"
          size="lg"
        >
          <TransactionDetailPanel
            transactionId={selectedTxId}
            onClose={() => {
              setTxPanelOpen(false)
              setSelectedTxId(null)
            }}
          />
        </Modal>
      )}

      <SendPaymentLinkModal open={sendOpen} onClose={() => setSendOpen(false)} onSent={invalidate} />
      <RecordOfflinePaymentModal
        open={offlineOpen}
        onClose={() => setOfflineOpen(false)}
        onRecorded={invalidate}
      />
    </div>
  )
}
