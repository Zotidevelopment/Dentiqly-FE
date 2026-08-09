/**
 * Utilidades para trabajar con fechas "de calendario" (YYYY-MM-DD).
 *
 * El backend guarda `fecha` como DATEONLY: es un día del calendario, no un instante.
 * Dos errores clásicos que estas funciones evitan:
 *
 *  1. `new Date().toISOString().split('T')[0]` devuelve el día en UTC. En Argentina
 *     (UTC-3), a partir de las 21:00 eso ya es el día siguiente, así que un ingreso
 *     cargado a la noche aparecía con fecha de mañana.
 *  2. `new Date("2026-08-09")` se interpreta como medianoche UTC, que al mostrarse
 *     en hora local es el 8 de agosto a las 21:00 → la fecha se veía un día antes.
 */

/** Fecha de hoy en la zona horaria del navegador, como "YYYY-MM-DD". */
export const todayISO = (): string => toISODate(new Date())

/** Convierte un Date a "YYYY-MM-DD" usando sus componentes locales. */
export const toISODate = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Parsea "YYYY-MM-DD" (o un ISO completo) como fecha local, sin corrimiento de zona horaria. */
export const parseLocalDate = (dateStr?: string | null): Date => {
  if (!dateStr) return new Date()
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

/** Suma (o resta) días a una fecha "YYYY-MM-DD" y devuelve el resultado en el mismo formato. */
export const addDaysISO = (dateStr: string, days: number): string => {
  const d = parseLocalDate(dateStr)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Formatea una fecha "YYYY-MM-DD" para mostrar. */
export const formatLocalDate = (
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
  locale = "es-AR",
): string => {
  if (!dateStr) return ""
  return parseLocalDate(dateStr).toLocaleDateString(locale, options)
}

/** Nombre del mes ("agosto 2026") a partir de una clave "YYYY-MM". */
export const formatMonthKey = (monthKey: string, locale = "es-AR"): string => {
  const [year, month] = monthKey.split("-").map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(locale, { month: "long", year: "numeric" })
}

/** Clave "YYYY-MM" del mes actual. */
export const currentMonthKey = (): string => todayISO().slice(0, 7)

/** Primer y último día de un mes "YYYY-MM", en formato "YYYY-MM-DD". */
export const monthRange = (monthKey: string): { desde: string; hasta: string } => {
  const [year, month] = monthKey.split("-").map(Number)
  const ultimoDia = new Date(year, month, 0).getDate()
  return {
    desde: `${monthKey}-01`,
    hasta: `${monthKey}-${String(ultimoDia).padStart(2, "0")}`,
  }
}

/** Desplaza una clave "YYYY-MM" en N meses. */
export const shiftMonthKey = (monthKey: string, months: number): string => {
  const [year, month] = monthKey.split("-").map(Number)
  const d = new Date(year, month - 1 + months, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
