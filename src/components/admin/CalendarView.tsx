import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { dentalColors } from '../../config/colors'
import { useToast } from '../../hooks/use-toast'
import { ConfirmationModal } from '../ui/ConfirmationModal'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Briefcase,
  Phone,
  Mail,
  List,
  LayoutGrid,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Hourglass
} from 'lucide-react'
import { turnosApi, adminApi, exportApi } from '../../api'
import type { Turno, Profesional } from '../../types'
import { EditAppointmentModal } from './EditAppointmentModal'
import { AdminAppointmentModal } from './AdminAppointmentModal'
import { AdminBookingModal } from './AdminBookingModal'
import { profesionalesApi } from '../../api/profesionales'

const PROF_COLORS = [
  '#F472B6', // pink-400
  '#60A5FA', // blue-400
  '#34D399', // emerald-400
  '#A78BFA', // violet-400
  '#FBBF24', // amber-400
  '#F87171', // red-400
  '#2DD4BF', // teal-400
  '#818CF8', // indigo-400
]

const getProfColor = (id?: number) => {
  if (!id) return '#9CA3AF'
  return PROF_COLORS[id % PROF_COLORS.length]
}

const getStatusIcon = (estado: string, sizeClass = "w-3 h-3") => {
  switch (estado) {
    case 'Atendido':
      return <CheckCircle2 className={`${sizeClass} text-[#22C55E]`} strokeWidth={3} fill="currentColor" fillOpacity={0.15} />
    case 'Cancelado':
    case 'Ausente':
      return <XCircle className={`${sizeClass} text-[#EF4444]`} strokeWidth={3} fill="currentColor" fillOpacity={0.15} />
    case 'Pendiente':
    case 'Esperando confirmación':
      return <Hourglass className={`${sizeClass} text-[#F59E0B]`} strokeWidth={3} />
    case 'Confirmado':
    case 'Confirmado por email':
    case 'Confirmado por SMS':
    case 'Confirmado por Whatsapp':
      return null
    default:
      return null
  }
}


type ViewType = 'day' | 'week' | 'month'

// Status colors mapping
const STATUS_COLORS = {
  'Pendiente': '#F59E0B', // Amber
  'Creado': '#3B82F6', // Blue
  'Esperando confirmación': '#EAB308', // Yellow
  'Confirmado por email': '#22C55E', // Green
  'Confirmado por SMS': '#22C55E', // Green
  'Confirmado por Whatsapp': '#22C55E', // Green
  'Confirmado': '#22C55E', // Green
  'En sala de espera': '#A855F7', // Purple
  'Atendiéndose': '#EC4899', // Pink
  'Atendido': '#06B6D4', // Cyan
  'Cancelado': '#EF4444', // Red
  'Ausente': '#000000', // Black
} as const

