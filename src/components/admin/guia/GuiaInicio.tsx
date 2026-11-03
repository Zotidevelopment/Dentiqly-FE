import React, { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarOff,
  CalendarPlus,
  Check,
  ClipboardList,
  Clock,
  Copy,
  Compass,
  PartyPopper,
  Shield,
  Stethoscope,
  UserPlus,
  X,
} from "lucide-react"

/**
 * Guía de primeros pasos del dashboard.
 *
 * Pensada para quien no se lleva bien con la computadora: pocos pasos, letra
 * grande, una explicación de para qué sirve cada cosa y un botón que lleva
 * directo a la pantalla (y a la pestaña) donde se hace. Cada paso se marca
 * solo cuando el dato ya está cargado.
 */

export interface DatosGuia {
  tieneDatosClinica: boolean
  tieneHorarios: boolean
  profesionales: number
  /** Profesionales creados por el onboarding con DNI o matrícula provisorios. */
  profesionalesIncompletos: number
  servicios: number
  obrasSociales: number
  feriadosDelAnio: number
  pacientes: number
  turnos: number
}

interface GuiaInicioProps {
  slug?: string
  datos: DatosGuia
  onNavigate: (view: string, params?: Record<string, string>) => void
  onRecorrido: () => void
  onOcultar: () => void
}

interface Paso {
  id: string
  titulo: string
  paraQue: string
  icono: React.ElementType
  hecho: boolean
  /** Texto del estado cuando falta algo puntual. */
  aviso?: string
  cta: string
  accion: () => void
  /** Pasos que no se pueden detectar solos: el usuario los marca. */
  manual?: string
}

const claveManual = (slug?: string) => `dq_guia_manual_${slug || "clinica"}`

const leerManual = (slug?: string): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(claveManual(slug)) || "{}")
  } catch {
    return {}
  }
}

