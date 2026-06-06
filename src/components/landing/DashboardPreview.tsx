import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'
import { FloatingMetric } from './LandingVisuals'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Users, label: 'Students' },
  { icon: Wallet, label: 'Payments' },
  { icon: CreditCard, label: 'Transactions' },
  { icon: BarChart3, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
]

const bars = [42, 58, 48, 72, 65, 88, 76, 92, 84, 95, 78, 100]

export function DashboardPreview({ className = '', showFloats = true }: { className?: string; showFloats?: boolean }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      {showFloats && (
        <>
          <FloatingMetric label="Today's collections" value="₹2.4L" className="-left-4 top-8 hidden lg:block" delay={0} />
          <FloatingMetric label="Links paid" value="17/24" className="-right-2 top-24 hidden lg:block" delay={200} />
          <FloatingMetric label="Defaulters" value="12" className="-bottom-2 left-8 hidden lg:block" delay={400} />
        </>
      )}

      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-500/15 via-slate-400/10 to-slate-600/5 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-600/40 bg-[#0e1117] shadow-2xl shadow-slate-950/50 ring-1 ring-white/[0.08]">
        <div className="absolute inset-0 landing-dots opacity-[0.15]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-500/[0.06] to-transparent" />

        <div className="relative flex items-center gap-2 border-b border-white/[0.06] bg-[#0a0d12]/90 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          </div>
          <div className="mx-auto flex h-6 max-w-xs flex-1 items-center justify-center rounded-md border border-white/[0.06] bg-slate-900/80 px-3 text-[10px] text-slate-500">
            app.edurapay.com/institute
          </div>
        </div>

        <div className="relative flex min-h-[320px] text-slate-100 sm:min-h-[400px]">
          <aside className="hidden w-36 shrink-0 border-r border-white/[0.06] bg-[#0a0d12]/80 p-3 sm:block">
            <div className="mb-4 flex items-center gap-2 px-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-sky-600 text-xs font-bold text-white">
                E
              </div>
              <span className="text-xs font-semibold">EduraPay</span>
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] ${
                    item.active
                      ? 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-200'
                      : 'text-slate-500'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </div>
              ))}
            </nav>
          </aside>

          <div className="flex-1 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500">Overview · Institute</div>
                <div className="text-sm font-semibold text-white">Institute overview</div>
              </div>
              <div className="hidden rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-medium text-cyan-200 sm:block">
                View payments
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                { label: 'Total collections', value: '₹48.2L', trend: '+18.4%', up: true },
                { label: 'Total students', value: '1,248', trend: '+12', up: true },
                { label: 'Pending payments', value: '86', trend: 'Follow up', up: false },
                { label: 'Active students', value: '1,102', trend: 'Enrolled', up: true },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-white/[0.06] bg-slate-800/40 p-2.5 backdrop-blur-sm"
                >
                  <div className="text-[9px] text-slate-500">{kpi.label}</div>
                  <div className="mt-0.5 text-sm font-bold tabular-nums text-white">{kpi.value}</div>
                  <div className={`mt-0.5 text-[9px] ${kpi.up ? 'text-cyan-400' : 'text-amber-400/90'}`}>
                    {kpi.trend}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 lg:grid-cols-5">
              <div className="rounded-xl border border-white/[0.06] bg-slate-800/30 p-2.5 lg:col-span-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">Monthly collections</span>
                  <span className="text-[9px] text-cyan-500/80">Live</span>
                </div>
                <div className="flex h-28 items-end justify-between gap-1 px-1">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="w-full max-w-[14px] rounded-t bg-gradient-to-t from-cyan-700/90 via-cyan-500/70 to-sky-400/50"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-slate-800/30 p-2.5 lg:col-span-2">
                <div className="mb-2 text-[10px] font-medium text-slate-400">Recent payments</div>
                <div className="space-y-1.5">
                  {[
                    { name: 'Asmer C.', amt: '₹3,540', st: 'Paid' },
                    { name: 'Rutuja S.', amt: '₹12,360', st: 'Paid' },
                    { name: 'Swara M.', amt: '₹12,360', st: 'Paid' },
                    { name: 'Sahil S.', amt: '₹8,200', st: 'Pending' },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center justify-between text-[9px]">
                      <span className="text-slate-400">{row.name}</span>
                      <span className="font-medium tabular-nums text-slate-200">{row.amt}</span>
                      <span
                        className={
                          row.st === 'Paid'
                            ? 'rounded border border-emerald-500/20 bg-emerald-500/10 px-1 text-emerald-400'
                            : 'rounded border border-amber-500/20 bg-amber-500/10 px-1 text-amber-400/90'
                        }
                      >
                        {row.st}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
