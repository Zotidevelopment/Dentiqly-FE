import { apiClient } from "../lib/api-client"

export interface ProtocoloTratamiento {
  id: number
  clinica_id: string
  semana: string
  paciente_id?: string
  profesional_id?: number
  tratamiento?: string
  cuidado_atencion: string
  createdAt: string
  updatedAt: string
  paciente?: {
    id: string
    nombre: string
    apellido: string
  }
  profesional?: {
    id: number
    nombre: string
    apellido: string
  }
}

export interface CrearProtocoloData {
  semana: string
  paciente_id?: string
  profesional_id?: number
  tratamiento?: string
  cuidado_atencion: string
}

export const protocolosApi = {
  listar: async (params?: {
    semana?: string
    paciente_id?: string
    profesional_id?: number
  }): Promise<ProtocoloTratamiento[]> => {
    const queryParams = new URLSearchParams()
    if (params?.semana) queryParams.append("semana", params.semana)
    if (params?.paciente_id) queryParams.append("paciente_id", params.paciente_id)
    if (params?.profesional_id) queryParams.append("profesional_id", String(params.profesional_id))

    const query = queryParams.toString()
    return apiClient.get<ProtocoloTratamiento[]>(
      `/protocolos-tratamiento${query ? `?${query}` : ""}`
    )
  },

  crear: async (data: CrearProtocoloData): Promise<ProtocoloTratamiento> => {
    return apiClient.post<ProtocoloTratamiento>("/protocolos-tratamiento", data)
  },

  actualizar: async (id: number, data: Partial<CrearProtocoloData>): Promise<ProtocoloTratamiento> => {
    return apiClient.put<ProtocoloTratamiento>(`/protocolos-tratamiento/${id}`, data)
  },

  eliminar: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/protocolos-tratamiento/${id}`)
  },
}
