// Tipos compartidos del importador de pacientes.
// Todo el parseo pasa en el navegador: el archivo original nunca sale de la
// computadora de la clínica. Al backend solo viajan los pacientes ya armados.

/** Valor crudo de una celda tal como sale del archivo. */
export type Celda = string | number | boolean | Date | null

/** Una tabla leída de un archivo (una hoja de Excel, una tabla de un .sql…). */
export interface Tabla {
  /** Nombre para mostrar: la hoja, la tabla SQL o el archivo. */
  nombre: string
  columnas: string[]
  filas: Celda[][]
  /** Número de fila del archivo donde está cada fila (para los mensajes). */
  numeroFila: number[]
  /** true si las columnas salieron de una fila de títulos del archivo. */
  conCabecera: boolean
  /** Grilla original (solo planillas), para poder cambiar la fila de títulos. */
  grilla?: Celda[][]
  /** Fila de la grilla usada como títulos (-1 = sin títulos). Solo planillas. */
  filaCabecera?: number
}

export interface ResultadoLectura {
  formato: string
  tablas: Tabla[]
  avisos: string[]
}

export class ErrorImportacion extends Error {}
