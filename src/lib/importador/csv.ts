// CSV / TSV / TXT: detecta el separador (coma, punto y coma —el de Excel en
// español—, tabulación o barra) y respeta comillas, saltos de línea dentro de
// una celda y comillas dobles escapadas.
import type { Celda } from "./tipos"

const SEPARADORES = [",", ";", "\t", "|"] as const

/** Cuenta separadores fuera de comillas en las primeras líneas y elige el más consistente. */
export function detectarSeparador(texto: string): string {
  const pista = texto.match(/^\s*sep=(.)\s*\r?\n/i)
  if (pista) return pista[1]
  const lineas: string[] = []
  let actual = "", entreComillas = false
  for (let i = 0; i < texto.length && lineas.length < 30; i++) {
    const c = texto[i]
    if (c === '"') entreComillas = !entreComillas
    if ((c === "\n" || c === "\r") && !entreComillas) {
      if (actual.trim()) lineas.push(actual)
      actual = ""
      continue
    }
    actual += entreComillas ? "" : c
  }
  if (actual.trim()) lineas.push(actual)
  let mejor = ",", mejorPuntaje = -1
  for (const sep of SEPARADORES) {
    const cuentas = lineas.map((l) => l.split(sep).length - 1)
    const conSep = cuentas.filter((c) => c > 0)
    if (!conSep.length) continue
    // Más consistente = la mayoría de las líneas tiene la misma cantidad.
    const moda = [...conSep].sort((a, b) => conSep.filter((x) => x === b).length - conSep.filter((x) => x === a).length)[0]
    const consistencia = cuentas.filter((c) => c === moda).length / cuentas.length
    const puntaje = consistencia * 10 + Math.min(moda, 30) / 30
    if (puntaje > mejorPuntaje) { mejor = sep; mejorPuntaje = puntaje }
  }
  return mejor
}

export function parsearCsv(texto: string, separador = detectarSeparador(texto)): Celda[][] {
  const t = texto.replace(/^\s*sep=.\s*\r?\n/i, "")
  const filas: Celda[][] = []
  let fila: Celda[] = []
  let celda = ""
  let entreComillas = false
  let huboComillas = false
  const cerrarCelda = () => {
    const v = huboComillas ? celda : celda.trim()
    fila.push(v === "" ? null : v)
    celda = ""
    huboComillas = false
  }
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (entreComillas) {
      if (c === '"') {
        if (t[i + 1] === '"') { celda += '"'; i++ }
        else entreComillas = false
      } else celda += c
      continue
    }
    if (c === '"' && celda.trim() === "") { entreComillas = true; huboComillas = true; celda = ""; continue }
    if (c === separador) { cerrarCelda(); continue }
    if (c === "\r" || c === "\n") {
      if (c === "\r" && t[i + 1] === "\n") i++
      cerrarCelda()
      filas.push(fila)
      fila = []
      continue
    }
    celda += c
  }
  if (celda !== "" || fila.length) { cerrarCelda(); filas.push(fila) }
  return filas
}
