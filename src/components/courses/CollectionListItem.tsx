import { BookOpen, IndianRupee, Pencil, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, statusVariant } from '@/components/dashboard/TableShell'
import { CollectionActionsMenu, type CollectionActionItem } from '@/components/courses/CollectionActionsMenu'
import { cn } from '@/lib/utils'
import { formatInr } from '@/lib/institute-mock'

export type CollectionRow = {
  id: string
  name: string
  description?: string
  status?: string
  students_count?: number
  fee_total?: number
  fee_installments?: number
  has_fee_plan?: boolean
}

type CollectionListItemProps = {
  collection: CollectionRow
  selected?: boolean
  menuItems: CollectionActionItem[]
  onOpen: () => void
  onEdit: () => void
  onConfigureFees: () => void
}

function statusLabel(status?: string) {
  if (status === 'archived') return { text: 'Archived', variant: 'neutral' as const }
  if (status === 'inactive') return { text: 'Inactive', variant: 'warning' as const }
  return { text: 'Active', variant: 'success' as const }
}

export function CollectionListItem({
  collection: c,
  selected,
  menuItems,
  onOpen,
  onEdit,
  onConfigureFees,
}: CollectionListItemProps) {
  const st = statusLabel(c.status)
  const needsFees = !c.has_fee_plan

  return (
    <article
      className={cn(
        'group flex flex-col gap-4 border-b border-border/50 px-4 py-4 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:gap-6 sm:px-5 sm:py-5',
        'hover:bg-muted/25',
        selected && 'bg-violet-50/60 dark:bg-violet-950/25',
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-3 text-left sm:items-center"
        onClick={onOpen}
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/50">
          <BookOpen className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{c.name}</h3>
            <StatusBadge status={st.text} variant={statusVariant(c.status === 'archived' ? 'neutral' : c.status === 'inactive' ? 'warning' : 'active')} />
          </div>
          {c.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
          ) : (
            <p className="mt-0.5 text-sm italic text-muted-foreground/80">No description</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              {c.students_count ?? 0} students
            </span>
            {c.has_fee_plan ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-violet-700 dark:text-violet-300">
                <IndianRupee className="h-4 w-4" />
                {formatInr(Number(c.fee_total ?? 0))}
                <span className="font-normal text-muted-foreground">
                  · {c.fee_installments ?? 0} installments
                </span>
              </span>
            ) : (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                Fees not configured
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center justify-end gap-2 sm:pl-2" onClick={(e) => e.stopPropagation()}>
        {needsFees && (
          <Button
            size="sm"
            className="hidden rounded-lg bg-violet-600 font-semibold hover:bg-violet-700 sm:inline-flex"
            onClick={onConfigureFees}
          >
            Configure fees
          </Button>
        )}
        <Button variant="outline" size="sm" className="rounded-lg font-medium" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        <CollectionActionsMenu items={menuItems} />
      </div>
    </article>
  )
}

export function CollectionListSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex animate-pulse gap-3 px-5 py-5">
          <div className="h-11 w-11 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-4 w-full max-w-md rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
