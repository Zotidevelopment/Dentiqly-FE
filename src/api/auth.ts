import { apiClient } from "../lib/api-client"
import type { AuthResponse, AuthUser, LoginData, RegisterData, SaasRegisterData, ApiResponse } from "../types"

export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data)

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

  async me(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>("/auth/me")
    return response
  },

  logout() {
    apiClient.clearToken()
  },
}
