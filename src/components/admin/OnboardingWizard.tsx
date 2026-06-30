import React, { useState } from 'react'
import { apiClient } from '../../lib/api-client'
import { configuracionApi } from '../../api/configuracion'
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
} from 'lucide-react'

interface OnboardingWizardProps {
  clinicaNombre?: string
  onComplete?: () => void
  initialStep?: number
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ clinicaNombre, onComplete, initialStep = 1 }) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [step, setStep] = useState(initialStep)
  const [saving, setSaving] = useState(false)
  const [paying, setPaying] = useState(false)

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

  const totalSteps = 4

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
      toast({ variant: "destructive", title: "Error", description: "Error al guardar los datos. Intenta nuevamente." })
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
      setStep(4)
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Error al guardar los datos bancarios. Intenta nuevamente." })
    } finally {
      setSaving(false)
    }
  }

  const [billingPlan, setBillingPlan] = useState<'monthly' | 'annual' | 'test'>('monthly')
  const [region, setRegion] = useState<'argentina' | 'internacional'>('argentina')
  const showTestPlan = user?.role === 'superadmin' || user?.email === 'riostiziano6@gmail.com' || window.location.search.includes('test=true')

  const PRICES = {
    argentina: { monthly: 80000, annual: 864000, monthlyLabel: '$80.000 ARS', annualLabel: '$864.000 ARS', perMonth: '$72.000 ARS/mes', discount: '10%' },
    internacional: { monthly: 52, annual: 499, monthlyLabel: 'USD 52', annualLabel: 'USD 499', perMonth: 'USD 41.6/mes', discount: '20%' },
  }
  const prices = PRICES[region]

  const handlePayment = async () => {
    setPaying(true)
    try {
      const paymentMethod = region === 'internacional' ? 'lemonsqueezy' : 'mercadopago'
      const response = await apiClient.post<{ checkout_url?: string; init_point?: string }>('/billing/create-preference', {
        billing_plan: billingPlan,
        payment_method: paymentMethod,
      })
      const redirectUrl = response.checkout_url || response.init_point
      if (redirectUrl) {
        window.location.href = redirectUrl
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Hubo un error al conectar con el procesador de pagos. Intenta de nuevo o contacta a soporte." })
    } finally {
      setPaying(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023] outline-none'
  const labelClass = 'block text-xs font-bold text-[#0B1023] mb-1.5 uppercase tracking-wider'

  const stepIndicators = [
    { num: 1, label: 'Bienvenida' },
    { num: 2, label: 'Tu Clínica' },
    { num: 3, label: 'Pagos' },
    { num: 4, label: 'Activar' },
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF3FF] flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with step indicator */}
        <div className="bg-[#0B1023] px-8 py-5 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-[40%] -right-[20%] w-[50%] h-[80%] bg-[#2563FF]/10 rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-7 w-auto brightness-0 invert" />
              <span className="text-white/30 text-xs font-medium">|</span>
              <span className="text-white/50 text-xs font-medium">Configuración inicial</span>
            </div>
            <div className="flex items-center gap-1">
              {stepIndicators.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      step === s.num
                        ? 'bg-[#2563FF] text-white'
                        : step > s.num
                          ? 'bg-white/10 text-white/60'
                          : 'text-white/20'
                    }`}
                  >
                    {step > s.num ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span>{s.num}</span>
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < stepIndicators.length - 1 && (
                    <div className={`w-4 h-px mx-0.5 ${step > s.num ? 'bg-[#2563FF]' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="p-8 sm:p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563FF] to-[#7C3AED] flex items-center justify-center mb-6 shadow-lg shadow-[#2563FF]/20">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#0B1023] mb-2">
                ¡Bienvenido a Dentiqly!
              </h1>
              <p className="text-[#8A93A8] text-base max-w-md mb-8 leading-relaxed">
                Vamos a configurar <span className="font-bold text-[#0B1023]">{clinicaNombre || 'tu clínica'}</span> en unos simples pasos para que puedas empezar a trabajar.
              </p>

              <div className="w-full max-w-sm space-y-3 mb-8 text-left">
                {[
                  { icon: Building2, text: 'Completá los datos de tu clínica', color: '#2563FF' },
                  { icon: CreditCard, text: 'Configurá tus datos bancarios', color: '#7C3AED' },
                  { icon: Rocket, text: 'Activá tu suscripción y empezá', color: '#22C55E' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-xl">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
                      <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium text-[#0B1023]">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="bg-[#2563FF] text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563FF]/25 flex items-center gap-2"
              >
                Comenzar configuración
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Clinic Info */}
          {step === 2 && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#2563FF]/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#2563FF]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0B1023]">Datos de tu clínica</h2>
                  <p className="text-xs text-[#8A93A8]">Información que verán tus pacientes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nombre de la clínica</label>
                    <input
                      type="text"
                      value={clinicData.clinic_name}
                      onChange={e => setClinicData({ ...clinicData, clinic_name: e.target.value })}
                      className={inputClass}
                      placeholder="Ej: Dental Center"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Teléfono de contacto</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A93A8]" />
                      <input
                        type="tel"
                        value={clinicData.clinic_phone}
                        onChange={e => setClinicData({ ...clinicData, clinic_phone: e.target.value })}
                        className={`${inputClass} pl-9`}
                        placeholder="+54 11 ..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A93A8]" />
                    <input
                      type="text"
                      value={clinicData.clinic_address}
                      onChange={e => setClinicData({ ...clinicData, clinic_address: e.target.value })}
                      className={`${inputClass} pl-9`}
                      placeholder="Av. Corrientes 1234, CABA"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Google Maps (embed URL - opcional)</label>
                  <textarea
                    value={clinicData.clinic_google_maps}
                    onChange={e => setClinicData({ ...clinicData, clinic_google_maps: e.target.value })}
                    className={`${inputClass} h-20 resize-none font-mono text-xs`}
                    placeholder="Pegá el link de Google Maps 'Insertar mapa'..."
                  />
                  <p className="text-[10px] text-[#8A93A8] mt-1">Se mostrará en el pie de página de las reservas online.</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm font-medium text-[#8A93A8] hover:text-[#0B1023] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
                <button
                  onClick={handleSaveClinicData}
                  disabled={saving}
                  className="bg-[#2563FF] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563FF]/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Banking */}
          {step === 3 && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0B1023]">Datos bancarios</h2>
                  <p className="text-xs text-[#8A93A8]">Para recibir pagos y señas de tus pacientes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Entidad bancaria</label>
                    <input
                      type="text"
                      value={bankData.bank_name}
                      onChange={e => setBankData({ ...bankData, bank_name: e.target.value })}
                      className={inputClass}
                      placeholder="Ej: Banco Galicia"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Titular de cuenta</label>
                    <input
                      type="text"
                      value={bankData.bank_account_holder}
                      onChange={e => setBankData({ ...bankData, bank_account_holder: e.target.value })}
                      className={inputClass}
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CBU / CVU</label>
                    <input
                      type="text"
                      value={bankData.bank_cbu}
                      onChange={e => setBankData({ ...bankData, bank_cbu: e.target.value })}
                      className={inputClass}
                      placeholder="0000003100..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alias</label>
                    <input
                      type="text"
                      value={bankData.bank_alias}
                      onChange={e => setBankData({ ...bankData, bank_alias: e.target.value })}
                      className={inputClass}
                      placeholder="mi.alias.mp"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>WhatsApp para comprobantes</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A93A8]" />
                    <input
                      type="text"
                      value={bankData.bank_whatsapp}
                      onChange={e => setBankData({ ...bankData, bank_whatsapp: e.target.value })}
                      className={`${inputClass} pl-9`}
                      placeholder="54911..."
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#EEF3FF] rounded-xl border border-[#2563FF]/10">
                  <p className="text-[11px] text-[#4B5568] leading-relaxed">
                    <span className="font-bold text-[#0B1023]">Nota:</span> Estos datos se mostrarán a tus pacientes al finalizar una reserva online para que envíen el comprobante de seña. Podés modificarlos luego en Configuración.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-sm font-medium text-[#8A93A8] hover:text-[#0B1023] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(4)}
                    className="text-sm font-medium text-[#8A93A8] hover:text-[#0B1023] transition-colors"
                  >
                    Omitir por ahora
                  </button>
                  <button
                    onClick={handleSaveBankData}
                    disabled={saving}
                    className="bg-[#2563FF] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563FF]/25 flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0B1023]">Activá tu clínica</h2>
                  <p className="text-xs text-[#8A93A8]">Un solo plan, todas las funcionalidades</p>
                </div>
              </div>

              {/* Selector de región */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => setRegion('argentina')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    region === 'argentina'
                      ? 'bg-[#0B1023] text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  🇦🇷 Argentina
                </button>
                <button
                  onClick={() => setRegion('internacional')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    region === 'internacional'
                      ? 'bg-[#0B1023] text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Internacional
                </button>
              </div>

              {/* Billing cycle toggle */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => setBillingPlan('monthly')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    billingPlan === 'monthly'
                      ? 'bg-[#2563FF] text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingPlan('annual')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                    billingPlan === 'annual'
                      ? 'bg-[#2563FF] text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Anual
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    billingPlan === 'annual' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                  }`}>
                    -{prices.discount}
                  </span>
                </button>
                {showTestPlan && (
                  <button
                    onClick={() => setBillingPlan('test')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      billingPlan === 'test'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Prueba ($1)
                  </button>
                )}
              </div>

              {/* Plan card */}
              <div className="bg-gradient-to-br from-[#0B1023] to-[#1a2040] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden mb-6">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-[30%] -right-[10%] w-[40%] h-[60%] bg-[#2563FF]/15 rounded-full blur-[60px]" />
                  <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-[#7C3AED]/10 rounded-full blur-[60px]" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-4 w-4 text-[#02E3FF]" />
                        <span className="text-xs font-bold text-[#02E3FF] uppercase tracking-wider">
                          {billingPlan === 'test' ? 'Plan de Prueba (SuperAdmin)' : `Plan Pro ${billingPlan === 'annual' ? 'Anual' : 'Mensual'}`}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold">Dentiqly</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold">
                        {billingPlan === 'test'
                          ? (region === 'internacional' ? 'USD 1' : '$1')
                          : billingPlan === 'monthly'
                            ? prices.monthlyLabel
                            : prices.annualLabel}
                      </p>
                      <p className="text-xs text-white/40">
                        {billingPlan === 'test'
                          ? 'cobro único de prueba'
                          : billingPlan === 'monthly'
                            ? (region === 'internacional' ? 'USD / mes' : 'ARS / mes')
                            : (region === 'internacional' ? 'USD / año' : 'ARS / año')}
                        {billingPlan === 'annual' && (
                          <span className="block text-[#22C55E]">{prices.perMonth} · {prices.discount} off</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-4" />

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Agenda y turnos ilimitados',
                      'Gestión de pacientes',
                      'Historial clínico digital',
                      'Odontograma interactivo',
                      'Facturación y obras sociales',
                      'Reservas online',
                      'Portal de pacientes',
                      'Soporte prioritario',
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-[#22C55E] shrink-0" />
                        <span className="text-[11px] text-white/70">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <div className="mb-6">
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#2563FF] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563FF]/25 disabled:opacity-50 text-sm"
                >
                  {paying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Conectando...
                    </>
                  ) : region === 'argentina' ? (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pagar con MercadoPago
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pagar con tarjeta · USD
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 text-sm font-medium text-[#8A93A8] hover:text-[#0B1023] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#2563FF] font-bold text-xs hover:underline flex items-center gap-1"
                >
                  Ya pagué, actualizar estado
                  <Check className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
