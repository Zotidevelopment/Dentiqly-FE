import React, { useState } from "react"
import { Calendar, User, Sparkles } from "lucide-react"
import { CalendarView } from "../../admin/CalendarView"
import { PatientsView } from "../../patients/PatientsView"

export const InteractiveDashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"agenda" | "ficha">("agenda")

  return (
    <div className="w-full max-w-[1200px] mx-auto rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_25px_60px_rgba(0,0,0,0.08)] backdrop-blur-md overflow-hidden relative flex flex-col h-full">
      
      {/* --- BROWSER / APP HEADER --- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/80 bg-gray-50/70 shrink-0 select-none">
        {/* macOS Window dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          <span className="ml-3 text-xs font-semibold text-gray-400 tracking-wider hidden sm:inline">Dentiqly Live App (Sandbox)</span>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-gray-200/60 p-0.5 rounded-lg border border-gray-200/20">
          <button
            onClick={() => setActiveTab("agenda")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "agenda"
                ? "bg-white text-[#2563FF] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Agenda Real
          </button>
          <button
            onClick={() => setActiveTab("ficha")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ficha"
                ? "bg-white text-[#2563FF] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Ficha del Paciente
          </button>
        </div>

        {/* Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#2563FF] bg-[#2563FF]/10 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse-soft">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PROBAR AHORA</span>
        </div>
      </div>

      {/* --- APP VIEWPORT CONTAINER --- */}
      <div className="flex-1 overflow-hidden bg-white text-[#0B1023] relative text-left">
        {activeTab === "agenda" ? (
          <div className="h-full w-full overflow-hidden flex flex-col p-1 sm:p-2">
            <CalendarView />
          </div>
        ) : (
          <div className="h-full w-full overflow-hidden flex flex-col p-1 sm:p-2">
            {/* Loads patient pac-1 (Carlos Sánchez) in detail view mode directly */}
            <PatientsView initialPatientId="pac-1" />
          </div>
        )}
      </div>

    </div>
  )
}
