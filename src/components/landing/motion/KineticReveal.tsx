import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReveal } from '@/components/landing/motion/useReveal'

export function KineticReveal({
  children,
  className,
  stagger = false,
}: {
  children: ReactNode
  className?: string
  stagger?: boolean
}) {
  const { ref, className: revealCls } = useReveal()

  return (
    <div ref={ref} className={cn(revealCls, stagger && 'motion-stagger-parent', className)}>
      {children}
    </div>
  )
}

export function KineticTitle({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  center?: boolean
}) {
  const { ref, className: revealCls } = useReveal()

  return (
    <div ref={ref} className={cn(revealCls, center && 'text-center', 'motion-stagger-parent')}>
      <p className="motion-stagger-item text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">{eyebrow}</p>
      <h2 className="motion-stagger-item mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="motion-stagger-item mt-4 text-slate-600">{subtitle}</p> : null}
    </div>
  )
}
