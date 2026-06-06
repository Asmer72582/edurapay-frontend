import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="rounded-2xl border border-primary/20 bg-primary px-8 py-12 text-primary-foreground md:px-12">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready to modernize fee collection?</h2>
        <p className="text-primary-foreground/80">
          Join institutes using EduraPay for secure collections, transparent reconciliation, and audit-grade operations.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/contact">
            <Button variant="secondary" size="lg">Book a demo</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
    </div>
  )
}
