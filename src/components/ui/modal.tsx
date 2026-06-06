import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'md' | 'lg' | 'xl' | '2xl'
  footer?: React.ReactNode
  children: React.ReactNode
}

const sizes = {
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
}

export function Modal({ open, onClose, title, description, size = 'lg', footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-8">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close modal" />
      <div
        className={cn(
          'relative mx-auto flex w-full max-h-[min(90vh,880px)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl',
          sizes[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || description) && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/60 bg-muted/20 px-6 py-5">
            <div className="min-w-0 pr-2">
              {title && (
                <h2 id="modal-title" className="text-xl font-bold tracking-tight text-foreground">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 rounded-lg" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border/60 bg-muted/10 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

