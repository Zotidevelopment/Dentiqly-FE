import { apiClient } from "../lib/api-client"
import type { AuthResponse, AuthUser, LoginData, RegisterData, SaasRegisterData, ApiResponse } from "../types"

export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)

    // El backend devuelve { token, user, ... } directamente o envuelto en data?
    // Según authController.js devuelve directamente el objeto. 
    // Pero el apiClient.post espera ApiResponse<T> y devuelve response.data (T).
    
    if (response.token) {
      apiClient.setToken(response.token)
      return response
    }

    throw new Error("Respuesta de login inválida")
  },

  async register(data: SaasRegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/saas/register", data)

    if (response.token) {
      apiClient.setToken(response.token)
      return response
    }

    throw new Error("Error en el registro SaaS")
  },

  /**
   * Continuar con Google. Si el email no tiene cuenta y no se mandó
   * nombre_clinica, el backend responde { needs_clinic: true } sin token.
   */
  async google(data: { credential: string; nombre_clinica?: string; telefono?: string }): Promise<AuthResponse & { needs_clinic?: boolean; nuevo?: boolean; nombre?: string; email?: string }> {
    const response = await apiClient.post<AuthResponse & { needs_clinic?: boolean; nuevo?: boolean; nombre?: string; email?: string }>("/auth/google", data)
    if (response.token) apiClient.setToken(response.token)
    return response
  },

  async me(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>("/auth/me")
    return response
  },

  logout() {
    apiClient.clearToken()
  },
}
