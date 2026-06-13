import { useEffect, useLayoutEffect, useState, type RefObject, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function useAnchoredMenuPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  menuWidth: number,
  menuHeight: number,
) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const update = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    let top = rect.bottom + 6
    let left = rect.left

    if (top + menuHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuHeight - 6)
    }
    if (left + menuWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - menuWidth - 8)
    }

    setPos({ top, left })
  }

  useLayoutEffect(() => {
    if (!open) return
    update()
  }, [open, menuWidth, menuHeight])

  useEffect(() => {
    if (!open) return
    const onScroll = () => update()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, menuWidth, menuHeight])

  return pos
}

export function AnchoredMenuPortal({
  open,
  triggerRef,
  menuRef,
  menuWidth,
  menuHeight,
  children,
  onClose,
}: {
  open: boolean
  triggerRef: RefObject<HTMLElement | null>
  menuRef?: RefObject<HTMLDivElement | null>
  menuWidth: number
  menuHeight: number
  children: ReactNode
  onClose?: () => void
}) {
  const pos = useAnchoredMenuPosition(open, triggerRef, menuWidth, menuHeight)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (menuRef?.current?.contains(target)) return
      onClose?.()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, menuRef, triggerRef])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[120] overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl"
      style={{ top: pos.top, left: pos.left, width: menuWidth }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  )
}