export const GuiaInicio: React.FC<GuiaInicioProps> = ({ slug, datos, onNavigate, onRecorrido, onOcultar }) => {
  const [manual, setManual] = useState<Record<string, boolean>>(() => leerManual(slug))
  const [linkCopiado, setLinkCopiado] = useState(false)
  const anio = new Date().getFullYear()

  const marcar = (id: string, valor = true) => {
    setManual((prev) => {
      const next = { ...prev, [id]: valor }
      try {
        localStorage.setItem(claveManual(slug), JSON.stringify(next))
      } catch {
        /* sin almacenamiento: se pierde al recargar, no es grave */
      }
      return next
    })
  }

  const copiarLink = async () => {
    if (!slug) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
      setLinkCopiado(true)
      marcar("link")
      setTimeout(() => setLinkCopiado(false), 2500)
    } catch {
      /* el navegador no dejó copiar */
    }
  }

  const pasos: Paso[] = useMemo(
    () => [
      {
        id: "clinica",
        titulo: "Completá dirección y teléfono",
        paraQue: "Tus pacientes los ven al reservar un turno y en los emails de confirmación.",
        icono: Building2,
        hecho: datos.tieneDatosClinica,
        cta: "Completar datos",
        accion: () => onNavigate("settings", { tab: "general" }),
      },
      {
        id: "horarios",
        titulo: "Revisá tus horarios de atención",
        paraQue: "Solo se pueden dar turnos dentro de estos días y horas.",
        icono: Clock,
        hecho: datos.tieneHorarios,
        cta: "Ver horarios",
        accion: () => onNavigate("settings", { tab: "horarios" }),
      },
      {
        id: "profesionales",
        titulo: "Cargá a quienes atienden",
        paraQue: "Cada profesional tiene su propia agenda, con su matrícula para las recetas.",
        icono: Stethoscope,
        hecho: datos.profesionales > 0 && datos.profesionalesIncompletos === 0,
        aviso:
          datos.profesionalesIncompletos > 0
            ? `Falta DNI o matrícula de ${datos.profesionalesIncompletos} ${datos.profesionalesIncompletos === 1 ? "profesional" : "profesionales"}`
            : undefined,
        cta: datos.profesionales > 0 ? "Completar matrícula" : "Cargar profesional",
        accion: () => onNavigate("professionals"),
      },
      {
        id: "servicios",
        titulo: "Poné tus precios",
        paraQue: "Qué tratamientos hacés, cuánto duran y cuánto cobrás. Dejamos precios de ejemplo.",
        icono: ClipboardList,
        hecho: datos.servicios > 0 && !!manual.servicios,
        cta: "Revisar precios",
        accion: () => onNavigate("services"),
        manual: "Ya revisé mis precios",
      },
      {
        id: "obras-sociales",
        titulo: "Elegí tus obras sociales",
        paraQue: "Las que aceptás, para asignarlas a cada paciente.",
        icono: Shield,
        hecho: datos.obrasSociales > 0 || !!manual["obras-sociales"],
        cta: "Ver obras sociales",
        accion: () => onNavigate("obras-sociales"),
        manual: "Solo atiendo particulares",
      },
      {
        id: "feriados",
        titulo: `Cargá los feriados de ${anio}`,
        paraQue: "Con un clic cerrás todos los feriados nacionales para que nadie reserve esos días.",
        icono: CalendarOff,
        hecho: datos.feriadosDelAnio > 0,
        cta: "Cargar feriados",
        accion: () => onNavigate("feriados"),
      },
      {
        id: "link",
        titulo: "Compartí tu link de reservas",
        paraQue: "Pegalo en tu Instagram, Google y WhatsApp: tus pacientes reservan solos, las 24 horas.",
        icono: CalendarCheck,
        hecho: !!manual.link,
        cta: linkCopiado ? "¡Link copiado!" : "Copiar mi link",
        accion: copiarLink,
      },
      {
        id: "paciente",
        titulo: "Cargá tu primer paciente",
        paraQue: "Su ficha guarda datos, obra social, historia clínica y pagos.",
        icono: UserPlus,
        hecho: datos.pacientes > 0,
        cta: "Ir a Pacientes",
        accion: () => onNavigate("patients"),
      },
      {
        id: "turno",
        titulo: "Dá tu primer turno",
        paraQue: "En el Calendario, tocá un horario libre y elegí el paciente.",
        icono: CalendarPlus,
        hecho: datos.turnos > 0,
        cta: "Abrir Calendario",
        accion: () => onNavigate("calendar"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [datos, manual, linkCopiado, slug],
  )

  const hechos = pasos.filter((p) => p.hecho).length
  const total = pasos.length
  const siguiente = pasos.find((p) => !p.hecho)
  const progreso = Math.round((hechos / total) * 100)

  // Al completar todo se festeja un momento y la guía se va sola.
  useEffect(() => {
    if (siguiente) return
    const t = setTimeout(onOcultar, 6000)
    return () => clearTimeout(t)
  }, [siguiente, onOcultar])

  if (!siguiente) {
    return (
      <section className="mb-6 flex items-center gap-4 rounded-[22px] bg-[#0B2440] px-6 py-5 text-white dq-fade-in" aria-live="polite">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
          <PartyPopper size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold">¡Tu clínica quedó lista!</h2>
          <p className="text-[14px] text-white/65">Completaste todos los pasos. Si algún día te perdés, tocá “Ayuda” arriba a la derecha.</p>
        </div>
        <button type="button" onClick={onOcultar} aria-label="Cerrar" className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
          <X size={18} />
        </button>
      </section>
    )
  }

  const IconoSiguiente = siguiente.icono

  return (
    <section className="mb-6 overflow-hidden rounded-[24px] border border-[#DCE5EE] bg-white shadow-[0_24px_50px_-36px_#0B2440] dq-fade-in" aria-labelledby="guia-inicio-titulo">
      {/* Encabezado oscuro */}
      <div className="relative overflow-hidden bg-[#0B2440] px-5 py-5 text-white sm:px-7 sm:py-6">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0" aria-hidden="true">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="23" fill="none" stroke="#2458ED" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 23}
                  strokeDashoffset={2 * Math.PI * 23 * (1 - progreso / 100)}
                  className="transition-[stroke-dashoffset] duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold">{hechos}/{total}</span>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-[#8FB2FF]">Guía de inicio</p>
              <h2 id="guia-inicio-titulo" className="text-[19px] font-semibold leading-tight tracking-[-0.02em] sm:text-[21px]">
                {hechos === 0 ? "Dejá tu clínica lista, paso a paso" : `Vas muy bien: te ${total - hechos === 1 ? "falta 1 paso" : `faltan ${total - hechos} pasos`}`}
              </h2>
              <p className="mt-0.5 text-[13.5px] text-white/65">Cada botón te lleva directo a donde tenés que ir.</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onRecorrido}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[13.5px] font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              <Compass size={16} /> Ver recorrido del panel
            </button>
            <button type="button" onClick={onOcultar} title="Ocultar guía" aria-label="Ocultar guía" className="rounded-xl p-2.5 text-white/50 hover:bg-white/10 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
        {/* Siguiente paso, bien grande */}
        <div className="border-b border-[#EEF2F7] p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <p className="text-[12.5px] font-semibold uppercase tracking-wide text-[#2458ED]">Siguiente paso</p>
          <div className="mt-3 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2458ED]">
              <IconoSiguiente size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.01em] text-[#0B2440]">{siguiente.titulo}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#53677E]">{siguiente.paraQue}</p>
              {siguiente.aviso && <p className="mt-2 text-[14px] font-semibold text-amber-700">{siguiente.aviso}</p>}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 sm:pl-16">
            <button
              type="button"
              onClick={siguiente.accion}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2458ED] px-6 py-3.5 text-[15.5px] font-semibold text-white shadow-[0_12px_26px_-12px_#2458ED] hover:bg-[#1744CD]"
            >
              {siguiente.id === "link" && <Copy size={17} />}
              {siguiente.cta}
              {siguiente.id !== "link" && <ArrowRight size={17} />}
            </button>
            {siguiente.manual && (
              <button type="button" onClick={() => marcar(siguiente.id)} className="rounded-xl px-3 py-3 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
                {siguiente.manual}
              </button>
            )}
          </div>
        </div>

        {/* Todos los pasos */}
        <ol className="divide-y divide-[#EEF2F7]">
          {pasos.map((p, i) => {
            const esSiguiente = p.id === siguiente.id
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={p.accion}
                  className={`flex w-full items-center gap-3.5 px-5 py-3 text-left transition-colors sm:px-6 ${esSiguiente ? "bg-[#F5F8FF]" : "hover:bg-[#F8FAFF]"}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                      p.hecho ? "bg-emerald-500 text-white" : esSiguiente ? "bg-[#2458ED] text-white" : "bg-[#EEF2F7] text-[#65788D]"
                    }`}
                    aria-hidden="true"
                  >
                    {p.hecho ? <Check size={15} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`min-w-0 flex-1 text-[14.5px] ${p.hecho ? "text-[#65788D] line-through decoration-[#B9C6D6]" : "font-semibold text-[#0B2440]"}`}>
                    {p.titulo}
                    <span className="sr-only">{p.hecho ? " (listo)" : " (pendiente)"}</span>
                  </span>
                  {p.hecho ? (
                    <span className="shrink-0 text-[12.5px] font-semibold text-emerald-600">Listo</span>
                  ) : (
                    <ArrowRight size={16} className={`shrink-0 ${esSiguiente ? "text-[#2458ED]" : "text-[#B9C6D6]"}`} />
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
