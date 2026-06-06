import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '@/components/landing/LandingSections'
import { faqItems } from '@/components/landing/landing-content'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Card
      className={cn(
        'cursor-pointer border-border/60 transition-all',
        open && 'border-violet-500/30 shadow-md',
      )}
      onClick={() => setOpen(!open)}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">{q}</h3>
          <ChevronDown
            className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          />
        </div>
        {open && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>}
      </CardContent>
    </Card>
  )
}

export function FaqPage() {
  return (
    <div className="space-y-0 pb-20">
      <div className="landing-section pt-10">
        <PageHero
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know about getting started with EduraPay."
        />
      </div>

      <section className="landing-section max-w-3xl py-12">
        <div className="space-y-3">
          {faqItems.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 text-center">
          <h3 className="font-semibold">Still have questions?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Our team is happy to walk through your institute setup.</p>
          <Link to="/contact" className="mt-4 inline-block">
            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">Contact us</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
