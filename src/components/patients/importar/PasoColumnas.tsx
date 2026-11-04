import { useMemo, useState } from "react"
import { CheckCircle2, ChevronDown, Circle, Sparkles, Table2 } from "lucide-react"
import {
  CAMPOS, claveObraSocial, claveValor, limpiar, sexoDe, valoresDistintos,
  type Destino, type FilaRevisada, type ObraSocialClinica, type ObraSocialElegida, type Opciones, type Sexo, type Tabla,
} from "../../../lib/importador"
import { Opcion, Pildora, fmt, selectClase } from "./ui"

const GRUPOS = ["Identidad", "Contacto", "Domicilio", "Cobertura", "Otros"] as const

interface Props {
  tabla: Tabla
  tablas: Tabla[]
  tablaIdx: number
  onTabla: (i: number) => void
  filaCabecera: number
  onFilaCabecera: (fila: number) => void
  mapeo: Destino[]
  mapeoAuto: Destino[]
  onDestino: (col: number, d: Destino) => void
  opciones: Opciones
  onOpciones: (o: Opciones) => void
  obrasClinica: ObraSocialClinica[]
  filas: FilaRevisada[]
}

export function PasoColumnas(p: Props) {
  const { tabla, mapeo, opciones } = p
  const [verOpciones, setVerOpciones] = useState(true)
  const usa = (d: Destino) => mapeo.includes(d)
  const tieneNombre = usa("nombre_completo") || usa("apellido") || usa("nombre")
  const muestras = useMemo(
    () => tabla.columnas.map((_, i) => {
      const vistos: string[] = []
      for (const f of tabla.filas) {
        const v = limpiar(f[i] ?? null)
        if (v && !vistos.includes(v)) vistos.push(v.length > 40 ? `${v.slice(0, 40)}…` : v)
        if (vistos.length === 3) break
      }
      return vistos
    }),
    [tabla],
  )
  const llenas = useMemo(() => tabla.columnas.map((_, i) => tabla.filas.filter((f) => limpiar(f[i] ?? null)).length), [tabla])
  const ejemplo = p.filas.find((f) => !f.errores.length) ?? p.filas[0]

  const chequeo: [string, boolean, string?][] = [
    ["Nombre y apellido", tieneNombre, "obligatorio"],
    ["DNI", usa("numero_documento"), opciones.sinDocumento === "provisorio" ? "si falta, se asigna uno provisorio" : "obligatorio"],
    ["Fecha de nacimiento", usa("fecha_nacimiento") || usa("anio_nacimiento")],
    ["Teléfono", usa("telefono")],
    ["Email", usa("email")],
    ["Obra social", usa("obra_social")],
  ]

  return (
    <div className="space-y-5">
      {/* Tabla / hoja y fila de títulos */}
      <div className="flex flex-wrap items-end gap-3">
        {p.tablas.length > 1 && (
          <label className="min-w-[220px] flex-1">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#65788D]">{p.tablas.some((t) => t.grilla) ? "Hoja" : "Tabla"}</span>
            <select className={selectClase} value={p.tablaIdx} onChange={(e) => p.onTabla(Number(e.target.value))}>
              {p.tablas.map((t, i) => <option key={i} value={i}>{t.nombre} · {fmt(t.filas.length)} filas</option>)}
            </select>
          </label>
        )}
        {tabla.grilla && (
          <label className="min-w-[220px] flex-1">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#65788D]">Fila de títulos</span>
            <select className={selectClase} value={p.filaCabecera} onChange={(e) => p.onFilaCabecera(Number(e.target.value))}>
              <option value={-1}>El archivo no tiene títulos</option>
              {tabla.grilla.slice(0, 15).map((fila, i) => (
                <option key={i} value={i}>Fila {i + 1}: {fila.filter((v) => v !== null && v !== "").slice(0, 4).map((v) => String(v).slice(0, 18)).join(" · ") || "(vacía)"}</option>
              ))}
            </select>
          </label>
        )}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {chequeo.map(([nombre, ok, nota]) => (
            <span key={nombre} title={nota} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${ok ? "bg-emerald-50 text-emerald-700" : nota === "obligatorio" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"}`}>
              {ok ? <CheckCircle2 size={13} /> : <Circle size={13} />} {nombre}
            </span>
          ))}
        </div>
      </div>

      {!tieneNombre && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          Elegí qué columna tiene el nombre del paciente (puede ser “Nombre y apellido” juntos, o “Apellido” y “Nombre” por separado).
        </div>
      )}

      {/* Columnas */}
      <div className="overflow-hidden rounded-2xl border border-[#DCE5EE]">
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3 border-b border-[#DCE5EE] bg-[#F8FAFF] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#65788D]">
          <span className="flex items-center gap-1.5"><Table2 size={13} /> Columna de tu archivo</span>
          <span>Se guarda en Dentiqly como</span>
        </div>
        <div className="max-h-[46vh] divide-y divide-[#DCE5EE]/70 overflow-y-auto">
          {tabla.columnas.map((col, i) => {
            const destino = mapeo[i]
            const auto = p.mapeoAuto[i] === destino && destino !== "extra" && destino !== "ignorar"
            return (
              <div key={i} className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-3 px-4 py-2.5 ${destino === "ignorar" ? "opacity-55" : ""}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-[#0B2440]" title={col}>{col}</span>
                    <span className="shrink-0 text-[11px] text-[#8A93A8]">{fmt(llenas[i])} con datos</span>
                  </div>
                  <div className="truncate text-[12px] text-[#65788D]" title={muestras[i].join(" · ")}>{muestras[i].length ? muestras[i].join(" · ") : "(vacía)"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select className={selectClase} value={destino} onChange={(e) => p.onDestino(i, e.target.value as Destino)}>
                    <option value="extra">Guardar en Información adicional</option>
                    <option value="ignorar">No importar</option>
                    {GRUPOS.map((g) => (
                      <optgroup key={g} label={g}>
                        {CAMPOS.filter((c) => c.grupo === g).map((c) => (
                          <option key={c.id} value={c.id}>{c.etiqueta}{c.ayuda ? ` — ${c.ayuda}` : ""}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {auto && <span title="Reconocida automáticamente" className="shrink-0 text-[#2458ED]"><Sparkles size={15} /></span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Opciones de limpieza */}
      <div className="rounded-2xl border border-[#DCE5EE]">
        <button type="button" onClick={() => setVerOpciones(!verOpciones)} className="flex w-full items-center justify-between px-4 py-3 text-left">
          <span className="text-[13px] font-semibold text-[#0B2440]">Cómo interpretar los datos</span>
          <ChevronDown size={16} className={`text-[#65788D] transition ${verOpciones ? "rotate-180" : ""}`} />
        </button>
        {verOpciones && (
          <div className="grid gap-4 border-t border-[#DCE5EE] px-4 py-4 md:grid-cols-2">
            {usa("nombre_completo") && (
              <div>
                <div className="mb-2 text-[12px] font-semibold text-[#4B5568]">Orden del nombre completo</div>
                <div className="space-y-1.5">
                  <Opcion valor="auto" actual={opciones.ordenNombre} onCambio={(v) => p.onOpciones({ ...opciones, ordenNombre: v })} titulo="Automático" detalle="Usa la coma o las mayúsculas para separar" />
                  <Opcion valor="apellido_nombre" actual={opciones.ordenNombre} onCambio={(v) => p.onOpciones({ ...opciones, ordenNombre: v })} titulo="Primero el apellido" detalle="GARCÍA JUAN CARLOS" />
                  <Opcion valor="nombre_apellido" actual={opciones.ordenNombre} onCambio={(v) => p.onOpciones({ ...opciones, ordenNombre: v })} titulo="Primero el nombre" detalle="Juan Carlos García" />
                </div>
                {ejemplo && <p className="mt-2 text-[12px] text-[#65788D]">Ejemplo de tu archivo: apellido <b className="text-[#0B2440]">{ejemplo.paciente.apellido || "—"}</b>, nombre <b className="text-[#0B2440]">{ejemplo.paciente.nombre || "—"}</b></p>}
              </div>
            )}
            {usa("fecha_nacimiento") && (
              <div>
                <div className="mb-2 text-[12px] font-semibold text-[#4B5568]">Formato de las fechas</div>
                <div className="space-y-1.5">
                  <Opcion valor="dmy" actual={opciones.ordenFechas} onCambio={(v) => p.onOpciones({ ...opciones, ordenFechas: v })} titulo="Día / mes / año" detalle="15/03/1980 (el habitual en Argentina)" />
                  <Opcion valor="mdy" actual={opciones.ordenFechas} onCambio={(v) => p.onOpciones({ ...opciones, ordenFechas: v })} titulo="Mes / día / año" detalle="03/15/1980 (sistemas en inglés)" />
                  <Opcion valor="ymd" actual={opciones.ordenFechas} onCambio={(v) => p.onOpciones({ ...opciones, ordenFechas: v })} titulo="Año - mes - día" detalle="1980-03-15" />
                </div>
              </div>
            )}
            <div className="space-y-2.5 md:col-span-2">
              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-[#0B2440]">
                <input type="checkbox" className="mt-0.5 accent-[#2458ED]" checked={opciones.corregirMayusculas} onChange={(e) => p.onOpciones({ ...opciones, corregirMayusculas: e.target.checked })} />
                <span><b>Corregir mayúsculas</b> <span className="text-[#65788D]">— “GARCÍA PÉREZ” queda “García Pérez”. Los nombres que ya están bien escritos no se tocan.</span></span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-[#0B2440]">
                <input type="checkbox" className="mt-0.5 accent-[#2458ED]" checked={opciones.guardarExtras} onChange={(e) => p.onOpciones({ ...opciones, guardarExtras: e.target.checked })} />
                <span><b>No perder nada</b> <span className="text-[#65788D]">— las columnas marcadas “Guardar en Información adicional” quedan en la ficha de cada paciente.</span></span>
              </label>
            </div>
          </div>
        )}
      </div>

      {usa("sexo") && <ValoresSexo {...p} />}
      {usa("obra_social") && <ValoresObraSocial {...p} />}
    </div>
  )
}

function ValoresSexo({ tabla, mapeo, opciones, onOpciones }: Props) {
  const col = mapeo.indexOf("sexo")
  const valores = useMemo(() => valoresDistintos(tabla, col), [tabla, col])
  if (!valores.length) return null
  const valorDe = (clave: string, ejemplo: string): Sexo | null => (clave in opciones.valoresSexo ? opciones.valoresSexo[clave] : sexoDe(ejemplo))
  const sinReconocer = valores.filter((v) => !valorDe(v.clave, v.ejemplo)).length
  return (
    <div className="rounded-2xl border border-[#DCE5EE] p-4">
      <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-[#0B2440]">Valores de sexo {sinReconocer > 0 && <Pildora tono="ambar">{sinReconocer} sin reconocer</Pildora>}</div>
      <p className="mb-3 text-[12px] text-[#65788D]">Revisá a qué corresponde cada valor que aparece en tu archivo.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {valores.slice(0, 30).map((v) => (
          <label key={v.clave} className="flex items-center gap-2 rounded-lg border border-[#DCE5EE] px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-[13px] text-[#0B2440]" title={v.ejemplo}><b>{v.ejemplo}</b> <span className="text-[11px] text-[#8A93A8]">({fmt(v.cantidad)})</span></span>
            <select
              className="rounded-md border border-[#DCE5EE] bg-white px-1.5 py-1 text-[12px]"
              value={valorDe(v.clave, v.ejemplo) ?? ""}
              onChange={(e) => onOpciones({ ...opciones, valoresSexo: { ...opciones.valoresSexo, [v.clave]: (e.target.value || null) as Sexo | null } })}
            >
              <option value="">Sin dato</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}

function ValoresObraSocial({ tabla, mapeo, opciones, onOpciones, obrasClinica }: Props) {
  const col = mapeo.indexOf("obra_social")
  const valores = useMemo(() => valoresDistintos(tabla, col, (v) => claveObraSocial(limpiar(v))), [tabla, col])
  const [filtro, setFiltro] = useState("")
  if (!valores.length) return null
  const elegida = (clave: string, ejemplo = clave): ObraSocialElegida => opciones.valoresObraSocial[clave] ?? { tipo: "nueva", nombre: ejemplo }
  const codigo = (o: ObraSocialElegida) => (o.tipo === "existente" ? `e:${o.id}` : o.tipo === "nueva" ? "n" : "x")
  const cambiar = (clave: string, ejemplo: string, cod: string) => {
    const previa = elegida(clave, ejemplo)
    const nueva: ObraSocialElegida = cod === "x" ? { tipo: "ninguna" } : cod === "n" ? { tipo: "nueva", nombre: previa.tipo === "nueva" ? previa.nombre : ejemplo } : { tipo: "existente", id: Number(cod.slice(2)), nombre: obrasClinica.find((o) => o.id === Number(cod.slice(2)))?.nombre ?? "" }
    onOpciones({ ...opciones, valoresObraSocial: { ...opciones.valoresObraSocial, [clave]: nueva } })
  }
  const nuevas = valores.filter((v) => elegida(v.clave, v.ejemplo).tipo === "nueva").length
  const visibles = valores.filter((v) => !filtro || claveValor(v.ejemplo).includes(claveValor(filtro)))
  return (
    <div className="rounded-2xl border border-[#DCE5EE] p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#0B2440]">
        Obras sociales del archivo <Pildora tono="gris">{fmt(valores.length)} distintas</Pildora>
        {nuevas > 0 && <Pildora tono="azul">{fmt(nuevas)} se van a crear</Pildora>}
      </div>
      <p className="mb-3 text-[12px] text-[#65788D]">Las que ya tenés cargadas se vinculan solas. Las demás se crean (después podés completarles el plan y los aranceles en Obras sociales).</p>
      {valores.length > 12 && <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar obra social…" className={`${selectClase} mb-2 max-w-xs`} />}
      <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {visibles.slice(0, 300).map((v) => {
          const o = elegida(v.clave, v.ejemplo)
          return (
            <label key={v.clave} className="flex items-center gap-2 rounded-lg border border-[#DCE5EE] px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-[13px] text-[#0B2440]" title={v.ejemplo}><b>{v.ejemplo}</b> <span className="text-[11px] text-[#8A93A8]">({fmt(v.cantidad)})</span></span>
              <select className="max-w-[55%] rounded-md border border-[#DCE5EE] bg-white px-1.5 py-1 text-[12px]" value={codigo(o)} onChange={(e) => cambiar(v.clave, v.ejemplo, e.target.value)}>
                <option value="n">Crear “{o.tipo === "nueva" ? o.nombre : v.ejemplo}”</option>
                <option value="x">Sin obra social / particular</option>
                {obrasClinica.length > 0 && (
                  <optgroup label="Tus obras sociales">
                    {obrasClinica.map((os) => <option key={os.id} value={`e:${os.id}`}>{os.nombre}</option>)}
                  </optgroup>
                )}
              </select>
            </label>
          )
        })}
      </div>
    </div>
  )
}
