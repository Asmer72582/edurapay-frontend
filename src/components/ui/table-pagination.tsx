import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type TablePaginationProps = {
  page: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
  className?: string
  disabled?: boolean
}

/** Compact prev/next controls for table toolbars (search row). */
export function TablePaginationControls({
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  className,
  disabled,
}: TablePaginationProps) {
  if (total === 0) {
    return null
  }

  const safePage = Math.min(Math.max(1, page), lastPage)
  const from = (safePage - 1) * perPage + 1
  const to = Math.min(safePage * perPage, total)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{' '}
        <span className="font-medium text-foreground">{total.toLocaleString('en-IN')}</span>
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 rounded-lg px-2"
        disabled={disabled || safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[5.5rem] whitespace-nowrap text-center text-sm font-medium tabular-nums text-muted-foreground">
        {safePage} / {lastPage}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 rounded-lg px-2"
        disabled={disabled || safePage >= lastPage}
        onClick={() => onPageChange(safePage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
