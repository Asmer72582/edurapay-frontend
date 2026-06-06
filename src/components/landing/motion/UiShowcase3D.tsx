import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SHOWCASE_SLIDES, type ShowcaseSlide } from '@/components/landing/landing-showcase'

/** Fixed frame so every screenshot renders at the same size in the carousel. */
const SHOWCASE_FRAME_MAX = 'max-w-[840px]'
const SHOWCASE_ASPECT_CLASS = 'aspect-[16/10]'

function ShowcaseFrame({ slide, active }: { slide: ShowcaseSlide; active: boolean }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center px-12 py-8 transition-opacity duration-700 ease-out sm:px-16',
        active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0',
      )}
      aria-hidden={!active}
    >
      <div className={cn('ui-showcase-card w-full shrink-0', SHOWCASE_FRAME_MAX)}>
        <div className="overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-[0_32px_80px_-20px_rgba(99,102,241,0.35)] ring-1 ring-violet-100">
          {!failed ? (
            <div className={cn('relative w-full overflow-hidden bg-slate-100', SHOWCASE_ASPECT_CLASS)}>
              <img
                src={slide.src}
                alt={slide.alt}
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="lazy"
                draggable={false}
                onError={() => setFailed(true)}
              />
            </div>
          ) : (
            <div
              className={cn(
                'flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-sky-50 p-8 text-center',
                SHOWCASE_ASPECT_CLASS,
              )}
            >
              <p className="text-lg font-semibold text-violet-900">{slide.caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function UiShowcase3D({ className, autoPlay = false, intervalMs = 4500 }: { className?: string; autoPlay?: boolean; intervalMs?: number }) {
  const [active, setActive] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [paused, setPaused] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoPlay || paused) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SHOWCASE_SLIDES.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [autoPlay, paused, intervalMs])

  const scrollTabIntoView = useCallback((index: number) => {
    const container = tabsRef.current
    const btn = container?.querySelector(`[data-tab-index="${index}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [])

  useEffect(() => {
    scrollTabIntoView(active)
  }, [active, scrollTabIntoView])

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -8, y: px * 10 })
  }, [])

  const onLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  const go = (dir: -1 | 1) => {
    setActive((i) => (i + dir + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length)
  }

  const selectTab = (index: number) => {
    setActive(index)
    scrollTabIntoView(index)
  }

  const current = SHOWCASE_SLIDES[active]

  return (
    <div className={cn('relative', className)}>
      <div
        ref={wrapRef}
        className="ui-showcase-stage relative mx-auto flex h-[min(520px,56vw)] min-h-[320px] max-h-[540px] w-full max-w-6xl items-center justify-center overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-b from-violet-50/80 via-white to-slate-50 shadow-inner sm:min-h-[380px]"
        onMouseMove={onMove}
        onMouseLeave={() => {
          onLeave()
          setPaused(false)
        }}
        onMouseEnter={() => setPaused(true)}
        style={{ perspective: '1600px', perspectiveOrigin: 'center center' }}
      >
        <div
          className="ui-showcase-orbit absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {SHOWCASE_SLIDES.map((slide, i) => (
            <ShowcaseFrame key={slide.src} slide={slide} active={i === active} />
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous screen"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md transition hover:bg-violet-50 hover:text-violet-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next screen"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md transition hover:bg-violet-50 hover:text-violet-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-30 mx-auto mt-8 max-w-6xl rounded-2xl border border-slate-200/90 bg-white p-4 shadow-lg shadow-slate-200/60 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-600">
              Screen {active + 1} of {SHOWCASE_SLIDES.length}
              {autoPlay && !paused ? (
                <span className="motion-showcase-autoplay-dot ml-2 inline-block h-1.5 w-1.5 rounded-full bg-violet-500 align-middle" />
              ) : null}
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-slate-900">{current.caption}</p>
          </div>
          <div className="hidden shrink-0 gap-1.5 sm:flex">
            {SHOWCASE_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to screen ${i + 1}`}
                onClick={() => selectTab(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === active ? 'w-8 bg-violet-600' : 'w-2 bg-slate-200 hover:bg-violet-300',
                )}
              />
            ))}
          </div>
        </div>

        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SHOWCASE_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              data-tab-index={i}
              onClick={() => selectTab(i)}
              className={cn(
                'shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                i === active
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                  : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-violet-50 hover:text-violet-800 hover:ring-violet-200',
              )}
            >
              {slide.caption}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Hero variant — stacked 3D cards, centered in the right column */
export function UiShowcaseHero3D() {
  return (
    <div
      className="ui-showcase-hero relative mx-auto w-full max-w-[440px]"
      style={{ perspective: '1400px', perspectiveOrigin: 'center center' }}
    >
      <div
        className="relative mx-auto aspect-[16/10] w-full max-w-[400px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {SHOWCASE_SLIDES.slice(0, 3).map((slide, i) => (
          <div
            key={slide.src}
            className="absolute left-1/2 top-1/2 w-[min(400px,88vw)] max-w-[400px]"
            style={{
              transform: `translate(-50%, -50%) rotateY(${(i - 1) * 9}deg) translateZ(${30 - i * 38}px)`,
              zIndex: 3 - i,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="ui-showcase-hero-card-inner overflow-hidden rounded-xl border border-white/80 bg-white shadow-2xl shadow-violet-500/20 ring-1 ring-violet-100">
              <div className={cn('relative w-full overflow-hidden bg-slate-100', SHOWCASE_ASPECT_CLASS)}>
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 top-1/2 -z-10 h-[85%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/15 blur-3xl" />
    </div>
  )
}
