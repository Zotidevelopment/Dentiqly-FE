// Lectura de volcados .sql (MySQL/MariaDB, PostgreSQL, SQL Server, SQLite).
// No ejecuta nada: recorre el texto buscando CREATE TABLE (para los nombres de
// columnas), INSERT INTO … VALUES (…) y COPY … FROM stdin (pg_dump).
import { ErrorImportacion, type Celda } from "./tipos"

export interface TablaSql {
  nombre: string
  columnas: string[]
  filas: Celda[][]
}

const PALABRAS_NO_COLUMNA = /^(primary|key|unique|constraint|index|foreign|check|fulltext|spatial|exclude|period|like)$/i

/** Saca comillas/corchetes de un identificador y se queda con la última parte (esquema.tabla → tabla). */
export function limpiarIdentificador(id: string): string {
  const partes: string[] = []
  let actual = "", cierre = ""
  for (const c of id.trim()) {
    if (cierre) { if (c === cierre) cierre = ""; else actual += c; continue }
    if (c === "`" || c === '"') { cierre = c; continue }
    if (c === "[") { cierre = "]"; continue }
    if (c === ".") { partes.push(actual); actual = ""; continue }
    actual += c
  }
  partes.push(actual)
  return partes[partes.length - 1].trim()
}

class Lector {
  i = 0
  constructor(private s: string) {}

  saltarEspaciosYComentarios() {
    const s = this.s
    for (;;) {
      while (this.i < s.length && /\s/.test(s[this.i])) this.i++
      if (s.startsWith("--", this.i) || (s[this.i] === "#" && (this.i === 0 || s[this.i - 1] === "\n"))) {
        const fin = s.indexOf("\n", this.i)
        this.i = fin < 0 ? s.length : fin + 1
      } else if (s.startsWith("/*", this.i)) {
        const fin = s.indexOf("*/", this.i + 2)
        this.i = fin < 0 ? s.length : fin + 2
      } else return
    }
  }

  /** Lee un literal de texto '…' con escapes de MySQL (\') y de SQL estándar (''). */
  leerTexto(): string {
    const s = this.s
    const comilla = s[this.i]
    this.i++
    let r = ""
    while (this.i < s.length) {
      const c = s[this.i]
      if (c === "\\" && comilla === "'") {
        const n = s[this.i + 1]
        r += n === "n" ? "\n" : n === "r" ? "\r" : n === "t" ? "\t" : n === "0" ? "" : n ?? ""
        this.i += 2
        continue
      }
      if (c === comilla) {
        if (s[this.i + 1] === comilla) { r += comilla; this.i += 2; continue }
        this.i++
        return r
      }
      r += c
      this.i++
    }
    return r
  }

