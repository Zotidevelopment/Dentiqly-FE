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
import { ProductIcon, type ProductIconAnyName } from '../landing/ui/ProductIcon'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Loader2 } from 'lucide-react'
import '../landing/landing.css'
import '../landing/product-motion.css'
import './onboarding-wizard.css'

/**
 * Configuración inicial y activación del plan, con el mismo sistema visual de
 * la landing (clases lp-* + onboarding-wizard.css): panel celeste con las
 * líneas del hero, íconos de producto y la tarjeta de precio de la landing.
 */

interface OnboardingWizardProps {
  clinicaNombre?: string
  onComplete?: () => void
  initialStep?: number
  /** Si la clínica ya puede usar el panel (trial vigente), permite salir. */
  onExit?: () => void
  /** La prueba gratis venció: hay que pagar para seguir usando el panel. */
  pruebaTerminada?: boolean
}

const FUNCIONES = [
  'Agenda y reservas online',
  'Historias clínicas y archivos',
  'Odontograma y planes de tratamiento',
  'Recordatorios por email en un clic',
  'Caja, cuentas corrientes y liquidaciones',
  'Equipo, roles y hasta 3 sucursales',
]

const PASOS: { num: number; label: string; icono: ProductIconAnyName; titulo: string; texto: string }[] = [
  { num: 2, label: 'Tu clínica', icono: 'clinic', titulo: 'Datos de tu clínica', texto: 'Nombre, dirección y teléfono que ven tus pacientes al reservar.' },
  { num: 3, label: 'Cobros', icono: 'finance', titulo: 'Datos para cobrar señas', texto: 'Tu CBU o alias, para que te transfieran al reservar. Es opcional.' },
  { num: 4, label: 'Activar', icono: 'plan', titulo: 'Activá tu plan', texto: 'Elegís mensual o anual y pagás con tarjeta. Cancelás cuando quieras.' },
]

/** Líneas decorativas del hero de la landing. */
const ArteHero: React.FC = () => (
  <div className="lp-hero-art" aria-hidden="true">
    <svg className="lp-hero-orbit" viewBox="0 0 440 580" fill="none">
      <rect x="83" y="35" width="310" height="460" rx="155" stroke="currentColor" />
      <rect x="40" y="-8" width="396" height="546" rx="198" stroke="currentColor" />
      <path d="M238 112V201C238 236 209 265 174 265H83" stroke="currentColor" strokeDasharray="5 7" />
      <circle cx="238" cy="112" r="7" fill="#f8fbff" stroke="currentColor" strokeWidth="2" />
      <circle cx="83" cy="265" r="7" fill="#d0e1fc" stroke="currentColor" strokeWidth="2" />
    </svg>
    <svg className="lp-hero-route" viewBox="0 0 380 260" fill="none">
      <path d="M-30 215H100C144 215 180 179 180 135V125C180 81 216 45 260 45H400" stroke="currentColor" />
      <path d="M-30 242H100C159 242 207 194 207 135V125C207 96 231 72 260 72H400" stroke="currentColor" strokeDasharray="3 8" />
      <circle cx="180" cy="135" r="7" fill="#eaf2ff" stroke="currentColor" strokeWidth="2" />
      <circle cx="300" cy="45" r="5" fill="currentColor" />
    </svg>
  </div>
)

