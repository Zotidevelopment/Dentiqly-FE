import { apiClient } from "../lib/api-client"
import type { Odontograma, CrearOdontogramaData } from "../types"

// Tipos específicos para el odontograma
export interface SuperficieDiente {
  oclusal: string
  vestibular: string
  lingual: string
  mesial: string
  distal: string
}

export interface TratamientoInfo {
  tratamiento: string
  estado: string
}

export interface DatosDiente {
  estado: string
  superficies: SuperficieDiente
  notas?: string
  tratamientos?: Record<string, TratamientoInfo | undefined>
  tratamiento_general?: TratamientoInfo
}

export interface DientesData {
  [key: string]: DatosDiente
}

export interface EstadisticasOdontograma {
  total_dientes: number
  sanos: number
  con_caries: number
  obturados: number
  extraidos: number
  ausentes: number
  otros: number
}

export const odontogramasApi = {
  listar: async (pacienteId: string | number, profesionalId?: number, tipo?: string): Promise<Odontograma[]> => {
    const queryParams = new URLSearchParams()
    queryParams.append("paciente_id", String(pacienteId))
    if (profesionalId) queryParams.append("profesional_id", String(profesionalId))
    if (tipo) queryParams.append("tipo", tipo)

    const query = queryParams.toString()
    return apiClient.get<Odontograma[]>(`/odontogramas?${query}`)
  },

  obtener: async (id: number): Promise<Odontograma> => {
    return apiClient.get<Odontograma>(`/odontogramas/${id}`)
  },

  crear: async (data: CrearOdontogramaData): Promise<Odontograma> => {
    return apiClient.post<Odontograma>("/odontogramas", data)
  },

  actualizar: async (id: number, data: Partial<CrearOdontogramaData>): Promise<Odontograma> => {
    return apiClient.put<Odontograma>(`/odontogramas/${id}`, data)
  },

  eliminar: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/odontogramas/${id}`)
  },

  inicializar: async (): Promise<{ dientes_data: DientesData }> => {
    return apiClient.get<{ dientes_data: DientesData }>("/odontogramas/inicializar")
  },

  obtenerEstadisticas: async (id: number): Promise<EstadisticasOdontograma> => {
    return apiClient.get<EstadisticasOdontograma>(`/odontogramas/${id}/estadisticas`)
  },
}