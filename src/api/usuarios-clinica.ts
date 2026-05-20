import { apiClient } from "../lib/api-client"

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

  crear: async (data: CrearUsuarioClinicaData): Promise<UsuarioClinica> => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let tempPassword = ''
    for (let i = 0; i < 10; i++) tempPassword += chars[Math.floor(Math.random() * chars.length)]
    return apiClient.post<UsuarioClinica>('/usuarios-clinica', { ...data, password: tempPassword })
  },

  actualizar: async (id: number, data: ActualizarUsuarioClinicaData): Promise<UsuarioClinica> => {
    return apiClient.put<UsuarioClinica>(`/usuarios-clinica/${id}`, data)
  },

  eliminar: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/usuarios-clinica/${id}`)
  },
}
