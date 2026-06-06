import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function LightCard({
  children,
  className,
  glow = false,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm',
        glow && 'shadow-md shadow-violet-500/10 ring-1 ring-violet-100',
        className,
      )}
    >
      {children}
    </div>
  )
}
