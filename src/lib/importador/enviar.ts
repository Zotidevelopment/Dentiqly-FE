// Envío de los pacientes al backend en lotes, informe descargable y planilla modelo.
import type { FilaRevisada, Opciones } from "./transformar"
import type { ModoDuplicados, PacienteParaImportar, ResultadoFilaImportacion, ResultadoImportacion } from "../../api/pacientes"

export const TAMANO_LOTE = 500

export const filasAEnviar = (filas: FilaRevisada[]) => filas.filter((f) => !f.errores.length && f.repetidaDe === undefined)

export function paraEnviar(f: FilaRevisada, opciones: Pick<Opciones, "sinDocumento">): PacienteParaImportar {
  const p = f.paciente
  const os = p.obra_social
  return {
    fila: f.fila,
    apellido: p.apellido,
    nombre: p.nombre,
    tipo_documento: p.tipo_documento,
    numero_documento: p.numero_documento,
    dni_provisorio: !p.numero_documento && opciones.sinDocumento === "provisorio",
    fecha_nacimiento: p.fecha_nacimiento,
    sexo: p.sexo,
    email: p.email,
    telefono: p.telefono,
    direccion: p.direccion,
    ocupacion: p.ocupacion,
    recomendado_por: p.recomendado_por,
    numero_afiliado: p.numero_afiliado,
    condicion_iva: p.condicion_iva,
    informacion_adicional: p.informacion_adicional,
    obra_social: os.tipo === "existente" ? { id: os.id } : os.tipo === "nueva" ? { nombre: os.nombre, crear: true } : null,
  }
}

type Importar = (datos: {
  importacion_id: string
  pacientes: PacienteParaImportar[]
  opciones: { duplicados: ModoDuplicados; crear_obras_sociales: boolean }
  dry_run?: boolean
}) => Promise<ResultadoImportacion>

/** Error de un lote: lleva lo que ya se importó y desde dónde seguir. */
export class ErrorLote extends Error {
  constructor(mensaje: string, public parcial: ResultadoImportacion, public desde: number) {
    super(mensaje)
  }
}

export const resultadoVacio = (importacionId: string, simulacion: boolean): ResultadoImportacion => ({
  importacion_id: importacionId,
  simulacion,
  resumen: { creados: 0, actualizados: 0, omitidos: 0, errores: 0 },
  obras_sociales_nuevas: [],
  resultados: [],
})

/**
 * Manda los pacientes en lotes y junta los resultados.
 * La simulación reintenta sola. La importación real no: si el servidor llegó a
 * guardar y se cortó la respuesta, reintentar duplicaría a los pacientes sin DNI.
 * En ese caso tira ErrorLote y la pantalla ofrece continuar desde ese lote.
 */
export async function enviarEnLotes(
  importar: Importar,
  pacientes: PacienteParaImportar[],
  config: { importacionId: string; duplicados: ModoDuplicados; crearObras: boolean; simulacion: boolean },
  alAvanzar?: (enviados: number, total: number) => void,
  cancelado?: () => boolean,
  previo?: { parcial: ResultadoImportacion; desde: number },
): Promise<ResultadoImportacion> {
  const total = previo?.parcial ?? resultadoVacio(config.importacionId, config.simulacion)
  for (let i = previo?.desde ?? 0; i < pacientes.length; i += TAMANO_LOTE) {
    if (cancelado?.()) break
    const lote = pacientes.slice(i, i + TAMANO_LOTE)
    let r: ResultadoImportacion | null = null
    const intentos = config.simulacion ? 3 : 1
    for (let intento = 0; intento < intentos && !r; intento++) {
      try {
        r = await importar({
          importacion_id: config.importacionId,
          pacientes: lote,
          opciones: { duplicados: config.duplicados, crear_obras_sociales: config.crearObras },
          dry_run: config.simulacion,
        })
      } catch (e) {
        if (intento === intentos - 1) throw new ErrorLote(e instanceof Error ? e.message : "Error de conexión", total, i)
        await new Promise((ok) => setTimeout(ok, 1500 * (intento + 1)))
      }
    }
    total.resumen.creados += r!.resumen.creados
    total.resumen.actualizados += r!.resumen.actualizados
    total.resumen.omitidos += r!.resumen.omitidos
    total.resumen.errores += r!.resumen.errores
    for (const o of r!.obras_sociales_nuevas) if (!total.obras_sociales_nuevas.includes(o)) total.obras_sociales_nuevas.push(o)
    total.resultados.push(...r!.resultados)
    alAvanzar?.(Math.min(i + TAMANO_LOTE, pacientes.length), pacientes.length)
  }
  return total
}

const csvCelda = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v)
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
/** CSV con punto y coma y BOM: Excel en español lo abre bien, con tildes. */
const armarCsv = (filas: unknown[][]) => "﻿" + filas.map((f) => f.map(csvCelda).join(";")).join("\r\n")

export function descargar(nombre: string, contenido: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const ETIQUETA_RESULTADO: Record<ResultadoFilaImportacion["resultado"], string> = {
  creado: "Importado", actualizado: "Actualizado", omitido: "No importado", error: "Error",
}

/** Informe fila por fila: lo que no se importó y por qué, para corregirlo en el archivo original. */
export function informeCsv(filas: FilaRevisada[], resultados: ResultadoFilaImportacion[]): string {
  const porFila = new Map(resultados.map((r) => [r.fila, r]))
  const encabezado = ["Fila del archivo", "Apellido", "Nombre", "DNI", "Resultado", "Detalle"]
  const cuerpo = filas.map((f) => {
    const r = porFila.get(f.fila)
    const resultado = f.errores.length ? "Error" : f.repetidaDe !== undefined ? "Combinado con otra fila" : r ? ETIQUETA_RESULTADO[r.resultado] : "No enviado"
    const detalle = [...f.errores, r?.motivo, ...(r?.avisos ?? []), ...f.avisos].filter(Boolean).join(" · ")
    return [f.fila, f.paciente.apellido, f.paciente.nombre, f.paciente.numero_documento ?? "", resultado, detalle]
  })
  return armarCsv([encabezado, ...cuerpo])
}

export function plantillaCsv(): string {
  return armarCsv([
    ["Apellido", "Nombre", "DNI", "Fecha de nacimiento", "Sexo", "Teléfono", "Email", "Dirección", "Localidad", "Obra social", "N° de afiliado", "Observaciones"],
    ["García", "María José", "30111222", "15/03/1980", "F", "11 4567-8901", "maria@ejemplo.com", "Av. Rivadavia 1234", "CABA", "OSDE 210", "61234567801", "Alérgica a la penicilina"],
    ["Pérez", "Juan", "28333444", "02/11/1975", "M", "11 2345-6789", "", "", "Lanús", "Particular", "", ""],
  ])
}

/** Recordatorio de la última importación, para poder deshacerla desde la lista de pacientes. */
export interface UltimaImportacion { id: string; fecha: string; creados: number; archivo: string }
const CLAVE = "dentiqly:ultima-importacion"
export const guardarUltimaImportacion = (u: UltimaImportacion) => { try { localStorage.setItem(CLAVE, JSON.stringify(u)) } catch { /* sin almacenamiento */ } }
export const borrarUltimaImportacion = () => { try { localStorage.removeItem(CLAVE) } catch { /* nada */ } }
export function leerUltimaImportacion(): UltimaImportacion | null {
  try {
    const u = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as UltimaImportacion | null
    // Se ofrece deshacer durante 7 días.
    if (!u || Date.now() - new Date(u.fecha).getTime() > 7 * 86400000) return null
    return u
  } catch {
    return null
  }
}
