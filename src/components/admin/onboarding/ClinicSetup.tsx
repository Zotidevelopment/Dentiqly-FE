import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarPlus,
  Check,
  ClipboardList,
  Clock,
  Copy,
  Link2,
  Loader2,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UserPlus,
  Wallet,
  X,
  Zap,
} from "lucide-react"
import { BrandLogo } from "../../brand/BrandLogo"
import { apiClient } from "../../../lib/api-client"
import { trackOnboardingCompleted, trackOnboardingStarted } from "../../../lib/analytics"
import {
  COLORES_PROFESIONAL,
  DIAS,
  DURACIONES,
  ESPECIALIDADES,
  OBRAS_SOCIALES_SUGERIDAS,
  PRESETS_HORARIO,
  draftInicial,
  payloadDesdeDraft,
  validarPaso,
  type DiaKey,
  type SetupDraft,
} from "./setupData"

interface ClinicSetupProps {
  clinicaNombre: string
  nombreAdmin: string
  slug?: string
  /** Se llama al cerrar la pantalla final; `vista` es a dónde ir en el panel. */
  onFinish: (vista?: string) => void
}

type Fase = "inicio" | "guiado" | "procesando" | "listo"

interface ResultadoSetup {
  modo: "rapido" | "guiado"
  resumen: {
    profesionales: number
    servicios: number
    obrasSociales: number
    diasDeAtencion: number
    reservasOnline: boolean
    senaEnabled: boolean
    feriados?: number
  }
}

const PASOS = [
  { n: 1, titulo: "Tu clínica", detalle: "Nombre y contacto", icon: Building2 },
  { n: 2, titulo: "Horarios", detalle: "Días y horas de atención", icon: Clock },
  { n: 3, titulo: "Equipo", detalle: "Quiénes atienden", icon: Stethoscope },
  { n: 4, titulo: "Servicios", detalle: "Qué ofrecés y cuánto dura", icon: ClipboardList },
  { n: 5, titulo: "Obras sociales", detalle: "Con quiénes trabajás", icon: ShieldCheck },
  { n: 6, titulo: "Reservas online", detalle: "Tu link para pacientes", icon: CalendarCheck },
  { n: 7, titulo: "Cobros", detalle: "Seña y datos bancarios", icon: Wallet },
] as const

const TAREAS_PROCESO = [
  "Creando tu sede y tus horarios",
  "Cargando a tu equipo",
  "Armando tu lista de servicios",
  "Sumando obras sociales",
  "Cargando los feriados nacionales",
  "Activando tu link de reservas",
]

const inputClass =
  "w-full rounded-xl border border-[#DCE5EE] bg-white px-3.5 py-2.5 text-[14px] text-[#0B2440] placeholder:text-[#93A3B8] transition-colors focus:border-[#2458ED] focus:outline-none focus:ring-2 focus:ring-[#2458ED]/15"
const labelClass = "mb-1.5 block text-[12.5px] font-semibold text-[#0B2440]"

/* ─── Piezas chicas ──────────────────────────────────────────────────────── */

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[#2458ED]" : "bg-[#CBD5E1]"}`}
  >
    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
  </button>
)

