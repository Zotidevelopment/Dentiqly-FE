import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Bell,
  X,
  Clock,
  FileText,
  PanelLeftClose,
  PanelLeft
} from "lucide-react"

// Import real admin / booking components
import { Dashboard } from "../../admin/Dashboard"
import { CalendarView } from "../../admin/CalendarView"
import { PatientsView } from "../../patients/PatientsView"
import { RemindersView } from "../../admin/RemindersView"
import { BookingForm } from "../../booking/BookingForm"

// Types
type TabType = "dashboard" | "calendar" | "patients" | "reminders" | "booking"

interface MockDemoViewerProps {
  initialTab?: TabType
  onClose: () => void
}

export const MockDemoViewer: React.FC<MockDemoViewerProps> = ({ initialTab = "dashboard", onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Prevent background scrolling and restore cursor / scroll engines while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.body.classList.add("demo-viewer-open")

    // Stop Lenis smooth scroll if active
    const lenis = (window as any).lenis
    if (lenis && typeof lenis.stop === "function") {
      lenis.stop()
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.classList.remove("demo-viewer-open")

      // Resume Lenis smooth scroll if active
      if (lenis && typeof lenis.start === "function") {
        lenis.start()
      }
    }
  }, [])

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "calendar", label: "Calendario", icon: <CalendarIcon size={16} /> },
    { id: "patients", label: "Ficha Paciente", icon: <FileText size={16} /> },
    { id: "reminders", label: "Recordatorios", icon: <Bell size={16} /> },
    { id: "booking", label: "Booking", icon: <Clock size={16} /> },
  ] as const

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" style={{ overscrollBehavior: "contain" }} data-lenis-prevent onWheel={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-[2rem] shadow-2xl w-[95vw] md:w-[85vw] md:max-w-[85vw] h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden border border-gray-200"
      >
        {/* Header Bar */}
        <div className="bg-[#0A0F2D] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg hidden md:flex items-center justify-center"
              title={isSidebarCollapsed ? "Mostrar Menú" : "Ocultar Menú"}
            >
              {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0047FF] animate-pulse" />
            <span className="text-sm font-bold tracking-tight">Playground Interactivo - Dentiqly Admin</span>
            <span className="text-[10px] bg-white/10 text-white/80 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
              Modo Demo
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* App Frame Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar */}
          {!isSidebarCollapsed && (
            <div className="w-48 bg-[#FAFCFF] border-r border-gray-200 p-4 hidden md:flex flex-col gap-1 shrink-0 animate-in slide-in-from-left duration-200">
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
                <p className="text-[#0047FF] font-bold">💡 Modo Interactiva</p>
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
