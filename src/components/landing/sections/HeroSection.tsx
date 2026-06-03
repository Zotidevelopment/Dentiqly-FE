import React, { useRef, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ThinArrow } from "../components/ThinArrow"
import { CheckCircle2, Star, Shield, Clock } from "lucide-react"

const trustBadges = [
  { icon: Shield, text: "Seguridad de nivel bancario" },
  { icon: Clock, text: "Configuración rápida en 10 min" },
  { icon: Star, text: "14 días de prueba gratis" },
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
    <div ref={ref} className="text-center px-4">
      <div className="text-2xl sm:text-3xl font-bold text-[#0047FF] tracking-tight">
        +{count}{suffix}
      </div>
      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1.5">{label}</div>
    </div>
  )
}

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-12 lg:pt-32 lg:pb-16 bg-[#FAFCFF]"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft, professional gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EEF4FF] via-white to-[#FAFCFF]" />
        
        {/* Soft grid lines (extremely subtle) */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `linear-gradient(to right, #0047FF 1px, transparent 1px), linear-gradient(to bottom, #0047FF 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        
        {/* Very soft glow behind content */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0047FF]/5 rounded-full blur-[100px]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Credibility badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-[#0047FF]/[0.05] border border-[#0047FF]/10 text-[#0047FF] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-[#0047FF] text-[#0047FF]" />
            Software de gestión odontológica en Argentina
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-[2.2rem] sm:text-[2.8rem] md:text-[3.4rem] lg:text-[4rem] font-bold tracking-[-1.5px] leading-[1.12] text-[#0A0F2D] mb-6 max-w-[850px]"
        >
          Simplificá la gestión de tu <span className="text-[#0047FF]">clínica dental</span>
        </motion.h1>

        {/* Sub-headline — pain + benefit */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-[620px] mb-8"
        >
          Centralizá y automatizá tu agenda de turnos, fichas de pacientes y recordatorios automáticos. Dentiqly simplifica tu administración diaria para que te enfoques en la salud de tus pacientes.
        </motion.p>

        {/* Double CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3.5 items-center justify-center w-full mb-5"
        >
          <Link
            to="/register"
            className="group bg-[#0047FF] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold shadow-lg shadow-[#0047FF]/15 hover:shadow-xl hover:shadow-[#0047FF]/25 hover:bg-[#003BCC] transition-all duration-200 flex items-center gap-2 justify-center min-w-[220px]"
          >
            <span>Probar gratis por 14 días</span>
            <ThinArrow size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
          
          <a
            href="mailto:hola@dentiqly.com?subject=Solicitud de Demo - Dentiqly&body=Hola equipo de Dentiqly,%0D%0A%0D%0AMe gustaría agendar una demo personalizada para conocer más sobre la plataforma.%0D%0A%0D%0AMuchas gracias!"
            className="bg-white border border-gray-200 text-[#0A0F2D] hover:border-gray-300 hover:bg-gray-50 px-8 py-3.5 rounded-full text-[15px] font-semibold transition-all duration-200 flex items-center gap-2 justify-center min-w-[200px]"
          >
            <span>Ver demostración en vivo</span>
          </a>
        </motion.div>

        {/* No credit card notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex items-center gap-1.5 text-xs text-gray-400 mb-12"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          Sin compromisos ni tarjeta de crédito
        </motion.div>

        {/* Product Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full max-w-[1000px] mx-auto mb-14"
        >
          {/* Subtle drop shadow instead of heavy glowing gradient */}
          <div className="relative rounded-xl overflow-hidden border border-gray-200/50 shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-white">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white border border-gray-150 rounded px-3 py-0.5 text-[10px] text-gray-400 font-mono">
                  app.dentiqly.com
                </div>
              </div>
            </div>
            <img
              src="/assets/screenshots/dashboard.png"
              alt="Dentiqly - Dashboard de gestión odontológica"
              loading="eager"
              className="w-full h-auto object-contain"
            />
          </div>
        </motion.div>

        {/* Stats counters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-gray-150 gap-y-4 sm:gap-y-0 w-full max-w-2xl mx-auto py-4"
        >
          <div className="w-full sm:w-1/3">
            <AnimatedCounter end={500} suffix="" label="Clínicas activas" delay={0} />
          </div>
          <div className="w-full sm:w-1/3">
            <AnimatedCounter end={2000} suffix="" label="Profesionales" delay={150} />
          </div>
          <div className="w-full sm:w-1/3">
            <AnimatedCounter end={40} suffix="%" label="Menos ausencias" delay={300} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
