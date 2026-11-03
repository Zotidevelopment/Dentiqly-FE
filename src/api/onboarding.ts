import { apiClient } from "../lib/api-client"

export interface OnboardingSetupStatus {
  completed: boolean
  /** true solo para clínicas nuevas: sin onboarding hecho, sin profesionales ni turnos. */
  needsSetup: boolean
  counts: {
    profesionales: number
    servicios: number
    sucursales: number
    obrasSociales: number
    pacientes: number
    turnos: number
  }
}

export interface OnboardingStatus {
  hasHistoriaClinica: boolean
  hasOdontograma: boolean
  hasPrescripcion: boolean
  hasTratamiento: boolean
  hasArchivos: boolean
  hasCuentaCorriente: boolean
  setup?: OnboardingSetupStatus
}

export const onboardingApi = {
  async getStatus(): Promise<OnboardingStatus> {
    return apiClient.get<OnboardingStatus>("/onboarding/status")
  },
}
