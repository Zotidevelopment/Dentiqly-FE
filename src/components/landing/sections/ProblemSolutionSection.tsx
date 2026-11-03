import React from "react"
import { X, Check, ArrowRight, ArrowDown } from "lucide-react"
import { SectionHeading } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"
import { Spark } from "../ui/Spark"
import { TrialLink } from "../../ui/TrialLink"
import { btnPrimary } from "../ui/cta"

const BEFORE = [
  "Turnos en papel o en una planilla que nadie actualiza",
  "Pacientes que no vienen y no avisan",
  "El WhatsApp personal lleno de mensajes de pacientes",
  "Fichas, radiografías y presupuestos en carpetas",
  "Liquidaciones y caja calculadas a mano a fin de mes",
]

const AFTER = [
  "Agenda online que tus pacientes llenan solos, 24/7",
  "Recordatorios por email en un clic para reducir ausencias",
  "Un link de reservas propio, sin llamadas ni chats",
  "Odontograma, historia clínica y archivos en un clic",
  "Caja, deudores y liquidaciones calculadas solas",
]

export const ProblemSolutionSection: React.FC = () => (
  <section id="por-que-dentiqly" className="relative overflow-hidden bg-brand-surface py-24 sm:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <SectionHeading
        eyebrow="Por qué Dentiqly"
        title={
          <>
            Dejá de administrar.
            <br />
            Empezá a atender.
          </>
        }
        subtitle="La mayoría de las clínicas pierde horas por semana en tareas que un sistema hecho para odontología resuelve solo."
      />

      <div className="relative mt-14 grid gap-5 lg:mt-20 lg:grid-cols-2 lg:gap-8">
        {/* Antes */}
        <Reveal className="relative rounded-[28px] bg-white/70 p-7 ring-1 ring-brand-ink/[0.07] sm:p-9">
          <span className="inline-flex items-center rounded-full bg-brand-ink/[0.06] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-brand-muted">
            Así es hoy
          </span>
          <h3 className="mt-5 font-display text-[1.6rem] font-semibold tracking-tight text-brand-ink">
            Gestión a pulmón
          </h3>
          <ul className="mt-6 space-y-3.5">
            {BEFORE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-brand-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <X size={11} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Flecha conectora */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-ink text-white shadow-lg lg:flex"
          aria-hidden="true"
        >
          <ArrowRight size={18} />
        </div>
        <div className="flex justify-center lg:hidden" aria-hidden="true">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ink text-white">
            <ArrowDown size={16} />
          </span>
        </div>

        {/* Después */}
        <Reveal
          delay={0.1}
          className="relative overflow-hidden rounded-[28px] bg-white p-7 ring-2 ring-brand-blue/25 shadow-[0_40px_90px_-40px_rgba(37,99,255,0.45)] sm:p-9"
        >
          <div className="landing-glow -right-24 -top-24 h-64 w-64 bg-brand-blue/[0.14]" aria-hidden="true" />
          <Spark size={26} className="absolute right-6 top-6 text-brand-blue/20" />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white">
            <Spark size={10} /> Con Dentiqly
          </span>
          <h3 className="relative mt-5 font-display text-[1.6rem] font-semibold tracking-tight text-brand-ink">
            La clínica en piloto automático
          </h3>
          <ul className="relative mt-6 space-y-3.5">
            {AFTER.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] font-medium leading-snug text-brand-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                  <Check size={11} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="mt-12 flex flex-col items-center gap-4 text-center">
        <p className="max-w-xl text-[15px] text-brand-muted">
          Todo esto ya está incluido en el plan. Sin módulos extra, sin costo por usuario.
        </p>
        <TrialLink ctaLocation="performance" ctaLabel="Probar Dentiqly gratis" className={btnPrimary}>
          Probar Dentiqly gratis
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </TrialLink>
      </Reveal>
    </div>
  </section>
)