const Icono: React.FC<{ name: ProductIconAnyName; size?: number }> = ({ name, size = 34 }) => (
  <span className={`lp-product-icon lp-product-icon-${name}`}>
    <ProductIcon name={name} size={size} />
  </span>
)

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ clinicaNombre, initialStep = 1, onExit, pruebaTerminada = false }) => {
  const { toast } = useToast()
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

  const irAActivar = () => {
    // Paso 4 es "Activar": llegar acá significa que la clínica terminó de
    // configurarse. Lo que sigue es la decisión de pago, no configuración.
    trackOnboardingCompleted()
    setStep(4)
  }

  const handleSaveBankData = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(bankData)) {
        if (value.trim()) {
          await configuracionApi.crear({ clave: key, valor: value, tipo: 'string', categoria: 'banking' })
        }
      }
      irAActivar()
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Error al guardar los datos bancarios. Intentá nuevamente." })
    } finally {
      setSaving(false)
    }
  }

  const [annual, setAnnual] = useState(false)
  const [currency, setCurrency] = useState<'ars' | 'usd'>('ars')
  // Pago de prueba de USD 1: no se muestra nunca en la pantalla. Solo existe
  // entrando con ?test=true en la dirección, para probar el cobro real.
  const pagoDePrueba = new URLSearchParams(window.location.search).get('test') === 'true'

  const plans = useBillingPlans()
  const plan = plans?.[currency][annual ? 'annual' : 'monthly']
  const amount = plan ? (annual ? (plan.pricePerMonth ?? Math.round(plan.price / 12)) : plan.price) : undefined
  const annualDiscount = plans?.[currency].annual.discount

  // Descuento del primer mes: solo para clínicas que nunca pagaron (lo decide el backend).
  const [descuentoClinica, setDescuentoClinica] = useState(0)
  useEffect(() => {
    apiClient.get<{ first_month_discount?: number }>('/billing/status')
      .then((r) => setDescuentoClinica(r.first_month_discount || 0))
      .catch(() => {})
  }, [])
  const primerMes =
    !annual && descuentoClinica > 0 && plan?.firstMonthDiscount && plan.firstMonthPrice !== undefined
      ? { precio: plan.firstMonthPrice, off: plan.firstMonthDiscount }
      : null

  const format = (n: number) =>
    new Intl.NumberFormat('es-AR', { maximumFractionDigits: currency === 'ars' ? 0 : 2 }).format(n)

  // El cobro es siempre en dólares (Lemon Squeezy). En pesos se muestra el
  // equivalente aproximado y, en letra chica, cuánto se cobra en USD.
  const usdPlan = plans?.usd[annual ? 'annual' : 'monthly']
  const usdACobrar = !usdPlan ? undefined : primerMes && usdPlan.firstMonthPrice !== undefined ? usdPlan.firstMonthPrice : usdPlan.price

  const handlePayment = async (billingPlan: 'monthly' | 'annual' | 'test') => {
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

  const nombre = clinicaNombre || 'tu clínica'

  return (
    <div className="dentiqly-landing dq-onb">
      <header className="dq-onb-header">
        <div className="dq-onb-brand">
          <BrandLogo alt="Dentiqly" className="dq-onb-logo" />
          <span className="dq-onb-brand-label">{soloActivacion ? 'Activar plan' : 'Configuración inicial'}</span>
        </div>

        {!soloActivacion && (
          <ol className="dq-onb-steps" aria-label="Pasos">
            {[{ num: 1, label: 'Bienvenida' }, ...PASOS].map((s) => (
              <li
                key={s.num}
                className={step === s.num ? 'is-current' : step > s.num ? 'is-done' : undefined}
                aria-current={step === s.num ? 'step' : undefined}
              >
                <span>{step > s.num ? <Check size={13} strokeWidth={2.6} /> : s.num}</span>
                {s.label}
              </li>
            ))}
          </ol>
        )}
        {soloActivacion && <span aria-hidden="true" />}

        {onExit ? (
          <button type="button" onClick={onExit} className="lp-button lp-button-outline dq-onb-exit">
            <ArrowLeft size={16} /> Volver al panel
          </button>
        ) : (
          <span className="dq-onb-exit-spacer" aria-hidden="true" />
        )}
      </header>

      <main className="dq-onb-stage">
        <ArteHero />

        {!soloActivacion && (
          <p className="dq-onb-mobile-step">Paso {step} de 4</p>
        )}

        {/* ── Paso 1: bienvenida ── */}
        {step === 1 && (
          <div className="dq-onb-welcome dq-onb-enter">
            <div className="lp-hero-intro">
              <p className="lp-hero-category">Te lleva unos 3 minutos</p>
              <h1>
                Bienvenido a Dentiqly.{' '}
                <br />
                <span>Dejemos {nombre} lista.</span>
              </h1>
              <p className="lp-hero-description">
                Tres pasos cortos y empezás a dar turnos. Todo lo que cargues ahora lo podés cambiar después desde “Datos de la clínica”.
              </p>
            </div>

            <ol className="dq-onb-roadmap">
              {PASOS.map((p, i) => (
                <li key={p.num}>
                  <div className="dq-onb-roadmap-top">
                    <Icono name={p.icono} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ol>

            <div className="lp-hero-actions">
              <button type="button" onClick={() => setStep(2)} className="lp-button">
                Comenzar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 2: datos de la clínica ── */}
        {step === 2 && (
          <div className="dq-onb-split dq-onb-enter">
            <section className="dq-onb-copy">
              <Icono name="clinic" />
              <p className="lp-eyebrow">Paso 1 de 3</p>
              <h2>Tu clínica, como la ven tus pacientes.</h2>
              <p>
                Estos datos aparecen en tu página de reservas y en los emails que reciben tus pacientes.
              </p>
            </section>

            <form
              className="dq-onb-card"
              onSubmit={(e) => { e.preventDefault(); handleSaveClinicData() }}
            >
              <div className="dq-onb-card-header">
                <span>DATOS DE LA CLÍNICA</span>
                <span className="lp-price-tag">Se puede cambiar después</span>
              </div>
              <div className="dq-onb-fields">
                <label>
                  Nombre de la clínica
                  <input type="text" value={clinicData.clinic_name} onChange={e => setClinicData({ ...clinicData, clinic_name: e.target.value })} placeholder="Ej: Consultorio Dental Belgrano" />
                </label>
                <label>
                  Teléfono o WhatsApp
                  <input type="tel" value={clinicData.clinic_phone} onChange={e => setClinicData({ ...clinicData, clinic_phone: e.target.value })} placeholder="11 2345 6789" />
                </label>
                <label className="dq-onb-wide">
                  Dirección
                  <input type="text" value={clinicData.clinic_address} onChange={e => setClinicData({ ...clinicData, clinic_address: e.target.value })} placeholder="Av. Cabildo 1234, CABA" />
                </label>
                <label className="dq-onb-wide">
                  <span>Mapa de Google <small>opcional</small></span>
                  <textarea rows={3} value={clinicData.clinic_google_maps} onChange={e => setClinicData({ ...clinicData, clinic_google_maps: e.target.value })} placeholder="Google Maps → Compartir → Insertar un mapa, y pegá el código acá" />
                </label>
              </div>
              <div className="dq-onb-actions">
                <button type="button" onClick={() => setStep(1)} className="dq-onb-back">
                  <ArrowLeft size={16} /> Atrás
                </button>
                <button type="submit" disabled={saving} className="lp-button">
                  {saving ? <Loader2 size={17} className="animate-spin" /> : null}
                  Siguiente <ArrowRight size={17} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Paso 3: datos para cobrar señas ── */}
        {step === 3 && (
          <div className="dq-onb-split dq-onb-enter">
            <section className="dq-onb-copy">
              <Icono name="finance" />
              <p className="lp-eyebrow">Paso 2 de 3</p>
              <h2>Cobrá la seña cuando reservan.</h2>
              <p>
                Cuando un paciente reserva online, le mostramos estos datos para que te transfiera la seña y te mande el comprobante.
              </p>
              <ul className="lp-check-list">
                <li><Check size={16} /> Es opcional: lo podés dejar para después</li>
                <li><Check size={16} /> La plata va directo a tu cuenta</li>
              </ul>
            </section>

            <form
              className="dq-onb-card"
              onSubmit={(e) => { e.preventDefault(); handleSaveBankData() }}
            >
              <div className="dq-onb-card-header">
                <span>DATOS PARA COBRAR</span>
                <span className="lp-price-tag">Opcional</span>
              </div>
              <div className="dq-onb-fields">
                <label>
                  Banco o billetera
                  <input type="text" value={bankData.bank_name} onChange={e => setBankData({ ...bankData, bank_name: e.target.value })} placeholder="Ej: Banco Galicia" />
                </label>
                <label>
                  Titular de la cuenta
                  <input type="text" value={bankData.bank_account_holder} onChange={e => setBankData({ ...bankData, bank_account_holder: e.target.value })} placeholder="Nombre y apellido" />
                </label>
                <label>
                  CBU / CVU
                  <input type="text" inputMode="numeric" value={bankData.bank_cbu} onChange={e => setBankData({ ...bankData, bank_cbu: e.target.value })} placeholder="22 números" />
                </label>
                <label>
                  Alias
                  <input type="text" value={bankData.bank_alias} onChange={e => setBankData({ ...bankData, bank_alias: e.target.value })} placeholder="mi.consultorio" />
                </label>
                <label className="dq-onb-wide">
                  WhatsApp para recibir comprobantes
                  <input type="tel" value={bankData.bank_whatsapp} onChange={e => setBankData({ ...bankData, bank_whatsapp: e.target.value })} placeholder="11 2345 6789" />
                </label>
              </div>
              <div className="dq-onb-actions">
                <button type="button" onClick={() => setStep(2)} className="dq-onb-back">
                  <ArrowLeft size={16} /> Atrás
                </button>
                <div className="dq-onb-actions-end">
                  <button type="button" onClick={irAActivar} className="dq-onb-back">
                    Omitir
                  </button>
                  <button type="submit" disabled={saving} className="lp-button">
                    {saving ? <Loader2 size={17} className="animate-spin" /> : null}
                    Siguiente <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Paso 4: activar el plan ── */}
        {step === 4 && (
          <div className="dq-onb-split dq-onb-split-pay dq-onb-enter">
            <section className="dq-onb-copy">
              <Icono name="plan" />
              <p className="lp-eyebrow">{pruebaTerminada ? 'Tu prueba gratis terminó' : soloActivacion ? 'Plan Profesional' : 'Último paso'}</p>
              <h2>{pruebaTerminada ? <>Activá {nombre} para seguir atendiendo.</> : <>Activá {nombre} y seguí atendiendo sin cortes.</>}</h2>
              <p>
                {pruebaTerminada
                  ? 'Todo lo que cargaste en la prueba sigue ahí: pacientes, turnos e historias clínicas. Activá el plan y retomás donde lo dejaste.'
                  : 'Un solo plan con todo incluido. Tus pacientes, turnos e historias clínicas quedan guardados como están.'}
              </p>
              {/* Las funciones van acá y no en la tarjeta, para que todo entre sin scroll. */}
              <ul className="lp-check-list dq-onb-features">
                {FUNCIONES.map((f) => (
                  <li key={f}><Check size={16} />{f}</li>
                ))}
              </ul>
            </section>

            <div className="lp-price-card dq-onb-price">
              <div className="lp-price-card-header">
                <span>PROFESIONAL</span>
                <span className="lp-price-tag">Todo conectado.</span>
              </div>
              <div className="lp-price-controls">
                <div role="group" aria-label="Período de facturación" className="lp-price-period">
                  <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>
                    Mensual
                  </button>
                  <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>
                    Anual {annualDiscount ? <span>−{annualDiscount}%</span> : ''}
                  </button>
                </div>
                <label className="lp-currency">
                  <span className="sr-only">Moneda</span>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as 'ars' | 'usd')}>
                    <option value="ars">ARS</option>
                    <option value="usd">USD</option>
                  </select>
                  <ChevronDown size={13} />
                </label>
              </div>

              <div className="lp-price-amount" aria-live="polite">
                {amount === undefined ? (
                  <div className="lp-price-loading" role="status">
                    <Loader2 size={21} className="animate-spin" /> Cargando precio…
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="lp-price-symbol">$</span>
                      <strong>{format(amount)}</strong>
                      <span className="lp-price-currency">{currency.toUpperCase()}</span>
                    </div>
                    <p>{annual ? 'por mes, pagando el año' : 'por mes, por clínica'}</p>
                  </>
                )}
                {primerMes && (
                  <p className="lp-price-intro">
                    <span>{primerMes.off}% off</span> Tu primer mes: $ {format(primerMes.precio)} {currency.toUpperCase()}
                  </p>
                )}
                {annual && plan && (
                  <small>Un pago anual de $ {format(plan.price)} {currency.toUpperCase()}.</small>
                )}
                {currency === 'ars' && usdPlan && (
                  <small>
                    Precio aproximado. Se cobra en dólares (USD{' '}
                    {primerMes ? `${usdPlan.firstMonthPrice} el primer mes, después ${usdPlan.price}` : usdPlan.price}
                    {annual ? ' por año' : ''}) con tu tarjeta.
                  </small>
                )}
              </div>

              <button
                type="button"
                onClick={() => handlePayment(annual ? 'annual' : 'monthly')}
                disabled={paying}
                className="lp-button"
              >
                {paying ? 'Abriendo el pago…' : 'Pagar con tarjeta'}
                {paying ? <Loader2 size={19} className="animate-spin" /> : <ArrowUpRight size={19} />}
              </button>
              <p className="lp-price-trial">
                Se renueva solo {annual ? 'cada año' : 'cada mes'} · Cancelás cuando quieras · Pago seguro
              </p>

              <div className="dq-onb-pay-footer">
                {soloActivacion ? (
                  // "Volver al panel" ya está arriba, en la barra.
                  <span />
                ) : (
                  <button type="button" onClick={() => setStep(3)} className="dq-onb-back">
                    <ArrowLeft size={15} /> Atrás
                  </button>
                )}
                <button type="button" onClick={yaPague} className="dq-onb-link">
                  Ya pagué, actualizar estado <ArrowRight size={15} />
                </button>
              </div>

              {pagoDePrueba && (
                <button type="button" onClick={() => handlePayment('test')} disabled={paying} className="dq-onb-test">
                  Pago de prueba (USD 1)
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
