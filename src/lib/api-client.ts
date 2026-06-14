let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

export class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private tenantSlug: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  setTenantSlug(slug: string | null) {
    this.tenantSlug = slug
  }

  /**
   * Resuelve la URL final.
   */
  private resolveUrl(endpoint: string): string {
    // Estas rutas son globales y no deben ser reescritas con el slug del tenant
    const isGlobalEndpoint = endpoint.startsWith('/auth') ||
      endpoint.startsWith('/saas') ||
      endpoint.startsWith('/billing') ||
      endpoint.startsWith('/superadmin') ||
      endpoint.startsWith('/usuarios-pacientes') ||
      endpoint.startsWith('/whatsapp') ||
      endpoint.startsWith('/cuenta-corriente') ||
      endpoint.startsWith('/password-reset')

    // Si estamos en modo "Booking" (hay slug de tenant) y NO estamos logueados (sin token),
    // usamos la API pública del tenant para todo lo que no sea global.
    if (this.tenantSlug && !this.token && !isGlobalEndpoint) {
      const base = this.baseUrl.replace(/\/api$/, '')
      return `${base}/api/public/${this.tenantSlug}${endpoint}`
    }
    return `${this.baseUrl}${endpoint}`
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (typeof window !== "undefined" && (window.location.pathname.startsWith("/demo") || window.location.pathname === "/")) {
      const { handleMockRequest } = await import("./mockDemoData")
      const apiEndpoint = endpoint.startsWith("/api") ? endpoint : `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
      return handleMockRequest(apiEndpoint, options.method || "GET", options.body) as Promise<T>
    }

    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }

    // Solo añadir Content-Type si no es FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    // Si tenemos slug pero también token (caso raro), enviar como header extra
    if (this.tenantSlug) {
      headers["x-tenant-slug"] = this.tenantSlug
    }

    const url = this.resolveUrl(endpoint)

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Error desconocido" }))
      const httpError: any = new Error(error.error || `HTTP error! status: ${response.status}`)
      // Preserve response information for error handling
      httpError.response = {
        status: response.status,
        data: error
      }
      throw httpError
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any, options: Partial<RequestInit> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any, options: Partial<RequestInit> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData()

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    formData.append("file", file)

    const headers: HeadersInit = {}
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const url = this.resolveUrl(endpoint)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Error desconocido" }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

