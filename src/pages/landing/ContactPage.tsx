import { Calendar, Mail, MapPin, MessageSquare, Phone, Sparkles } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'
import { MarqueeTicker } from '@/components/landing/motion/MarqueeTicker'
import { MotionFeatureCard } from '@/components/landing/motion/MotionFeatureCard'
import { MotionPageCta } from '@/components/landing/motion/MotionPageCta'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionReveal, MotionStaggerGrid } from '@/components/landing/motion/MotionStaggerGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const contactItems: {
  icon: typeof Mail
  label: string
  value: string
  href?: string
}[] = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@edurapay.com',
    href: 'mailto:support@edurapay.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 7558724597',
    href: 'tel:+917558724597',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Pratilab Nivas, Shreeram Nagar, Bhingloli, Post & Tal. Mandangad, Dist. Ratnagiri - 415203',
  },
]

const demoHighlights = [
  {
    title: '30-minute live walkthrough',
    description: 'See fee plans, payment links, student portal, and collections dashboard configured for your institute type.',
    icon: Calendar,
  },
  {
    title: 'Implementation guidance',
    description: 'We help you plan student import, Razorpay setup, reminders, and your first payment campaign.',
    icon: Sparkles,
  },
  {
    title: 'Dedicated follow-up',
    description: 'Our team responds within one business day with next steps tailored to your size and cities.',
    icon: MessageSquare,
  },
]

export function ContactPage() {
  return (
    <MotionPageLayout>
      <MotionPageHero
        eyebrow="Request a demo"
        title="See EduraPay live for your institute"
        description="Share a few details and our team will schedule a walkthrough — fee setup, payment links, student portal, and settlements."
      />

      <MarqueeTicker />

      <MotionSection eyebrow="Get in touch" title="Book your demo" centerTitle>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-3">
          <MotionReveal from="left" className="flex flex-col gap-4 lg:col-span-1">
            {contactItems.map((item) => (
              <Card key={item.label} className="border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">{item.label}</div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="break-words text-sm text-violet-700 hover:text-violet-900 hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="break-words text-sm text-slate-600">{item.value}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-violet-500/30 bg-violet-500/5">
              <CardContent className="flex items-start gap-3 p-5">
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                <p className="text-sm leading-relaxed text-slate-600">
                  Typical demo: 30 minutes covering collections, reminders, defaulters, and audit-ready reports for
                  your institute type.
                </p>
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal from="right" className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-violet-500/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Tell us about your institute</CardTitle>
                <p className="text-sm text-slate-600">We respond within one business day.</p>
              </CardHeader>
              <CardContent>
                <DemoRequestForm variant="demo" />
              </CardContent>
            </Card>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection variant="band" eyebrow="What to expect" title="Your demo session" centerTitle>
        <MotionStaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demoHighlights.map((item) => (
            <MotionFeatureCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionPageCta
        title="Prefer to talk first?"
        subtitle="Call us at +91 7558724597 or email support@edurapay.com — we're happy to answer questions before your demo."
      />
    </MotionPageLayout>
  )
}
