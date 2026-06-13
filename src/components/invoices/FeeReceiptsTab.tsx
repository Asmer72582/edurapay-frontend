import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Calendar,
  ChevronDown,
  Download,
  FileText,
  GraduationCap,
  Hash,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import { LIST_PAGE_SIZE, parsePaginated } from '@/lib/list-pagination'
import {
  EMPTY_FEE_RECEIPT_FILTERS,
  feeReceiptQueryParams,
  hasActiveFeeReceiptFilters,
  type FeeReceiptFilters,
} from '@/lib/fee-receipt-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import { TablePaginationControls } from '@/components/ui/table-pagination'
import { FeeReceiptDetailPanel, type FeeReceiptRow } from '@/components/invoices/FeeReceiptDetailPanel'
import { useCourses, useFeeReceipts } from '@/hooks/useApi'
import { useWorkspaceAcademicYear } from '@/hooks/useWorkspaceAcademicYear'
import { api } from '@/lib/api'
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

function countActiveFilters(filters: FeeReceiptFilters): number {
  return Object.values(filters).filter((value) => String(value ?? '').trim() !== '').length
}

function ClassTags({ value }: { value: string }) {
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const visible = parts.slice(0, 2)
  const hidden = parts.length - visible.length

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((part) => (
        <span
          key={part}
          className="inline-flex max-w-[140px] truncate rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-medium"
          title={part}
        >
          {part}
        </span>
      ))}
      {hidden > 0 && (
        <span className="inline-flex rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 text-xs text-muted-foreground">
          +{hidden}
        </span>
      )}
    </div>
  )
}

