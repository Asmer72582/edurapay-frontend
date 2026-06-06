import { useEffect, useState } from 'react'
import { Bell, Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { icon: Bell, title: 'Reminder sent', sub: 'WhatsApp · Fee due in 2 days', color: 'violet' },
  { icon: Zap, title: 'Payment received', sub: '₹12,875 · Receipt generated', color: 'sky' },
  { icon: Check, title: 'Ledger updated', sub: 'Reconciliation report synced', color: 'emerald' },
]

export function RemindersCinematic() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % STEPS.length), 2800)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="relative space-y-4">
      <div className="motion-pulse-beam absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-500/10 via-transparent to-sky-500/10" />
      {STEPS.map((item, i) => {
        const isActive = i === active
        const Icon = item.icon
        return (
          <div
            key={item.title}
            className={cn(
              'motion-reminder-card relative rounded-2xl border bg-white p-5 shadow-sm transition-all duration-700',
              isActive
                ? 'motion-reminder-active z-10 scale-[1.02] border-violet-300 shadow-xl shadow-violet-500/15'
                : 'scale-[0.98] border-slate-200/80 opacity-70',
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'motion-icon-spin flex h-12 w-12 items-center justify-center rounded-xl',
                  item.color === 'violet' && 'bg-violet-100 text-violet-600',
                  item.color === 'sky' && 'bg-sky-100 text-sky-600',
                  item.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.sub}</p>
              </div>
            </div>
            {isActive && <div className="motion-progress-bar mt-4 h-1 overflow-hidden rounded-full bg-violet-100" />}
          </div>
        )
      })}
    </div>
  )
}
