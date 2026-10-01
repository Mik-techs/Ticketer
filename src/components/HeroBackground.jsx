import { useEffect, useRef } from 'react'

// Animated "network" background for the home hero, using Vanta.js on top of
// Three.js. Both libraries are loaded lazily (a separate chunk that only
// downloads after the page has painted) and only when the device can
// comfortably run them. Otherwise visitors just see the plain navy hero.

function canRunEffect() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const conn = navigator.connection
  if (conn && (conn.saveData || /(^|-)2g$|3g/.test(conn.effectiveType || ''))) return false
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

export default function HeroBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !canRunEffect()) return

    let effect = null
    let cancelled = false
    let visible = false
    let loading = false
    const small = window.matchMedia('(max-width: 640px)').matches

    const start = async () => {
      if (effect || loading || cancelled) return
      loading = true
      try {
        const [THREE, vanta] = await Promise.all([
          import('three'),
          import('vanta/dist/vanta.net.min'),
        ])
        if (cancelled || !visible) return
        const NET = vanta.default || vanta
        effect = NET({
          el,
          THREE,
          mouseControls: !small,
          touchControls: false, // never fight with scrolling on phones
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          color: 0xc9a227,          // brand gold: dots and lines
          backgroundColor: 0x1c2b3a, // brand navy
          points: small ? 6 : 9,
          maxDistance: small ? 16 : 20,
          spacing: small ? 22 : 17,
          showDots: true,
        })
      } catch {
        // If anything fails, the static navy hero stays. Nothing else breaks.
      } finally {
        loading = false
      }
    }

    const stop = () => {
      if (effect) {
        effect.destroy()
        effect = null
      }
    }

    // Only run while the hero is on screen: saves battery once you scroll on.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })

    // Wait until the browser is idle so the first paint isn't delayed.
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 400))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const handle = idle(() => io.observe(el))

    return () => {
      cancelled = true
      cancelIdle(handle)
      io.disconnect()
      stop()
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="hero-bg absolute inset-0" />
}
