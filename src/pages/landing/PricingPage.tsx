import { Link } from 'react-router-dom'
import { CheckCircle2, IndianRupee, Mail, Phone } from 'lucide-react'
import { LegalEntityLink } from '@/components/landing/LegalEntityLink'
import { LegalEntityNotice } from '@/components/landing/LegalEntityNotice'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionReveal } from '@/components/landing/motion/MotionStaggerGrid'
import { Button } from '@/components/ui/button'
import { LEGAL_ENTITY } from '@/lib/brand'

const platformIncludes = [
  'Student and fee management dashboard',
  'Payment links, UPI, cards, and net banking collections',
  'Automated reminders, receipts, and reconciliation reports',
  'Role-based access for institute staff',
  'Onboarding and implementation support',
]

export function PricingPage() {
  return (
    <MotionPageLayout>
      <MotionPageHero
        eyebrow="Pricing information"
        title="Transparent pricing for educational institutes"
        description={
          <>
            EduRaPay is operated by <LegalEntityLink />. Contact us for a quote tailored to your institute size,
            branches, and collection volume.
          </>
        }
      />

      <MotionSection>
        <MotionReveal className="mx-auto max-w-3xl space-y-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm">
            <div className="flex items-start gap-3">
              <IndianRupee className="mt-0.5 h-6 w-6 shrink-0 text-violet-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Platform subscription</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  EduRaPay is offered as a subscription platform for schools, colleges, coaching centers, and training
                  institutes. Pricing depends on student volume, branches, and modules required. We provide custom quotes
                  after understanding your institute&apos;s needs — there is no one-size-fits-all public price list.
                </p>
                <ul className="mt-4 space-y-2">
                  {platformIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 rounded-xl bg-violet-600 hover:bg-violet-700">
                  <Link to="/contact">Request a demo &amp; quote</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Payment processing fees</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Online fee collections are processed through Razorpay and other authorized payment gateways. Standard
              gateway charges (as per Razorpay&apos;s prevailing rates for UPI, cards, net banking, and wallets) apply
              to successful transactions. Any platform service fee or markup, if applicable to your institute, is
              disclosed clearly in your commercial agreement before go-live.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              All payment processing and merchant services are provided through <LegalEntityLink />. Settlement timelines
              follow gateway and banking rules after successful KYC and institute configuration.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-8">
            <h2 className="text-lg font-bold text-slate-900">Questions about pricing?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Reach <LegalEntityLink variant="inherit" className="text-violet-700" /> for a personalized quote and
              implementation plan.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-700 sm:flex-row sm:gap-6">
              <a href={`mailto:${LEGAL_ENTITY.email}`} className="inline-flex items-center gap-2 hover:text-violet-700">
                <Mail className="h-4 w-4 text-violet-600" />
                {LEGAL_ENTITY.email}
              </a>
              <a href="tel:+917558724597" className="inline-flex items-center gap-2 hover:text-violet-700">
                <Phone className="h-4 w-4 text-violet-600" />
                {LEGAL_ENTITY.phone}
              </a>
            </div>
          </div>

          <LegalEntityNotice showLinks />
        </MotionReveal>
      </MotionSection>
    </MotionPageLayout>
  )
}
