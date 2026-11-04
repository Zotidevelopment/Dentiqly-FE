// Punto de entrada: recibe el archivo, reconoce el formato y devuelve tablas.
import { esZip, leerZip } from "./zip"
import { leerPlanillaZip } from "./planilla"
import { decodificar } from "./texto"
import { parsearCsv, detectarSeparador } from "./csv"
import { parsearSql } from "./sql"
import { esDbf, parsearDbf } from "./dbf"
import { aplanar, parsearJson } from "./json"
import { CAMPOS, puntajeTitulo } from "./campos"
import { ErrorImportacion, type Celda, type ResultadoLectura, type Tabla } from "./tipos"

export const TAMANO_MAXIMO = 80 * 1024 * 1024
export const EXTENSIONES = ".xlsx,.xlsm,.xls,.ods,.csv,.tsv,.txt,.sql,.dbf,.json,.jsonl,.xml,.htm,.html"

const vacia = (v: Celda) => v === null || (typeof v === "string" && v.trim() === "")
const esTextoTitulo = (v: Celda) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= 60 && !/^[-+]?[\d.,\s/:-]+$/.test(v.trim()) && !/@/.test(v)

/** Busca la fila de títulos entre las primeras 25. Devuelve -1 si la planilla no tiene títulos. */
export function detectarFilaCabecera(grilla: Celda[][]): number {
  const ancho = Math.max(0, ...grilla.slice(0, 200).map((f) => f.filter((v) => !vacia(v)).length))
  let mejor = -1, mejorPuntaje = 0
  for (let r = 0; r < Math.min(grilla.length, 25); r++) {
    const fila = grilla[r] ?? []
    const llenas = fila.filter((v) => !vacia(v))
    if (llenas.length < Math.min(2, ancho)) continue
    const titulos = llenas.filter(esTextoTitulo).length
    const reconocidas = llenas.filter((v) => typeof v === "string" && CAMPOS.some((c) => puntajeTitulo(v, c.id) >= 55)).length
    if (titulos < llenas.length * 0.7) continue
    const puntaje = reconocidas * 3 + titulos + (llenas.length >= ancho * 0.5 ? 2 : 0)
    if (puntaje > mejorPuntaje) { mejor = r; mejorPuntaje = puntaje }
    if (reconocidas >= 2) break
  }
  if (mejor < 0) return -1
  const reconocidas = (grilla[mejor] ?? []).filter((v) => typeof v === "string" && CAMPOS.some((c) => puntajeTitulo(v, c.id) >= 55)).length
  if (reconocidas >= 1) return mejor
  // Sin títulos reconocidos: es cabecera solo si la fila siguiente no parece de la misma clase (texto puro).
  const siguiente = (grilla[mejor + 1] ?? []).filter((v) => !vacia(v))
  return siguiente.length && siguiente.filter(esTextoTitulo).length < siguiente.length ? mejor : -1
}

const letra = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : letra(Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)))

/**
 * Columnas cuyas celdas son objetos JSON (exportaciones de MongoDB, Benty…):
 * se abren en una columna por dato ("obra_social.numero"), así cada parte se
 * puede llevar a su campo.
 */
