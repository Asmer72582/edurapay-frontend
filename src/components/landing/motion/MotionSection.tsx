import type { ReactNode } from 'react'
import { CinematicBackdrop } from '@/components/landing/motion/CinematicBackdrop'
import { ParallaxSection } from '@/components/landing/motion/ParallaxSection'
import { KineticTitle } from '@/components/landing/motion/KineticReveal'
import { cn } from '@/lib/utils'

type SectionVariant = 'default' | 'band' | 'bordered'

export function MotionSection({
  children,
  className,
  variant = 'default',
  speed = 0.08,
  containerClassName,
  eyebrow,
  title,
  subtitle,
  centerTitle = false,
}: {
  children: ReactNode
  className?: string
  variant?: SectionVariant
  speed?: number
  containerClassName?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  centerTitle?: boolean
}) {
  return (
    <ParallaxSection
      speed={speed}
      className={cn(
        'relative py-16 lg:py-20',
        variant === 'band' && 'border-y border-slate-200/80 bg-white/60',
        variant === 'bordered' && 'border-t border-slate-200/80',
        className,
      )}
    >
      {variant === 'band' ? <CinematicBackdrop variant="subtle" /> : null}
      <div className={cn('landing-section relative z-10 mx-auto max-w-7xl px-4 lg:px-8', containerClassName)}>
        {title ? (
          <KineticTitle center={centerTitle} eyebrow={eyebrow ?? 'EduraPay'} title={title} subtitle={subtitle} />
        ) : null}
        {children}
      </div>
    </ParallaxSection>
  )
}
