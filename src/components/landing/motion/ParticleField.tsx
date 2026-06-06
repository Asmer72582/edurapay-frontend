import { useMemo } from 'react'

export function ParticleField({ count = 48 }: { count?: number }) {
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

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="motion-particle absolute rounded-full bg-cyan-400/40"
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(6,182,212,0.12),transparent_45%)]" />
    </div>
  )
}