export function expandirColumnasJson(tabla: Tabla): Tabla {
  const nuevasColumnas: string[] = []
  const transformaciones: ((fila: Celda[]) => Celda[])[] = []
  tabla.columnas.forEach((nombre, i) => {
    const llenos = tabla.filas.map((f) => f[i]).filter((v): v is string => typeof v === "string" && v.trim() !== "")
    const objetos = llenos.slice(0, 500).filter((v) => /^\s*\{[\s\S]*\}\s*$/.test(v))
    if (!llenos.length || objetos.length < Math.min(llenos.length, 500) * 0.6) {
      nuevasColumnas.push(nombre)
      transformaciones.push((f) => [f[i] ?? null])
      return
    }
    const planos = tabla.filas.map((f) => {
      const v = f[i]
      if (typeof v !== "string" || !v.trim().startsWith("{")) return null
      try { return aplanar(JSON.parse(v)) } catch { return null }
    })
    const claves: string[] = []
    for (const p of planos) if (p) for (const k of Object.keys(p)) if (!claves.includes(k)) claves.push(k)
    if (!claves.length) { nuevasColumnas.push(nombre); transformaciones.push((f) => [f[i] ?? null]); return }
    claves.forEach((k) => nuevasColumnas.push(`${nombre}.${k}`))
    const indice = new Map(tabla.filas.map((f, r) => [f, r]))
    transformaciones.push((f) => { const p = planos[indice.get(f)!]; return claves.map((k) => (p ? (p[k] ?? null) : null)) })
  })
  if (nuevasColumnas.length === tabla.columnas.length && nuevasColumnas.every((c, i) => c === tabla.columnas[i])) return tabla
  return { ...tabla, columnas: nuevasColumnas, filas: tabla.filas.map((f) => transformaciones.flatMap((tr) => tr(f))) }
}

/** Arma la tabla a partir de una grilla y la fila de títulos elegida (-1 = sin títulos). */
export function tablaDesdeGrilla(nombre: string, grilla: Celda[][], filaCabecera = detectarFilaCabecera(grilla)): Tabla {
  const desde = filaCabecera + 1
  const ancho = Math.max(0, ...grilla.map((f) => f.length))
  const cabecera = filaCabecera >= 0 ? grilla[filaCabecera] ?? [] : []
  // Columnas sin título y sin datos: afuera.
  const usadas: number[] = []
  for (let c = 0; c < ancho; c++) {
    if (!vacia(cabecera[c] ?? null) || grilla.slice(desde).some((f) => !vacia(f[c] ?? null))) usadas.push(c)
  }
  const vistos = new Map<string, number>()
  const columnas = usadas.map((c) => {
    let t = String(cabecera[c] ?? "").replace(/\s+/g, " ").trim() || `Columna ${letra(c)}`
    const n = (vistos.get(t.toLowerCase()) ?? 0) + 1
    vistos.set(t.toLowerCase(), n)
    if (n > 1) t = `${t} (${n})`
    return t
  })
  const filas: Celda[][] = []
  const numeroFila: number[] = []
  for (let r = desde; r < grilla.length; r++) {
    const f = grilla[r] ?? []
    const valores = usadas.map((c) => (f[c] === undefined ? null : f[c]))
    if (valores.every(vacia)) continue
    // Filas de totales o subtítulos al pie ("Total: 1234 pacientes").
    if (valores.filter((v) => !vacia(v)).length === 1 && typeof valores.find((v) => !vacia(v)) === "string" && /^(total|subtotal|cantidad|fin)\b/i.test(String(valores.find((v) => !vacia(v))))) continue
    filas.push(valores)
    numeroFila.push(r + 1)
  }
  return expandirColumnasJson({ nombre, columnas, filas, numeroFila, conCabecera: filaCabecera >= 0, grilla, filaCabecera })
}

function tablaDirecta(nombre: string, columnas: string[], filas: Celda[][]): Tabla {
  return expandirColumnasJson({ nombre, columnas, filas, numeroFila: filas.map((_, i) => i + 1), conCabecera: true })
}

/** Tablas HTML (muchos sistemas exportan un "Excel" que en realidad es una página HTML). */
function leerHtml(texto: string): { nombre: string; grilla: Celda[][] }[] {
  const doc = new DOMParser().parseFromString(texto, "text/html")
  return Array.from(doc.querySelectorAll("table"))
    .map((t, i) => ({
      nombre: t.getAttribute("summary") || t.querySelector("caption")?.textContent?.trim() || `Tabla ${i + 1}`,
      grilla: Array.from(t.querySelectorAll("tr")).map((tr) => {
        const fila: Celda[] = []
        for (const td of Array.from(tr.querySelectorAll("td,th"))) {
          const valor = (td.textContent ?? "").replace(/\s+/g, " ").trim()
          const span = Math.min(Number(td.getAttribute("colspan") ?? 1) || 1, 50)
          fila.push(valor || null)
          for (let k = 1; k < span; k++) fila.push(null)
        }
        return fila
      }),
    }))
    .filter((t) => t.grilla.length > 1)
}

