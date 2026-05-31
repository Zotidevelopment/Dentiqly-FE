import React, { useEffect, useRef, useState } from "react"
import { Quote } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const TestimonialSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [statValue, setStatValue] = useState(0)
  const triggered = useRef(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-card", {
        y: 60,
        opacity: 0,
        scale: 0.96,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      })

      gsap.from(".testimonial-quote", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      })

      gsap.from(".testimonial-author", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      })

      const statObj = { val: 0 }
      ScrollTrigger.create({
        trigger: ".stat-callout",
        start: "top 85%",
        onEnter: () => {
          if (triggered.current) return
          triggered.current = true
          gsap.to(statObj, {
            val: 3,
            duration: 1.8,
            ease: "power2.out",
            snap: { val: 1 },
            onUpdate: () => setStatValue(statObj.val),
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-28 sm:py-36 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="testimonial-card relative bg-[#FAFCFF] rounded-3xl p-10 sm:p-14 border border-gray-100">
          <Quote className="w-12 h-12 text-[#2563FF]/15 mb-6" />

          <blockquote className="testimonial-quote text-xl sm:text-2xl font-medium text-[#0A0F2D] leading-relaxed mb-8">
            &ldquo;Desde que implementamos Dentiqly, nuestra clinica ahorra horas
            de trabajo administrativo cada semana. La agenda inteligente y los
            recordatorios por email redujeron las ausencias drasticamente. Es
            como tener un asistente digital que nunca descansa.&rdquo;
          </blockquote>

          <div className="testimonial-author flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0047FF] flex items-center justify-center">
              <span className="text-white text-sm font-bold">MG</span>
            </div>
            <div>
              <p className="font-bold text-[#0A0F2D]">Dra. Marina Gonzalez</p>
              <p className="text-sm text-[#8A93A8]">
                Directora — Centro Odontologico Palermo
              </p>
            </div>
          </div>
        </div>

        <div className="stat-callout grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {[
            { value: `${statValue}`, suffix: " hs/semana", label: "Tiempo ahorrado en admin" },
            { value: "80", suffix: "%", label: "Reduccion de ausencias" },
            { value: "4.9", suffix: "/5", label: "Satisfaccion de pacientes" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center py-6 px-4 bg-[#FAFCFF] rounded-2xl border border-gray-100"
            >
              <p className="text-2xl font-extrabold text-[#0A0F2D]">
                {i === 0 ? stat.value : stat.value}
                <span className="text-[#0047FF]">{stat.suffix}</span>
              </p>
              <p className="text-xs text-[#8A93A8] mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
