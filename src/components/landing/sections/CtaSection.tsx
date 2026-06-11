import React, { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Send } from "lucide-react"
import { ThinArrow } from "../components/ThinArrow"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const CtaSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    clinica: "",
    telefono: "",
    motivo: "",
    mensaje: "",
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-left > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      })
      gsap.from(".cta-right", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
      const response = await fetch(`${apiBaseUrl}/saas/contacto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.")
      }

      setSent(true)
    } catch (err: any) {
      setErrorMessage(err.message || "Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contacto"
      className="relative overflow-hidden bg-[#0047FF] py-24 md:py-32"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }}
    >
      {/* Mini tooth decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Tooth SVG component */}
        {[
          { top: "8%", left: "5%", size: 22, opacity: 0.12, rotate: -15 },
          { top: "15%", left: "88%", size: 18, opacity: 0.10, rotate: 20 },
          { top: "72%", left: "3%", size: 26, opacity: 0.08, rotate: -8 },
          { top: "80%", left: "90%", size: 20, opacity: 0.11, rotate: 30 },
          { top: "45%", left: "92%", size: 16, opacity: 0.09, rotate: -25 },
          { top: "55%", left: "1%", size: 14, opacity: 0.10, rotate: 10 },
          { top: "30%", left: "96%", size: 12, opacity: 0.08, rotate: 40 },
          { top: "90%", left: "50%", size: 18, opacity: 0.07, rotate: -5 },
        ].map((t, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 28"
            fill="white"
            style={{
              position: "absolute",
              top: t.top,
              left: t.left,
              width: t.size,
              height: t.size,
              opacity: t.opacity,
              transform: `rotate(${t.rotate}deg)`,
            }}
          >
            {/* Simple molar tooth path */}
            <path d="M7 2C4.5 2 3 4 3 6.5c0 1.5.5 3 1 4.5.8 2.5 1.2 5 1 7.5-.1 1.5.5 5.5 2 7 .6.7 1.3 1 2 .5.7-.5 1-1.5 1-2.5 0-1 .4-2 1-2s1 1 1 2c0 1 .3 2 1 2.5.7.5 1.4.2 2-.5 1.5-1.5 2.1-5.5 2-7-.2-2.5.2-5 1-7.5.5-1.5 1-3 1-4.5C18 4 16.5 2 14 2c-1 0-2 .5-2 1.5C12 2.5 11 2 10 2c-1 0-2 .5-2.5 0C7 2 7 2 7 2z" />
          </svg>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 lg:gap-24">

          {/* ── Left: headline + contact info ── */}
          <div className="cta-left flex-1 lg:max-w-[540px]">
            <div className="mb-5">
              <span className="inline-block bg-[#0047FF] text-white px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full">
                Contacto
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl xl:text-[3.6rem] font-semibold text-white tracking-[-3px] leading-[1.08] mb-8">
              Digitalizá tu clínica dental
              <br />
              hoy mismo.
            </h2>

            <p className="text-white/70 text-lg leading-relaxed mb-12 max-w-[440px]">
              Unite a las clínicas que ya ahorran tiempo y brindan una
              experiencia excepcional a sus pacientes. Empezá gratis.
            </p>

            {/* Contact details */}
            <div className="space-y-5 mb-12">
              <a
                href="mailto:hola@dentiqly.com"
                className="flex items-center gap-4 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-11 h-11 flex items-center justify-center border border-white/20 group-hover:border-white/50 transition-colors bg-white/5 rounded-full">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-base font-medium">hola@dentiqly.com</span>
              </a>
              {/* <a
                href="tel:+5491100000000"
                className="flex items-center gap-4 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-11 h-11 flex items-center justify-center border border-white/20 group-hover:border-white/50 transition-colors bg-white/5 rounded-full">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-base font-medium">+54 9 11 0000-0000</span>
              </a> */}
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-white text-[#0047FF] px-8 py-4 font-bold text-base hover:bg-blue-50 transition-colors group rounded-full"
            >
              Crear mi cuenta gratis
              <ThinArrow size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {/* ── Right: contact form ── */}
          <div className="cta-right flex-1 lg:max-w-[620px] w-full">
            <div className="bg-white rounded-[2rem] p-8 sm:p-12 border border-gray-100/50 shadow-[0_24px_50px_rgba(0,0,0,0.06)]">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#0047FF]/10 border border-[#0047FF]/20 rounded-full mb-6">
                    <Send className="w-7 h-7 text-[#0047FF]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A0F2D] mb-2">¡Mensaje enviado!</h3>
                  <p className="text-[#0A0F2D]/70 text-sm">
                    Nos pondremos en contacto contigo a la brevedad.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-[#0A0F2D] mb-8 text-[13px] tracking  text-left opacity-85">
                    ¿Querés hablar con nosotros?
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Work Email Address */}
                    <div>
                      <label htmlFor="email-input" className="block text-[12px] sm:text-[14px] font-bold text-[#0A0F2D] tracking- mb-2">
                        Correo electrónico de trabajo*
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 focus:border-[#0047FF] focus:border-b-2 text-[#0A0F2D] placeholder:text-gray-300 pb-3 px-0 text-base focus:outline-none focus:ring-0 rounded-none transition-colors"
                        placeholder="tu@clinica.com"
                      />
                    </div>

                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="nombre-input" className="block text-[12px] sm:text-[14px] font-bold text-[#0A0F2D] tracking mb-2">
                          Nombre*
                        </label>
                        <input
                          id="nombre-input"
                          type="text"
                          required
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 focus:border-[#0047FF] focus:border-b-2 text-[#0A0F2D] placeholder:text-gray-300 pb-3 px-0 text-base focus:outline-none focus:ring-0 rounded-none transition-colors"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label htmlFor="apellido-input" className="block text-[12px] sm:text-[14px] font-bold text-[#0A0F2D] tracking mb-2">
                          Apellido*
                        </label>
                        <input
                          id="apellido-input"
                          type="text"
                          required
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 focus:border-[#0047FF] focus:border-b-2 text-[#0A0F2D] placeholder:text-gray-300 pb-3 px-0 text-base focus:outline-none focus:ring-0 rounded-none transition-colors"
                          placeholder="Tu apellido"
                        />
                      </div>
                    </div>

                    {/* Company Name & Phone Number */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="clinica-input" className="block text-[12px] sm:text-[14px] font-bold text-[#0A0F2D] tracking mb-2">
                          Nombre de la clinica*
                        </label>
                        <input
                          id="clinica-input"
                          type="text"
                          required
                          value={formData.clinica}
                          onChange={(e) => setFormData({ ...formData, clinica: e.target.value })}
                          className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 focus:border-[#0047FF] focus:border-b-2 text-[#0A0F2D] placeholder:text-gray-300 pb-3 px-0 text-base focus:outline-none focus:ring-0 rounded-none transition-colors"
                          placeholder="Nombre de clínica"
                        />
                      </div>
                      <div>
                        <label htmlFor="telefono-input" className="block text-[12px] sm:text-[14px] font-bold text-[#0A0F2D] tracking mb-2">
                          Número de telefono
                        </label>
                        <input
                          id="telefono-input"
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 focus:border-[#0047FF] focus:border-b-2 text-[#0A0F2D] placeholder:text-gray-300 pb-3 px-0 text-base focus:outline-none focus:ring-0 rounded-none transition-colors"
                          placeholder="+54 9 11 0000-0000"
                        />
                      </div>
                    </div>

                    {/* Reason for Interest */}
                    <div>
                      <label htmlFor="motivo-select" className="block text-[12px] sm:text-[14px] font-bold text-[#0A0F2D] tracking mb-2">
                        Motivo de interés*
                      </label>
                      <select
                        id="motivo-select"
                        required
                        value={formData.motivo}
                        onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 focus:border-[#0047FF] focus:border-b-2 text-[#0A0F2D] pb-3 px-0 text-base focus:outline-none focus:ring-0 rounded-none transition-colors cursor-pointer appearance-none"
                      >
                        <option value="" disabled className="text-gray-400">Seleccioná una opción</option>
                        <option value="contratar" className="text-[#0A0F2D]">Quiero contratar Dentiqly</option>
                        <option value="demostracion" className="text-[#0A0F2D]">Solicitar una demostración</option>
                        <option value="precios" className="text-[#0A0F2D]">Consultar sobre planes y precios</option>
                        <option value="soporte" className="text-[#0A0F2D]">Soporte o dudas técnicas</option>
                        <option value="otro" className="text-[#0A0F2D]">Otro motivo</option>
                      </select>
                    </div>

                    {/* How Can We Help */}
                    <div>
                      <label htmlFor="mensaje-textarea" className="block text-[12px] sm:text-[14px] font-bold text-[#0A0F2D] tracking mb-2">
                        ¿En qué podemos ayudarte?
                      </label>
                      <textarea
                        id="mensaje-textarea"
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        rows={3}
                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 focus:border-[#0047FF] focus:border-b-2 text-[#0A0F2D] placeholder:text-gray-300 pb-3 px-0 text-base focus:outline-none focus:ring-0 rounded-none transition-colors resize-none"
                        placeholder="Escribí tu mensaje acá..."
                      />
                    </div>

                    {errorMessage && (
                      <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium text-left">
                        ⚠️ {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0047FF] text-white py-5 px-6 text-sm tracking-wider font-extrabold hover:bg-[#0036CC] transition-colors flex items-center justify-center gap-2 group rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Enviando..." : "Enviar"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
