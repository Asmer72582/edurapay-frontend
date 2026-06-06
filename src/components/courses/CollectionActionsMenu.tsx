import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  Copy,
  IndianRupee,
  MoreVertical,
  PanelRightOpen,
  Pencil,
  Trash2,
  UserMinus,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CollectionActionItem = {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
  hint?: string
  children?: CollectionActionItem[]
}

type CollectionActionsMenuProps = {
  items: CollectionActionItem[]
  className?: string
}

function ActionRow({
  item,
  onSelect,
  className,
}: {
  item: CollectionActionItem
  onSelect: () => void
  className?: string
}) {
  const Icon = item.icon ?? Users

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50',
        item.destructive ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30' : 'text-foreground',
        className,
      )}
      onClick={() => {
        if (item.disabled || !item.onClick) return
        onSelect()
        item.onClick()
      }}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.hint && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.hint}</span>}
    </button>
  )
}

function SubmenuTrigger({
  item,
  onClose,
}: {
  item: CollectionActionItem
  onClose: () => void
}) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const subRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const Icon = item.icon ?? Users
  const children = item.children ?? []

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (!item.disabled) setOpen(true)
  }

  const hideSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    [],
  )

  useLayoutEffect(() => {
    if (!open || !rowRef.current) return
    const rect = rowRef.current.getBoundingClientRect()
    const subWidth = 240
    const subHeight = Math.min(360, children.length * 40 + 8)
    let top = rect.top
    let left = rect.right - 4
    if (left + subWidth > window.innerWidth - 8) {
      left = rect.left - subWidth + 4
    }
    if (top + subHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - subHeight - 8)
    }
    setPos({ top, left })
  }, [open, children.length])

  return (
    <div ref={rowRef} className="relative" onMouseEnter={show} onMouseLeave={hideSoon}>
      <div
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex w-full cursor-default items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition-colors',
          item.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted/50',
          open && 'bg-muted/50',
        )}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-70" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={subRef}
            data-collection-submenu
            className="fixed z-[110] min-w-[220px] max-w-[280px] overflow-hidden rounded-xl border border-border/80 bg-card py-1 shadow-2xl"
            style={{ top: pos.top, left: pos.left }}
            role="menu"
            onMouseEnter={show}
            onMouseLeave={hideSoon}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[340px] overflow-y-auto">
              {children.map((child) => (
                <ActionRow
                  key={child.id}
                  item={child}
                  onSelect={() => {
                    setOpen(false)
                    onClose()
                  }}
                />
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export function CollectionActionsMenu({ items, className }: CollectionActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuWidth = 260
    const menuHeight = Math.min(420, 56 + items.length * 42)
    let top = rect.bottom + 6
    let left = rect.right - menuWidth
    if (top + menuHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuHeight - 6)
    }
    if (left < 8) left = 8
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8
    }
    setPos({ top, left })
  }, [open, items.length])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      // Submenus are portaled separately; ignore clicks inside them
      if ((t as Element).closest?.('[data-collection-submenu]')) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[260px] max-w-[300px] overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl"
      style={{ top: pos.top, left: pos.left }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b border-border/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Quick actions
      </div>
      <div className="max-h-[380px] overflow-y-auto py-1">
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            return <SubmenuTrigger key={item.id} item={item} onClose={closeMenu} />
          }

          return <ActionRow key={item.id} item={item} onSelect={closeMenu} />
        })}
      </div>
    </div>
  ) : null

  return (
    <div className={cn('inline-flex', className)}>
      <Button
        ref={triggerRef}
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg"
        aria-label="Quick actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {typeof document !== 'undefined' && menu ? createPortal(menu, document.body) : null}
    </div>
  )
}

export const collectionActionIcons = {
  open: PanelRightOpen,
  edit: Pencil,
  fees: IndianRupee,
  assignAll: Users,
  assignClass: Users,
  unassignAll: UserMinus,
  unassignClass: UserMinus,
  duplicate: Copy,
  archive: Archive,
  unarchive: ArchiveRestore,
  delete: Trash2,
}
