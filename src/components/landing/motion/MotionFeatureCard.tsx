import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MotionFeatureCard({
  title,
  description,
  icon: Icon,
  className,
  accent,
}: {
  title: string
  description: string
  icon: LucideIcon
  className?: string
  accent?: 'violet' | 'emerald' | 'rose'
}) {
  const accents = {
    violet: 'bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
    emerald: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
    rose: 'bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white',
  }

  return (
    <div
      className={cn(
        'group h-full rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/60 hover:shadow-lg hover:shadow-violet-500/10',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300',
          accents[accent ?? 'violet'],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}
