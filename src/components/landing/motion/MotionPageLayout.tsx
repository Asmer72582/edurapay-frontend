import type { ReactNode } from 'react'
import { ParallaxFloat } from '@/components/landing/motion/ParallaxSection'
import { MarqueeTicker } from '@/components/landing/motion/MarqueeTicker'
import { cn } from '@/lib/utils'

export function MotionPageLayout({
  children,
  showTicker = false,
  className,
}: {
  children: ReactNode
  showTicker?: boolean
  className?: string
}) {
  return (
    <div className={cn('motion-landing-light relative overflow-x-hidden bg-[#f8fafc] text-slate-900', className)}>
      <ParallaxFloat speed={0.18} className="-left-24 top-32 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />
      <ParallaxFloat speed={-0.12} className="-right-20 top-[420px] h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
      <ParallaxFloat speed={0.1} className="left-1/3 top-[900px] h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />

      {children}

      {showTicker ? <MarqueeTicker /> : null}
    </div>
  )
}
