import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react"

/**
 * Recorrido por el panel: oscurece la pantalla, ilumina una parte del menú
 * por vez y explica para qué sirve. Los elementos se marcan con
 * `data-tour="..."` (ver AdminLayout).
 */

interface PasoRecorrido {
  /** Valor de data-tour del elemento a iluminar; sin target es una tarjeta centrada. */
  target?: string
  titulo: string
  texto: string
}

const PASOS: PasoRecorrido[] = [
  {
    titulo: "¡Bienvenido a tu panel!",
    texto: "En menos de un minuto te mostramos dónde está cada cosa. Podés salir cuando quieras y volver a verlo desde “Ayuda”.",
  },
  { target: "nav-dashboard", titulo: "Inicio", texto: "Tu resumen del día: los turnos de hoy y la guía para terminar de configurar la clínica." },
  { target: "nav-calendar", titulo: "Calendario", texto: "Tu agenda. Elegí el día y tocá un horario libre para dar un turno." },
  { target: "nav-patients", titulo: "Pacientes", texto: "La ficha de cada paciente: datos, obra social, historia clínica, odontograma y pagos." },
  {
    target: "nav-settings",
    titulo: "Datos de la clínica",
    texto: "Dirección, teléfono, horarios de atención y datos para cobrar. Si algo de tu consultorio cambia, lo cambiás acá.",
  },
  { target: "nav-professionals", titulo: "Profesionales", texto: "Quiénes atienden, con su matrícula y sus propios días y horarios." },
  { target: "nav-feriados", titulo: "Feriados", texto: "Cargá todos los feriados del año con un clic. Esos días nadie puede reservar." },
  { target: "nav-cashflow", titulo: "Flujo de caja", texto: "Lo que cobrás y lo que gastás, día por día." },
  { target: "header-ayuda", titulo: "Ayuda", texto: "¿Te perdiste? Tocá acá y te mostramos este recorrido de nuevo." },
  {
    titulo: "¡Eso es todo!",
    texto: "Seguí la guía de inicio del panel: cada paso te lleva directo a donde tenés que ir.",
  },
]

const MARGEN = 8
const ANCHO_TARJETA = 340

type Caja = { top: number; left: number; width: number; height: number }

const visible = (r: DOMRect) =>
  r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < window.innerWidth && r.top < window.innerHeight

