import React, { useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Mail,
  Globe,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react"
import { ThinArrow } from "../components/ThinArrow"
import { Navbar } from "./Navbar"
import { FooterSection } from "./FooterSection"
import { CustomCursor } from "../components/CustomCursor"

// ─── Reusable fade-in wrapper ──────────────────────────────────────────────
const FadeIn: React.FC<{
  children: React.ReactNode
  delay?: number
  direction?: "up" | "left" | "right" | "none"
  className?: string
}> = ({ children, delay = 0, direction = "up", className = "" }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 32 : 0,
      x: direction === "left" ? -32 : direction === "right" ? 32 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Features data ─────────────────────────────────────────────────────────
const features = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "PANEL DE CONTROL",
    title: "Todo tu negocio de un vistazo",
    description:
      "Un dashboard pensado para que tomes decisiones rápidas. Pacientes activos, turnos del día, ingresos y estado de tu clínica — todo en tiempo real, sin necesidad de navegar entre pantallas.",
    bullets: [
      "Métricas de turnos: atendidos, confirmados y ausentes",
      "Lista de pacientes con búsqueda instantánea",
      "Agenda del día con acciones directas",
      "Resumen de servicios y profesionales activos",
    ],
    image: "/assets/screenshots/dashboard.png",
    color: "#0047FF",
    stat: { value: "93", label: "pacientes gestionados" },
  },
  {
    id: "calendario",
    icon: CalendarDays,
    label: "CALENDARIO INTELIGENTE",
    title: "Agenda sin fricción, sin errores",
    description:
      "Visualizá todos los turnos en vista diaria, semanal o mensual. Asigná profesionales, filtrá por estado y evitá superposiciones. La agenda más completa del mercado dental.",
    bullets: [
      "Vista por profesional o por sucursal",
      "Drag & drop para mover turnos",
      "Filtros por estado: Pendiente, Confirmado, Atendido",
      "Exportación de agenda a Excel/PDF",
    ],
    image: "/assets/screenshots/calendario.png",
    color: "#0047FF",
    stat: { value: "80%", label: "reducción de ausencias" },
  },
  {
    id: "pacientes",
    icon: Users,
    label: "HISTORIAL CLÍNICO",
    title: "Cada paciente, su historia completa",
    description:
      "Accedé a la ficha completa de cada paciente: información personal, odontograma, prescripciones, tratamientos, archivos y cuenta corriente. Todo en un solo lugar.",
    bullets: [
      "Odontograma digital interactivo por diente",
      "Historial de prescripciones y tratamientos",
      "Archivos adjuntos: radiografías, fotos, documentos",
      "Cuenta corriente y deuda del paciente",
    ],
    image: "/assets/screenshots/paciente-detalle.png",
    color: "#7C3AED",
    stat: { value: "100%", label: "historial digital" },
  },
  {
    id: "recordatorios",
    icon: Mail,
    label: "RECORDATORIOS AUTOMÁTICOS",
    title: "Menos ausencias. Cero esfuerzo.",
    description:
      "Enviá recordatorios automáticos por email antes de cada turno. Tus pacientes confirman o cancelan desde el email, sin llamadas. Configurá los mensajes a tu medida.",
    bullets: [
      "Recordatorios 24h y 1h antes del turno",
      "Confirmación y cancelación desde email",
      "Mensajes personalizables por clínica",
      "Seguimiento de envíos en tiempo real",
    ],
    image: "/assets/screenshots/recordatorios.png",
    color: "#059669",
    stat: { value: "18", label: "turnos notificados hoy" },
  },
  {
    id: "booking",
    icon: Globe,
    label: "RESERVA ONLINE",
    title: "Tus pacientes reservan solos, 24/7",
    description:
      "Compartí tu portal de reservas y dejá que los pacientes elijan sucursal, servicio, profesional, fecha y hora. Sin llamadas. Sin WhatsApps. Tu agenda se completa sola.",
    bullets: [
      "Portal de reservas con tu marca",
      "Selección de sucursal, servicio y profesional",
      "Confirmación automática por email",
      "Disponible las 24 horas, los 7 días",
    ],
    image: "/assets/screenshots/booking.png",
    color: "#F59E0B",
    stat: { value: "24/7", label: "disponible online" },
  },
]

