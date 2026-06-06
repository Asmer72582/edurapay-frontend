import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const contactItems = [
  { icon: Mail, label: 'Email', value: 'support@edurapay.com' },
  { icon: Phone, label: 'Phone', value: '+91 7558724597' },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Pratilab Nivas, Shreeram Nagar, Bhingloli, Post & Tal. Mandangad, Dist. Ratnagiri - 415203',
  },
]

export function ContactPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f8fafc] text-slate-900 lg:h-full lg:overflow-hidden">
      <header className="shrink-0 border-b border-violet-100/80 bg-gradient-to-b from-violet-50/70 to-[#f8fafc] px-4 py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Request a demo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            See EduraPay live for your institute
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Share a few details and our team will schedule a walkthrough — fee setup, payment links, student portal,
            and settlements.
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-4 py-5 lg:overflow-hidden lg:px-8 lg:py-6">
        <div className="mx-auto flex h-full max-w-7xl flex-col">
          <div className="grid items-start gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:gap-6 lg:overflow-hidden">
            <div className="flex flex-col gap-3 lg:col-span-1 lg:shrink-0">
              {contactItems.map((item) => (
                <Card key={item.label} className="shrink-0 border-slate-200/80 bg-white/90 shadow-sm">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{item.label}</div>
                      <div className="break-words text-sm text-slate-600">{item.value}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="hidden shrink-0 border-violet-500/30 bg-violet-500/5 lg:block">
                <CardContent className="flex items-start gap-3 p-4">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <p className="text-sm text-slate-600">
                    Typical demo: 30 minutes covering collections, reminders, defaulters, and audit-ready reports.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="min-w-0 lg:col-span-2">
              <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-violet-500/5">
                <CardHeader className="space-y-1 p-5 pb-0">
                  <CardTitle className="text-lg">Book your demo</CardTitle>
                  <p className="text-sm text-slate-600">We respond within one business day.</p>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                  <DemoRequestForm variant="demo" compact />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
