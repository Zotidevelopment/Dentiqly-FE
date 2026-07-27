import { apiClient } from "../lib/api-client"
import { isFirstTime, trackWhatsappReminderSent } from "../lib/analytics"

export const recordatoriosApi = {
  async enviar(turno_id: number): Promise<{ message: string; messageId?: string }> {
    const res = await apiClient.post<{ message: string; messageId?: string }>("/recordatorios/enviar", { turno_id })
    trackWhatsappReminderSent(isFirstTime("whatsapp_reminder"), false)
    return res
  },
  async enviarMasivo(fecha: string): Promise<{ message: string; enviados: number; errores: number; total: number }> {
    const res = await apiClient.post<{ message: string; enviados: number; errores: number; total: number }>("/recordatorios/enviar-masivo", { fecha })
    trackWhatsappReminderSent(isFirstTime("whatsapp_reminder"), true)
    return res
  },
  async preview(data: { turno_id?: number; custom_template?: string }): Promise<{ html: string }> {
    return apiClient.post("/recordatorios/preview", data)
  },
  async obtenerTemplate(): Promise<{ template: string }> {
    return apiClient.get("/recordatorios/template")
  },
  async guardarTemplate(template: string): Promise<{ message: string; template: string }> {
    return apiClient.put("/recordatorios/template", { template })
  },
}
