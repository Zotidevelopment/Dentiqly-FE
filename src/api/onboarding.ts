import { apiClient } from "../lib/api-client"

export interface OnboardingStatus {
  hasHistoriaClinica: boolean
  hasOdontograma: boolean
  hasPrescripcion: boolean
  hasTratamiento: boolean
  hasArchivos: boolean
  hasCuentaCorriente: boolean
}

export const onboardingApi = {
  async getStatus(): Promise<OnboardingStatus> {
    return apiClient.get<OnboardingStatus>("/onboarding/status")
  },
}
