import { cn } from '@/lib/utils'

export function CinematicBackdrop({ variant = 'hero' }: { variant?: 'hero' | 'cta' | 'subtle' }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          'motion-aurora-a absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full blur-3xl',
          variant === 'cta' ? 'bg-white/20' : 'bg-violet-400/25',
        )}
      />
      <div
        className={cn(
          'motion-aurora-b absolute -right-1/4 top-1/4 h-[500px] w-[500px] rounded-full blur-3xl',
          variant === 'cta' ? 'bg-indigo-300/20' : 'bg-sky-400/20',
        )}
      />
      <div className="motion-aurora-c absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-fuchsia-300/15 blur-3xl" />

      <div className="motion-grid-drift absolute inset-0 opacity-[0.35]" />
      <div className="motion-scanline absolute inset-0 opacity-[0.04]" />

      {variant === 'hero' && (
        <>
          <div className="motion-orbit-ring absolute left-[8%] top-[18%] h-24 w-24 rounded-full border border-violet-300/40" />
          <div className="motion-orbit-ring motion-orbit-ring-delay absolute right-[12%] top-[28%] h-16 w-16 rounded-full border border-sky-300/50" />
          <div className="motion-orbit-ring motion-orbit-ring-delay-2 absolute bottom-[20%] left-[20%] h-20 w-20 rounded-full border border-indigo-300/40" />
        </>
      )}
    </div>
  )
}
