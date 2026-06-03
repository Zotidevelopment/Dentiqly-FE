import React, { useEffect, useRef } from "react"
import {
  Calendar,
  Users,
  Bell,
  LayoutDashboard,
  Building2,
  ArrowRight,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Link } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Calendar,
    tag: "TURNOS",
    title: "Tus pacientes agendan solos, 24/7",
    desc: "Agenda online inteligente. Tus pacientes reservan sin llamadas ni demoras. Vos solo atendés.",
    src: "/assets/screenshots/calendario.png",
    span: "lg:col-span-2 lg:row-span-2",
    imgClass: "h-[260px] lg:h-[340px]",
    highlight: true,
  },
  {
    icon: Users,
    tag: "HISTORIAS CLÍNICAS",
    title: "Todo el historial en un clic",
    desc: "Ficha completa del paciente: datos, odontograma, tratamientos, pagos y más.",
    src: "/assets/screenshots/paciente-detalle.png",
    span: "lg:col-span-1",
    imgClass: "h-[180px]",
  },
  {
    icon: Bell,
    tag: "RECORDATORIOS",
    title: "40% menos ausencias",
    desc: "Recordatorios automáticos por email para que ningún paciente falte.",
    src: "/assets/screenshots/recordatorios.png",
    span: "lg:col-span-1",
    imgClass: "h-[180px]",
  },
  {
    icon: LayoutDashboard,
    tag: "DASHBOARD",
    title: "Toda tu clínica en una pantalla",
    desc: "Métricas de facturación, turnos del día, inasistencias y rendimiento en tiempo real.",
    src: "/assets/screenshots/dashboard.png",
    span: "lg:col-span-1",
    imgClass: "h-[180px]",
  },
  {
    icon: Building2,
    tag: "MULTI-SUCURSAL",
    title: "Todas tus sedes, un solo panel",
    desc: "Gestioná múltiples clínicas desde un único lugar. Comparar rendimiento nunca fue tan fácil.",
    src: "/assets/screenshots/booking.png",
    span: "lg:col-span-1",
    imgClass: "h-[180px]",
  },
]

export const ProductShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bento-header > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      })

      gsap.from(".bento-card", {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".bento-grid", start: "top 85%" },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="funcionalidades"
      className="py-20 sm:py-28 bg-[#FAFCFF] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bento-header text-center mb-14">
          <span className="inline-block bg-[#0047FF]/[0.08] text-[#0047FF] px-4 py-1.5 text-[13px] font-bold tracking-wide rounded-full mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A0F2D] tracking-[-2px] leading-[1.1] mb-4">
            Todo lo que tu clínica necesita.
            <br />
            <span className="text-[#0047FF]">Nada que no necesite.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Cada función está diseñada para que <span className="font-semibold text-[#0A0F2D]">atiendas más pacientes en menos tiempo</span> y factures más.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid grid grid-cols-1 lg:grid-cols-3 gap-4">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div
                key={i}
                className={`bento-card group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${feat.span} ${
                  feat.highlight
                    ? "bg-[#0A0F2D] border-[#0A0F2D] text-white"
                    : "bg-white border-gray-100 hover:border-[#0047FF]/20"
                }`}
              >
                <div className="p-6 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      feat.highlight ? "bg-[#0047FF]/20" : "bg-[#0047FF]/[0.08]"
                    }`}>
                      <Icon className={`w-4 h-4 ${feat.highlight ? "text-[#0047FF]" : "text-[#0047FF]"}`} />
                    </div>
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${
                      feat.highlight ? "text-[#0047FF]" : "text-[#0047FF]"
                    }`}>
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 tracking-[-0.5px] ${
                    feat.highlight ? "text-white" : "text-[#0A0F2D]"
                  }`}>
                    {feat.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-4 ${
                    feat.highlight ? "text-white/60" : "text-gray-500"
                  }`}>
                    {feat.desc}
                  </p>
                </div>

                {/* Screenshot */}
                <div className={`px-6 ${feat.imgClass} overflow-hidden`}>
                  <img
                    src={feat.src}
                    alt={`Dentiqly - ${feat.title}`}
                    loading="lazy"
                    className="w-full h-full object-cover object-left-top rounded-t-lg transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#0047FF] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-[#0047FF]/25 hover:bg-[#0036CC] hover:shadow-xl transition-all duration-300 group"
          >
            Empezá gratis y descubrí todas las funcionalidades
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-gray-400 mt-3">Sin tarjeta de crédito · 14 días gratis</p>
        </div>
      </div>
    </section>
  )
}
