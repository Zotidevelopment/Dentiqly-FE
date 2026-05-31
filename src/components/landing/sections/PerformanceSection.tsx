import React, { useState, useEffect, useRef, useCallback } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

interface MetricData {
  multiplier: string
  label: string
  competitionLabel: string
  competitionValue: string
  competitionWidth: string
  dentiqlyLabel: string
  dentiqlyValue: string
  dentiqlyWidth: string
}

interface TabData {
  key: string
  label: string
  headline: string
  headlineFaded: string
  cta: string
  metrics: MetricData[]
}

const tabsData: TabData[] = [
  {
    key: "eficiencia",
    label: "Eficiencia",
    headline:
      "La gestión clínica moderna requiere precisión y velocidad. El software tradicional o planillas sueltas limitan tu crecimiento.",
    headlineFaded:
      "Dentiqly está diseñado para optimizar flujos de trabajo, permitiéndote atender a más pacientes en menos tiempo.",
    cta: "Conoce el impacto de Dentiqly",
    metrics: [
      {
        multiplier: "6.0x",
        label: "Gestión de turnos más rápida",
        competitionLabel: "COMPETENCIA",
        competitionValue: "180 s",
        competitionWidth: "100%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "30 s",
        dentiqlyWidth: "15%",
      },
      {
        multiplier: "7.0x",
        label: "Menor tasa de inasistencia",
        competitionLabel: "COMPETENCIA",
        competitionValue: "35 %",
        competitionWidth: "80%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "5 %",
        dentiqlyWidth: "12%",
      },
      {
        multiplier: "5.3x",
        label: "Carga de historias clínicas rápida",
        competitionLabel: "COMPETENCIA",
        competitionValue: "8 min",
        competitionWidth: "90%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "1.5 min",
        dentiqlyWidth: "18%",
      },
    ],
  },
  {
    key: "pacientes",
    label: "Pacientes",
    headline:
      "Un paciente bien gestionado vuelve. Los datos dispersos generan errores, olvidos y mala experiencia.",
    headlineFaded:
      "Dentiqly centraliza toda la información de cada paciente: historial, odontograma, tratamientos y comunicación en un solo lugar.",
    cta: "Descubrí la experiencia del paciente",
    metrics: [
      {
        multiplier: "100%",
        label: "Historial clínico digitalizado",
        competitionLabel: "COMPETENCIA",
        competitionValue: "Parcial",
        competitionWidth: "45%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "Completo",
        dentiqlyWidth: "100%",
      },
      {
        multiplier: "3.2x",
        label: "Más retención de pacientes",
        competitionLabel: "COMPETENCIA",
        competitionValue: "42 %",
        competitionWidth: "42%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "89 %",
        dentiqlyWidth: "89%",
      },
      {
        multiplier: "80%",
        label: "Reducción de errores en fichas",
        competitionLabel: "COMPETENCIA",
        competitionValue: "12 err/mes",
        competitionWidth: "85%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "2 err/mes",
        dentiqlyWidth: "15%",
      },
    ],
  },
  {
    key: "finanzas",
    label: "Finanzas",
    headline:
      "El descontrol financiero es el enemigo silencioso de las clínicas. Cobros pendientes, liquidaciones incorrectas y falta de visibilidad.",
    headlineFaded:
      "Dentiqly controla cuentas corrientes y genera liquidaciones precisas para cada profesional de forma automática.",
    cta: "Mirá cómo optimizar tus finanzas",
    metrics: [
      {
        multiplier: "4.5x",
        label: "Liquidaciones más rápidas",
        competitionLabel: "COMPETENCIA",
        competitionValue: "45 min",
        competitionWidth: "90%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "10 min",
        dentiqlyWidth: "20%",
      },
      {
        multiplier: "95%",
        label: "Cobros al día",
        competitionLabel: "COMPETENCIA",
        competitionValue: "60 %",
        competitionWidth: "60%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "95 %",
        dentiqlyWidth: "95%",
      },
      {
        multiplier: "0",
        label: "Errores en liquidaciones",
        competitionLabel: "COMPETENCIA",
        competitionValue: "8 %",
        competitionWidth: "70%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "0 %",
        dentiqlyWidth: "3%",
      },
    ],
  },
  {
    key: "integraciones",
    label: "Integraciones",
    headline:
      "Tu clínica no opera en un vacío. Email, obras sociales, sistemas contables: todo necesita conectarse.",
    headlineFaded:
      "Dentiqly se integra nativamente con los servicios que ya usás, eliminando la doble carga de datos y errores manuales.",
    cta: "Explorá las integraciones",
    metrics: [
      {
        multiplier: "80%",
        label: "Menos ausencias con email",
        competitionLabel: "COMPETENCIA",
        competitionValue: "Manual",
        competitionWidth: "100%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "Automático",
        dentiqlyWidth: "20%",
      },
      {
        multiplier: "10+",
        label: "Obras sociales integradas",
        competitionLabel: "COMPETENCIA",
        competitionValue: "2-3",
        competitionWidth: "25%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "10+",
        dentiqlyWidth: "100%",
      },
      {
        multiplier: "1",
        label: "Carga única de datos",
        competitionLabel: "COMPETENCIA",
        competitionValue: "3 sistemas",
        competitionWidth: "100%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "1 sistema",
        dentiqlyWidth: "33%",
      },
    ],
  },
  {
    key: "escalabilidad",
    label: "Escalabilidad",
    headline:
      "Crecer no debería significar más caos. Cada nueva sucursal o profesional amplifica los problemas de gestión.",
    headlineFaded:
      "Dentiqly escala con vos: multi-sucursal, multi-profesional, roles y permisos, todo desde un panel unificado.",
    cta: "Descubrí cómo escalar tu clínica",
    metrics: [
      {
        multiplier: "∞",
        label: "Sucursales sin límite",
        competitionLabel: "COMPETENCIA",
        competitionValue: "1-2 sedes",
        competitionWidth: "20%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "Ilimitadas",
        dentiqlyWidth: "100%",
      },
      {
        multiplier: "1",
        label: "Panel para todo",
        competitionLabel: "COMPETENCIA",
        competitionValue: "Múltiples logins",
        competitionWidth: "100%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "Un solo panel",
        dentiqlyWidth: "30%",
      },
      {
        multiplier: "50+",
        label: "Profesionales gestionados",
        competitionLabel: "COMPETENCIA",
        competitionValue: "Hasta 10",
        competitionWidth: "20%",
        dentiqlyLabel: "DENTIQLY",
        dentiqlyValue: "50+",
        dentiqlyWidth: "100%",
      },
    ],
  },
]

