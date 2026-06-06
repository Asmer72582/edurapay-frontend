import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function GlassCard({
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
        'rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl',
        glow && 'shadow-cyan-500/10 ring-1 ring-cyan-400/20',
        className,
      )}
    >
      {children}
    </div>
  )
}