export function FeeReceiptsTab() {
  const [filters, setFilters] = useState<FeeReceiptFilters>({ ...EMPTY_FEE_RECEIPT_FILTERS })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<FeeReceiptRow | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState<'filtered' | 'all' | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { allYears } = useWorkspaceAcademicYear()
  const { data: coursesData } = useCourses('', 1, 200, 'active')
  const courseOptions = useMemo(() => {
    const raw = (coursesData?.data?.data ?? []) as Record<string, unknown>[]
    const labels = raw
      .map((course) => {
        const grade = String(course.grade ?? '').trim()
        const name = String(course.name ?? '').trim()
        return grade || name
      })
      .filter(Boolean)
    return [...new Set(labels)].sort((a, b) => a.localeCompare(b))
  }, [coursesData])

  const classSelectOptions = useMemo(
    () => [{ value: '', label: 'All classes' }, ...courseOptions.map((label) => ({ value: label, label }))],
    [courseOptions],
  )

  const yearSelectOptions = useMemo(
    () => [{ value: '', label: 'All years' }, ...allYears.map((year) => ({ value: year, label: year }))],
    [allYears],
  )

  const { data, isLoading, isFetching } = useFeeReceipts(filters, page, LIST_PAGE_SIZE)
  const pagination = useMemo(() => parsePaginated<Record<string, unknown>>(data), [data])
  const rows = useMemo(() => pagination.items.map(mapRow), [pagination.items])
  const filtersActive = hasActiveFeeReceiptFilters(filters)
  const activeFilterCount = countActiveFilters(filters)

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

  const updateFilter = (key: keyof FeeReceiptFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ ...EMPTY_FEE_RECEIPT_FILTERS })
    setPage(1)
  }

  const open = (row: FeeReceiptRow) => {
    setSelected(row)
    setPanelOpen(true)
  }

  const downloadPdf = async (mode: 'filtered' | 'all') => {
    if (mode === 'filtered' && pagination.total === 0) {
      toast.error('No fee receipts match your filters')
      return
    }

    setDownloadingPdf(mode)
    try {
      const params = mode === 'all' ? undefined : feeReceiptQueryParams(filters)

      const res = await api.get('/v1/invoices/fee-receipts/export-pdf', {
        responseType: 'blob',
        params,
      })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      const stamp = new Date().toISOString().slice(0, 10)
      a.download = mode === 'all' ? `fee-receipts-all-${stamp}.pdf` : `fee-receipts-filtered-${stamp}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(
        mode === 'all'
          ? 'Downloaded PDF with all fee receipts'
          : `Downloaded PDF with ${pagination.total} matching receipt(s)`,
      )
    } catch {
      toast.error('Could not generate PDF')
    } finally {
      setDownloadingPdf(null)
    }
  }

  return (
    <div className={panelOpen && selected ? 'grid gap-6 lg:grid-cols-[1fr_380px]' : 'grid gap-6'}>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {/* Toolbar */}
        <div className="space-y-4 border-b border-border/60 p-4 md:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1 xl:max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search ?? ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search student, receipt, roll no., class…"
                className={cn(
                  'h-11 rounded-xl border-border/60 bg-muted/30 pl-9',
                  isFetching && 'pr-9',
                )}
              />
              {isFetching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filtersActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl"
                  onClick={() => downloadPdf('filtered')}
                  disabled={downloadingPdf !== null || pagination.total === 0}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  {downloadingPdf === 'filtered' ? 'Generating…' : `Filtered PDF (${pagination.total})`}
                </Button>
              )}
              <Button
                variant={filtersActive ? 'secondary' : 'default'}
                size="sm"
                className={cn(
                  'h-10 rounded-xl',
                  !filtersActive && 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700',
                )}
                onClick={() => downloadPdf('all')}
                disabled={downloadingPdf !== null}
              >
                <Download className="mr-1.5 h-4 w-4" />
                {downloadingPdf === 'all' ? 'Generating…' : 'Download all PDF'}
              </Button>
            </div>
          </div>

          {/* Filters panel */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-violet-600" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                    {activeFilterCount} active
                  </span>
                )}
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                {filtersActive && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="rounded-lg px-2 py-1 font-medium text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/30"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFilters()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilters()
                      }
                    }}
                  >
                    Clear all
                  </span>
                )}
                <ChevronDown className={cn('h-4 w-4 transition-transform', filtersOpen && 'rotate-180')} />
              </span>
            </button>

            {filtersOpen && (
              <div className="border-t border-border/60 px-4 pb-4 pt-3">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Roll number</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={filters.roll_no ?? ''}
                        onChange={(e) => updateFilter('roll_no', e.target.value)}
                        placeholder="e.g. LKG-09834"
                        className="h-10 rounded-xl border-border/60 bg-background pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Student name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={filters.student ?? ''}
                        onChange={(e) => updateFilter('student', e.target.value)}
                        placeholder="Search by name"
                        className="h-10 rounded-xl border-border/60 bg-background pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Class / collection</Label>
                    <SelectField
                      value={filters.class ?? ''}
                      onChange={(value) => updateFilter('class', value)}
                      options={classSelectOptions}
                      placeholder="All classes"
                      leadingIcon={GraduationCap}
                      aria-label="Filter by class"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Receipt number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={filters.receipt ?? ''}
                        onChange={(e) => updateFilter('receipt', e.target.value)}
                        placeholder="RCP-…"
                        className="h-10 rounded-xl border-border/60 bg-background pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Academic year</Label>
                    <SelectField
                      value={filters.academic_year ?? ''}
                      onChange={(value) => updateFilter('academic_year', value)}
                      options={yearSelectOptions}
                      placeholder="All years"
                      aria-label="Filter by academic year"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Paid from</Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        value={filters.date_from ?? ''}
                        onChange={(e) => updateFilter('date_from', e.target.value)}
                        className="h-10 rounded-xl border-border/60 bg-background pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Paid until</Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        value={filters.date_to ?? ''}
                        onChange={(e) => updateFilter('date_to', e.target.value)}
                        className="h-10 rounded-xl border-border/60 bg-background pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results bar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                'Loading fee receipts…'
              ) : (
                <>
                  <span className="font-semibold text-foreground">{pagination.total.toLocaleString('en-IN')}</span>
                  {' '}
                  {pagination.total === 1 ? 'receipt' : 'receipts'}
                  {filtersActive ? ' matching filters' : ' total'}
                </>
              )}
            </p>
            <TablePaginationControls {...tablePagination} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Receipt no.</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Class / collection</th>
                <th className="px-5 py-3.5">Categories</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Paid on</th>
                <th className="px-5 py-3.5 text-right">View</th>
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
                    {filtersActive
                      ? 'No fee receipts match your filters. Try clearing filters or widening your search.'
                      : 'No fee receipts yet. Receipts appear when students pay online or when you record invoice payments.'}
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
                        <ClassTags value={row.class_name} />
                      </td>
                      <td className="max-w-[200px] px-5 py-4 text-xs text-muted-foreground">
                        {categoryPreview || '—'}
                        {row.fee_categories.length > 3 ? ` +${row.fee_categories.length - 3}` : ''}
                      </td>
                      <td className="px-5 py-4 font-semibold tabular-nums">{formatInr(row.amount_inr)}</td>
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
      </div>

      {panelOpen && selected && (
        <div className="hidden lg:block">
          <FeeReceiptDetailPanel receipt={selected} onClose={() => setPanelOpen(false)} />
        </div>
      )}
    </div>
  )
}
