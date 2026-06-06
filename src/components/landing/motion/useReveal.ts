import { useEffect, useRef, useState } from 'react'

export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible, className: visible ? 'motion-revealed' : 'motion-reveal' }
}

export function useCountUp(target: number, active: boolean, durationMs = 1800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    let start: number | null = null
    let frame: number

    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min(1, (ts - start) / durationMs)
      setValue(Math.floor(target * progress))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, target, durationMs])

  return value
}
