import { Link2, Receipt, Shield, Smartphone, TrendingUp, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Cool graphite mesh + grid backdrop for sections */
export function GraphiteBackdrop({ className, variant = 'default' }: { className?: string; variant?: 'default' | 'hero' | 'dark' }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className={cn(
          'absolute inset-0',
          variant === 'dark'
            ? 'bg-[#0c0e12]'
            : variant === 'hero'
              ? 'bg-gradient-to-b from-slate-100 via-slate-50/80 to-background dark:from-[#0a0c10] dark:via-[#0d1016] dark:to-background'
              : 'bg-gradient-to-b from-slate-100/90 to-background dark:from-zinc-950/90 dark:to-background',
        )}
      />
      <div className="landing-mesh absolute inset-0 opacity-80" />
      <div className="landing-dots absolute inset-0 opacity-[0.35]" />
      <div className="absolute -left-[20%] top-0 h-[50%] w-[60%] rounded-full bg-cyan-500/[0.07] blur-[100px] dark:bg-cyan-400/[0.06]" />
      <div className="absolute -right-[15%] bottom-0 h-[45%] w-[55%] rounded-full bg-slate-400/[0.12] blur-[90px] dark:bg-slate-500/[0.08]" />
      <div className="absolute left-1/2 top-1/3 h-32 w-32 -translate-x-1/2 rounded-full bg-sky-500/[0.05] blur-3xl" />
      <div className="landing-noise absolute inset-0 opacity-[0.03] mix-blend-overlay" />
    </div>
  )
}

export function GraphitePanel({
  children,
  className,
  glow = false,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-300/60 bg-white/70 shadow-xl shadow-slate-900/[0.06] backdrop-blur-xl',
        'dark:border-slate-700/50 dark:bg-slate-900/60 dark:shadow-black/40',
        glow && 'ring-1 ring-cyan-500/20 dark:ring-cyan-400/15',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      {children}
    </div>
  )
}

/** Floating metric chips around dashboard */
export function FloatingMetric({
  label,
  value,
  className,
  delay = 0,
}: {
  label: string
  value: string
  className?: string
  delay?: number
}) {
  return (
    <div
      className={cn(
        'landing-float absolute z-10 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-md',
        'dark:border-slate-600/60 dark:bg-slate-800/95 dark:shadow-black/30',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-[9px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}

/** Mini payment link UI card */
export function PaymentLinkVisual({ className }: { className?: string }) {
  return (
    <GraphitePanel className={cn('p-4', className)} glow>
      <div className="flex items-center gap-2 text-[10px] font-medium text-cyan-600 dark:text-cyan-400">
        <Link2 className="h-3.5 w-3.5" /> Payment link sent
      </div>
      <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/50">
        <div className="text-xs text-slate-500">May 2026 · Tuition</div>
        <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">₹41,200</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-600 to-sky-500" />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>Student: Asmer C.</span>
          <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
        </div>
      </div>
    </GraphitePanel>
  )
}

/** Student portal mini mock */
export function StudentPortalVisual({ className }: { className?: string }) {
  return (
    <GraphitePanel className={cn('p-4', className)}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white dark:bg-slate-700">
          <Smartphone className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white">Student portal</div>
          <div className="text-[10px] text-slate-500">Pay · Receipts · History</div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {['Tuition May', 'Bus Q2', 'Exam fee'].map((fee, i) => (
          <div
            key={fee}
            className="flex items-center justify-between rounded-lg border border-slate-200/60 px-2.5 py-2 dark:border-slate-700/80"
          >
            <span className="text-[10px] text-slate-600 dark:text-slate-300">{fee}</span>
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[9px] font-medium',
                i === 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
              )}
            >
              {i === 0 ? 'Paid' : 'Due'}
            </span>
          </div>
        ))}
      </div>
    </GraphitePanel>
  )
}

/** Settlement split visual */
export function SettlementVisual({ className }: { className?: string }) {
  const rows = [
    { label: 'College', pct: 94, color: 'from-slate-600 to-slate-500' },
    { label: 'Razorpay MDR', pct: 4, color: 'from-rose-500/80 to-rose-400/60' },
    { label: 'EduraPay', pct: 2, color: 'from-cyan-600 to-sky-500' },
  ]
  return (
    <GraphitePanel className={cn('p-4', className)} glow>
      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600 dark:text-slate-300">
        <Receipt className="h-3.5 w-3.5 text-cyan-600" /> Settlement split
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="w-[94%] bg-gradient-to-r from-slate-600 to-slate-500" />
        <div className="w-[4%] bg-rose-500/70" />
        <div className="w-[2%] bg-gradient-to-r from-cyan-600 to-sky-500" />
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">{r.label}</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{r.pct}%</span>
          </div>
        ))}
      </div>
    </GraphitePanel>
  )
}

