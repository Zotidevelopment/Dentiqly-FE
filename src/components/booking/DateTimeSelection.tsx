"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Profesional, Servicio } from "../../types"
import { profesionalesApi } from "../../api/profesionales"
import { feriadosApi } from "../../api/feriados"
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

interface DateTimeSelectionProps {
  selectedService: Servicio | null
  selectedProfessional: Profesional | null
  selectedDateTime: string | null
  onDateTimeSelect: (dateTime: string) => void
  mesActualBloqueado?: boolean
  isAdmin?: boolean
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedService,
  selectedProfessional,
  selectedDateTime,
  onDateTimeSelect,
  mesActualBloqueado = false,
  isAdmin = false,
}) => {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [professionalSchedule, setProfessionalSchedule] = useState<any>(null)
  const [holidays, setHolidays] = useState<string[]>([])
  const [viewDate, setViewDate] = useState(new Date())

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const response = await feriadosApi.listar()
        const holidayDates = response.map(f => f.fecha.split('T')[0])
        setHolidays(holidayDates)
      } catch (e) {
        console.error('Error loading holidays:', e)
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los feriados" })
      }
    }
    loadHolidays()
  }, [])

  useEffect(() => {
    const loadProfessionalSchedule = async () => {
      if (!selectedProfessional) return
      try {
        const response = await profesionalesApi.obtenerHorarios(selectedProfessional.id)
        if (response.horarios) setProfessionalSchedule(response.horarios)
      } catch (error) {
        console.error('Error loading schedule:', error)
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el horario del profesional" })
      }
    }
    loadProfessionalSchedule()
  }, [selectedProfessional])

  const isDayAvailable = (dateString: string): boolean => {
    if (holidays.includes(dateString)) return false
    const date = new Date(dateString + "T00:00:00")
    const today = new Date()
    today.setHours(0,0,0,0)
    if (date < today) return false

    const dayOfWeek = date.getDay()
    if (!professionalSchedule) return dayOfWeek !== 0
    const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    const daySchedule = professionalSchedule[dayNames[dayOfWeek]]
    if (!daySchedule || !daySchedule.activo) return false

    if (daySchedule.frecuencia === "quincenal") {
      const refDate = new Date("2024-01-01T00:00:00")
      const diffInWeeks = Math.floor((date.getTime() - refDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (Math.abs(diffInWeeks % 2) !== (daySchedule.semana_inicio || 0)) return false
    }
    return true
  }

  useEffect(() => {
    if (selectedDate && selectedProfessional) checkAvailability()
  }, [selectedDate, selectedProfessional])

  const checkAvailability = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await profesionalesApi.obtenerHorariosDisponibles(selectedProfessional!.id, selectedDate, isAdmin)
      if (response.disponible && response.horarios_disponibles) setAvailableSlots(response.horarios_disponibles)
      else setError(response.mensaje || "No hay horarios disponibles")
    } catch (e) {
      setError("Error al cargar horarios")
    } finally {
      setLoading(false)
    }
  }

  const renderCalendar = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    // Adjust firstDay (0 for Sunday)
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <h4 className="font-bold text-sm text-gray-900 capitalize uppercase tracking-widest">
            {viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </h4>
          <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'].map((d, idx) => (
            <div key={idx} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
          ))}
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const available = isDayAvailable(dateStr)
            const isSelected = selectedDate === dateStr
            return (
              <div key={i} className="flex justify-center p-0.5">
                <button
                  disabled={!available}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all
                    ${isSelected ? "bg-[#2563FF] text-white shadow-md scale-105" : available ? "text-gray-700 hover:bg-blue-50 hover:text-[#2563FF]" : "text-gray-200 cursor-not-allowed"}
                  `}
                >
                  {day}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Calendar Column */}
        <div className={`w-full lg:col-span-5 ${selectedDate ? 'order-2 lg:order-1' : 'order-1 lg:order-1'}`}>
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-500">
            {renderCalendar()}
          </div>
        </div>

        {/* Time Slots Column */}
        <div className={`space-y-4 w-full lg:col-span-7 ${selectedDate ? 'order-1 lg:order-2' : 'order-2 lg:order-2'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Clock className="text-[#2563FF]" size={16} />
              HORARIOS
            </h3>
            {selectedDate && (
              <span className="text-xs font-bold text-gray-500 capitalize">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          
          {selectedDate ? (
            <div className="animate-in slide-in-from-top-4 duration-500">
              {loading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold text-xs">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => onDateTimeSelect(`${selectedDate}T${time}:00`)}
                      className={`
                        py-2 sm:py-3 rounded-lg font-bold transition-all border text-xs sm:text-sm
                        ${selectedDateTime?.includes(time) ? "bg-[#2563FF] text-white border-[#2563FF] shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-[#2563FF]"}
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Clock className="mx-auto text-gray-300 mb-2" size={24} />
              <p className="text-gray-400 font-bold text-xs">Selecciona un día en el calendario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
