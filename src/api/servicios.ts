import { apiClient } from "../lib/api-client"
import type { Servicio, SubServicio, CrearServicioData, CrearSubServicioData, PaginatedResponse } from "../types"

export const serviciosApi = {
  async listar(params?: {
    page?: number
    limit?: number
    search?: string
    categoria?: string
    estado?: string
    solo_con_profesionales?: boolean
  }): Promise<PaginatedResponse<Servicio>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.categoria) queryParams.append("categoria", params.categoria)
    if (params?.estado) queryParams.append("estado", params.estado)
    if (params?.solo_con_profesionales) queryParams.append("solo_con_profesionales", "true")

    const endpoint = `/servicios${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await apiClient.get<{ servicios: Servicio[]; pagination: any }>(endpoint)

    return {
      data: response.servicios,
      pagination: response.pagination,
    }
  },

  async obtener(id: number): Promise<Servicio> {
    return apiClient.get<Servicio>(`/servicios/${id}`)
  },

  async crear(data: CrearServicioData): Promise<Servicio> {
    return apiClient.post<Servicio>("/servicios", data)
  },

  async actualizar(id: number, data: Partial<CrearServicioData>): Promise<Servicio> {
    return apiClient.put<Servicio>(`/servicios/${id}`, data)
  },

  async eliminar(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/servicios/${id}`)
  },

  async obtenerSubservicios(
    id: number,
    params?: {
      page?: number
      limit?: number
      estado?: string
    },
  ): Promise<PaginatedResponse<SubServicio>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.estado) queryParams.append("estado", params.estado)

    const endpoint = `/servicios/${id}/subservicios${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await apiClient.get<{ subservicios: SubServicio[]; pagination: any }>(endpoint)

    return {
      data: response.subservicios,
      pagination: response.pagination,
    }
  },

  async obtenerProfesionales(id: number): Promise<{ profesionales: any[], servicio_id: number, nombre: string }> {
    return apiClient.get<{ profesionales: any[], servicio_id: number, nombre: string }>(`/servicios/${id}/profesionales`)
  },

  async crearSubservicio(data: CrearSubServicioData): Promise<SubServicio> {
    return apiClient.post<SubServicio>("/servicios/subservicios", data)
  },

  async actualizarSubservicio(id: number, data: Partial<CrearSubServicioData>): Promise<SubServicio> {
    return apiClient.put<SubServicio>(`/servicios/subservicios/${id}`, data)
  },

  async eliminarSubservicio(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/servicios/subservicios/${id}`)
  },
}
