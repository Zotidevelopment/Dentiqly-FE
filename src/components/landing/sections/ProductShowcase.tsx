import React, { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Link } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

export const ProductShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".showcase-header-left > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      })

      gsap.from(".showcase-header-right", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      })

      // Immersive 3D Tilt Scroll Animation on the Image Container
      gsap.fromTo(".showcase-image-container",
        {
          rotateX: 22,
          rotateY: -6,
          scale: 0.88,
          transformPerspective: 1200,
          transformOrigin: "top center",
        },
        {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".showcase-image-container",
            start: "top 95%",
            end: "bottom 70%",
            scrub: true,
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="producto"
      className="min-h-screen flex flex-col justify-center py-16 sm:py-20 bg-[#FAFCFF] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="showcase-header-left flex-1 max-w-2xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block bg-[#0047FF] text-white px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full">
                Casos de uso
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl xl:text-[3.4rem] font-semibold text-[#0A0F2D] tracking-[-3px] leading-[1.1]">
              Todo lo que necesitas
              <br />
              para gestionar tu clínica
            </h2>
          </div>

          <div className="showcase-header-right lg:max-w-sm lg:text-right">
            <p className="text-base text-gray-500 leading-relaxed">
              <span className="font-semibold text-[#0A0F2D]">Automatizá la gestión, controlá turnos</span>
              {" "}y ofrecé una experiencia excepcional a tus pacientes.
            </p>
          </div>
        </div>

        {/* ── Gallery — Center Image with 3D scroll parallax ── */}
        <div 
          className="showcase-gallery flex justify-center mt-12"
          style={{ perspective: "1200px" }}
        >
          <div className="showcase-image-container relative rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xl bg-white w-full transition-shadow duration-500">
            <img
              src="/assets/screenshots/dashboard.png"
              alt="Dentiqly Dashboard - Panel de control inteligente"
              className="w-full h-auto block rounded-2xl shadow-inner"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </div>

      </div>
    </section>
  )
}