export const PerformanceSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const prevTabRef = useRef(0)

  const animateMetrics = useCallback((direction: "down" | "up") => {
    if (!metricsRef.current) return
    const els = metricsRef.current.querySelectorAll(".perf-metric-animate")
    const yFrom = direction === "down" ? 40 : -40
    gsap.fromTo(
      els,
      { opacity: 0, y: yFrom },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: true,
      }
    )
  }, [])

  // Entrance animation only (no scroll-driven tab switching)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from(".perf-section-inner", {
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
    requestAnimationFrame(() => animateMetrics(direction))
  }, [activeTab, animateMetrics])

  const current = tabsData[activeTab]

  return (
    <section
      id="metricas"
      ref={sectionRef}
      data-navbar-theme="dark"
      className="relative overflow-hidden"
    >
      <div
        className="bg-[#0A0F2D] text-white py-16 sm:py-24 relative overflow-hidden"
        style={{
          minHeight: "100vh",
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="perf-section-inner flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Left Sidebar */}
            <div className="hidden lg:flex flex-col gap-6 w-48 shrink-0 pt-2">
              {tabsData.map((tab, index) => {
                const isActive = activeTab === index
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(index)}
                    className="relative text-left cursor-pointer group"
                  >
                    {isActive && (
                      <div
                        className="absolute -left-0 top-0 w-[2px] h-full bg-[#0047FF]"
                        style={{
                          boxShadow: "0 0 8px rgba(0,71,255,0.5)",
                        }}
                      />
                    )}
                    <span
                      className="text-[11px] font-semibold tracking-[0.05em] text-left uppercase transition-all duration-300 block pl-4"
                      style={{
                        color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {tab.label}
                    </span>
                  </button>
                )
              })}

            </div>

            {/* Mobile tabs */}
            <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-3 -mx-4 px-4">
              {tabsData.map((tab, index) => {
                const isActive = activeTab === index
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(index)}
                    className="text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap transition-all duration-300 px-3 py-1.5 rounded-full cursor-pointer"
                    style={{
                      color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                      background: isActive
                        ? "rgba(0,71,255,0.2)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(0,71,255,0.3)"
                        : "1px solid transparent",
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Main Content */}
            <div className="flex-1" ref={metricsRef}>
              <div className="perf-metric-animate max-w-3xl">
                <h2 className="text-xl sm:text-2xl font-semibold leading-relaxed tracking-[-1px] text-white mb-4">
                  {current.headline}
                  <span className="text-white/60">
                    {" "}
                    {current.headlineFaded}
                  </span>
                </h2>

                <Link to="/register" className="btn-wayflyer-primary gap-2">
                  {current.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Metrics List */}
              <div className="mt-10 flex flex-col gap-8">
                {current.metrics.map((metric, idx) => (
                  <div
                    key={`${current.key}-${idx}`}
                    className="perf-metric-animate flex flex-col md:flex-row gap-4 md:gap-10 items-start"
                  >
                    {/* Big Number */}
                    <div className="w-full md:w-48 shrink-0">
                      <div className="text-4xl sm:text-5xl font-semibold tracking-[-3px] text-white mb-1">
                        {metric.multiplier}
                      </div>
                      <div className="text-[#0047FF] text-sm font-semibold tracking-normal">
                        {metric.label}
                      </div>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 w-full pt-1 flex flex-col gap-3">
                      {/* Competition Bar */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] font-mono tracking-normal text-white/40 uppercase font-semibold">
                          <span>{metric.competitionLabel}</span>
                          <span>{metric.competitionValue}</span>
                        </div>
                        <div className="h-3 w-full bg-transparent rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm transition-all duration-700 ease-out"
                            style={{
                              width: metric.competitionWidth,
                              background:
                                "repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 4px, transparent 4px, transparent 8px)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Dentiqly Bar */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] font-semibold font-mono tracking-normal text-[#0047FF] uppercase">
                          <span>{metric.dentiqlyLabel}</span>
                          <span>{metric.dentiqlyValue}</span>
                        </div>
                        <div className="h-3 w-full bg-transparent rounded-sm overflow-hidden flex items-center">
                          <div
                            className="h-full bg-[#0047FF] rounded-sm shadow-[0_0_15px_rgba(0,71,255,0.4)] transition-all duration-700 ease-out"
                            style={{
                              width: metric.dentiqlyWidth,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
