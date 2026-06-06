import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { instituteProblems, platformSolutions } from '@/components/landing/landing-content'
import { MarqueeTicker } from '@/components/landing/motion/MarqueeTicker'
import { MotionFeatureCard } from '@/components/landing/motion/MotionFeatureCard'
import { MotionPageCta } from '@/components/landing/motion/MotionPageCta'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionReveal, MotionStaggerGrid } from '@/components/landing/motion/MotionStaggerGrid'
import { Button } from '@/components/ui/button'

const roleSolutions = [
  {
    role: 'Institute management',
    items: [
      'Real-time collection dashboards and GMV trends',
      'Defaulter visibility by month and course',
      'Exportable reports for board meetings',
    ],
  },
  {
    role: 'Accounts & finance',
    items: [
      'Payment links with automatic reconciliation',
      'College received vs pending payout tracking',
      'Receipt and invoice generation',
    ],
  },
  {
    role: 'Students & parents',
    items: [
      'Self-service fee portal with online pay',
      'Instant receipts after payment',
      'Guardian accounts to pay on behalf',
    ],
  },
  {
    role: 'Platform operations',
    items: [
      'Multi-institute super-admin oversight',
      'Settlement queue with MDR and net revenue',
      'Webhook-verified payment integrity',
    ],
  },
]

export function SolutionsPage() {
  return (
    <MotionPageLayout>
      <MotionPageHero
        eyebrow="Solutions"
        title="Built for how institutes actually work"
        description="EduraPay addresses the operational pain points that slow down admissions, collections, and year-end audits."
      >
        <Link to="/contact">
          <Button size="lg" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
            Talk to our team <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </MotionPageHero>

      <MarqueeTicker />

      <MotionSection
        eyebrow="The problem"
        title="Why institutes struggle with fee operations"
        subtitle="Most education finance teams face the same bottlenecks every admission season."
        centerTitle
      >
        <MotionStaggerGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instituteProblems.map((item) => (
            <MotionFeatureCard
              key={item.problem}
              title={item.problem}
              description={item.impact}
              icon={item.icon}
              accent="rose"
            />
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionSection variant="band">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <MotionReveal from="left">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Dashboard</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">See your entire institute on one screen</h2>
            <p className="mt-4 text-slate-600">
              Collections, pending payments, student counts, and recent activity — updated as parents pay. No more waiting
              for accountants to compile spreadsheets.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              {['Monthly GMV chart', 'Pending payment alerts', 'Channel mix (UPI, cards, netbanking)', 'Quick links to send new payment links'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> {item}
                  </li>
                ),
              )}
            </ul>
          </MotionReveal>
          <MotionReveal from="right" className="motion-parallax-float-slow">
            <DashboardPreview className="mx-auto w-full max-w-lg" />
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection
        eyebrow="The solution"
        title="How EduraPay fixes it end-to-end"
        subtitle="From sending the first payment link to reconciling college payouts — one platform your teams can trust."
      >
        <MotionStaggerGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platformSolutions.map((s) => (
            <MotionFeatureCard key={s.title} title={s.title} description={s.description} icon={s.icon} />
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionSection variant="band" eyebrow="By role" title="Solutions for every stakeholder" centerTitle>
        <MotionStaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2">
          {roleSolutions.map((block) => (
            <div key={block.role} className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-violet-700">{block.role}</h3>
              <ul className="mt-4 space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-600">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionSection eyebrow="Problem → solution" title="Every problem, a clear answer" centerTitle>
        <MotionStaggerGrid className="mt-10 grid gap-4 lg:grid-cols-2">
          {instituteProblems.slice(0, 4).map((problem, i) => (
            <div key={problem.problem} className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
              <div className="text-2xl font-bold text-violet-500/40">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="text-sm font-medium text-rose-600 line-through decoration-rose-300/60">{problem.problem}</div>
                <div className="mt-2 font-semibold text-emerald-700">→ {platformSolutions[i]?.title}</div>
                <p className="mt-1 text-sm text-slate-600">{platformSolutions[i]?.description}</p>
              </div>
            </div>
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionPageCta />
    </MotionPageLayout>
  )
}
