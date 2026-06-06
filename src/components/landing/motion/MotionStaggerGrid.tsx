import { Children, type ReactNode } from 'react'
import { useReveal } from '@/components/landing/motion/useReveal'
import { cn } from '@/lib/utils'

export function MotionStaggerGrid({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'ul'
}) {
  const { ref, className: revealCls } = useReveal(0.1)
  const items = Children.toArray(children)

  return (
    <Tag ref={ref as never} className={cn(revealCls, 'motion-stagger-parent', className)}>
      {items.map((child, i) => (
        <div key={i} className="motion-stagger-item motion-page-card">
          {child}
        </div>
      ))}
    </Tag>
  )
}

export function MotionReveal({
  children,
  className,
  from = 'up',
}: {
  children: ReactNode
  className?: string
  from?: 'up' | 'left' | 'right'
}) {
  const { ref, className: revealCls } = useReveal(0.12)

  return (
    <div
      ref={ref}
      className={cn(
        revealCls,
        from === 'left' && 'motion-reveal-left',
        from === 'right' && 'motion-reveal-right',
        className,
      )}
    >
      {children}
    </div>
  )
}
