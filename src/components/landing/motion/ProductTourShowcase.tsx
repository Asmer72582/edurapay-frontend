import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SHOWCASE_SLIDES } from '@/components/landing/landing-showcase'
import { cn } from '@/lib/utils'

const ASPECT = 'aspect-[16/10]'

function BrowserPreview({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto max-w-[60%] truncate rounded-md bg-white px-3 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200/80">
          app.edurapay.in · {caption}
        </span>
      </div>
      <div className={cn('relative w-full overflow-hidden bg-slate-100', ASPECT)}>
        {!failed ? (
          <img
            key={src}
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500"
            draggable={false}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 to-sky-50 p-8 text-center">
            <p className="font-semibold text-violet-900">{caption}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ProductTourShowcase({
  className,
  autoPlay = true,
  intervalMs = 6000,
}: {
  className?: string
  autoPlay?: boolean
  intervalMs?: number
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!autoPlay || paused) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SHOWCASE_SLIDES.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [autoPlay, paused, intervalMs])

  const go = (dir: -1 | 1) => {
    setActive((i) => (i + dir + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length)
  }

  const current = SHOWCASE_SLIDES[active]

  return (
    <div
      className={cn('mx-auto max-w-6xl', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(260px,320px)_1fr]">
          {/* Step list */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-5 lg:border-b-0 lg:border-r">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Walkthrough · {SHOWCASE_SLIDES.length} screens
            </p>
            <nav className="space-y-1" aria-label="Product tour steps">
              {SHOWCASE_SLIDES.map((slide, i) => {
                const selected = i === active
                return (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      'group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                      selected ? 'bg-white shadow-sm ring-1 ring-violet-200/80' : 'hover:bg-white/70',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums',
                        selected ? 'bg-violet-600 text-white' : 'bg-slate-200/80 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-700',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={cn('block text-sm font-semibold', selected ? 'text-slate-900' : 'text-slate-700')}>
                        {slide.caption}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{slide.description}</span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Preview */}
          <div className="flex flex-col bg-gradient-to-br from-slate-50/80 to-white p-5 sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-violet-600">
                  Step {active + 1} of {SHOWCASE_SLIDES.length}
                </p>
                <h3 className="truncate text-lg font-semibold text-slate-900">{current.caption}</h3>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label="Previous screen"
                  onClick={() => go(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next screen"
                  onClick={() => go(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <BrowserPreview src={current.src} alt={current.alt} caption={current.caption} />

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600">{current.description}</p>
              <div className="flex shrink-0 gap-1.5">
                {SHOWCASE_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to step ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === active ? 'w-6 bg-violet-600' : 'w-1.5 bg-slate-300 hover:bg-violet-300',
                    )}
                  />
                ))}
              </div>
            </div>

            {autoPlay && !paused && (
              <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  key={active}
                  className="h-full origin-left rounded-full bg-violet-500"
                  style={{ animation: `product-tour-progress ${intervalMs}ms linear forwards` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
