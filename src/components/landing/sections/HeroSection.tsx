import React, { useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { CalendarView } from "../../admin/CalendarView"
import { PatientsView } from "../../patients/PatientsView"

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] lg:h-[100vh] lg:min-h-[700px] lg:max-h-[960px] flex items-center justify-center overflow-hidden pt-28 pb-16 lg:py-0"
    >
      {/* ── Background image ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="/assets/hero/fondo.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="relative z-10 w-full max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 h-full">

        {/* Left Column: Text Copy & CTAs */}
        <div className="flex-shrink-0 w-full lg:w-[44%] xl:w-[42%] flex flex-col items-center lg:items-start text-center lg:text-left px-2 py-4">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.6rem] sm:text-[3.2rem] lg:text-[2.8rem] xl:text-[3.6rem] font-semibold tracking-[-2.5px] leading-[1.05] text-[#0A0F2D] mb-6"
          >
            Software dental <br />
            todo <span className="text-[#2563FF]">en uno</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-[14px] sm:text-[15px] text-gray-500 leading-relaxed max-w-[420px] mb-8"
          >
            Gestiona historias clínicas, odontogramas y la administración de tu consultorio con una fluidez excepcional. Probá la ficha interactiva aquí mismo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start w-full"
          >
            <Link
              to="/demo"
              className="btn-wayflyer-secondary min-w-[155px] flex items-center justify-center text-xs"
            >
              Probar demo completa
            </Link>
            <Link to="/register" className="btn-wayflyer-primary min-w-[155px] text-xs">
              Comenzar gratis
              <div className="btn-icon-circle">
                <ArrowRight size={12} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Real Patient Component (Scaled Down) */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block lg:w-[52%] xl:w-[50%] shrink-0"
        >
          <div className="w-full h-[520px] rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_20px_45px_rgba(0,0,0,0.06)] backdrop-blur-md overflow-hidden relative flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50/70 border-b border-gray-200/50 shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ficha de Paciente</span>
              </div>
              <span className="text-[9px] font-bold text-[#2563FF] bg-[#2563FF]/10 px-2 py-0.5 rounded">INTERACTIVO</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-[125%] h-[125%] scale-[0.8] origin-top-left p-1">
                <PatientsView initialPatientId="pac-1" />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
