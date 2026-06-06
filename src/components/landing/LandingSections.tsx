import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DashboardPreview } from './DashboardPreview'
import {
  GraphiteBackdrop,
  GraphitePanel,
  GraphiteRings,
  MarqueeStrip,
  PaymentLinkVisual,
  ProductBento,
  SettlementVisual,
  StudentPortalVisual,
} from './LandingVisuals'
import {
  howItWorks,
  instituteProblems,
  platformSolutions,
  testimonials,
  trustBadges,
} from './landing-content'

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      <span className="h-px w-6 bg-gradient-to-r from-cyan-500/80 to-transparent" />
      {children}
    </p>
  )
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <GraphiteBackdrop variant="hero" />
      <GraphiteRings className="right-0 top-20 hidden opacity-40 xl:block" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            Built for colleges, coaching & training institutes
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] dark:text-white">
            Stop chasing fees.{' '}
            <span className="bg-gradient-to-r from-slate-700 via-cyan-700 to-sky-600 bg-clip-text text-transparent dark:from-slate-200 dark:via-cyan-300 dark:to-sky-400">
              Start collecting with confidence.
            </span>
          </h1>

          <p className="max-w-xl text-pretty text-lg text-slate-600 dark:text-slate-400">
            EduraPay replaces spreadsheets, manual UTR tracking, and endless parent calls with one platform —
            payment links, live dashboards, student portals, and settlement-ready finance ops.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/contact">
              <Button
                size="lg"
                className="rounded-xl border border-cyan-600/20 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/20 hover:from-slate-700 hover:to-slate-800 dark:from-slate-100 dark:to-slate-200 dark:text-slate-900"
              >
                Book a free demo <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="rounded-xl border-slate-300/80 bg-white/50 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/40">
                Explore features
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1 text-[11px] text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400"
              >
                <Check className="h-3 w-3 text-cyan-600" /> {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="landing-shine pointer-events-none absolute inset-0 z-20 rounded-2xl" />
          <DashboardPreview className="mx-auto w-full max-w-lg lg:max-w-none" />
        </div>
      </div>
    </section>
  )
}

export function ProductShowcaseSection() {
  return (
    <section className="relative py-20">
      <GraphiteBackdrop />
      <div className="landing-section relative">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Product</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            See the platform in action
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Payment links, student portal, and settlement intelligence — visualized the way your team works.
          </p>
        </div>
        <div className="mt-14">
          <ProductBento />
        </div>
      </div>
    </section>
  )
}

export function FlowVisualSection() {
  return (
    <section className="landing-graphite-band relative overflow-hidden py-20">
      <div className="landing-dots absolute inset-0 opacity-[0.08]" />
      <div className="landing-section relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel>Workflow</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From link to ledger in one flow
            </h2>
            <p className="mt-4 text-slate-400">
              Finance sends a link → student pays on phone → webhook confirms → dashboard and settlement update
              instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {['Send link', 'Student pays', 'Webhook OK', 'Settled'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-xs font-bold text-cyan-300">
                    {i + 1}
                  </div>
                  <span className="text-sm text-slate-300">{step}</span>
                  {i < 3 && <ArrowRight className="hidden h-4 w-4 text-slate-600 sm:block" />}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentLinkVisual />
            <StudentPortalVisual />
            <div className="sm:col-span-2">
              <SettlementVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProblemsSection() {
  return (
    <section className="relative border-y border-slate-200/60 py-20 dark:border-slate-800">
      <GraphiteBackdrop />
      <div className="landing-section relative">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>The problem</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Why institutes struggle with fee operations
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Sound familiar? Most education finance teams face the same bottlenecks every admission season.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instituteProblems.map((item, i) => (
            <GraphitePanel
              key={item.problem}
              className="group transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-900/10"
              glow={i === 0}
            >
              <div className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold leading-snug text-slate-900 dark:text-white">{item.problem}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.impact}</p>
              </div>
            </GraphitePanel>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SolutionsSection() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/50 to-transparent dark:via-slate-900/30" />
      <div className="landing-section relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel>The solution</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              How EduraPay fixes it end-to-end
            </h2>
            <p className="mt-3 max-w-lg text-slate-600 dark:text-slate-400">
              From sending the first payment link to reconciling college payouts — one platform your accounts,
              admin, and leadership teams can trust.
            </p>
            <Link to="/solutions" className="mt-6 inline-block">
              <Button variant="outline" className="rounded-xl border-slate-300 dark:border-slate-600">
                See full solutions <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {platformSolutions.map((item) => (
              <GraphitePanel
                key={item.title}
                className="group p-5 transition-all hover:border-cyan-500/30"
                glow
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 transition-colors group-hover:bg-cyan-600 group-hover:text-white dark:bg-slate-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              </GraphitePanel>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  return (
    <section className="relative border-y border-slate-200/60 py-20 dark:border-slate-800">
      <GraphiteBackdrop variant="dark" className="opacity-30 dark:opacity-50" />
      <div className="landing-section relative">
        <div className="text-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Go live in four simple steps
          </h2>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step) => (
            <GraphitePanel key={step.step} className="relative p-6" glow>
              <div className="text-3xl font-bold text-cyan-500/25">{step.step}</div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
            </GraphitePanel>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BeforeAfterSection() {
  const before = ['Excel fee registers', 'Manual UTR matching', 'No defaulter visibility', 'Receipts via WhatsApp']
  const after = ['Live institute dashboard', 'Webhook-verified payments', 'Monthly defaulter lists', 'Auto PDF receipts']

  return (
    <section className="landing-section py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Before vs after EduraPay
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <GraphitePanel className="border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Without EduraPay
            </div>
            <ul className="space-y-3">
              {before.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <X className="h-4 w-4 shrink-0 text-rose-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </GraphitePanel>
        <GraphitePanel className="border-cyan-500/25 bg-cyan-50/30 dark:bg-cyan-950/15" glow>
          <div className="p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              With EduraPay
            </div>
            <ul className="space-y-3">
              {after.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 shrink-0 text-cyan-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </GraphitePanel>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  return (
    <section className="relative border-y border-slate-200/60 py-20 dark:border-slate-800">
      <GraphiteBackdrop />
      <div className="landing-section relative">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Trusted by institute leaders
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <GraphitePanel key={t.name} className="p-6">
              <div className="mb-4 flex gap-1 text-cyan-500">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-sm">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-700">
                <div className="font-semibold text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </GraphitePanel>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-300/60 bg-white/50 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/40">
      <GraphiteBackdrop variant="hero" className="rounded-3xl" />
      <div className="relative mx-auto max-w-3xl space-y-4 px-6 py-14 text-center md:px-12 md:py-16">
        {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
          {title}
        </h1>
        {description && <p className="text-lg text-slate-600 dark:text-slate-400">{description}</p>}
        {children}
      </div>
    </section>
  )
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  className,
}: {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}) {
  return (
    <GraphitePanel
      className={cn('group h-full transition-all hover:-translate-y-0.5 hover:border-cyan-500/25', className)}
      glow
    >
      <div className="space-y-3 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 transition-colors group-hover:bg-cyan-600 group-hover:text-white dark:bg-slate-700">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </GraphitePanel>
  )
}

export { DashboardPreview, MarqueeStrip, ProductBento, GraphiteBackdrop }
