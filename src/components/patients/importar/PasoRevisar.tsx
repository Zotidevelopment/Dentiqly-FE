import { useMemo, useState } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { FilaRevisada, Opciones, PacienteImportado } from "../../../lib/importador"
import type { ModoDuplicados, ResultadoFilaImportacion } from "../../../api/pacientes"
import { Opcion, Pildora, Tarjeta, fmt } from "./ui"

type Filtro = "todos" | "listos" | "existentes" | "avisos" | "errores" | "repetidos"
const POR_PAGINA = 50

interface Props {
  filas: FilaRevisada[]
  opciones: Opciones
  onOpciones: (o: Opciones) => void
  duplicados: ModoDuplicados
  onDuplicados: (m: ModoDuplicados) => void
  simulacion: Map<number, ResultadoFilaImportacion> | null
  simulando: boolean
  errorSimulacion: string | null
  onEditar: (indice: number, cambios: Partial<PacienteImportado>) => void
}

const esExistente = (r?: ResultadoFilaImportacion) => r?.resultado === "omitido" && r.motivo === "Ya existe un paciente con ese DNI"

/** Agrupa los avisos parecidos ("Sexo no reconocido (1)", "Sexo no reconocido (2)") para mostrarlos juntos. */
function avisosComunes(filas: FilaRevisada[]) {
  const mapa = new Map<string, number>()
  for (const f of filas) for (const a of f.avisos) { const k = a.replace(/\s*\(.*\)$/, "").replace(/fila \d+/, "otra fila"); mapa.set(k, (mapa.get(k) ?? 0) + 1) }
  return [...mapa].sort((a, b) => b[1] - a[1]).slice(0, 6)
}

