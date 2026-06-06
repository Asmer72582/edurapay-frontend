import type { LucideIcon } from 'lucide-react'
import { GraphitePanel } from './LandingVisuals'

export function StatsGrid({ items }: { items: { label: string; value: string | number; icon: LucideIcon }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <GraphitePanel key={item.label} className="group transition-all hover:-translate-y-0.5" glow>
          <div className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100 text-cyan-700 dark:border-slate-600 dark:bg-slate-800 dark:text-cyan-300">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{item.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{item.label}</div>
            </div>
          </div>
        </GraphitePanel>
      ))}
    </div>
  )
}

export function FeatureGrid({ features }: { features: { title: string; description: string; icon: LucideIcon }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <GraphitePanel key={f.title} className="group p-6 transition-all hover:-translate-y-0.5 hover:border-cyan-500/25">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 group-hover:bg-cyan-600 group-hover:text-white dark:bg-slate-700">
            <f.icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{f.description}</p>
        </GraphitePanel>
      ))}
    </div>
  )
}
