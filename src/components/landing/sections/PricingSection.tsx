import React, { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Check,
  ArrowRight,
  Calendar,
  FileText,
  CreditCard,
  MessageCircle,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Building2,
  Stethoscope,
  Globe,
  Zap,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const allFeatures = [
  { icon: Users, text: "Usuarios y profesionales ilimitados" },
  { icon: Calendar, text: "Gestión de turnos y agenda online" },
  { icon: FileText, text: "Historias clínicas digitales completas" },
  { icon: Stethoscope, text: "Odontograma interactivo" },
  { icon: CreditCard, text: "Control de caja y finanzas" },
  { icon: MessageCircle, text: "Recordatorios automáticos por email" },
  { icon: Building2, text: "Gestión multi-sucursal" },
  { icon: BarChart3, text: "Dashboard con métricas en tiempo real" },
  { icon: Globe, text: "Portal de pacientes y reservas online" },
  { icon: Shield, text: "Seguridad AES-256 y backups automáticos" },
  { icon: Zap, text: "Liquidación automática de profesionales" },
  { icon: Headphones, text: "Soporte prioritario 24/7" },
]

const highlights = [
  { value: "Ilimitado", label: "Usuarios" },
  { value: "14 días", label: "Prueba gratis" },
  { value: "24/7", label: "Soporte" },
]

export const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pricing-left > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      })

      gsap.from(".pricing-card-wrapper", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pricing-card-wrapper", start: "top 85%" },
      })

      gsap.from(".pricing-feature-item", {
        x: -10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.04,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pricing-card-wrapper", start: "top 85%" },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="precios"
      data-navbar-theme="dark"
      className="py-28 sm:py-36 bg-[#0A0F2D] relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2563FF] rounded-[100%] blur-[150px] opacity-15 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#2563FF]/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-[300px] h-[300px] bg-[#2563FF]/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-20 items-start">

          {/* ── Left Column: Title + Description ── */}
          <div className="pricing-left flex-1 lg:max-w-[480px] lg:sticky lg:top-32 pt-4">
            <p className="text-sm font-bold text-[#2563FF] tracking-widest uppercase mb-5">
              Precios
            </p>

            <h2 className="text-4xl md:text-5xl xl:text-[3.4rem] font-semibold text-white mb-6 tracking-[-3px] leading-[1.1]">
              Un solo plan,
              <br />
              <span className="text-[#2563FF]">todo ilimitado.</span>
            </h2>

            <p className="text-lg text-blue-200/50 leading-relaxed mb-10 max-w-[420px]">
              Sin sorpresas ni costos ocultos. Un único plan que incluye
              todas las funcionalidades para que tu clínica dental funcione
              al máximo nivel desde el primer día.
            </p>

            {/* Highlights */}
            <div className="flex gap-6 mb-10">
              {highlights.map((h, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-white mb-1">{h.value}</p>
                  <p className="text-xs text-blue-200/40 uppercase tracking-wider">{h.label}</p>
                </div>
              ))}
            </div>

            {/* Trust signals */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#22C55E]/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#22C55E]" />
                </div>
                <span className="text-blue-100/60 text-sm">Sin tarjeta de crédito para empezar</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#22C55E]/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#22C55E]" />
                </div>
                <span className="text-blue-100/60 text-sm">Cancelá cuando quieras, sin penalidades</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#22C55E]/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#22C55E]" />
                </div>
                <span className="text-blue-100/60 text-sm">Migración de datos gratuita y asistida</span>
              </div>
            </div>

          </div>

          {/* ── Right Column: Plan Card ── */}
          <div className="pricing-card-wrapper flex-1 lg:max-w-[560px] w-full">
            <div className="relative p-[1px] rounded-[2rem] bg-gradient-to-b from-white/20 via-white/5 to-transparent overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#2563FF]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-[#0F1535] rounded-[2rem] p-8 sm:p-10 backdrop-blur-xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Plan Pro</h3>
                    <p className="text-blue-200/30 text-sm">Todo lo que tu clínica necesita</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-[#2563FF]/15 border border-[#2563FF]/25 text-[#2563FF] text-xs font-bold uppercase tracking-wider shrink-0">
                    Más Popular
                  </span>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-6xl font-semibold text-white tracking-[-3px]">$80.000</span>
                  <span className="text-blue-200/40 text-lg ml-2">ARS / mes</span>
                </div>
                <p className="text-blue-200/30 text-sm mb-8">
                  o $864.000 /año <span className="text-[#22C55E] font-bold">(ahorrá 10%)</span>
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                {/* Features */}
                <p className="text-xs font-bold text-blue-200/40 uppercase tracking-widest mb-5">
                  Todo incluido
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-10">
                  {allFeatures.map((feat, i) => {
                    const Icon = feat.icon
                    return (
                      <div key={i} className="pricing-feature-item flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#2563FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-[#2563FF]" />
                        </div>
                        <span className="text-blue-50/70 text-sm leading-snug">{feat.text}</span>
                      </div>
                    )
                  })}
                </div>

                {/* CTA */}
                <Link
                  to="/register"
                  className="w-full btn-wayflyer-primary py-4 text-lg gap-2"
                >
                  Comenzar 14 días gratis
                  <ArrowRight size={16} />
                </Link>

                <p className="text-center text-blue-200/20 text-xs mt-4">
                  Sin tarjeta de crédito requerida
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
