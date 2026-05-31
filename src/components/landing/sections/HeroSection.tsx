import React, { useRef, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ThinArrow } from "../components/ThinArrow"

const useSectionMouse = (sectionRef: React.RefObject<HTMLElement | null>) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      setMouse({ x, y })
    }

    const onLeave = () => setMouse({ x: 0, y: 0 })

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [sectionRef])

  return mouse
}

const FloatingCard: React.FC<{
  src: string
  alt: string
  side: "left" | "right"
  delay?: number
  mouse: { x: number; y: number }
}> = ({ src, alt, side, delay = 0, mouse }) => {
  const isLeft = side === "left"

  const baseRotateY = isLeft ? 16 : -16
  const baseRotateX = 4
  const rotateY = baseRotateY + mouse.x * (isLeft ? 14 : 10)
  const rotateX = baseRotateX + -mouse.y * (isLeft ? 10 : 14)
  const translateX = mouse.x * (isLeft ? 8 : -8)
  const translateY = mouse.y * (isLeft ? -6 : 6)

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -80 : 80, y: 40 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative group w-full"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{
          duration: isLeft ? 5 : 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: isLeft ? 0 : 1.5,
        }}
      >
        <div
          style={{
            transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="absolute -inset-6 rounded-[28px] blur-2xl transition-opacity duration-700"
            style={{
              opacity: 0.2 + Math.abs(mouse.x) * 0.15 + Math.abs(mouse.y) * 0.1,
              background: `radial-gradient(ellipse at ${50 + mouse.x * 20}% ${50 + mouse.y * 20}%, rgba(37,99,255,0.3), transparent 70%)`,
              transform: "translateZ(-40px)",
            }}
          />

          <img
            src={src}
            alt={alt}
            loading="eager"
            className="relative z-10 w-full h-auto rounded-2xl"
            style={{
              transform: "translateZ(40px)",
              filter: `drop-shadow(${-mouse.x * 10}px ${-mouse.y * 10 + 20}px 40px rgba(0,0,0,0.15))`,
              transition: "filter 0.25s ease-out",
            }}
          />

          <div
            className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + mouse.x * 30}% ${50 + mouse.y * 30}%, rgba(255,255,255,0.08), transparent 60%)`,
              transform: "translateZ(50px)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const mouse = useSectionMouse(sectionRef)

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 lg:pt-24 lg:pb-12"
    >
      {/* ── Background image ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/hero/fondo.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Main 3-col layout ── */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4 xl:gap-6">

        {/* Left Card */}
        <div className="hidden lg:flex lg:w-[28%] xl:w-[30%] justify-center items-center">
          <FloatingCard
            src="/assets/hero/tarjeta-izquierda.png"
            alt="Dentiqly - Agenda dental con turnos y citas de pacientes"
            side="left"
            delay={0}
            mouse={mouse}
          />
        </div>

        {/* Center Text */}
        <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-[580px] xl:max-w-[650px] flex flex-col items-center text-center px-2 py-4">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.6rem] sm:text-[3.2rem] md:text-[3.8rem] lg:text-[3.4rem] xl:text-[4rem] font-semibold tracking-[-3px] leading-[1.05] text-[#0A0F2D] mb-6"
          >
            <span className="inline-block whitespace-nowrap">Software dental</span>
            <br />
            todo <span className="text-[#2563FF]">en uno</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-[15px] sm:text-[17px] md:text-[18px] text-gray-500 leading-relaxed max-w-[500px] mb-10"
          >
            Gestiona historias clínicas y turnos con una fluidez que parece magia. Sin complicaciones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full"
          >
            <a 
              href="mailto:hola@dentiqly.com?subject=Solicitud de Demo - Dentiqly&body=Hola equipo de Dentiqly,%0D%0A%0D%0AMe gustaría agendar una demo personalizada para conocer más sobre la plataforma.%0D%0A%0D%0AMuchas gracias!" 
              className="btn-wayflyer-secondary min-w-[165px]"
            >
              Ver demo
            </a>
            <Link to="/register" className="btn-wayflyer-primary min-w-[165px] gap-2">
              Comenzar gratis
              <ThinArrow size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* Right Card */}
        <div className="hidden lg:flex lg:w-[28%] xl:w-[30%] justify-center items-center">
          <FloatingCard
            src="/assets/hero/tarjeta-derecha.png"
            alt="Dentiqly - Ficha de paciente con historial clínico y odontograma"
            side="right"
            delay={0.15}
            mouse={mouse}
          />
        </div>


      </div>

    </section>
  )
}
