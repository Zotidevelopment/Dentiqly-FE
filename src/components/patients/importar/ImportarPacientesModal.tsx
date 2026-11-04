// Importador de pacientes: Excel, CSV, ODS, SQL, DBF, JSON, HTML/XML.
// El archivo se lee en el navegador (src/lib/importador); al backend solo van
// los pacientes confirmados, en lotes.
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, FileSpreadsheet, Loader2, Lock, RotateCcw, Upload, X } from "lucide-react"
import {
  EXTENSIONES, ErrorImportacion, armarFilas, claveObraSocial, codigosSexoDelTitulo, detectarOrdenFechas, leerArchivo, limpiar,
  mapearAutomaticamente, opcionesIniciales, sugerirObrasSociales, tablaDesdeGrilla, tablaMasProbable, validarPaciente, valoresDistintos,
  campoPorId, type Destino, type FilaRevisada, type ObraSocialClinica, type Opciones, type PacienteImportado, type ResultadoLectura, type Tabla,
} from "../../../lib/importador"
import {
  ErrorLote, borrarUltimaImportacion, descargar, enviarEnLotes, filasAEnviar, guardarUltimaImportacion, informeCsv, paraEnviar, plantillaCsv,
} from "../../../lib/importador/enviar"
import { pacientesApi, type ModoDuplicados, type ResultadoFilaImportacion, type ResultadoImportacion } from "../../../api/pacientes"
import { obrasSocialesApi } from "../../../api"
import { PasoColumnas } from "./PasoColumnas"
import { PasoRevisar } from "./PasoRevisar"
import { Boton, fmt } from "./ui"

type Paso = "archivo" | "columnas" | "revisar" | "importando" | "listo"
const PASOS: { id: Paso; titulo: string }[] = [
  { id: "archivo", titulo: "Archivo" },
  { id: "columnas", titulo: "Columnas" },
  { id: "revisar", titulo: "Revisión" },
  { id: "listo", titulo: "Listo" },
]

const nuevoId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16))

interface Props {
  abierto: boolean
  onCerrar: () => void
  /** Se llama cuando terminó una importación (para refrescar la lista). */
  onImportado: () => void
}

