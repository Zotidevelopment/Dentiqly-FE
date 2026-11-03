import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Stethoscope, Users, LifeBuoy } from "lucide-react"
import { Eyebrow } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"
import { Spark } from "../ui/Spark"

const POINTS = [
  {
    icon: Stethoscope,
    title: "Diseñado con odontólogos",
    text: "Cada pantalla salió de una necesidad real del consultorio, no de una lista de features.",
  },
  {
    icon: Users,
    title: "Probado con pacientes reales",
    text: "Agenda, recordatorios y reservas se usaron todos los días antes de abrirse a otras clínicas.",
  },
  {
    icon: LifeBuoy,
    title: "Soporte del equipo que lo construyó",
    text: "Cuando escribís, te responde alguien que conoce el producto y el día a día de una clínica.",
  },
]

/**
 * Historia de origen. Es el elemento de confianza más fuerte que tenemos y es
 * verdadero: Dentiqly nació como el sistema interno del centro ODAF.
 */
export const OriginSection: React.FC = () => (
  <section className="relative overflow-hidden bg-brand-navy py-24 text-white sm:py-32">
    <div className="bg-dot-grid-light mask-fade-radial pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
    <div className="landing-glow -left-40 top-10 h-[480px] w-[480px] bg-brand-blue/30" aria-hidden="true" />
    <div className="landing-glow -right-40 bottom-0 h-[420px] w-[420px] bg-brand-blue-light/20" aria-hidden="true" />

    <div className="relative mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
      <Reveal>
        <Eyebrow dark>Nuestra historia</Eyebrow>
        <h2 className="mt-6 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[2.8rem] lg:text-[3.3rem]">
          Nació adentro de una clínica,
          <br className="hidden sm:block" /> no en una oficina.
        </h2>
        <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/65 sm:text-lg">
          Dentiqly empezó como el sistema interno de{" "}
          <span className="font-semibold text-white">ODAF</span>, un centro odontológico con agenda llena y los
          mismos problemas que tenés vos: turnos que se pisan, pacientes que no vienen, caja a mano. Lo usamos, lo
          rompimos y lo mejoramos antes de abrirlo a otras clínicas.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
            <span className="flex items-center rounded-lg bg-white px-2 py-1">
              <img src="/assets/odaf-logo.png" alt="ODAF, centro odontológico" width={76} height={32} className="h-6 w-auto" />
            </span>
            <div className="h-6 w-px bg-white/15" />
            <span className="text-[12.5px] font-medium text-white/60">Primera clínica en usar Dentiqly</span>
          </div>
        </div>

        <Link
          to="/sobre-nosotros"
          className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-brand-blue-light transition-colors hover:text-white"
        >
          Conocé al equipo
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      <div className="space-y-4">
        {POINTS.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={0.08 + i * 0.08}>
            <div className="group relative flex gap-4 rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.08] sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white shadow-lg shadow-brand-blue/30">
                <Icon size={19} />
              </span>
              <div>
                <h3 className="font-display text-[1.15rem] font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-1 text-[14.5px] leading-relaxed text-white/60">{text}</p>
              </div>
              <Spark size={14} className="absolute right-5 top-5 text-brand-blue-light/40" />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)
