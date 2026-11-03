import { BrandLogo } from '../brand/BrandLogo'
import React, { useState, useEffect } from 'react'
import { apiClient } from '../../lib/api-client'
import {
  getGaClientId,
  trackCheckoutStarted,
  trackOnboardingCompleted,
  trackOnboardingStarted,
} from '../../lib/analytics'
import { configuracionApi } from '../../api/configuracion'
import { useBillingPlans } from '../../hooks/useBillingPlans'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../hooks/useAuth'
import {
  Building2,
  MapPin,
  Phone,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Banknote,
  Rocket,
  Globe,
  Lock,
  RefreshCw,
} from 'lucide-react'

interface OnboardingWizardProps {
  clinicaNombre?: string
  onComplete?: () => void
  initialStep?: number
  /** Si la clínica ya puede usar el panel (trial vigente), permite salir. */
  onExit?: () => void
}

const FUNCIONES = [
  'Agenda y turnos ilimitados',
  'Pacientes e historia clínica',
  'Odontograma interactivo',
  'Reservas online 24 h',
  'Obras sociales y liquidaciones',
  'Caja y cuenta corriente',
  'Portal de pacientes',
  'Soporte por email',
]

/** Bandera dibujada: los emoji de banderas no se ven en Windows ("AR"). */
const BanderaArgentina: React.FC = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" className="shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10">
    <rect width="18" height="4" fill="#74ACDF" />
    <rect y="4" width="18" height="4" fill="#FFFFFF" />
    <rect y="8" width="18" height="4" fill="#74ACDF" />
    <circle cx="9" cy="6" r="1.4" fill="#F6B40E" />
  </svg>
)