/** Scrolling marquee of capabilities */
export function MarqueeStrip() {
  const items = [
    'Payment links',
    'UPI & cards',
    'Defaulter tracking',
    'Webhook verified',
    'PDF receipts',
    'Guardian portal',
    'Settlement reports',
    'Multi-institute',
    'RBAC',
    'Live dashboard',
  ]
  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-slate-200/60 bg-slate-900 py-4 dark:border-slate-800">
      <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-900 to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-900 to-transparent" />
      <div className="landing-marquee flex w-max gap-8">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-2 text-sm font-medium tracking-wide text-slate-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/80" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Bento grid product showcase */
export function ProductBento() {
  return (
    <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2">
      <div className="relative overflow-hidden rounded-2xl border border-slate-300/50 bg-gradient-to-br from-slate-800 to-slate-950 p-6 text-white shadow-2xl md:col-span-3 md:row-span-2 dark:border-slate-700/50">
        <div className="landing-dots absolute inset-0 opacity-20" />
        <div className="relative">
          <Wallet className="h-8 w-8 text-cyan-400" />
          <h3 className="mt-4 text-xl font-bold">Collect fees in minutes</h3>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Send links, track opens, and watch payments land on your dashboard — no spreadsheets.
          </p>
          <div className="mt-6 flex gap-3">
            {['UPI', 'Cards', 'Netbanking'].map((m) => (
              <span key={m} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="md:col-span-2">
        <PaymentLinkVisual className="h-full" />
      </div>

      <div className="md:col-span-1">
        <GraphitePanel className="flex h-full flex-col justify-center p-4 text-center" glow>
          <TrendingUp className="mx-auto h-6 w-6 text-cyan-600" />
          <div className="mt-2 text-2xl font-bold tabular-nums">+18%</div>
          <div className="text-[10px] text-slate-500">Collections MoM</div>
        </GraphitePanel>
      </div>

      <div className="md:col-span-2">
        <StudentPortalVisual className="h-full" />
      </div>

      <div className="md:col-span-1">
        <GraphitePanel className="flex h-full flex-col items-center justify-center p-4" glow>
          <Shield className="h-6 w-6 text-cyan-600" />
          <div className="mt-2 text-center text-[10px] font-medium text-slate-600 dark:text-slate-300">
            Webhook verified
          </div>
        </GraphitePanel>
      </div>

      <div className="md:col-span-3">
        <SettlementVisual />
      </div>
    </div>
  )
}

/** Decorative connector line between steps */
export function StepConnector({ active }: { active?: boolean }) {
  return (
    <div
      className={cn(
        'hidden h-px flex-1 lg:block',
        active
          ? 'bg-gradient-to-r from-cyan-500/60 via-slate-400/30 to-transparent'
          : 'bg-gradient-to-r from-slate-300/50 to-transparent dark:from-slate-700/50',
      )}
    />
  )
}

/** Abstract ring decoration */
export function GraphiteRings({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute', className)} aria-hidden>
      <div className="h-64 w-64 rounded-full border border-slate-300/30 dark:border-slate-600/30" />
      <div className="absolute left-8 top-8 h-48 w-48 rounded-full border border-cyan-500/20" />
      <div className="absolute left-16 top-16 h-32 w-32 rounded-full border border-slate-400/20 dark:border-slate-500/20" />
    </div>
  )
}
