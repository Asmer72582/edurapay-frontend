import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TablePaginationControls, type TablePaginationProps } from '@/components/ui/table-pagination'
import { cn } from '@/lib/utils'

interface TableShellProps {
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  countLabel?: React.ReactNode
  searchBusy?: boolean
  filterSlot?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** When false, list can grow naturally (no overflow clip). Default true for legacy tables. */
  contain?: boolean
  /** Inline pagination in the search/toolbar row. */
  pagination?: TablePaginationProps | null
}

export function TableShell({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  countLabel,
  searchBusy = false,
  filterSlot,
  actions,
  children,
  className,
  contain = true,
  pagination,
}: TableShellProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card shadow-sm',
        contain ? 'overflow-hidden' : 'overflow-visible',
        className,
      )}
    >
      {(search !== undefined || countLabel || filterSlot || actions || pagination) && (
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          {search !== undefined && onSearchChange && (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  'h-10 rounded-xl border-border/60 bg-muted/30 pl-9',
                  searchBusy && 'pr-9',
                )}
              />
              {searchBusy && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </span>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {filterSlot ?? (
              <Button variant="outline" size="sm" className="rounded-xl">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                Filter
              </Button>
            )}
            {actions}
            {countLabel && <span className="text-sm text-muted-foreground">{countLabel}</span>}
            {pagination ? <TablePaginationControls {...pagination} /> : null}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

interface StatusBadgeProps {
  status: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const variants = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
  info: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400',
  neutral: 'bg-muted/60 text-muted-foreground border-border',
}

export function StatusBadge({ status, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize', variants[variant])}>
      {status}
    </span>
  )
}

export function statusVariant(status: string): StatusBadgeProps['variant'] {
  switch (status) {
    case 'completed':
    case 'paid':
    case 'active':
    case 'sent':
      return 'success'
    case 'pending':
    case 'partial':
    case 'due':
    case 'draft':
      return 'warning'
    case 'failed':
    case 'overdue':
      return 'danger'
    case 'expired':
    case 'cancelled':
    case 'setup':
    case 'closed':
      return 'neutral'
    default:
      return 'info'
  }
}
