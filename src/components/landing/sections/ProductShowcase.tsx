import React, { useState, useEffect, useRef } from "react"
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Bell,
  FileText,
  Clock,
  PanelLeftClose,
  PanelLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  MousePointerClick,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { TrialLink } from "../../ui/TrialLink"
import { SectionHeading } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"
import { btnPrimary } from "../ui/cta"

// El demo monta el panel real de forma diferida para no engordar el bundle de la landing.
const Dashboard = React.lazy(() => import("../../admin/Dashboard").then((m) => ({ default: m.Dashboard })))
const CalendarView = React.lazy(() => import("../../admin/CalendarView").then((m) => ({ default: m.CalendarView })))
const PatientsView = React.lazy(() => import("../../patients/PatientsView").then((m) => ({ default: m.PatientsView })))
const RemindersView = React.lazy(() => import("../../admin/RemindersView").then((m) => ({ default: m.RemindersView })))
const BookingForm = React.lazy(() => import("../../booking/BookingForm").then((m) => ({ default: m.BookingForm })))

type TabType = "dashboard" | "calendar" | "patients" | "reminders" | "booking"

/** Parámetros que el dashboard y la agenda pasan al navegar hacia la ficha de un paciente. */
interface NavParams {
  patientId?: string | number
  searchTerm?: string
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "calendar", label: "Agenda", icon: <CalendarIcon size={16} /> },
  { id: "patients", label: "Pacientes", icon: <FileText size={16} /> },
  { id: "reminders", label: "Recordatorios", icon: <Bell size={16} /> },
  { id: "booking", label: "Reserva online", icon: <Clock size={16} /> },
] as const

interface ProductShowcaseProps {
  embedded?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: (val: boolean) => void
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  embedded = false,
  isFullscreen: isFullscreenProp,
  onToggleFullscreen,
}) => {
  const [localFullscreen, setLocalFullscreen] = useState(false)
  const isFullscreen = isFullscreenProp !== undefined ? isFullscreenProp : localFullscreen
  const setIsFullscreen = onToggleFullscreen || setLocalFullscreen

  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [navParams, setNavParams] = useState<NavParams>({})
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNavigate = (view: TabType, params?: NavParams) => {
    setActiveTab(view)
    setNavParams(params ?? {})
  }

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("overflow-hidden", "demo-viewer-open")
    } else {
      document.body.classList.remove("overflow-hidden", "demo-viewer-open")
    }
    return () => {
      document.body.classList.remove("overflow-hidden", "demo-viewer-open")
    }
  }, [isFullscreen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen, setIsFullscreen])

  return (
    <section id={embedded ? undefined : "demo"} className={embedded ? "lp-embedded-product" : "relative overflow-hidden bg-brand-surface py-24 sm:py-32"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!embedded && <SectionHeading
          eyebrow="Demo interactiva"
          title={
            <>
              Probalo ahora.
              <br className="hidden sm:block" /> Sin registrarte, sin esperas.
            </>
          }
          subtitle="Este es el panel real de Dentiqly con datos de ejemplo. Agendá un turno, abrí una ficha, editá un odontograma: todo funciona."
        />}

        {!embedded && <Reveal delay={0.1} className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-brand-muted ring-1 ring-brand-ink/[0.07]">
            <MousePointerClick size={15} className="text-brand-blue" />
            Hacé clic en cualquier parte del panel para explorarlo
          </span>
        </Reveal>}

        {/* Demo embebido */}
        <motion.div
          ref={containerRef}
          initial={isFullscreen ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={
            isFullscreen
              ? "fixed inset-0 z-[9999] flex flex-col overflow-hidden rounded-none border-none bg-white"
              : "mt-10 overflow-hidden rounded-[24px] bg-white ring-1 ring-brand-ink/[0.08] shadow-[0_50px_120px_-40px_rgba(11,16,35,0.4)]"
          }
          style={{ overscrollBehavior: "contain" }}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Barra superior */}
          <div className="flex items-center justify-between border-b border-white/5 bg-brand-navy px-4 py-3 text-white sm:px-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden items-center justify-center rounded-lg bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white md:flex"
                title={isSidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
                aria-label={isSidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
              >
                {isSidebarCollapsed ? <PanelLeft size={17} /> : <PanelLeftClose size={17} />}
              </button>
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[13px] font-semibold tracking-tight">Panel de administración · Dentiqly</span>
              <span className="hidden rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white/70 sm:inline">
                Datos de ejemplo
              </span>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={14} />
                  <span className="hidden sm:inline">Salir de pantalla completa</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span className="hidden sm:inline">Pantalla completa</span>
                </>
              )}
            </button>
          </div>

          {/* Contenido */}
          <div className={isFullscreen ? "flex flex-1 overflow-hidden" : "flex h-[600px] overflow-hidden sm:h-[650px] md:h-[720px]"}>
            {!isSidebarCollapsed && (
              <div className="hidden w-52 shrink-0 flex-col gap-1 border-r border-brand-ink/[0.06] bg-brand-surface p-4 md:flex">
                <p className="mb-3 px-2 text-[9px] font-extrabold uppercase tracking-widest text-brand-muted/70">Administración</p>
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all ${
                        isActive
                          ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                          : "text-brand-muted hover:bg-brand-ink/[0.04] hover:text-brand-ink"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
                <div className="mt-auto space-y-1 rounded-xl bg-white p-3.5 text-[10.5px] font-medium text-brand-muted ring-1 ring-brand-ink/[0.06]">
                  <p className="font-bold text-brand-blue">Modo interactivo</p>
                  <p>Podés agregar turnos, editar el odontograma o reservar en vivo. Nada se guarda.</p>
                </div>
              </div>
            )}

            <div className="flex flex-1 flex-col overflow-hidden bg-[#FCFDFF]">
              <div className="no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-b border-brand-ink/[0.06] bg-brand-surface p-2 md:hidden">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                        isActive ? "bg-brand-blue text-white" : "text-brand-muted hover:bg-brand-ink/[0.05]"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8" style={{ overscrollBehavior: "contain" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <React.Suspense
                      fallback={
                        <div className="flex h-full items-center justify-center py-12">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-blue" />
                        </div>
                      }
                    >
                      {activeTab === "dashboard" && (
                        <Dashboard onNavigate={(view, params) => handleNavigate(view as TabType, params)} slug="demo" />
                      )}
                      {activeTab === "calendar" && (
                        <CalendarView onNavigate={(view, params) => handleNavigate(view as TabType, params)} />
                      )}
                      {activeTab === "patients" && (
                        <PatientsView initialPatientId={navParams.patientId} initialSearchTerm={navParams.searchTerm} />
                      )}
                      {activeTab === "reminders" && <RemindersView />}
                      {activeTab === "booking" && (
                        <div className="h-[600px] overflow-hidden rounded-2xl border border-brand-ink/[0.06] bg-brand-surface sm:h-[550px] md:h-[600px] [&>div]:h-full [&>div]:bg-transparent">
                          <BookingForm />
                        </div>
                      )}
                    </React.Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {!embedded && <Reveal delay={0.1} className="mt-12 text-center">
          <TrialLink ctaLocation="product_showcase" ctaLabel="Quiero esto para mi clínica" className={btnPrimary}>
            Quiero esto para mi clínica
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </TrialLink>
          <p className="mt-3 text-[13px] text-brand-muted">14 días gratis · Sin tarjeta de crédito</p>
        </Reveal>}
      </div>
    </section>
  )
}
