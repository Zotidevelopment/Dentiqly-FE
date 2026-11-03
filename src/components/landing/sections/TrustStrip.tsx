import React from "react"
import { Reveal } from "../ui/Reveal"

/**
 * Franja de datos duros del producto, debajo del hero.
 * Solo números verificables: nada de ratings ni "clientes" inventados.
 */
const STATS = [
  { value: "+33", label: "funcionalidades incluidas en un solo plan" },
  { value: "10 min", label: "para dejar tu clínica configurada y operando" },
  { value: "24/7", label: "reservas online para tus pacientes, sin llamadas" },
  { value: "100%", label: "web: desde cualquier compu, tablet o celular" },
]

export const TrustStrip: React.FC = () => (
  <section className="relative border-y border-brand-ink/[0.06] bg-white">
    <div className="mx-auto max-w-6xl px-6">
      <Reveal className="grid grid-cols-2 divide-brand-ink/[0.06] md:grid-cols-4 md:divide-x">
        {STATS.map((s, i) => (
          <div
            key={s.value}
            className={`flex flex-col items-start gap-1 py-7 md:px-8 ${i % 2 === 1 ? "pl-6 md:pl-8" : ""} ${
              i < 2 ? "border-b border-brand-ink/[0.06] md:border-b-0" : ""
            } ${i === 0 ? "md:pl-0" : ""}`}
          >
            <span className="font-display text-[2rem] font-bold leading-none tracking-tight text-brand-ink sm:text-[2.3rem]">
              {s.value}
            </span>
            <span className="text-[13px] leading-snug text-brand-muted">{s.label}</span>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
)
