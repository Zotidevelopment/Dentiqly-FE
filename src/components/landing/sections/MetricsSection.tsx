import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/* ─── SVG Icons matching the uploaded icon designs ─── */

const IconOrden = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Document body */}
    <path
      d="M16 8C16 5.79 17.79 4 20 4H44L56 16V60C56 62.21 54.21 64 52 64H20C17.79 64 16 62.21 16 60V8Z"
      stroke="#0A0F2D"
      strokeWidth="3"
      fill="none"
    />
    {/* Folded corner */}
    <path d="M44 4V16H56" stroke="#0A0F2D" strokeWidth="3" fill="none" />
    {/* Lines */}
    <line x1="24" y1="26" x2="48" y2="26" stroke="#0A0F2D" strokeWidth="2.5" />
    <line x1="24" y1="34" x2="48" y2="34" stroke="#0A0F2D" strokeWidth="2.5" />
    <line x1="24" y1="42" x2="48" y2="42" stroke="#0A0F2D" strokeWidth="2.5" />
    <line x1="24" y1="50" x2="48" y2="50" stroke="#0A0F2D" strokeWidth="2.5" />
    <line x1="24" y1="58" x2="40" y2="58" stroke="#0A0F2D" strokeWidth="2.5" />
    {/* Blue dots */}
    <circle cx="21" cy="26" r="2" fill="#2563FF" />
    <circle cx="21" cy="34" r="2" fill="#2563FF" />
    <circle cx="21" cy="42" r="2.5" fill="#2563FF" />
    <path d="M19 42H23M21 40V44" stroke="#2563FF" strokeWidth="1.5" />
    <circle cx="21" cy="50" r="2" fill="#2563FF" />
    <circle cx="21" cy="58" r="2" fill="#2563FF" />
  </svg>
)

const IconVelocidad = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Grid lines */}
    <rect x="12" y="12" width="48" height="48" stroke="#E2E8F0" strokeWidth="0.75" fill="none" />
    <line x1="24" y1="12" x2="24" y2="60" stroke="#E2E8F0" strokeWidth="0.5" />
    <line x1="36" y1="12" x2="36" y2="60" stroke="#E2E8F0" strokeWidth="0.5" />
    <line x1="48" y1="12" x2="48" y2="60" stroke="#E2E8F0" strokeWidth="0.5" />
    <line x1="12" y1="24" x2="60" y2="24" stroke="#E2E8F0" strokeWidth="0.5" />
    <line x1="12" y1="36" x2="60" y2="36" stroke="#E2E8F0" strokeWidth="0.5" />
    <line x1="12" y1="48" x2="60" y2="48" stroke="#E2E8F0" strokeWidth="0.5" />
    {/* Lightning bolt */}
    <path
      d="M38 10L24 38H34L30 62L50 30H38L42 10Z"
      stroke="#0A0F2D"
      strokeWidth="3"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Blue dots */}
    <circle cx="44" cy="16" r="2.5" fill="#2563FF" />
    <circle cx="52" cy="28" r="2.5" fill="#2563FF" />
    <circle cx="26" cy="42" r="2.5" fill="#2563FF" />
    <circle cx="36" cy="50" r="2.5" fill="#2563FF" />
    <circle cx="32" cy="60" r="2.5" fill="#2563FF" />
  </svg>
)

const IconTareas = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Globe outer circle */}
    <circle cx="32" cy="36" r="24" stroke="#0A0F2D" strokeWidth="2.5" fill="none" />
    {/* Longitude lines */}
    <ellipse cx="32" cy="36" rx="12" ry="24" stroke="#0A0F2D" strokeWidth="1.5" fill="none" />
    {/* Latitude lines */}
    <ellipse cx="32" cy="36" rx="24" ry="8" stroke="#0A0F2D" strokeWidth="1.5" fill="none" />
    <line x1="8" y1="36" x2="56" y2="36" stroke="#0A0F2D" strokeWidth="1.5" />
    <line x1="32" y1="12" x2="32" y2="60" stroke="#0A0F2D" strokeWidth="1.5" />
    {/* Arc lines for globe feel */}
    <path d="M12 24C16 24 20 22 32 22C44 22 48 24 52 24" stroke="#0A0F2D" strokeWidth="1" fill="none" />
    <path d="M12 48C16 48 20 50 32 50C44 50 48 48 52 48" stroke="#0A0F2D" strokeWidth="1" fill="none" />
    {/* Magnifying glass */}
    <circle cx="48" cy="48" r="10" stroke="#0A0F2D" strokeWidth="2.5" fill="white" />
    <line x1="55" y1="55" x2="64" y2="64" stroke="#0A0F2D" strokeWidth="3" strokeLinecap="round" />
    {/* Blue dots */}
    <circle cx="20" cy="30" r="2.5" fill="#2563FF" />
    <circle cx="40" cy="28" r="2.5" fill="#2563FF" />
    <circle cx="26" cy="46" r="2.5" fill="#2563FF" />
    <circle cx="50" cy="56" r="2.5" fill="#2563FF" />
  </svg>
)

