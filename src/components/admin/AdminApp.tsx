import { BrandLogo } from '../brand/BrandLogo'
import React, { useState, useEffect } from 'react'
import { AdminLayout } from './AdminLayout'
import { Dashboard } from './Dashboard'
import { CalendarView } from './CalendarView'
import { ProfessionalsManager } from './ProfessionalsManager'
import { ServicesManager } from './ServicesManager'
import { PatientsView } from '../patients/PatientsView'
import { ObrasSocialesManager } from './ObrasSocialesManager'
import { RemindersView } from './RemindersView'
import { LiquidacionesManager } from './LiquidacionesManager'
import DebtorsReport from './DebtorsReport'
import CashFlow from './CashFlow'
import { FeriadosManager } from './FeriadosManager'
import { AusenciasManager } from './AusenciasManager'
import { SucursalesManager } from './SucursalesManager'
import { SettingsManager } from './SettingsManager'
import { UsersManager } from './UsersManager'
import { AsistenciasManager } from './AsistenciasManager'
import { ProtocolosManager } from './ProtocolosManager'
import { apiClient, EVENTO_SUSCRIPCION_BLOQUEADA } from '../../lib/api-client'
import { ClinicSetup } from './onboarding/ClinicSetup'
import { RecorridoPanel } from './guia/RecorridoPanel'
import { onboardingApi } from '../../api/onboarding'
import { useAuth } from '../../hooks/useAuth'
import { getPermissionsForRole, canAccessView, puede } from '../../config/permissions'
import { OnboardingWizard } from './OnboardingWizard'
import { AlertTriangle, XCircle, Clock, Sparkles, ArrowRight, X, Loader2, CheckCircle2 } from 'lucide-react'

interface SubscriptionStatus {
  subscription_status: 'pending_payment' | 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled'
  trial_ends_at?: string
  trial_days_remaining?: number
  show_trial_warning?: boolean
  trial_expired?: boolean
  grace_period_ends_at?: string
  nombre?: string
  slug?: string
  prices?: { monthly: number; annual: number }
}

const TrialExpiryModal: React.FC<{ daysLeft: number; onActivate: () => void; onDismiss: () => void }> = ({ daysLeft, onActivate, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Tu prueba gratuita está por vencer
          </h2>
          <p className="text-gray-500">
            Te {daysLeft === 1 ? 'queda' : 'quedan'} <span className="font-bold text-amber-600">{daysLeft} día{daysLeft !== 1 ? 's' : ''}</span> de prueba gratuita.
          </p>
        </div>

        <div className="bg-[#2458ED]/5 rounded-2xl p-5 mb-6 border border-[#2458ED]/10">
          <h3 className="font-bold text-gray-900 mb-3">Avanzá con nuestro plan:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2458ED] shrink-0" />
              <span>Acceso ilimitado a todas las funcionalidades</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2458ED] shrink-0" />
              <span>Soporte por email</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2458ED] shrink-0" />
              <span>Sin pérdida de datos al activar</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onActivate}
            className="w-full bg-[#2458ED] text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-[#1744CD] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.25)] text-center flex items-center justify-center gap-2"
          >
            Avanzá con nuestro plan
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onDismiss}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
          >
            Seguir con la prueba
          </button>
        </div>
      </div>
    </div>
  )
}

