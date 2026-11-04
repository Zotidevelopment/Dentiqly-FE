import { apiClient } from "../lib/api-client"
import { isFirstTime, trackPatientCreated } from "../lib/analytics"
import type { Paciente, CrearPacienteData, PaginationResponse } from "../types"

export const pacientesApi = {
  listar: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginationResponse<Paciente>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", String(params.page))
    if (params?.limit) queryParams.append("limit", String(params.limit))
    if (params?.search) queryParams.append("search", params.search)

    const query = queryParams.toString()
    const response = await apiClient.get<any>(`/pacientes${query ? `?${query}` : ""}`)

    return {
      data: response.pacientes || [],
      pagination: {
        currentPage: response.pagination?.page || 1,
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.total || 0,
        itemsPerPage: response.pagination?.limit || 10,
      }
    }
  },

  obtener: async (id: string): Promise<Paciente> => {
    return apiClient.get<Paciente>(`/pacientes/${id}`)
  },

  crear: async (data: CrearPacienteData): Promise<Paciente> => {
    const paciente = await apiClient.post<Paciente>("/pacientes", data)
    // Los pacientes que se crean solos durante una reserva pública no cuentan
    // como uso del producto por parte de la clínica.
    if (!apiClient.isPublicContext()) {
      trackPatientCreated(isFirstTime("patient_created"))
    }
    return paciente
  },

  buscarPorDocumento: async (numeroDocumento: string): Promise<Paciente | null> => {
    try {
      return await apiClient.get<Paciente>(`/pacientes/documento/${numeroDocumento}`)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  actualizar: async (id: string, data: Partial<CrearPacienteData>): Promise<Paciente> => {
    return apiClient.put<Paciente>(`/pacientes/${id}`, data)
  },

  eliminar: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/pacientes/${id}`)
  },

  /** Importación masiva (ver lib/importador). Con dry_run no guarda nada: sirve para la vista previa. */
  importar: async (datos: {
    importacion_id: string
    pacientes: PacienteParaImportar[]
    opciones: { duplicados: ModoDuplicados; crear_obras_sociales: boolean }
    dry_run?: boolean
  }): Promise<ResultadoImportacion> => {
    return apiClient.post<ResultadoImportacion>("/pacientes/importar", datos)
  },

  deshacerImportacion: async (importacionId: string): Promise<{ encontrados: number; eliminados: number; conservados: number }> => {
    return apiClient.delete(`/pacientes/importaciones/${importacionId}`)
  },
}

export type ModoDuplicados = "omitir" | "completar" | "actualizar"

export interface PacienteParaImportar {
  fila: number
  apellido: string
  nombre: string
  tipo_documento: "DNI" | "Pasaporte" | "Cédula"
  numero_documento: string | null
  dni_provisorio?: boolean
  fecha_nacimiento: string | null
  sexo: "Masculino" | "Femenino" | "Otro" | null
  email: string | null
  telefono: string | null
  direccion: string | null
  ocupacion: string | null
  recomendado_por: string | null
  numero_afiliado: string | null
  condicion_iva: string | null
  informacion_adicional: string | null
  obra_social: { id: number } | { nombre: string; crear: boolean } | null
}

export interface ResultadoFilaImportacion {
  fila: number
  resultado: "creado" | "actualizado" | "omitido" | "error"
  motivo?: string
  avisos?: string[]
  paciente_id?: string
  campos?: string[]
}

export interface ResultadoImportacion {
  importacion_id: string
  simulacion: boolean
  resumen: { creados: number; actualizados: number; omitidos: number; errores: number }
  obras_sociales_nuevas: string[]
  resultados: ResultadoFilaImportacion[]
}
