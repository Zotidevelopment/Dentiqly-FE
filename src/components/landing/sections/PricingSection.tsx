import React, { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  X,
  Calendar,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Shield,
  Headphones,
  Building2,
  Stethoscope,
  Globe,
  Zap,
  Bell,
  DollarSign,
  Wallet,
  UserCog,
  CalendarOff,
  Settings,
  Briefcase,
  Clock,
  ClipboardList,
  Pill,
  FolderOpen,
  TrendingUp,
  Lock,
  Smartphone,
  RefreshCw,
  Star,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const mainFeatures = [
  { icon: Calendar, text: "Agenda y turnos online" },
  { icon: UserCog, text: "Gestión completa de pacientes" },
  { icon: Stethoscope, text: "Odontograma interactivo" },
  { icon: DollarSign, text: "Liquidación de profesionales" },
  { icon: Wallet, text: "Flujo de caja y finanzas" },
  { icon: Building2, text: "Multi-sucursal" },
]

const allFeatures = [
  {
    category: "Agenda y Turnos",
    items: [
      { icon: Calendar, text: "Calendario visual con vista diaria, semanal y mensual" },
      { icon: Clock, text: "Turnos con duración personalizable por servicio" },
      { icon: Globe, text: "Reservas online desde el portal de pacientes" },
      { icon: CalendarOff, text: "Gestión de ausencias y feriados" },
      { icon: Bell, text: "Recordatorios automáticos por email" },
      { icon: RefreshCw, text: "Reprogramación y cancelación con un click" },
    ],
  },
  {
    category: "Pacientes",
    items: [
      { icon: UserCog, text: "Ficha completa con datos personales y contacto" },
      { icon: FileText, text: "Historia clínica digital ilimitada" },
      { icon: Stethoscope, text: "Odontograma interactivo con registro por pieza" },
      { icon: ClipboardList, text: "Planes de tratamiento con seguimiento" },
      { icon: Pill, text: "Recetas y prescripciones digitales" },
      { icon: FolderOpen, text: "Archivos adjuntos (radiografías, fotos, documentos)" },
      { icon: CreditCard, text: "Cuenta corriente por paciente" },
    ],
  },
  {
    category: "Finanzas",
    items: [
      { icon: DollarSign, text: "Liquidación automática de profesionales" },
      { icon: Wallet, text: "Flujo de caja con ingresos y egresos" },
      { icon: TrendingUp, text: "Reporte de deudores en tiempo real" },
      { icon: Shield, text: "Gestión de obras sociales y prepagas" },
      { icon: Briefcase, text: "Comisiones configurables por profesional" },
    ],
  },
  {
    category: "Administración",
    items: [
      { icon: Building2, text: "Gestión multi-sucursal centralizada" },
      { icon: Users, text: "Roles y permisos (admin, profesional, recepción)" },
      { icon: Briefcase, text: "Catálogo de servicios con precios y duración" },
      { icon: Settings, text: "Configuración completa de la clínica" },
      { icon: BarChart3, text: "Dashboard con métricas y KPIs en tiempo real" },
    ],
  },
  {
    category: "Portal de Pacientes",
    items: [
      { icon: Globe, text: "Portal web de autogestión para pacientes" },
      { icon: Smartphone, text: "Reserva de turnos online 24/7" },
      { icon: FileText, text: "Acceso a historial de turnos y tratamientos" },
      { icon: FolderOpen, text: "Descarga de archivos y documentos" },
      { icon: UserCog, text: "Actualización de datos personales" },
    ],
  },
  {
    category: "Seguridad y Soporte",
    items: [
      { icon: Lock, text: "Encriptación AES-256 de datos sensibles" },
      { icon: RefreshCw, text: "Backups automáticos diarios" },
      { icon: Headphones, text: "Soporte prioritario 24/7" },
      { icon: Star, text: "Actualizaciones continuas sin costo extra" },
      { icon: Zap, text: "Onboarding asistido y migración de datos gratuita" },
    ],
  },
]

const comparisonFeatures = [
  { name: "Usuarios y profesionales", pro: "Ilimitados", enterprise: "Ilimitados" },
  { name: "Sucursales", pro: "Hasta 3", enterprise: "Ilimitadas" },
  { name: "Historias clínicas", pro: "Ilimitadas", enterprise: "Ilimitadas" },
  { name: "Soporte", pro: "Email y chat", enterprise: "Prioritario 24/7" },
  { name: "Migración de datos", pro: "Asistida", enterprise: "Dedicada con consultor" },
  { name: "Integraciones personalizadas", pro: "+$10.000 /mes", enterprise: "Incluidas" },
]

export const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const monthlyPrice = 80000
  const annualPrice = 72000

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pricing-header", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      })

      gsap.from(".pricing-columns", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      })

      gsap.from(".pricing-table", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pricing-table", start: "top 85%" },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (showAllFeatures) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showAllFeatures])

  return (
    <>
      <section
        ref={sectionRef}
        id="precios"
        data-navbar-theme="light"
        className="py-28 sm:py-36 bg-white relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="pricing-header mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#0B1023] tracking-tight mb-10">
              Precios y planes
            </h2>

            {/* Toggle */}
            <div className="inline-flex items-center bg-[#F0F4FF] rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !isAnnual
                    ? "bg-[#0B1023] text-white shadow-sm"
                    : "text-[#0B1023]/60 hover:text-[#0B1023]"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isAnnual
                    ? "bg-[#0B1023] text-white shadow-sm"
                    : "text-[#0B1023]/60 hover:text-[#0B1023]"
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          {/* Plan Columns */}
          <div className="pricing-columns grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-16">
            {/* Professional */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-[#0B1023] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Profesional
                </span>
                {isAnnual && (
                  <span className="inline-flex items-center bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-3 py-1.5 rounded-full">
                    10% off
                  </span>
                )}
              </div>

              <div className="mb-2">
                {isAnnual ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-semibold text-[#0B1023] tracking-tight">
                      ${annualPrice.toLocaleString("es-AR")}
                    </span>
                    <span className="text-2xl text-[#0B1023]/30 line-through">
                      ${monthlyPrice.toLocaleString("es-AR")}
                    </span>
                  </div>
                ) : (
                  <span className="text-5xl font-semibold text-[#0B1023] tracking-tight">
                    ${monthlyPrice.toLocaleString("es-AR")}
                  </span>
                )}
              </div>

              <p className="text-sm text-[#0B1023]/40 mb-8">por mes / por clínica</p>

              {/* 6 Main Features */}
              <div className="space-y-3 mb-6">
                {mainFeatures.map((feat, i) => {
                  const Icon = feat.icon
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#2563FF]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#2563FF]" />
                      </div>
                      <span className="text-sm text-[#0B1023]/70">{feat.text}</span>
                    </div>
                  )
                })}
              </div>

              {/* Ver más */}
              <button
                onClick={() => setShowAllFeatures(true)}
                className="text-[#2563FF] text-sm font-semibold hover:text-[#1D4ED8] transition-colors mb-8 flex items-center gap-1"
              >
                Ver todas las funcionalidades
                <ArrowRight size={14} />
              </button>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm"
              >
                Comenzar ahora
                <ArrowRight size={16} />
              </Link>

              <p className="text-xs text-[#0B1023]/40 mt-4">
                14 días de prueba gratis. Sin tarjeta de crédito.
              </p>
            </div>

            {/* Enterprise */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center bg-[#F0F4FF] text-[#0B1023]/70 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Enterprise
                </span>
              </div>

              <p className="text-lg text-[#0B1023]/60 leading-relaxed mb-8 max-w-sm">
                Obtené una cotización personalizada de nuestro equipo para las necesidades
                únicas de tu clínica.
              </p>

              <a
                href="mailto:ventas@dentiqly.com"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#0B1023]/15 hover:border-[#2563FF] text-[#0B1023] font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm"
              >
                Contactar ventas
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="pricing-table border-t border-[#0B1023]/10">
            {comparisonFeatures.map((feature, i) => (
              <div
                key={i}
                className="grid grid-cols-3 md:grid-cols-[1fr_1fr_1fr] py-5 border-b border-[#0B1023]/[0.06] items-center"
              >
                <span className="text-sm text-[#0B1023]/70 font-medium">
                  {feature.name}
                </span>
                <span className="text-sm text-[#0B1023]/50 text-center md:text-left">
                  {feature.pro}
                </span>
                <span className="text-sm text-[#0B1023]/50 text-center md:text-left">
                  {feature.enterprise}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features Modal */}
      {showAllFeatures && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ overscrollBehavior: "contain" }}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0B1023]/60 backdrop-blur-sm"
            onClick={() => setShowAllFeatures(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ maxHeight: "85vh" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#0B1023]/[0.06]" style={{ flexShrink: 0 }}>
              <div>
                <h3 className="text-2xl font-semibold text-[#0B1023] tracking-tight">
                  Todas las funcionalidades
                </h3>
                <p className="text-sm text-[#0B1023]/40 mt-1">
                  Todo incluido en el Plan Profesional
                </p>
              </div>
              <button
                onClick={() => setShowAllFeatures(false)}
                className="w-10 h-10 rounded-full bg-[#F0F4FF] hover:bg-[#E0E8FF] flex items-center justify-center transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-[#0B1023]/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: "auto", flex: "1 1 0%", minHeight: 0, overscrollBehavior: "contain" }} className="px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {allFeatures.map((group, gi) => (
                  <div key={gi}>
                    <h4 className="text-xs font-bold text-[#2563FF] uppercase tracking-widest mb-4">
                      {group.category}
                    </h4>
                    <div className="space-y-3">
                      {group.items.map((feat, fi) => {
                        const Icon = feat.icon
                        return (
                          <div key={fi} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-[#2563FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="w-3.5 h-3.5 text-[#2563FF]" />
                            </div>
                            <span className="text-sm text-[#0B1023]/70 leading-snug">
                              {feat.text}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-[#0B1023]/[0.06] bg-[#F8FAFF] rounded-b-3xl" style={{ flexShrink: 0 }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-[#0B1023]/50">
                  +33 funcionalidades incluidas sin costo extra
                </p>
                <Link
                  to="/register"
                  onClick={() => setShowAllFeatures(false)}
                  className="inline-flex items-center justify-center gap-2 bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm"
                >
                  Comenzar prueba gratis
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
