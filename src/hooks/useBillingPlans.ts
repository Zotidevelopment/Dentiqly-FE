import { useState, useEffect } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export interface PlanDetail {
  id: string
  name: string
  price: number
  pricePerMonth?: number
  currency: string
  interval: string
  discount?: number
}

export interface ExchangeRate {
  usd_ars: number
  source: string
  updated_at: string
}

export interface BillingPlans {
  ars: { monthly: PlanDetail; annual: PlanDetail }
  usd: { monthly: PlanDetail; annual: PlanDetail }
  exchange_rate?: ExchangeRate
  trial: { days: number }
}

// Valores de fallback para evitar layout shifts mientras carga
const FALLBACK: BillingPlans = {
  ars: {
    monthly: { id: 'monthly', name: 'Plan Pro Mensual', price: 80000, currency: 'ARS', interval: 'mes' },
    annual:  { id: 'annual',  name: 'Plan Pro Anual',   price: 864000, pricePerMonth: 72000, currency: 'ARS', interval: 'año', discount: 10 },
  },
  usd: {
    monthly: { id: 'monthly', name: 'Plan Pro Mensual', price: 52,  currency: 'USD', interval: 'mes' },
    annual:  { id: 'annual',  name: 'Plan Pro Anual',   price: 499, pricePerMonth: 42, currency: 'USD', interval: 'año', discount: 17 },
  },
  trial: { days: 14 },
}

export const useBillingPlans = (): BillingPlans => {
  const [plans, setPlans] = useState<BillingPlans>(FALLBACK)

  useEffect(() => {
    fetch(`${API_BASE}/billing/plans`)
      .then(r => r.json())
      .then(data => { if (data?.ars && data?.usd) setPlans(data) })
      .catch(() => {})
  }, [])

  return plans
}
