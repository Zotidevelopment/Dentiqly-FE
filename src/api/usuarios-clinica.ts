import { apiClient } from "../lib/api-client"
import { trackProfessionalInvited } from "../lib/analytics"

export interface UsuarioClinica {
  id: number
  nombre: string
  apellido?: string
  email: string
  role: 'admin' | 'recepcionista' | 'odontologo' | 'staff'
  activo: boolean
  createdAt: string
}

export interface CrearUsuarioClinicaData {
  nombre: string
  apellido: string
  email: string
  role: string
}

export interface ActualizarUsuarioClinicaData {
  nombre?: string
  apellido?: string
  email?: string
  role?: string
}

export const usuariosClinicaApi = {
  listar: async (): Promise<UsuarioClinica[]> => {
    const res = await apiClient.get<UsuarioClinica[] | { usuarios: UsuarioClinica[] }>('/usuarios-clinica')
    return Array.isArray(res) ? res : (res.usuarios || [])
  },

  crear: async (data: CrearUsuarioClinicaData & { password: string }): Promise<UsuarioClinica> => {
    const usuario = await apiClient.post<UsuarioClinica>('/usuarios-clinica', data)
    // Sumar gente al equipo es adopción más allá del dueño de la clínica.
    trackProfessionalInvited()
    return usuario
  },

  actualizar: async (id: number, data: ActualizarUsuarioClinicaData): Promise<UsuarioClinica> => {
    return apiClient.put<UsuarioClinica>(`/usuarios-clinica/${id}`, data)
  },

  eliminar: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/usuarios-clinica/${id}`)
  },
}
