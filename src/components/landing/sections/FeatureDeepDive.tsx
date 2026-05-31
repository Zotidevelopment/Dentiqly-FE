import React, { useEffect, useRef } from "react"
import { Smile, MessageCircle, Building2 } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Smile,
    title: "Odontograma interactivo",
    subtitle: "Registro visual completo",
    desc: "Registra hallazgos, tratamientos y evoluciones en un odontograma digital interactivo. Cada diente con su historial completo, accesible con un clic.",
    bullets: [
      "Vista por diente con estado actual y tratamientos previos",
      "Registro de hallazgos con codigos de colores",
      "Exportacion en PDF para derivaciones",
    ],
    color: "#2563FF",
    visual: "odontograma",
  },
  {
    icon: MessageCircle,
    title: "Turnos y Email",
    subtitle: "Recordatorios automaticos",
    desc: "Tus pacientes reciben recordatorios automaticos por email antes de cada turno. Reduce las ausencias hasta un 80% sin mover un dedo.",
    bullets: [
      "Confirmacion y cancelacion desde email",
      "Recordatorios 24h y 1h antes del turno",
      "Mensajes personalizables por clinica",
    ],
    color: "#0047FF",
    visual: "email",
  },
  {
    icon: Building2,
    title: "Panel multi-sucursal",
    subtitle: "Gestion centralizada",
    desc: "Administra todas tus sucursales desde un unico panel. Compara rendimiento, gestiona profesionales y unifica la gestion en un solo lugar.",
    bullets: [
      "Dashboard comparativo entre sucursales",
      "Profesionales compartidos entre sedes",
      "Reportes consolidados de actividad",
    ],
    color: "#7C3AED",
    visual: "multi",
  },
]

export const FeatureDeepDive: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const featureBlocks = gsap.utils.toArray<HTMLElement>(".feature-block")

      featureBlocks.forEach((block) => {
        const textEls = block.querySelectorAll(".feature-text-reveal")
        const visual = block.querySelector(".feature-visual")
        const bullets = block.querySelectorAll(".feature-bullet")

        gsap.from(textEls, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: block,
            start: "top 75%",
          },
        })

        if (visual) {
          gsap.from(visual, {
            scale: 0.85,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 70%",
            },
          })
        }

        gsap.from(bullets, {
          x: -20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: block,
            start: "top 65%",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="funcionalidades" className="py-32 bg-[#FAFCFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {features.map((feature, i) => {
          const Icon = feature.icon
          const isReversed = i % 2 !== 0
          return (
            <div
              key={i}
              className={`feature-block grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                i < features.length - 1 ? "mb-32" : ""
              }`}
            >
              <div className={isReversed ? "lg:order-2" : ""}>
                <div
                  className="feature-text-reveal w-12 h-12 rounded-full flex items-center justify-center mb-6"
                  style={{ background: `${feature.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <div className="mb-3">
                  <span className="inline-block bg-[#0047FF] text-white px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full feature-text-reveal">
                    {feature.subtitle}
                  </span>
                </div>
                <h3 className="feature-text-reveal text-3xl sm:text-4xl font-semibold text-[#0A0F2D] tracking-[-2px] mb-5">
                  {feature.title}
                </h3>
                <p className="feature-text-reveal text-lg text-gray-600 leading-relaxed mb-8">
                  {feature.desc}
                </p>
                <div className="space-y-4">
                  {feature.bullets.map((bullet, j) => (
                    <div key={j} className="feature-bullet flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${feature.color}15` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: feature.color }}
                        />
                      </div>
                      <span className="text-gray-600">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${isReversed ? "lg:order-1" : ""}`}>
                <div
                  className="feature-visual relative rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-[#0B1023] isolate transform-gpu"
                  style={{
                    border: `1px solid ${feature.color}40`,
                    boxShadow: `0 30px 60px -15px ${feature.color}30`,
                  }}
                >
                  {/* Ambient background glow */}
                  <div 
                    className="absolute inset-0 opacity-40 blur-3xl pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${feature.color}60 0%, transparent 70%)` }}
                  />

                  <img
                    src={`/assets/features/3d-${feature.visual}-dark.png`}
                    alt={feature.title}
                    className="w-full h-full object-contain p-8 animate-float scale-[1.15] mix-blend-screen"
                  />
                  
                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent mix-blend-overlay pointer-events-none" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
