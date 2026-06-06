import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  leadingIcon?: React.ComponentType<{ className?: string }>
  className?: string
  'aria-label'?: string
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  leadingIcon: LeadingIcon,
  className,
  'aria-label': ariaLabel,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected?.label ?? placeholder

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuMaxHeight = 280
    const gap = 6
    let top = rect.bottom + gap
    if (top + menuMaxHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuMaxHeight - gap)
    }
    setPos({ top, left: rect.left, width: rect.width })
  }, [open, options.length])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
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

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[120] overflow-hidden rounded-xl border border-border/70 bg-white shadow-lg dark:bg-card"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          role="listbox"
        >
          <ul className="max-h-[min(280px,50vh)] overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <li key={opt.value || '__empty__'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-violet-50 font-semibold text-violet-900 dark:bg-violet-950/30 dark:text-violet-100'
                        : 'font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted/50',
                    )}
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {isSelected && <Check className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.5} />}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-xl border border-border/60 bg-white px-3 text-left text-sm font-medium text-foreground shadow-sm transition-colors',
          'hover:border-violet-200 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
          'disabled:cursor-not-allowed disabled:opacity-60 dark:bg-card',
          open && 'border-violet-400 ring-2 ring-violet-500/20',
          className,
        )}
      >
        {LeadingIcon && (
          <LeadingIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-muted-foreground')}>{displayLabel}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {menu}
    </>
  )
}
