import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { allFeatures } from '@/components/landing/landing-content'
import { MarqueeTicker } from '@/components/landing/motion/MarqueeTicker'
import { MotionFeatureCard } from '@/components/landing/motion/MotionFeatureCard'
import { MotionPageCta } from '@/components/landing/motion/MotionPageCta'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionReveal, MotionStaggerGrid } from '@/components/landing/motion/MotionStaggerGrid'
import { Button } from '@/components/ui/button'

const categories = [...new Set(allFeatures.map((f) => f.category).filter(Boolean))] as string[]

export function FeaturesPage() {
  return (
    <MotionPageLayout>
      <MotionPageHero
        eyebrow="Features"
        title="Everything institutes need to run fee operations"
        description="From payment links to settlements — built for scale, security, and the way Indian education finance actually works."
      />

      <MarqueeTicker />

      <MotionSection variant="band">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <MotionReveal from="left" className="motion-parallax-float-slow order-2 lg:order-1">
            <DashboardPreview className="mx-auto w-full max-w-lg" />
          </MotionReveal>
          <MotionReveal from="right" className="order-1 space-y-4 lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">A dashboard your team will actually use</h2>
            <p className="text-slate-600">
              Collections, students, payment links, defaulters, and reports — designed for institute admins and finance
              staff, not engineers.
            </p>
            <Link to="/contact">
              <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
                See it live <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </MotionReveal>
        </div>
      </MotionSection>

      {categories.map((category, idx) => (
        <MotionSection
          key={category}
          variant={idx % 2 === 1 ? 'band' : 'bordered'}
          eyebrow="Capability"
          title={category}
          speed={0.06 + idx * 0.01}
        >
          <MotionStaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allFeatures
              .filter((f) => f.category === category)
              .map((f) => (
                <MotionFeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} />
              ))}
          </MotionStaggerGrid>
        </MotionSection>
      ))}

      <MotionPageCta title="Want a guided walkthrough?" subtitle="We'll demo the features that matter most for your institute size and fee structure." />
    </MotionPageLayout>
  )
}
