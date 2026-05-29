import React, { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    question: "Cuanto tiempo lleva configurar Dentiqly?",
    answer:
      "Menos de 10 minutos. Te registras, creas tu clinica y ya podes empezar a cargar pacientes, configurar servicios y agendar turnos. No necesitas instalar nada ni contratar soporte tecnico.",
  },
  {
    question: "Puedo gestionar varias sucursales desde una sola cuenta?",
    answer:
      "Si. Dentiqly esta disenado como multi-sucursal nativo. Desde un unico panel podes ver metricas, agendar turnos y gestionar profesionales de todas tus clinicas en tiempo real.",
  },
  {
    question: "Mis datos estan seguros?",
    answer:
      "Absolutamente. Usamos encriptacion AES-256, conexiones SSL/TLS y backups automaticos cada hora. Cada clinica tiene sus datos completamente aislados en un modelo multi-tenant seguro.",
  },
  {
    question: "Como funcionan los recordatorios por email?",
    answer:
      "Dentiqly envia recordatorios automaticos por email a tus pacientes antes de cada turno. Podes personalizar el mensaje y los tiempos de envio. Esto reduce las inasistencias hasta un 40%.",
  },
  {
    question: "Puedo migrar datos desde otro sistema?",
    answer:
      "Si. Ofrecemos asistencia para migrar pacientes, historiales y turnos desde planillas de Excel u otros sistemas. Nuestro equipo te guia durante todo el proceso sin costo adicional.",
  },
  {
    question: "Hay periodo de prueba gratuito?",
    answer:
      "Si. Tenes 14 dias de prueba gratuita con acceso completo a todas las funcionalidades. No se requiere tarjeta de credito para comenzar.",
  },
]

const FaqItem: React.FC<{ question: string; answer: string; index: number }> = ({
  question,
  answer,
  index,
}) => {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const answerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current || !answerRef.current) return
    if (open) {
      gsap.to(contentRef.current, {
        height: answerRef.current.offsetHeight,
        duration: 0.4,
        ease: "power3.out",
      })
      gsap.to(answerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        delay: 0.1,
        ease: "power3.out",
      })
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        duration: 0.3,
        ease: "power3.inOut",
      })
      gsap.set(answerRef.current, { opacity: 0, y: -10 })
    }
  }, [open])

  return (
    <div
      className={`faq-item border-b border-white/10 last:border-0 transition-colors duration-300 ${open ? "bg-white/[0.08]" : "hover:bg-white/[0.02]"
        }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-6 px-6 text-left group"
      >
        <span className="text-base font-bold text-white group-hover:text-white/80 transition-colors">
          {question}
        </span>
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${open ? "bg-white border-white rotate-180" : "border-white/30 group-hover:border-white/60"
            }`}
        >
          <ChevronDown className={`w-4 h-4 transition-colors ${open ? "text-[#0047FF]" : "text-white"}`} />
        </div>
      </button>
      <div ref={contentRef} className="overflow-hidden h-0">
        <div ref={answerRef} className="px-6 pb-6 opacity-0 -translate-y-2.5">
          <p className="text-white/80 text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export const FaqSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".faq-heading > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      })

      gsap.from(".faq-item", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".faq-list",
          start: "top 85%",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="faq" className="py-28 sm:py-36 bg-[#FAFCFF]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="faq-heading text-center mb-16">
          <p className="text-sm font-extrabold text-[#2563FF] tracking-widest uppercase mb-4">
            Preguntas Frecuentes
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1023] tracking-tight">
            Todo lo que necesitas saber sobre Dentiqly
          </h2>
        </div>

        <div className="faq-list bg-[#0047FF] rounded-3xl border border-[#0047FF]/20 shadow-[0_20px_50px_rgba(0,71,255,0.25)] overflow-hidden">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