/** "Hoja de cálculo XML 2003" de Excel (otro formato que se guarda con extensión .xls). */
function leerXml2003(texto: string): { nombre: string; grilla: Celda[][] }[] {
  const doc = new DOMParser().parseFromString(texto, "application/xml")
  const tag = (el: Element | Document, t: string) => Array.from(el.getElementsByTagNameNS("*", t))
  return tag(doc, "Worksheet").map((ws, i) => {
    const nombre = Array.from(ws.attributes).find((a) => a.localName === "Name")?.value || `Hoja ${i + 1}`
    const grilla: Celda[][] = []
    for (const row of tag(ws, "Row")) {
      const idxFila = Array.from(row.attributes).find((a) => a.localName === "Index")?.value
      if (idxFila) while (grilla.length < Number(idxFila) - 1) grilla.push([])
      const fila: Celda[] = []
      for (const cell of Array.from(row.children).filter((e) => e.localName === "Cell")) {
        const idx = Array.from(cell.attributes).find((a) => a.localName === "Index")?.value
        if (idx) while (fila.length < Number(idx) - 1) fila.push(null)
        const data = tag(cell, "Data")[0]
        const tipo = data ? Array.from(data.attributes).find((a) => a.localName === "Type")?.value : null
        const t = data?.textContent ?? ""
        fila.push(!data || t === "" ? null : tipo === "Number" ? Number(t) : tipo === "DateTime" ? new Date(t.endsWith("Z") ? t : `${t}Z`) : tipo === "Boolean" ? t === "1" : t)
      }
      grilla.push(fila)
    }
    return { nombre, grilla }
  })
}