  /** Lee un valor dentro de VALUES (…): texto, número, NULL o una expresión (NOW(), CAST(…)). */
  leerValor(): Celda {
    this.saltarEspaciosYComentarios()
    const s = this.s
    // Prefijos: N'…' (SQL Server), E'…' (PostgreSQL), _utf8'…' (MySQL), X'…' (binario)
    const prefijo = s.slice(this.i, this.i + 8).match(/^(N|E|_utf8mb4|_utf8|_latin1|_binary)'/i)
    if (prefijo) this.i += prefijo[1].length
    if (s[this.i] === "'" ) {
      const texto = this.leerTexto()
      // ::date, ::text de PostgreSQL
      while (s.startsWith("::", this.i)) { this.i += 2; while (/[\w\s()[\]]/.test(s[this.i] ?? "") && s[this.i] !== ")" ) this.i++ }
      return texto
    }
    // Expresión hasta la coma o paréntesis de cierre del mismo nivel.
    let nivel = 0, inicio = this.i
    while (this.i < s.length) {
      const c = s[this.i]
      if (c === "'") { this.leerTexto(); continue }
      if (c === "(") nivel++
      else if (c === ")") { if (nivel === 0) break; nivel-- }
      else if (c === "," && nivel === 0) break
      this.i++
    }
    const crudo = s.slice(inicio, this.i).trim()
    if (/^null$/i.test(crudo) || crudo === "") return null
    if (/^(true|false)$/i.test(crudo)) return /^true$/i.test(crudo)
    if (/^[-+]?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(crudo)) {
      // Los DNI y teléfonos largos se guardan como texto para no perder ceros ni dígitos.
      return /^0\d/.test(crudo) || crudo.replace(/\D/g, "").length > 15 ? crudo : Number(crudo)
    }
    // CAST('1980-01-01' AS DATE), CONVERT(…), etc.: se usa el primer texto adentro.
    const texto = crudo.match(/'((?:[^']|'')*)'/)
    return texto ? texto[1].replace(/''/g, "'") : crudo
  }

  leerTupla(): Celda[] | null {
    this.saltarEspaciosYComentarios()
    if (this.s[this.i] !== "(") return null
    this.i++
    const valores: Celda[] = []
    for (;;) {
      valores.push(this.leerValor())
      this.saltarEspaciosYComentarios()
      const c = this.s[this.i]
      if (c === ",") { this.i++; continue }
      if (c === ")") { this.i++; return valores }
      return valores
    }
  }

  /** Lee "(col1, col2, …)" y devuelve los nombres. */
  leerListaColumnas(): string[] {
    this.saltarEspaciosYComentarios()
    if (this.s[this.i] !== "(") return []
    const fin = this.cierreParentesis(this.i)
    const interior = this.s.slice(this.i + 1, fin)
    this.i = fin + 1
    return dividirNivelSuperior(interior).map(limpiarIdentificador)
  }

  cierreParentesis(desde: number): number {
    const s = this.s
    let nivel = 0
    for (let j = desde; j < s.length; j++) {
      const c = s[j]
      if (c === "'" || c === '"' || c === "`") {
        const cierre = c
        j++
        while (j < s.length && !(s[j] === cierre && s[j - 1] !== "\\")) j++
        continue
      }
      if (c === "(") nivel++
      else if (c === ")") { nivel--; if (nivel === 0) return j }
    }
    return s.length
  }

  leerIdentificador(): string {
    this.saltarEspaciosYComentarios()
    const m = this.s.slice(this.i, this.i + 400).match(/^((?:`[^`]+`|"[^"]+"|\[[^\]]+\]|[\w$]+)(?:\s*\.\s*(?:`[^`]+`|"[^"]+"|\[[^\]]+\]|[\w$]+))*)/)
    if (!m) return ""
    this.i += m[1].length
    return limpiarIdentificador(m[1])
  }
}

function dividirNivelSuperior(texto: string): string[] {
  const partes: string[] = []
  let nivel = 0, actual = "", comilla = ""
  for (const c of texto) {
    if (comilla) { actual += c; if (c === comilla) comilla = ""; continue }
    if (c === "'" || c === '"' || c === "`") { comilla = c; actual += c; continue }
    if (c === "(") nivel++
    if (c === ")") nivel--
    if (c === "," && nivel === 0) { partes.push(actual.trim()); actual = ""; continue }
    actual += c
  }
  if (actual.trim()) partes.push(actual.trim())
  return partes
}

function columnasDeCreate(definiciones: string): string[] {
  return dividirNivelSuperior(definiciones)
    .map((d) => d.trim())
    .filter((d) => d && !PALABRAS_NO_COLUMNA.test(d.split(/\s+/)[0]))
    .map((d) => {
      const m = d.match(/^(`[^`]+`|"[^"]+"|\[[^\]]+\]|[\w$]+)/)
      return m ? limpiarIdentificador(m[1]) : ""
    })
    .filter(Boolean)
}

function valorCopy(v: string): Celda {
  if (v === "\\N") return null
  return v.replace(/\\(.)/g, (_, c) => (c === "t" ? "\t" : c === "n" ? "\n" : c === "r" ? "\r" : c))
}

export function parsearSql(texto: string): TablaSql[] {
  if (texto.startsWith("SQLite format 3")) {
    throw new ErrorImportacion("Es una base SQLite (archivo binario), no un volcado de texto. Exportala con “.dump” o a CSV y subí ese archivo.")
  }
  const tablas = new Map<string, TablaSql>()
  const tabla = (nombre: string) => {
    const clave = nombre.toLowerCase()
    if (!tablas.has(clave)) tablas.set(clave, { nombre, columnas: [], filas: [] })
    return tablas.get(clave)!
  }
  const lector = new Lector(texto)
  const s = texto
  // SQL Server (SSMS) genera "INSERT [dbo].[Tabla] (…) VALUES", sin INTO.
  const patron = /\b(CREATE\s+(?:TEMPORARY\s+|TEMP\s+|UNLOGGED\s+)?TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+|INSERT\s+(?:(?:LOW_PRIORITY|DELAYED|HIGH_PRIORITY|IGNORE|OR\s+\w+)\s+)*(?:INTO\s+)?|REPLACE\s+INTO\s+|COPY\s+)/gi
  let m: RegExpExecArray | null
  while ((m = patron.exec(s))) {
    lector.i = m.index + m[0].length
    const tipo = m[1].trim().toUpperCase()
    const nombre = lector.leerIdentificador()
    if (!nombre) continue
    if (tipo.startsWith("CREATE")) {
      lector.saltarEspaciosYComentarios()
      if (s[lector.i] !== "(") continue
      const fin = lector.cierreParentesis(lector.i)
      const t = tabla(nombre)
      if (!t.columnas.length) t.columnas = columnasDeCreate(s.slice(lector.i + 1, fin))
      patron.lastIndex = fin + 1
    } else if (tipo === "COPY") {
      const cols = lector.leerListaColumnas()
      const lineaFin = s.indexOf("\n", lector.i)
      if (lineaFin < 0 || !/FROM\s+stdin/i.test(s.slice(lector.i, lineaFin))) continue
      const t = tabla(nombre)
      if (cols.length) t.columnas = cols
      let p = lineaFin + 1
      while (p < s.length) {
        let fin = s.indexOf("\n", p)
        if (fin < 0) fin = s.length
        const linea = s.slice(p, fin).replace(/\r$/, "")
        p = fin + 1
        if (linea === "\\.") break
        t.filas.push(linea.split("\t").map(valorCopy))
      }
      patron.lastIndex = p
    } else {
      const cols = lector.leerListaColumnas()
      lector.saltarEspaciosYComentarios()
      const resto = s.slice(lector.i, lector.i + 12)
      if (!/^VALUES?\b/i.test(resto)) continue
      lector.i += resto.match(/^VALUES?/i)![0].length
      const t = tabla(nombre)
      if (cols.length && !t.columnas.length) t.columnas = cols
      const orden = cols.length && t.columnas.length ? cols.map((c) => t.columnas.findIndex((x) => x.toLowerCase() === c.toLowerCase())) : null
      for (;;) {
        const tupla = lector.leerTupla()
        if (!tupla) break
        if (orden && orden.every((x) => x >= 0)) {
          const fila: Celda[] = new Array(t.columnas.length).fill(null)
          orden.forEach((dest, k) => (fila[dest] = tupla[k]))
          t.filas.push(fila)
        } else t.filas.push(tupla)
        lector.saltarEspaciosYComentarios()
        if (s[lector.i] === ",") { lector.i++; continue }
        break
      }
      patron.lastIndex = lector.i
    }
  }
  const resultado = [...tablas.values()].filter((t) => t.filas.length)
  for (const t of resultado) {
    const ancho = Math.max(t.columnas.length, ...t.filas.slice(0, 500).map((f) => f.length))
    for (let k = t.columnas.length; k < ancho; k++) t.columnas.push(`columna_${k + 1}`)
  }
  return resultado
}
