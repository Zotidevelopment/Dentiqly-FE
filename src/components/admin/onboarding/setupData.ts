/**
 * Datos y valores por defecto del onboarding de clínicas nuevas.
 * Tienen que coincidir con los del backend (onboardingController.js): el
 * modo "un clic" manda exactamente esto.
 */

export const DIAS = [
  { key: "lunes", corto: "Lun", largo: "Lunes" },
  { key: "martes", corto: "Mar", largo: "Martes" },
  { key: "miercoles", corto: "Mié", largo: "Miércoles" },
  { key: "jueves", corto: "Jue", largo: "Jueves" },
  { key: "viernes", corto: "Vie", largo: "Viernes" },
  { key: "sabado", corto: "Sáb", largo: "Sábado" },
  { key: "domingo", corto: "Dom", largo: "Domingo" },
] as const

export type DiaKey = (typeof DIAS)[number]["key"]
export interface Rango { inicio: string; fin: string }
export interface Dia { activo: boolean; rangos: Rango[] }
export type Horarios = Record<DiaKey, Dia>

const dia = (activo: boolean, inicio = "09:00", fin = "18:00"): Dia => ({ activo, rangos: [{ inicio, fin }] })

export const HORARIOS_DEFAULT: Horarios = {
  lunes: dia(true), martes: dia(true), miercoles: dia(true), jueves: dia(true), viernes: dia(true),
  sabado: dia(false, "09:00", "13:00"), domingo: dia(false, "09:00", "13:00"),
}

