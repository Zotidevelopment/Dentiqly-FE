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
import { apiClient } from '../../lib/api-client'
import { useAuth } from '../../hooks/useAuth'
import { getPermissionsForRole, canAccessView } from '../../config/permissions'
import { OnboardingWizard } from './OnboardingWizard'
import { AlertTriangle, XCircle, Clock, Sparkles, ArrowRight, X } from 'lucide-react'

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

const TrialExpiryModal: React.FC<{ daysLeft: number; slug?: string; onDismiss: () => void }> = ({ daysLeft, slug, onDismiss }) => {
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Tu prueba gratuita está por vencer
          </h2>
          <p className="text-gray-500">
            Te {daysLeft === 1 ? 'queda' : 'quedan'} <span className="font-bold text-amber-600">{daysLeft} día{daysLeft !== 1 ? 's' : ''}</span> de prueba gratuita.
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#2563FF]/5 to-[#02E3FF]/5 rounded-2xl p-5 mb-6 border border-[#2563FF]/10">
          <h3 className="font-bold text-gray-900 mb-3">Avanzá con nuestro plan:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563FF] shrink-0" />
              <span>Acceso ilimitado a todas las funcionalidades</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563FF] shrink-0" />
              <span>Soporte prioritario 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563FF] shrink-0" />
              <span>Sin pérdida de datos al activar</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={slug ? `/${slug}/admin?activate=true` : '#'}
            className="w-full bg-[#2563FF] text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.25)] text-center flex items-center justify-center gap-2"
          >
            Avanzá con nuestro plan
            <ArrowRight className="h-4 w-4" />
          </a>
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

const SubscriptionBanner: React.FC<{ status: SubscriptionStatus; onShowModal: () => void }> = ({ status, onShowModal }) => {
  const { subscription_status, trial_ends_at, grace_period_ends_at } = status

  if (subscription_status === 'trialing' && trial_ends_at) {
    const daysLeft = Math.max(0, Math.ceil((new Date(trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    if (daysLeft > 7) return null

    const isUrgent = daysLeft <= 4

    return (
      <div className={`${isUrgent ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-400' : 'bg-blue-50 border-b border-blue-200'} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-sm">
          <Clock className={`h-4 w-4 shrink-0 ${isUrgent ? 'text-amber-600' : 'text-blue-600'}`} />
          <span className={isUrgent ? 'text-amber-900' : 'text-blue-800'}>
            Tu prueba gratuita vence en <strong>{daysLeft} día{daysLeft !== 1 ? 's' : ''}</strong>.
            {isUrgent && ' Avanzá con nuestro plan para no perder tus datos.'}
          </span>
        </div>
        <button
          onClick={onShowModal}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            isUrgent
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
              : 'bg-[#2563FF] text-white hover:bg-[#1D4ED8]'
          }`}
        >
          Ver plan
        </button>
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

  if (subscription_status === 'suspended') {
    return (
      <div className="bg-red-50 border-b border-red-300 px-4 py-3 flex items-center gap-2 text-red-900 text-sm">
        <XCircle className="h-4 w-4 shrink-0" />
        <span>Tu suscripción está <strong>suspendida</strong>. Algunas funciones pueden estar limitadas. Contactá a soporte para reactivar tu cuenta.</span>
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

  const handleViewChange = (view: string) => {
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

        if (data.subscription_status === 'trialing' && data.trial_ends_at) {
          const daysLeft = Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          if (daysLeft <= 4) {
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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-10 w-auto animate-pulse-soft" />
          <div className="w-8 h-8 border-2 border-[#2563FF] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (subscriptionStatus?.subscription_status === 'pending_payment' || forceActivation) {
    const isActivationFlow = window.location.search.includes('activate=true') || subscriptionStatus?.subscription_status !== 'pending_payment';
    return (
      <OnboardingWizard
        clinicaNombre={subscriptionStatus?.nombre}
        onComplete={() => window.location.reload()}
        initialStep={isActivationFlow ? 4 : 1}
      />
    );
  }

  const renderCurrentView = () => {
    if (!canAccessView(user?.role, currentView)) {
      return <Dashboard slug={subscriptionStatus?.slug} onNavigate={handleNavigate} />
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard
          slug={subscriptionStatus?.slug}
          onNavigate={handleNavigate}
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
      case 'sucursales':
        return <SucursalesManager />
      case 'usuarios':
        return <UsersManager />
      case 'settings':
        return <SettingsManager />
      default:
        return <Dashboard slug={subscriptionStatus?.slug} onNavigate={handleNavigate} />
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
      onActivatePlan={() => setForceActivation(true)}
    >
      {subscriptionStatus && <SubscriptionBanner status={subscriptionStatus} onShowModal={() => setShowTrialModal(true)} />}
      {renderCurrentView()}
      {showTrialModal && (
        <TrialExpiryModal
          daysLeft={trialDaysLeft}
          slug={subscriptionStatus?.slug}
          onDismiss={handleDismissTrialModal}
        />
      )}
    </AdminLayout>
  )
}