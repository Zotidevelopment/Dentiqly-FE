import React, { useState, useEffect, useCallback } from "react"
import {
  CheckCircle2,
  Building2,
  UserPlus,
  Stethoscope,
  Clock,
  Link2,
  ChevronRight,
  Rocket,
  X,
  PartyPopper,
  MapPin,
  Shield,
  DollarSign,
  Wallet,
  FileText,
  Smile,
  Pill,
  ClipboardList,
  Paperclip,
  CreditCard,
  Bell,
  ChevronDown,
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  icon: React.ReactNode
  autoCompleted: boolean
  navigateTo: string
  cta: string
}

interface OnboardingChecklistProps {
  totalProfesionales: number
  totalServicios: number
  totalPacientes: number
  hasClinicInfo: boolean
  hasSchedule: boolean
  hasSucursales: boolean
  hasObrasSociales: boolean
  hasLiquidaciones: boolean
  hasCashflowIngresos: boolean
  hasCashflowEgresos: boolean
  hasHistoriaClinica: boolean
  hasOdontograma: boolean
  hasPrescripcion: boolean
  hasTratamiento: boolean
  hasArchivos: boolean
  hasCuentaCorriente: boolean
  slug?: string
  onNavigate: (view: string) => void
  onDismiss: () => void
}

const MANUAL_CHECKS_KEY = "onboarding_manual_checks"
const MAX_VISIBLE = 5

function getManualChecks(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(MANUAL_CHECKS_KEY) || "{}")
  } catch {
    return {}
  }
}

