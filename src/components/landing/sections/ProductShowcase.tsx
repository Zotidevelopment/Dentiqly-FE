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
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

// Lazy load Playground components to optimize landing page bundle
const Dashboard = React.lazy(() => import("../../admin/Dashboard").then(m => ({ default: m.Dashboard })))
const CalendarView = React.lazy(() => import("../../admin/CalendarView").then(m => ({ default: m.CalendarView })))
const PatientsView = React.lazy(() => import("../../patients/PatientsView").then(m => ({ default: m.PatientsView })))
const RemindersView = React.lazy(() => import("../../admin/RemindersView").then(m => ({ default: m.RemindersView })))
const BookingForm = React.lazy(() => import("../../booking/BookingForm").then(m => ({ default: m.BookingForm })))

type TabType = "dashboard" | "calendar" | "patients" | "reminders" | "booking"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "calendar", label: "Calendario", icon: <CalendarIcon size={16} /> },
  { id: "patients", label: "Ficha Paciente", icon: <FileText size={16} /> },
  { id: "reminders", label: "Recordatorios", icon: <Bell size={16} /> },
  { id: "booking", label: "Booking", icon: <Clock size={16} /> },
] as const

interface ProductShowcaseProps {
  isFullscreen?: boolean
  onToggleFullscreen?: (val: boolean) => void
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  isFullscreen: isFullscreenProp,
  onToggleFullscreen,
}) => {
  const [localFullscreen, setLocalFullscreen] = useState(false)
  const isFullscreen = isFullscreenProp !== undefined ? isFullscreenProp : localFullscreen
  const setIsFullscreen = onToggleFullscreen || setLocalFullscreen

  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll lock and ESC key to exit fullscreen
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
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen, setIsFullscreen])

  return (
    <section
      id="funcionalidades"
      className="py-20 sm:py-28 bg-[#FAFCFF] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-[#0047FF]/[0.08] text-[#0047FF] px-4 py-1.5 text-[13px] font-bold tracking-wide rounded-full mb-4">
            Demo Interactiva
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A0F2D] tracking-[-2px] leading-[1.1] mb-4">
            Probalo vos mismo.
            <br />
            <span className="text-[#0047FF]">En vivo, ahora.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Explorá el panel de administración completo. <span className="font-semibold text-[#0A0F2D]">Sin registro, sin esperas.</span>
          </p>
        </motion.div>

        {/* Embedded Demo */}
        <motion.div
          ref={containerRef}
          initial={isFullscreen ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          whileInView={isFullscreen ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={
            isFullscreen
              ? "fixed inset-0 bg-white z-[9999] overflow-hidden flex flex-col rounded-none border-none"
              : "bg-white rounded-[2rem] shadow-2xl shadow-black/[0.08] border border-gray-200 overflow-hidden"
          }
          style={{ overscrollBehavior: "contain" }}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="bg-[#0A0F2D] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg hidden md:flex items-center justify-center"
                title={isSidebarCollapsed ? "Mostrar Menú" : "Ocultar Menú"}
                aria-label={isSidebarCollapsed ? "Mostrar Menú" : "Ocultar Menú"}
              >
                {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
              </button>
              <span className="w-2.5 h-2.5 rounded-full bg-[#0047FF] animate-pulse" />
              <span className="text-sm font-bold tracking-tight">Playground Interactivo - Dentiqly Admin</span>
              <span className="text-[10px] bg-white/10 text-white/80 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                Modo Demo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                aria-label={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 size={15} />
                    <span className="hidden sm:inline">Salir Pantalla Completa</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={15} />
                    <span className="hidden sm:inline">Pantalla Completa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* App Frame Content */}
          <div className={isFullscreen ? "flex flex-1 overflow-hidden" : "flex h-[600px] sm:h-[650px] md:h-[700px] overflow-hidden"}>
            {/* Sidebar */}
            {!isSidebarCollapsed && (
              <div className="w-48 bg-[#FAFCFF] border-r border-gray-200 p-4 hidden md:flex flex-col gap-1 shrink-0">
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest px-2 mb-3">Administración</p>
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-[#0047FF] text-white shadow-md shadow-[#0047FF]/10"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/55"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
                <div className="mt-auto bg-gray-50 border border-gray-150 p-3.5 rounded-xl text-[10px] text-gray-400 font-semibold space-y-1">
                  <p className="text-[#0047FF] font-bold">💡 Modo Interactivo</p>
                  <p>Puedes agregar turnos, editar el odontograma o reservar en vivo.</p>
                </div>
              </div>
            )}

            {/* Main App Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FCFDFF]">
              {/* Mobile Tab Navigation */}
              <div className="md:hidden flex items-center bg-[#FAFCFF] border-b border-gray-200 overflow-x-auto no-scrollbar gap-1 p-2 shrink-0">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#0047FF] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* View workspace */}
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
                    <React.Suspense fallback={
                      <div className="h-full flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0047FF]"></div>
                      </div>
                    }>
                      {activeTab === "dashboard" && (
                        <Dashboard onNavigate={(view) => setActiveTab(view as TabType)} slug="demo" />
                      )}
                      {activeTab === "calendar" && <CalendarView />}
                      {activeTab === "patients" && <PatientsView />}
                      {activeTab === "reminders" && <RemindersView />}
                      {activeTab === "booking" && (
                        <div className="h-[600px] sm:h-[550px] md:h-[600px] overflow-hidden rounded-2xl border border-gray-150 bg-[#f8fafc] [&>div]:h-full [&>div]:bg-transparent">
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#0047FF] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-[#0047FF]/25 hover:bg-[#0036CC] hover:shadow-xl transition-all duration-300 group"
          >
            Empezá gratis con todas las funcionalidades
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-gray-400 mt-3">Sin tarjeta de crédito · 14 días gratis</p>
        </motion.div>
      </div>
    </section>
  )
}
