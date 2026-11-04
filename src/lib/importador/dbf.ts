// Archivos .dbf (dBase III/IV, FoxPro, Visual FoxPro, Clipper): el formato de
// muchos sistemas odontológicos viejos de DOS y Windows.
import { decodificarCp850, pareceCp850 } from "./texto"
import { ErrorImportacion, type Celda } from "./tipos"

export interface TablaDbf {
  columnas: string[]
  filas: Celda[][]
  avisos: string[]
}

const VERSIONES = new Set([0x02, 0x03, 0x04, 0x05, 0x30, 0x31, 0x32, 0x43, 0x63, 0x83, 0x8b, 0x8e, 0xcb, 0xf5, 0xfb])

export function esDbf(bytes: Uint8Array): boolean {
  if (bytes.length < 68 || !VERSIONES.has(bytes[0])) return false
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const largoCabecera = v.getUint16(8, true)
  const largoRegistro = v.getUint16(10, true)
  const mes = bytes[2], dia = bytes[3]
  return largoCabecera > 32 && largoCabecera < bytes.length && largoRegistro > 0 && mes <= 12 && dia <= 31
}

// Byte 29 de la cabecera: el "language driver" dice la página de códigos.
const DRIVER_DOS = new Set([0x01, 0x02, 0x26, 0x37, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x7d])
const DRIVER_WINDOWS = new Set([0x03, 0x57, 0x58, 0x59, 0xc8, 0xc9, 0xca, 0xcb])

export function parsearDbf(bytes: Uint8Array): TablaDbf {
  if (!esDbf(bytes)) throw new ErrorImportacion("El archivo .dbf no tiene un formato reconocible.")
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const cantidad = v.getUint32(4, true)
  const largoCabecera = v.getUint16(8, true)
  const largoRegistro = v.getUint16(10, true)
  const driver = bytes[29]
  const cuerpo = bytes.subarray(largoCabecera)
  const dos = DRIVER_DOS.has(driver) || (!DRIVER_WINDOWS.has(driver) && pareceCp850(cuerpo.subarray(0, 200000)))
  const win = new TextDecoder("windows-1252")
  const decodificar = (b: Uint8Array) => (dos ? decodificarCp850(b) : win.decode(b))

  const campos: { nombre: string; tipo: string; largo: number; decimales: number }[] = []
  for (let p = 32; p + 32 <= largoCabecera && bytes[p] !== 0x0d; p += 32) {
    let fin = p
    while (fin < p + 11 && bytes[fin] !== 0) fin++
    campos.push({
      nombre: decodificar(bytes.subarray(p, fin)).trim(),
      tipo: String.fromCharCode(bytes[p + 11]),
      largo: bytes[p + 16],
      decimales: bytes[p + 17],
    })
  }
  const avisos: string[] = []
  const memos = campos.filter((c) => c.tipo === "M" || c.tipo === "G" || c.tipo === "P")
  if (memos.length) {
    avisos.push(`Las columnas de texto largo (${memos.map((c) => c.nombre).join(", ")}) están en un archivo aparte (.dbt o .fpt) y no se pueden leer. Si tienen datos importantes, exportá la tabla a Excel desde el sistema viejo.`)
  }

  const filas: Celda[][] = []
  for (let r = 0; r < cantidad; r++) {
    const inicio = largoCabecera + r * largoRegistro
    if (inicio + largoRegistro > bytes.length) break
    if (bytes[inicio] === 0x2a) continue // registro borrado
    let p = inicio + 1
    const fila: Celda[] = []
    for (const c of campos) {
      const crudo = bytes.subarray(p, p + c.largo)
      p += c.largo
      let valor: Celda = null
      switch (c.tipo) {
        case "C": case "V": { const t = decodificar(crudo).replace(/\0+$/, "").trim(); valor = t || null; break }
        case "N": case "F": { const t = win.decode(crudo).trim(); valor = t === "" ? null : (c.decimales === 0 && t.length > 15 ? t : Number(t)); if (typeof valor === "number" && !Number.isFinite(valor)) valor = null; break }
        case "D": { const t = win.decode(crudo).trim(); valor = /^\d{8}$/.test(t) && t !== "00000000" ? new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8))) : null; break }
        case "L": { const t = String.fromCharCode(crudo[0]).toUpperCase(); valor = "TYS".includes(t) ? true : "FN".includes(t) ? false : null; break }
        case "I": valor = new DataView(crudo.buffer, crudo.byteOffset, 4).getInt32(0, true); break
        case "B": case "O": valor = c.largo === 8 ? new DataView(crudo.buffer, crudo.byteOffset, 8).getFloat64(0, true) : null; break
        case "Y": valor = Number(new DataView(crudo.buffer, crudo.byteOffset, 8).getBigInt64(0, true)) / 10000; break
        case "T": case "@": {
          const dv = new DataView(crudo.buffer, crudo.byteOffset, 8)
          const juliano = dv.getInt32(0, true)
          valor = juliano > 0 ? new Date((juliano - 2440588) * 86400000 + dv.getInt32(4, true)) : null
          break
        }
        default: valor = null
      }
      fila.push(valor)
    }
    filas.push(fila)
  }
  const usables = campos.map((c, i) => ({ c, i })).filter(({ c }) => !memos.includes(c) && c.tipo !== "0")
  return {
    columnas: usables.map(({ c }) => c.nombre),
    filas: filas.map((f) => usables.map(({ i }) => f[i])),
    avisos,
  }
}