export function PasoRevisar(p: Props) {
  const { filas, simulacion } = p
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const [pagina, setPagina] = useState(0)

  const cuentas = useMemo(() => {
    const listas = filas.filter((f) => !f.errores.length && f.repetidaDe === undefined)
    const existentes = listas.filter((f) => esExistente(simulacion?.get(f.fila)))
    return {
      listas: listas.length,
      nuevas: listas.length - existentes.length,
      existentes: existentes.length,
      avisos: listas.filter((f) => f.avisos.length).length,
      errores: filas.filter((f) => f.errores.length).length,
      repetidas: filas.filter((f) => f.repetidaDe !== undefined).length,
      sinDni: listas.filter((f) => !f.paciente.numero_documento).length,
      // Con "completar" quedan como aviso; con "omitir", como error: se cuentan los dos para no esconder la opción.
      sinNombre: filas.filter((f) =>
        f.avisos.some((a) => a.startsWith("Sin nombre") || a.startsWith("Sin apellido")) ||
        ((f.paciente.nombre.length >= 2 || f.paciente.apellido.length >= 2) && f.errores.some((e) => /^(Falta el (nombre|apellido)|El (nombre|apellido) es demasiado corto)$/.test(e))),
      ).length,
      faltaDni: filas.filter((f) => f.errores.includes("Falta el DNI")).length,
      obrasNuevas: [...new Set(listas.flatMap((f) => (f.paciente.obra_social.tipo === "nueva" ? [f.paciente.obra_social.nombre] : [])))],
    }
  }, [filas, simulacion])
  const comunes = useMemo(() => avisosComunes(filas.filter((f) => !f.errores.length)), [filas])

  const visibles = useMemo(() => filas.filter((f) => {
    const r = simulacion?.get(f.fila)
    switch (filtro) {
      case "listos": return !f.errores.length && f.repetidaDe === undefined && !esExistente(r)
      case "existentes": return esExistente(r)
      case "avisos": return !f.errores.length && f.avisos.length > 0
      case "errores": return f.errores.length > 0
      case "repetidos": return f.repetidaDe !== undefined
      default: return true
    }
  }), [filas, filtro, simulacion])
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const pag = Math.min(pagina, paginas - 1)
  const elegir = (f: Filtro) => { setFiltro(filtro === f ? "todos" : f); setPagina(0) }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <Tarjeta titulo="Pacientes nuevos" valor={fmt(cuentas.nuevas)} tono="verde" detalle={p.simulando ? "Comparando con tus pacientes…" : "se van a crear"} onClick={() => elegir("listos")} activa={filtro === "listos"} />
        <Tarjeta titulo="Ya están en Dentiqly" valor={p.simulando ? "…" : fmt(cuentas.existentes)} tono="azul" detalle="mismo DNI" onClick={cuentas.existentes ? () => elegir("existentes") : undefined} activa={filtro === "existentes"} />
        <Tarjeta titulo="Con avisos" valor={fmt(cuentas.avisos)} tono="ambar" detalle="se importan igual" onClick={cuentas.avisos ? () => elegir("avisos") : undefined} activa={filtro === "avisos"} />
        <Tarjeta titulo="Con errores" valor={fmt(cuentas.errores)} tono={cuentas.errores ? "rojo" : "gris"} detalle={cuentas.errores ? "corregilos o se omiten" : "ninguno"} onClick={cuentas.errores ? () => elegir("errores") : undefined} activa={filtro === "errores"} />
        <Tarjeta titulo="Repetidos" valor={fmt(cuentas.repetidas)} detalle="se combinan en uno" onClick={cuentas.repetidas ? () => elegir("repetidos") : undefined} activa={filtro === "repetidos"} />
      </div>

      {p.errorSimulacion && (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>No pudimos comparar con tus pacientes actuales ({p.errorSimulacion}). Igual podés importar: los que ya existan se detectan en el momento.</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {(cuentas.existentes > 0 || p.simulando) && (
          <div className="rounded-2xl border border-[#DCE5EE] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[#0B2440]">Si el paciente ya existe (mismo DNI)</div>
            <div className="space-y-1.5">
              <Opcion valor="omitir" actual={p.duplicados} onCambio={p.onDuplicados} titulo="Dejarlo como está" detalle="No se toca nada de lo que ya cargaste" />
              <Opcion valor="completar" actual={p.duplicados} onCambio={p.onDuplicados} titulo="Completar lo que le falta" detalle="Solo llena los datos vacíos (teléfono, email, fecha…)" />
              <Opcion valor="actualizar" actual={p.duplicados} onCambio={p.onDuplicados} titulo="Actualizar con los datos del archivo" detalle="Reemplaza los datos distintos. Nunca borra nada." />
            </div>
          </div>
        )}
        {(cuentas.sinDni > 0 || cuentas.faltaDni > 0) && (
          <div className="rounded-2xl border border-[#DCE5EE] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[#0B2440]">Pacientes sin DNI ({fmt(cuentas.sinDni + cuentas.faltaDni)})</div>
            <div className="space-y-1.5">
              <Opcion valor="provisorio" actual={p.opciones.sinDocumento} onCambio={(v) => p.onOpciones({ ...p.opciones, sinDocumento: v })} titulo="Importarlos con un DNI provisorio" detalle="Quedan como “SD-…” para completarlo cuando vengan" />
              <Opcion valor="omitir" actual={p.opciones.sinDocumento} onCambio={(v) => p.onOpciones({ ...p.opciones, sinDocumento: v })} titulo="No importarlos" />
            </div>
          </div>
        )}
        {cuentas.sinNombre > 0 && (
          <div className="rounded-2xl border border-[#DCE5EE] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[#0B2440]">Solo tienen nombre o solo apellido ({fmt(cuentas.sinNombre)})</div>
            <div className="space-y-1.5">
              <Opcion valor="completar" actual={p.opciones.sinNombre} onCambio={(v) => p.onOpciones({ ...p.opciones, sinNombre: v })} titulo="Importarlos completando con “S/D”" detalle="Ej.: “Marta” queda nombre Marta, apellido S/D" />
              <Opcion valor="omitir" actual={p.opciones.sinNombre} onCambio={(v) => p.onOpciones({ ...p.opciones, sinNombre: v })} titulo="No importarlos" />
            </div>
          </div>
        )}
        {(comunes.length > 0 || cuentas.obrasNuevas.length > 0) && (
          <div className="rounded-2xl border border-[#DCE5EE] p-4 text-[13px]">
            {cuentas.obrasNuevas.length > 0 && (
              <p className="mb-2 text-[#0B2440]"><b>{fmt(cuentas.obrasNuevas.length)} obras sociales nuevas:</b> <span className="text-[#65788D]">{cuentas.obrasNuevas.slice(0, 8).join(", ")}{cuentas.obrasNuevas.length > 8 ? "…" : ""}</span></p>
            )}
            {comunes.length > 0 && (
              <>
                <div className="mb-1.5 font-semibold text-[#0B2440]">Avisos más comunes</div>
                <ul className="space-y-1 text-[#4B5568]">
                  {comunes.map(([a, n]) => <li key={a} className="flex justify-between gap-3"><span>{a}</span><span className="font-semibold text-[#0B2440]">{fmt(n)}</span></li>)}
                </ul>
                <p className="mt-2 text-[12px] text-[#65788D]">Lo que no se pudo interpretar se guarda tal cual en “Información adicional”.</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DCE5EE]">
        <div className="flex items-center justify-between gap-2 border-b border-[#DCE5EE] bg-[#F8FAFF] px-4 py-2.5">
          <span className="text-[12px] font-semibold text-[#4B5568]">
            {filtro === "todos" ? "Todas las filas" : { listos: "Pacientes nuevos", existentes: "Ya están en Dentiqly", avisos: "Con avisos", errores: "Con errores (podés corregirlos acá)", repetidos: "Repetidos en el archivo" }[filtro]} · {fmt(visibles.length)}
            {p.simulando && <Loader2 size={13} className="ml-2 inline animate-spin" />}
          </span>
          <div className="flex items-center gap-1 text-[12px] text-[#65788D]">
            <button type="button" disabled={pag === 0} onClick={() => setPagina(pag - 1)} className="rounded p-1 hover:bg-white disabled:opacity-40"><ChevronLeft size={15} /></button>
            {pag + 1} / {paginas}
            <button type="button" disabled={pag >= paginas - 1} onClick={() => setPagina(pag + 1)} className="rounded p-1 hover:bg-white disabled:opacity-40"><ChevronRight size={15} /></button>
          </div>
        </div>
        <div className="max-h-[42vh] overflow-auto">
          <table className="w-full min-w-[920px] text-left text-[12.5px]">
            <thead className="sticky top-0 z-10 bg-white text-[10.5px] uppercase tracking-wide text-[#65788D] shadow-[0_1px_0_#DCE5EE]">
              <tr>
                {["Fila", "Apellido", "Nombre", "DNI", "Nacimiento", "Sexo", "Teléfono", "Email", "Obra social", "Estado"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5EE]/60">
              {visibles.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA).map((f) => <FilaTabla key={f.indice} f={f} sim={simulacion?.get(f.fila)} duplicados={p.duplicados} onEditar={p.onEditar} />)}
              {!visibles.length && <tr><td colSpan={10} className="px-3 py-8 text-center text-[#65788D]">No hay filas en esta vista.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const celdaInput = "w-full min-w-[90px] rounded-md border border-red-200 bg-white px-1.5 py-1 text-[12px] outline-none focus:border-[#2458ED]"

function FilaTabla({ f, sim, duplicados, onEditar }: { f: FilaRevisada; sim?: ResultadoFilaImportacion; duplicados: ModoDuplicados; onEditar: Props["onEditar"] }) {
  const p = f.paciente
  const conError = f.errores.length > 0
  const existente = esExistente(sim)
  const fecha = p.fecha_nacimiento ? p.fecha_nacimiento.split("-").reverse().join("/") : ""
  const os = p.obra_social.tipo === "ninguna" ? "" : p.obra_social.nombre
  const detalle = [...f.errores, ...f.avisos, ...(sim?.avisos ?? [])].join("\n")
  const editable = (campo: keyof PacienteImportado, valor: string | null, tipo = "text") =>
    conError ? (
      <input
        type={tipo}
        defaultValue={valor ?? ""}
        onBlur={(e) => {
          const v = e.target.value.trim()
          if (v !== (valor ?? "")) onEditar(f.indice, { [campo]: campo === "numero_documento" ? v.replace(/[^\dA-Za-z]/g, "").toUpperCase() || null : v || null } as Partial<PacienteImportado>)
        }}
        className={celdaInput}
      />
    ) : (valor || <span className="text-[#B6BFCC]">—</span>)

  return (
    <tr className={conError ? "bg-red-50/40" : f.repetidaDe !== undefined ? "bg-slate-50 text-[#8A93A8]" : ""}>
      <td className="px-3 py-1.5 text-[#8A93A8]">{f.fila}</td>
      <td className="px-3 py-1.5 font-medium text-[#0B2440]">{editable("apellido", p.apellido)}</td>
      <td className="px-3 py-1.5 text-[#0B2440]">{editable("nombre", p.nombre)}</td>
      <td className="px-3 py-1.5">{p.numero_documento ? editable("numero_documento", p.numero_documento) : conError ? editable("numero_documento", null) : <Pildora tono="gris">provisorio</Pildora>}</td>
      <td className="px-3 py-1.5">{conError ? editable("fecha_nacimiento", p.fecha_nacimiento, "date") : fecha || <span className="text-[#B6BFCC]">—</span>}</td>
      <td className="px-3 py-1.5">{p.sexo ? p.sexo[0] : <span className="text-[#B6BFCC]">—</span>}</td>
      <td className="max-w-[130px] truncate px-3 py-1.5" title={p.telefono ?? ""}>{p.telefono || <span className="text-[#B6BFCC]">—</span>}</td>
      <td className="max-w-[170px] truncate px-3 py-1.5" title={p.email ?? ""}>{conError ? editable("email", p.email, "email") : p.email || <span className="text-[#B6BFCC]">—</span>}</td>
      <td className="max-w-[140px] truncate px-3 py-1.5" title={os}>{os ? <>{os}{p.obra_social.tipo === "nueva" && <span className="ml-1 text-[10px] font-semibold text-[#2458ED]">NUEVA</span>}</> : <span className="text-[#B6BFCC]">—</span>}</td>
      <td className="px-3 py-1.5" title={detalle}>
        {conError ? <Pildora tono="rojo">{f.errores[0]}</Pildora>
          : f.repetidaDe !== undefined ? <Pildora tono="gris">Combinada</Pildora>
          : existente ? <Pildora tono="azul">{duplicados === "omitir" ? "Ya existe" : duplicados === "completar" ? "Se completa" : "Se actualiza"}</Pildora>
          : f.avisos.length ? <Pildora tono="ambar">{f.avisos.length === 1 ? f.avisos[0].replace(/\s*\(.*\)$/, "").slice(0, 34) : `${f.avisos.length} avisos`}</Pildora>
          : <Pildora tono="verde">Lista</Pildora>}
      </td>
    </tr>
  )
}
