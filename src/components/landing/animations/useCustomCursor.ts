import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

export function useCustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches
    if (isTouchDevice) {
      setIsHidden(true)
      return
    }

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Center the custom cursor elements and hide them initially to prevent jumps
    gsap.set([dot, ring], { opacity: 0, xPercent: -50, yPercent: -50 })

    const xDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" })
    const yDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" })
    const xRing = gsap.quickTo(ring, "x", { duration: 0.3, ease: "power3" })
    const yRing = gsap.quickTo(ring, "y", { duration: 0.3, ease: "power3" })

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInsideDemo = target && (target.closest("#funcionalidades") || document.body.classList.contains("demo-viewer-open"))

      if (isInsideDemo) {
        dot.style.display = "none"
        ring.style.display = "none"
      } else {
        dot.style.display = "block"
        ring.style.display = "block"
      }

      // Fade in cursor elements on first movement
      if (gsap.getProperty(dot, "opacity") === 0) {
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 })
      }

      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)
    }

    const onMouseEnterInteractive = () => setIsHovering(true)
    const onMouseLeaveInteractive = () => setIsHovering(false)

    document.addEventListener("mousemove", onMouseMove)

    const interactiveElements = document.querySelectorAll("a, button, [data-cursor-hover]")
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnterInteractive)
      el.addEventListener("mouseleave", onMouseLeaveInteractive)
    })

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive)
        el.removeEventListener("mouseleave", onMouseLeaveInteractive)
      })
    }
  }, [])

  return { dotRef, ringRef, isHovering, isHidden }
}
