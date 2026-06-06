import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CinematicBackdrop } from '@/components/landing/motion/CinematicBackdrop'
import { LightParticles } from '@/components/landing/motion/LightParticles'
import { ParallaxSection } from '@/components/landing/motion/ParallaxSection'
import { KineticReveal } from '@/components/landing/motion/KineticReveal'
import { Button } from '@/components/ui/button'

export function MotionPageCta({
  title = 'Ready to modernize fee collection?',
  subtitle = 'Book a demo and see EduraPay configured for your institute in under 30 minutes.',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <ParallaxSection
      speed={0.05}
      className="motion-cta-glow relative overflow-hidden border-t border-slate-200/80 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 py-20 text-white lg:py-24"
    >
      <CinematicBackdrop variant="cta" />
      <LightParticles count={36} variant="light-on-dark" />
      <div className="landing-section relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-8">
        <KineticReveal>
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-violet-100">{subtitle}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="motion-float rounded-xl bg-white px-8 text-violet-700 hover:bg-violet-50">
                Schedule demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/40 bg-transparent px-8 text-white hover:bg-white/10"
              >
                Contact us
              </Button>
            </Link>
          </div>
        </KineticReveal>
      </div>
    </ParallaxSection>
  )
}