function setManualCheck(id: string, checked: boolean) {
  const current = getManualChecks()
  current[id] = checked
  localStorage.setItem(MANUAL_CHECKS_KEY, JSON.stringify(current))
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  totalProfesionales,
  totalServicios,
  totalPacientes,
  hasClinicInfo,
  hasSchedule,
  hasSucursales,
  hasObrasSociales,
  hasLiquidaciones,
  hasCashflowIngresos,
  hasCashflowEgresos,
  hasHistoriaClinica,
  hasOdontograma,
  hasPrescripcion,
  hasTratamiento,
  hasArchivos,
  hasCuentaCorriente,
  slug,
  onNavigate,
  onDismiss,
}) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>(getManualChecks)
  const [expanded, setExpanded] = useState(false)

  const toggleManual = useCallback((id: string) => {
    setManualChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      setManualCheck(id, next[id])
      return next
    })
  }, [])

  const steps: OnboardingStep[] = [
    {
      id: "clinic",
      title: "Completá los datos de tu clínica",
      icon: <Building2 className="w-4 h-4" />,
      autoCompleted: hasClinicInfo,
      navigateTo: "settings",
      cta: "Configuración",
    },
    {
      id: "professionals",
      title: "Sumá a tus profesionales",
      icon: <UserPlus className="w-4 h-4" />,
      autoCompleted: totalProfesionales > 0,
      navigateTo: "professionals",
      cta: "Profesionales",
    },
    {
      id: "services",
      title: "Personalizá tus servicios",
      icon: <Stethoscope className="w-4 h-4" />,
      autoCompleted: totalServicios > 4,
      navigateTo: "services",
      cta: "Servicios",
    },
    {
      id: "schedule",
      title: "Definí los horarios de atención",
      icon: <Clock className="w-4 h-4" />,
      autoCompleted: hasSchedule,
      navigateTo: "settings",
      cta: "Horarios",
    },
    {
      id: "sucursales",
      title: "Creá tu primera sucursal",
      icon: <MapPin className="w-4 h-4" />,
      autoCompleted: hasSucursales,
      navigateTo: "sucursales",
      cta: "Sucursales",
    },
    {
      id: "obras-sociales",
      title: "Cargá las obras sociales",
      icon: <Shield className="w-4 h-4" />,
      autoCompleted: hasObrasSociales,
      navigateTo: "obras-sociales",
      cta: "Obras sociales",
    },
    {
      id: "liquidaciones",
      title: "Registrá una liquidación",
      icon: <DollarSign className="w-4 h-4" />,
      autoCompleted: hasLiquidaciones,
      navigateTo: "liquidaciones",
      cta: "Liquidaciones",
    },
    {
      id: "cashflow-ingreso",
      title: "Registrá un ingreso en caja",
      icon: <Wallet className="w-4 h-4" />,
      autoCompleted: hasCashflowIngresos,
      navigateTo: "cashflow",
      cta: "Flujo de caja",
    },
    {
      id: "cashflow-egreso",
      title: "Registrá un egreso en caja",
      icon: <Wallet className="w-4 h-4" />,
      autoCompleted: hasCashflowEgresos,
      navigateTo: "cashflow",
      cta: "Flujo de caja",
    },
    {
      id: "historia-clinica",
      title: "Cargá una historia clínica",
      icon: <FileText className="w-4 h-4" />,
      autoCompleted: hasHistoriaClinica,
      navigateTo: "patients",
      cta: "Pacientes",
    },
    {
      id: "odontograma",
      title: "Completá un odontograma",
      icon: <Smile className="w-4 h-4" />,
      autoCompleted: hasOdontograma,
      navigateTo: "patients",
      cta: "Pacientes",
    },
    {
      id: "prescripcion",
      title: "Creá una prescripción",
      icon: <Pill className="w-4 h-4" />,
      autoCompleted: hasPrescripcion,
      navigateTo: "patients",
      cta: "Pacientes",
    },
    {
      id: "tratamiento",
      title: "Creá un plan de tratamiento",
      icon: <ClipboardList className="w-4 h-4" />,
      autoCompleted: hasTratamiento,
      navigateTo: "patients",
      cta: "Pacientes",
    },
    {
      id: "archivos",
      title: "Subí un archivo a un paciente",
      icon: <Paperclip className="w-4 h-4" />,
      autoCompleted: hasArchivos,
      navigateTo: "patients",
      cta: "Pacientes",
    },
    {
      id: "cuenta-corriente",
      title: "Registrá un movimiento en cuenta corriente",
      icon: <CreditCard className="w-4 h-4" />,
      autoCompleted: hasCuentaCorriente,
      navigateTo: "patients",
      cta: "Pacientes",
    },
    {
      id: "recordatorio",
      title: "Creá un recordatorio",
      icon: <Bell className="w-4 h-4" />,
      autoCompleted: false,
      navigateTo: "patients",
      cta: "Pacientes",
    },
    {
      id: "booking",
      title: "Compartí tu link de reservas",
      icon: <Link2 className="w-4 h-4" />,
      autoCompleted: totalPacientes > 0,
      navigateTo: "dashboard",
      cta: "Copiar enlace",
    },
  ]

  const isStepCompleted = (step: OnboardingStep) => step.autoCompleted || !!manualChecks[step.id]
  const completedCount = steps.filter(isStepCompleted).length
  const totalSteps = steps.length
  const progress = Math.round((completedCount / totalSteps) * 100)
  const allDone = completedCount === totalSteps

  const pendingSteps = steps.filter((s) => !isStepCompleted(s))
  const visibleSteps = expanded ? pendingSteps : pendingSteps.slice(0, MAX_VISIBLE)
  const hiddenCount = pendingSteps.length - MAX_VISIBLE

  useEffect(() => {
    requestAnimationFrame(() => setAnimateIn(true))
  }, [])

  useEffect(() => {
    if (allDone) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
        onDismiss()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [allDone])

  const handleStepAction = (step: OnboardingStep) => {
    if (step.id === "booking" && slug) {
      navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
      return
    }
    onNavigate(step.navigateTo)
  }

  if (allDone) {
    return (
      <div
        className={`relative mb-6 transition-all duration-700 ease-out ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ["#2563FF", "#02E3FF", "#7C3AED", "#F59E0B", "#10B981", "#EC4899"][i % 6],
                  }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <PartyPopper className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-700 text-sm">¡Tu clínica está lista!</h3>
            <p className="text-xs text-emerald-600/70 mt-0.5">Completaste todos los pasos de configuración.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative mb-6 transition-all duration-500 ease-out ${
        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-gradient-to-br from-[#0B1023] via-[#0f1638] to-[#0B1023] rounded-2xl overflow-hidden border border-white/5 shadow-xl shadow-blue-900/10">
        {/* Header compacto */}
        <div className="relative px-5 sm:px-6 py-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, rgba(37,99,255,0.5) 0%, transparent 70%)" }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563FF] to-[#02E3FF] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <Rocket className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Configurá tu clínica
                </h2>
                <p className="text-[11px] text-white/40 mt-0.5 truncate">
                  {completedCount}/{totalSteps} pasos completados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Progress ring */}
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="20" cy="20" r="16" fill="none"
                    stroke="#2563FF"
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-white">{progress}%</span>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="text-white/25 hover:text-white/50 transition-colors p-0.5"
                title="Ocultar guía"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-3">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #2563FF, #02E3FF)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Pending tasks list */}
        <div className="px-3 sm:px-4 pb-3 space-y-1">
          {visibleSteps.map((step) => (
            <div
              key={step.id}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all duration-200"
            >
              {/* Checkbox */}
              <button
                onClick={() => {
                  if (!step.autoCompleted) toggleManual(step.id)
                }}
                className="shrink-0 w-5.5 h-5.5 rounded-full flex items-center justify-center bg-white/8 hover:bg-white/15 transition-colors cursor-pointer"
                title="Marcar como completado"
              >
                <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-white/30 group-hover:border-white/50 transition-colors" />
              </button>

              {/* Icon + Title */}
              <span className="text-[#2563FF]/70 shrink-0">{step.icon}</span>
              <span className="text-[13px] font-medium text-white/75 truncate flex-1">
                {step.title}
              </span>

              {/* Action */}
              <button
                onClick={() => handleStepAction(step)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#2563FF] bg-[#2563FF]/10 hover:bg-[#2563FF]/20 transition-colors opacity-0 group-hover:opacity-100"
              >
                {step.cta}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Show more / less */}
          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-white/30 hover:text-white/50 transition-colors"
            >
              {expanded ? (
                <>
                  Ver menos
                  <ChevronDown className="w-3 h-3 rotate-180" />
                </>
              ) : (
                <>
                  +{hiddenCount} tareas pendientes
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
