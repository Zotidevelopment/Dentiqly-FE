import React, { useState, useEffect } from "react"
import {
  CheckCircle2,
  Circle,
  Building2,
  UserPlus,
  Stethoscope,
  Clock,
  Link2,
  ChevronRight,
  Sparkles,
  Rocket,
  X,
  PartyPopper,
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
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

  const steps: OnboardingStep[] = [
    {
      id: "clinic",
      title: "Completá los datos de tu clínica",
      description:
        "Agregá el nombre, dirección, teléfono y horarios de atención. Esta info aparece en tu portal de reservas para los pacientes.",
      icon: <Building2 className="w-5 h-5" />,
      completed: hasClinicInfo,
      navigateTo: "settings",
      cta: "Ir a Configuración",
    },
    {
      id: "professionals",
      title: "Sumá a tus profesionales",
      description:
        "Cargá los odontólogos y profesionales que atienden en tu clínica. Cada uno tendrá su agenda, horarios y comisiones.",
      icon: <UserPlus className="w-5 h-5" />,
      completed: totalProfesionales > 0,
      navigateTo: "professionals",
      cta: "Agregar profesional",
    },
    {
      id: "services",
      title: "Personalizá tus servicios",
      description:
        "Editá los servicios que ofrece tu clínica con precios y duración. Ya creamos algunos por defecto, podés personalizarlos.",
      icon: <Stethoscope className="w-5 h-5" />,
      completed: totalServicios > 4,
      navigateTo: "services",
      cta: "Configurar servicios",
    },
    {
      id: "schedule",
      title: "Definí los horarios de atención",
      description:
        "Configurá los días y horarios en que tu clínica atiende. Esto define la disponibilidad en el calendario y en las reservas online.",
      icon: <Clock className="w-5 h-5" />,
      completed: hasSchedule,
      navigateTo: "settings",
      cta: "Configurar horarios",
    },
    {
      id: "booking",
      title: "Compartí tu link de reservas",
      description: slug
        ? `Tu portal de reservas ya está activo en dentiqly.com/${slug}. Compartilo con tus pacientes para que reserven online 24/7.`
        : "Una vez configurado todo, vas a poder compartir un link para que tus pacientes reserven online.",
      icon: <Link2 className="w-5 h-5" />,
      completed: totalPacientes > 0,
      navigateTo: "dashboard",
      cta: "Copiar enlace",
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
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
    const firstIncomplete = steps.find((s) => !s.completed)
    if (firstIncomplete) setExpandedStep(firstIncomplete.id)
  }, [])

  const handleStepClick = (step: OnboardingStep) => {
    if (expandedStep === step.id) {
      setExpandedStep(null)
    } else {
      setExpandedStep(step.id)
    }
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
      {/* Confetti overlay */}
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

      {/* Main card */}
      <div className="bg-gradient-to-br from-[#0B1023] via-[#0f1638] to-[#0B1023] rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-blue-900/10">
        {/* Header */}
        <div className="relative px-6 sm:px-8 pt-7 pb-6 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(37,99,255,0.4) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-[200px] h-[200px] rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, rgba(2,227,255,0.5) 0%, transparent 70%)",
              }}
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
                {allDone ? (
                  <PartyPopper className="w-6 h-6 text-white" />
                ) : (
                  <Rocket className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {allDone ? "¡Tu clínica está lista!" : "Configurá tu clínica"}
                </h2>
                <p className="text-sm text-white/50 mt-0.5">
                  {allDone
                    ? "Completaste todos los pasos. Ya podés empezar a atender."
                    : `Completá estos pasos para empezar a atender pacientes`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress ring */}
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke={allDone ? "#10B981" : "#2563FF"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-white">{progress}%</span>
                </div>
              </div>

              {allDone && (
                <button
                  onClick={onDismiss}
                  className="text-white/30 hover:text-white/60 transition-colors p-1"
                  title="Cerrar guía"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                Progreso
              </span>
              <span className="text-[11px] font-bold text-white/60">
                {completedCount}/{steps.length} pasos
              </span>
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

        {/* Steps list */}
        <div className="px-4 sm:px-6 pb-6 space-y-2">
          {steps.map((step, index) => {
            const isExpanded = expandedStep === step.id
            const isCompleted = step.completed

            return (
              <div
                key={step.id}
                className={`rounded-2xl transition-all duration-300 ${
                  isExpanded
                    ? isCompleted
                      ? "bg-emerald-500/5 border border-emerald-500/10"
                      : "bg-white/[0.06] border border-white/10"
                    : "bg-white/[0.03] border border-transparent hover:bg-white/[0.05]"
                }`}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {/* Step header */}
                <button
                  onClick={() => handleStepClick(step)}
                  className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 text-left"
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white/50">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Icon + text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`${
                          isCompleted ? "text-emerald-400/60" : "text-[#2563FF]"
                        }`}
                      >
                        {step.icon}
                      </span>
                      <span
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? "text-white/40 line-through decoration-white/20" : "text-white/90"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    className={`w-4 h-4 text-white/20 shrink-0 transition-transform duration-300 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Expanded content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-4 pl-[72px] sm:pl-[76px]">
                    <p className="text-[13px] text-white/40 leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <button
                      onClick={() => handleStepAction(step)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          : "bg-[#2563FF] text-white hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20"
                      }`}
                    >
                      {isCompleted ? (
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
