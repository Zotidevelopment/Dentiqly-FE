import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Calendar, CalendarPlus, Check, Info, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react"
import { feriadosApi, type Feriado, type FeriadoNacional, type FeriadosNacionalesRespuesta } from "../../api/feriados"
import { pageWrapper } from "./adminDesign"
import { useToast } from "../../hooks/use-toast"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import { todayISO } from "../../utils/date"

const formatearFecha = (fecha: string, opciones: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString("es-AR", opciones)

const ETIQUETA_TIPO: Record<FeriadoNacional["tipo"], { texto: string; clase: string }> = {
  inamovible: { texto: "Feriado", clase: "bg-[#EAF2FF] text-[#2458ED]" },
  trasladable: { texto: "Feriado trasladable", clase: "bg-[#EAF2FF] text-[#2458ED]" },
  puente: { texto: "Día no laborable", clase: "bg-amber-50 text-amber-700" },
}

/* ─── Modal: cargar los feriados nacionales del año ─────────────────────── */

const ModalFeriadosNacionales: React.FC<{
  year: number
  onClose: () => void
  onCargados: (cantidad: number) => void
}> = ({ year, onClose, onCargados }) => {
  const { toast } = useToast()
  const [datos, setDatos] = useState<FeriadosNacionalesRespuesta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elegidos, setElegidos] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let vigente = true
    feriadosApi
      .nacionales(year)
      .then((r) => {
        if (!vigente) return
        setDatos(r)
        // Por defecto: todos los feriados que faltan. Los puentes no, porque
        // son optativos y muchos consultorios atienden esos días.
        setElegidos(new Set(r.feriados.filter((f) => !f.cargado && f.tipo !== "puente").map((f) => f.fecha)))
      })
      .catch((e) => vigente && setError(e instanceof Error ? e.message : "No pudimos traer los feriados"))
    return () => {
      vigente = false
    }
  }, [year])

  const pendientes = datos?.feriados.filter((f) => !f.cargado) ?? []
  const todosElegidos = pendientes.length > 0 && pendientes.every((f) => elegidos.has(f.fecha))

  const alternar = (fecha: string) =>
    setElegidos((prev) => {
      const next = new Set(prev)
      if (next.has(fecha)) next.delete(fecha)
      else next.add(fecha)
      return next
    })

  const cargar = async () => {
    if (elegidos.size === 0) return
    setGuardando(true)
    try {
      const r = await feriadosApi.importar(year, [...elegidos])
      onCargados(r.creados)
      if (r.fallidos > 0) {
        toast({ variant: "destructive", title: "Algunos no se cargaron", description: `${r.fallidos} feriados no se pudieron guardar. Probá de nuevo.` })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "No se pudieron cargar", description: e instanceof Error ? e.message : "Probá de nuevo." })
    } finally {
      setGuardando(false)
    }
  }

  // Portal: el contenedor del panel tiene transform y rompe position:fixed.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2440]/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-feriados-nacionales">
      <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_60px_-20px_#0B244066]">
        <div className="relative shrink-0 overflow-hidden bg-[#0B2440] px-6 py-5 text-white">
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[12.5px] font-semibold text-[#8FB2FF]">Argentina · {year}</p>
              <h2 id="titulo-feriados-nacionales" className="mt-1 text-[21px] font-semibold tracking-[-0.02em]">Feriados nacionales</h2>
              <p className="mt-1 text-[13.5px] text-white/70">Tildá los días que cerrás. No se van a poder reservar turnos esos días.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!datos && !error && (
            <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[#65788D]">
              <Loader2 size={18} className="animate-spin text-[#2458ED]" /> Buscando la lista oficial…
            </div>
          )}
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{error}</p>}

          {datos && (
            <>
              {datos.fuente === "calculado" && (
                <p className="mb-4 flex gap-2 rounded-xl bg-amber-50 px-4 py-3 text-[13px] leading-snug text-amber-800">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  No pudimos consultar la lista oficial, así que calculamos los feriados según la ley. Revisá que coincidan con los del Gobierno.
                </p>
              )}

              {pendientes.length > 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] text-[#65788D]">{elegidos.size} de {pendientes.length} para cargar</span>
                  <button
                    type="button"
                    onClick={() => setElegidos(todosElegidos ? new Set() : new Set(pendientes.map((f) => f.fecha)))}
                    className="text-[13px] font-semibold text-[#2458ED] hover:underline"
                  >
                    {todosElegidos ? "Destildar todos" : "Tildar todos"}
                  </button>
                </div>
              )}

              <ul className="divide-y divide-[#EEF2F7] overflow-hidden rounded-[16px] border border-[#DCE5EE]">
                {datos.feriados.map((f) => {
                  const marcado = f.cargado || elegidos.has(f.fecha)
                  const etiqueta = ETIQUETA_TIPO[f.tipo]
                  return (
                    <li key={f.fecha}>
                      <label className={`flex items-center gap-3.5 px-4 py-3 ${f.cargado ? "bg-[#F8FAFF]" : "cursor-pointer hover:bg-[#F5F8FF]"}`}>
                        <input
                          type="checkbox"
                          checked={marcado}
                          disabled={f.cargado}
                          onChange={() => alternar(f.fecha)}
                          className="h-[18px] w-[18px] shrink-0 accent-[#2458ED]"
                        />
                        <span className="w-[92px] shrink-0">
                          <span className="block text-[14px] font-semibold capitalize text-[#0B2440]">{formatearFecha(f.fecha, { day: "numeric", month: "short" })}</span>
                          <span className="block text-[12px] capitalize text-[#65788D]">{formatearFecha(f.fecha, { weekday: "long" })}</span>
                        </span>
                        <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-[#0B2440]">{f.nombre}</span>
                        {f.cargado ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700">
                            <Check size={12} strokeWidth={3} /> Ya cargado
                          </span>
                        ) : (
                          <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold sm:inline ${etiqueta.clase}`}>{etiqueta.texto}</span>
                        )}
                      </label>
                    </li>
                  )
                })}
              </ul>

              {datos.feriados.some((f) => f.tipo === "puente") && (
                <p className="mt-3 text-[12.5px] leading-snug text-[#65788D]">
                  Los <span className="font-semibold text-amber-700">días no laborables</span> (puentes turísticos) son optativos: tildalos solo si ese día no atendés.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#DCE5EE] px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF]">
            Cancelar
          </button>
          <button
            type="button"
            onClick={cargar}
            disabled={guardando || elegidos.size === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2458ED] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#1744CD] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />}
            {elegidos.size === 0 ? "Elegí al menos uno" : `Cargar ${elegidos.size} ${elegidos.size === 1 ? "feriado" : "feriados"}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ─── Pantalla de feriados ─────────────────────────────────────────────── */

export const FeriadosManager: React.FC = () => {
  const { toast } = useToast()
  const anioActual = new Date().getFullYear()
  const [feriados, setFeriados] = useState<Feriado[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(anioActual)
  const [modalManual, setModalManual] = useState(false)
  const [modalNacionales, setModalNacionales] = useState(false)
  const [formData, setFormData] = useState({ fecha: "", descripcion: "" })
  const [saving, setSaving] = useState(false)
  const [aBorrar, setABorrar] = useState<Feriado | null>(null)
  const hoy = todayISO()

  const anios = useMemo(() => [anioActual - 1, anioActual, anioActual + 1, anioActual + 2], [anioActual])

  const fetchFeriados = async () => {
    try {
      setLoading(true)
      const data = await feriadosApi.listar(selectedYear)
      setFeriados([...(data || [])].sort((a, b) => a.fecha.localeCompare(b.fecha)))
    } catch {
      setFeriados([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeriados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await feriadosApi.crear({ fecha: formData.fecha, descripcion: formData.descripcion.trim() || undefined })
      toast({ title: "Día cerrado agregado", description: `${formatearFecha(formData.fecha)} ya no se puede reservar.` })
      setModalManual(false)
      setFormData({ fecha: "", descripcion: "" })
      const year = Number(formData.fecha.slice(0, 4))
      if (year !== selectedYear && anios.includes(year)) setSelectedYear(year)
      else fetchFeriados()
    } catch (error) {
      toast({ variant: "destructive", title: "No se pudo agregar", description: error instanceof Error ? error.message : "Probá de nuevo." })
    } finally {
      setSaving(false)
    }
  }

  const borrar = async (feriado: Feriado) => {
    try {
      await feriadosApi.eliminar(feriado.id)
      toast({ title: "Feriado eliminado", description: "Ese día vuelve a estar disponible para turnos." })
      fetchFeriados()
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el feriado." })
    }
  }

  return (
    <div style={pageWrapper}>
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0B2440]">Feriados y días cerrados</h1>
          <p className="mt-1 max-w-xl text-[13.5px] text-[#65788D]">
            Los días que cargues acá quedan cerrados: no aparecen en la agenda ni en la reserva online.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedYear}
            aria-label="Año"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-10 rounded-xl border border-[#DCE5EE] bg-white px-3 text-[13.5px] font-semibold text-[#0B2440] focus:border-[#2458ED] focus:outline-none"
          >
            {anios.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setModalManual(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE5EE] bg-white px-4 text-[13.5px] font-semibold text-[#0B2440] hover:border-[#2458ED]"
          >
            <Plus size={15} /> Otro día
          </button>
          <button
            type="button"
            onClick={() => setModalNacionales(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2458ED] px-4 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-10px_#2458ED] hover:bg-[#1744CD]"
          >
            <Sparkles size={15} /> Cargar feriados nacionales
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center rounded-[18px] border border-[#DCE5EE] bg-white py-20">
          <Loader2 size={22} className="animate-spin text-[#2458ED]" />
        </div>
      ) : feriados.length === 0 ? (
        <div className="relative overflow-hidden rounded-[22px] bg-[#0B2440] px-6 py-10 text-center text-white sm:px-10">
          <div className="relative mx-auto max-w-md">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Calendar size={26} className="text-[#8FB2FF]" />
            </span>
            <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">Todavía no cargaste feriados de {selectedYear}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-white/70">
              Cargá todos los feriados nacionales con un clic. Así nadie te reserva un turno el 25 de mayo.
            </p>
            <button
              type="button"
              onClick={() => setModalNacionales(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2458ED] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#3A6BFF]"
            >
              <Sparkles size={17} /> Cargar los feriados de {selectedYear}
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#DCE5EE] bg-white">
          <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-3">
            <span className="text-[13px] font-semibold text-[#65788D]">
              {feriados.length} {feriados.length === 1 ? "día cerrado" : "días cerrados"} en {selectedYear}
            </span>
          </div>
          <ul className="divide-y divide-[#EEF2F7]">
            {feriados.map((feriado) => {
              const pasado = feriado.fecha < hoy
              return (
                <li key={feriado.id} className={`group flex items-center gap-4 px-5 py-3.5 ${pasado ? "opacity-55" : ""}`}>
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EAF2FF] leading-none text-[#2458ED]">
                    <span className="text-[16px] font-bold">{Number(feriado.fecha.slice(8, 10))}</span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase">{formatearFecha(feriado.fecha, { month: "short" }).replace(".", "")}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-[#0B2440]">{feriado.descripcion || "Día cerrado"}</span>
                    <span className="block text-[12.5px] text-[#65788D] first-letter:uppercase">
                      {formatearFecha(feriado.fecha)}{pasado ? " · ya pasó" : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setABorrar(feriado)}
                    aria-label={`Eliminar ${feriado.descripcion || "feriado"} del ${formatearFecha(feriado.fecha)}`}
                    className="rounded-lg p-2 text-[#93A3B8] hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {modalNacionales && (
        <ModalFeriadosNacionales
          year={selectedYear}
          onClose={() => setModalNacionales(false)}
          onCargados={(cantidad) => {
            setModalNacionales(false)
            toast({
              title: cantidad > 0 ? `¡Listo! Cargamos ${cantidad} ${cantidad === 1 ? "feriado" : "feriados"}` : "Ya estaban todos cargados",
              description: cantidad > 0 ? "Esos días quedan cerrados en la agenda y en la reserva online." : undefined,
            })
            fetchFeriados()
          }}
        />
      )}

      {aBorrar && (
        <ConfirmationModal
          isOpen
          onClose={() => setABorrar(null)}
          onConfirm={() => {
            borrar(aBorrar)
            setABorrar(null)
          }}
          title="¿Eliminar este feriado?"
          message={`${formatearFecha(aBorrar.fecha)} vuelve a quedar disponible para turnos.`}
          confirmText="Eliminar"
          variant="destructive"
        />
      )}

      {modalManual && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2440]/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-dia-cerrado">
          <form onSubmit={handleCreate} className="w-full max-w-[420px] overflow-hidden rounded-[20px] bg-white shadow-[0_30px_60px_-20px_#0B244066]">
            <div className="flex items-center justify-between border-b border-[#EEF2F7] px-6 py-4">
              <h3 id="titulo-dia-cerrado" className="text-[17px] font-semibold text-[#0B2440]">Cerrar un día</h3>
              <button type="button" onClick={() => setModalManual(false)} aria-label="Cerrar" className="rounded-lg p-1.5 text-[#93A3B8] hover:bg-[#F5F8FF]">
                <X size={17} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-[13.5px] text-[#65788D]">Para feriados provinciales, vacaciones o cualquier día que no atiendas.</p>
              <div>
                <label htmlFor="feriado-fecha" className="mb-1.5 block text-[13px] font-semibold text-[#0B2440]">Fecha</label>
                <input id="feriado-fecha" type="date" required value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full rounded-xl border border-[#DCE5EE] px-3.5 py-2.5 text-[14px] text-[#0B2440] focus:border-[#2458ED] focus:outline-none focus:ring-2 focus:ring-[#2458ED]/15" />
              </div>
              <div>
                <label htmlFor="feriado-desc" className="mb-1.5 block text-[13px] font-semibold text-[#0B2440]">Motivo <span className="font-normal text-[#93A3B8]">(opcional)</span></label>
                <input id="feriado-desc" type="text" maxLength={200} placeholder="Ej: Feriado provincial, vacaciones" value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full rounded-xl border border-[#DCE5EE] px-3.5 py-2.5 text-[14px] text-[#0B2440] focus:border-[#2458ED] focus:outline-none focus:ring-2 focus:ring-[#2458ED]/15" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#EEF2F7] px-6 py-4">
              <button type="button" onClick={() => setModalManual(false)} className="rounded-xl px-4 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF]">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#2458ED] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#1744CD] disabled:opacity-60">
                {saving && <Loader2 size={15} className="animate-spin" />} Cerrar ese día
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </div>
  )
}
