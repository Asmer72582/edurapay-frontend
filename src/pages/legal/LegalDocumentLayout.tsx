import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { cn } from '@/lib/utils'
import { LEGAL_ENTITY, LEGAL_POLICY_NAV } from '@/lib/brand'

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
  const { pathname } = useLocation()
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="min-h-0 bg-slate-50 text-slate-900">
      {/* Compact header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
            <BrandLogo variant="full" size="xs" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Hero — compact, no animation overlap */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-violet-700">
            <FileText className="h-3.5 w-3.5" />
            {eyebrow}
            <span className="text-slate-300">·</span>
            <span className="normal-case tracking-normal text-slate-500">Updated {lastUpdated}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar TOC — desktop */}
          <aside className="hidden lg:block">
            <nav
              aria-label="Table of contents"
              className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2"
            >
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">On this page</p>
              <ol className="space-y-0.5 border-l border-slate-200">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={cn(
                        '-ml-px block border-l-2 py-1.5 pl-3 pr-1 text-[13px] leading-snug transition-colors',
                        activeId === section.id
                          ? 'border-violet-600 font-medium text-violet-800'
                          : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900',
                      )}
                    >
                      <span className="mr-1 tabular-nums text-slate-400">{index + 1}.</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 space-y-6">
            {/* Mobile TOC — collapsible */}
            <details className="group rounded-xl border border-slate-200 bg-white lg:hidden">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                Jump to section ({sections.length})
              </summary>
              <nav aria-label="Table of contents" className="border-t border-slate-100 px-2 pb-2">
                <ol className="max-h-48 space-y-0.5 overflow-y-auto">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-lg px-2 py-1.5 text-sm text-violet-700 hover:bg-violet-50"
                      >
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>

            {/* Article */}
            <article className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {sections.map((section, index) => (
                  <section key={section.id} id={section.id} className="scroll-mt-20 px-5 py-7 sm:px-8 sm:py-8">
                    <div className="mb-4 flex items-baseline gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">
                        {index + 1}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{section.title}</h2>
                    </div>
                    <div className={cn('prose-legal space-y-4 text-sm leading-relaxed text-slate-600')}>
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>
            </article>

            {/* Policy navigation + contact */}
            <div className="space-y-3">
              <nav
                aria-label="Legal and policy pages"
                className="flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3"
              >
                {LEGAL_POLICY_NAV.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      pathname === link.to
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-600 hover:bg-violet-50 hover:text-violet-800',
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-slate-600">
                  Questions?{' '}
                  <a href={`mailto:${LEGAL_ENTITY.email}`} className="font-medium text-violet-700 hover:underline">
                    {LEGAL_ENTITY.email}
                  </a>
                </p>
                <Link to={relatedLink.to} className="font-medium text-violet-700 hover:underline">
                  {relatedLink.label} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

function Clause({ children }: { children: ReactNode }) {
  return (
    <blockquote className="rounded-r-lg border-l-4 border-violet-400 bg-violet-50/80 px-4 py-3 text-sm not-italic text-slate-700">
      {children}
    </blockquote>
  )
}

export const legalBlocks = { P, Ul, Clause }
