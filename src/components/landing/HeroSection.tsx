import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection({
  title,
  subtitle,
  primaryCta = { label: 'Request a demo', href: '/contact' },
  secondaryCta = { label: 'Contact us', href: '/contact' },
}: {
  title: string
  subtitle: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative max-w-2xl space-y-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">EduraPay Platform</p>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        <p className="text-pretty text-lg text-muted-foreground">{subtitle}</p>
        <div className="flex flex-wrap gap-3">
          <Link to={primaryCta.href}>
            <Button size="lg">
              {primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={secondaryCta.href}>
            <Button variant="outline" size="lg">
              {secondaryCta.label}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
