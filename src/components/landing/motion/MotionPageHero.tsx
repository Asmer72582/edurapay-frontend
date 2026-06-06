import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { CinematicBackdrop } from '@/components/landing/motion/CinematicBackdrop'
import { LightParticles } from '@/components/landing/motion/LightParticles'
import { useReveal } from '@/components/landing/motion/useReveal'
import { cn } from '@/lib/utils'

export function MotionPageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
  className?: string
}) {
  const { ref, className: revealCls } = useReveal(0.08)

  return (
    <section className={cn('relative overflow-hidden pt-8 lg:pt-12', className)}>
      <CinematicBackdrop variant="hero" />
      <LightParticles count={40} />

      <div
        ref={ref}
        className={cn(
          revealCls,
          'motion-stagger-parent relative z-10 mx-auto max-w-3xl px-4 pb-14 pt-6 text-center lg:px-8 lg:pb-16',
        )}
      >
        {eyebrow ? (
          <div className="motion-stagger-item motion-hero-badge-pulse mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-violet-500" />
            {eyebrow}
          </div>
        ) : null}

        <h1 className="motion-stagger-item text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          <span className="motion-hero-line block">{title}</span>
        </h1>

        {description ? (
          <p className="motion-stagger-item mx-auto mt-5 max-w-2xl text-lg text-slate-600">{description}</p>
        ) : null}

        {children ? <div className="motion-stagger-item mt-8">{children}</div> : null}
      </div>
    </section>
  )
}