const IconControl = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top left block */}
    <rect x="8" y="8" width="22" height="18" rx="2" stroke="#0A0F2D" strokeWidth="3" fill="none" />
    {/* Top right block */}
    <rect x="42" y="8" width="22" height="18" rx="2" stroke="#0A0F2D" strokeWidth="3" fill="none" />
    {/* Bottom left block */}
    <rect x="8" y="46" width="22" height="18" rx="2" stroke="#0A0F2D" strokeWidth="3" fill="none" />
    {/* Bottom right block */}
    <rect x="42" y="46" width="22" height="18" rx="2" stroke="#0A0F2D" strokeWidth="3" fill="none" />
    {/* Connection lines */}
    <line x1="30" y1="17" x2="42" y2="17" stroke="#0A0F2D" strokeWidth="3" />
    <line x1="36" y1="17" x2="36" y2="55" stroke="#0A0F2D" strokeWidth="3" />
    <line x1="30" y1="55" x2="42" y2="55" stroke="#0A0F2D" strokeWidth="3" />
    {/* Blue dots */}
    <circle cx="22" cy="19" r="3" fill="#2563FF" />
    <circle cx="56" cy="14" r="3" fill="#2563FF" />
    <circle cx="16" cy="56" r="3" fill="#2563FF" />
    <circle cx="56" cy="54" r="3" fill="#2563FF" />
  </svg>
)

/* ─── Feature data ─── */
const features = [
  {
    number: "01",
    title: "MÁS ORDEN",
    description:
      "Centralizá pacientes, turnos e historiales en un sistema simple y organizado.",
    Icon: IconOrden,
  },
  {
    number: "02",
    title: "MÁS VELOCIDAD",
    description:
      "Accedé a toda la información importante en segundos, sin perder tiempo.",
    Icon: IconVelocidad,
  },
  {
    number: "03",
    title: "MENOS TAREAS MANUALES",
    description:
      "Automatizá procesos repetitivos y simplificá la gestión diaria de tu clínica.",
    Icon: IconTareas,
  },
  {
    number: "04",
    title: "MÁS CONTROL",
    description:
      "Supervisá toda la operación de tu clínica desde un único lugar.",
    Icon: IconControl,
  },
]

/* ─── Dotted separator row ─── */
const DottedBorder = () => (
  <div
    className="w-full h-px"
    style={{
      backgroundImage:
        "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
      backgroundSize: "10px 2px",
      backgroundRepeat: "repeat-x",
    }}
  />
)

export const MetricsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="metricas"
      className="py-20 sm:py-28 bg-[#FAFCFF] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Card container with border */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            border: "1px solid #E2E8F0",
            background: "#FFFFFF",
          }}
        >
          {/* Top dotted border */}
          <DottedBorder />

          {/* Grid of 4 features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-y-0">
            {features.map((feature, index) => (
              <div
                key={feature.number}
                className={`feature-card relative p-8 lg:p-10 flex flex-col
                  ${index < 3 ? "lg:border-r border-[#E2E8F0]" : ""}
                  ${index % 2 === 0 && index < 3 ? "sm:border-r sm:border-[#E2E8F0]" : ""}
                  ${index < 2 ? "sm:border-b sm:border-[#E2E8F0] lg:border-b-0" : ""}
                `}
              >
                {/* Number and Icon row */}
                <div className="flex items-start justify-between mb-10">
                  <div className="opacity-90">
                    <feature.Icon />
                  </div>
                  <span
                    className="text-sm font-medium tracking-wider"
                    style={{ color: "#94A3B8" }}
                  >
                    {feature.number}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-sm font-extrabold tracking-[0.15em] mb-4 leading-snug"
                  style={{
                    color: "#0A0F2D",
                    fontFamily: "'Inter', sans-serif",
                    textTransform: "uppercase",
                  }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#64748B" }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom dotted border */}
          <DottedBorder />
        </div>
      </div>
    </section>
  )
}
