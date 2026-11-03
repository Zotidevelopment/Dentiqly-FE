import React from "react"
import { Check, MailCheck, Clock3, Building2, FileText, Image as ImageIcon, Pill } from "lucide-react"
import { SectionHeading } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"

/* ─── Mini interfaces (todo vectorial, nada de fotos de stock) ─────────── */

const MiniAgenda: React.FC = () => {
  const cols = [
    [
      { t: 0, h: 1.5, n: "Martina G.", c: "#DCFCE7", tx: "#166534", b: "#22C55E" },
      { t: 2, h: 1, n: "Pedro L.", c: "#DBEAFE", tx: "#1E40AF", b: "#3B82F6" },
    ],
    [
      { t: 0.5, h: 1, n: "Carlos R.", c: "#FEF3C7", tx: "#92400E", b: "#F59E0B" },
      { t: 2, h: 1.5, n: "Lucía M.", c: "#EDE9FE", tx: "#5B21B6", b: "#8B5CF6" },
    ],
    [
      { t: 0, h: 1, n: "Ana F.", c: "#CCFBF1", tx: "#115E59", b: "#14B8A6" },
      { t: 1.5, h: 1, n: "Sobreturno", c: "#FFFFFF", tx: "#2458ED", b: "#2458ED", dashed: true },
      { t: 3, h: 1, n: "Sofía D.", c: "#DBEAFE", tx: "#1E40AF", b: "#3B82F6" },
    ],
  ]
  const ROW = 30
  return (
    <div className="grid h-full grid-cols-[34px_repeat(3,1fr)] gap-x-1.5">
      <div className="relative" style={{ height: ROW * 4 + 22 }}>
        {["09", "10", "11", "12"].map((h, i) => (
          <span key={h} className="absolute right-0 text-[9.5px] font-medium text-brand-muted" style={{ top: 22 + i * ROW - 5 }}>
            {h}:00
          </span>
        ))}
      </div>
      {["Lun", "Mar", "Mié"].map((d, di) => (
        <div key={d}>
          <p className={`mb-1 text-center text-[10px] font-bold uppercase tracking-wider ${di === 2 ? "text-brand-blue" : "text-brand-muted"}`}>
            {d}
          </p>
          <div
            className="relative rounded-lg"
            style={{
              height: ROW * 4,
              backgroundImage: "linear-gradient(to bottom, rgba(11,16,35,0.07) 1px, transparent 1px)",
              backgroundSize: `100% ${ROW}px`,
            }}
          >
            {cols[di].map((a) => (
              <div
                key={a.n}
                className="absolute inset-x-0.5 overflow-hidden rounded-md px-1.5 py-1 text-[10px] font-bold leading-tight"
                style={{
                  top: a.t * ROW + 2,
                  height: a.h * ROW - 4,
                  background: a.c,
                  color: a.tx,
                  borderLeft: `3px solid ${a.b}`,
                  outline: a.dashed ? `1.5px dashed ${a.b}` : "none",
                  outlineOffset: "-1.5px",
                }}
              >
                {a.n}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const MiniBooking: React.FC = () => (
  <div className="flex h-full flex-col gap-3">
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-brand-ink/[0.06]">
      <span className="text-[11px] font-semibold text-brand-ink">Limpieza dental</span>
      <span className="text-[10px] font-medium text-brand-muted">45 min</span>
    </div>
    <div className="grid grid-cols-4 gap-1.5">
      {["Lun 2", "Mar 3", "Mié 4", "Jue 5"].map((d, i) => (
        <span
          key={d}
          className={`rounded-lg py-1.5 text-center text-[10.5px] font-semibold ${
            i === 2 ? "bg-brand-blue text-white" : "bg-white text-brand-muted ring-1 ring-brand-ink/[0.06]"
          }`}
        >
          {d}
        </span>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-1.5">
      {["09:00", "09:45", "10:30", "11:30", "14:00", "15:30"].map((h) => (
        <span
          key={h}
          className={`rounded-lg py-1.5 text-center text-[11px] font-semibold tabular-nums ${
            h === "11:30"
              ? "bg-brand-blue-tint text-brand-blue ring-1 ring-brand-blue"
              : "bg-white text-brand-ink ring-1 ring-brand-ink/[0.06]"
          }`}
        >
          {h}
        </span>
      ))}
    </div>
    <span className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-brand-ink py-2 text-[11.5px] font-semibold text-white">
      <Check size={12} strokeWidth={3} /> Confirmar turno
    </span>
  </div>
)

const MiniReminders: React.FC = () => {
  const steps = [
    { icon: Clock3, label: "Turno agendado", sub: "Jue 5 · 10:00 · Dra. Gómez", tone: "text-brand-muted bg-white ring-1 ring-brand-ink/[0.06]" },
    { icon: MailCheck, label: "Recordatorio enviado", sub: "Enviado con un clic", tone: "text-brand-blue bg-brand-blue-tint" },
    { icon: Check, label: "Paciente confirmó", sub: "Ausencia evitada", tone: "text-emerald-600 bg-emerald-50" },
  ]
  return (
    <div className="relative flex h-full flex-col justify-between gap-3">
      <span className="absolute bottom-6 left-[15px] top-6 w-px bg-brand-ink/[0.08]" aria-hidden="true" />
      {steps.map(({ icon: Icon, label, sub, tone }) => (
        <div key={label} className="relative flex items-center gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
            <Icon size={14} strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <p className="text-[12px] font-semibold text-brand-ink">{label}</p>
            <p className="text-[10.5px] text-brand-muted">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const MiniOdontogram: React.FC = () => {
  // 16 piezas por arcada sobre una semielipse
  const W = 300
  const cx = W / 2
  const rx = 128
  const ry = 56
  const teeth = Array.from({ length: 16 }, (_, i) => {
    const angle = (Math.PI * (i + 0.5)) / 16
    return { x: cx + rx * Math.cos(angle), dy: ry * Math.sin(angle) }
  })
  // Estados de demo: índice → color
  const upper: Record<number, string> = { 3: "#F43F5E", 9: "#2458ED", 13: "#2458ED", 14: "#CBD5E1" }
  const lower: Record<number, string> = { 2: "#2458ED", 6: "#F43F5E", 11: "#F59E0B" }
  const Tooth: React.FC<{ x: number; y: number; fill?: string }> = ({ x, y, fill }) => (
    <rect
      x={x - 6.5}
      y={y - 8}
      width={13}
      height={16}
      rx={4}
      fill={fill ?? "#FFFFFF"}
      stroke={fill ? fill : "rgba(11,16,35,0.18)"}
      strokeWidth={1.2}
    />
  )
  return (
    <div className="flex h-full flex-col justify-between">
      <svg viewBox={`0 0 ${W} 150`} className="h-auto w-full" aria-hidden="true">
        {teeth.map((t, i) => (
          <Tooth key={`u${i}`} x={t.x} y={72 - t.dy} fill={upper[i]} />
        ))}
        {teeth.map((t, i) => (
          <Tooth key={`l${i}`} x={t.x} y={82 + t.dy} fill={lower[i]} />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] font-medium text-brand-muted">
        {[
          ["#F43F5E", "Caries"],
          ["#2458ED", "Tratado"],
          ["#F59E0B", "En tratamiento"],
          ["#CBD5E1", "Ausente"],
        ].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: c }} /> {l}
          </span>
        ))}
      </div>
    </div>
  )
}

const MiniHistory: React.FC = () => {
  const rows = [
    { icon: FileText, t: "Evolución · 18/10", s: "Pieza 1.6: obturación compuesta" },
    { icon: ImageIcon, t: "Radiografía panorámica", s: "panoramica-oct.jpg · 2,4 MB" },
    { icon: Pill, t: "Receta digital", s: "Amoxicilina 500 mg · 7 días" },
  ]
  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ icon: Icon, t, s }) => (
        <div key={t} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 ring-1 ring-brand-ink/[0.06]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue-tint text-brand-blue">
            <Icon size={13} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[11.5px] font-semibold text-brand-ink">{t}</p>
            <p className="truncate text-[10.5px] text-brand-muted">{s}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const MiniFinance: React.FC = () => {
  const bars = [38, 52, 46, 64, 58, 72, 88]
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-muted">Ingresos del mes</p>
          <p className="text-[11px] font-bold text-emerald-600">+18%</p>
        </div>
        <p className="font-display text-[1.6rem] font-bold leading-none text-brand-ink">$ 4.860.000</p>
      </div>
      <div className="flex h-16 items-end gap-1.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-t-md ${i === bars.length - 1 ? "bg-brand-blue" : "bg-brand-blue/20"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          ["Liquidación Dra. Gómez · 40%", "$ 412.500"],
          ["Deudores del mes", "3 pacientes"],
        ].map(([l, v]) => (
          <div key={l} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-[11px] ring-1 ring-brand-ink/[0.06]">
            <span className="font-medium text-brand-muted">{l}</span>
            <span className="font-bold tabular-nums text-brand-ink">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const MiniBranches: React.FC = () => (
  <div className="flex h-full flex-col justify-between gap-4">
    <div className="grid grid-cols-3 gap-2">
      {[
        ["Centro", "12 turnos", true],
        ["Palermo", "9 turnos", false],
        ["Norte", "7 turnos", false],
      ].map(([n, t, active]) => (
        <div
          key={String(n)}
          className={`rounded-xl p-2.5 ${active ? "bg-brand-ink text-white" : "bg-white ring-1 ring-brand-ink/[0.06]"}`}
        >
          <Building2 size={14} className={active ? "text-brand-blue-light" : "text-brand-blue"} />
          <p className={`mt-2 text-[11.5px] font-semibold ${active ? "text-white" : "text-brand-ink"}`}>{n}</p>
          <p className={`text-[10px] ${active ? "text-white/60" : "text-brand-muted"}`}>{t}</p>
        </div>
      ))}
    </div>
    <div>
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-brand-muted">Roles del equipo</p>
      <div className="flex flex-wrap gap-1.5">
        {[
          ["LG", "Admin", "bg-brand-blue text-white"],
          ["MP", "Profesional", "bg-violet-100 text-violet-700"],
          ["SR", "Recepción", "bg-amber-100 text-amber-700"],
        ].map(([ini, role, cls]) => (
          <span key={role} className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2.5 text-[10.5px] font-semibold text-brand-ink ring-1 ring-brand-ink/[0.06]">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${cls}`}>{ini}</span>
            {role}
          </span>
        ))}
      </div>
    </div>
  </div>
)

/* ─── Tarjetas ─────────────────────────────────────────────────────────── */

interface CardProps {
  title: string
  description: string
  span: string
  children: React.ReactNode
  delay?: number
  visualClass?: string
}

const Card: React.FC<CardProps> = ({ title, description, span, children, delay = 0, visualClass = "" }) => (
  <Reveal delay={delay} className={`${span} group flex flex-col rounded-[26px] bg-white p-6 ring-1 ring-brand-ink/[0.07] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(11,16,35,0.25)] hover:ring-brand-blue/30 sm:p-7`}>
    <div className={`mb-6 flex-1 rounded-2xl bg-brand-surface p-4 ${visualClass}`}>{children}</div>
    <h3 className="font-display text-[1.25rem] font-semibold tracking-tight text-brand-ink">{title}</h3>
    <p className="mt-1.5 text-[14px] leading-relaxed text-brand-muted">{description}</p>
  </Reveal>
)

export const FeaturesBento: React.FC = () => (
  <section id="funcionalidades" className="relative bg-white py-24 sm:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <SectionHeading
        eyebrow="Todo en uno"
        title={
          <>
            Todo lo que tu clínica necesita.
            <br className="hidden sm:block" /> Nada que no.
          </>
        }
        subtitle="Reemplazá la agenda de papel, el Excel y los grupos de WhatsApp por un sistema pensado para odontología."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-6 lg:mt-20">
        <Card
          span="md:col-span-4"
          title="Agenda inteligente"
          description="Vista diaria, semanal y mensual por profesional y sucursal. Sobreturnos, ausencias, feriados y estados de cada turno con un color."
        >
          <MiniAgenda />
        </Card>
        <Card
          span="md:col-span-2"
          delay={0.05}
          title="Reservas online 24/7"
          description="Tu propio link de reservas. El paciente elige sede, servicio, profesional y horario desde el celular."
        >
          <MiniBooking />
        </Card>
        <Card
          span="md:col-span-2"
          delay={0.1}
          title="Recordatorios en un clic"
          description="Elegís el día y les mandás el recordatorio por email a todos tus pacientes con un clic, con tu propio mensaje."
        >
          <MiniReminders />
        </Card>
        <Card
          span="md:col-span-4"
          delay={0.15}
          title="Odontograma e historia clínica"
          description="Registro por pieza, evoluciones, planes de tratamiento, recetas y archivos adjuntos. Todo en la ficha del paciente."
          visualClass="grid gap-4 sm:grid-cols-[1.4fr_1fr] items-center"
        >
          <MiniOdontogram />
          <MiniHistory />
        </Card>
        <Card
          span="md:col-span-3"
          delay={0.2}
          title="Caja, deudores y liquidaciones"
          description="Ingresos, egresos, cuenta corriente por paciente y liquidación automática por profesional con comisiones configurables."
        >
          <MiniFinance />
        </Card>
        <Card
          span="md:col-span-3"
          delay={0.25}
          title="Multi-sucursal y roles"
          description="Todas tus sedes en un panel. Permisos distintos para administración, profesionales y recepción."
        >
          <MiniBranches />
        </Card>
      </div>
    </div>
  </section>
)
