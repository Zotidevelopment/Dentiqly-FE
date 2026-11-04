// Lectura de planillas .xlsx / .xlsm (Excel, Google Sheets) y .ods (LibreOffice)
// sin librerías: son ZIP con XML. Devuelve una grilla por hoja.
import { leerTextoZip, type EntradaZip } from "./zip"
import { ErrorImportacion, type Celda } from "./tipos"

export interface Hoja {
  nombre: string
  grilla: Celda[][]
}

const xml = (texto: string) => {
  const doc = new DOMParser().parseFromString(texto, "application/xml")
  if (doc.getElementsByTagName("parsererror").length) throw new ErrorImportacion("El archivo de Excel tiene un formato interno inválido.")
  return doc
}
const hijos = (el: Element | Document, tag: string) => Array.from(el.getElementsByTagNameNS("*", tag))
const atr = (el: Element, nombre: string) => el.getAttribute(nombre) ?? el.getAttributeNS("*", nombre.split(":").pop()!) ?? null

export function decodificarEntidades(s: string): string {
  if (!s.includes("&")) return s
  return s.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi, (_, e: string) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
    return ({ lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" } as Record<string, string>)[e.toLowerCase()]
  })
}

/** Junta los <t> de un texto con formato, sin el texto fonético (<rPh>) que agrega Excel. */
function textoDeRuns(xmlInterior: string): string {
  const sinFonetica = xmlInterior.replace(/<(?:\w+:)?rPh\b[\s\S]*?<\/(?:\w+:)?rPh>/g, "")
  let r = ""
  for (const m of sinFonetica.matchAll(/<(?:\w+:)?t(?:\s[^>]*)?>([\s\S]*?)<\/(?:\w+:)?t>/g)) r += m[1]
  return decodificarEntidades(r)
}

const atributo = (attrs: string, nombre: string): string | null => {
  const m = attrs.match(new RegExp(`(?:^|\\s)${nombre}="([^"]*)"`))
  return m ? m[1] : null
}

/** "BC12" → 54 (índice de columna base 0). */
export function indiceColumna(ref: string): number {
  let n = 0
  for (const c of ref) {
    const k = c.charCodeAt(0)
    if (k >= 65 && k <= 90) n = n * 26 + (k - 64)
    else if (k >= 97 && k <= 122) n = n * 26 + (k - 96)
    else break
  }
  return n - 1
}

/** Número de serie de Excel → fecha (UTC, sin hora local). */
export function fechaDeSerial(serial: number, base1904 = false): Date {
  const dias = base1904 ? serial + 1462 : serial
  return new Date(Date.UTC(1899, 11, 30) + Math.round(dias * 86400000))
}

const FORMATOS_FECHA_PREDEFINIDOS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 45, 46, 47, 50, 51, 52, 53, 54, 55, 56, 57, 58])

