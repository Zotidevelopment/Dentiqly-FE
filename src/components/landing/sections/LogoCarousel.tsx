import React, { useEffect, useRef } from "react"
import gsap from "gsap"

const logos = [
  { name: "Dentiqly", src: "/assets/dentiqly-logo.png" },
  { name: "Clinica Dental Sur", text: "Clinica Dental Sur" },
  { name: "OdontoPro", text: "OdontoPro" },
  { name: "SmileLab", text: "SmileLab" },
  { name: "DentalCare+", text: "DentalCare+" },
  { name: "Centro Odontologico", text: "Centro Odontologico" },
  { name: "MaxiloDent", text: "MaxiloDent" },
  { name: "OralHealth", text: "OralHealth" },
]

export const LogoCarousel: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const totalWidth = track.scrollWidth / 2

    const tween = gsap.to(track, {
      x: -totalWidth,
      duration: totalWidth / 30,
      ease: "none",
      repeat: -1,
    })

    return () => {
      tween.kill()
    }
  }, [])

  const renderLogos = () =>
    logos.map((logo, i) => (
      <div
        key={i}
        className="flex-shrink-0 flex items-center justify-center h-12 px-10 opacity-30 hover:opacity-60 transition-opacity duration-500"
      >
        {logo.src ? (
          <img src={logo.src} alt={logo.name} className="h-8 w-auto object-contain grayscale" />
        ) : (
          <span className="text-lg font-bold text-[#0A0F2D]/60 tracking-tight whitespace-nowrap">
            {logo.text}
          </span>
        )}
      </div>
    ))

  return (
    <section className="py-16 bg-white overflow-hidden border-b border-gray-100/50">
      <p className="text-center text-xs font-bold text-[#8A93A8] tracking-[0.2em] uppercase mb-10">
        Utilizado por clinicas líderes
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div ref={trackRef} className="flex items-center gap-0 w-max">
          {renderLogos()}
          {renderLogos()}
        </div>
      </div>
    </section>
  )
}