export const PRESETS_HORARIO: { label: string; horarios: Horarios }[] = [
  { label: "Lun a Vie · 9 a 18", horarios: HORARIOS_DEFAULT },
  {
    label: "Lun a Vie · 8 a 20",
    horarios: {
      lunes: dia(true, "08:00", "20:00"), martes: dia(true, "08:00", "20:00"), miercoles: dia(true, "08:00", "20:00"),
      jueves: dia(true, "08:00", "20:00"), viernes: dia(true, "08:00", "20:00"),
      sabado: dia(false, "09:00", "13:00"), domingo: dia(false, "09:00", "13:00"),
    },
  },
  {
    label: "Lun a Sáb · con corte",
    horarios: {
      lunes: { activo: true, rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
      martes: { activo: true, rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
      miercoles: { activo: true, rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
      jueves: { activo: true, rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
      viernes: { activo: true, rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
      sabado: dia(true, "09:00", "13:00"), domingo: dia(false, "09:00", "13:00"),
    },
  },
]

export const DURACIONES = [15, 20, 30, 40, 45, 60]

export interface ServicioSetup {
  nombre: string
  duracion_estimada: number
  precio_base: number
  categoria: string
  color: string
  activo: boolean
}

// Los seis primeros coinciden con SERVICIOS_DEFAULT del backend y vienen
// tildados; el resto son sugerencias frecuentes en consultorios dentales.
export const CATALOGO_SERVICIOS: ServicioSetup[] = [
  { nombre: "Consulta General", duracion_estimada: 30, precio_base: 15000, categoria: "General", color: "#2458ED", activo: true },
  { nombre: "Limpieza Dental", duracion_estimada: 45, precio_base: 20000, categoria: "Prevención", color: "#16A34A", activo: true },
  { nombre: "Control", duracion_estimada: 15, precio_base: 10000, categoria: "General", color: "#0D9488", activo: true },
  { nombre: "Urgencia", duracion_estimada: 30, precio_base: 30000, categoria: "Urgencia", color: "#DC2626", activo: true },
  { nombre: "Arreglo (obturación)", duracion_estimada: 45, precio_base: 35000, categoria: "Operatoria", color: "#7C3AED", activo: true },
  { nombre: "Extracción simple", duracion_estimada: 45, precio_base: 40000, categoria: "Cirugía", color: "#B45309", activo: true },
  { nombre: "Blanqueamiento", duracion_estimada: 60, precio_base: 90000, categoria: "Estética", color: "#DB2777", activo: false },
  { nombre: "Endodoncia", duracion_estimada: 60, precio_base: 120000, categoria: "Endodoncia", color: "#9333EA", activo: false },
  { nombre: "Control de ortodoncia", duracion_estimada: 30, precio_base: 25000, categoria: "Ortodoncia", color: "#0891B2", activo: false },
  { nombre: "Consulta de implantes", duracion_estimada: 30, precio_base: 20000, categoria: "Implantes", color: "#475569", activo: false },
  { nombre: "Odontopediatría", duracion_estimada: 30, precio_base: 18000, categoria: "Pediatría", color: "#EA580C", activo: false },
  { nombre: "Prótesis (consulta)", duracion_estimada: 30, precio_base: 20000, categoria: "Prótesis", color: "#65A30D", activo: false },
]

export const OBRAS_SOCIALES_DEFAULT = ["OSDE", "Swiss Medical", "Galeno", "Medifé", "Sancor Salud", "PAMI", "IOMA"]

export const OBRAS_SOCIALES_SUGERIDAS = [
  ...OBRAS_SOCIALES_DEFAULT,
  "OMINT", "Prevención Salud", "Accord Salud", "Hospital Italiano", "Hospital Alemán", "OSECAC",
  "Unión Personal", "OSPRERA", "IOSFA", "Premedic", "Jerárquicos Salud", "Avalian",
]

export const ESPECIALIDADES = [
  "Odontología general", "Ortodoncia", "Endodoncia", "Periodoncia", "Implantología",
  "Odontopediatría", "Cirugía bucal", "Prótesis", "Estética dental",
]

export const COLORES_PROFESIONAL = ["#2458ED", "#16A34A", "#7C3AED", "#DC2626", "#0D9488", "#B45309", "#DB2777"]

export interface ProfesionalSetup {
  nombre: string
  apellido: string
  especialidad: string
  numero_matricula: string
  color: string
}

export interface SetupDraft {
  clinica: { nombre: string; telefono: string; direccion: string }
  horarios: Horarios
  duracion_turno: number
  profesionales: ProfesionalSetup[]
  servicios: ServicioSetup[]
  obras_sociales: string[]
  reservas: { online_booking_enabled: boolean }
  /** Cargar los feriados nacionales del año en curso y el próximo. */
  feriados_nacionales?: boolean
  cobros: {
    sena_enabled: boolean
    sena_monto: string
    bank_name: string
    bank_account_holder: string
    bank_cbu: string
    bank_alias: string
    bank_whatsapp: string
  }
}

export function profesionalDesdeNombre(nombreCompleto: string): ProfesionalSetup {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean)
  return {
    nombre: partes[0] || "",
    apellido: partes.slice(1).join(" "),
    especialidad: "Odontología general",
    numero_matricula: "",
    color: COLORES_PROFESIONAL[0],
  }
}

export function draftInicial(clinicaNombre: string, nombreAdmin: string): SetupDraft {
  return {
    clinica: { nombre: clinicaNombre, telefono: "", direccion: "" },
    horarios: JSON.parse(JSON.stringify(HORARIOS_DEFAULT)),
    duracion_turno: 30,
    profesionales: [profesionalDesdeNombre(nombreAdmin)],
    servicios: CATALOGO_SERVICIOS.map((s) => ({ ...s })),
    obras_sociales: [...OBRAS_SOCIALES_DEFAULT],
    reservas: { online_booking_enabled: true },
    feriados_nacionales: true,
    cobros: {
      sena_enabled: false, sena_monto: "", bank_name: "", bank_account_holder: "",
      bank_cbu: "", bank_alias: "", bank_whatsapp: "",
    },
  }
}

/** Payload para POST /onboarding/setup. */
export function payloadDesdeDraft(draft: SetupDraft, modo: "rapido" | "guiado", nombreAdmin: string) {
  return {
    modo,
    nombre_admin: nombreAdmin,
    clinica: draft.clinica,
    horarios: draft.horarios,
    duracion_turno: draft.duracion_turno,
    profesionales: draft.profesionales.filter((p) => p.nombre.trim() && p.apellido.trim()),
    servicios: draft.servicios
      .filter((s) => s.activo && s.nombre.trim())
      .map((s) => ({
        nombre: s.nombre, duracion_estimada: s.duracion_estimada, precio_base: s.precio_base,
        categoria: s.categoria, color: s.color,
      })),
    obras_sociales: draft.obras_sociales,
    reservas: draft.reservas,
    // Los borradores guardados antes de esta opción no la tienen: se cargan.
    feriados_nacionales: draft.feriados_nacionales !== false,
    cobros: {
      ...draft.cobros,
      sena_monto: Number(draft.cobros.sena_monto) || 0,
    },
  }
}

const aMinutos = (h: string) => {
  const [hh, mm] = h.split(":").map(Number)
  return hh * 60 + mm
}

/** Mensaje de error del paso, o null si se puede avanzar. */
export function validarPaso(paso: number, draft: SetupDraft): string | null {
  if (paso === 1 && draft.clinica.nombre.trim().length < 2) return "Escribí el nombre de tu clínica."
  if (paso === 2) {
    const activos = DIAS.filter((d) => draft.horarios[d.key].activo)
    if (activos.length === 0) return "Elegí al menos un día de atención."
    for (const d of activos) {
      const rangos = [...draft.horarios[d.key].rangos].sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio))
      for (const [i, r] of rangos.entries()) {
        if (!r.inicio || !r.fin || aMinutos(r.inicio) >= aMinutos(r.fin)) return `Revisá el horario del ${d.largo.toLowerCase()}: la apertura tiene que ser antes del cierre.`
        if (i > 0 && aMinutos(r.inicio) < aMinutos(rangos[i - 1].fin)) return `El ${d.largo.toLowerCase()} tiene horarios que se superponen.`
      }
    }
  }
  if (paso === 3) {
    const validos = draft.profesionales.filter((p) => p.nombre.trim() && p.apellido.trim())
    if (validos.length === 0) return "Cargá al menos un profesional con nombre y apellido."
    if (draft.profesionales.some((p) => (p.nombre.trim() || p.apellido.trim()) && !(p.nombre.trim() && p.apellido.trim()))) {
      return "A cada profesional le falta nombre o apellido."
    }
  }
  if (paso === 4 && !draft.servicios.some((s) => s.activo && s.nombre.trim())) return "Elegí al menos un servicio."
  if (paso === 7) {
    const cbu = draft.cobros.bank_cbu.replace(/\s/g, "")
    if (cbu && !/^\d{22}$/.test(cbu)) return "El CBU o CVU tiene que tener 22 números."
    if (draft.cobros.sena_enabled && !(Number(draft.cobros.sena_monto) > 0)) return "Indicá el monto de la seña o desactivala."
  }
  return null
}
