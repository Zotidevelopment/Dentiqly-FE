// Lector mínimo de archivos ZIP (los .xlsx y .ods son ZIP con XML adentro).
// Usa DecompressionStream del navegador: no hace falta ninguna librería.
import { ErrorImportacion } from "./tipos"

export interface EntradaZip {
  nombre: string
  leer: () => Promise<Uint8Array>
}

async function inflar(datos: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new ErrorImportacion("Este navegador no puede abrir archivos de Excel. Probá con Chrome, Edge o Firefox actualizados, o guardá la planilla como CSV.")
  }
  const entrada = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(datos); c.close() } })
  const lector = entrada.pipeThrough(new DecompressionStream("deflate-raw") as unknown as ReadableWritablePair<Uint8Array, Uint8Array>).getReader()
  const partes: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await lector.read()
    if (done) break
    partes.push(value)
    total += value.length
  }
  const salida = new Uint8Array(total)
  let p = 0
  for (const parte of partes) { salida.set(parte, p); p += parte.length }
  return salida
}

export function esZip(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04
}

export function leerZip(bytes: Uint8Array): Map<string, EntradaZip> {
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  // Fin del directorio central: está en los últimos 64 KB.
  let fin = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (vista.getUint32(i, true) === 0x06054b50) { fin = i; break }
  }
  if (fin < 0) throw new ErrorImportacion("El archivo está dañado o no es un Excel válido.")
  const cantidad = vista.getUint16(fin + 10, true)
  let p = vista.getUint32(fin + 16, true)
  const utf8 = new TextDecoder("utf-8")
  const entradas = new Map<string, EntradaZip>()
  for (let n = 0; n < cantidad; n++) {
    if (vista.getUint32(p, true) !== 0x02014b50) break
    const metodo = vista.getUint16(p + 10, true)
    const tamComprimido = vista.getUint32(p + 20, true)
    const largoNombre = vista.getUint16(p + 28, true)
    const largoExtra = vista.getUint16(p + 30, true)
    const largoComentario = vista.getUint16(p + 32, true)
    const offsetLocal = vista.getUint32(p + 42, true)
    const nombre = utf8.decode(bytes.subarray(p + 46, p + 46 + largoNombre)).replace(/\\/g, "/")
    p += 46 + largoNombre + largoExtra + largoComentario
    entradas.set(nombre.replace(/^\//, ""), {
      nombre,
      leer: async () => {
        const nl = vista.getUint16(offsetLocal + 26, true)
        const el = vista.getUint16(offsetLocal + 28, true)
        const inicio = offsetLocal + 30 + nl + el
        const datos = bytes.subarray(inicio, inicio + tamComprimido)
        if (metodo === 0) return datos
        if (metodo === 8) return inflar(datos)
        throw new ErrorImportacion("El archivo usa una compresión que no se puede leer. Guardalo de nuevo desde Excel.")
      },
    })
  }
  return entradas
}

export async function leerTextoZip(zip: Map<string, EntradaZip>, ruta: string): Promise<string | null> {
  const entrada = zip.get(ruta) ?? [...zip.entries()].find(([k]) => k.toLowerCase() === ruta.toLowerCase())?.[1]
  if (!entrada) return null
  return new TextDecoder("utf-8").decode(await entrada.leer())
}
