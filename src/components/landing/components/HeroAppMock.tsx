import { BrandLogo } from '../../brand/BrandLogo'
import React from "react"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Wallet,
  Receipt,
  Plus,
  ChevronLeft,
  ChevronRight,
  MailCheck,
  CalendarCheck2,
  TrendingUp,
} from "lucide-react"

/**
 * Mock de la agenda de Dentiqly para el hero.
 * Es una reproducción en código del panel real (sidebar navy, agenda semanal
 * con chips de colores por estado) con datos de demostración. No carga ningún
 * componente del admin, así que pesa casi nada y pinta al instante.
 */

const START_HOUR = 9
const END_HOUR = 16
const ROW_H = 44 // px por hora

const PALETTE = {
  green: { bg: "#DCFCE7", text: "#166534", bar: "#22C55E" },
  blue: { bg: "#DBEAFE", text: "#1E40AF", bar: "#3B82F6" },
  purple: { bg: "#EDE9FE", text: "#5B21B6", bar: "#8B5CF6" },
  amber: { bg: "#FEF3C7", text: "#92400E", bar: "#F59E0B" },
  teal: { bg: "#CCFBF1", text: "#115E59", bar: "#14B8A6" },
  rose: { bg: "#FFE4E6", text: "#9F1239", bar: "#F43F5E" },
} as const

type Tone = keyof typeof PALETTE

interface Appt {
  day: number
  start: number // hora decimal, ej. 9.5 = 09:30
  end: number
  name: string
  service: string
  tone: Tone
}

const APPTS: Appt[] = [
  { day: 0, start: 9, end: 9.75, name: "Martina García", service: "Limpieza", tone: "green" },
  { day: 0, start: 10, end: 11, name: "Pedro López", service: "Ortodoncia", tone: "blue" },
  { day: 0, start: 11.5, end: 12.25, name: "Ana Fernández", service: "Control", tone: "purple" },
  { day: 0, start: 14, end: 15, name: "Roberto Gómez", service: "Implante", tone: "teal" },
  { day: 1, start: 9.5, end: 10.5, name: "Carlos Ruiz", service: "Blanqueamiento", tone: "amber" },
  { day: 1, start: 11, end: 12, name: "Valentina S.", service: "Extracción", tone: "rose" },
  { day: 1, start: 14, end: 15.5, name: "Miguel Torres", service: "Endodoncia", tone: "blue" },
  { day: 2, start: 9, end: 10, name: "Lucía Martínez", service: "Ortodoncia", tone: "purple" },
  { day: 2, start: 10.5, end: 11.25, name: "Juan Herrera", service: "Limpieza", tone: "green" },
  { day: 2, start: 11.5, end: 12.5, name: "Pedro López", service: "Ortodoncia", tone: "blue" },
  { day: 2, start: 14.5, end: 15.5, name: "Sofía Díaz", service: "Control", tone: "teal" },
  { day: 3, start: 9, end: 9.5, name: "Juan Vargas", service: "Urgencia", tone: "rose" },
  { day: 3, start: 10, end: 11.5, name: "Camila Ruiz", service: "Implante", tone: "teal" },
  { day: 3, start: 13.5, end: 14.5, name: "Ana Jiménez", service: "Blanqueamiento", tone: "amber" },
  { day: 4, start: 9.5, end: 10.5, name: "Luis Morales", service: "Limpieza", tone: "green" },
  { day: 4, start: 11, end: 12, name: "Elena Castro", service: "Ortodoncia", tone: "purple" },
  { day: 4, start: 14, end: 15, name: "Pablo Herrera", service: "Control", tone: "blue" },
]

const DAYS = [
  { label: "Lun", num: 2 },
  { label: "Mar", num: 3 },
  { label: "Mié", num: 4, today: true },
  { label: "Jue", num: 5 },
  { label: "Vie", num: 6 },
]

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: CalendarDays, label: "Agenda", active: true },
  { icon: Users, label: "Pacientes" },
  { icon: Stethoscope, label: "Profesionales" },
  { icon: Wallet, label: "Flujo de caja" },
  { icon: Receipt, label: "Liquidaciones" },
]

const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const gridHeight = (END_HOUR - START_HOUR) * ROW_H

const FloatingCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`pointer-events-none absolute z-20 hidden rounded-2xl bg-white p-3.5 pr-4 shadow-[0_24px_60px_-20px_rgba(11,16,35,0.35)] ring-1 ring-brand-ink/[0.07] lg:flex ${className}`}
  >
    {children}
  </div>
)

export const HeroAppMock: React.FC = () => {
  return (
    <div className="relative mx-auto max-w-6xl">
      {/* ── Tarjetas flotantes (solo desktop) ── */}
      <FloatingCard className="-right-6 top-[150px] animate-float-y items-center gap-3 xl:-right-14">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <MailCheck size={18} />
        </span>
        <div className="text-left">
          <p className="text-[12.5px] font-semibold text-brand-ink">Recordatorio enviado</p>
          <p className="text-[11.5px] text-brand-muted">Martina García · mañana 09:00</p>
          <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">Confirmó asistencia ✓</p>
        </div>
      </FloatingCard>

      <FloatingCard className="-left-6 bottom-16 animate-float-y-slow items-center gap-3 xl:-left-14">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-tint text-brand-blue">
          <CalendarCheck2 size={18} />
        </span>
        <div className="text-left">
          <p className="text-[12.5px] font-semibold text-brand-ink">Nueva reserva online</p>
          <p className="text-[11.5px] text-brand-muted">Pedro López · Mié 11:30 · Ortodoncia</p>
          <p className="mt-0.5 text-[11px] font-medium text-brand-blue">Desde el portal de pacientes</p>
        </div>
      </FloatingCard>

      <FloatingCard className="-right-4 bottom-24 animate-float-y flex-col gap-1.5 xl:-right-10" >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          <TrendingUp size={12} className="text-brand-blue" /> Asistencia semanal
        </div>
        <div className="flex items-end gap-2">
          <span className="font-display text-[26px] font-bold leading-none text-brand-ink">94%</span>
          <div className="mb-0.5 flex items-end gap-[3px]">
            {[40, 55, 48, 70, 62, 84, 100].map((h, i) => (
              <span
                key={i}
                className={`w-[5px] rounded-sm ${i === 6 ? "bg-brand-blue" : "bg-brand-blue/25"}`}
                style={{ height: `${6 + h * 0.16}px` }}
              />
            ))}
          </div>
        </div>
      </FloatingCard>

      {/* ── Marco de la app ── */}
      <div className="relative overflow-hidden rounded-[22px] bg-white ring-1 ring-brand-ink/[0.08] shadow-[0_50px_120px_-40px_rgba(11,16,35,0.45),0_24px_60px_-30px_rgba(37,99,255,0.35)]">
        {/* Barra de navegador */}
        <div className="flex h-10 items-center gap-3 border-b border-brand-ink/[0.06] bg-brand-surface/80 px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex flex-1 justify-center">
            <span className="rounded-md bg-white px-3 py-0.5 font-mono text-[10.5px] text-brand-muted ring-1 ring-brand-ink/[0.06]">
              app.dentiqly.com/agenda
            </span>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> En vivo
          </span>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-[196px] shrink-0 flex-col bg-brand-navy px-3 pb-4 pt-5 text-white/60 md:flex">
            <BrandLogo tone="inverse"
              alt=""
              className="mb-6 ml-2 h-[22px] w-auto"
            />
            <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">General</p>
            <ul className="space-y-0.5">
              {NAV.map(({ icon: Icon, label, active }) => (
                <li
                  key={label}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium ${
                    active ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30" : "hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-white/[0.05] px-2.5 py-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                LG
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[12px] font-semibold text-white">Dra. Laura Gómez</p>
                <p className="text-[10.5px] text-white/40">Administradora</p>
              </div>
            </div>
          </aside>

          {/* Panel principal */}
          <div className="min-w-0 flex-1 bg-white">
            {/* Encabezado */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
              <div>
                <h3 className="font-display text-[19px] font-semibold tracking-tight text-brand-ink">Agenda semanal</h3>
                <p className="text-[12px] text-brand-muted">Sede Centro · 17 turnos esta semana</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center rounded-lg bg-brand-surface p-0.5 text-[11.5px] font-semibold text-brand-muted sm:flex">
                  <span className="rounded-md px-2.5 py-1">Día</span>
                  <span className="rounded-md bg-white px-2.5 py-1 text-brand-ink shadow-sm">Semana</span>
                  <span className="rounded-md px-2.5 py-1">Mes</span>
                </div>
                <div className="flex items-center gap-1 rounded-lg ring-1 ring-brand-ink/[0.08]">
                  <span className="p-1.5 text-brand-muted"><ChevronLeft size={14} /></span>
                  <span className="text-[11.5px] font-semibold text-brand-ink">Hoy</span>
                  <span className="p-1.5 text-brand-muted"><ChevronRight size={14} /></span>
                </div>
                <span className="flex items-center gap-1 rounded-lg bg-brand-blue px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-sm shadow-brand-blue/30">
                  <Plus size={13} /> Nuevo turno
                </span>
              </div>
            </div>

            {/* Leyenda de estados */}
            <div className="flex gap-2 overflow-hidden px-4 pb-3 sm:px-6">
              {[
                ["Pendiente", "#F59E0B", "#FEF3C7"],
                ["Confirmado", "#2458ED", "#DBEAFE"],
                ["Atendido", "#16A34A", "#DCFCE7"],
                ["Cancelado", "#E11D48", "#FFE4E6"],
              ].map(([label, color, bg], i) => (
                <span
                  key={label}
                  className={`${i === 3 ? "hidden sm:flex" : "flex"} items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide`}
                  style={{ color, background: bg }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>

            {/* Grilla semanal */}
            <div className="border-t border-brand-ink/[0.06]">
              <div className="grid grid-cols-[42px_repeat(3,minmax(0,1fr))] sm:grid-cols-[48px_repeat(5,minmax(0,1fr))]">
                {/* Cabecera de días */}
                <div className="border-b border-brand-ink/[0.06]" />
                {DAYS.map((d, i) => (
                  <div
                    key={d.label}
                    className={`border-b border-l border-brand-ink/[0.06] py-2 text-center ${i >= 3 ? "hidden sm:block" : ""}`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${d.today ? "text-brand-blue" : "text-brand-muted"}`}>
                      {d.label}
                    </p>
                    <p
                      className={`mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[12.5px] font-bold ${
                        d.today ? "bg-brand-blue text-white" : "text-brand-ink"
                      }`}
                    >
                      {d.num}
                    </p>
                  </div>
                ))}

                {/* Columna de horas */}
                <div className="relative" style={{ height: gridHeight }}>
                  {hours.map((h, i) => (
                    <span
                      key={h}
                      className="absolute right-1.5 text-[10px] font-medium tabular-nums text-brand-muted"
                      style={{ top: i * ROW_H + 4 }}
                    >
                      {String(h).padStart(2, "0")}:00
                    </span>
                  ))}
                </div>

                {/* Columnas de días */}
                {DAYS.map((d, dayIdx) => (
                  <div
                    key={d.label}
                    className={`relative border-l border-brand-ink/[0.06] ${dayIdx >= 3 ? "hidden sm:block" : ""} ${
                      d.today ? "bg-brand-blue/[0.025]" : ""
                    }`}
                    style={{
                      height: gridHeight,
                      backgroundImage: "linear-gradient(to bottom, rgba(11,16,35,0.06) 1px, transparent 1px)",
                      backgroundSize: `100% ${ROW_H}px`,
                    }}
                  >
                    {APPTS.filter((a) => a.day === dayIdx).map((a) => {
                      const top = (a.start - START_HOUR) * ROW_H + 2
                      const height = (a.end - a.start) * ROW_H - 4
                      const p = PALETTE[a.tone]
                      return (
                        <div
                          key={`${a.day}-${a.start}`}
                          className="absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1 leading-tight"
                          style={{ top, height, background: p.bg, borderLeft: `3px solid ${p.bar}` }}
                        >
                          <p className="truncate text-[10.5px] font-bold" style={{ color: p.text }}>
                            {a.name}
                          </p>
                          {height >= 34 && (
                            <p className="truncate text-[9.5px] font-medium opacity-75" style={{ color: p.text }}>
                              {a.service}
                            </p>
                          )}
                        </div>
                      )
                    })}

                    {/* Línea de "ahora" en el día actual */}
                    {d.today && (
                      <div className="absolute inset-x-0 z-10 flex items-center" style={{ top: (11.4 - START_HOUR) * ROW_H }}>
                        <span className="-ml-[3px] h-2 w-2 rounded-full bg-rose-500" />
                        <span className="h-px flex-1 bg-rose-500/70" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