// ─── Stats bar ─────────────────────────────────────────────────────────────
const stats = [
  { value: "80%", label: "Menos ausencias con recordatorios" },
  { value: "24/7", label: "Reservas online sin intervención" },
  { value: "100%", label: "Historial clínico digitalizado" },
  { value: "5 min", label: "Para configurar tu clínica" },
]

// ─── Bento Grid Cards ───────────────────────────────────────────────────────
const BentoCard: React.FC<{
  className?: string
  children: React.ReactNode
  delay?: number
}> = ({ className = "", children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-[1.75rem] overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ─── Sticky Feature Section ─────────────────────────────────────────────────
const StickyFeature: React.FC<{
  feature: (typeof features)[0]
  index: number
}> = ({ feature, index }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const Icon = feature.icon
  const isReversed = index % 2 !== 0

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
    >
      {/* Text side */}
      <div className={isReversed ? "lg:order-2" : ""}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: `${feature.color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color: feature.color }} />
          </div>

          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.1em] mb-4"
            style={{
              background: `${feature.color}12`,
              color: feature.color,
            }}
          >
            {feature.label}
          </span>

          <h2
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-2px] leading-[1.1] text-[#0A0F2D] mb-5"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            {feature.title}
          </h2>

          <p className="text-[17px] text-gray-500 leading-relaxed mb-8 max-w-lg">
            {feature.description}
          </p>

          <div className="space-y-3 mb-8">
            {feature.bullets.map((bullet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: feature.color }}
                />
                <span className="text-[15px] text-gray-600">{bullet}</span>
              </motion.div>
            ))}
          </div>

          {/* Stat pill */}
          <div
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: `${feature.color}0D`, border: `1px solid ${feature.color}20` }}
          >
            <span className="text-2xl font-bold" style={{ color: feature.color }}>
              {feature.stat.value}
            </span>
            <span className="text-sm text-gray-500">{feature.stat.label}</span>
          </div>
        </motion.div>
      </div>

      {/* Image side */}
      <motion.div
        className={isReversed ? "lg:order-1" : ""}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="relative rounded-[1.75rem] overflow-hidden shadow-2xl border"
          style={{
            borderColor: `${feature.color}20`,
            boxShadow: `0 24px 80px -20px ${feature.color}25`,
          }}
        >
          <img
            src={feature.image}
            alt={`Dentiqly - ${feature.title}`}
            className="w-full h-auto block"
            loading="lazy"
          />
          {/* Subtle overlay gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Product Page ──────────────────────────────────────────────────────
export const ProductPage: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div className="min-h-screen bg-[#FAFCFF] font-sans text-[#0A0F2D] overflow-hidden selection:bg-[#2563FF] selection:text-white cursor-none md:cursor-none">
      <CustomCursor />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #F0F5FF 0%, #FAFCFF 40%, #EEF4FF 100%)",
        }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#0047FF 1px, transparent 1px), linear-gradient(90deg, #0047FF 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle, #0047FF40, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle, #7C3AED40, transparent 70%)" }} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white border border-[#0047FF]/15 rounded-full px-4 py-2 mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#0047FF] animate-pulse" />
            <span className="text-[13px] font-semibold text-[#0047FF] tracking-wide">
              Software de gestión dental
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[3rem] sm:text-[4rem] lg:text-[5.25rem] font-semibold tracking-[-4px] leading-[1.0] mb-7"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            La plataforma que{" "}
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, #0047FF, #7C3AED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              tu clínica
            </span>{" "}
            <br className="hidden sm:block" />
            necesitaba.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-[18px] sm:text-[20px] text-gray-500 leading-relaxed max-w-[600px] mx-auto mb-12"
          >
            Gestión de turnos, historial clínico, odontograma digital, recordatorios automáticos y reservas online. Todo integrado, sin complicaciones.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <Link
              to="/register"
              className="btn-wayflyer-primary min-w-[200px] gap-2 text-base"
            >
              Empezar gratis
              <ThinArrow size={20} className="text-white" />
            </Link>
            <a
              href="mailto:hola@dentiqly.com?subject=Solicitud de Demo&body=Hola! Me gustaría ver una demo de Dentiqly."
              className="btn-wayflyer-secondary min-w-[200px] text-base"
            >
              Pedir una demo
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex items-center justify-center gap-2 mt-10 text-sm text-gray-400"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
            ))}
            <span className="ml-1 font-medium text-gray-500">Usado por clínicas en toda Argentina</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={i} delay={i * 0.08} className="text-center">
                <div
                  className="text-3xl sm:text-4xl font-bold tracking-tight mb-1"
                  style={{
                    background: "linear-gradient(135deg, #0047FF, #7C3AED)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 leading-tight">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BENTO GRID — OVERVIEW
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-[#FAFCFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047FF]/8 text-[#0047FF] text-[12px] font-bold tracking-widest rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" />
              FUNCIONALIDADES
            </span>
            <h2
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-3px] leading-[1.05] text-[#0A0F2D]"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Todo lo que necesitás,
              <br />
              <span className="text-gray-400 font-normal">sin lo que no necesitás.</span>
            </h2>
          </FadeIn>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

            {/* Card 1 — Dashboard (col 8) */}
            <BentoCard
              delay={0.05}
              className="md:col-span-8 bg-white border border-gray-100 shadow-sm"
            >
              <div className="p-7 pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0047FF]/10 flex items-center justify-center">
                    <LayoutDashboard className="w-4.5 h-4.5 text-[#0047FF]" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Panel de Control</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-[-1px] text-[#0A0F2D] mb-1">
                  Todo tu negocio en una pantalla
                </h3>
                <p className="text-sm text-gray-500 mb-5">Turnos, pacientes e ingresos en tiempo real.</p>
              </div>
              <div className="mx-5 mb-0 rounded-t-2xl overflow-hidden border border-b-0 border-gray-100 shadow-md">
                <img
                  src="/assets/screenshots/dashboard.png"
                  alt="Dentiqly Dashboard"
                  className="w-full h-auto block"
                  style={{ transform: "translateY(2px)" }}
                />
              </div>
            </BentoCard>

            {/* Card 2 — Stat card (col 4) */}
            <BentoCard
              delay={0.1}
              className="md:col-span-4 flex flex-col gap-4"
            >
              {/* Mini stat 1 */}
              <div className="flex-1 rounded-[1.75rem] bg-[#0047FF] p-7 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
                  style={{ background: "white" }} />
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white/70 text-sm mb-1">Reducción de ausencias</p>
                  <div className="text-5xl font-bold text-white tracking-tight">80%</div>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Con recordatorios automáticos por email antes de cada turno.
                </p>
              </div>

              {/* Mini stat 2 */}
              <div className="flex-1 rounded-[1.75rem] bg-[#0A0F2D] p-7 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5 translate-y-1/2 -translate-x-1/2"
                  style={{ background: "#0047FF" }} />
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5 text-white/80" />
                  </div>
                  <p className="text-white/60 text-sm mb-1">Reservas online</p>
                  <div className="text-4xl font-bold text-white tracking-tight">24/7</div>
                </div>
                <p className="text-white/40 text-xs">Tu agenda se completa sola.</p>
              </div>
            </BentoCard>

            {/* Card 3 — Calendario (col 6) */}
            <BentoCard
              delay={0.15}
              className="md:col-span-6 bg-white border border-gray-100 shadow-sm"
            >
              <div className="p-7 pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0047FF]/10 flex items-center justify-center">
                    <CalendarDays className="w-4.5 h-4.5 text-[#0047FF]" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Calendario</span>
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.5px] text-[#0A0F2D] mb-1">
                  Agenda inteligente
                </h3>
                <p className="text-sm text-gray-500 mb-4">Vista diaria, semanal y mensual con filtros.</p>
              </div>
              <div className="mx-5 mb-0 rounded-t-2xl overflow-hidden border border-b-0 border-gray-100 shadow-sm">
                <img
                  src="/assets/screenshots/calendario.png"
                  alt="Dentiqly Calendario"
                  className="w-full h-auto block"
                  style={{ transform: "translateY(2px)" }}
                />
              </div>
            </BentoCard>

            {/* Card 4 — Pacientes (col 6) */}
            <BentoCard
              delay={0.2}
              className="md:col-span-6 bg-white border border-gray-100 shadow-sm"
            >
              <div className="p-7 pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-[#7C3AED]" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Pacientes</span>
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.5px] text-[#0A0F2D] mb-1">
                  Historial clínico completo
                </h3>
                <p className="text-sm text-gray-500 mb-4">Odontograma, prescripciones y más.</p>
              </div>
              <div className="mx-5 mb-0 rounded-t-2xl overflow-hidden border border-b-0 border-gray-100 shadow-sm">
                <img
                  src="/assets/screenshots/paciente-detalle.png"
                  alt="Dentiqly Paciente Detalle"
                  className="w-full h-auto block"
                  style={{ transform: "translateY(2px)" }}
                />
              </div>
            </BentoCard>

            {/* Card 5 — Recordatorios (col 7) */}
            <BentoCard
              delay={0.1}
              className="md:col-span-7 bg-white border border-gray-100 shadow-sm"
            >
              <div className="p-7 pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#059669]/10 flex items-center justify-center">
                    <Mail className="w-4.5 h-4.5 text-[#059669]" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Recordatorios</span>
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.5px] text-[#0A0F2D] mb-1">
                  Emails automáticos
                </h3>
                <p className="text-sm text-gray-500 mb-4">Sin que muevas un dedo.</p>
              </div>
              <div className="mx-5 mb-0 rounded-t-2xl overflow-hidden border border-b-0 border-gray-100 shadow-sm">
                <img
                  src="/assets/screenshots/recordatorios.png"
                  alt="Dentiqly Recordatorios"
                  className="w-full h-auto block"
                  style={{ transform: "translateY(2px)" }}
                />
              </div>
            </BentoCard>

            {/* Card 6 — Features list (col 5) */}
            <BentoCard
              delay={0.15}
              className="md:col-span-5 bg-gradient-to-br from-[#0A0F2D] to-[#0d1a4a] p-8 flex flex-col justify-between min-h-[340px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5 text-white/80" />
                </div>
                <h3 className="text-2xl font-semibold text-white tracking-[-1px] mb-2">
                  Construido para clínicas argentinas
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Con soporte para obras sociales, liquidaciones y el flujo real de trabajo dental.
                </p>
              </div>
              <div className="space-y-2.5">
                {[
                  "Obras sociales y cobertura",
                  "Liquidaciones de honorarios",
                  "Multi-sucursal y multi-profesional",
                  "Portal de reserva propio",
                  "Soporte en español 🇦🇷",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#0047FF]/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-[#6699FF]" />
                    </div>
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </BentoCard>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE DEEP DIVE — Sticky sections
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeIn className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047FF]/8 text-[#0047FF] text-[12px] font-bold tracking-widest rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" />
              EN DETALLE
            </span>
            <h2
              className="text-4xl sm:text-5xl font-semibold tracking-[-3px] leading-[1.05] text-[#0A0F2D]"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Cada función pensada
              <br />
              <span className="text-gray-400 font-normal">para el dentista de hoy.</span>
            </h2>
          </FadeIn>

          <div className="space-y-28 lg:space-y-36">
            {features.map((feature, i) => (
              <StickyFeature key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-28 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0A0F2D 0%, #0d1a4a 50%, #0A0F2D 100%)",
        }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-20 pointer-events-none blur-3xl rounded-full"
          style={{ background: "radial-gradient(circle, #0047FF, transparent 70%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 text-[12px] font-bold tracking-widest rounded-full mb-6 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0047FF] animate-pulse" />
              EMPEZÁ HOY
            </span>

            <h2
              className="text-4xl sm:text-5xl lg:text-[4rem] font-semibold tracking-[-3px] leading-[1.05] text-white mb-6"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Tu clínica, mejor
              <br />
              <span style={{
                background: "linear-gradient(135deg, #6699FF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                desde el primer día.
              </span>
            </h2>

            <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Configurá tu clínica en menos de 5 minutos. Sin tarjeta de crédito. Sin compromisos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 bg-white text-[#0047FF] font-semibold px-8 py-4 rounded-full text-[15px] hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-lg"
              >
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:hola@dentiqly.com?subject=Solicitud de Demo"
                className="inline-flex items-center gap-2 text-white/60 font-medium px-6 py-4 rounded-full text-[15px] border border-white/15 hover:bg-white/5 transition-all"
              >
                Pedir una demo →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <FooterSection />
    </div>
  )
}
