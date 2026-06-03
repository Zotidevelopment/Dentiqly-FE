import React, { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  Headphones, 
  Database, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface BenefitItem {
  icon: React.ReactNode
  title: string
  description: string
  tag?: string
}

const benefits: BenefitItem[] = [
  {
    icon: <Zap className="h-6 w-6 text-[#00E5FF]" />,
    title: "Configuración en 10 minutos",
    description: "Importamos tus datos y configuramos tu agenda al instante para que no pierdas ni un solo turno.",
    tag: "Rápido"
  },
  {
    icon: <ShieldAlert className="h-6 w-6 text-[#00E5FF]" />,
    title: "Sin contratos ni permanencia",
    description: "Creemos en la calidad de nuestro producto. Sos libre de cancelar cuando quieras, sin trabas ni letra chica.",
    tag: "Flexible"
  },
  {
    icon: <Headphones className="h-6 w-6 text-[#00E5FF]" />,
    title: "Soporte humano 24/7",
    description: "Un equipo real de expertos listo para ayudarte por WhatsApp, teléfono o email cuando lo necesites.",
    tag: "VIP"
  },
  {
    icon: <Database className="h-6 w-6 text-[#00E5FF]" />,
    title: "Migración gratuita de datos",
    description: "¿Usás planillas, Excel u otro sistema? Nos encargamos de mudar todo a Dentiqly sin ningún costo.",
    tag: "Gratis"
  },
  {
    icon: <Sparkles className="h-6 w-6 text-[#00E5FF]" />,
    title: "Actualizaciones incluidas",
    description: "Accedé a todas las nuevas herramientas y mejoras del sistema automáticamente, sin pagar de más.",
    tag: "Siempre al día"
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-[#00E5FF]" />,
    title: "Capacitación a tu equipo",
    description: "Te guiamos con entrenamientos rápidos y personalizados para que tu personal domine el sistema en un día.",
    tag: "Acompañamiento"
  }
]

export const PerformanceSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".why-dentiqly-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll(".benefit-card")
      if (cards && cards.length > 0) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
          },
          y: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
        })
      }

      // CTA Box Animation
      gsap.from(".why-dentiqly-cta", {
        scrollTrigger: {
          trigger: ".why-dentiqly-cta",
          start: "top 85%",
        },
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="por-que-dentiqly"
      ref={sectionRef}
      data-navbar-theme="dark"
      className="relative bg-[#0A0F2D] text-white py-24 sm:py-32 overflow-hidden border-t border-white/5"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#0047FF]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="why-dentiqly-header text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-white/80 mb-6">
            <CheckCircle2 size={12} className="text-[#00E5FF]" /> Por qué elegirnos
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
            La transición más simple. <br />
            <span className="bg-gradient-to-r from-[#00E5FF] to-[#0047FF] bg-clip-text text-transparent">
              El impacto más grande.
            </span>
          </h2>
          <p className="text-lg text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Diseñamos Dentiqly para resolver las fricciones de la gestión diaria. Sin contratos forzados, sin sorpresas y con todo el soporte que necesitás.
          </p>
        </div>

        {/* Benefits Grid */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="benefit-card group relative bg-white/5 border border-white/10 hover:border-[#0047FF]/50 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,71,255,0.15)] flex flex-col justify-between"
            >
              {/* Card glowing border gradient hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00E5FF]/20 to-[#0047FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 blur-sm" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  {benefit.tag && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 group-hover:text-[#00E5FF] transition-colors">
                      {benefit.tag}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-white transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/50 group-hover:text-white/70 transition-colors">
                  {benefit.description}
                </p>
              </div>

              {/* Decorative small checkmark */}
              <div className="flex items-center gap-1.5 mt-6 text-xs text-[#00E5FF] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span>Garantizado</span>
                <CheckCircle2 size={12} />
              </div>
            </div>
          ))}
        </div>

        {/* Action / CTA Box */}
        <div className="why-dentiqly-cta max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0047FF] to-[#002699] p-8 sm:p-12 shadow-2xl overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            {/* Background elements */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#00E5FF]/20 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                ¿Listo para ver la diferencia?
              </h3>
              <p className="text-white/80 text-sm sm:text-base mb-2 font-medium">
                Probá Dentiqly GRATIS por 14 días con todas las funciones activas.
              </p>
              <p className="text-white/55 text-xs font-normal">
                No requiere tarjeta de crédito • Configuración en minutos • Cancelá en cualquier momento.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0047FF] font-extrabold text-sm rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-white/20 hover:scale-[1.02]"
              >
                Empezá GRATIS ahora
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
