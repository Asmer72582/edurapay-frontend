import { useMemo, useState } from 'react'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import { FileText } from 'lucide-react'
import { TableShell } from '@/components/dashboard/TableShell'
import { Button } from '@/components/ui/button'
import { FeeReceiptDetailPanel, type FeeReceiptRow } from '@/components/invoices/FeeReceiptDetailPanel'
import { useFeeReceipts } from '@/hooks/useApi'
import { formatInr } from '@/lib/institute-mock'
import { cn } from '@/lib/utils'

function mapRow(raw: Record<string, unknown>): FeeReceiptRow {
  const categories = (raw.fee_categories ?? []) as { name: string; amount: number }[]

  return {
    id: String(raw.id ?? ''),
    source: (raw.source === 'invoice' ? 'invoice' : 'gateway') as FeeReceiptRow['source'],
    receipt_number: String(raw.receipt_number ?? ''),
    transaction_id: String(raw.transaction_id ?? ''),
    student_name: String(raw.student_name ?? '—'),
    student_roll_no: String(raw.student_roll_no ?? ''),
    class_name: String(raw.class_name ?? '—'),
    amount_inr: Number(raw.amount_inr ?? 0),
    paid_at: raw.paid_at ? String(raw.paid_at) : undefined,
    period_label: String(raw.period_label ?? ''),
    fee_categories: categories,
  }
}

export function FeeReceiptsTab() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<FeeReceiptRow | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const { data, isLoading, isFetching } = useFeeReceipts(search, page, LIST_PAGE_SIZE)
  const pagination = useMemo(() => parsePaginated<Record<string, unknown>>(data), [data])
  const rows = useMemo(() => pagination.items.map(mapRow), [pagination.items])

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

  const open = (row: FeeReceiptRow) => {
    setSelected(row)
    setPanelOpen(true)
  }

  return (
    <div className={panelOpen && selected ? 'grid gap-6 lg:grid-cols-[1fr_380px]' : 'grid gap-6'}>
      <TableShell
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Search student, receipt, roll no., class…"
        countLabel={`${pagination.total} fee receipt(s)`}
        pagination={tablePagination}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Receipt</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Class / collection</th>
                <th className="px-5 py-3.5">Categories</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Paid on</th>
                <th className="px-5 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    Loading fee receipts…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No fee receipts yet. Receipts appear when students pay online or when you record invoice payments.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isSelected = panelOpen && selected?.id === row.id && selected?.source === row.source
                  const categoryPreview = row.fee_categories.map((c) => c.name).slice(0, 3).join(', ')

                  return (
                    <tr
                      key={`${row.source}-${row.id}`}
                      className={cn(
                        'cursor-pointer border-b border-border/40 transition-colors',
                        isSelected ? 'border-l-[3px] border-l-violet-500 bg-violet-50/80' : 'hover:bg-muted/20',
                      )}
                      onClick={() => open(row)}
                    >
                      <td className="px-5 py-4 font-mono text-xs font-semibold">{row.receipt_number || '—'}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{row.student_name}</p>
                        {row.student_roll_no && (
                          <p className="text-xs text-muted-foreground">Roll {row.student_roll_no}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium">
                          {row.class_name}
                        </span>
                      </td>
                      <td className="max-w-[200px] px-5 py-4 text-xs text-muted-foreground">
                        {categoryPreview || '—'}
                        {row.fee_categories.length > 3 ? ` +${row.fee_categories.length - 3}` : ''}
                      </td>
                      <td className="px-5 py-4 font-semibold">{formatInr(row.amount_inr)}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {row.paid_at
                          ? new Date(row.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => open(row)}>
                          <FileText className="mr-1 h-3.5 w-3.5" />
                          Open
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableShell>

      {panelOpen && selected && (
        <div className="hidden lg:block">
          <FeeReceiptDetailPanel receipt={selected} onClose={() => setPanelOpen(false)} />
        </div>
      )}
    </div>
  )
}
