let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

/**
 * Mensaje en castellano para mostrarle al usuario a partir de una respuesta de
 * error. El backend responde de tres formas: { error }, { message } y, en las
 * validaciones de express-validator, { errors: [{ msg }] }. Antes solo se leía
 * la primera y el usuario veía "HTTP error! status: 400".
 */
export function mensajeDeError(status: number, data: any): string {
  const delBackend = data?.error || data?.message || data?.errors?.[0]?.msg
  if (typeof delBackend === "string" && delBackend.trim() && delBackend !== "Acceso denegado") return delBackend
  if (status === 401) return "Tu sesión venció. Volvé a iniciar sesión."
  if (status === 402 || status === 403) return data?.message || "No tenés acceso a esta acción."
  if (status === 404) return "No encontramos lo que buscabas."
  if (status === 429) return "Demasiados intentos. Esperá unos minutos y probá de nuevo."
  if (status >= 500) return "Algo falló de nuestro lado. Probá de nuevo en unos segundos."
  return "No se pudo completar la operación."
}

/** Evento que escucha el panel para re-chequear la suscripción. */
export const EVENTO_SUSCRIPCION_BLOQUEADA = "dentiqly:suscripcion-bloqueada"

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
   * True cuando la llamada sale del booking público (un paciente reservando),
   * en vez del panel de la clínica. Misma condición que usa resolveUrl().
   *
   * Analytics lo necesita para no contar las reservas de pacientes como uso
   * del producto por parte de la clínica: son dos embudos distintos.
   */
  isPublicContext(): boolean {
    return Boolean(this.tenantSlug) && !this.token
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

    let response: Response
    try {
      response = await fetch(url, {
        ...options,
        headers,
      })
    } catch {
      throw new Error("No pudimos conectarnos. Revisá tu conexión a internet y probá de nuevo.")
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      this.manejarErrorDeSesion(endpoint, response.status, error)
      const httpError: any = new Error(mensajeDeError(response.status, error))
      // Preserve response information for error handling
      httpError.response = {
        status: response.status,
        data: error
      }
      throw httpError
    }

    return response.json()
  }

  /**
   * Sesión vencida (el token dura 24 h) o suscripción bloqueada a mitad de uso.
   * Antes el panel quedaba "vacío" sin explicación: agenda sin turnos,
   * dashboard en cero. Ahora se manda al login o se re-chequea el plan.
   */
  private manejarErrorDeSesion(endpoint: string, status: number, data: any) {
    if (typeof window === "undefined") return
    const esLogin = endpoint.startsWith("/auth/login") || endpoint.startsWith("/saas")
    if (status === 401 && this.token && !esLogin) {
      this.clearToken()
      localStorage.removeItem("user")
      if (!window.location.pathname.startsWith("/login")) {
        const volver = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.assign(`/login?expired=1&redirect=${volver}`)
      }
      return
    }
    const codigo = typeof data?.code === "string" ? data.code : ""
    if ((status === 402 || status === 403) && (codigo.startsWith("SUBSCRIPTION_") || codigo.startsWith("CLINIC_") || codigo.startsWith("TRIAL_"))) {
      window.dispatchEvent(new CustomEvent(EVENTO_SUSCRIPCION_BLOQUEADA, { detail: data }))
    }
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
      const error = await response.json().catch(() => ({}))
      this.manejarErrorDeSesion(endpoint, response.status, error)
      throw new Error(mensajeDeError(response.status, error))
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

