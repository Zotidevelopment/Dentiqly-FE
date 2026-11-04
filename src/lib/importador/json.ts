// JSON (exportaciones de APIs, MongoDB, Firebase…): busca las listas de objetos
// y las convierte en tablas. Los objetos anidados se aplanan ("obra_social.nombre").
import { ErrorImportacion, type Celda } from "./tipos"

export interface TablaJson {
  nombre: string
  columnas: string[]
  filas: Celda[][]
}

const esObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v)

export function aplanar(obj: Record<string, unknown>, prefijo = "", destino: Record<string, Celda> = {}, nivel = 0) {
  for (const [k, v] of Object.entries(obj)) {
    const clave = prefijo ? `${prefijo}.${k}` : k
    if (v === null || v === undefined) destino[clave] = null
    else if (esObjeto(v)) {
      // Formatos extendidos de MongoDB: {"$date": …}, {"$oid": …}, {"$numberLong": …}
      const especial = v.$date ?? v.$oid ?? v.$numberLong ?? v.$numberInt ?? v.$numberDecimal
      if (especial !== undefined) destino[clave] = esObjeto(especial) ? String(especial.$numberLong ?? JSON.stringify(especial)) : (especial as Celda)
      else if (nivel < 3) aplanar(v, clave, destino, nivel + 1)
      else destino[clave] = JSON.stringify(v)
    } else if (Array.isArray(v)) {
      destino[clave] = v.every((x) => !esObjeto(x) && !Array.isArray(x)) ? v.filter((x) => x !== null && x !== "").join(", ") || null : JSON.stringify(v)
    } else destino[clave] = v as Celda
  }
  return destino
}

function buscarListas(v: unknown, ruta: string, salida: { ruta: string; lista: Record<string, unknown>[] }[], nivel: number) {
  if (Array.isArray(v)) {
    const objetos = v.filter(esObjeto)
    if (objetos.length && objetos.length >= v.length * 0.8) { salida.push({ ruta, lista: objetos }); return }
  }
  if (esObjeto(v) && nivel < 4) {
    // Un objeto de objetos (Firebase: {"id1": {...}, "id2": {...}}) también es una lista.
    const valores = Object.values(v)
    if (valores.length >= 3 && valores.every(esObjeto)) {
      const claves = new Set(Object.keys(valores[0] as object))
      const parecidos = valores.filter((x) => Object.keys(x as object).some((k) => claves.has(k))).length
      if (parecidos >= valores.length * 0.8) { salida.push({ ruta, lista: valores as Record<string, unknown>[] }); return }
    }
    for (const [k, x] of Object.entries(v)) buscarListas(x, ruta ? `${ruta}.${k}` : k, salida, nivel + 1)
  }
}

export function parsearJson(texto: string, nombreArchivo: string): TablaJson[] {
  let datos: unknown
  try {
    datos = JSON.parse(texto)
  } catch {
    // JSON Lines (un objeto por línea), como exporta mongoexport.
    const lineas = texto.split(/\r?\n/).filter((l) => l.trim())
    try {
      datos = lineas.map((l) => JSON.parse(l))
    } catch {
      throw new ErrorImportacion("El archivo .json no es válido.")
    }
  }
  const listas: { ruta: string; lista: Record<string, unknown>[] }[] = []
  buscarListas(datos, "", listas, 0)
  if (!listas.length) throw new ErrorImportacion("No se encontró ninguna lista de registros dentro del .json.")
  return listas.map(({ ruta, lista }) => {
    const planos = lista.map((o) => aplanar(o))
    const columnas: string[] = []
    const vistas = new Set<string>()
    for (const p of planos.slice(0, 2000)) for (const k of Object.keys(p)) if (!vistas.has(k)) { vistas.add(k); columnas.push(k) }
    return { nombre: ruta || nombreArchivo, columnas, filas: planos.map((p) => columnas.map((c) => p[c] ?? null)) }
  })
}
