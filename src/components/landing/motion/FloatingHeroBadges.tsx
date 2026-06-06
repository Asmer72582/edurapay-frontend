import { IndianRupee, Sparkles, TrendingUp, Zap } from 'lucide-react'

const BADGES = [
  { icon: IndianRupee, label: '₹2.4L', sub: 'collected today', className: 'motion-float-badge-a -left-2 top-6 xl:-left-4' },
  { icon: TrendingUp, label: '98%', sub: 'on-time pay', className: 'motion-float-badge-b -right-2 top-[22%] xl:-right-4' },
  { icon: Zap, label: 'Live', sub: 'reconciliation', className: 'motion-float-badge-c -right-1 bottom-10 xl:right-0' },
  { icon: Sparkles, label: 'Auto', sub: 'reminders', className: 'motion-float-badge-d -left-1 bottom-[18%] xl:-left-3' },
]

export function FloatingHeroBadges() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block" aria-hidden>
      {BADGES.map((b) => (
        <div
          key={b.label}
          className={`motion-float-badge absolute flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg shadow-violet-500/15 backdrop-blur-sm ${b.className}`}
        >
          <b.icon className="h-4 w-4 shrink-0 text-violet-600" />
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight text-slate-900">{b.label}</p>
            <p className="text-[10px] leading-tight text-slate-500">{b.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
