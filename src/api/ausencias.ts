import { apiClient } from "../lib/api-client"

export interface Ausencia {
  id: number;
  profesional_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio?: string;
  hora_fin?: string;
  motivo?: string;
  es_recurrente?: boolean;
  dia_semana?: number;
  profesional?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export const ausenciasApi = {
  listar: async () => {
    return apiClient.get<Ausencia[]>("/ausencias")
  },
  crear: async (datos: Partial<Ausencia>) => {
    return apiClient.post<Ausencia>("/ausencias", datos)
  },
  eliminar: async (id: number) => {
    return apiClient.delete<any>(`/ausencias/${id}`)
  }
}
