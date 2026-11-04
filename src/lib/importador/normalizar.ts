// Limpieza de cada valor según el campo de destino. Todas las funciones son
// puras (sin efectos) para poder probarlas una por una.
import type { Celda } from "./tipos"

export type Sexo = "Masculino" | "Femenino" | "Otro"
export type TipoDocumento = "DNI" | "Pasaporte" | "Cédula"
export type OrdenFechas = "dmy" | "mdy" | "ymd"
export type OrdenNombre = "auto" | "apellido_nombre" | "nombre_apellido"

const VACIOS = /^(-+|\.+|_+|\*+|\?+|s\/?d|s\/?datos?|sin datos?|sin informar|no informa|n\/?a|null|none|nil|nan|undefined|#n\/?a|#¡?valor!?|#value!|#ref!|ninguno|no tiene|no posee|no aplica|desconocido)$/i

/** Texto limpio de una celda (sin espacios raros ni saltos de línea). */
export function limpiar(v: Celda | undefined): string {
  if (v === null || v === undefined) return ""
  let s: string
  if (v instanceof Date) s = isNaN(v.getTime()) ? "" : v.toISOString().slice(0, 10)
  else if (typeof v === "number") s = Number.isInteger(v) ? String(v) : String(v)
  else if (typeof v === "boolean") s = v ? "Sí" : "No"
  else s = v
  s = s.replace(/[​-‍﻿]/g, "").replace(/[ \t\r\n]+/g, " ").replace(/\s+/g, " ").trim()
  return VACIOS.test(s) ? "" : s
}

/* ─── Nombres ─────────────────────────────────────────────────────────── */

const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y", "e", "da", "das", "do", "dos", "di", "van", "von", "der", "den", "du", "le", "lo", "el", "mc", "san", "santa"])

/** "GARCÍA PÉREZ" o "garcía pérez" → "García Pérez". Si ya viene con mayúsculas y minúsculas, no se toca. */
export function capitalizar(s: string): string {
  const letras = s.replace(/[^\p{L}]/gu, "")
  if (!letras) return s
  const todoMayus = letras === letras.toUpperCase()
  const todoMinus = letras === letras.toLowerCase()
  if (!todoMayus && !todoMinus) return s
  return s
    .toLowerCase()
    .split(" ")
    .map((palabra, i) => {
      if (i > 0 && PARTICULAS.has(palabra) && palabra !== "mc") return palabra
      return palabra.replace(/(^|[-'’´])(\p{L})/gu, (_, sep, l) => sep + l.toUpperCase())
    })
    .join(" ")
}

/** Saca de un nombre lo que no es nombre: asteriscos, números de afiliado o notas entre paréntesis. */
export function limpiarNombre(s: string): string {
  return s
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[*#_"“”]+/g, " ")
    .replace(/\s\d[\d\s./-]*$/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,.-]+|[\s,.-]+$/g, "")
    .trim()
}

function agruparParticulas(palabras: string[]): string[] {
  // "de la Fuente" queda como una sola pieza del apellido.
  const grupos: string[] = []
  for (let i = 0; i < palabras.length; i++) {
    let g = palabras[i]
    while (PARTICULAS.has(palabras[i].toLowerCase()) && i + 1 < palabras.length) { i++; g += ` ${palabras[i]}` }
    grupos.push(g)
  }
  return grupos
}

/**
 * Separa "GARCÍA, Juan Carlos", "GARCIA JUAN CARLOS" o "Juan Carlos García".
 * Con orden "auto": si hay coma, lo de antes es el apellido; si el principio
 * está en mayúsculas y el resto no ("GARCÍA Juan"), las mayúsculas son el apellido.
 */
export function partirNombreCompleto(entrada: string, orden: OrdenNombre): { apellido: string; nombre: string } {
  const s = limpiarNombre(entrada)
  if (!s) return { apellido: "", nombre: "" }
  if (s.includes(",")) {
    const [ape, ...resto] = s.split(",")
    return { apellido: ape.trim(), nombre: resto.join(" ").trim() }
  }
  const palabras = s.split(" ").filter(Boolean)
  if (palabras.length === 1) return { apellido: palabras[0], nombre: "" }
  let modo = orden
  if (modo === "auto") {
    const esMayus = (p: string) => /\p{L}{2,}/u.test(p) && p === p.toUpperCase()
    const k = palabras.findIndex((p) => !esMayus(p))
    if (k > 0 && palabras.slice(k).every((p) => !esMayus(p))) {
      return { apellido: palabras.slice(0, k).join(" "), nombre: palabras.slice(k).join(" ") }
    }
    if (k === 0) {
      const ultimas = palabras.findIndex((p) => esMayus(p))
      if (ultimas > 0 && palabras.slice(ultimas).every(esMayus)) {
        return { nombre: palabras.slice(0, ultimas).join(" "), apellido: palabras.slice(ultimas).join(" ") }
      }
    }
    modo = "apellido_nombre"
  }
  if (modo === "apellido_nombre") {
    const grupos = agruparParticulas(palabras)
    // 2 palabras: 1 + 1 · 3: 1 apellido + 2 nombres · 4 o más: 2 apellidos + el resto
    const cantApellido = grupos.length <= 3 ? 1 : 2
    return { apellido: grupos.slice(0, cantApellido).join(" "), nombre: grupos.slice(cantApellido).join(" ") }
  }
  // nombre_apellido: las partículas van con el apellido que les sigue ("Juan de la Fuente").
  let corte = palabras.length <= 3 ? palabras.length - 1 : palabras.length - 2
  while (corte > 1 && PARTICULAS.has(palabras[corte - 1].toLowerCase())) corte--
  return { nombre: palabras.slice(0, corte).join(" "), apellido: palabras.slice(corte).join(" ") }
}

/* ─── Documento ───────────────────────────────────────────────────────── */

const PREFIJO_DOC = /^(d\.?\s?n\.?\s?i\.?|l\.?\s?e\.?|l\.?\s?c\.?|c\.?\s?i\.?|cuil|cuit|pasaporte|pas\.?|pass(port)?|doc(umento)?|c[eé]dula|nro\.?|n[º°]|#)[\s:.#º°-]*/i

export function tipoDocumentoDe(v: Celda): TipoDocumento | null {
  const s = limpiar(v).toLowerCase().replace(/[^a-z]/g, "")
  if (!s) return null
  if (/^(pas|pasaporte|passport|pass|p)$/.test(s)) return "Pasaporte"
  if (/^(ci|cedula|cedulaidentidad|cid|ced)$/.test(s)) return "Cédula"
  if (/^(dni|du|le|lc|cuil|cuit|documento|doc|d|dnie|ext|dniextranjero)$/.test(s)) return "DNI"
  return null
}

export interface DocumentoLimpio { numero: string | null; tipo?: TipoDocumento; aviso?: string; problema?: string }

export function documentoDe(v: Celda): DocumentoLimpio {
  if (typeof v === "number") v = Number.isInteger(v) ? String(v) : String(Math.round(v))
  let s = limpiar(v)
  if (!s) return { numero: null }
  let tipo: TipoDocumento | undefined
  const pref = s.match(PREFIJO_DOC)
  if (pref) {
    const p = pref[1].toLowerCase().replace(/[^a-z]/g, "")
    if (p.startsWith("pas")) tipo = "Pasaporte"
    else if (p === "ci" || p.startsWith("c") && p.includes("dula")) tipo = "Cédula"
    s = s.slice(pref[0].length)
  }
  // "30365357.0" (número de Excel guardado como texto), pero no "20.000.000" (DNI con puntos).
  if (/^\d+\.0+$/.test(s)) s = s.replace(/\.0+$/, "")
  const digitos = s.replace(/[\s.,\-/]/g, "")
  if (/^\d+$/.test(digitos)) {
    if (/^0+$/.test(digitos) || /^(\d)\1+$/.test(digitos) && digitos.length >= 6) return { numero: null }
    if (digitos.length === 11 && /^(20|23|24|27|30|33|34)/.test(digitos)) {
      return { numero: String(Number(digitos.slice(2, 10))), tipo: tipo ?? "DNI", aviso: "Se tomó el DNI del CUIL/CUIT" }
    }
    const numero = digitos.replace(/^0+(?=\d{6})/, "")
    if (numero.length < 5) return { numero: null, problema: `Documento demasiado corto (${s})` }
    if (numero.length > 12) return { numero: null, problema: `Documento demasiado largo (${s})` }
    return { numero, tipo, aviso: numero.length > 9 && !tipo ? "El documento tiene más de 9 dígitos" : undefined }
  }
  const alfa = s.replace(/[\s.\-/]/g, "").toUpperCase()
  if (/^[A-Z0-9]{5,20}$/.test(alfa) && /\d/.test(alfa)) return { numero: alfa, tipo: tipo ?? "Pasaporte" }
  return { numero: null, problema: `Documento no válido (${s})` }
}

/* ─── Fechas ──────────────────────────────────────────────────────────── */

const MESES: Record<string, number> = {
  ene: 1, enero: 1, jan: 1, january: 1, feb: 2, febrero: 2, february: 2, mar: 3, marzo: 3, march: 3,
  abr: 4, abril: 4, apr: 4, april: 4, may: 5, mayo: 5, jun: 6, junio: 6, june: 6, jul: 7, julio: 7, july: 7,
  ago: 8, agosto: 8, aug: 8, august: 8, sep: 9, sept: 9, set: 9, septiembre: 9, setiembre: 9, september: 9,
  oct: 10, octubre: 10, october: 10, nov: 11, noviembre: 11, november: 11, dic: 12, diciembre: 12, dec: 12, december: 12,
}

/** Divide "15/03/1980", "15-mar-80" o "1980.03.15" en tres números (el mes con nombre se convierte). */
export function partesFecha(s: string): [number, number, number] | null {
  const limpio = s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\b(de|del)\b/g, " ").replace(/[t ]\d{1,2}:\d{2}(:\d{2}(\.\d+)?)?(z|[+-]\d{2}:?\d{2})?\s*(hs|h|am|pm)?$/i, "").trim()
  const partes = limpio.split(/[\s/\-.,]+/).filter(Boolean)
  if (partes.length !== 3) return null
  const conNombre = partes.findIndex((p) => MESES[p] !== undefined)
  if (conNombre >= 0) {
    const mes = MESES[partes[conNombre]]
    const otros = partes.filter((_, i) => i !== conNombre).map(Number)
    if (otros.some((x) => !Number.isFinite(x))) return null
    // "15 marzo 1980" y "marzo 15 1980" → [15, 3, 1980]; "1980 mar 15" → [15, 3, 1980]
    const [a, b] = otros
    return a > 31 ? [b, mes, a] : [a, mes, b]
  }
  if (!partes.every((p) => /^\d{1,4}$/.test(p))) return null
  return partes.map(Number) as [number, number, number]
}

const aIso = (a: number, m: number, d: number) => `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`

function validarFecha(anio: number, mes: number, dia: number, hoy: Date): { valor: string | null; problema?: string } {
  if (anio < 100) anio += anio > hoy.getFullYear() % 100 ? 1900 : 2000
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return { valor: null, problema: "fecha inválida" }
  const f = new Date(Date.UTC(anio, mes - 1, dia))
  if (f.getUTCMonth() !== mes - 1) return { valor: null, problema: "fecha inválida" }
  // Fechas "vacías" que dejan algunos sistemas.
  if (anio <= 1900 || (anio === 1899)) return { valor: null }
  if (f.getTime() > Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) return { valor: null, problema: "fecha en el futuro" }
  if (anio < hoy.getFullYear() - 120) return { valor: null, problema: "más de 120 años" }
  return { valor: aIso(anio, mes, dia) }
}

/** Convierte cualquier forma de fecha a "AAAA-MM-DD". Devuelve problema si no se pudo. */
export function parsearFecha(v: Celda, orden: OrdenFechas, hoy = new Date()): { valor: string | null; problema?: string } {
  if (v === null || v === undefined || v === "") return { valor: null }
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return { valor: null }
    // Fechas guardadas a la medianoche de Argentina (03:00 UTC) o en UTC: se usa el día UTC,
    // salvo que la hora UTC sea de la tarde-noche del día anterior en Argentina.
    const corrida = v.getUTCHours() >= 21 ? new Date(v.getTime() + 3 * 3600000) : v
    return validarFecha(corrida.getUTCFullYear(), corrida.getUTCMonth() + 1, corrida.getUTCDate(), hoy)
  }
  if (typeof v === "number") {
    if (Number.isInteger(v) && v >= 1010190 && v <= 31129999) {
      // 19800315 (año-mes-día) o 15031980 (día-mes-año): se usa la que dé una fecha válida.
      const amd = v >= 19000101 && v <= 21001231 ? validarFecha(Math.floor(v / 10000), Math.floor(v / 100) % 100, v % 100, hoy) : null
      if (amd?.valor) return amd
      const dma = validarFecha(v % 10000, Math.floor(v / 10000) % 100, Math.floor(v / 1000000), hoy)
      return dma.valor ? dma : (amd ?? dma)
    }
    if (v > 0 && v < 80000) {
      if (Number.isInteger(v) && v >= 1900 && v <= hoy.getFullYear()) return { valor: null, problema: "solo tiene el año" }
      const f = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000)
      return validarFecha(f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate(), hoy)
    }
    return { valor: null, problema: "fecha inválida" }
  }
  const s = limpiar(v)
  if (!s) return { valor: null }
  if (/^0{1,4}[/\-.]0{1,2}[/\-.]0{1,4}$/.test(s)) return { valor: null }
  // ISO (con o sin hora): siempre año-mes-día.
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/)
  if (iso) {
    if (/T\d{2}:\d{2}.*(Z|[+-]\d{2}:?\d{2})$/.test(s)) {
      const d = new Date(s)
      if (!isNaN(d.getTime())) return parsearFecha(d, orden, hoy)
    }
    return validarFecha(+iso[1], +iso[2], +iso[3], hoy)
  }
  if (/^\d{7,8}$/.test(s)) return parsearFecha(Number(s), orden, hoy)
  if (/^\d{4,5}(\.\d+)?$/.test(s)) return parsearFecha(Number(s), orden, hoy)
  const p = partesFecha(s)
  if (!p) return { valor: null, problema: `no se entiende la fecha (${s})` }
  const tieneNombreMes = /[a-z]{3,}/i.test(s)
  if (tieneNombreMes) return validarFecha(p[2], p[1], p[0], hoy)
  if (p[0] > 31 || orden === "ymd") return validarFecha(p[0], p[1], p[2], hoy)
  // Si el primer número no puede ser mes, es día/mes aunque la columna diga mes/día.
  if (orden === "mdy" && p[0] <= 12) return validarFecha(p[2], p[0], p[1], hoy)
  if (p[1] > 12 && p[0] <= 12) return validarFecha(p[2], p[0], p[1], hoy)
  return validarFecha(p[2], p[1], p[0], hoy)
}

/** Fecha a partir de columnas separadas de día, mes y año. */
export function fechaDePartes(dia: Celda, mes: Celda, anio: Celda, hoy = new Date()) {
  const d = Number(limpiar(dia))
  const m = MESES[limpiar(mes).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")] ?? Number(limpiar(mes))
  const a = Number(limpiar(anio))
  if (!d && !m && !a) return { valor: null }
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(a) || !d || !m || !a) return { valor: null, problema: "fecha incompleta" }
  return validarFecha(a, m, d, hoy)
}

/* ─── Sexo ────────────────────────────────────────────────────────────── */

const SEXO: Record<string, Sexo> = {
  m: "Masculino", masc: "Masculino", masculino: "Masculino", hombre: "Masculino", h: "Masculino", varon: "Masculino", v: "Masculino", male: "Masculino", man: "Masculino", nino: "Masculino",
  f: "Femenino", fem: "Femenino", femenino: "Femenino", mujer: "Femenino", female: "Femenino", woman: "Femenino", w: "Femenino", nina: "Femenino",
  x: "Otro", otro: "Otro", otra: "Otro", nb: "Otro", "no binario": "Otro", "no binarie": "Otro", other: "Otro", o: "Otro",
}

/** Reconoce el sexo. Los códigos numéricos (1/2) son ambiguos y se dejan para que los elija la clínica. */
export function sexoDe(v: Celda, _estricto = false): Sexo | null {
  const s = limpiar(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z ]/g, "").trim()
  return SEXO[s] ?? null
}

