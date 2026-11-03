import { apiClient } from "../lib/api-client"

export interface Feriado {
  id: number
  fecha: string
  descripcion?: string
  createdAt: string
  updatedAt: string
}

export type TipoFeriado = "inamovible" | "trasladable" | "puente"

export interface FeriadoNacional {
  fecha: string
  nombre: string
  tipo: TipoFeriado
  /** La clínica ya lo tiene cargado. */
  cargado: boolean
}

export interface FeriadosNacionalesRespuesta {
  year: number
  /** "oficial": lista publicada por el Gobierno; "calculado": según la ley, sin puentes. */
  fuente: "oficial" | "calculado"
  feriados: FeriadoNacional[]
}

export const feriadosApi = {
  async listar(year?: number): Promise<Feriado[]> {
    const params = year ? `?year=${year}` : ""
    return apiClient.get<Feriado[]>(`/feriados${params}`)
  },
  async crear(data: { fecha: string; descripcion?: string }): Promise<Feriado> {
    return apiClient.post<Feriado>("/feriados", data)
  },
  async eliminar(id: number): Promise<void> {
    return apiClient.delete(`/feriados/${id}`)
  },
  async nacionales(year: number): Promise<FeriadosNacionalesRespuesta> {
    return apiClient.get<FeriadosNacionalesRespuesta>(`/feriados/nacionales?year=${year}`)
  },
  async importar(year: number, fechas: string[]): Promise<{ creados: number; yaCargados: number; fallidos: number }> {
    return apiClient.post("/feriados/importar", { year, fechas })
  },
}
