import { apiClient } from "../lib/api-client"
import type { Turno } from "../types"

export interface AsistenciaCiclo {
  id: number
  clinica_id: string
  paciente_id: string
  sesiones_totales: number
  sesiones_completadas: number
  fecha_inicio?: string
  fecha_fin?: string
  estado: "Activo" | "Completado"
  observaciones?: string
  createdAt: string
  updatedAt: string
  turnos?: Turno[]
}

export const asistenciasApi = {
  listarCiclos: async (pacienteId: string): Promise<AsistenciaCiclo[]> => {
    return apiClient.get<AsistenciaCiclo[]>(`/asistencias-ciclos?paciente_id=${pacienteId}`)
  },

  crearCicloManual: async (data: {
    paciente_id: string
    sesiones_totales?: number
    observaciones?: string
  }): Promise<AsistenciaCiclo> => {
    return apiClient.post<AsistenciaCiclo>("/asistencias-ciclos", data)
  },

  actualizarCiclo: async (
    id: number,
    data: {
      sesiones_totales?: number
      observaciones?: string
      estado?: "Activo" | "Completado"
    }
  ): Promise<AsistenciaCiclo> => {
    return apiClient.put<AsistenciaCiclo>(`/asistencias-ciclos/${id}`, data)
  },

  archivarCicloManual: async (id: number): Promise<AsistenciaCiclo> => {
    return apiClient.put<AsistenciaCiclo>(`/asistencias-ciclos/${id}/archivar`, {})
  },
}
