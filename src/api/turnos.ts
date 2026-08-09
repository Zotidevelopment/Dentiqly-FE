import { apiClient } from "../lib/api-client"
import { isFirstTime, trackAppointmentCreated } from "../lib/analytics"
import type { Turno, CrearTurnoData, CrearTurnoBookingData, PaginatedResponse } from "../types"

export interface PacienteAusente {
  paciente_id: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
  obra_social: string
  ausencias: number
  ultima_ausencia: string
}

export interface EstadisticasAsistencia {
  rango: { desde: string; hasta: string }
  totales: { agendados: number; atendidos: number; ausentes: number; cancelados: number; sinMarcar: number }
  tasa_ausentismo: number
  tasa_asistencia: number
  por_dia: { fecha: string; agendados: number; atendidos: number; ausentes: number; sinMarcar: number }[]
  por_obra_social: { nombre: string; agendados: number; atendidos: number; ausentes: number }[]
  por_profesional: { nombre: string; agendados: number; atendidos: number; ausentes: number }[]
  por_servicio: { nombre: string; agendados: number; atendidos: number; ausentes: number }[]
  pacientes_ausentes: PacienteAusente[]
}

export const turnosApi = {
  async listar(params?: {
    page?: number
    limit?: number
    fecha_desde?: string
    fecha_hasta?: string
    profesional_id?: number
    estado?: string
    paciente_id?: string
  }): Promise<PaginatedResponse<Turno>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.fecha_desde) queryParams.append("fecha_desde", params.fecha_desde)
    if (params?.fecha_hasta) queryParams.append("fecha_hasta", params.fecha_hasta)
    if (params?.profesional_id) queryParams.append("profesional_id", params.profesional_id.toString())
    if (params?.estado) queryParams.append("estado", params.estado)
    if (params?.paciente_id) queryParams.append("paciente_id", params.paciente_id.toString())

    const endpoint = `/turnos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await apiClient.get<{ turnos: Turno[]; pagination: any }>(endpoint)

    return {
      data: response.turnos,
      pagination: response.pagination,
    }
  },

  async obtener(id: number): Promise<Turno> {
    return apiClient.get<Turno>(`/turnos/${id}`)
  },

  async crear(data: CrearTurnoData): Promise<Turno> {
    const turno = await apiClient.post<Turno>("/turnos", data)
    // Una reserva hecha por un paciente desde el booking público no es la
    // clínica usando la agenda: ese es otro embudo.
    if (!apiClient.isPublicContext()) {
      trackAppointmentCreated(isFirstTime("appointment_created"))
    }
    return turno
  },

  async crearDesdeBooking(data: CrearTurnoBookingData): Promise<Turno> {
    // Backend validation expects: fecha_hora (ISO8601) and duracion_minutos (integer)
    return apiClient.post<Turno>("/turnos", data)
  },

  async crearBulk(data: {
    paciente_id: string
    profesional_id?: number
    servicio_id?: number
    fechas: string[]
    hora_inicio: string
    hora_fin: string
    estado?: string
    observaciones?: string
    sobre_turno?: boolean
  }): Promise<{ message: string; turnos: Turno[] }> {
    const result = await apiClient.post<{ message: string; turnos: Turno[] }>("/turnos/bulk", data)
    if (!apiClient.isPublicContext()) {
      trackAppointmentCreated(isFirstTime("appointment_created"))
    }
    return result
  },

  async actualizar(id: number, data: Partial<CrearTurnoData>): Promise<Turno> {
    return apiClient.put<Turno>(`/turnos/${id}`, data)
  },

  confirmarPago: (id: number, confirmar: boolean) => {
    return apiClient.put(`/turnos/${id}/confirmar-pago`, { confirmar })
  },

  async eliminar(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/turnos/${id}`)
  },

  async verificarDisponibilidad(
    profesional_id: number,
    fecha: string,
    hora_inicio?: string,
    hora_fin?: string,
  ): Promise<{ disponible: boolean; mensaje: string; horarios_ocupados?: string[]; horarios_disponibles?: string[] }> {
    if (hora_inicio && hora_fin) {
      // Original method for checking specific time slot
      const queryParams = new URLSearchParams({
        profesional_id: profesional_id.toString(),
        fecha,
        hora_inicio,
        hora_fin,
      })
      return apiClient.get<{ disponible: boolean; mensaje: string; horarios_ocupados?: string[] }>(
        `/turnos/verificar-disponibilidad?${queryParams.toString()}`,
      )
    } else {
      // New method using professional schedules
      const response = await apiClient.get<{
        disponible: boolean
        mensaje: string
        horarios_disponibles: string[]
        horario_atencion?: any
      }>(`/profesionales/${profesional_id}/horarios-disponibles?fecha=${fecha}`)

      return {
        disponible: response.disponible,
        mensaje: response.mensaje,
        horarios_disponibles: response.horarios_disponibles,
      }
    }
  },

  /**
   * Estadísticas de asistencia/ausentismo agregadas por el backend para un rango
   * de fechas. Sirve para mirar más lejos que el mes que tiene cargado la pantalla.
   */
  async estadisticasAsistencia(params: { fecha_desde: string; fecha_hasta: string }): Promise<EstadisticasAsistencia> {
    const queryParams = new URLSearchParams({
      fecha_desde: params.fecha_desde,
      fecha_hasta: params.fecha_hasta,
    })
    return apiClient.get<EstadisticasAsistencia>(`/turnos/estadisticas/asistencia?${queryParams.toString()}`)
  },

  async confirmarTodosPendientes(): Promise<{ message: string; count: number }> {
    return apiClient.put<{ message: string; count: number }>("/turnos/confirmar-todos-pendientes", {})
  },
}
