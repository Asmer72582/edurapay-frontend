import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { INSTITUTE_FAQS, PARENT_FAQS } from '@/components/landing/landing-showcase'
import { KineticTitle } from '@/components/landing/motion/KineticReveal'
import { ParallaxSection } from '@/components/landing/motion/ParallaxSection'
import { cn } from '@/lib/utils'

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const open = openIdx === i
        return (
          <div
            key={item.q}
            className={cn(
              'motion-faq-item rounded-2xl border bg-white transition-all duration-500',
              open ? 'motion-light-card-glow border-violet-300 shadow-md shadow-violet-500/5' : 'border-slate-200/80 hover:border-violet-200',
            )}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <span className="font-semibold text-slate-900">{item.q}</span>
              <ChevronDown
                className={cn('h-5 w-5 shrink-0 text-violet-500 transition-transform', open && 'rotate-180')}
              />
            </button>
            {open ? (
              <p className="border-t border-slate-100 px-5 pb-4 pt-2 text-sm leading-relaxed text-slate-600">
                {item.a}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function LandingFaqSection() {
  return (
    <ParallaxSection speed={0.07} className="relative border-t border-slate-200/80 bg-gradient-to-b from-white to-violet-50/40 py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <KineticTitle
          center
          eyebrow="FAQ"
          title="Questions from institutes & parents"
          subtitle="Straight answers about onboarding, payments, receipts, and guardian access."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm text-violet-700">
                🏛
              </span>
              For institutes
            </h3>
            <FaqAccordion items={INSTITUTE_FAQS} />
          </div>
          <div>
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sm text-sky-700">
                👪
              </span>
              For parents
            </h3>
            <FaqAccordion items={PARENT_FAQS} />
          </div>
        </div>
      </div>
    </ParallaxSection>
  )
}
