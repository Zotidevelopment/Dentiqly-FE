import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const logos = [
  { name: "ODAF", src: "/assets/odaf-logo.png" },
]

export const SocialProofBar: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".social-proof-item", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-10 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted by text + logos */}
        <div className="social-proof-item flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <span className="font-medium uppercase tracking-wider text-xs">Con el respaldo de</span>
          {logos.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.name}
              className="h-8 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            />
          ))}
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 font-semibold">⭐ 4.9/5 valoración promedio</span>
        </div>
      </div>
    </section>
  )
}
