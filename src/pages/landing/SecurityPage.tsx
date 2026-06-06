import { Database, Key, Lock, Server, ShieldCheck, Webhook, Check } from 'lucide-react'
import { MarqueeTicker } from '@/components/landing/motion/MarqueeTicker'
import { MotionFeatureCard } from '@/components/landing/motion/MotionFeatureCard'
import { MotionPageCta } from '@/components/landing/motion/MotionPageCta'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionReveal, MotionStaggerGrid } from '@/components/landing/motion/MotionStaggerGrid'
import { KineticReveal } from '@/components/landing/motion/KineticReveal'

const securityFeatures = [
  {
    title: 'Encryption in transit & at rest',
    description: 'TLS for all communications. MongoDB Atlas encryption for data at rest.',
    icon: Lock,
  },
  {
    title: 'Secure payments',
    description: 'Webhook signature verification. Never trust frontend payment success alone.',
    icon: Webhook,
  },
  {
    title: 'Authentication security',
    description: 'JWT auth with session tracking, OTP login, and role-based access control.',
    icon: Key,
  },
  {
    title: 'RBAC & tenancy',
    description: 'Institute-scoped data isolation enforced on every API request.',
    icon: ShieldCheck,
  },
  {
    title: 'Audit logs',
    description: 'Sensitive actions logged with actor, timestamp, and metadata.',
    icon: Database,
  },
  {
    title: 'Backup & recovery',
    description: 'Automated database backups with disaster recovery readiness.',
    icon: Server,
  },
]

const checklist = [
  'Rate limiting and API throttling',
  'Input validation and sanitization',
  'Secure password hashing',
  'Immutable payment transaction logs',
  'Institute-level data isolation',
  'Environment secret management',
]

export function SecurityPage() {
  return (
    <MotionPageLayout>
      <MotionPageHero
        eyebrow="Security"
        title="Security you can trust"
        description="EduraPay is built with enterprise-grade security from day one — because fee data is financial data."
      />

      <MarqueeTicker />

      <MotionSection eyebrow="Platform" title="Defense in depth" centerTitle>
        <MotionStaggerGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((f) => (
            <MotionFeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} accent="emerald" />
          ))}
        </MotionStaggerGrid>
      </MotionSection>

      <MotionSection variant="band">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <KineticReveal>
            <div className="motion-shield-pulse relative mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-violet-200 bg-violet-50 lg:mx-0">
              <div className="motion-orbit-ring absolute inset-0 rounded-full border border-violet-300/30" />
              <ShieldCheck className="relative h-24 w-24 text-violet-600" />
            </div>
          </KineticReveal>
          <MotionReveal from="right">
            <h3 className="text-2xl font-bold text-slate-900">Compliance-ready architecture</h3>
            <p className="mt-4 text-slate-600">
              Our platform supports PCI-DSS payment flows, data protection best practices, and institute-level compliance.
              Financial records remain immutable with append-only transaction logs.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionPageCta title="Questions about security?" subtitle="Our team can walk you through architecture, data residency, and compliance documentation." />
    </MotionPageLayout>
  )
}