/** Clave para agrupar valores distintos de una columna (para el mapeo manual de valores). */
export const claveValor = (v: Celda) => limpiar(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim()

/* ─── Contacto ────────────────────────────────────────────────────────── */

function desarmarListaJson(s: string): string[] | null {
  if (!/^\[.*\]$/.test(s)) return null
  try {
    const lista = JSON.parse(s)
    return Array.isArray(lista) ? lista.map((x) => String(x ?? "")).filter(Boolean) : null
  } catch {
    return null
  }
}

export function telefonosDe(v: Celda): { principal: string | null; otros: string[]; problema?: string } {
  if (typeof v === "number") {
    if (!Number.isInteger(v)) return { principal: null, otros: [], problema: "teléfono dañado por Excel (formato numérico)" }
    v = String(v)
  }
  const s = limpiar(v)
  if (!s) return { principal: null, otros: [] }
  if (desarmarListaJson(s)?.length === 0) return { principal: null, otros: [] }
  if (/^\d(\.\d+)?e\+\d+$/i.test(s.replace(",", "."))) return { principal: null, otros: [], problema: `teléfono dañado por Excel (${s})` }
  const partes = (desarmarListaJson(s) ?? s.split(/\s*(?:[;|/]|,(?!\d{3}\b)|\s+(?:y|o|ó)\s+|\s{2,})\s*/i))
    .map((p) => p.replace(/[^\d+()\- ]/g, " ").replace(/\s+/g, " ").trim().replace(/^[-\s]+|[-\s]+$/g, ""))
    .filter((p) => p.replace(/\D/g, "").length >= 6)
  if (!partes.length) return { principal: null, otros: [], problema: `teléfono no válido (${s})` }
  return { principal: partes[0].slice(0, 50), otros: partes.slice(1) }
}

const RE_EMAIL = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi

export function emailsDe(v: Celda): { principal: string | null; otros: string[]; problema?: string } {
  const s = limpiar(v)
  if (!s) return { principal: null, otros: [] }
  if (desarmarListaJson(s)?.length === 0) return { principal: null, otros: [] }
  const lista = (desarmarListaJson(s) ?? [s]).join(" ").replace(/\s*\[at\]\s*|\s+@\s+/gi, "@")
  const encontrados = [...new Set((lista.match(RE_EMAIL) ?? []).map((e) => e.toLowerCase().replace(/\.+$/, "")))]
  if (!encontrados.length) {
    // "sin mail", "no tiene", "pedir": no es un intento de email, es una celda vacía.
    // Solo se avisa si parece un email mal escrito (ej.: "juan.gmail.com", "juan@gmail").
    const pareceEmail = /@/.test(s) || /^[^\s]+\.(com|net|org|ar|es)(\.[a-z]{2})?$/i.test(s)
    return pareceEmail ? { principal: null, otros: [], problema: `email no válido (${s})` } : { principal: null, otros: [] }
  }
  return { principal: encontrados[0], otros: encontrados.slice(1) }
}

/* ─── Obra social ─────────────────────────────────────────────────────── */

const SIN_OBRA = /^(particular(es)?|part|sin obra social|sin os|s os|sos|sin cobertura|ninguna|ninguno|no tiene|no posee|privado|privada|no|0|n a|na)$/

export const claveObraSocial = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "")

export function esSinObraSocial(s: string): boolean {
  return SIN_OBRA.test(s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim())
}

/** Saca el plan pegado al nombre: "OSDE 210" → { nombre: "OSDE", plan: "210" }. */
export function separarPlan(s: string): { nombre: string; plan?: string } {
  const m = s.match(/^(.*?\p{L}.*?)(?:\s*[-–(]\s*|\s+)(?:plan\s*)?([A-Z]{0,3}\d{2,4}[A-Z]?|plan\s+\S+)\)?$/iu)
  if (m && m[1].trim().length >= 2 && !/\d/.test(m[1])) return { nombre: m[1].trim(), plan: m[2].replace(/^plan\s+/i, "").trim() }
  return { nombre: s }
}
