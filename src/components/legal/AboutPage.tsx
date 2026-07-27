import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { TrialLink } from '../ui/TrialLink'
import { CheckCircle2, MessageSquare, Clock, Users, Zap, Shield, Building2, MessageCircle } from 'lucide-react'
import { SEO, PAGE_SEO } from '../seo/SEO'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Navbar } from '../landing/sections/Navbar'
import { FooterSection } from '../landing/sections/FooterSection'
import { ThinArrow } from '../landing/components/ThinArrow'

gsap.registerPlugin(ScrollTrigger)

export const AboutPage: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-hero > *', {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.2,
      })

      gsap.from('.about-stat', {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-stats', start: 'top 80%' },
      })

      gsap.from('.about-mission > *', {
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-mission', start: 'top 78%' },
      })

      gsap.from('.about-feature', {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-features', start: 'top 78%' },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="min-h-screen bg-white font-sans text-[#0A0F2D] selection:bg-[#0047FF] selection:text-white">
      <SEO {...PAGE_SEO.about} />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="about-hero max-w-[620px]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0047FF]/8 text-[#0047FF] text-[13px] font-semibold mb-6">
              Sobre Dentiqly
            </div>

            <h1 className="text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] font-bold tracking-[-2px] leading-[1.08] text-[#0A0F2D] mb-5">
              Construimos el software
              <br />
              <span className="text-[#0047FF]">que el odontólogo necesita.</span>
            </h1>

            <p className="text-[1rem] text-gray-500 leading-relaxed mb-8 max-w-[500px]">
              Dentiqly nació de una frustración real: clínicas brillantes perdiendo horas en tareas administrativas con herramientas que no estaban hechas para ellas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <TrialLink
                ctaLocation="about"
                ctaLabel="Empezar gratis — 14 días"
                className="group bg-[#0047FF] text-white px-6 py-3 rounded-full text-[14.5px] font-semibold shadow-lg shadow-[#0047FF]/20 hover:shadow-xl hover:shadow-[#0047FF]/30 hover:bg-[#003BCC] transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                Empezar gratis — 14 días
                <ThinArrow size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </TrialLink>
              <a
                href="mailto:hola@dentiqly.com"
                className="bg-white border border-gray-200 text-[#0A0F2D] hover:border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-full text-[14.5px] font-semibold transition-all duration-200"
              >
                Contactarnos
              </a>
            </div>

            <p className="flex items-center gap-1.5 text-[11.5px] text-gray-400 mt-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Sin tarjeta de crédito · Configuración en menos de 5 minutos
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats py-16 bg-[#FAFCFF] border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { number: '+500', label: 'Clínicas activas' },
              { number: '+50K', label: 'Pacientes gestionados' },
              { number: '40%', label: 'Menos ausencias' },
              { number: '24/7', label: 'Turnos online disponibles' },
            ].map((stat) => (
              <div key={stat.label} className="about-stat text-center">
                <p className="text-[2.6rem] font-bold text-[#0A0F2D] tracking-[-2px] leading-none mb-1.5">{stat.number}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Misión ── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="about-mission">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0047FF]/8 text-[#0047FF] text-[13px] font-semibold mb-6">
                Nuestra misión
              </div>
              <h2 className="text-3xl lg:text-[2.4rem] font-bold text-[#0A0F2D] tracking-[-1.5px] leading-tight mb-6">
                Que el odontólogo pueda
                <br />
                enfocarse en sus pacientes,
                <br />
                no en el papeleo.
              </h2>
              <div className="space-y-4">
                <p className="text-gray-500 leading-relaxed">
                  Vimos cómo clínicas dentales brillantes perdían horas valiosas en tareas administrativas usando software anticuado, planillas de Excel o directamente papel y lápiz.
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Construimos Dentiqly para cambiar eso: una plataforma que combina la potencia de un sistema profesional con la simplicidad de una app que usás desde el primer día.
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Hoy, más de 500 clínicas en Argentina confían en Dentiqly para gestionar su operación diaria. Y estamos recién empezando.
                </p>
              </div>
            </div>

            {/* Visual card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-7 space-y-4">
                {[
                  { icon: MessageSquare, label: 'Recordatorio enviado', sub: 'Lucía M. · Mañana 10:30', color: 'text-green-600', bg: 'bg-green-50' },
                  { icon: Clock, label: 'Turno confirmado online', sub: 'Carlos R. · Hoy 17:00', color: 'text-[#0047FF]', bg: 'bg-[#0047FF]/8' },
                  { icon: Users, label: 'Ficha digital actualizada', sub: 'Valentina P. · Hace 5 min', color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#0A0F2D] truncate">{item.label}</p>
                      <p className="text-[12px] text-gray-400">{item.sub}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  </div>
                ))}
                <div className="p-4 rounded-xl bg-[#0047FF]/5 border border-[#0047FF]/10">
                  <p className="text-[11px] font-semibold text-[#0047FF] uppercase tracking-wide mb-0.5">Esta semana</p>
                  <p className="text-[14px] font-bold text-[#0A0F2D]">3 ausencias evitadas · +$45.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Por qué Dentiqly ── */}
      <section className="py-24 lg:py-32 bg-[#FAFCFF]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0047FF]/8 text-[#0047FF] text-[13px] font-semibold mb-5">
              Por qué elegirnos
            </div>
            <h2 className="text-3xl lg:text-[2.4rem] font-bold text-[#0A0F2D] tracking-[-1.5px] leading-tight">
              Todo lo que tu clínica necesita,
              <br />
              en un solo lugar.
            </h2>
          </div>

          <div className="about-features grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card grande — WhatsApp */}
            <div className="about-feature md:col-span-2 bg-[#0047FF] rounded-[2rem] p-10 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -right-4 -bottom-12 w-64 h-64 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-6">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-[-1px] leading-tight mb-3">
                  Recordatorios automáticos
                  <br />
                  por WhatsApp
                </h3>
                <p className="text-white/70 text-[14px] leading-relaxed max-w-sm">
                  Tus pacientes reciben un aviso antes del turno. Sin que vos hagas nada.
                </p>
              </div>
              <div className="relative z-10 mt-8">
                <span className="text-[3.5rem] font-bold text-white tracking-[-3px] leading-none">−40%</span>
                <p className="text-white/60 text-[13px] font-medium mt-1">de inasistencias promedio</p>
              </div>
            </div>

            {/* Card chica — Agenda 24/7 */}
            <div className="about-feature bg-white rounded-[2rem] border border-gray-100 p-10 flex flex-col justify-between min-h-[320px]">
              <div className="w-11 h-11 rounded-xl bg-[#0047FF]/8 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#0047FF]" />
              </div>
              <div>
                <span className="text-[3.5rem] font-bold text-[#0A0F2D] tracking-[-3px] leading-none">24/7</span>
                <h3 className="text-[15px] font-semibold text-[#0A0F2D] mt-3 mb-2">Agenda online disponible</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                  Los pacientes reservan solos, en cualquier momento, sin llamar.
                </p>
              </div>
            </div>

            {/* Card chica — Fichas */}
            <div className="about-feature bg-white rounded-[2rem] border border-gray-100 p-10 flex flex-col justify-between min-h-[280px]">
              <div className="w-11 h-11 rounded-xl bg-[#0047FF]/8 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#0047FF]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0A0F2D] mb-2">Fichas y odontograma digital</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                  Historial clínico, imágenes y tratamientos siempre disponibles desde cualquier dispositivo.
                </p>
              </div>
            </div>

            {/* Card grande — Multi-sucursal */}
            <div className="about-feature md:col-span-2 bg-[#0A0F2D] rounded-[2rem] p-10 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
              <div className="absolute right-8 top-8 grid grid-cols-2 gap-2 opacity-20">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-16 h-10 rounded-lg bg-white" />
                ))}
              </div>
              <div className="relative z-10 w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white tracking-[-1px] leading-tight mb-3">
                  Multi-sucursal nativo.
                  <br />
                  Todo desde un panel.
                </h3>
                <p className="text-white/60 text-[14px] leading-relaxed max-w-sm">
                  Gestioná todas tus clínicas sin saltar entre cuentas. Una sola vista, control total.
                </p>
              </div>
            </div>

            {/* Card chica — Activación */}
            <div className="about-feature bg-white rounded-[2rem] border border-gray-100 p-10 flex flex-col justify-between min-h-[220px]">
              <div className="w-11 h-11 rounded-xl bg-[#0047FF]/8 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#0047FF]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0A0F2D] mb-2">Activación en minutos</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                  Sin IT, sin capacitaciones largas. El mismo día que te registrás, empezás a usarlo.
                </p>
              </div>
            </div>

            {/* Card chica — Soporte */}
            <div className="about-feature bg-white rounded-[2rem] border border-gray-100 p-10 flex flex-col justify-between min-h-[220px]">
              <div className="w-11 h-11 rounded-xl bg-[#0047FF]/8 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0047FF]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0A0F2D] mb-2">Soporte humano real</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                  Contestamos en menos de 2 horas. Personas reales, no bots.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative overflow-hidden bg-[#0047FF] py-24 md:py-32"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-[-2px] leading-tight mb-6">
            Empezá hoy.
            <br />
            Tu agenda te lo va a agradecer.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-[440px] mx-auto">
            14 días gratis, sin tarjeta de crédito. Configuración en menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <TrialLink
              ctaLocation="about"
              ctaLabel="Crear mi cuenta gratis"
              className="group inline-flex items-center gap-2 bg-white text-[#0047FF] px-8 py-4 rounded-full font-bold text-[15px] hover:bg-blue-50 transition-colors"
            >
              Crear mi cuenta gratis
              <ThinArrow size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </TrialLink>
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-semibold text-[15px] hover:bg-white/20 transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  )
}