export function ImportarPacientesModal({ abierto, onCerrar, onImportado }: Props) {
  const [paso, setPaso] = useState<Paso>("archivo")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [lectura, setLectura] = useState<ResultadoLectura | null>(null)
  const [tablaIdx, setTablaIdx] = useState(0)
  const [tabla, setTabla] = useState<Tabla | null>(null)
  const [filaCabecera, setFilaCabecera] = useState(-1)
  const [mapeo, setMapeo] = useState<Destino[]>([])
  const [mapeoAuto, setMapeoAuto] = useState<Destino[]>([])
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [ediciones, setEdiciones] = useState<Record<number, Partial<PacienteImportado>>>({})
  const [obrasClinica, setObrasClinica] = useState<ObraSocialClinica[]>([])
  const [leyendo, setLeyendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicados, setDuplicados] = useState<ModoDuplicados>("omitir")
  const [simulacion, setSimulacion] = useState<Map<number, ResultadoFilaImportacion> | null>(null)
  const [simulando, setSimulando] = useState(false)
  const [errorSimulacion, setErrorSimulacion] = useState<string | null>(null)
  const [progreso, setProgreso] = useState({ enviados: 0, total: 0 })
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)
  const [pendiente, setPendiente] = useState<ErrorLote | null>(null)
  const [deshecho, setDeshecho] = useState<{ eliminados: number; conservados: number } | null>(null)
  const [deshaciendo, setDeshaciendo] = useState(false)
  const importacionId = useRef(nuevoId())
  const versionSimulacion = useRef(0)

  // Obras sociales de la clínica (para vincular las del archivo).
  useEffect(() => {
    if (!abierto) return
    obrasSocialesApi.listar().then((l) => setObrasClinica((l ?? []).map((o) => ({ id: o.id, nombre: o.nombre })))).catch(() => setObrasClinica([]))
  }, [abierto])

  const reiniciar = useCallback(() => {
    setPaso("archivo"); setArchivo(null); setLectura(null); setTabla(null); setMapeo([]); setOpciones(null); setEdiciones({})
    setError(null); setSimulacion(null); setErrorSimulacion(null); setResultado(null); setPendiente(null); setDeshecho(null); setDuplicados("omitir")
    importacionId.current = nuevoId()
  }, [])

  /** Prepara mapeo y opciones automáticos para una tabla. */
  const prepararTabla = useCallback((t: Tabla) => {
    const auto = mapearAutomaticamente(t)
    const ops = opcionesIniciales(t, auto)
    const colObra = auto.indexOf("obra_social")
    if (colObra >= 0) ops.valoresObraSocial = sugerirObrasSociales(valoresDistintos(t, colObra, (v) => claveObraSocial(limpiar(v))), obrasClinica)
    setTabla(t); setMapeo(auto); setMapeoAuto(auto); setOpciones(ops); setEdiciones({}); setSimulacion(null)
    setFilaCabecera(t.filaCabecera ?? -1)
  }, [obrasClinica])

  const elegirArchivo = async (f: File) => {
    setError(null); setLeyendo(true); setArchivo(f)
    try {
      const r = await leerArchivo(f)
      const i = tablaMasProbable(r.tablas)
      setLectura(r); setTablaIdx(i)
      prepararTabla(r.tablas[i])
      setPaso("columnas")
    } catch (e) {
      setError(e instanceof ErrorImportacion ? e.message : "No pudimos leer el archivo. Si viene de otro sistema, probá exportarlo a Excel o CSV, o mandánoslo y lo importamos nosotros.")
      setArchivo(null)
    } finally {
      setLeyendo(false)
    }
  }

  const cambiarTabla = (i: number) => {
    if (!lectura) return
    setTablaIdx(i)
    prepararTabla(lectura.tablas[i])
  }
  const cambiarCabecera = (fila: number) => {
    if (!lectura) return
    const base = lectura.tablas[tablaIdx]
    if (!base.grilla) return
    prepararTabla(tablaDesdeGrilla(base.nombre, base.grilla, fila))
  }

  const cambiarDestino = (col: number, d: Destino) => {
    if (!tabla || !opciones) return
    const nuevo = [...mapeo]
    // Un campo simple solo puede venir de una columna: la otra pasa a "Información adicional".
    if (d !== "extra" && d !== "ignorar" && !campoPorId.get(d)?.multiple) {
      nuevo.forEach((x, i) => { if (x === d && i !== col) nuevo[i] = "extra" })
    }
    nuevo[col] = d
    setMapeo(nuevo)
    const ops = { ...opciones }
    if (d === "obra_social") ops.valoresObraSocial = sugerirObrasSociales(valoresDistintos(tabla, col, (v) => claveObraSocial(limpiar(v))), obrasClinica)
    if (d === "sexo") ops.valoresSexo = codigosSexoDelTitulo(tabla.columnas[col] ?? "")
    if (d === "fecha_nacimiento") ops.ordenFechas = detectarOrdenFechas(tabla.filas.map((f) => f[col] ?? null))
    setOpciones(ops)
    setSimulacion(null)
  }

  const filas: FilaRevisada[] = useMemo(() => {
    if (!tabla || !opciones) return []
    const base = armarFilas(tabla, mapeo, opciones)
    for (const [k, cambios] of Object.entries(ediciones)) {
      const f = base[Number(k)]
      if (!f) continue
      f.paciente = { ...f.paciente, ...cambios }
      f.errores = validarPaciente(f.paciente, opciones)
    }
    return base
  }, [tabla, mapeo, opciones, ediciones])

  const enviables = useMemo(() => (opciones ? filasAEnviar(filas).map((f) => paraEnviar(f, opciones)) : []), [filas, opciones])

  /** Simulación: compara con los pacientes que ya existen (no guarda nada). */
  const simular = useCallback(async () => {
    const version = ++versionSimulacion.current
    setSimulando(true); setErrorSimulacion(null)
    try {
      const r = await enviarEnLotes(pacientesApi.importar, enviables, { importacionId: importacionId.current, duplicados: "omitir", crearObras: false, simulacion: true })
      if (version === versionSimulacion.current) setSimulacion(new Map(r.resultados.map((x) => [x.fila, x])))
    } catch (e) {
      if (version === versionSimulacion.current) setErrorSimulacion(e instanceof Error ? e.message : "error de conexión")
    } finally {
      if (version === versionSimulacion.current) setSimulando(false)
    }
  }, [enviables])

  // Al entrar a la revisión (o si cambian los pacientes), se vuelve a comparar.
  const claveSimulacion = useMemo(() => enviables.map((e) => e.numero_documento ?? "").join("|"), [enviables])
  useEffect(() => {
    if (paso !== "revisar" || !enviables.length) return
    const t = setTimeout(simular, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso, claveSimulacion])

  const importar = async (continuar?: ErrorLote) => {
    if (!opciones) return
    setPaso("importando"); setPendiente(null)
    setProgreso({ enviados: continuar?.desde ?? 0, total: enviables.length })
    try {
      const r = await enviarEnLotes(
        pacientesApi.importar,
        enviables,
        { importacionId: importacionId.current, duplicados, crearObras: true, simulacion: false },
        (enviados, total) => setProgreso({ enviados, total }),
        undefined,
        continuar ? { parcial: continuar.parcial, desde: continuar.desde } : undefined,
      )
      setResultado(r)
      if (r.resumen.creados > 0) guardarUltimaImportacion({ id: r.importacion_id, fecha: new Date().toISOString(), creados: r.resumen.creados, archivo: archivo?.name ?? "" })
      setPaso("listo")
      onImportado()
    } catch (e) {
      if (e instanceof ErrorLote) { setPendiente(e); setResultado(e.parcial) }
      else setError(e instanceof Error ? e.message : "Error inesperado")
      if (!(e instanceof ErrorLote)) setPaso("revisar")
      onImportado()
    }
  }

  const deshacer = async () => {
    if (!resultado) return
    if (!window.confirm(`¿Deshacer la importación? Se borran los ${fmt(resultado.resumen.creados)} pacientes que se crearon recién (los que ya tengan turnos u otros datos cargados se conservan). Los pacientes actualizados no cambian.`)) return
    setDeshaciendo(true)
    try {
      const r = await pacientesApi.deshacerImportacion(resultado.importacion_id)
      setDeshecho(r)
      borrarUltimaImportacion()
      onImportado()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "No se pudo deshacer")
    } finally {
      setDeshaciendo(false)
    }
  }

  const cerrar = () => {
    if (paso === "importando") return
    if ((paso === "columnas" || paso === "revisar") && !window.confirm("¿Salir sin importar? Vas a perder lo que configuraste.")) return
    reiniciar()
    onCerrar()
  }

  useEffect(() => {
    if (!abierto) return
    const alSalir = (e: BeforeUnloadEvent) => { if (paso === "importando") { e.preventDefault(); e.returnValue = "" } }
    window.addEventListener("beforeunload", alSalir)
    return () => window.removeEventListener("beforeunload", alSalir)
  }, [abierto, paso])

  if (!abierto) return null
  const tieneNombre = mapeo.some((d) => d === "nombre_completo" || d === "apellido" || d === "nombre")
  const indicePaso = paso === "importando" ? 2 : PASOS.findIndex((p) => p.id === paso)

  // Portal al body: la página de pacientes tiene contenedores que recortan los "fixed".
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0B2440]/45 p-2 backdrop-blur-sm sm:p-4" style={{ fontFamily: "\"Instrument Sans\", system-ui, sans-serif" }}>
      <div className="flex h-[min(94vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Importar pacientes">
        {/* Encabezado */}
        <div className="flex items-center gap-4 border-b border-[#DCE5EE] px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold text-[#0B2440]">Importar pacientes</h2>
            <p className="truncate text-[12px] text-[#65788D]">
              {archivo && lectura ? <>{archivo.name} · {lectura.formato}{tabla ? ` · ${fmt(tabla.filas.length)} filas` : ""}</> : "Desde Excel, CSV, otro sistema o una planilla armada a mano"}
            </p>
          </div>
          <ol className="hidden items-center gap-1.5 md:flex">
            {PASOS.map((p, i) => (
              <li key={p.id} className="flex items-center gap-1.5">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${i < indicePaso ? "bg-emerald-500 text-white" : i === indicePaso ? "bg-[#2458ED] text-white" : "bg-slate-100 text-slate-400"}`}>{i < indicePaso ? "✓" : i + 1}</span>
                <span className={`text-[12px] font-medium ${i === indicePaso ? "text-[#0B2440]" : "text-[#8A93A8]"}`}>{p.titulo}</span>
                {i < PASOS.length - 1 && <span className="mx-1 h-px w-5 bg-[#DCE5EE]" />}
              </li>
            ))}
          </ol>
          <button type="button" onClick={cerrar} disabled={paso === "importando"} className="rounded-lg p-1.5 text-[#65788D] hover:bg-slate-100 disabled:opacity-30" aria-label="Cerrar"><X size={18} /></button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {error && paso !== "archivo" && (
            <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"><AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}</div>
          )}
          {paso === "archivo" && <PasoArchivo leyendo={leyendo} error={error} onArchivo={elegirArchivo} />}
          {paso === "columnas" && tabla && opciones && lectura && (
            <>
              {lectura.avisos.map((a) => <div key={a} className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12.5px] text-amber-900">{a}</div>)}
              <PasoColumnas
                tabla={tabla} tablas={lectura.tablas} tablaIdx={tablaIdx} onTabla={cambiarTabla}
                filaCabecera={filaCabecera} onFilaCabecera={cambiarCabecera}
                mapeo={mapeo} mapeoAuto={mapeoAuto} onDestino={cambiarDestino}
                opciones={opciones} onOpciones={(o) => { setOpciones(o); setSimulacion(null) }}
                obrasClinica={obrasClinica} filas={filas}
              />
            </>
          )}
          {paso === "revisar" && opciones && (
            <PasoRevisar
              filas={filas} opciones={opciones} onOpciones={setOpciones}
              duplicados={duplicados} onDuplicados={setDuplicados}
              simulacion={simulacion} simulando={simulando} errorSimulacion={errorSimulacion}
              onEditar={(i, c) => setEdiciones((e) => ({ ...e, [i]: { ...e[i], ...c } }))}
            />
          )}
          {paso === "importando" && (
            <Importando progreso={progreso} pendiente={pendiente} parcial={resultado} onContinuar={() => pendiente && importar(pendiente)} onTerminar={() => { setPaso("listo") }} />
          )}
          {paso === "listo" && resultado && (
            <Listo resultado={resultado} filas={filas} archivo={archivo?.name ?? "pacientes"} deshecho={deshecho} deshaciendo={deshaciendo} onDeshacer={deshacer} />
          )}
        </div>

        {/* Pie */}
        {(paso === "columnas" || paso === "revisar" || paso === "listo") && (
          <div className="flex items-center justify-between gap-3 border-t border-[#DCE5EE] bg-[#FBFCFF] px-5 py-3">
            {paso === "columnas" && <Boton variante="secundario" onClick={reiniciar}><ArrowLeft size={15} /> Otro archivo</Boton>}
            {paso === "revisar" && <Boton variante="secundario" onClick={() => setPaso("columnas")}><ArrowLeft size={15} /> Columnas</Boton>}
            {paso === "listo" && <Boton variante="secundario" onClick={reiniciar}><Upload size={15} /> Importar otro archivo</Boton>}
            <div className="flex items-center gap-3">
              {paso === "columnas" && (
                <>
                  <span className="hidden text-[12px] text-[#65788D] sm:inline">{fmt(filasAEnviar(filas).length)} de {fmt(filas.length)} filas listas</span>
                  <Boton disabled={!tieneNombre} onClick={() => { setError(null); setPaso("revisar") }}>Revisar pacientes <ArrowRight size={15} /></Boton>
                </>
              )}
              {paso === "revisar" && (
                <Boton disabled={!enviables.length} onClick={() => importar()}>
                  Importar {fmt(enviables.length)} pacientes <ArrowRight size={15} />
                </Boton>
              )}
              {paso === "listo" && <Boton onClick={() => { reiniciar(); onCerrar() }}>Ver pacientes</Boton>}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function PasoArchivo({ leyendo, error, onArchivo }: { leyendo: boolean; error: string | null; onArchivo: (f: File) => void }) {
  const [arrastrando, setArrastrando] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); const f = e.dataTransfer.files[0]; if (f) onArchivo(f) }}
        onClick={() => !leyendo && input.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${arrastrando ? "border-[#2458ED] bg-[#EAF2FF]" : "border-[#C9D6E8] bg-[#F8FAFF] hover:border-[#2458ED]/60"}`}
      >
        <input ref={input} type="file" accept={EXTENSIONES} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onArchivo(f); e.target.value = "" }} />
        {leyendo ? (
          <><Loader2 size={34} className="animate-spin text-[#2458ED]" /><p className="mt-3 text-[14px] font-semibold text-[#0B2440]">Leyendo el archivo…</p></>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm"><FileSpreadsheet size={28} className="text-[#2458ED]" /></div>
            <p className="mt-4 text-[15px] font-bold text-[#0B2440]">Arrastrá tu archivo o hacé clic para elegirlo</p>
            <p className="mt-1 text-[13px] text-[#65788D]">Excel, CSV, Google Sheets, LibreOffice, copias de seguridad .sql, archivos .dbf de sistemas viejos o JSON</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {[".xlsx", ".csv", ".ods", ".sql", ".dbf", ".json", ".txt", ".xml / .html"].map((x) => <span key={x} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-[#4B5568] shadow-sm">{x}</span>)}
            </div>
          </>
        )}
      </div>

      {error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#DCE5EE] p-4">
          <div className="text-[13px] font-semibold text-[#0B2440]">¿Venís de otro sistema?</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#65788D]">Buscá la opción “Exportar”, “Descargar pacientes” o “Copia de seguridad”. Sirve casi cualquier formato: las columnas se reconocen solas.</p>
        </div>
        <div className="rounded-2xl border border-[#DCE5EE] p-4">
          <div className="text-[13px] font-semibold text-[#0B2440]">¿Los tenés en una planilla propia?</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#65788D]">Subila como está, con tus columnas. Si estás armándola de cero, usá la planilla modelo.</p>
          <button type="button" onClick={() => descargar("planilla-modelo-pacientes.csv", plantillaCsv())} className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#2458ED] hover:underline"><Download size={14} /> Descargar planilla modelo</button>
        </div>
        <div className="rounded-2xl border border-[#2458ED]/25 bg-[#F3F7FF] p-4">
          <div className="text-[13px] font-semibold text-[#0B2440]">¿Preferís que lo hagamos nosotros?</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#65788D]">Mandanos lo que tengas (exportación, backup, PDF o fotos de fichas) y migramos tus pacientes sin costo.</p>
          <a href="mailto:hola@dentiqly.com?subject=Migraci%C3%B3n%20de%20pacientes" className="mt-2 inline-flex text-[12.5px] font-semibold text-[#2458ED] hover:underline">Escribinos a hola@dentiqly.com</a>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-[#65788D]"><Lock size={13} /> El archivo se lee en tu computadora. A Dentiqly solo llegan los pacientes que confirmes al final.</p>
    </div>
  )
}

function Importando({ progreso, pendiente, parcial, onContinuar, onTerminar }: { progreso: { enviados: number; total: number }; pendiente: ErrorLote | null; parcial: ResultadoImportacion | null; onContinuar: () => void; onTerminar: () => void }) {
  const pct = progreso.total ? Math.round((progreso.enviados / progreso.total) * 100) : 0
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
      {pendiente ? (
        <>
          <AlertTriangle size={36} className="text-amber-500" />
          <h3 className="mt-3 text-[17px] font-bold text-[#0B2440]">Se cortó la importación</h3>
          <p className="mt-1 text-[13px] text-[#65788D]">{pendiente.message}. Ya se importaron {fmt(parcial?.resumen.creados ?? 0)} pacientes. Podés continuar desde donde quedó: los que ya están no se duplican.</p>
          <div className="mt-5 flex gap-2">
            <Boton variante="secundario" onClick={onTerminar}>Terminar acá</Boton>
            <Boton onClick={onContinuar}><RotateCcw size={15} /> Continuar</Boton>
          </div>
        </>
      ) : (
        <>
          <Loader2 size={36} className="animate-spin text-[#2458ED]" />
          <h3 className="mt-3 text-[17px] font-bold text-[#0B2440]">Importando pacientes…</h3>
          <p className="mt-1 text-[13px] text-[#65788D]">{fmt(progreso.enviados)} de {fmt(progreso.total)}. No cierres esta ventana.</p>
          <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#2458ED] transition-all" style={{ width: `${Math.max(pct, 3)}%` }} /></div>
        </>
      )}
    </div>
  )
}

function Listo({ resultado, filas, archivo, deshecho, deshaciendo, onDeshacer }: { resultado: ResultadoImportacion; filas: FilaRevisada[]; archivo: string; deshecho: { eliminados: number; conservados: number } | null; deshaciendo: boolean; onDeshacer: () => void }) {
  const { creados, actualizados, omitidos, errores } = resultado.resumen
  const noImportadas = filas.filter((f) => f.errores.length).length + errores
  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      {deshecho ? (
        <>
          <RotateCcw size={40} className="mx-auto text-[#2458ED]" />
          <h3 className="mt-3 text-[20px] font-bold text-[#0B2440]">Importación deshecha</h3>
          <p className="mt-1 text-[13.5px] text-[#65788D]">Se borraron {fmt(deshecho.eliminados)} pacientes.{deshecho.conservados > 0 ? ` ${fmt(deshecho.conservados)} se conservaron porque ya tienen turnos u otros datos cargados.` : ""}</p>
        </>
      ) : (
        <>
          <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
          <h3 className="mt-3 text-[20px] font-bold text-[#0B2440]">{creados > 0 ? `¡Listo! Se importaron ${fmt(creados)} pacientes` : "Importación terminada"}</h3>
          <div className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ["Nuevos", creados, "text-emerald-700"],
              ["Actualizados", actualizados, "text-[#2458ED]"],
              ["Sin cambios", omitidos, "text-[#0B2440]"],
              ["No importados", noImportadas, noImportadas ? "text-red-700" : "text-[#0B2440]"],
            ].map(([t, n, c]) => (
              <div key={t as string} className="rounded-2xl border border-[#DCE5EE] px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#65788D]">{t}</div>
                <div className={`text-[22px] font-bold ${c}`}>{fmt(n as number)}</div>
              </div>
            ))}
          </div>
          {resultado.obras_sociales_nuevas.length > 0 && (
            <p className="mt-4 text-[13px] text-[#65788D]">Se crearon {fmt(resultado.obras_sociales_nuevas.length)} obras sociales: {resultado.obras_sociales_nuevas.slice(0, 10).join(", ")}{resultado.obras_sociales_nuevas.length > 10 ? "…" : ""}. Completales el plan y los aranceles en Obras sociales.</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Boton variante="secundario" onClick={() => descargar(`informe-importacion-${archivo.replace(/\.[^.]+$/, "")}.csv`, informeCsv(filas, resultado.resultados))}><Download size={15} /> Descargar informe fila por fila</Boton>
            {creados > 0 && <Boton variante="peligro" disabled={deshaciendo} onClick={onDeshacer}>{deshaciendo ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />} Deshacer importación</Boton>}
          </div>
          {creados > 0 && <p className="mt-3 text-[12px] text-[#8A93A8]">Si algo no quedó bien, podés deshacerla durante 7 días desde la lista de pacientes.</p>}
        </>
      )}
    </div>
  )
}