const PASOS_CONFIG = [
  { num: 1, label: 'Bienvenida' },
  { num: 2, label: 'Tu clínica' },
  { num: 3, label: 'Cobros' },
  { num: 4, label: 'Activar' },
]

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ clinicaNombre, initialStep = 1, onExit }) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [step, setStep] = useState(initialStep)
  const [saving, setSaving] = useState(false)
  const [paying, setPaying] = useState(false)
  // Se entró directo a pagar (desde el panel): no hay pasos previos a los que volver.
  const soloActivacion = initialStep === 4

  const [clinicData, setClinicData] = useState({
    clinic_name: clinicaNombre || '',
    clinic_address: '',
    clinic_phone: '',
    clinic_google_maps: '',
  })

  const [bankData, setBankData] = useState({
    bank_name: '',
    bank_account_holder: '',
    bank_cbu: '',
    bank_alias: '',
    bank_whatsapp: '',
  })

  useEffect(() => {
    if (!soloActivacion) trackOnboardingStarted()
  }, [soloActivacion])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const handleSaveClinicData = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(clinicData)) {
        if (value.trim()) {
          await configuracionApi.crear({ clave: key, valor: value, tipo: 'string', categoria: 'general' })
        }
      }
      setStep(3)
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Error al guardar los datos. Intentá nuevamente." })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBankData = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(bankData)) {
        if (value.trim()) {
          await configuracionApi.crear({ clave: key, valor: value, tipo: 'string', categoria: 'banking' })
        }
      }
      // Paso 4 es "Activar": llegar acá significa que la clínica terminó de
      // configurarse. Lo que sigue es la decisión de pago, no configuración.
      trackOnboardingCompleted()
      setStep(4)
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Error al guardar los datos bancarios. Intentá nuevamente." })
    } finally {
      setSaving(false)
    }
  }

  const [billingPlan, setBillingPlan] = useState<'monthly' | 'annual' | 'test'>('monthly')
  const [region, setRegion] = useState<'argentina' | 'internacional'>('argentina')
  const showTestPlan = user?.role === 'superadmin' || user?.email === 'riostiziano6@gmail.com' || window.location.search.includes('test=true')

  const plans = useBillingPlans()
  const planKey = region === 'argentina' ? 'ars' : 'usd'
  const monthlyPrice = plans?.[planKey].monthly.price
  const annualPrice = plans?.[planKey].annual.price
  const annualPerMonth = plans ? (plans[planKey].annual.pricePerMonth ?? Math.round(plans[planKey].annual.price / 12)) : undefined
  const annualDiscount = plans?.[planKey].annual.discount

  // Descuento del primer mes: solo para clínicas que nunca pagaron (lo decide el backend).
  const [descuentoClinica, setDescuentoClinica] = useState(0)
  useEffect(() => {
    apiClient.get<{ first_month_discount?: number }>('/billing/status')
      .then((r) => setDescuentoClinica(r.first_month_discount || 0))
      .catch(() => {})
  }, [])
  const planMensual = plans?.[planKey].monthly
  const conPrimerMes =
    billingPlan === 'monthly' && descuentoClinica > 0 &&
    (planMensual?.firstMonthDiscount ?? 0) > 0 && planMensual?.firstMonthPrice !== undefined

  const formatPrice = (n: number) =>
    region === 'argentina' ? `$${n.toLocaleString('es-AR')}` : `USD ${n}`

  // El cobro es siempre en dólares (LemonSqueezy). En Argentina se muestra el
  // equivalente aproximado en pesos y, en letra chica, cuánto es en USD.
  const usdACobrar = !plans ? undefined
    : billingPlan === 'annual' ? plans.usd.annual.price
      : conPrimerMes && plans.usd.monthly.firstMonthPrice !== undefined ? plans.usd.monthly.firstMonthPrice
        : plans.usd.monthly.price

  const precioActual =
    billingPlan === 'test' ? 'USD 1'
      : billingPlan === 'monthly'
        ? (conPrimerMes ? formatPrice(planMensual!.firstMonthPrice!) : monthlyPrice !== undefined ? formatPrice(monthlyPrice) : undefined)
        : (annualPrice !== undefined ? formatPrice(annualPrice) : undefined)

  const handlePayment = async () => {
    setPaying(true)
    try {
      trackCheckoutStarted({
        plan: billingPlan,
        value: billingPlan === 'test' ? 1 : usdACobrar ?? 0,
        currency: 'USD',
        billingCycle: billingPlan === 'annual' ? 'annual' : 'monthly',
      })

      const response = await apiClient.post<{ checkout_url?: string; init_point?: string }>('/billing/create-preference', {
        billing_plan: billingPlan,
        // El `purchase` se emite después desde el webhook, sin navegador.
        // Mandar el client_id acá es lo que permite atribuirlo a la campaña.
        ga_client_id: getGaClientId(),
      })
      const redirectUrl = response.checkout_url || response.init_point
      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }
      toast({ variant: "destructive", title: "No pudimos abrir el pago", description: "Probá de nuevo en unos segundos." })
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Hubo un error al conectar con el procesador de pagos. Intentá de nuevo o escribinos a soporte." })
    } finally {
      setPaying(false)
    }
  }

  const yaPague = () => {
    // Sin ?activate=true: si el pago ya entró, se vuelve al panel.
    const url = new URL(window.location.href)
    url.searchParams.delete('activate')
    window.location.assign(url.pathname + url.search)
  }

  const inputClass =
    'w-full px-4 py-3 text-[14px] bg-white border border-[#DCE5EE] rounded-xl focus:ring-2 focus:ring-[#2458ED]/15 focus:border-[#2458ED] transition-all text-[#0B2440] placeholder:text-[#93A3B8] outline-none'
  const labelClass = 'block text-[13px] font-semibold text-[#0B2440] mb-1.5'

  const segmento = (activo: boolean) =>
    `flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold transition-all ${
      activo ? 'bg-white text-[#0B2440] shadow-[0_2px_8px_#0B244014]' : 'text-[#65788D] hover:text-[#0B2440]'
    }`

  return (
    <div className="dentiqly-auth dq-dark-stage min-h-screen flex flex-col">
      <div className="pointer-events-none absolute inset-0 dentiqly-brand-pattern opacity-60" aria-hidden="true" />

      {/* Barra superior */}
      <header className="relative z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo tone="inverse" alt="Dentiqly" className="h-7 w-auto shrink-0" />
          <span className="hidden h-5 w-px bg-white/20 sm:block" aria-hidden="true" />
          <span className="hidden truncate text-[13px] font-medium text-white/60 sm:block">
            {soloActivacion ? 'Activar plan' : 'Configuración inicial'}
          </span>
        </div>

        {!soloActivacion && (
          <ol className="hidden items-center gap-1.5 md:flex" aria-label="Pasos">
            {PASOS_CONFIG.map((s, i) => (
              <li key={s.num} className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                    step === s.num ? 'bg-[#2458ED] text-white' : step > s.num ? 'bg-white/10 text-white/80' : 'text-white/40'
                  }`}
                >
                  {step > s.num ? <Check className="h-3.5 w-3.5" /> : <span>{s.num}</span>}
                  {s.label}
                </span>
                {i < PASOS_CONFIG.length - 1 && <span className={`h-px w-4 ${step > s.num ? 'bg-[#2458ED]' : 'bg-white/15'}`} />}
              </li>
            ))}
          </ol>
        )}

        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-white/10 px-4 py-2.5 text-[13.5px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </button>
        ) : (
          <span className="hidden w-[140px] md:block" aria-hidden="true" />
        )}
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:items-center sm:px-6">
        {/* ── Paso 4: activar el plan ── */}
        {step === 4 ? (
          <div className="dq-fade-in grid w-full max-w-[1080px] items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <section className="text-white">
              <p className="text-[13px] font-semibold text-[#8FB2FF]">Plan Pro · todo incluido</p>
              <h1 className="mt-3 text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[44px]">
                Activá {clinicaNombre || 'tu clínica'} y seguí atendiendo sin cortes.
              </h1>
              <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-white/70">
                Un solo plan con todas las funciones. Tus pacientes, turnos e historias clínicas quedan guardados como están.
              </p>
              <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {FUNCIONES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-white/85">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2458ED]/30 text-[#8FB2FF]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 hidden flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/55 lg:flex">
                <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Pago seguro</span>
                <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Cancelás cuando quieras</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Tus datos, siempre tuyos</span>
              </div>
            </section>

            <section className="rounded-[26px] bg-white p-6 shadow-[0_40px_80px_-40px_#000] sm:p-8" aria-label="Elegí tu plan">
              <p className="text-[13px] font-semibold text-[#0B2440]">¿Desde dónde sos?</p>
              <div className="mt-2 flex gap-1 rounded-xl bg-[#EEF3FA] p-1">
                <button type="button" onClick={() => setRegion('argentina')} className={segmento(region === 'argentina')} aria-pressed={region === 'argentina'}>
                  <BanderaArgentina /> Argentina
                </button>
                <button type="button" onClick={() => setRegion('internacional')} className={segmento(region === 'internacional')} aria-pressed={region === 'internacional'}>
                  <Globe className="h-4 w-4" /> Otro país
                </button>
              </div>

              <p className="mt-5 text-[13px] font-semibold text-[#0B2440]">¿Cada cuánto?</p>
              <div className="mt-2 flex gap-1 rounded-xl bg-[#EEF3FA] p-1">
                <button type="button" onClick={() => setBillingPlan('monthly')} className={segmento(billingPlan === 'monthly')} aria-pressed={billingPlan === 'monthly'}>
                  Mensual
                </button>
                <button type="button" onClick={() => setBillingPlan('annual')} className={segmento(billingPlan === 'annual')} aria-pressed={billingPlan === 'annual'}>
                  Anual
                  {annualDiscount !== undefined && (
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11.5px] font-bold text-emerald-700">-{annualDiscount}%</span>
                  )}
                </button>
                {showTestPlan && (
                  <button type="button" onClick={() => setBillingPlan('test')} className={segmento(billingPlan === 'test')} aria-pressed={billingPlan === 'test'}>
                    Prueba
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-[18px] bg-[#F5F8FF] px-5 py-5">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    {precioActual === undefined ? (
                      <div className="h-10 w-40 animate-pulse rounded-lg bg-[#DCE5EE]" />
                    ) : (
                      <p className="text-[38px] font-semibold leading-none tracking-[-0.04em] text-[#0B2440] tabular-nums">{precioActual}</p>
                    )}
                    <p className="mt-2 text-[13.5px] text-[#65788D]">
                      {billingPlan === 'test'
                        ? 'cobro único de prueba'
                        : conPrimerMes && monthlyPrice !== undefined
                          ? <>el primer mes · después <b className="text-[#0B2440]">{formatPrice(monthlyPrice)}</b> por mes</>
                          : billingPlan === 'monthly'
                            ? 'por mes'
                            : 'por año'}
                    </p>
                  </div>
                  {conPrimerMes && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-700">
                      {planMensual!.firstMonthDiscount}% off
                    </span>
                  )}
                  {billingPlan === 'annual' && annualPerMonth !== undefined && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-700">
                      {formatPrice(annualPerMonth)}/mes
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={paying}
                className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2458ED] px-6 py-4 text-[15.5px] font-semibold text-white shadow-[0_14px_30px_-12px_#2458ED] transition-colors hover:bg-[#1744CD] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Abriendo el pago…</>
                ) : (
                  <><CreditCard className="h-5 w-5" /> Pagar con tarjeta</>
                )}
              </button>
              <p className="mt-3 text-center text-[12.5px] leading-snug text-[#65788D]">
                {billingPlan === 'test'
                  ? 'Te llevamos al pago. Cuando termines, volvés acá y tu plan se activa solo.'
                  : <>Se renueva solo {billingPlan === 'annual' ? 'cada año' : 'cada mes'} con tu tarjeta. Cancelás cuando quieras desde “Datos de la clínica”.</>}
              </p>
              {region === 'argentina' && billingPlan !== 'test' && usdACobrar !== undefined && (
                <p className="mt-1.5 text-center text-[11.5px] leading-snug text-[#93A3B8]">
                  Precio aproximado en pesos. Se cobra en dólares (USD {usdACobrar}) con tu tarjeta de crédito o débito.
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse items-stretch gap-2 border-t border-[#EEF2F7] pt-5 sm:flex-row sm:items-center sm:justify-between">
                {soloActivacion ? (
                  onExit ? (
                    <button type="button" onClick={onExit} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
                      <ArrowLeft className="h-4 w-4" /> Volver al panel
                    </button>
                  ) : <span />
                ) : (
                  <button type="button" onClick={() => setStep(3)} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </button>
                )}
                <button type="button" onClick={yaPague} className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-[#2458ED] hover:bg-[#EAF2FF]">
                  Ya pagué, actualizar estado <Check className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        ) : (
          /* ── Pasos 1 a 3: configuración básica (clínicas que pagan antes de usar) ── */
          <div className="dq-fade-in w-full max-w-[680px] overflow-hidden rounded-[26px] bg-white shadow-[0_40px_80px_-40px_#000]">
            {step === 1 && (
              <div className="flex flex-col items-center p-8 text-center sm:p-12">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B2440] shadow-[0_14px_30px_-12px_#0B2440]">
                  <Sparkles className="h-8 w-8 text-[#8FB2FF]" />
                </div>
                <h1 className="mb-2 text-[30px] font-semibold tracking-[-0.03em] text-[#0B2440]">¡Bienvenido a Dentiqly!</h1>
                <p className="mb-8 max-w-md text-[15px] leading-relaxed text-[#53677E]">
                  Vamos a dejar <span className="font-semibold text-[#0B2440]">{clinicaNombre || 'tu clínica'}</span> lista en unos pocos pasos.
                </p>

                <div className="mb-8 w-full max-w-sm space-y-2.5 text-left">
                  {[
                    { icon: Building2, text: 'Completá los datos de tu clínica' },
                    { icon: CreditCard, text: 'Cargá tus datos para cobrar señas' },
                    { icon: Rocket, text: 'Activá tu plan y empezá' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[#F5F8FF] p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B2440] text-[#8FB2FF]">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[14px] font-medium text-[#0B2440]">{item.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-[#2458ED] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_#2458ED] transition-colors hover:bg-[#1744CD]"
                >
                  Comenzar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="p-7 sm:p-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2440] text-[#8FB2FF]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#0B2440]">Datos de tu clínica</h2>
                    <p className="text-[13px] text-[#65788D]">Es lo que ven tus pacientes al reservar</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="wiz-nombre" className={labelClass}>Nombre de la clínica</label>
                      <input id="wiz-nombre" type="text" value={clinicData.clinic_name} onChange={e => setClinicData({ ...clinicData, clinic_name: e.target.value })} className={inputClass} placeholder="Ej: Consultorio Dental Belgrano" />
                    </div>
                    <div>
                      <label htmlFor="wiz-tel" className={labelClass}>Teléfono o WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93A3B8]" />
                        <input id="wiz-tel" type="tel" value={clinicData.clinic_phone} onChange={e => setClinicData({ ...clinicData, clinic_phone: e.target.value })} className={`${inputClass} pl-9`} placeholder="11 2345 6789" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wiz-dir" className={labelClass}>Dirección</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93A3B8]" />
                      <input id="wiz-dir" type="text" value={clinicData.clinic_address} onChange={e => setClinicData({ ...clinicData, clinic_address: e.target.value })} className={`${inputClass} pl-9`} placeholder="Av. Cabildo 1234, CABA" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wiz-maps" className={labelClass}>Mapa de Google <span className="font-normal text-[#93A3B8]">(opcional)</span></label>
                    <textarea id="wiz-maps" value={clinicData.clinic_google_maps} onChange={e => setClinicData({ ...clinicData, clinic_google_maps: e.target.value })} className={`${inputClass} h-20 resize-none font-mono text-xs`} placeholder="Pegá el link de Google Maps → Compartir → Insertar un mapa" />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[#EEF2F7] pt-6">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </button>
                  <button type="button" onClick={handleSaveClinicData} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#2458ED] px-6 py-3 text-[14.5px] font-semibold text-white hover:bg-[#1744CD] disabled:opacity-50">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />} Siguiente <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-7 sm:p-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2440] text-[#8FB2FF]">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#0B2440]">Datos para cobrar</h2>
                    <p className="text-[13px] text-[#65788D]">Para recibir señas por transferencia · opcional</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="wiz-banco" className={labelClass}>Banco o billetera</label>
                      <input id="wiz-banco" type="text" value={bankData.bank_name} onChange={e => setBankData({ ...bankData, bank_name: e.target.value })} className={inputClass} placeholder="Ej: Banco Galicia" />
                    </div>
                    <div>
                      <label htmlFor="wiz-titular" className={labelClass}>Titular de la cuenta</label>
                      <input id="wiz-titular" type="text" value={bankData.bank_account_holder} onChange={e => setBankData({ ...bankData, bank_account_holder: e.target.value })} className={inputClass} placeholder="Nombre y apellido" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="wiz-cbu" className={labelClass}>CBU / CVU</label>
                      <input id="wiz-cbu" type="text" inputMode="numeric" value={bankData.bank_cbu} onChange={e => setBankData({ ...bankData, bank_cbu: e.target.value })} className={inputClass} placeholder="22 números" />
                    </div>
                    <div>
                      <label htmlFor="wiz-alias" className={labelClass}>Alias</label>
                      <input id="wiz-alias" type="text" value={bankData.bank_alias} onChange={e => setBankData({ ...bankData, bank_alias: e.target.value })} className={inputClass} placeholder="mi.consultorio.mp" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wiz-wa" className={labelClass}>WhatsApp para recibir comprobantes</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93A3B8]" />
                      <input id="wiz-wa" type="text" value={bankData.bank_whatsapp} onChange={e => setBankData({ ...bankData, bank_whatsapp: e.target.value })} className={`${inputClass} pl-9`} placeholder="11 2345 6789" />
                    </div>
                  </div>
                  <p className="rounded-xl bg-[#EAF2FF] px-4 py-3 text-[13px] leading-relaxed text-[#53677E]">
                    Estos datos se muestran al paciente cuando reserva online, para que te transfiera la seña. Los cambiás cuando quieras en “Datos de la clínica”.
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[#EEF2F7] pt-6">
                  <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { trackOnboardingCompleted(); setStep(4) }} className="rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#53677E] hover:bg-[#F5F8FF] hover:text-[#0B2440]">
                      Omitir
                    </button>
                    <button type="button" onClick={handleSaveBankData} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#2458ED] px-6 py-3 text-[14.5px] font-semibold text-white hover:bg-[#1744CD] disabled:opacity-50">
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />} Siguiente <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
