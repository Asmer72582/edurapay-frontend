import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionStaggerGrid } from '@/components/landing/motion/MotionStaggerGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ContactPage() {
  return (
    <MotionPageLayout>
      <MotionPageHero
        eyebrow="Request a demo"
        title="See EduraPay live for your institute"
        description="Share a few details and our team will schedule a walkthrough — fee setup, payment links, student portal, and settlements."
      />

      <MotionSection speed={0}>
        <div className="grid gap-8 lg:grid-cols-3">
          <MotionStaggerGrid className="flex flex-col gap-4 lg:col-span-1">
            {[
              { icon: Mail, label: 'Email', value: 'support@edurapay.com' },
              { icon: Phone, label: 'Phone', value: '+91 7558724597' },
              { icon: MapPin, label: 'Office', value: 'Pratilab Nivas, Shreeram Nagar, Bhingloli, Post & Tal. Mandangad, Dist. Ratnagiri - 415203' },
            ].map((item) => (
              <Card key={item.label} className="border-slate-200/80 bg-white/90 shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-600">{item.value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-violet-500/30 bg-violet-500/5">
              <CardContent className="flex items-start gap-3 p-5">
                <MessageSquare className="mt-0.5 h-5 w-5 text-violet-600" />
                <p className="text-sm text-slate-600">
                  Typical demo: 30 minutes covering collections, reminders, defaulters, and audit-ready reports for
                  your institute type.
                </p>
              </CardContent>
            </Card>
          </MotionStaggerGrid>

          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-violet-500/5">
              <CardHeader>
                <CardTitle>Book your demo</CardTitle>
                <p className="text-sm text-slate-600">We respond within one business day.</p>
              </CardHeader>
              <CardContent>
                <DemoRequestForm variant="demo" />
              </CardContent>
            </Card>
          </div>
        </div>
      </MotionSection>
    </MotionPageLayout>
  )
}
