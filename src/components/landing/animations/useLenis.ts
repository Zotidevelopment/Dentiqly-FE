import { useEffect, useRef } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.4,
      smoothWheel: true,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis
    if (typeof window !== "undefined") {
      (window as any).lenis = lenis
    }

    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    const prevScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = "auto"

    return () => {
      lenis.destroy()
      lenisRef.current = null
      if (typeof window !== "undefined") {
        delete (window as any).lenis
      }
      document.documentElement.style.scrollBehavior = prevScrollBehavior
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return lenisRef
}
