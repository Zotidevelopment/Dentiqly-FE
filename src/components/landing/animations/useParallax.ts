import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mm: any = ScrollTrigger.matchMedia({
      "(min-width: 768px)": () => {
        gsap.to(el, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
      },
    })

    return () => {
      mm?.revert?.()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el.parentElement || st.vars?.trigger === el.parentElement) {
          st.kill()
        }
      })
    }
  }, [speed])

  return ref
}
