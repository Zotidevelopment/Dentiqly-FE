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

export const useBillingPlans = (): BillingPlans | null => {
  const [plans, setPlans] = useState<BillingPlans | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/billing/plans`)
      .then(r => r.json())
      .then(data => { if (data?.ars && data?.usd) setPlans(data) })
      .catch(() => {})
  }, [])

  return plans
}