interface CalendarViewProps {
  onNavigate?: (view: string, params?: Record<string, any>) => void
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onNavigate }) => {
  const { toast } = useToast()
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Turno[]>([])
  const [professionals, setProfessionals] = useState<Profesional[]>([])
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [servicios, setServicios] = useState<any[]>([])

  const [selectedAppointment, setSelectedAppointment] = useState<Turno | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [viewType, setViewType] = useState<ViewType>('month')
  const [patientSearch, setPatientSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Turno[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [newAppointmentData, setNewAppointmentData] = useState<{ fecha: string, hora_inicio: string, sobre_turno: boolean } | null>(null)
  const [draggingAppointment, setDraggingAppointment] = useState<Turno | null>(null)

  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const TIME_SLOTS: string[] = []
  for (let h = 8; h <= 20; h++) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
  }

  useEffect(() => {
    fetchAppointments()
  }, [currentDate, viewType])

  useEffect(() => {
    fetchProfessionals()
    fetchServicios()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFilterPanel) setShowFilterPanel(false)
        else if (selectedAppointment) setSelectedAppointment(null)
      }
    }
    const handleClickOutside = () => {
      if (showSearchResults) setShowSearchResults(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showFilterPanel, selectedAppointment, showSearchResults])

  // Patient search
  useEffect(() => {
    if (patientSearch.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }
    const term = patientSearch.toLowerCase()
    const results = appointments.filter((t) => {
      const name = `${t.paciente?.apellido || ''} ${t.paciente?.nombre || ''}`.toLowerCase()
      const dni = t.paciente?.numero_documento || ''
      return name.includes(term) || dni.includes(term)
    })
    // Sort by date ascending
    results.sort((a, b) => {
      const d = a.fecha.localeCompare(b.fecha)
      if (d !== 0) return d
      return a.hora_inicio.localeCompare(b.hora_inicio)
    })
    setSearchResults(results)
    setShowSearchResults(true)
  }, [patientSearch, appointments])

  const fetchServicios = async () => {
    try {
      const response = await adminApi.servicios.listar({ limit: 100 })
      setServicios(response.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchProfessionals = async () => {
    try {
      const response = await profesionalesApi.listar({ estado: 'Activo', limit: 100 })
      setProfessionals(response.data)
    } catch (error) {
      console.error('Error fetching professionals:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      // Calculate date range based on current view with generous buffer
      let fecha_desde: string
      let fecha_hasta: string
      
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      if (viewType === 'day') {
        // Fetch a week around the day
        const start = new Date(currentDate)
        start.setDate(start.getDate() - 3)
        const end = new Date(currentDate)
        end.setDate(end.getDate() + 3)
        fecha_desde = start.toISOString().split('T')[0]
        fecha_hasta = end.toISOString().split('T')[0]
      } else if (viewType === 'week') {
        // Fetch 2 weeks around the current week
        const start = new Date(currentDate)
        start.setDate(start.getDate() - start.getDay() - 7)
        const end = new Date(currentDate)
        end.setDate(end.getDate() - end.getDay() + 20)
        fecha_desde = start.toISOString().split('T')[0]
        fecha_hasta = end.toISOString().split('T')[0]
      } else {
        // Month view: fetch prev month + current month + next month
        const start = new Date(year, month - 1, 1)
        const end = new Date(year, month + 2, 0)
        fecha_desde = start.toISOString().split('T')[0]
        fecha_hasta = end.toISOString().split('T')[0]
      }

      const response = await turnosApi.listar({ limit: 5000, fecha_desde, fecha_hasta })
      if (response.data) {
        setAppointments(response.data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    const neededRows = Math.ceil(days.length / 7)
    const remainingDays = (neededRows * 7) - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const days = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getMinutesSinceStart = (timeStr: string) => {
    if (!timeStr) return 0
    const [h, m] = timeStr.split(':').map(Number)
    return (h * 60 + m) - (8 * 60) // Starting at 08:00
  }

  const getSlotHeight = 56

  const getAppointmentLayout = (dayAppointments: Turno[]) => {
    if (dayAppointments.length === 0) return []

    // Sort by start time then duration
    const sorted = [...dayAppointments].sort((a, b) => {
      const startA = getMinutesSinceStart(a.hora_inicio)
      const startB = getMinutesSinceStart(b.hora_inicio)
      if (startA !== startB) return startA - startB
      const durA = (getMinutesSinceStart(a.hora_fin) || 0) - startA
      const durB = (getMinutesSinceStart(b.hora_fin) || 0) - startB
      return durB - durA
    })

    const clusters: { appointments: any[], maxColumns: number }[] = []
    
    sorted.forEach(appt => {
      const start = getMinutesSinceStart(appt.hora_inicio)
      const end = getMinutesSinceStart(appt.hora_fin) || (start + 30)
      
      let cluster = clusters.find(c => c.appointments.some(a => {
        const aStart = getMinutesSinceStart(a.hora_inicio)
        const aEnd = getMinutesSinceStart(a.hora_fin) || (aStart + 30)
        return start < aEnd && end > aStart
      }))

      if (!cluster) {
        cluster = { appointments: [], maxColumns: 0 }
        clusters.push(cluster)
      }

      // Assign column
      let column = 0
      while (cluster.appointments.some(a => {
        if (a.column !== column) return false
        const aStart = getMinutesSinceStart(a.hora_inicio)
        const aEnd = getMinutesSinceStart(a.hora_fin) || (aStart + 30)
        return start < aEnd && end > aStart
      })) {
        column++
      }

      cluster.appointments.push({ ...appt, column })
      cluster.maxColumns = Math.max(cluster.maxColumns, column + 1)
    })

    return clusters.flatMap(cluster => cluster.appointments.map(a => ({
      ...a,
      top: (getMinutesSinceStart(a.hora_inicio) / 30) * getSlotHeight,
      height: Math.max(getSlotHeight / 2, (((getMinutesSinceStart(a.hora_fin) || (getMinutesSinceStart(a.hora_inicio) + 30)) - getMinutesSinceStart(a.hora_inicio)) / 30) * getSlotHeight),
      width: 100 / cluster.maxColumns,
      left: (a.column * 100) / cluster.maxColumns
    })))
  }

  const handleQuickConfirm = async (id: number) => {
    try {
      await turnosApi.confirmarPago(id, true)
      toast({ title: "Éxito", description: "Pago confirmado exitosamente" })
      fetchAppointments() // Refresh appointments
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast({ variant: "destructive", title: "Error", description: "Error al confirmar el pago" })
    }
  }

  const handleUpdateStatus = async (id: number, nuevoEstado: string) => {
    try {
      await turnosApi.actualizar(id, { estado: nuevoEstado })
      fetchAppointments()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({ variant: "destructive", title: "Error", description: "Error al actualizar el estado" })
    }
  }

  const handleDeleteAppointment = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este turno? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        try {
          await turnosApi.eliminar(id)
          setSelectedAppointment(null)
          fetchAppointments()
          toast({ title: "Éxito", description: "Turno eliminado correctamente" })
        } catch (error) {
          console.error('Error deleting appointment:', error)
          toast({ variant: "destructive", title: "Error", description: "Error al eliminar el turno" })
        }
      }
    })
  }

  const getAppointmentsForDate = (date: Date) => {
    // Use local date components to avoid timezone shifts
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    let filtered = appointments.filter(appointment => {
      if (!appointment.fecha) return false
      // Match the date string exactly
      const appointmentDate = appointment.fecha.split('T')[0]
      return appointmentDate === dateString
    })

    // Filter by selected professional if one is selected
    if (selectedProfessionalId !== null) {
      filtered = filtered.filter(appointment =>
        appointment.profesional_id === selectedProfessionalId
      )
    }

    if (selectedServiceId !== null) {
      filtered = filtered.filter(appointment =>
        appointment.servicio_id === selectedServiceId
      )
    }

    return filtered.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  }

  const getInitials = (profesional?: any) => {
    if (!profesional) return '??'
    const n = profesional.nombre?.[0] || ''
    const a = profesional.apellido?.[0] || profesional.apellido?.[1] || ''
    return (n + a).toUpperCase()
  }

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewType === 'day') {
        newDate.setDate(prev.getDate() + (direction === 'prev' ? -1 : 1))
      } else if (viewType === 'week') {
        newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7))
      } else {
        newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1))
      }
      return newDate
    })
  }

  const handleDropAppointment = async (date: string, slot: string) => {
    if (!draggingAppointment) return

    try {
      // Calculate new hora_fin keeping original duration
      const [h1, m1] = draggingAppointment.hora_inicio.split(':').map(Number)
      const [h2, m2] = draggingAppointment.hora_fin.split(':').map(Number)
      const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1)

      const [nh, nm] = slot.split(':').map(Number)
      const totalMin = nh * 60 + nm + durationMin
      const nfh = Math.floor(totalMin / 60)
      const nfm = totalMin % 60
      const hora_fin = `${String(nfh).padStart(2, '0')}:${String(nfm).padStart(2, '0')}`

      await turnosApi.actualizar(draggingAppointment.id, {
        fecha: date,
        hora_inicio: slot,
        hora_fin
      })
      
      fetchAppointments()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast({ variant: "destructive", title: "Error", description: "Error al reprogramar el turno" })
    } finally {
      setDraggingAppointment(null)
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getStatusColor = (estado: string) => {
    return STATUS_COLORS[estado as keyof typeof STATUS_COLORS] || dentalColors.gray400
  }

  const getViewTitle = () => {
    if (viewType === 'day') {
      return currentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (viewType === 'week') {
      const weekDays = getWeekDays(currentDate)
      const start = weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      const end = weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      return `${start} - ${end}`
    } else {
      return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    }
  }

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="grid grid-cols-[100px_1fr] border-b border-[#E8E0D6]/60 sticky top-0 z-20 bg-white">
          <div className="p-2 border-r border-[#E8E0D6]/40 flex items-center justify-center">
            <Clock className="h-4 w-4 text-[#8A93A8]" />
          </div>
          <div className="p-2 text-center bg-[#EEF3FF]/30">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#2563FF]">
              {currentDate.toLocaleDateString('es-ES', { weekday: 'long' })}
            </div>
            <div className="text-lg font-bold text-[#0B1023]">
              {currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white relative">
          <div className="relative">
            {/* Grid Lines */}
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="grid grid-cols-[100px_1fr] border-b border-[#E8E0D6]/20 h-[56px]">
                <div className="p-1 text-[10px] font-semibold text-[#8A93A8] border-r border-[#E8E0D6]/30 text-center flex items-center justify-center">
                  {slot}
                </div>
                <div 
                  className={`relative group h-[56px] cursor-pointer transition-colors ${draggingAppointment ? 'bg-blue-50/10' : 'hover:bg-blue-50/20'}`}
                  onClick={() => {
                    setNewAppointmentData({ fecha: dateString, hora_inicio: slot, sobre_turno: false })
                    setShowNewModal(true)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDropAppointment(dateString, slot)
                  }}
                />
              </div>
            ))}

            {/* Absolute Appointments */}
            <div className="absolute top-0 left-[100px] right-0 bottom-0 pointer-events-none">
              {getAppointmentLayout(dayAppointments).map((appt) => {
                const profColor = getProfColor(appt.profesional_id)
                const statusIcon = getStatusIcon(appt.estado)
                
                return (
                  <div
                    key={appt.id}
                    className="absolute p-0.5 pointer-events-auto transition-all"
                    style={{
                      top: `${appt.top}px`,
                      height: `${appt.height}px`,
                      left: `${appt.left}%`,
                      width: `${appt.width}%`,
                    }}
                  >
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('appointmentId', appt.id.toString())
                        setDraggingAppointment(appt)
                      }}
                      onDragEnd={() => setDraggingAppointment(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAppointment(appt)
                      }}
                      className="h-full w-full rounded-xl shadow-sm cursor-move hover:brightness-95 transition-all overflow-hidden flex flex-col p-2 relative group"
                      style={{
                        backgroundColor: `${profColor}15`,
                        border: `1.5px solid ${profColor}`,
                      }}
                    >
                      {statusIcon && (
                        <div className="absolute top-1.5 right-1.5 opacity-60 pointer-events-none">
                          {React.cloneElement(statusIcon as React.ReactElement, { className: "w-4 h-4" })}
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-8 flex flex-row gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appt.id, 'Atendido'); }}
                          className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 shadow-md transition-all scale-90 hover:scale-110"
                          title="Marcar como Atendido"
                        >
                          <Check className="w-4 h-4" strokeWidth={4} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appt.id, 'Cancelado'); }}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md transition-all scale-90 hover:scale-110"
                          title="Marcar como Cancelado"
                        >
                          <X className="w-4 h-4" strokeWidth={4} />
                        </button>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-0.5">
                          <div className="font-black truncate capitalize leading-tight text-xs text-gray-900 pr-4">
                            {appt.paciente?.nombre} {appt.paciente?.apellido}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-gray-600 leading-none flex gap-1">
                          <span>{appt.hora_inicio.substring(0, 5)} - {appt.hora_fin.substring(0, 5)}</span>
                        </div>
                        {appt.height > 40 && (
                          <div className="text-[9px] opacity-80 text-gray-500 truncate mt-1 font-medium">
                            {getInitials(appt.profesional)} • {appt.servicio?.nombre}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)

    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <div className="min-w-[700px] sm:min-w-[800px] md:min-w-[1000px] flex-1 flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[#E8E0D6]/60 sticky top-0 z-20 bg-white">
              <div className="p-2 border-r border-[#E8E0D6]/40 flex items-center justify-center bg-white">
                <Clock className="h-4 w-4 text-[#8A93A8]" />
              </div>
              {weekDays.map((day, i) => {
                const isToday = day.toDateString() === new Date().toDateString()
                return (
                  <div key={i} className={`p-2 text-center border-r border-[#E8E0D6]/30 last:border-r-0 bg-white`}>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-[#2563FF]' : 'text-[#8A93A8]'}`}>
                      {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-bold ${isToday ? 'text-[#2563FF] bg-[#EEF3FF]/60 rounded-full inline-block px-2' : 'text-[#0B1023]'}`}>
                      {day.getDate()}/{day.getMonth() + 1}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Grid Body */}
            <div className="relative bg-white flex-1 overflow-y-auto">
              <div className="relative">
                {/* Grid Rows */}
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[#E8E0D6]/15 h-[56px]">
                    <div className="p-1 text-[9px] font-semibold text-[#8A93A8] border-r border-[#E8E0D6]/30 text-center flex items-center justify-center font-mono">
                      {slot}
                    </div>
                    {weekDays.map((day, i) => (
                      <div
                        key={i}
                        className={`border-r border-[#E8E0D6]/15 last:border-r-0 relative group transition-colors cursor-pointer ${draggingAppointment ? 'bg-[#EEF3FF]/20' : 'hover:bg-[#EEF3FF]/30'} ${i % 2 === 0 ? 'bg-gray-50/10' : 'bg-white'}`}
                        onClick={() => {
                          const y = day.getFullYear()
                          const m = String(day.getMonth() + 1).padStart(2, '0')
                          const d = String(day.getDate()).padStart(2, '0')
                          setNewAppointmentData({ fecha: `${y}-${m}-${d}`, hora_inicio: slot, sobre_turno: false })
                          setShowNewModal(true)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const y = day.getFullYear()
                          const m = String(day.getMonth() + 1).padStart(2, '0')
                          const d = String(day.getDate()).padStart(2, '0')
                          handleDropAppointment(`${y}-${m}-${d}`, slot)
                        }}
                      />
                    ))}
                  </div>
                ))}

                {/* Absolute Appointments for each day column */}
                <div className="absolute top-0 left-[80px] right-0 bottom-0 pointer-events-none grid grid-cols-7">
                  {weekDays.map((day, dayIdx) => (
                    <div key={dayIdx} className="relative h-full border-r border-transparent">
                      {getAppointmentLayout(getAppointmentsForDate(day)).map((appt) => {
                        const profColor = getProfColor(appt.profesional_id)
                        const statusIcon = getStatusIcon(appt.estado)
                        
                        return (
                          <div
                            key={appt.id}
                            className="absolute p-0.5 pointer-events-auto transition-all"
                            style={{
                              top: `${appt.top}px`,
                              height: `${appt.height}px`,
                              left: `${appt.left}%`,
                              width: `${appt.width}%`,
                            }}
                          >
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('appointmentId', appt.id.toString())
                                setDraggingAppointment(appt)
                              }}
                              onDragEnd={() => setDraggingAppointment(null)}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAppointment(appt)
                              }}
                              className="h-full w-full rounded-xl shadow-sm cursor-move hover:brightness-95 transition-all overflow-hidden flex flex-col p-1.5 relative group"
                              style={{
                                backgroundColor: `${profColor}15`,
                                border: `1px solid ${profColor}`,
                              }}
                            >
                              {statusIcon && (
                                <div className="absolute top-1 right-1 opacity-60 pointer-events-none">
                                  {React.cloneElement(statusIcon as React.ReactElement, { className: "w-3 h-3" })}
                                </div>
                              )}

                              {/* Quick Actions */}
                              <div className="absolute top-1 right-5 flex flex-row gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appt.id, 'Atendido'); }}
                                  className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 shadow-sm transition-all scale-75 hover:scale-100"
                                  title="Atendido"
                                >
                                  <Check className="w-3 h-3" strokeWidth={4} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appt.id, 'Cancelado'); }}
                                  className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm transition-all scale-75 hover:scale-100"
                                  title="Cancelado"
                                >
                                  <X className="w-3 h-3" strokeWidth={4} />
                                </button>
                              </div>

                              <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                  <div className="font-black truncate capitalize leading-tight text-[10px] text-gray-900 pr-3">
                                    {appt.paciente?.nombre} {appt.paciente?.apellido}
                                  </div>
                                </div>
                                <div className="text-[9px] font-bold text-gray-600 leading-none mt-0.5">
                                  {appt.hora_inicio.substring(0, 5)}-{appt.hora_fin.substring(0, 5)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)

    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="grid grid-cols-7 gap-px bg-[#E8E0D6]/30 overflow-hidden h-full">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="bg-gray-50/50 p-2 text-center border-b border-[#E8E0D6]/40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A93A8]">
                {day}
              </span>
            </div>
          ))}

          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date)
            const isToday = day.date.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`bg-white min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1.5 sm:p-2 border-r border-b border-[#E8E0D6]/20 transition-colors hover:bg-gray-50/30 ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                onClick={() => {
                  setCurrentDate(day.date)
                  setViewType('day')
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className={`text-sm font-semibold mb-2 flex justify-end ${isToday ? 'text-[#2563FF]' : 'text-[#0B1023]'}`}>
                   <span className={`${isToday ? 'bg-[#EEF3FF] w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>
                     {day.date.getDate()}
                   </span>
                </div>

                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => {
                    const profColor = getProfColor(appointment.profesional_id)
                    const statusIcon = getStatusIcon(appointment.estado)
                    return (
                      <div
                        key={appointment.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAppointment(appointment)
                        }}
                        className="p-1 rounded-md text-[9px] cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 overflow-hidden relative"
                        style={{ backgroundColor: `${profColor}15`, border: `1px solid ${profColor}40` }}
                      >
                        <span className="font-bold shrink-0 text-gray-900">{appointment.hora_inicio.substring(0, 5)}</span>
                        <span className="truncate font-semibold text-gray-700 pr-3">{appointment.paciente?.apellido}</span>
                        {statusIcon && (
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60">
                            {React.cloneElement(statusIcon as React.ReactElement, { className: "w-3.5 h-3.5" })}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {dayAppointments.length > 3 && (
                    <div className="text-[9px] font-bold text-gray-400 text-center py-0.5">
                      +{dayAppointments.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col font-sans min-h-0 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 shrink-0">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0B1023] tracking-[-0.3px]">Calendario de Turnos</h1>
          <p className="text-[13px] text-[#8A93A8] mt-1">Gestión de agenda y citas</p>
        </div>
        <Button onClick={() => setShowBookingModal(true)} className="bg-dental-secondary hover:opacity-90 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-sm text-[13px] font-bold transition-all">
           <Plus className="w-4 h-4" /> Nuevo Turno
        </Button>
      </div>

      {/* Sub Header */}
      <div className="flex flex-wrap justify-between items-center mb-3 gap-3 shrink-0">
         <div className="flex flex-wrap items-center gap-2 relative">
            {/* Filters */}
            <div className="relative">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E0D6] text-[#4B5568] rounded-xl font-medium hover:bg-gray-50 text-[13px] transition"
              >
                <Filter className="w-4 h-4 text-[#8A93A8]" /> Filtros {(selectedProfessionalId || selectedServiceId) && <span className="w-2 h-2 rounded-full bg-[#2563FF]"></span>}
              </button>

              {showFilterPanel && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterPanel(false)} />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#E8E0D6] rounded-2xl shadow-xl p-4 z-50">
                    <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-[#8A93A8] mb-2 block uppercase tracking-wider">Profesional</label>
                         <select
                           value={selectedProfessionalId || ''}
                           onChange={(e) => setSelectedProfessionalId(e.target.value ? parseInt(e.target.value) : null)}
                           className="w-full border border-[#E8E0D6] rounded-xl p-2 bg-gray-50 text-[13px] font-medium text-[#0B1023] focus:border-[#2563FF] outline-none"
                         >
                            <option value="">Todos los profesionales</option>
                            {professionals.map(p => (
                              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                            ))}
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-[#8A93A8] mb-2 block uppercase tracking-wider">Servicio</label>
                         <select
                           value={selectedServiceId || ''}
                           onChange={(e) => setSelectedServiceId(e.target.value ? parseInt(e.target.value) : null)}
                           className="w-full border border-[#E8E0D6] rounded-xl p-2 bg-gray-50 text-[13px] font-medium text-[#0B1023] focus:border-[#2563FF] outline-none"
                         >
                            <option value="">Todos los servicios</option>
                            {servicios.map(s => (
                              <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                         </select>
                       </div>
                       {(selectedProfessionalId || selectedServiceId) && (
                         <Button
                           variant="ghost"
                           className="w-full text-xs font-bold text-red-500 hover:bg-red-50"
                           onClick={() => { setSelectedProfessionalId(null); setSelectedServiceId(null); }}
                         >
                           Limpiar Filtros
                         </Button>
                       )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center bg-white border border-[#E8E0D6] rounded-xl overflow-hidden h-[38px] text-[13px] font-medium">
               <button onClick={() => setViewType('day')} className={`px-4 h-full transition ${viewType === 'day' ? 'bg-[#0B1023] text-white font-semibold' : 'text-[#8A93A8] hover:bg-gray-50 hover:text-[#4B5568]'}`}>Diario</button>
               <button onClick={() => setViewType('week')} className={`px-4 h-full border-l border-[#E8E0D6] transition ${viewType === 'week' ? 'bg-[#0B1023] text-white font-semibold' : 'text-[#8A93A8] hover:bg-gray-50 hover:text-[#4B5568]'}`}>Semanal</button>
               <button onClick={() => setViewType('month')} className={`px-4 h-full border-l border-[#E8E0D6] transition ${viewType === 'month' ? 'bg-[#0B1023] text-white font-semibold' : 'text-[#8A93A8] hover:bg-gray-50 hover:text-[#4B5568]'}`}>Mensual</button>
            </div>
            <button
              onClick={() => exportApi.turnos().catch(() => toast({ variant: "destructive", title: "Error", description: "Error al exportar turnos" }))}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E0D6] text-[#4B5568] rounded-xl font-medium hover:bg-gray-50 text-[13px] transition"
            >
              <Download className="w-4 h-4 text-[#8A93A8]" /> Exportar
            </button>
         </div>
         {/* Patient search inside subheader */}
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 text-[#8A93A8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Buscar paciente..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onFocus={() => patientSearch.trim().length >= 2 && setShowSearchResults(true)}
                className="pl-9 pr-4 py-2 bg-white border border-[#E8E0D6] rounded-xl text-[13px] text-[#0B1023] outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/10 w-full sm:w-64 placeholder:text-[#B5AFA8] transition-all" />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-white border border-[#E8E0D6] rounded-2xl shadow-xl z-[100] max-h-60 overflow-y-auto no-scrollbar">
                  <div className="p-2">
                    {searchResults.map((turno) => (
                      <div
                        key={turno.id}
                        onClick={() => {
                          setCurrentDate(new Date(turno.fecha + 'T12:00:00'))
                          setViewType('day')
                          setPatientSearch('')
                          setShowSearchResults(false)
                          setSelectedAppointment(turno)
                        }}
                        className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border-b border-[#E8E0D6]/30 last:border-0"
                      >
                        <div className="text-[12px] font-semibold text-[#0B1023] capitalize">
                          {turno.paciente?.nombre} {turno.paciente?.apellido}
                        </div>
                        <div className="flex justify-between text-[10px] text-[#8A93A8] font-medium mt-1">
                          <span>{new Date(turno.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                          <span>{turno.hora_inicio.substring(0, 5)} hs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showSearchResults && searchResults.length === 0 && patientSearch.trim().length >= 2 && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white border border-[#E8E0D6] rounded-2xl shadow-xl z-[100] p-4 text-center">
                  <p className="text-[11px] font-semibold text-[#8A93A8]">No se encontraron turnos</p>
                </div>
              )}
            </div>
         </div>
      </div>

      {/* Main Area: Calendar Grid */}
      <div className="flex-1 flex flex-col min-h-0">
         {/* Calendar Grid */}
         <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D6] flex flex-col min-w-0 overflow-hidden relative shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 border-b border-[#E8E0D6]/60 gap-4 bg-white">
               <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-lg font-semibold text-[#0B1023] capitalize min-w-[150px]">{getViewTitle()}</h2>
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-[#E8E0D6]">
                     <button onClick={goToToday} className="px-3 py-1 text-[11px] font-semibold text-[#4B5568] hover:bg-white rounded-lg transition-colors">Hoy</button>
                     <button onClick={() => navigate('prev')} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-[#8A93A8]" /></button>
                     <button onClick={() => navigate('next')} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-[#8A93A8]" /></button>
                  </div>
               </div>
               <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-[#8A93A8] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg text-amber-700 border border-amber-100"><Hourglass className="w-3 h-3" /> Pendiente</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg text-blue-700 border border-blue-100"><div className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border-[1.5px] border-blue-500"></div> Confirmado</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-lg text-green-700 border border-green-100"><CheckCircle2 className="w-3 h-3" /> Atendido</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-lg text-red-700 border border-red-100"><XCircle className="w-3 h-3" /> Cancelado</div>
                  <button onClick={() => setShowNewModal(true)} className="ml-1 px-3 py-1.5 border border-[#E8E0D6] rounded-xl text-[#2563FF] hover:bg-[#EEF3FF] flex items-center gap-1 transition-colors font-semibold"><Plus className="w-3 h-3"/> Sobreturno</button>
               </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0 bg-white">
               {viewType === 'day' && renderDayView()}
               {viewType === 'week' && renderWeekView()}
               {viewType === 'month' && renderMonthView()}
            </div>
         </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 bg-[#0B1023]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E0D6] flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#0B1023]">
                Detalles del Turno
              </h3>
              <span
                className="px-3 py-1 text-[11px] font-semibold rounded-full"
                style={{
                  backgroundColor: `${getStatusColor(selectedAppointment.estado)}15`,
                  color: getStatusColor(selectedAppointment.estado)
                }}
              >
                {selectedAppointment.estado}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] flex items-center justify-center mr-3 shrink-0">
                    <CalendarIcon className="h-4 w-4 text-[#2563FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-[13px] text-[#0B1023]">
                      {new Date(selectedAppointment.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-[12px] text-[#8A93A8]">
                      {selectedAppointment.hora_inicio} - {selectedAppointment.hora_fin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] flex items-center justify-center mr-3 shrink-0">
                    <User className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[13px] text-[#0B1023]">
                      {selectedAppointment.paciente?.nombre} {selectedAppointment.paciente?.apellido}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {selectedAppointment.paciente?.numero_documento && (
                        <span className="text-[11px] text-[#8A93A8] font-medium">DNI: {selectedAppointment.paciente.numero_documento}</span>
                      )}
                      {selectedAppointment.paciente?.telefono && (
                        <div className="flex items-center text-[11px] text-[#8A93A8]">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedAppointment.paciente.telefono}
                        </div>
                      )}
                      {selectedAppointment.paciente?.email && (
                        <div className="flex items-center text-[11px] text-[#8A93A8]">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedAppointment.paciente.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#EDFAF4] flex items-center justify-center mr-3 shrink-0">
                    <User className="h-4 w-4 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="font-medium text-[13px] text-[#0B1023]">
                      {selectedAppointment.profesional?.nombre} {selectedAppointment.profesional?.apellido}
                    </p>
                    <p className="text-[12px] text-[#8A93A8]">
                      {selectedAppointment.profesional?.especialidad}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] flex items-center justify-center mr-3 shrink-0">
                    <Briefcase className="h-4 w-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="font-medium text-[13px] text-[#0B1023]">
                      {selectedAppointment.servicio?.nombre}
                    </p>
                    <p className="text-[13px] text-[#2563FF] font-semibold mt-0.5">
                      ${selectedAppointment.servicio?.precio_base}
                    </p>
                  </div>
                </div>

                {selectedAppointment.sobre_turno && (
                  <div className="bg-amber-50 rounded-xl p-2.5 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Sobreturno</span>
                  </div>
                )}

                {selectedAppointment.observaciones && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-[#8A93A8] uppercase tracking-wider mb-1">
                      Notas
                    </p>
                    <p className="text-[13px] text-[#4B5568]">
                      {selectedAppointment.observaciones}
                    </p>
                  </div>
                )}

                {onNavigate && selectedAppointment.paciente_id && (
                  <button
                    onClick={() => {
                      setSelectedAppointment(null)
                      onNavigate('patients', { patientId: selectedAppointment.paciente_id })
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] font-bold text-[#2563FF] bg-[#EEF3FF] border border-[#2563FF]/10 rounded-xl hover:bg-[#2563FF] hover:text-white transition-all"
                  >
                    <User className="h-3.5 w-3.5" />
                    Ver ficha del paciente
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E8E0D6]/60">
                <button
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="px-4 py-2 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
                >
                  Eliminar
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 text-[13px] font-medium text-[#4B5568] bg-white border border-[#E8E0D6] rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-[13px] font-bold text-white bg-[#2563FF] rounded-xl hover:bg-[#1D4ED8] transition-all"
                >
                  Editar Turno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            fetchAppointments()
            setSelectedAppointment(null)
            setShowEditModal(false)
          }}
        />
      )}
      
      {showNewModal && (
        <AdminAppointmentModal
          initialData={newAppointmentData || undefined}
          onClose={() => {
            setShowNewModal(false)
            setNewAppointmentData(null)
          }}
          onCreate={() => {
            fetchAppointments()
            setShowNewModal(false)
            setNewAppointmentData(null)
            toast({ title: "Éxito", description: "Turno creado exitosamente" })
          }}
        />
      )}

      {showBookingModal && (
        <AdminBookingModal
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            fetchAppointments()
            setShowBookingModal(false)
            toast({ title: "Éxito", description: "Turno agendado exitosamente" })
          }}
        />
      )}

      {confirmAction && (
        <ConfirmationModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => { confirmAction.onConfirm(); setConfirmAction(null); }}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText="Confirmar"
          variant="destructive"
        />
      )}
    </div>
  )
}