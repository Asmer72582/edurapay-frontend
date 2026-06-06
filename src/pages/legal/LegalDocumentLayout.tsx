import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MotionPageHero } from '@/components/landing/motion/MotionPageHero'
import { MotionPageLayout } from '@/components/landing/motion/MotionPageLayout'
import { MotionSection } from '@/components/landing/motion/MotionSection'
import { MotionReveal } from '@/components/landing/motion/MotionStaggerGrid'
import { cn } from '@/lib/utils'

export type LegalSection = {
  id: string
  title: string
  content: ReactNode
}

export function LegalDocumentLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  sections,
  relatedLink,
}: {
  eyebrow: string
  title: string
  description: string
  lastUpdated: string
  sections: LegalSection[]
  relatedLink: { to: string; label: string }
}) {
  return (
    <MotionPageLayout>
      <MotionPageHero eyebrow={eyebrow} title={title} description={description} />

      <MotionSection className="pb-20">
        <MotionReveal className="mx-auto max-w-3xl px-4 lg:px-8">
          <p className="mb-8 text-center text-sm text-slate-500">Last updated: {lastUpdated}</p>

          <nav
            aria-label="Table of contents"
            className="mb-10 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Contents</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-violet-700 hover:text-violet-900 hover:underline"
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="space-y-12 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:p-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                <div className={cn('prose-legal mt-4 space-y-4 text-sm leading-relaxed text-slate-600')}>
                  {section.content}
                </div>
              </section>
            ))}
          </article>

          <div className="mt-10 flex flex-col items-center gap-4 text-center text-sm text-slate-600 sm:flex-row sm:justify-between sm:text-left">
            <p>
              Questions?{' '}
              <a href="mailto:support@edurapay.com" className="font-medium text-violet-700 hover:underline">
                support@edurapay.com
              </a>
            </p>
            <Link to={relatedLink.to} className="font-medium text-violet-700 hover:underline">
              {relatedLink.label} →
            </Link>
          </div>
        </MotionReveal>
      </MotionSection>
    </MotionPageLayout>
  )
}

function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export const legalBlocks = { P, Ul }
