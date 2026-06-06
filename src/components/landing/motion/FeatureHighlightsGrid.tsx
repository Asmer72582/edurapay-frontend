import { FEATURE_HIGHLIGHTS } from '@/components/landing/landing-showcase'
import { useReveal } from '@/components/landing/motion/useReveal'
import { cn } from '@/lib/utils'

export function FeatureHighlightsGrid() {
  const { ref, visible, className: revealCls } = useReveal(0.12)

  return (
    <div
      ref={ref}
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', revealCls, visible && 'motion-features-visible')}
    >
      {FEATURE_HIGHLIGHTS.map((f) => (
        <div
          key={f.id}
          className="motion-feature-card group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-2 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/15"
        >
          <div className="motion-feature-icon flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25">
            <f.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
        </div>
      ))}
    </div>
  )
}
