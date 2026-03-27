import { useState, useEffect, useRef } from 'react'

export default function useScrollProgress(containerRef) {
  const [progress, setProgress] = useState(0)
  const rafId = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) return

      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
        const el = containerRef.current
        if (!el) return

        const rect = el.getBoundingClientRect()
        const containerHeight = rect.height - window.innerHeight
        if (containerHeight <= 0) {
          setProgress(0)
          return
        }

        const scrolled = -rect.top
        const p = Math.min(1, Math.max(0, scrolled / containerHeight))
        setProgress(p)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [containerRef])

  return progress
}
