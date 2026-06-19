import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// ─── Config ───────────────────────────────────────────────────────────────────
// All sizes are designed to render at ~1.61× actual so they look correct
// after the HeroSection applies scale(0.62).
const START_HOUR = 9
const END_HOUR = 17
const ROW_H = 100 // px per hour at render scale → ~62px visible

// Pastel palette with matching text / border accent
const STYLES = [
  { bg: "#DCFCE7", text: "#15803D", border: "#22C55E" }, // green
  { bg: "#DBEAFE", text: "#1D4ED8", border: "#3B82F6" }, // blue
  { bg: "#EDE9FE", text: "#6D28D9", border: "#8B5CF6" }, // purple
  { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" }, // amber
  { bg: "#FEE2E2", text: "#B91C1C", border: "#EF4444" }, // red
  { bg: "#CCFBF1", text: "#0F766E", border: "#14B8A6" }, // teal
]

const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE"]

// ─── Static demo appointments (always visible, no auth required) ──────────────
interface DemoAppt {
  id: number
  dayOffset: number // 0 = monday of current week
  start: string    // HH:MM
  end: string
  patient: string
  service: string
  styleIdx: number
}

const DEMO: DemoAppt[] = [
  { id: 1,  dayOffset: 0, start: "09:00", end: "09:45", patient: "Martina García",    service: "Limpieza dental",    styleIdx: 0 },
  { id: 2,  dayOffset: 0, start: "10:00", end: "11:00", patient: "Pedro López",       service: "Ortodoncia",         styleIdx: 1 },
  { id: 3,  dayOffset: 0, start: "11:30", end: "12:15", patient: "Ana Fernández",     service: "Control anual",      styleIdx: 2 },
  { id: 4,  dayOffset: 0, start: "14:00", end: "14:45", patient: "Roberto Gómez",     service: "Limpieza dental",    styleIdx: 0 },
  { id: 5,  dayOffset: 1, start: "09:30", end: "10:30", patient: "Carlos Rodríguez",  service: "Blanqueamiento",     styleIdx: 3 },
  { id: 6,  dayOffset: 1, start: "11:00", end: "12:00", patient: "Valentina Sánchez", service: "Extracción",         styleIdx: 4 },
  { id: 7,  dayOffset: 1, start: "14:00", end: "15:00", patient: "Miguel Torres",     service: "Endodoncia",         styleIdx: 1 },
  { id: 8,  dayOffset: 2, start: "09:00", end: "10:00", patient: "Lucía Martínez",    service: "Ortodoncia",         styleIdx: 2 },
  { id: 9,  dayOffset: 2, start: "10:30", end: "11:30", patient: "Roberto Herrera",   service: "Limpieza dental",    styleIdx: 0 },
  { id: 10, dayOffset: 2, start: "15:00", end: "16:00", patient: "Sofía Díaz",        service: "Control anual",      styleIdx: 5 },
  { id: 11, dayOffset: 3, start: "09:00", end: "09:30", patient: "Juan Vargas",       service: "Urgencia",           styleIdx: 4 },
  { id: 12, dayOffset: 3, start: "10:00", end: "11:30", patient: "Camila Ruiz",       service: "Implante",           styleIdx: 1 },
  { id: 13, dayOffset: 3, start: "14:30", end: "15:30", patient: "Ana Jiménez",       service: "Blanqueamiento",     styleIdx: 3 },
  { id: 14, dayOffset: 4, start: "09:30", end: "10:30", patient: "Luis Morales",      service: "Limpieza dental",    styleIdx: 0 },
  { id: 15, dayOffset: 4, start: "11:00", end: "12:00", patient: "Elena Castro",      service: "Ortodoncia",         styleIdx: 2 },
  { id: 16, dayOffset: 4, start: "15:30", end: "16:30", patient: "Pablo Herrera",     service: "Control anual",      styleIdx: 5 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function toMins(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export const HeroCalendarPreview: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monday = getMonday(currentDate)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const navigate = (dir: "prev" | "next") => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + (dir === "prev" ? -7 : 7))
    setCurrentDate(d)
  }

  const todayStr = toDateStr(new Date())
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  const monthLabel = monday.toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  return (
    <div className="flex flex-col h-full bg-white font-sans select-none text-[#0B1023]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-[22px] font-bold text-gray-800 capitalize tracking-tight">
          {monthLabel}
        </h2>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1">
            {["Mes", "Semana", "Día"].map((v, i) => (
              <button
                key={i}
                className={`px-4 py-1.5 rounded-lg text-[14px] font-semibold transition-all ${
                  i === 1
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("prev")}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => navigate("next")}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-[14px] font-semibold text-gray-600 border border-gray-200 px-4 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="flex-1 overflow-auto no-scrollbar">
        <div className="min-w-[560px]">

          {/* Day headers */}
          <div
            className="grid sticky top-0 bg-white z-10 border-b border-gray-100"
            style={{ gridTemplateColumns: "64px repeat(5, 1fr)" }}
          >
            <div />
            {weekDays.map((day, i) => {
              const isToday = toDateStr(day) === todayStr
              return (
                <div key={i} className="py-3 text-center">
                  <p
                    className={`text-[13px] font-bold uppercase tracking-widest mb-2 ${
                      isToday ? "text-[#2563FF]" : "text-gray-400"
                    }`}
                  >
                    {DAY_LABELS[i]}
                  </p>
                  <div
                    className={`w-[48px] h-[48px] rounded-full mx-auto flex items-center justify-center ${
                      isToday ? "bg-[#2563FF]" : ""
                    }`}
                  >
                    <p
                      className={`text-[22px] font-bold leading-none ${
                        isToday ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid body */}
          <div className="relative">

            {/* Hour rows (background grid) */}
            {hours.map((h) => (
              <div
                key={h}
                className="grid border-b border-gray-100/60"
                style={{ gridTemplateColumns: "64px repeat(5, 1fr)", height: `${ROW_H}px` }}
              >
                <div className="flex items-start justify-end pr-3 pt-2.5 border-r border-gray-100">
                  <span className="text-[13px] font-medium text-gray-400 tabular-nums">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
                {Array.from({ length: 5 }).map((_, di) => (
                  <div key={di} className="border-r border-gray-100/50 last:border-r-0" />
                ))}
              </div>
            ))}

            {/* Appointment cards (absolute overlay) */}
            <div
              className="absolute inset-0 grid pointer-events-none"
              style={{ gridTemplateColumns: "64px repeat(5, 1fr)" }}
            >
              <div />
              {Array.from({ length: 5 }).map((_, di) => {
                const dayAppts = DEMO.filter((a) => a.dayOffset === di)
                return (
                  <div key={di} className="relative border-r border-gray-100/50 last:border-r-0">
                    {dayAppts.map((appt) => {
                      const startMins = toMins(appt.start) - START_HOUR * 60
                      const endMins = toMins(appt.end) - START_HOUR * 60
                      if (startMins < 0 || startMins >= (END_HOUR - START_HOUR) * 60) return null

                      const top = (startMins / 60) * ROW_H + 2
                      const height = Math.max(((endMins - startMins) / 60) * ROW_H - 4, 36)
                      const s = STYLES[appt.styleIdx]

                      return (
                        <div
                          key={appt.id}
                          className="absolute left-2 right-2 rounded-2xl flex flex-col justify-start overflow-hidden"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: s.bg,
                            borderLeft: `4px solid ${s.border}`,
                            paddingLeft: "14px",
                            paddingRight: "12px",
                            paddingTop: "10px",
                            paddingBottom: "8px",
                          }}
                        >
                          {/* Time — shown when there's enough height */}
                          {height >= 74 && (
                            <p
                              className="text-[13px] font-semibold leading-none mb-1.5 tabular-nums"
                              style={{ color: s.text, opacity: 0.6 }}
                            >
                              {appt.start} – {appt.end}
                            </p>
                          )}

                          {/* Patient name */}
                          <p
                            className="font-bold leading-snug truncate text-[17px]"
                            style={{ color: s.text }}
                          >
                            {appt.patient}
                          </p>

                          {/* Service */}
                          {height >= 54 && (
                            <p
                              className="text-[15px] leading-snug mt-1 font-medium truncate"
                              style={{ color: s.text, opacity: 0.65 }}
                            >
                              {appt.service}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
