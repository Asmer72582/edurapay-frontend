import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/brand/BrandLogo'
import {
  ArrowRight,
  Lock,
  Shield,
  Sparkles,
} from 'lucide-react'
import { CinematicBackdrop } from '@/components/landing/motion/CinematicBackdrop'
import { FeatureHighlightsGrid } from '@/components/landing/motion/FeatureHighlightsGrid'
import { FloatingHeroBadges } from '@/components/landing/motion/FloatingHeroBadges'
import { KineticReveal, KineticTitle } from '@/components/landing/motion/KineticReveal'
import { LandingFaqSection } from '@/components/landing/motion/LandingFaqSection'
import { LightParticles } from '@/components/landing/motion/LightParticles'
import { MarqueeTicker } from '@/components/landing/motion/MarqueeTicker'
import { ParallaxFloat, ParallaxSection } from '@/components/landing/motion/ParallaxSection'
import { RemindersCinematic } from '@/components/landing/motion/RemindersCinematic'
import { ProductTourShowcase } from '@/components/landing/motion/ProductTourShowcase'
import { UiShowcaseHero3D } from '@/components/landing/motion/UiShowcase3D'
import { Button } from '@/components/ui/button'

export function MotionHome() {
  return (
    <div className="motion-landing-light relative overflow-x-hidden bg-[#f8fafc] text-slate-900">
      <ParallaxFloat speed={0.22} className="-left-32 top-40 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
      <ParallaxFloat speed={-0.15} className="-right-24 top-[480px] h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />
      <ParallaxFloat speed={0.12} className="left-1/4 top-[1200px] h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
      <ParallaxFloat speed={-0.08} className="right-[10%] top-[2000px] h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />

      {/* HERO */}
      <ParallaxSection speed={0.06} className="relative overflow-hidden pb-16 pt-24 lg:pb-24 lg:pt-28">
        <CinematicBackdrop variant="hero" />
        <LightParticles count={64} />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12 lg:px-8 xl:gap-16">
          <div className="motion-stagger-parent motion-revealed motion-parallax-content max-w-xl lg:py-4">
            <div className="motion-stagger-item motion-hero-badge-pulse mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 animate-pulse text-violet-500" />
              Fintech for education
            </div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl" style={{ perspective: '800px' }}>
              <span className="motion-hero-line text-slate-900">One Platform.</span>
              <span className="motion-hero-line mt-1 block bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 bg-[length:200%_auto] bg-clip-text text-transparent motion-shimmer-text">
                Every Fee.
              </span>
              <span className="motion-hero-line mt-1 block text-slate-700">Zero Hassle.</span>
            </h1>

            <p className="motion-stagger-item mt-6 max-w-xl text-lg text-slate-600">
              India&apos;s modern fee management platform — collect, remind, reconcile, and report from one
              beautiful dashboard.
            </p>

            <div className="motion-stagger-item mt-10 flex flex-wrap gap-4">
              <Link to="/contact">
                <Button
                  size="lg"
                  className="motion-float h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold shadow-lg shadow-violet-500/25 hover:opacity-95"
                >
                  Request demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-slate-300 bg-white px-8 text-base text-slate-700 hover:bg-slate-50"
                >
                  Partner with us
                </Button>
              </Link>
            </div>
          </div>

          <div className="motion-parallax-float-slow relative flex w-full items-center justify-center lg:min-h-[420px]">
            <div className="relative w-full max-w-[440px] px-2 sm:px-0">
              <FloatingHeroBadges />
              <UiShowcaseHero3D />
            </div>
          </div>
        </div>
      </ParallaxSection>

      <MarqueeTicker />

      {/* FEATURES */}
      <ParallaxSection speed={0.1} className="relative border-y border-slate-200/80 bg-white py-20 lg:py-24">
        <CinematicBackdrop variant="subtle" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
          <KineticTitle
            center
            eyebrow="Platform"
            title="Everything you need to run fee operations"
            subtitle="From collection setup to parent notifications — built for Indian institutes."
          />
          <div className="mt-14">
            <FeatureHighlightsGrid />
          </div>
        </div>
      </ParallaxSection>

      {/* PRODUCT TOUR */}
      <ParallaxSection speed={0.08} className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <KineticTitle
            center
            eyebrow="Product tour"
            title="See EduRaPay in action"
            subtitle="Click any step to preview real institute screens — students, payments, receipts, and reports."
          />
          <div className="mt-12">
            <ProductTourShowcase autoPlay />
          </div>
        </div>
      </ParallaxSection>

      {/* REMINDERS */}
      <ParallaxSection speed={0.12} className="relative overflow-hidden bg-gradient-to-b from-violet-50/80 to-white py-20 lg:py-24">
        <CinematicBackdrop variant="subtle" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <KineticReveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Automated reminders</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Never chase payments again</h2>
              <p className="mt-4 text-slate-600">
                Fee due → auto reminder → WhatsApp, SMS, email → payment received. Parents stay informed without
                manual follow-ups.
              </p>
              <ul className="motion-flow-line mt-8 space-y-3">
                {['Multi-channel dunning sequences', 'Due date alerts for guardians', 'Payment confirmations instantly'].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-3 text-slate-700">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </KineticReveal>
            <RemindersCinematic />
          </div>
        </div>
      </ParallaxSection>

      {/* SECURITY */}
      <ParallaxSection speed={0.09} className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <KineticReveal className="flex justify-center">
              <div className="motion-shield-pulse relative flex h-44 w-44 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                <div className="motion-orbit-ring absolute inset-0 rounded-full border border-violet-300/30" />
                <Shield className="relative h-24 w-24 text-violet-600" />
              </div>
            </KineticReveal>
            <KineticReveal>
              <h2 className="text-3xl font-bold text-slate-900">Security you can trust</h2>
              <ul className="motion-flow-line mt-8 space-y-3">
                {[
                  'Bank-grade security & Razorpay checkout',
                  'Encrypted transactions & secure webhooks',
                  'Role-based access for institute staff',
                  'Audit logs for compliance',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-700">
                    <Lock className="h-5 w-5 text-violet-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/security" className="mt-6 inline-block font-medium text-violet-600 hover:underline">
                Learn more about security →
              </Link>
            </KineticReveal>
          </div>
        </div>
      </ParallaxSection>

      <LandingFaqSection />

      {/* CTA */}
      <ParallaxSection
        speed={0.05}
        className="motion-cta-glow relative overflow-hidden border-t border-slate-200/80 bg-[length:200%_200%] bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 py-24 text-white"
      >
        <CinematicBackdrop variant="cta" />
        <LightParticles count={48} variant="light-on-dark" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
          <div className="motion-logo-orbit mx-auto mb-8 inline-flex max-w-full rounded-2xl bg-white px-6 py-5 shadow-2xl shadow-violet-950/25 sm:px-10 sm:py-7">
            <BrandLogo variant="full" size="hero" />
          </div>
          <p className="text-lg text-violet-100/95">www.edurapay.in</p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="motion-float rounded-xl bg-white px-8 text-violet-700 hover:bg-violet-50">
                Schedule demo
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/40 bg-transparent px-8 text-white hover:bg-white/10"
              >
                Contact sales
              </Button>
            </Link>
          </div>
        </div>
      </ParallaxSection>
    </div>
  )
}
