import React from "react"
import { Lock, Cloud, Database, Layers } from "lucide-react"
import { Reveal } from "../ui/Reveal"
import { Eyebrow } from "../ui/SectionHeading"

const BADGES = [
  { icon: Lock, title: "Encriptación AES-256", desc: "Los datos sensibles viajan y se guardan cifrados, con el mismo estándar que usan los bancos." },
  { icon: Layers, title: "Datos aislados por clínica", desc: "Cada clínica vive en su propio espacio. Nadie más puede ver tu información." },
  { icon: Database, title: "Backups automáticos", desc: "Copias de seguridad diarias. Si algo pasa, tu historial clínico no se pierde." },
  { icon: Cloud, title: "Infraestructura en la nube", desc: "Alta disponibilidad y actualizaciones continuas sin que tengas que hacer nada." },
]

export const SecuritySection: React.FC = () => (
  <section id="seguridad" className="relative bg-brand-surface py-20 sm:py-24">
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-start lg:gap-16">
        <Reveal>
          <Eyebrow>Seguridad</Eyebrow>
          <h2 className="mt-5 font-display text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.03em] text-brand-ink sm:text-[2.4rem]">
            Tus datos y los de tus pacientes, protegidos.
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-brand-muted">
            La historia clínica es lo más valioso que tiene tu consultorio. La tratamos como tal.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {BADGES.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={0.05 + i * 0.06}>
              <div className="flex h-full gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand-ink/[0.06]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-tint text-brand-blue">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-brand-ink">{title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-brand-muted">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
)