export const RecorridoPanel: React.FC<{ onTerminar: () => void }> = ({ onTerminar }) => {
  // Solo los pasos cuyo elemento existe para este rol (una recepcionista no ve Configuración).
  const pasos = useMemo(
    () => PASOS.filter((p) => !p.target || document.querySelector(`[data-tour="${p.target}"]`)),
    [],
  )
  const [indice, setIndice] = useState(0)
  const [caja, setCaja] = useState<Caja | null>(null)
  const [posTarjeta, setPosTarjeta] = useState<{ top: number; left: number } | null>(null)
  const tarjetaRef = useRef<HTMLDivElement>(null)
  const botonSiguienteRef = useRef<HTMLButtonElement>(null)
  const paso = pasos[indice]
  const esUltimo = indice === pasos.length - 1

  const medir = useCallback(() => {
    if (!paso?.target) {
      setCaja(null)
      return
    }
    // Puede haber más de uno (Ayuda está en la barra del celular y en la de
    // escritorio): se ilumina el que se ve.
    const candidatos = [...document.querySelectorAll<HTMLElement>(`[data-tour="${paso.target}"]`)]
    const el = candidatos.find((c) => {
      c.scrollIntoView({ block: "nearest" })
      return visible(c.getBoundingClientRect())
    })
    if (!el) {
      setCaja(null)
      return
    }
    const r = el.getBoundingClientRect()
    setCaja({ top: r.top - MARGEN / 2, left: r.left - MARGEN / 2, width: r.width + MARGEN, height: r.height + MARGEN })
  }, [paso])

  useLayoutEffect(() => {
    medir()
  }, [medir])

  useEffect(() => {
    window.addEventListener("resize", medir)
    return () => window.removeEventListener("resize", medir)
  }, [medir])

  // Ubica la tarjeta al costado del elemento iluminado (o centrada si no hay).
  useLayoutEffect(() => {
    const tarjeta = tarjetaRef.current
    if (!tarjeta) return
    const alto = tarjeta.offsetHeight
    const ancho = Math.min(ANCHO_TARJETA, window.innerWidth - 32)
    if (!caja) {
      setPosTarjeta(null)
      return
    }
    const centroY = caja.top + caja.height / 2
    const top = Math.min(Math.max(16, centroY - alto / 2), window.innerHeight - alto - 16)
    if (caja.left + caja.width + 18 + ancho < window.innerWidth) {
      setPosTarjeta({ top, left: caja.left + caja.width + 18 })
    } else if (caja.left - 18 - ancho > 0) {
      setPosTarjeta({ top, left: caja.left - 18 - ancho })
    } else {
      const debajo = caja.top + caja.height + 14
      setPosTarjeta({
        top: debajo + alto < window.innerHeight ? debajo : Math.max(16, caja.top - alto - 14),
        left: Math.min(Math.max(16, caja.left), window.innerWidth - ancho - 16),
      })
    }
  }, [caja, indice])

  useEffect(() => {
    botonSiguienteRef.current?.focus()
  }, [indice])

  const siguiente = useCallback(() => (esUltimo ? onTerminar() : setIndice((i) => i + 1)), [esUltimo, onTerminar])
  const anterior = useCallback(() => setIndice((i) => Math.max(0, i - 1)), [])

  useEffect(() => {
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") onTerminar()
      if (e.key === "ArrowRight") siguiente()
      if (e.key === "ArrowLeft") anterior()
    }
    window.addEventListener("keydown", teclas)
    return () => window.removeEventListener("keydown", teclas)
  }, [siguiente, anterior, onTerminar])

  if (!paso) return null
  const sinMenuVisible = !!paso.target && !caja

  return createPortal(
    <>
      {/* Capa que bloquea clics mientras dura el recorrido */}
      <div className={`fixed inset-0 z-[9997] ${caja ? "" : "bg-[#0B2440]/60 backdrop-blur-[2px]"}`} onClick={(e) => e.stopPropagation()} aria-hidden="true" />
      {caja && <div className="dq-tour-spot" style={caja} aria-hidden="true" />}

      <div
        ref={tarjetaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recorrido-titulo"
        aria-describedby="recorrido-texto"
        className="fixed z-[9999] rounded-[20px] bg-white p-5 shadow-[0_30px_60px_-20px_#0B244080] dq-fade-in"
        style={{
          width: Math.min(ANCHO_TARJETA, window.innerWidth - 32),
          ...(posTarjeta
            ? { top: posTarjeta.top, left: posTarjeta.left }
            // Centrada con inset + margin auto: un transform lo pisaría la animación de entrada.
            : { inset: 0, margin: "auto", height: "fit-content" }),
        }}
        key={indice}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[12px] font-semibold text-[#2458ED]">
            <Compass size={13} /> {indice + 1} de {pasos.length}
          </span>
          <button type="button" onClick={onTerminar} aria-label="Salir del recorrido" className="-mr-1 -mt-1 rounded-lg p-1.5 text-[#93A3B8] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
            <X size={17} />
          </button>
        </div>
        <h2 id="recorrido-titulo" className="mt-3 text-[19px] font-semibold tracking-[-0.02em] text-[#0B2440]">{paso.titulo}</h2>
        <p id="recorrido-texto" className="mt-1.5 text-[15px] leading-relaxed text-[#53677E]">{paso.texto}</p>
        {sinMenuVisible && (
          <p className="mt-2 text-[13.5px] text-[#65788D]">En el celular, lo encontrás en el menú ☰ de arriba a la izquierda.</p>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          {indice > 0 ? (
            <button type="button" onClick={anterior} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF]">
              <ArrowLeft size={16} /> Anterior
            </button>
          ) : (
            <button type="button" onClick={onTerminar} className="rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF]">
              Ahora no
            </button>
          )}
          <button
            ref={botonSiguienteRef}
            type="button"
            onClick={siguiente}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2458ED] px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-[#1744CD]"
          >
            {indice === 0 ? "Empezar" : esUltimo ? "Terminar" : "Siguiente"}
            {esUltimo ? <Check size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>

        {/* Puntitos de progreso */}
        <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
          {pasos.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === indice ? "w-5 bg-[#2458ED]" : i < indice ? "w-1.5 bg-[#2458ED]/40" : "w-1.5 bg-[#DCE5EE]"}`} />
          ))}
        </div>
      </div>
    </>,
    document.body,
  )
}
