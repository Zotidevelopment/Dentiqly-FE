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
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
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
  slug?: string
  onNavigate: (view: string) => void
  onDismiss: () => void
}

const MANUAL_CHECKS_KEY = "onboarding_manual_checks"

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
  slug,
  onNavigate,
  onDismiss,
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>(getManualChecks)

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
      description:
        "Agregá el nombre, dirección, teléfono y horarios de atención. Esta info aparece en tu portal de reservas.",
      icon: <Building2 className="w-5 h-5" />,
      autoCompleted: hasClinicInfo,
      navigateTo: "settings",
      cta: "Ir a Configuración",
    },
    {
      id: "professionals",
      title: "Sumá a tus profesionales",
      description:
        "Cargá los odontólogos que atienden en tu clínica. Cada uno tendrá su agenda, horarios y comisiones.",
      icon: <UserPlus className="w-5 h-5" />,
      autoCompleted: totalProfesionales > 0,
      navigateTo: "professionals",
      cta: "Agregar profesional",
    },
    {
      id: "services",
      title: "Personalizá tus servicios",
      description:
        "Editá los servicios con precios y duración. Ya creamos algunos por defecto, podés personalizarlos.",
      icon: <Stethoscope className="w-5 h-5" />,
      autoCompleted: totalServicios > 4,
      navigateTo: "services",
      cta: "Configurar servicios",
    },
    {
      id: "schedule",
      title: "Definí los horarios de atención",
      description:
        "Configurá los días y horarios en que tu clínica atiende. Define la disponibilidad del calendario y reservas.",
      icon: <Clock className="w-5 h-5" />,
      autoCompleted: hasSchedule,
      navigateTo: "settings",
      cta: "Configurar horarios",
    },
    {
      id: "sucursales",
      title: "Configurá tus sucursales",
      description:
        "Si tenés más de una sede, cargá cada sucursal con su dirección y teléfono para gestionar todo desde un solo lugar.",
      icon: <MapPin className="w-5 h-5" />,
      autoCompleted: false,
      navigateTo: "sucursales",
      cta: "Agregar sucursal",
    },
    {
      id: "obras-sociales",
      title: "Cargá las obras sociales",
      description:
        "Agregá las obras sociales y prepagas con las que trabajás para asociarlas a pacientes y facturar correctamente.",
      icon: <Shield className="w-5 h-5" />,
      autoCompleted: false,
      navigateTo: "obras-sociales",
      cta: "Agregar obra social",
    },
    {
      id: "liquidaciones",
      title: "Registrá liquidaciones",
      description:
        "Generá liquidaciones para tus profesionales según comisiones configuradas y los turnos atendidos.",
      icon: <DollarSign className="w-5 h-5" />,
      autoCompleted: false,
      navigateTo: "liquidaciones",
      cta: "Ir a Liquidaciones",
    },
    {
      id: "cashflow",
      title: "Cargá ingresos y egresos en flujo de caja",
      description:
        "Registrá los movimientos financieros de tu clínica para tener visibilidad total de la salud económica.",
      icon: <Wallet className="w-5 h-5" />,
      autoCompleted: false,
      navigateTo: "cashflow",
      cta: "Ir a Flujo de caja",
    },
    {
      id: "booking",
      title: "Compartí tu link de reservas",
      description: slug
        ? `Tu portal está activo en dentiqly.com/${slug}. Compartilo para que reserven online 24/7.`
        : "Una vez configurado, vas a poder compartir un link para reservas online.",
      icon: <Link2 className="w-5 h-5" />,
      autoCompleted: totalPacientes > 0,
      navigateTo: "dashboard",
      cta: "Copiar enlace",
    },
  ]

  const isStepCompleted = (step: OnboardingStep) => step.autoCompleted || !!manualChecks[step.id]
  const completedCount = steps.filter(isStepCompleted).length
  const progress = Math.round((completedCount / steps.length) * 100)
  const allDone = completedCount === steps.length

  useEffect(() => {
    requestAnimationFrame(() => setAnimateIn(true))
  }, [])

  useEffect(() => {
    if (allDone) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [allDone])

  useEffect(() => {
    const firstIncomplete = steps.find((s) => !isStepCompleted(s))
    if (firstIncomplete) setExpandedStep(firstIncomplete.id)
  }, [])

  const handleStepClick = (step: OnboardingStep) => {
    setExpandedStep(expandedStep === step.id ? null : step.id)
  }

  const handleStepAction = (step: OnboardingStep) => {
    if (step.id === "booking" && slug) {
      navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
      return
    }
    onNavigate(step.navigateTo)
  }

  return (
    <div
      className={`relative mb-8 transition-all duration-700 ease-out ${
        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-3xl">
          {Array.from({ length: 40 }).map((_, i) => (
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

      <div className="bg-gradient-to-br from-[#0B1023] via-[#0f1638] to-[#0B1023] rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-blue-900/10">
        {/* Header */}
        <div className="relative px-6 sm:px-8 pt-7 pb-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(37,99,255,0.4) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-[200px] h-[200px] rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, rgba(2,227,255,0.5) 0%, transparent 70%)" }}
            />
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
              <defs>
                <pattern id="onb-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#onb-dots)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563FF] to-[#02E3FF] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                {allDone ? <PartyPopper className="w-6 h-6 text-white" /> : <Rocket className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {allDone ? "¡Tu clínica está lista!" : "Configurá tu clínica"}
                </h2>
                <p className="text-sm text-white/50 mt-0.5">
                  {allDone
                    ? "Completaste todos los pasos. Ya podés empezar a atender."
                    : "Completá estos pasos para empezar a atender pacientes"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke={allDone ? "#10B981" : "#2563FF"}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-white">{progress}%</span>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="text-white/30 hover:text-white/60 transition-colors p-1"
                title="Cerrar guía"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Progreso</span>
              <span className="text-[11px] font-bold text-white/60">{completedCount}/{steps.length} pasos</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: allDone
                    ? "linear-gradient(90deg, #10B981, #34D399)"
                    : "linear-gradient(90deg, #2563FF, #02E3FF)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-4 sm:px-6 pb-6 space-y-1.5 max-h-[50vh] overflow-y-auto">
          {steps.map((step, index) => {
            const isExpanded = expandedStep === step.id
            const completed = isStepCompleted(step)

            return (
              <div
                key={step.id}
                className={`rounded-2xl transition-all duration-300 ${
                  isExpanded
                    ? completed
                      ? "bg-emerald-500/5 border border-emerald-500/10"
                      : "bg-white/[0.06] border border-white/10"
                    : "bg-white/[0.03] border border-transparent hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3">
                  {/* Clickable checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!step.autoCompleted) toggleManual(step.id)
                    }}
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                      completed
                        ? "bg-emerald-500/20 hover:bg-emerald-500/30"
                        : "bg-white/10 hover:bg-white/20 cursor-pointer"
                    }`}
                    title={completed ? (step.autoCompleted ? "Completado automáticamente" : "Desmarcar") : "Marcar como completado"}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30" />
                    )}
                  </button>

                  {/* Expandable area */}
                  <button
                    onClick={() => handleStepClick(step)}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left"
                  >
                    <span className={completed ? "text-emerald-400/60" : "text-[#2563FF]"}>
                      {step.icon}
                    </span>
                    <span
                      className={`text-sm font-semibold truncate ${
                        completed ? "text-white/40 line-through decoration-white/20" : "text-white/90"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>

                  <ChevronRight
                    onClick={() => handleStepClick(step)}
                    className={`w-4 h-4 text-white/20 shrink-0 transition-transform duration-300 cursor-pointer ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-4 pl-[64px] sm:pl-[68px]">
                    <p className="text-[13px] text-white/40 leading-relaxed mb-3">{step.description}</p>
                    <button
                      onClick={() => handleStepAction(step)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
                        completed
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          : "bg-[#2563FF] text-white hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20"
                      }`}
                    >
                      {completed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completado — Revisar
                        </>
                      ) : (
                        <>
                          {step.cta}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
