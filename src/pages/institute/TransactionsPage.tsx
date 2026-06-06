import { useEffect, useMemo, useState } from 'react'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, RefreshCw } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableShell, StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { TransactionDetailPanel } from '@/components/payments/TransactionDetailPanel'
import { formatFeePeriodDisplay } from '@/lib/fee-period'
import { formatInr } from '@/lib/institute-mock'
import { usePaymentTransactions, usePaymentTransactionStats } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

function mapTransaction(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ''),
    transactionId: String(row.transaction_id ?? '—'),
    student: String(row.student_name ?? '—'),
    rollNo: String(row.student_roll_no ?? ''),
    feePeriod: formatFeePeriodDisplay(String(row.fee_period_display ?? '—')),
    amount: Number(row.amount ?? 0),
    status: String(row.status ?? ''),
    type: String(row.type ?? ''),
    gateway: String(row.gateway ?? ''),
    paymentId: String(row.payment_id ?? ''),
    gatewayPaymentId: String(row.gateway_payment_id ?? ''),
    created: row.created_at
      ? new Date(String(row.created_at)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
  }
}

export function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [txType, setTxType] = useState('all')
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [txPanelOpen, setTxPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data: txData, isLoading: txLoading, isFetching: txFetching } = usePaymentTransactions(
    search,
    status,
    txType,
    page,
    LIST_PAGE_SIZE,
  )
  const { data: txStatsData, isLoading: statsLoading } = usePaymentTransactionStats()
  const tableBusy = txLoading || txFetching

  const txPagination = useMemo(() => parsePaginated<Record<string, unknown>>(txData), [txData])
  const txStats = txStatsData?.data
  const txRows = useMemo(() => txPagination.items.map(mapTransaction), [txPagination.items])

  const tablePagination = useMemo(
    () => ({
      page: txPagination.page,
      lastPage: txPagination.lastPage,
      total: txPagination.total,
      perPage: txPagination.perPage,
      onPageChange: setPage,
      disabled: tableBusy,
    }),
    [txPagination, tableBusy],
  )

  useEffect(() => {
    setPage(1)
  }, [search, status, txType])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['payment-transactions'] })
    qc.invalidateQueries({ queryKey: ['payment-transactions-stats'] })
    qc.invalidateQueries({ queryKey: ['payment-links'] })
    qc.invalidateQueries({ queryKey: ['invoices'] })
  }

  const openTransaction = (id: string) => {
    setSelectedTxId(id)
    setTxPanelOpen(true)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        crumbs={[{ label: 'Operations' }, { label: 'Transactions' }]}
        title="Transactions"
        description="Completed payments with transaction IDs, fee periods, and settlement details."
        actions={
          <Button variant="outline" className="rounded-xl" onClick={invalidate}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Sync
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-5">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="mt-3 h-8 w-20 rounded bg-muted" />
              <div className="mt-4 h-12 rounded bg-muted/60" />
            </div>
          ))
        ) : (
          <>
            <MetricCard
              label="All transactions"
              value={String(txStats?.total_transactions ?? 0)}
              trend="Ledger entries"
              trendUp
            />
            <MetricCard
              label="Completed captures"
              value={String(txStats?.completed_captures ?? 0)}
              trend={`${txStats?.today_count ?? 0} today`}
              trendUp={(txStats?.today_count ?? 0) > 0}
            />
            <MetricCard
              label="Total collected"
              value={formatInr(txStats?.total_collected ?? 0, true)}
              trend="Successful captures"
              trendUp={(txStats?.total_collected ?? 0) > 0}
            />
            <MetricCard label="Today" value={String(txStats?.today_count ?? 0)} trend="New captures" trendUp={false} />
          </>
        )}
      </div>

      <div className={txPanelOpen && selectedTxId ? 'grid gap-6 lg:grid-cols-[1fr_380px]' : 'grid gap-6'}>
        <TableShell
          search={search}
          onSearchChange={setSearch}
          searchBusy={tableBusy}
          searchPlaceholder="Search name, phone, email, roll no., transaction ID…"
          countLabel={
            <span className="inline-flex items-center gap-1.5">
              {tableBusy && <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />}
              {tableBusy
                ? 'Loading transactions…'
                : `${txPagination.total.toLocaleString('en-IN')} transactions`}
            </span>
          }
          filterSlot={
            <div className="flex flex-wrap gap-2">
              <select
                className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All status</option>
                <option value="completed">Completed</option>
                <option value="created">Created</option>
                <option value="failed">Failed</option>
              </select>
              <select
                className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
              >
                <option value="all">All types</option>
                <option value="capture">Capture</option>
                <option value="initiate">Initiate</option>
              </select>
            </div>
          }
          pagination={tablePagination}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Fee period</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Gateway</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {tableBusy ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td className="px-5 py-4">
                        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                        <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-muted/70" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="mt-1.5 h-3 w-10 animate-pulse rounded bg-muted/70" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-6 w-20 animate-pulse rounded-lg bg-muted" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      </td>
                    </tr>
                  ))
                ) : txRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      No transactions yet. Completed online payments appear here after checkout.
                    </td>
                  </tr>
                ) : (
                  txRows.map((tx) => {
                    const isSelected = txPanelOpen && selectedTxId === tx.id
                    return (
                      <tr
                        key={tx.id}
                        className={cn(
                          'cursor-pointer border-b border-border/40 transition-colors',
                          isSelected
                            ? 'border-l-[3px] border-l-violet-500 bg-violet-50/80'
                            : 'hover:bg-muted/20',
                        )}
                        onClick={() => openTransaction(tx.id)}
                      >
                        <td className="px-5 py-4">
                          <div
                            className="max-w-[200px] truncate font-mono text-xs font-medium"
                            title={tx.transactionId}
                          >
                            {tx.transactionId}
                          </div>
                          {tx.gatewayPaymentId && (
                            <div
                              className="mt-0.5 max-w-[200px] truncate text-[10px] text-muted-foreground"
                              title={tx.gatewayPaymentId}
                            >
                              {tx.gatewayPaymentId}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium">{tx.student}</div>
                          {tx.rollNo && <div className="text-xs text-muted-foreground">{tx.rollNo}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="line-clamp-2 text-sm font-medium text-violet-800" title={tx.feePeriod}>
                            {tx.feePeriod}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold">{formatInr(tx.amount)}</td>
                        <td className="px-5 py-4 capitalize text-muted-foreground">{tx.gateway || '—'}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={tx.status} variant={statusVariant(tx.status)} />
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
          title="Transaction details"
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
    </div>
  )
}
