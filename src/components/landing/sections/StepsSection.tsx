import React from "react"
import { UserPlus, Upload, Link2, ArrowRight } from "lucide-react"
import { SectionHeading } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"
import { TrialLink } from "../../ui/TrialLink"
import { btnPrimary } from "../ui/cta"

const STEPS = [
  {
    icon: UserPlus,
    title: "Creá tu cuenta",
    text: "Dos minutos, sin tarjeta. Cargás el nombre de tu clínica, tus servicios y tus horarios.",
    meta: "2 minutos",
  },
  {
    icon: Upload,
    title: "Cargá o migrá tus pacientes",
    text: "¿Tenés un Excel u otro sistema? Migramos tus pacientes, turnos e historiales sin costo.",
    meta: "Migración gratis",
  },
  {
    icon: Link2,
    title: "Compartí tu link de reservas",
    text: "Lo ponés en Instagram, en Google y en tu WhatsApp. Tus pacientes reservan solos desde el celular.",
    meta: "Desde el día 1",
  },
]

export const StepsSection: React.FC = () => (
  <section className="relative bg-white py-24 sm:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <SectionHeading
        eyebrow="Cómo empezar"
        title="Empezás hoy. En tres pasos."
        subtitle="No hay instalación, ni capacitaciones de una semana, ni contratos. Tu clínica puede estar operando con Dentiqly esta misma tarde."
      />

      <div className="relative mt-14 grid gap-5 md:grid-cols-3 lg:mt-20">
        {/* Línea conectora */}
        <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[52px] hidden h-px bg-transparent md:block" aria-hidden="true" />

        {STEPS.map(({ icon: Icon, title, text, meta }, i) => (
          <Reveal key={title} delay={i * 0.08} className="relative rounded-[26px] bg-brand-surface p-7 ring-1 ring-brand-ink/[0.06] sm:p-8">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-brand-ink/[0.06]">
                <Icon size={20} />
              </span>
              <span className="font-display text-[2.6rem] font-bold leading-none text-brand-blue/15">0{i + 1}</span>
            </div>
            <h3 className="mt-6 font-display text-[1.3rem] font-semibold tracking-tight text-brand-ink">{title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-brand-muted">{text}</p>
            <span className="mt-5 inline-flex items-center rounded-full bg-white px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-brand-blue ring-1 ring-brand-blue/15">
              {meta}
            </span>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-12 flex justify-center">
        <TrialLink ctaLocation="performance" ctaLabel="Crear mi cuenta gratis" className={btnPrimary}>
          Crear mi cuenta gratis
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </TrialLink>
      </Reveal>
    </div>
  </section>
)
