import React, { useState, useEffect, useRef, useCallback } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const tabs = [
  {
    number: "01",
    label: "ODONTOGRAMA INTERACTIVO",
    title:
      "Cada diente con su historial completo, accesible con un clic.",
    description:
      "Registrá hallazgos, tratamientos y evoluciones en un odontograma digital interactivo. Vista por diente, códigos de colores y exportación en PDF.",
    image: "/assets/features/diente.jpg",
  },
  {
    number: "02",
    label: "TURNOS Y EMAIL",
    title:
      "Reduce ausencias hasta un 80% sin mover un dedo.",
    description:
      "Tus pacientes reciben recordatorios automáticos por email antes de cada turno. Confirmación, cancelación y mensajes personalizables.",
    image: "/assets/features/secretaria.jpg",
  },
  {
    number: "03",
    label: "PANEL MULTI-SUCURSAL",
    title:
      "Todas tus sedes, un solo panel de control.",
    description:
      "Administrá todas tus sucursales desde un único panel. Compará rendimiento, gestioná profesionales y unificá la gestión en un solo lugar.",
    image: "/assets/features/dentista.jpg",
  },
]

export const TabbedShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevTabRef = useRef(0)

  const animateContent = useCallback((direction: "down" | "up") => {
    if (!contentRef.current) return
    const els = contentRef.current.querySelectorAll(".tab-content-animate")
    const yFrom = direction === "down" ? 30 : -30
    gsap.fromTo(
      els,
      { opacity: 0, y: yFrom },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out", overwrite: true }
    )
  }, [])

  // Entrance animation only
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from(".tabbed-showcase-inner", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const handleTabClick = useCallback((index: number) => {
    if (index === activeTab) return
    const direction = index > activeTab ? "down" : "up"
    prevTabRef.current = activeTab
    setActiveTab(index)
    requestAnimationFrame(() => animateContent(direction))
  }, [activeTab, animateContent])

  const current = tabs[activeTab]

  return (
    <section
      ref={sectionRef}
      id="funcionalidades-tabs"
      className="relative overflow-hidden"
    >
      <div
        className="bg-[#FAFCFF] py-16 sm:py-24"
        style={{ display: "flex", alignItems: "center", minHeight: "80vh" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="tabbed-showcase-inner">
            {/* Tab Navigation Bar */}
            <div className="flex justify-center mb-6 sm:mb-12">
              <div
                className="inline-flex items-center gap-0 rounded-full px-2 py-2"
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                }}
              >
                {tabs.map((tab, index) => {
                  const isActive = activeTab === index
                  return (
                    <button
                      key={tab.number}
                      onClick={() => handleTabClick(index)}
                      className="relative flex items-center gap-2 transition-all duration-300 focus:outline-none cursor-pointer"
                      style={{
                        padding: "10px 20px",
                        borderRadius: "999px",
                        background: isActive ? "#0047FF" : "transparent",
                        color: isActive ? "#FFFFFF" : "#64748B",
                      }}
                    >
                      <span
                        className="flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: isActive
                            ? "1.5px solid rgba(255,255,255,0.4)"
                            : "1.5px solid #94A3B8",
                          color: isActive ? "#FFFFFF" : "#64748B",
                        }}
                      >
                        {tab.number}
                      </span>

                      <span className="hidden sm:flex items-center gap-2">
                        <span
                          className="block transition-all duration-300"
                          style={{
                            width: isActive ? "32px" : "16px",
                            height: "1.5px",
                            background: isActive
                              ? "rgba(255,255,255,0.3)"
                              : "#CBD5E1",
                          }}
                        />
                        <span
                          className="text-xs font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-colors duration-300"
                          style={{
                            fontFamily: "'Instrument Sans', sans-serif",
                          }}
                        >
                          {tab.label}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>



            {/* Content Area */}
            <div
              ref={contentRef}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-20 items-center"
            >
              {/* Left: Title + Description */}
              <div className="order-2 lg:order-1">
                <h2
                  className="tab-content-animate text-3xl sm:text-4xl lg:text-[3.25rem] font-semibold tracking-[-2px] lg:tracking-[-3px] leading-[1.1] mb-4 lg:mb-6"
                  style={{
                    color: "#0A0F2D",
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}
                >
                  {current.title}
                </h2>
                <p
                  className="tab-content-animate text-base lg:text-lg leading-relaxed max-w-lg"
                  style={{ color: "#64748B" }}
                >
                  {current.description}
                </p>
              </div>

              {/* Right: Image Container */}
              <div className="order-1 lg:order-2">
                <div
                  className="tab-content-animate relative rounded-[2rem] overflow-hidden bg-[#FAFCFF] isolate transform-gpu border border-[#E2E8F0] shadow-xl"
                >
                  <div className="relative z-0 w-full h-[280px] lg:h-[420px] overflow-hidden">
                    <img
                      key={current.image}
                      src={current.image}
                      alt={`Dentiqly - ${current.label}: ${current.title}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
