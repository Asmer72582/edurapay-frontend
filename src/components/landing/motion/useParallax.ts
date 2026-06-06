import { useEffect, useRef, useState } from 'react'

/** Scroll-linked vertical offset for parallax layers */
export function useParallax(speed = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight
      const progress = (viewH - rect.top) / (viewH + rect.height)
      const clamped = Math.max(0, Math.min(1, progress))
      setOffset((clamped - 0.5) * speed * rect.height)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [speed])

  return {
    ref,
    offset,
    style: {
      transform: `translate3d(0, ${offset}px, 0)`,
      willChange: 'transform' as const,
    },
  }
}

/** Fade + slide on scroll into view with optional parallax speed */
export function useParallaxReveal(speed = 0.08, threshold = 0.12) {
  const parallax = useParallax(speed)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = parallax.ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, parallax.ref])

  return {
    ref: parallax.ref,
    visible,
    parallaxStyle: parallax.style,
    className: visible ? 'motion-revealed' : 'motion-reveal',
  }
}