/** Sin onShowModal/onActivate (roles que no pagan) se avisa en vez de mostrar botones. */
const SubscriptionBanner: React.FC<{ status: SubscriptionStatus; onShowModal?: () => void; onActivate?: () => void }> = ({ status, onShowModal, onActivate }) => {
  const { subscription_status, trial_ends_at, grace_period_ends_at } = status

  if (subscription_status === 'trialing' && trial_ends_at) {
    const daysLeft = Math.max(0, Math.ceil((new Date(trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    if (daysLeft > 7) return null

    const isUrgent = daysLeft <= 2

    return (
      <div className={`${isUrgent ? 'bg-amber-50 border-b-2 border-amber-400' : 'bg-blue-50 border-b border-blue-200'} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-sm">
          <Clock className={`h-4 w-4 shrink-0 ${isUrgent ? 'text-amber-600' : 'text-blue-600'}`} />
          <span className={isUrgent ? 'text-amber-900' : 'text-blue-800'}>
            Tu prueba gratuita vence en <strong>{daysLeft} día{daysLeft !== 1 ? 's' : ''}</strong>.
            {isUrgent && (onShowModal ? ' Avanzá con nuestro plan para no perder tus datos.' : ' Avisale al administrador de la clínica.')}
          </span>
        </div>
        {onShowModal && <button
          onClick={onShowModal}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            isUrgent
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
              : 'bg-[#2458ED] text-white hover:bg-[#1744CD]'
          }`}
        >
          Ver plan
        </button>}
      </div>
    )
  }

  if (subscription_status === 'past_due') {
    const graceEnd = grace_period_ends_at ? new Date(grace_period_ends_at).toLocaleDateString('es-AR') : 'pronto'
    return (
      <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-center gap-2 text-amber-900 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Pago pendiente. Tenés acceso hasta el <strong>{graceEnd}</strong>. Por favor, regularizá tu suscripción.</span>
      </div>
    )
  }

  if (subscription_status === 'suspended' || subscription_status === 'cancelled') {
    return (
      <div className="bg-red-50 border-b border-red-300 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-red-900 text-sm">
        <span className="flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>Tu suscripción está <strong>{subscription_status === 'suspended' ? 'suspendida' : 'cancelada'}</strong>. Tus datos están guardados: {onActivate ? 'reactivá tu plan para seguir usando el panel.' : 'avisale al administrador de la clínica para reactivarla.'}</span>
        </span>
        {onActivate && <button onClick={onActivate} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700">Reactivar plan</button>}
      </div>
    )
  }

  return null
}

export const AdminApp: React.FC = () => {
  const { user } = useAuth()
  const rolePerms = getPermissionsForRole(user?.role)
  const [currentView, setCurrentView] = useState(rolePerms.defaultView)
  const [navParams, setNavParams] = useState<Record<string, any>>({})
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [forceActivation, setForceActivation] = useState(() => {
    return window.location.search.includes('activate=true');
  });
  // Clínica recién creada: se muestra el onboarding (ver onboardingController).
  const [needsSetup, setNeedsSetup] = useState(false)
  // Recorrido guiado del panel: se abre solo la primera vez en una clínica
  // nueva y después desde "Ayuda".
  const [recorridoAbierto, setRecorridoAbierto] = useState(false)
  const claveRecorrido = `dq_recorrido_visto_${user?.id ?? 'usuario'}`
  const abrirRecorridoSiNoLoVio = () => {
    try {
      if (!localStorage.getItem(claveRecorrido)) setRecorridoAbierto(true)
    } catch { /* sin almacenamiento: no se fuerza el recorrido */ }
  }
  const cerrarRecorrido = () => {
    setRecorridoAbierto(false)
    try { localStorage.setItem(claveRecorrido, '1') } catch { /* no crítico */ }
  }
  // Vuelta de MercadoPago / LemonSqueezy: el webhook puede tardar unos segundos.
  const [esperandoPago, setEsperandoPago] = useState(() => new URLSearchParams(window.location.search).get('payment') === 'success')

  const limpiarParametrosURL = (...claves: string[]) => {
    const url = new URL(window.location.href)
    claves.forEach((c) => url.searchParams.delete(c))
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash)
  }

  // La pantalla de pago se abre como una "página" más: el botón Atrás del
  // navegador vuelve al panel en vez de sacar al usuario de Dentiqly.
  const abrirActivacion = () => {
    setShowTrialModal(false)
    const url = new URL(window.location.href)
    url.searchParams.set('activate', 'true')
    window.history.pushState({ dqActivar: true }, '', url.pathname + url.search + url.hash)
    setForceActivation(true)
  }

  const salirActivacion = () => {
    if (window.history.state?.dqActivar) {
      window.history.back() // el popstate de abajo cierra la pantalla
      return
    }
    setForceActivation(false)
    limpiarParametrosURL('activate', 'payment')
  }

  useEffect(() => {
    const alNavegar = () => {
      setForceActivation(new URLSearchParams(window.location.search).get('activate') === 'true')
    }
    window.addEventListener('popstate', alNavegar)
    return () => window.removeEventListener('popstate', alNavegar)
  }, [])

  const handleViewChange = (view: string) => {
    // Al navegar desde el menú se descartan parámetros viejos (paciente abierto,
    // búsqueda): antes "Pacientes" reabría la ficha del último paciente visto.
    setNavParams({})
    if (canAccessView(user?.role, view)) {
      setCurrentView(view)
    } else {
      setCurrentView(rolePerms.defaultView)
    }
  }

  const handleNavigate = (view: string, params?: Record<string, any>) => {
    if (canAccessView(user?.role, view)) {
      setCurrentView(view)
      setNavParams(params || {})
    } else {
      setCurrentView(rolePerms.defaultView)
      setNavParams({})
    }
  }

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const data = await apiClient.get<SubscriptionStatus>('/billing/status')
        setSubscriptionStatus(data)

        if (user?.role === 'admin' && data.subscription_status !== 'pending_payment') {
          try {
            const estado = await onboardingApi.getStatus()
            setNeedsSetup(Boolean(estado.setup?.needsSetup))
            // Clínica que todavía no dio ningún turno: le mostramos el panel.
            if (!estado.setup?.needsSetup && estado.setup?.counts?.turnos === 0) abrirRecorridoSiNoLoVio()
          } catch {
            // Si no se puede saber, no se bloquea el panel con el onboarding.
          }
        }

        if (data.subscription_status === 'trialing' && data.trial_ends_at) {
          const daysLeft = Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          if (daysLeft <= 2 && puede(user?.role, 'gestionarPlan')) {
            const dismissKey = `trial_modal_dismissed_${new Date().toISOString().slice(0, 10)}`
            if (!sessionStorage.getItem(dismissKey)) {
              setShowTrialModal(true)
            }
          }
        }
      } catch {
        // Silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptionStatus()

    // Si el backend bloquea una llamada por la suscripción (trial vencido a
    // mitad del día, pago rechazado), se vuelve a leer el estado y el panel
    // muestra el aviso que corresponde en lugar de quedar vacío.
    const alBloquear = () => { fetchSubscriptionStatus() }
    window.addEventListener(EVENTO_SUSCRIPCION_BLOQUEADA, alBloquear)
    return () => window.removeEventListener(EVENTO_SUSCRIPCION_BLOQUEADA, alBloquear)
  }, [])

  // Después de pagar: se consulta el estado cada 3 s hasta que el webhook
  // active la clínica (máximo 1 minuto), en vez de volver a pedir el pago.
  useEffect(() => {
    if (!esperandoPago) return
    if (subscriptionStatus?.subscription_status === 'active') {
      setForceActivation(false)
      limpiarParametrosURL('payment', 'activate')
      const t = setTimeout(() => setEsperandoPago(false), 1800)
      return () => clearTimeout(t)
    }
    let intentos = 0
    const intervalo = setInterval(async () => {
      intentos++
      try {
        const data = await apiClient.get<SubscriptionStatus>('/billing/status')
        setSubscriptionStatus(data)
      } catch { /* se reintenta */ }
      if (intentos >= 20) {
        clearInterval(intervalo)
        setEsperandoPago(false)
        limpiarParametrosURL('payment')
      }
    }, 3000)
    return () => clearInterval(intervalo)
  }, [esperandoPago, subscriptionStatus?.subscription_status])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo alt="Dentiqly" className="h-10 w-auto animate-pulse-soft" />
          <div className="w-8 h-8 border-2 border-[#2458ED] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (esperandoPago) {
    const activa = subscriptionStatus?.subscription_status === 'active'
    return (
      <div className="dentiqly-auth-recovery min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[22px] border border-[#DCE5EE] bg-white p-8 text-center shadow-[0_18px_40px_-28px_#0B244040]">
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${activa ? 'bg-emerald-50 text-emerald-600' : 'bg-[#EAF2FF] text-[#2458ED]'}`}>
            {activa ? <CheckCircle2 className="h-7 w-7" /> : <Loader2 className="h-7 w-7 animate-spin" />}
          </span>
          <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-[#0B2440]">
            {activa ? '¡Pago confirmado!' : 'Estamos confirmando tu pago'}
          </h1>
          <p className="mt-2 text-sm text-[#53677E]">
            {activa ? 'Tu plan ya está activo. Te llevamos a tu panel.' : 'Suele tardar unos segundos. No hace falta que pagues de nuevo ni que cierres esta pestaña.'}
          </p>
        </div>
      </div>
    )
  }

  if ((subscriptionStatus?.subscription_status === 'pending_payment' || forceActivation) && !puede(user?.role, 'gestionarPlan')) {
    if (subscriptionStatus?.subscription_status === 'pending_payment') {
      return (
        <div className="dentiqly-auth-recovery min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-[22px] border border-[#DCE5EE] bg-white p-8 text-center shadow-[0_18px_40px_-28px_#0B244040]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2458ED]">
              <Clock className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-[#0B2440]">La clínica todavía no está activa</h1>
            <p className="mt-2 text-sm text-[#53677E]">
              El administrador de {subscriptionStatus?.nombre || 'la clínica'} tiene que activar el plan. Cuando lo haga, vas a poder entrar al panel.
            </p>
          </div>
        </div>
      )
    }
  }

  if ((subscriptionStatus?.subscription_status === 'pending_payment' || forceActivation) && puede(user?.role, 'gestionarPlan')) {
    // Toda clínica arranca con la prueba gratis y configura el panel con
    // ClinicSetup. Acá se llega solo para pagar: o porque la prueba venció
    // (pending_payment, sin salida) o porque eligió activar antes (?activate).
    const pruebaTerminada = subscriptionStatus?.subscription_status === 'pending_payment'
    return (
      <OnboardingWizard
        clinicaNombre={subscriptionStatus?.nombre}
        onComplete={() => window.location.reload()}
        initialStep={4}
        pruebaTerminada={pruebaTerminada}
        onExit={pruebaTerminada ? undefined : salirActivacion}
      />
    );
  }

  if (needsSetup) {
    return (
      <ClinicSetup
        clinicaNombre={subscriptionStatus?.nombre || user?.clinica?.nombre || ''}
        nombreAdmin={user?.nombre || ''}
        slug={subscriptionStatus?.slug}
        onFinish={(vista) => {
          setNeedsSetup(false)
          abrirRecorridoSiNoLoVio()
          if (vista && canAccessView(user?.role, vista)) setCurrentView(vista)
        }}
      />
    )
  }

  const renderCurrentView = () => {
    if (!canAccessView(user?.role, currentView)) {
      return <Dashboard slug={subscriptionStatus?.slug} onNavigate={handleNavigate} onRecorrido={() => setRecorridoAbierto(true)} />
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard
          slug={subscriptionStatus?.slug}
          onNavigate={handleNavigate}
          onRecorrido={() => setRecorridoAbierto(true)}
        />
      case 'calendar':
        return <CalendarView onNavigate={handleNavigate} />
      case 'patients':
        return <PatientsView initialPatientId={navParams.patientId} initialSearchTerm={navParams.searchTerm} />
      case 'professionals':
        return <ProfessionalsManager />
      case 'services':
        return <ServicesManager />
      case 'liquidaciones':
        return <LiquidacionesManager />
      case 'debtors':
        return <DebtorsReport />
      case 'cashflow':
        return <CashFlow />
      case 'feriados':
        return <FeriadosManager />
      case 'ausencias':
        return <AusenciasManager />
      case 'obras-sociales':
        return <ObrasSocialesManager />
      case 'recordatorios':
        return <RemindersView />
      case 'asistencias':
        return <AsistenciasManager />
      case 'protocolos':
        return <ProtocolosManager />
      case 'sucursales':
        return <SucursalesManager />
      case 'usuarios':
        return <UsersManager />
      case 'settings':
        return <SettingsManager key={navParams.tab || 'general'} initialTab={navParams.tab} />
      default:
        return <Dashboard slug={subscriptionStatus?.slug} onNavigate={handleNavigate} onRecorrido={() => setRecorridoAbierto(true)} />
    }
  }

  const handleDismissTrialModal = () => {
    const dismissKey = `trial_modal_dismissed_${new Date().toISOString().slice(0, 10)}`
    sessionStorage.setItem(dismissKey, 'true')
    setShowTrialModal(false)
  }

  const trialDaysLeft = subscriptionStatus?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscriptionStatus.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={handleViewChange}
      onSearch={(q) => handleNavigate('patients', { searchTerm: q })}
      subscriptionStatus={subscriptionStatus}
      onActivatePlan={abrirActivacion}
      onAyuda={() => setRecorridoAbierto(true)}
    >
      {subscriptionStatus && (
        <SubscriptionBanner
          status={subscriptionStatus}
          onShowModal={puede(user?.role, 'gestionarPlan') ? () => setShowTrialModal(true) : undefined}
          onActivate={puede(user?.role, 'gestionarPlan') ? abrirActivacion : undefined}
        />
      )}
      {renderCurrentView()}
      {recorridoAbierto && <RecorridoPanel onTerminar={cerrarRecorrido} />}
      {showTrialModal && !recorridoAbierto && (
        <TrialExpiryModal
          daysLeft={trialDaysLeft}
          onActivate={abrirActivacion}
          onDismiss={handleDismissTrialModal}
        />
      )}
    </AdminLayout>
  )
}