export function esFormatoFecha(codigo: string): boolean {
  // Saca lo que está entre comillas, corchetes ([Red], [$-es-AR]) y escapes.
  const limpio = codigo.replace(/"[^"]*"/g, "").replace(/\[[^\]]*\]/g, "").replace(/\\./g, "")
  return /[dmy]/i.test(limpio) && !/^[#0.,%\s]*$/.test(limpio)
}

async function leerXlsx(zip: Map<string, EntradaZip>): Promise<Hoja[]> {
  const libroTxt = await leerTextoZip(zip, "xl/workbook.xml")
  if (!libroTxt) throw new ErrorImportacion("No se encontró el contenido de la planilla.")
  const libro = xml(libroTxt)
  const base1904 = hijos(libro, "workbookPr").some((e) => ["1", "true"].includes(e.getAttribute("date1904") ?? ""))

  // rId → ruta de la hoja
  const rels = new Map<string, string>()
  const relsTxt = await leerTextoZip(zip, "xl/_rels/workbook.xml.rels")
  if (relsTxt) {
    for (const r of hijos(xml(relsTxt), "Relationship")) {
      const destino = r.getAttribute("Target") ?? ""
      rels.set(r.getAttribute("Id") ?? "", destino.startsWith("/") ? destino.slice(1) : `xl/${destino}`.replace(/xl\/\.\.\//, ""))
    }
  }

  // Textos compartidos. Las hojas y los textos se recorren con expresiones
  // regulares en vez de DOMParser: con miles de filas es muchísimo más rápido.
  const textos: string[] = []
  const ssTxt = await leerTextoZip(zip, "xl/sharedStrings.xml")
  if (ssTxt) {
    for (const m of ssTxt.matchAll(/<(?:\w+:)?si>([\s\S]*?)<\/(?:\w+:)?si>/g)) textos.push(textoDeRuns(m[1]))
  }

  // Estilos: qué índices de formato son fechas
  const estiloEsFecha: boolean[] = []
  const estilosTxt = await leerTextoZip(zip, "xl/styles.xml")
  if (estilosTxt) {
    const estilos = xml(estilosTxt)
    const propios = new Map<number, string>()
    for (const f of hijos(estilos, "numFmt")) propios.set(Number(f.getAttribute("numFmtId")), f.getAttribute("formatCode") ?? "")
    const xfs = hijos(estilos, "cellXfs")[0]
    if (xfs) {
      for (const xf of Array.from(xfs.children).filter((e) => e.localName === "xf")) {
        const id = Number(xf.getAttribute("numFmtId") ?? 0)
        estiloEsFecha.push(FORMATOS_FECHA_PREDEFINIDOS.has(id) || (propios.has(id) && esFormatoFecha(propios.get(id)!)))
      }
    }
  }

  const hojas: Hoja[] = []
  for (const s of hijos(libro, "sheet")) {
    const nombre = s.getAttribute("name") ?? `Hoja ${hojas.length + 1}`
    if ((s.getAttribute("state") ?? "") === "veryHidden") continue
    const rid = s.getAttribute("r:id") ?? Array.from(s.attributes).find((a) => a.localName === "id")?.value ?? ""
    const ruta = rels.get(rid) ?? `xl/worksheets/sheet${hojas.length + 1}.xml`
    const hojaTxt = await leerTextoZip(zip, ruta)
    if (!hojaTxt) continue
    const grilla: Celda[][] = []
    for (const fila of hojaTxt.matchAll(/<(?:\w+:)?row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?row>)/g)) {
      const rAttr = atributo(fila[1], "r")
      const r = rAttr ? Number(rAttr) - 1 : grilla.length
      const valores: Celda[] = []
      let siguiente = 0
      for (const c of (fila[2] ?? "").matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g)) {
        const attrs = c[1]
        const interior = c[2] ?? ""
        const ref = atributo(attrs, "r")
        const col = ref ? indiceColumna(ref) : siguiente
        siguiente = col + 1
        const tipo = atributo(attrs, "t") ?? "n"
        const vm = interior.match(/<(?:\w+:)?v>([\s\S]*?)<\/(?:\w+:)?v>/)
        const v = vm ? decodificarEntidades(vm[1]) : null
        let valor: Celda = null
        if (tipo === "s") valor = v === null ? null : (textos[Number(v)] ?? "")
        else if (tipo === "inlineStr") valor = textoDeRuns(interior)
        else if (tipo === "str") valor = v
        else if (tipo === "b") valor = v === "1"
        else if (tipo === "e") valor = null
        else if (tipo === "d") valor = v ? new Date(v) : null
        else if (v !== null && v !== "") {
          const n = Number(v)
          const s = Number(atributo(attrs, "s") ?? 0)
          valor = Number.isFinite(n) && estiloEsFecha[s] ? fechaDeSerial(n, base1904) : n
        }
        valores[col] = valor
      }
      grilla[r] = Array.from(valores, (x) => (x === undefined ? null : x))
    }
    hojas.push({ nombre, grilla: Array.from(grilla, (f) => f ?? []) })
  }
  return hojas
}

async function leerOds(zip: Map<string, EntradaZip>): Promise<Hoja[]> {
  const contenido = await leerTextoZip(zip, "content.xml")
  if (!contenido) throw new ErrorImportacion("No se encontró el contenido de la planilla.")
  const doc = xml(contenido)
  const hojas: Hoja[] = []
  for (const tabla of hijos(doc, "table")) {
    const nombre = atr(tabla, "table:name") ?? `Hoja ${hojas.length + 1}`
    const grilla: Celda[][] = []
    for (const fila of hijos(tabla, "table-row")) {
      const valores: Celda[] = []
      for (const celda of Array.from(fila.children).filter((e) => e.localName === "table-cell" || e.localName === "covered-table-cell")) {
        const tipo = atr(celda, "office:value-type")
        let valor: Celda = null
        if (tipo === "float" || tipo === "currency" || tipo === "percentage") valor = Number(atr(celda, "office:value"))
        else if (tipo === "date") { const d = atr(celda, "office:date-value"); valor = d ? new Date(d.length === 10 ? `${d}T00:00:00Z` : d) : null }
        else if (tipo === "boolean") valor = atr(celda, "office:boolean-value") === "true"
        else { const t = hijos(celda, "p").map((p) => p.textContent ?? "").join("\n"); valor = t === "" ? null : t }
        // Las celdas vacías repetidas al final de la fila pueden ser miles: no se expanden.
        const rep = Math.min(Number(atr(celda, "table:number-columns-repeated") ?? 1), valor === null ? 1 : 1000)
        for (let i = 0; i < rep; i++) valores.push(valor)
      }
      const repFilas = Number(atr(fila, "table:number-rows-repeated") ?? 1)
      const vacia = valores.every((v) => v === null)
      for (let i = 0; i < (vacia ? Math.min(repFilas, 1) : Math.min(repFilas, 1000)); i++) grilla.push(valores)
    }
    hojas.push({ nombre, grilla })
  }
  return hojas
}

export async function leerPlanillaZip(zip: Map<string, EntradaZip>): Promise<Hoja[]> {
  if (zip.has("xl/workbook.xml")) return leerXlsx(zip)
  if (zip.has("content.xml")) return leerOds(zip)
  throw new ErrorImportacion("El archivo comprimido no es una planilla de Excel ni de LibreOffice.")
}
