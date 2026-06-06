import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useParallax, useParallaxReveal } from '@/components/landing/motion/useParallax'

export function ParallaxSection({
  children,
  className,
  speed = 0.1,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  speed?: number
  delay?: number
}) {
  const { ref, parallaxStyle, className: revealCls } = useParallaxReveal(speed)

  return (
    <section
      ref={ref}
      className={cn('motion-parallax-section relative', revealCls, className)}
      style={{ transitionDelay: `${delay}ms`, ...parallaxStyle }}
    >
      {children}
    </section>
  )
}

export function ParallaxFloat({
  children,
  className,
  speed = 0.18,
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  const { ref, style } = useParallax(speed)
  return (
    <div ref={ref} className={cn('pointer-events-none absolute', className)} style={style}>
      {children}
    </div>
  )
}
