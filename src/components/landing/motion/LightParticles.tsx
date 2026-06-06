import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export function LightParticles({
  count = 36,
  variant = 'default',
}: {
  count?: number
  variant?: 'default' | 'light-on-dark'
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        top: `${(i * 23) % 100}%`,
        size: 2 + (i % 3),
        delay: `${(i % 12) * 0.4}s`,
        duration: `${4 + (i % 5)}s`,
      })),
    [count],
  )

  const dotClass =
    variant === 'light-on-dark'
      ? 'bg-white/40 motion-particle-light-on-dark'
      : 'bg-violet-400/30 motion-particle-light'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn('motion-particle absolute rounded-full', dotClass)}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}
