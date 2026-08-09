import { apiClient } from '../lib/api-client'
import type { MovimientoCuenta } from '../types'

interface RegistrarMovimientoData {
    fecha: string
    tipo: 'Ingreso' | 'Deuda' | 'Egreso'
    monto: number
    forma_pago?: string
    descripcion?: string
}

interface CuentaCorrienteResponse {
    movimientos: MovimientoCuenta[]
    resumen: {
        ingresos: number
        deudas: number
        saldo: number
    }
}

export interface FlujoCajaResponse {
    movimientos: any[]
    /** Balance (ingresos - egresos) de los movimientos devueltos. */
    balance: number
    /** Balance de toda la historia, independiente del período consultado. */
    balanceHistorico: number
    resumen: { ingresos: number; egresos: number; deudas: number }
    rango: { desde: string | null; hasta: string | null }
    /** Meses con movimientos ("YYYY-MM"), más reciente primero. */
    meses: string[]
}

export const cuentaCorrienteApi = {
    getByPaciente: async (pacienteId: string): Promise<CuentaCorrienteResponse> => {
        return await apiClient.get<CuentaCorrienteResponse>(`/cuenta-corriente/${pacienteId}`)
    },

    registrar: async (pacienteId: string, data: RegistrarMovimientoData): Promise<MovimientoCuenta> => {
        return await apiClient.post<MovimientoCuenta>(`/cuenta-corriente/${pacienteId}`, data)
    },

    eliminar: async (id: number): Promise<void> => {
        await apiClient.delete(`/cuenta-corriente/${id}`)
    },

    getDeudores: async (): Promise<any[]> => {
        return await apiClient.get<any[]>('/cuenta-corriente/deudores')
    },

    getFlujoCaja: async (params?: { desde?: string; hasta?: string }): Promise<FlujoCajaResponse> => {
        const query = new URLSearchParams()
        if (params?.desde) query.append('desde', params.desde)
        if (params?.hasta) query.append('hasta', params.hasta)
        const qs = query.toString()
        return await apiClient.get<FlujoCajaResponse>(`/cuenta-corriente/caja${qs ? `?${qs}` : ''}`)
    },

    registrarCaja: async (data: RegistrarMovimientoData & { pacienteId?: string }): Promise<MovimientoCuenta> => {
        return await apiClient.post<MovimientoCuenta>('/cuenta-corriente/caja', data)
    }
}

export const getDeudores = cuentaCorrienteApi.getDeudores
