import React, { useRef, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ThinArrow } from "../components/ThinArrow"
import { CheckCircle2, Star, Shield, Clock } from "lucide-react"

const trustBadges = [
  { icon: Shield, text: "Datos 100% seguros" },
  { icon: Clock, text: "Configuración en 10 min" },
  { icon: Star, text: "Sin tarjeta de crédito" },
]

const AnimatedCounter: React.FC<{ end: number; suffix: string; label: string; delay: number }> = ({ end, suffix, label, delay }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 2000
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          setTimeout(animate, delay)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, delay])

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold text-[#0047FF]">
        +{count}{suffix}
      </div>
      <div className="text-sm text-gray-500 font-medium mt-1">{label}</div>
    </div>
  )
}

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-8 lg:pt-24 lg:pb-4"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4FF] via-white to-[#FAFCFF]" />
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle, #0047FF 0.8px, transparent 0.8px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Credibility badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-[#0047FF]/[0.08] border border-[#0047FF]/20 text-[#0047FF] px-5 py-2 rounded-full text-sm font-bold">
            <Star className="w-4 h-4 fill-[#0047FF]" />
            El software dental #1 para clínicas en Argentina
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-[2.4rem] sm:text-[3rem] md:text-[3.6rem] lg:text-[4.2rem] font-extrabold tracking-[-3px] leading-[1.05] text-[#0A0F2D] mb-6 max-w-[900px]"
        >
          Gestioná tu clínica dental
          <br />
          <span className="text-[#0047FF]">sin esfuerzo</span>
        </motion.h1>

        {/* Sub-headline — pain + benefit */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-[640px] mb-8"
        >
          Dejá de perder pacientes por turnos olvidados.{" "}
          <span className="font-semibold text-[#0A0F2D]">
            Automatizá turnos, historias clínicas y recordatorios
          </span>{" "}
          en una sola plataforma.
        </motion.p>

        {/* Double CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mb-6"
        >
          <Link
            to="/register"
            className="group relative overflow-hidden bg-[#0047FF] text-white px-10 py-4 rounded-full text-lg font-extrabold shadow-xl shadow-[#0047FF]/30 hover:shadow-2xl hover:shadow-[#0047FF]/40 hover:bg-[#0036CC] transition-all duration-300 flex items-center gap-3 min-w-[260px] justify-center"
          >
            <span className="relative z-10">Probá 14 días GRATIS</span>
            <ThinArrow size={22} className="relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0047FF] via-[#2563FF] to-[#0047FF] bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <a
            href="mailto:hola@dentiqly.com?subject=Solicitud de Demo - Dentiqly&body=Hola equipo de Dentiqly,%0D%0A%0D%0AMe gustaría agendar una demo personalizada para conocer más sobre la plataforma.%0D%0A%0D%0AMuchas gracias!"
            className="bg-white border-2 border-gray-200 text-[#0A0F2D] px-8 py-4 rounded-full text-lg font-bold hover:border-[#0047FF]/30 hover:bg-[#F0F4FF] transition-all duration-300 flex items-center gap-2 min-w-[220px] justify-center"
          >
            ▶ Ver demo en vivo
          </a>
        </motion.div>

        {/* No credit card notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center gap-2 text-sm text-gray-400 mb-10"
        >
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Sin tarjeta de crédito · Cancelá cuando quieras
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {trustBadges.map((badge, i) => {
            const Icon = badge.icon
            return (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-full shadow-sm">
                <Icon className="w-4 h-4 text-[#0047FF]" />
                <span className="font-medium">{badge.text}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Product Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[1050px] mx-auto"
        >
          {/* Glow behind screenshot */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#0047FF]/20 via-[#2563FF]/10 to-[#0047FF]/20 rounded-[2rem] blur-2xl opacity-60" />

          <div className="relative rounded-2xl overflow-hidden border border-gray-200/60 shadow-2xl shadow-gray-900/10 bg-white">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white border border-gray-200 rounded-md px-4 py-1 text-xs text-gray-400 font-mono">
                  app.dentiqly.com
                </div>
              </div>
            </div>
            <img
              src="/assets/screenshots/dashboard.png"
              alt="Dentiqly - Dashboard de gestión dental con métricas, turnos y pacientes"
              loading="eager"
              className="w-full h-auto"
            />
          </div>
        </motion.div>

        {/* Stats counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="grid grid-cols-3 gap-8 sm:gap-16 mt-14 mb-4"
        >
          <AnimatedCounter end={500} suffix="" label="Clínicas confían en nosotros" delay={0} />
          <AnimatedCounter end={2000} suffix="" label="Profesionales activos" delay={200} />
          <AnimatedCounter end={40} suffix="%" label="Menos inasistencias" delay={400} />
        </motion.div>
      </div>
    </section>
  )
}