const EncabezadoPaso: React.FC<{ paso: number; titulo: string; texto: string }> = ({ paso, titulo, texto }) => (
  <div className="mb-7">
    <p className="text-[12.5px] font-semibold text-[#2458ED]">Paso {paso} de 7</p>
    <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-[#0B2440] sm:text-[30px]">{titulo}</h1>
    <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-[#53677E]">{texto}</p>
  </div>
)

const linkReservas = (slug?: string) => (slug ? `${window.location.origin}/${slug}` : "")

/* ─── Componente principal ───────────────────────────────────────────────── */

export const ClinicSetup: React.FC<ClinicSetupProps> = ({ clinicaNombre, nombreAdmin, slug, onFinish }) => {
  const claveBorrador = `dq_setup_draft_${slug || "clinica"}`
  const [fase, setFase] = useState<Fase>("inicio")
  const [paso, setPaso] = useState(1)
  const [draft, setDraft] = useState<SetupDraft>(() => {
    try {
      const guardado = localStorage.getItem(claveBorrador)
      if (guardado) return JSON.parse(guardado) as SetupDraft
    } catch {
      /* borrador ilegible: se arranca de cero */
    }
    return draftInicial(clinicaNombre, nombreAdmin)
  })
  const [error, setError] = useState<string | null>(null)
  const [tareasHechas, setTareasHechas] = useState(0)
  const [resultado, setResultado] = useState<ResultadoSetup | null>(null)
  const [nuevaObraSocial, setNuevaObraSocial] = useState("")
  const [copiado, setCopiado] = useState(false)
  const contenidoRef = useRef<HTMLDivElement>(null)
  const enviando = useRef(false)

  useEffect(() => {
    trackOnboardingStarted()
  }, [])

  // El borrador sobrevive a una recarga o a cerrar la pestaña a mitad de camino.
  useEffect(() => {
    if (fase === "guiado") {
      try {
        localStorage.setItem(claveBorrador, JSON.stringify(draft))
      } catch {
        /* almacenamiento lleno o bloqueado: no es crítico */
      }
    }
  }, [draft, fase, claveBorrador])

  useEffect(() => {
    contenidoRef.current?.scrollTo({ top: 0 })
    setError(null)
  }, [paso, fase])

  const actualizar = <K extends keyof SetupDraft>(clave: K, valor: SetupDraft[K]) => setDraft((d) => ({ ...d, [clave]: valor }))

  /* ── Envío ── */
  const configurar = async (modo: "rapido" | "guiado") => {
    if (enviando.current) return
    enviando.current = true
    setError(null)
    setFase("procesando")
    setTareasHechas(0)

    // En modo rápido se usan los valores por defecto, salvo nombre de clínica y
    // del profesional (que salen de la cuenta recién creada).
    const base = modo === "rapido" ? draftInicial(clinicaNombre, nombreAdmin) : draft
    const payload = payloadDesdeDraft(base, modo, nombreAdmin)

    const timer = window.setInterval(() => setTareasHechas((n) => Math.min(n + 1, TAREAS_PROCESO.length - 1)), 420)
    const minimo = new Promise((r) => setTimeout(r, 2200))
    try {
      const [respuesta] = await Promise.all([apiClient.post<ResultadoSetup>("/onboarding/setup", payload), minimo])
      window.clearInterval(timer)
      setTareasHechas(TAREAS_PROCESO.length)
      setResultado(respuesta)
      localStorage.removeItem(claveBorrador)
      trackOnboardingCompleted()
      await new Promise((r) => setTimeout(r, 450))
      setFase("listo")
    } catch (e) {
      window.clearInterval(timer)
      setError(e instanceof Error ? e.message : "No pudimos terminar la configuración. Probá de nuevo.")
      setFase(modo === "guiado" ? "guiado" : "inicio")
    } finally {
      enviando.current = false
    }
  }

  const siguiente = () => {
    const problema = validarPaso(paso, draft)
    if (problema) {
      setError(problema)
      return
    }
    if (paso < 7) setPaso(paso + 1)
    else configurar("guiado")
  }

  const terminarDespues = () => {
    // Guarda lo que ya completó y deja el resto con los valores por defecto.
    for (let p = 1; p <= paso; p++) {
      const problema = validarPaso(p, draft)
      if (problema) {
        setPaso(p)
        setError(problema)
        return
      }
    }
    configurar("guiado")
  }

  const copiarLink = async () => {
    const url = linkReservas(slug)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2200)
    } catch {
      /* el navegador no dejó copiar: el link igual queda visible */
    }
  }

  /* ── Panel lateral ── */
  const panelTitulo = useMemo(() => {
    if (fase === "listo") return "Tu clínica ya está lista para atender."
    if (fase === "procesando") return "Estamos dejando todo en su lugar."
    if (fase === "guiado") return "Configurá tu clínica a tu medida."
    return "Bienvenido a tu nuevo consultorio digital."
  }, [fase])

  return (
    <div className="dentiqly-auth dq-setup flex min-h-screen items-stretch">
      <aside className="dentiqly-auth-panel dq-setup-panel hidden lg:flex">
        <div className="dentiqly-brand-pattern" aria-hidden="true" />
        <BrandLogo tone="inverse" className="relative z-10 h-9 w-auto self-start" />

        <div className="relative z-10 my-10">
          <p className="dentiqly-auth-eyebrow">Configuración inicial</p>
          <h2>{panelTitulo}</h2>

          {fase === "guiado" ? (
            <ol className="mt-9 space-y-1" aria-label="Pasos de la configuración">
              {PASOS.map(({ n, titulo, detalle, icon: Icon }) => {
                const estado = n < paso ? "hecho" : n === paso ? "actual" : "pendiente"
                return (
                  <li key={n}>
                    <button
                      type="button"
                      disabled={n > paso}
                      onClick={() => n < paso && setPaso(n)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        estado === "actual" ? "bg-white/[0.09] ring-1 ring-white/15" : estado === "hecho" ? "hover:bg-white/[0.06]" : ""
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
                          estado === "hecho" ? "bg-[#2458ED] text-white" : estado === "actual" ? "bg-white text-[#2458ED]" : "bg-white/[0.06] text-white/35"
                        }`}
                      >
                        {estado === "hecho" ? <Check size={15} strokeWidth={2.6} /> : <Icon size={15} />}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[13.5px] font-semibold ${estado === "pendiente" ? "text-white/45" : "text-white"}`}>{titulo}</span>
                        <span className={`block truncate text-[12px] ${estado === "pendiente" ? "text-white/30" : "text-white/55"}`}>{detalle}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="dentiqly-auth-description">
              {fase === "listo"
                ? "Ya podés cargar pacientes, agendar turnos y compartir tu link para que te reserven online."
                : "Agenda, reservas online, historia clínica y caja: todo listo en minutos. Lo que configures hoy lo podés cambiar cuando quieras."}
            </p>
          )}
        </div>

        <p className="relative z-10 text-xs text-white/50">
          ¿Dudas? Escribinos a <a className="font-semibold text-[#8FB2FF] hover:underline" href="mailto:hola@dentiqly.com">hola@dentiqly.com</a>
        </p>
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-white">
        {/* Encabezado mobile */}
        <div className="flex items-center justify-between bg-[#0B2440] px-5 py-4 lg:hidden">
          <BrandLogo tone="inverse" className="h-7 w-auto" />
          {fase === "guiado" && <span className="text-[12.5px] font-semibold text-white/70">Paso {paso} de 7</span>}
        </div>
        {fase === "guiado" && (
          <div className="h-1 bg-[#EAF2FF] lg:hidden" aria-hidden="true">
            <div className="h-full bg-[#2458ED] transition-all duration-500" style={{ width: `${(paso / 7) * 100}%` }} />
          </div>
        )}

        <div ref={contenidoRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-10 sm:py-12">
            {error && fase !== "guiado" && (
              <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-800">
                <X size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* ── INICIO ── */}
            {fase === "inicio" && (
              <div className="dq-fade-in">
                <p className="text-[13px] font-semibold text-[#2458ED]">Hola{nombreAdmin ? `, ${nombreAdmin.split(" ")[0]}` : ""} 👋</p>
                <h1 className="mt-2 text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-[#0B2440] sm:text-[34px]">
                  {clinicaNombre ? <>Dejemos todo listo en {clinicaNombre}.</> : "Dejemos tu clínica lista para atender."}
                </h1>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#53677E]">
                  Elegí cómo querés empezar. En los dos casos tu link de reservas queda funcionando al terminar.
                </p>

                <div className="mt-8 grid gap-4">
                  <div className="relative overflow-hidden rounded-[22px] bg-[#0B2440] p-6 text-white shadow-[0_28px_60px_-30px_#0B2440] sm:p-7">
                    <div className="relative flex flex-wrap items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2458ED] text-white shadow-[0_8px_20px_-8px_#2458ED]"><Zap size={19} /></span>
                      <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-white">Configurar en un clic</h2>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8FB2FF] ring-1 ring-white/15">Recomendado</span>
                    </div>
                    <p className="relative mt-3 text-[14px] leading-relaxed text-white/70">
                      Dejamos todo listo con la configuración típica de un consultorio. Empezás a usar Dentiqly ya y ajustás los detalles cuando quieras.
                    </p>
                    <ul className="relative mt-4 grid gap-x-5 gap-y-2 text-[13.5px] text-white/90 sm:grid-cols-2">
                      {[
                        "Sede principal",
                        "Atención de lunes a viernes, 9 a 18",
                        `${nombreAdmin || "Vos"} como profesional`,
                        "6 servicios con precio y duración",
                        "7 obras sociales frecuentes",
                        "Feriados nacionales cargados",
                        "Reservas online activadas",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check size={15} className="mt-0.5 shrink-0 text-[#8FB2FF]" strokeWidth={2.6} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => configurar("rapido")}
                      className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2458ED] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_-12px_#2458ED] transition-colors hover:bg-[#3A6BFF] sm:w-auto"
                    >
                      Configurar todo ahora
                      <ArrowRight size={17} />
                    </button>
                    <p className="relative mt-2.5 text-[12px] text-white/50">Tarda unos segundos.</p>
                  </div>

                  <div className="rounded-[22px] border border-[#DCE5EE] bg-[#F5F8FF] p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2458ED] ring-1 ring-[#DCE5EE]"><Sparkles size={18} /></span>
                      <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-[#0B2440]">Configurar paso a paso</h2>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[#65788D] ring-1 ring-[#DCE5EE]">7 pasos · 5 minutos</span>
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-[#53677E]">
                      Cargá tus horarios reales, tu equipo, tus precios y tus obras sociales. Podés frenar en cualquier paso y completar el resto después.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setPaso(1); setFase("guiado") }}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14.5px] font-semibold text-[#0B2440] ring-1 ring-[#DCE5EE] transition-colors hover:ring-[#2458ED]"
                    >
                      Empezar paso a paso
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-6 text-center text-[12.5px] text-[#65788D]">Todo se puede cambiar después desde “Datos de la clínica” en el menú.</p>
              </div>
            )}

            {/* ── PASO A PASO ── */}
            {fase === "guiado" && (
              <div key={paso} className="dq-fade-in">
                {paso === 1 && (
                  <>
                    <EncabezadoPaso paso={1} titulo="Contanos de tu clínica" texto="Esto es lo que ven tus pacientes en la reserva online y en los emails de confirmación." />
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="setup-nombre" className={labelClass}>Nombre de la clínica *</label>
                        <input id="setup-nombre" className={inputClass} value={draft.clinica.nombre} maxLength={100}
                          onChange={(e) => actualizar("clinica", { ...draft.clinica, nombre: e.target.value })} placeholder="Ej: Consultorio Dental Belgrano" />
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="setup-telefono" className={labelClass}>Teléfono o WhatsApp</label>
                          <div className="relative">
                            <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93A3B8]" />
                            <input id="setup-telefono" type="tel" className={`${inputClass} pl-10`} value={draft.clinica.telefono} maxLength={40}
                              onChange={(e) => actualizar("clinica", { ...draft.clinica, telefono: e.target.value })} placeholder="11 2345 6789" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="setup-direccion" className={labelClass}>Dirección</label>
                          <div className="relative">
                            <MapPin size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93A3B8]" />
                            <input id="setup-direccion" className={`${inputClass} pl-10`} value={draft.clinica.direccion} maxLength={160}
                              onChange={(e) => actualizar("clinica", { ...draft.clinica, direccion: e.target.value })} placeholder="Av. Cabildo 1234, CABA" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[12.5px] text-[#65788D]">Si tenés más de una sede, después las sumás desde Sucursales.</p>
                    </div>
                  </>
                )}

                {paso === 2 && (
                  <>
                    <EncabezadoPaso paso={2} titulo="¿Cuándo atendés?" texto="Con estos horarios armamos tu agenda y los turnos que se pueden reservar online." />
                    <div className="mb-5 flex flex-wrap gap-2">
                      {PRESETS_HORARIO.map((p) => (
                        <button key={p.label} type="button"
                          onClick={() => actualizar("horarios", JSON.parse(JSON.stringify(p.horarios)))}
                          className="rounded-full border border-[#DCE5EE] bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-[#0B2440] transition-colors hover:border-[#2458ED] hover:text-[#2458ED]">
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="divide-y divide-[#DCE5EE] overflow-hidden rounded-[18px] border border-[#DCE5EE]">
                      {DIAS.map(({ key, largo }) => {
                        const d = draft.horarios[key as DiaKey]
                        const setDia = (nuevo: typeof d) => actualizar("horarios", { ...draft.horarios, [key]: nuevo })
                        return (
                          <div key={key} className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center ${d.activo ? "bg-white" : "bg-[#F8FAFF]"}`}>
                            <div className="flex w-36 items-center gap-3">
                              <Toggle checked={d.activo} label={`Atender el ${largo}`}
                                onChange={(v) => setDia({ activo: v, rangos: d.rangos.length ? d.rangos : [{ inicio: "09:00", fin: "18:00" }] })} />
                              <span className={`text-[14px] font-semibold ${d.activo ? "text-[#0B2440]" : "text-[#93A3B8]"}`}>{largo}</span>
                            </div>
                            {d.activo ? (
                              <div className="flex flex-1 flex-wrap items-center gap-2">
                                {d.rangos.map((r, i) => (
                                  <div key={i} className="flex items-center gap-1.5">
                                    <input type="time" aria-label={`${largo}, desde`} value={r.inicio} step={900}
                                      onChange={(e) => setDia({ ...d, rangos: d.rangos.map((x, j) => (j === i ? { ...x, inicio: e.target.value } : x)) })}
                                      className="rounded-lg border border-[#DCE5EE] px-2 py-1.5 text-[13.5px] tabular-nums text-[#0B2440] focus:border-[#2458ED] focus:outline-none" />
                                    <span className="text-[13px] text-[#93A3B8]">a</span>
                                    <input type="time" aria-label={`${largo}, hasta`} value={r.fin} step={900}
                                      onChange={(e) => setDia({ ...d, rangos: d.rangos.map((x, j) => (j === i ? { ...x, fin: e.target.value } : x)) })}
                                      className="rounded-lg border border-[#DCE5EE] px-2 py-1.5 text-[13.5px] tabular-nums text-[#0B2440] focus:border-[#2458ED] focus:outline-none" />
                                    {d.rangos.length > 1 && (
                                      <button type="button" aria-label="Quitar este horario" onClick={() => setDia({ ...d, rangos: d.rangos.filter((_, j) => j !== i) })}
                                        className="rounded-md p-1 text-[#93A3B8] hover:bg-red-50 hover:text-red-600"><X size={14} /></button>
                                    )}
                                  </div>
                                ))}
                                {d.rangos.length < 2 && (
                                  <button type="button" onClick={() => setDia({ ...d, rangos: [...d.rangos, { inicio: "15:00", fin: "19:00" }] })}
                                    className="text-[12.5px] font-semibold text-[#2458ED] hover:underline">+ Horario cortado</button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[13px] text-[#93A3B8]">Cerrado</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-7">
                      <p className={labelClass}>Duración habitual de un turno</p>
                      <div className="flex flex-wrap gap-2">
                        {DURACIONES.map((min) => (
                          <button key={min} type="button" onClick={() => actualizar("duracion_turno", min)}
                            className={`rounded-xl px-4 py-2 text-[13.5px] font-semibold transition-colors ${draft.duracion_turno === min ? "bg-[#0B2440] text-white" : "bg-[#F5F8FF] text-[#0B2440] ring-1 ring-[#DCE5EE] hover:ring-[#2458ED]"}`}>
                            {min} min
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[12.5px] text-[#65788D]">Cada servicio puede tener su propia duración; la ajustás en el paso 4.</p>
                    </div>
                    <div className="mt-7 flex items-center justify-between gap-4 rounded-[18px] bg-[#0B2440] p-5 text-white">
                      <div>
                        <p className="text-[15px] font-semibold">Cerrar en feriados nacionales</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-white/65">
                          Cargamos los feriados de {new Date().getFullYear()} y {new Date().getFullYear() + 1} para que nadie reserve esos días. Los revisás en Feriados.
                        </p>
                      </div>
                      <Toggle checked={draft.feriados_nacionales !== false} label="Cerrar en feriados nacionales"
                        onChange={(v) => actualizar("feriados_nacionales", v)} />
                    </div>
                  </>
                )}

                {paso === 3 && (
                  <>
                    <EncabezadoPaso paso={3} titulo="¿Quiénes atienden?" texto="Cada profesional tiene su propia agenda. Arrancamos con vos; sumá a tu equipo si atienden más personas." />
                    <div className="space-y-3">
                      {draft.profesionales.map((p, i) => {
                        const setProf = (cambios: Partial<typeof p>) =>
                          actualizar("profesionales", draft.profesionales.map((x, j) => (j === i ? { ...x, ...cambios } : x)))
                        return (
                          <div key={i} className="rounded-[18px] border border-[#DCE5EE] bg-white p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="h-3 w-3 rounded-full" style={{ background: p.color }} aria-hidden="true" />
                                <span className="text-[13px] font-semibold text-[#65788D]">{i === 0 ? "Profesional principal" : `Profesional ${i + 1}`}</span>
                              </div>
                              {draft.profesionales.length > 1 && (
                                <button type="button" aria-label="Quitar profesional"
                                  onClick={() => actualizar("profesionales", draft.profesionales.filter((_, j) => j !== i))}
                                  className="rounded-lg p-1.5 text-[#93A3B8] hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                              )}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <input aria-label="Nombre" className={inputClass} placeholder="Nombre *" value={p.nombre} maxLength={60} onChange={(e) => setProf({ nombre: e.target.value })} />
                              <input aria-label="Apellido" className={inputClass} placeholder="Apellido *" value={p.apellido} maxLength={60} onChange={(e) => setProf({ apellido: e.target.value })} />
                              <select aria-label="Especialidad" className={inputClass} value={p.especialidad} onChange={(e) => setProf({ especialidad: e.target.value })}>
                                {ESPECIALIDADES.map((esp) => <option key={esp} value={esp}>{esp}</option>)}
                              </select>
                              <input aria-label="Matrícula" className={inputClass} placeholder="Matrícula (opcional)" value={p.numero_matricula} maxLength={30} onChange={(e) => setProf({ numero_matricula: e.target.value })} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {draft.profesionales.length < 12 && (
                      <button type="button"
                        onClick={() => actualizar("profesionales", [...draft.profesionales, {
                          nombre: "", apellido: "", especialidad: "Odontología general", numero_matricula: "",
                          color: COLORES_PROFESIONAL[draft.profesionales.length % COLORES_PROFESIONAL.length],
                        }])}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-[#B9CCE6] px-4 py-2.5 text-[13.5px] font-semibold text-[#2458ED] hover:bg-[#F5F8FF]">
                        <UserPlus size={16} /> Sumar otro profesional
                      </button>
                    )}
                    <p className="mt-4 text-[12.5px] text-[#65788D]">Todos arrancan con el horario de la clínica. Después podés darle a cada uno sus propios días y horas.</p>
                  </>
                )}

                {paso === 4 && (
                  <>
                    <EncabezadoPaso paso={4} titulo="¿Qué servicios ofrecés?" texto="Tildá los que hacés y ajustá precio y duración. Son los que tus pacientes eligen al reservar." />
                    <div className="divide-y divide-[#DCE5EE] overflow-hidden rounded-[18px] border border-[#DCE5EE]">
                      {draft.servicios.map((s, i) => {
                        const setServ = (cambios: Partial<typeof s>) =>
                          actualizar("servicios", draft.servicios.map((x, j) => (j === i ? { ...x, ...cambios } : x)))
                        return (
                          <div key={i} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${s.activo ? "bg-white" : "bg-[#F8FAFF]"}`}>
                            <input type="checkbox" aria-label={`Ofrecer ${s.nombre || "servicio"}`} checked={s.activo}
                              onChange={(e) => setServ({ activo: e.target.checked })}
                              className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded accent-[#2458ED]" />
                            <input aria-label="Nombre del servicio" value={s.nombre} maxLength={80} onChange={(e) => setServ({ nombre: e.target.value })}
                              className={`min-w-[150px] flex-1 border-0 bg-transparent px-0 py-1 text-[14px] font-semibold focus:outline-none focus:ring-0 ${s.activo ? "text-[#0B2440]" : "text-[#93A3B8]"}`} placeholder="Nombre del servicio" />
                            <select aria-label="Duración" value={s.duracion_estimada} disabled={!s.activo} onChange={(e) => setServ({ duracion_estimada: Number(e.target.value) })}
                              className="rounded-lg border border-[#DCE5EE] bg-white px-2 py-1.5 text-[13px] text-[#0B2440] disabled:opacity-50">
                              {[15, 20, 30, 40, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
                            </select>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[#93A3B8]">$</span>
                              <input aria-label="Precio" type="number" min={0} step={500} inputMode="numeric" disabled={!s.activo}
                                value={Number.isFinite(s.precio_base) ? s.precio_base : 0}
                                onChange={(e) => setServ({ precio_base: Math.max(0, Number(e.target.value) || 0) })}
                                className="w-[118px] rounded-lg border border-[#DCE5EE] bg-white py-1.5 pl-6 pr-2 text-right text-[13px] tabular-nums text-[#0B2440] disabled:opacity-50" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button type="button"
                      onClick={() => actualizar("servicios", [...draft.servicios, { nombre: "", duracion_estimada: draft.duracion_turno, precio_base: 0, categoria: "General", color: "#2458ED", activo: true }])}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-[#B9CCE6] px-4 py-2.5 text-[13.5px] font-semibold text-[#2458ED] hover:bg-[#F5F8FF]">
                      <Plus size={16} /> Agregar otro servicio
                    </button>
                    <p className="mt-4 text-[12.5px] text-[#65788D]">Los precios son de referencia: los usás en la caja y en las liquidaciones, y los cambiás cuando quieras.</p>
                  </>
                )}

                {paso === 5 && (
                  <>
                    <EncabezadoPaso paso={5} titulo="¿Con qué obras sociales trabajás?" texto="Las usás en la ficha de cada paciente, en las estadísticas y en las liquidaciones. Los pacientes particulares no necesitan nada." />
                    <div className="flex flex-wrap gap-2">
                      {[...new Set([...OBRAS_SOCIALES_SUGERIDAS, ...draft.obras_sociales])].map((os) => {
                        const elegida = draft.obras_sociales.includes(os)
                        return (
                          <button key={os} type="button" aria-pressed={elegida}
                            onClick={() => actualizar("obras_sociales", elegida ? draft.obras_sociales.filter((x) => x !== os) : [...draft.obras_sociales, os])}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${elegida ? "bg-[#2458ED] text-white" : "bg-[#F5F8FF] text-[#0B2440] ring-1 ring-[#DCE5EE] hover:ring-[#2458ED]"}`}>
                            {elegida && <Check size={13} strokeWidth={3} />}
                            {os}
                          </button>
                        )
                      })}
                    </div>
                    <form className="mt-5 flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const nombre = nuevaObraSocial.trim().replace(/\s+/g, " ")
                        if (nombre.length < 2) return
                        if (!draft.obras_sociales.some((x) => x.toLowerCase() === nombre.toLowerCase())) {
                          actualizar("obras_sociales", [...draft.obras_sociales, nombre])
                        }
                        setNuevaObraSocial("")
                      }}>
                      <input aria-label="Agregar otra obra social" className={inputClass} value={nuevaObraSocial} maxLength={80}
                        onChange={(e) => setNuevaObraSocial(e.target.value)} placeholder="¿Otra? Escribila y tocá Agregar" />
                      <button type="submit" className="shrink-0 rounded-xl bg-[#0B2440] px-4 text-[13.5px] font-semibold text-white hover:bg-[#13345a]">Agregar</button>
                    </form>
                    <p className="mt-4 text-[12.5px] text-[#65788D]">
                      {draft.obras_sociales.length === 0 ? "Sin obras sociales: todos tus pacientes quedan como particulares." : `${draft.obras_sociales.length} seleccionadas.`}
                    </p>
                  </>
                )}

                {paso === 6 && (
                  <>
                    <EncabezadoPaso paso={6} titulo="Reservas online, las 24 horas" texto="Tus pacientes eligen servicio, profesional y horario desde el celular, sin llamar. Vos ves el turno directo en tu agenda." />
                    <div className="rounded-[18px] border border-[#DCE5EE] bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[15px] font-semibold text-[#0B2440]">Permitir reservas online</p>
                          <p className="mt-0.5 text-[13px] text-[#65788D]">Los turnos reservados entran como pendientes hasta que los confirmes.</p>
                        </div>
                        <Toggle checked={draft.reservas.online_booking_enabled} label="Permitir reservas online"
                          onChange={(v) => actualizar("reservas", { online_booking_enabled: v })} />
                      </div>
                      {draft.reservas.online_booking_enabled && slug && (
                        <div className="mt-5 rounded-xl bg-[#F5F8FF] p-4">
                          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#65788D]">Tu link de reservas</p>
                          <p className="mt-1.5 flex items-center gap-2 break-all font-mono text-[14px] text-[#0B2440]">
                            <Link2 size={15} className="shrink-0 text-[#2458ED]" />
                            {linkReservas(slug).replace(/^https?:\/\//, "")}
                          </p>
                          <p className="mt-2 text-[12.5px] text-[#65788D]">Queda activo al terminar. Ponelo en tu Instagram, en Google y en tu WhatsApp.</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        { icon: CalendarCheck, t: "Solo horarios libres", d: "Se respetan tu agenda, feriados y ausencias." },
                        { icon: ShieldCheck, t: "Datos protegidos", d: "Un paciente nunca ve datos de otro." },
                        { icon: Clock, t: "Recordatorios", d: "Enviás recordatorios por email desde Recordatorios." },
                      ].map(({ icon: Icon, t, d }) => (
                        <div key={t} className="rounded-[16px] bg-[#F5F8FF] p-4">
                          <Icon size={17} className="text-[#2458ED]" />
                          <p className="mt-2 text-[13.5px] font-semibold text-[#0B2440]">{t}</p>
                          <p className="mt-0.5 text-[12.5px] leading-snug text-[#65788D]">{d}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {paso === 7 && (
                  <>
                    <EncabezadoPaso paso={7} titulo="¿Pedís seña para reservar?" texto="Es opcional. Si la activás, al reservar online el paciente ve tus datos bancarios para transferir." />
                    <div className="rounded-[18px] border border-[#DCE5EE] bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[15px] font-semibold text-[#0B2440]">Pedir seña en las reservas online</p>
                          <p className="mt-0.5 text-[13px] text-[#65788D]">Ayuda a reducir las ausencias.</p>
                        </div>
                        <Toggle checked={draft.cobros.sena_enabled} label="Pedir seña"
                          onChange={(v) => actualizar("cobros", { ...draft.cobros, sena_enabled: v })} />
                      </div>
                      {draft.cobros.sena_enabled && (
                        <div className="mt-4 max-w-[220px]">
                          <label htmlFor="setup-sena" className={labelClass}>Monto de la seña</label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#93A3B8]">$</span>
                            <input id="setup-sena" type="number" min={0} step={500} inputMode="numeric" className={`${inputClass} pl-7`}
                              value={draft.cobros.sena_monto} onChange={(e) => actualizar("cobros", { ...draft.cobros, sena_monto: e.target.value })} placeholder="5000" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 rounded-[18px] border border-[#DCE5EE] p-5">
                      <p className="text-[15px] font-semibold text-[#0B2440]">Datos para transferencias <span className="font-normal text-[#65788D]">· opcional</span></p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {([
                          ["bank_account_holder", "Titular de la cuenta", "Nombre y apellido", "text"],
                          ["bank_name", "Banco o billetera", "Ej: Banco Galicia", "text"],
                          ["bank_alias", "Alias", "mi.consultorio.mp", "text"],
                          ["bank_cbu", "CBU / CVU", "22 números", "numeric"],
                        ] as const).map(([campo, label, placeholder, modo]) => (
                          <div key={campo}>
                            <label htmlFor={`setup-${campo}`} className={labelClass}>{label}</label>
                            <input id={`setup-${campo}`} className={inputClass} placeholder={placeholder} inputMode={modo === "numeric" ? "numeric" : undefined}
                              value={draft.cobros[campo]} maxLength={campo === "bank_cbu" ? 26 : 100}
                              onChange={(e) => actualizar("cobros", { ...draft.cobros, [campo]: e.target.value })} />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <label htmlFor="setup-bank_whatsapp" className={labelClass}>WhatsApp para recibir comprobantes</label>
                          <input id="setup-bank_whatsapp" className={inputClass} placeholder="11 2345 6789" inputMode="tel"
                            value={draft.cobros.bank_whatsapp} maxLength={30}
                            onChange={(e) => actualizar("cobros", { ...draft.cobros, bank_whatsapp: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-800">
                    <X size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* ── PROCESANDO ── */}
            {fase === "procesando" && (
              <div className="dq-fade-in flex min-h-[60vh] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#EAF2FF] text-[#2458ED]">
                  <Loader2 size={28} className="animate-spin" />
                </span>
                <h1 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-[#0B2440]">Configurando tu clínica</h1>
                <ul className="mt-7 w-full max-w-sm space-y-3 text-left" aria-live="polite">
                  {TAREAS_PROCESO.map((t, i) => {
                    const hecha = i < tareasHechas
                    const actual = i === tareasHechas
                    return (
                      <li key={t} className={`flex items-center gap-3 text-[14px] transition-colors ${hecha ? "text-[#0B2440]" : actual ? "text-[#0B2440]" : "text-[#93A3B8]"}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${hecha ? "bg-[#2458ED] text-white" : "bg-[#EAF2FF] text-[#2458ED]"}`}>
                          {hecha ? <Check size={13} strokeWidth={3} /> : actual ? <Loader2 size={13} className="animate-spin" /> : null}
                        </span>
                        {t}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* ── LISTO ── */}
            {fase === "listo" && resultado && (
              <div className="dq-fade-in">
                <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#2458ED] text-white shadow-[0_14px_30px_-14px_#2458ED]">
                  <Check size={28} strokeWidth={2.6} />
                </span>
                <h1 className="mt-5 text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[#0B2440] sm:text-[34px]">
                  ¡Todo listo en {draft.clinica.nombre.trim() || clinicaNombre || "tu clínica"}!
                </h1>
                <p className="mt-2 text-[15px] text-[#53677E]">Esto es lo que dejamos configurado. Lo podés cambiar cuando quieras desde el panel.</p>

                <div className="relative mt-6 grid grid-cols-2 gap-x-4 gap-y-5 overflow-hidden rounded-[22px] bg-[#0B2440] p-5 sm:grid-cols-4 sm:p-6">
                  {[
                    [resultado.resumen.diasDeAtencion, resultado.resumen.diasDeAtencion === 1 ? "día de atención" : "días de atención"],
                    [resultado.resumen.profesionales, resultado.resumen.profesionales === 1 ? "profesional" : "profesionales"],
                    [resultado.resumen.servicios, "servicios"],
                    [resultado.resumen.obrasSociales, "obras sociales"],
                  ].map(([n, label]) => (
                    <div key={String(label)} className="relative">
                      <p className="text-[30px] font-semibold leading-none tracking-tight text-white">{n}</p>
                      <p className="mt-1.5 text-[12.5px] text-white/60">{label}</p>
                    </div>
                  ))}
                </div>

                {(resultado.resumen.feriados ?? 0) > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-[13.5px] text-[#53677E]">
                    <CalendarCheck size={16} className="shrink-0 text-[#2458ED]" />
                    También cargamos {resultado.resumen.feriados} feriados nacionales: esos días no se pueden reservar turnos.
                  </p>
                )}

                {resultado.resumen.reservasOnline && slug && (
                  <div className="mt-6 rounded-[20px] border border-[#DCE5EE] p-5">
                    <p className="text-[15px] font-semibold text-[#0B2440]">Tu link de reservas ya funciona</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <code className="flex-1 truncate rounded-xl bg-[#F5F8FF] px-4 py-3 font-mono text-[14px] text-[#0B2440]">{linkReservas(slug)}</code>
                      <button type="button" onClick={copiarLink}
                        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-semibold transition-colors ${copiado ? "bg-emerald-600 text-white" : "bg-[#0B2440] text-white hover:bg-[#13345a]"}`}>
                        {copiado ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar link</>}
                      </button>
                    </div>
                  </div>
                )}

                <p className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-[#65788D]">Tus próximos pasos</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => onFinish("patients")}
                    className="group flex items-center gap-3.5 rounded-[18px] border border-[#DCE5EE] p-4 text-left transition-colors hover:border-[#2458ED]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2458ED]"><UserPlus size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-semibold text-[#0B2440]">Cargá tu primer paciente</span>
                      <span className="block text-[12.5px] text-[#65788D]">O pedinos que migremos tus datos</span>
                    </span>
                    <ArrowRight size={16} className="text-[#93A3B8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#2458ED]" />
                  </button>
                  <button type="button" onClick={() => onFinish("calendar")}
                    className="group flex items-center gap-3.5 rounded-[18px] border border-[#DCE5EE] p-4 text-left transition-colors hover:border-[#2458ED]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2458ED]"><CalendarPlus size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-semibold text-[#0B2440]">Agendá un turno</span>
                      <span className="block text-[12.5px] text-[#65788D]">Mirá tu agenda con los horarios cargados</span>
                    </span>
                    <ArrowRight size={16} className="text-[#93A3B8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#2458ED]" />
                  </button>
                </div>

                <button type="button" onClick={() => onFinish("dashboard")}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2458ED] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1744CD] sm:w-auto">
                  Ir a mi panel
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de acciones del modo guiado */}
        {fase === "guiado" && (
          <div className="sticky bottom-0 border-t border-[#DCE5EE] bg-white/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-3 px-5 py-3.5 sm:px-10">
              <button type="button"
                onClick={() => (paso === 1 ? setFase("inicio") : setPaso(paso - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
                <ArrowLeft size={16} /> Atrás
              </button>
              <div className="flex items-center gap-2">
                {paso < 7 && (
                  <button type="button" onClick={terminarDespues}
                    className="hidden rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440] sm:inline-flex"
                    title="Guarda lo que completaste y configura el resto con valores típicos">
                    Terminar después
                  </button>
                )}
                <button type="button" onClick={siguiente}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2458ED] px-5 py-2.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#1744CD]">
                  {paso === 7 ? "Finalizar configuración" : "Siguiente"}
                  {paso === 7 ? <Check size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </div>
            {paso < 7 && (
              <button type="button" onClick={terminarDespues}
                className="block w-full border-t border-[#DCE5EE] py-2.5 text-center text-[13px] font-semibold text-[#53677E] sm:hidden">
                Terminar después y completar el resto con valores típicos
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