export async function leerArchivo(archivo: File): Promise<ResultadoLectura> {
  if (archivo.size > TAMANO_MAXIMO) throw new ErrorImportacion("El archivo pesa más de 80 MB. Dividilo en partes o mandánoslo y lo importamos nosotros.")
  if (archivo.size === 0) throw new ErrorImportacion("El archivo está vacío.")
  const ext = (archivo.name.split(".").pop() ?? "").toLowerCase()
  const bytes = new Uint8Array(await archivo.arrayBuffer())
  const base = archivo.name.replace(/\.[^.]+$/, "")
  const avisos: string[] = []

  if (esZip(bytes)) {
    if (ext === "docx") throw new ErrorImportacion("Es un documento de Word. Si los pacientes están en una tabla, copiala a Excel y subí la planilla.")
    if (ext === "numbers") throw new ErrorImportacion("Es una planilla de Numbers. Exportala a Excel (Archivo → Exportar a → Excel) y subí ese archivo.")
    const hojas = await leerPlanillaZip(leerZip(bytes))
    const tablas = hojas.map((h) => tablaDesdeGrilla(h.nombre, h.grilla)).filter((t) => t.filas.length)
    if (!tablas.length) throw new ErrorImportacion("La planilla no tiene datos.")
    return { formato: ext === "ods" ? "LibreOffice (.ods)" : "Excel", tablas, avisos }
  }
  // Formatos binarios que no se pueden leer en el navegador: se explica qué hacer.
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
    const texto = new TextDecoder("latin1").decode(bytes.subarray(0, 4096))
    if (ext === "mdb" || /Standard Jet DB|Standard ACE DB/.test(texto)) throw new ErrorImportacion("Es una base de Access. Abrila, exportá la tabla de pacientes a Excel (Datos externos → Excel) y subí ese archivo.")
    throw new ErrorImportacion("Es un Excel antiguo (.xls de antes de 2007). Abrilo en Excel y guardalo como “Libro de Excel (.xlsx)” o como CSV, y subí ese archivo.")
  }
  if (/Standard (Jet|ACE) DB/.test(new TextDecoder("latin1").decode(bytes.subarray(0, 64)))) {
    throw new ErrorImportacion("Es una base de Access. Abrila, exportá la tabla de pacientes a Excel (Datos externos → Excel) y subí ese archivo.")
  }
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    throw new ErrorImportacion("Es un PDF: no se pueden leer datos de un PDF automáticamente. Si el sistema viejo permite exportar a Excel o CSV, usá eso. Si no, mandanos el PDF y lo cargamos nosotros.")
  }
  if (ext === "dbf" || esDbf(bytes)) {
    const t = parsearDbf(bytes)
    avisos.push(...t.avisos)
    return { formato: "dBase / FoxPro (.dbf)", tablas: [tablaDirecta(base, t.columnas, t.filas)], avisos }
  }

  const texto = decodificar(bytes)
  const inicio = texto.slice(0, 2000).trimStart()
  if (ext === "json" || ext === "jsonl" || /^[[{]/.test(inicio)) {
    try {
      const tablas = parsearJson(texto, base).map((t) => tablaDirecta(t.nombre, t.columnas, t.filas))
      return { formato: "JSON", tablas, avisos }
    } catch (e) {
      if (ext === "json" || ext === "jsonl") throw e
    }
  }
  if (ext === "sql" || /\b(INSERT\s+(INTO\s+)?[\w`"[\].]+\s*(\(|VALUES)|CREATE\s+TABLE|COPY\s+\S+.*FROM\s+stdin)/i.test(texto.slice(0, 200000))) {
    const tablas = parsearSql(texto).map((t) => tablaDirecta(t.nombre, t.columnas, t.filas))
    if (!tablas.length) throw new ErrorImportacion("No se encontraron datos (INSERT o COPY) en el archivo .sql. Si solo tiene la estructura de las tablas, exportalo de nuevo incluyendo los datos.")
    return { formato: "SQL", tablas, avisos }
  }
  if (/^<\?xml[\s\S]{0,500}urn:schemas-microsoft-com:office:spreadsheet/.test(inicio) || /<Workbook[^>]+office:spreadsheet/.test(inicio)) {
    const tablas = leerXml2003(texto).map((h) => tablaDesdeGrilla(h.nombre, h.grilla)).filter((t) => t.filas.length)
    if (tablas.length) return { formato: "Excel XML", tablas, avisos }
  }
  if (/<table[\s>]/i.test(texto.slice(0, 500000))) {
    const tablas = leerHtml(texto).map((h) => tablaDesdeGrilla(h.nombre, h.grilla)).filter((t) => t.filas.length)
    if (tablas.length) return { formato: "Tabla HTML", tablas, avisos }
  }
  if (ext === "xml") throw new ErrorImportacion("No se pudo leer el .xml. Si viene de otro sistema, exportalo a Excel o CSV.")
  const sep = detectarSeparador(texto)
  const tabla = tablaDesdeGrilla(base, parsearCsv(texto, sep))
  if (!tabla.filas.length) throw new ErrorImportacion("El archivo no tiene datos que se puedan leer.")
  const nombreSep = sep === ";" ? "punto y coma" : sep === "\t" ? "tabulaciones" : sep === "|" ? "barras" : "comas"
  return { formato: `Texto separado por ${nombreSep}`, tablas: [tabla], avisos }
}

/** Elige la tabla que más se parece a una lista de pacientes (para .sql y .json con varias tablas). */
export function tablaMasProbable(tablas: Tabla[]): number {
  let mejor = 0, mejorPuntaje = -1
  tablas.forEach((t, i) => {
    const nombre = t.nombre.toLowerCase()
    const reconocidas = t.columnas.filter((c) => CAMPOS.some((campo) => puntajeTitulo(c, campo.id) >= 55)).length
    const puntaje = reconocidas * 10 + (/(pacient|patient|client|persona|people|afiliad)/.test(nombre) ? 40 : 0) + Math.min(t.filas.length, 5000) / 1000
    if (puntaje > mejorPuntaje) { mejor = i; mejorPuntaje = puntaje }
  })
  return mejor
}
