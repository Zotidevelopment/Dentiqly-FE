import React, { useState, useEffect, useRef } from 'react'
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
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Hourglass,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { turnosApi, adminApi, exportApi } from '../../api'
import type { Turno, Profesional } from '../../types'
import { EditAppointmentModal } from './EditAppointmentModal'
import { AdminAppointmentModal } from './AdminAppointmentModal'
import { AdminBookingModal } from './AdminBookingModal'
import { profesionalesApi } from '../../api/profesionales'
import { configuracionApi } from '../../api/configuracion'

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


type ViewType = 'day' | 'week' | 'month' | 'agenda'

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
  const [confirmAction, setConfirmAction] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null)
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
  const [hoveredApptId, setHoveredApptId] = useState<number | null>(null)
  const [hoveredAppt, setHoveredAppt] = useState<{
    appointment: Turno
    x: number
    y: number
    width: number
    height: number
    profColor: string
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Color mode preference (persisted in localStorage)
  const [colorMode, setColorMode] = useState<'service' | 'status'>(() => {
    const saved = localStorage.getItem('dentiqly_calendar_color_mode')
    return (saved === 'status' || saved === 'service') ? saved : 'service'
  })

  // Selected statuses to display in calendar
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Pendiente', 'Confirmado', 'Atendido', 'Cancelado'])

  useEffect(() => {
    localStorage.setItem('dentiqly_calendar_color_mode', colorMode)
  }, [colorMode])

  const STATUS_GROUPS: Record<string, string[]> = {
    'Pendiente': ['Pendiente', 'Creado', 'Esperando confirmación'],
    'Confirmado': ['Confirmado', 'Confirmado por email', 'Confirmado por SMS', 'Confirmado por Whatsapp', 'En sala de espera', 'Atendiéndose'],
    'Atendido': ['Atendido'],
    'Cancelado': ['Cancelado', 'Ausente']
  }

  const matchesStatusFilter = (estado: string) => {
    const group = Object.keys(STATUS_GROUPS).find(key => STATUS_GROUPS[key].includes(estado))
    if (!group) return true
    return selectedStatuses.includes(group)
  }

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const [hiddenServiceIds, setHiddenServiceIds] = useState<number[]>([])

  const toggleServiceFilter = (serviceId: number) => {
    setHiddenServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  // Business hours: which weekdays (0=Sun..6=Sat) are open
  const [openWeekdays, setOpenWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])

  useEffect(() => {
    const loadBusinessHours = async () => {
      try {
        const settings = await configuracionApi.listar()
        const bhSetting = settings.find(s => s.clave === 'business_hours')
        if (bhSetting?.valor) {
          const parsed = typeof bhSetting.valor === 'string'
            ? JSON.parse(bhSetting.valor)
            : bhSetting.valor
          // Map Spanish day names to JS getDay() indices (0=Sun)
          const dayMap: Record<string, number> = {
            domingo: 0, lunes: 1, martes: 2, miercoles: 3,
            jueves: 4, viernes: 5, sabado: 6
          }
          const open = Object.entries(parsed)
            .filter(([, v]: [string, any]) => v?.activo)
            .map(([k]) => dayMap[k])
            .filter((n): n is number => n !== undefined)
          if (open.length > 0) setOpenWeekdays(open)
        }
      } catch {
        // keep defaults (all days open) on error
      }
    }
    loadBusinessHours()
  }, [])

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

      if (viewType === 'day' || viewType === 'agenda') {
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

    // Filter by hidden service IDs
    if (hiddenServiceIds.length > 0) {
      filtered = filtered.filter(appointment =>
        !hiddenServiceIds.includes(appointment.servicio_id)
      )
    }

    // Filter by selected statuses
    filtered = filtered.filter(appointment => matchesStatusFilter(appointment.estado))

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
      if (viewType === 'day' || viewType === 'agenda') {
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
    if (viewType === 'day' || viewType === 'agenda') {
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
      <div className="flex flex-col bg-white relative">
        <div className="grid grid-cols-[125px_1fr] border-b border-[#E8E0D6]/60 sticky top-0 z-20 bg-white">
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

        <div className="flex-initial overflow-visible bg-white relative">
          <div className="relative">
            {/* Grid Lines */}
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="grid grid-cols-[125px_1fr] border-b border-[#E8E0D6]/20 h-[56px]">
                <div className="p-1 text-[13px] font-bold text-gray-700 bg-gray-50/50 border-r border-[#E8E0D6]/30 text-center flex items-center justify-center">
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
            <div className="absolute top-0 left-[125px] right-0 bottom-0 pointer-events-none">
              {getAppointmentLayout(dayAppointments).map((appt) => {
                const apptColor = colorMode === 'status'
                  ? (STATUS_COLORS[appt.estado as keyof typeof STATUS_COLORS] || '#3B82F6')
                  : (appt.servicio?.color || getProfColor(appt.profesional_id))
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
                      onMouseEnter={(e) => {
                        setHoveredApptId(appt.id)
                        const rect = e.currentTarget.getBoundingClientRect()
                        const containerRect = containerRef.current?.getBoundingClientRect()
                        if (containerRect) {
                          setHoveredAppt({
                            appointment: appt,
                            x: rect.left - containerRect.left,
                            y: rect.top - containerRect.top,
                            width: rect.width,
                            height: rect.height,
                            profColor: apptColor
                          })
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredApptId(null)
                        setHoveredAppt(null)
                      }}
                      className="h-full w-full rounded-xl shadow-sm cursor-move hover:brightness-95 transition-all overflow-hidden flex flex-col p-1.5 relative group"
                      style={{
                        backgroundColor: `${apptColor}15`,
                        border: `1.5px solid ${apptColor}`,
                      }}
                    >
                      {statusIcon && (
                        <div className="absolute top-1.5 right-1.5 opacity-60 pointer-events-none">
                          {React.cloneElement(statusIcon as React.ReactElement, { className: "w-4 h-4" })}
                        </div>
                      )}

                      {/* Quick Actions (only shown if the card is not narrow) */}
                      {hoveredApptId === appt.id && appt.width >= 45 && (
                        <div className="absolute top-2 right-8 flex flex-row gap-1.5 z-20 transition-opacity">
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
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-0.5">
                          <div className={`font-bold capitalize leading-tight text-xs text-gray-900 pr-1 ${appt.height > 40 ? 'line-clamp-2 whitespace-normal break-words' : 'truncate'}`}>
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
    const allWeekDays = getWeekDays(currentDate)
    const weekDays = allWeekDays.filter(d => openWeekdays.includes(d.getDay()))
    const openCount = weekDays.length

    return (
      <div className="flex flex-col bg-white relative">
        <div className="overflow-x-auto flex flex-col">
          <div className="min-w-[700px] sm:min-w-[800px] md:min-w-[1000px] flex flex-col">
            {/* Header */}
            <div className="grid border-b border-[#E8E0D6]/60 sticky top-0 z-20 bg-white" style={{ gridTemplateColumns: `95px repeat(${openCount}, 1fr)` }}>
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
            <div className="relative bg-white flex-initial overflow-visible">
              <div className="relative">
                {/* Grid Rows */}
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="grid border-b border-[#E8E0D6]/15 h-[56px]" style={{ gridTemplateColumns: `95px repeat(${openCount}, 1fr)` }}>
                    <div className="p-1 text-[12px] font-bold text-gray-700 bg-gray-50/50 border-r border-[#E8E0D6]/30 text-center flex items-center justify-center">
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
                <div className="absolute top-0 left-[95px] right-0 bottom-0 pointer-events-none grid" style={{ gridTemplateColumns: `repeat(${openCount}, 1fr)` }}>
                  {weekDays.map((day, dayIdx) => (
                    <div key={dayIdx} className="relative h-full border-r border-transparent">
                      {getAppointmentLayout(getAppointmentsForDate(day)).map((appt) => {
                        const apptColor = colorMode === 'status'
                          ? (STATUS_COLORS[appt.estado as keyof typeof STATUS_COLORS] || '#3B82F6')
                          : (appt.servicio?.color || getProfColor(appt.profesional_id))
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
                              onMouseEnter={(e) => {
                                setHoveredApptId(appt.id)
                                const rect = e.currentTarget.getBoundingClientRect()
                                const containerRect = containerRef.current?.getBoundingClientRect()
                                if (containerRect) {
                                  setHoveredAppt({
                                    appointment: appt,
                                    x: rect.left - containerRect.left,
                                    y: rect.top - containerRect.top,
                                    width: rect.width,
                                    height: rect.height,
                                    profColor: apptColor
                                  })
                                }
                              }}
                              onMouseLeave={() => {
                                setHoveredApptId(null)
                                setHoveredAppt(null)
                              }}
                              className="h-full w-full rounded-xl shadow-sm cursor-move hover:brightness-95 transition-all overflow-hidden flex flex-col p-1 relative group"
                              style={{
                                backgroundColor: `${apptColor}15`,
                                border: `1px solid ${apptColor}`,
                              }}
                            >
                              {statusIcon && (
                                <div className="absolute top-1 right-1 opacity-60 pointer-events-none">
                                  {React.cloneElement(statusIcon as React.ReactElement, { className: "w-3 h-3" })}
                                </div>
                              )}

                              {/* Quick Actions (only shown if the card is not narrow) */}
                              {hoveredApptId === appt.id && appt.width >= 90 && (
                                <div className="absolute top-1 right-5 flex flex-row gap-1 z-20 transition-opacity">
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
                              )}

                              <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                  <div className={`font-bold capitalize leading-tight text-[10px] text-gray-900 pr-1 ${appt.height > 40 ? 'line-clamp-2 whitespace-normal break-words' : 'truncate'}`}>
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
    // Day-of-week labels indexed by JS getDay() (0=Sun)
    const ALL_DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const openDayLabels = ALL_DAY_LABELS.filter((_, i) => openWeekdays.includes(i))
    const openCount = openDayLabels.length

    // Build month days that belong to open weekdays only.
    // We rebuild the grid: find the first open weekday of the month,
    // pad with previous-month days, then include only open-weekday dates.
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const openDays: { date: Date; isCurrentMonth: boolean }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (openWeekdays.includes(date.getDay())) {
        openDays.push({ date, isCurrentMonth: true })
      }
    }

    // Pad the start so rows align to weekday columns
    const firstOpenDayOfWeek = openDays[0]?.date.getDay() ?? 0
    const colIndex = openWeekdays.indexOf(firstOpenDayOfWeek)
    for (let i = 0; i < colIndex; i++) {
      const d = new Date(openDays[0].date)
      d.setDate(d.getDate() - (colIndex - i))
      // Skip if this pad date itself isn't in openWeekdays (shouldn't be but guard)
      openDays.unshift({ date: d, isCurrentMonth: false })
    }

    // Pad the end to complete the last row
    const remainder = openDays.length % openCount
    if (remainder !== 0) {
      const fill = openCount - remainder
      const lastDate = openDays[openDays.length - 1].date
      let nextDate = new Date(lastDate)
      for (let i = 0; i < fill; i++) {
        do {
          nextDate = new Date(nextDate)
          nextDate.setDate(nextDate.getDate() + 1)
        } while (!openWeekdays.includes(nextDate.getDay()))
        openDays.push({ date: nextDate, isCurrentMonth: false })
      }
    }

    const days = openDays

    return (
      <div className="flex flex-col bg-white relative">
        {/* Sticky day-of-week headers */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8E0D6]/40" style={{ display: 'grid', gridTemplateColumns: `repeat(${openCount}, 1fr)` }}>
          {openDayLabels.map((day) => (
            <div key={day} className="py-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A93A8]">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable month grid */}
        <div className="flex-initial overflow-visible">
          <div className="gap-px bg-[#E8E0D6]/30 min-h-full" style={{ display: 'grid', gridTemplateColumns: `repeat(${openCount}, 1fr)` }}>
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day.date)
              const isToday = day.date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`bg-white min-h-[100px] sm:min-h-[110px] md:min-h-[120px] p-1.5 sm:p-2 border-r border-b border-[#E8E0D6]/20 transition-colors hover:bg-gray-50/30 ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
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
                      const apptColor = colorMode === 'status'
                        ? (STATUS_COLORS[appointment.estado as keyof typeof STATUS_COLORS] || '#3B82F6')
                        : (appointment.servicio?.color || getProfColor(appointment.profesional_id))
                      const statusIcon = getStatusIcon(appointment.estado)
                      return (
                        <div
                          key={appointment.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAppointment(appointment)
                          }}
                          onMouseEnter={(e) => {
                            setHoveredApptId(appointment.id)
                            const rect = e.currentTarget.getBoundingClientRect()
                            const containerRect = containerRef.current?.getBoundingClientRect()
                            if (containerRect) {
                              setHoveredAppt({
                                appointment: appointment,
                                x: rect.left - containerRect.left,
                                y: rect.top - containerRect.top,
                                width: rect.width,
                                height: rect.height,
                                profColor: apptColor
                              })
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredApptId(null)
                            setHoveredAppt(null)
                          }}
                          className="p-1 rounded-md text-[9px] cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 overflow-hidden relative"
                          style={{ backgroundColor: `${apptColor}15`, border: `1px solid ${apptColor}40` }}
                        >
                          <span className="font-bold shrink-0 text-gray-900">{appointment.hora_inicio.substring(0, 5)}</span>
                          <span className="truncate font-semibold text-gray-700 pr-1">{appointment.paciente?.apellido}</span>
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
      </div>
    )
  }

  const renderAgendaView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    
    const handleWhatsApp = (turno: Turno) => {
      const phone = turno.paciente?.telefono
      if (!phone) {
        toast({ variant: "destructive", title: "Error", description: "El paciente no tiene teléfono registrado" })
        return
      }
      const cleanPhone = phone.replace(/\D/g, '')
      const dateStr = new Date(turno.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
      const msg = `Hola ${turno.paciente?.nombre}, te recordamos tu turno el ${dateStr} a las ${turno.hora_inicio.substring(0, 5)} hs. con el/la profesional ${turno.profesional?.nombre} ${turno.profesional?.apellido}. ¿Confirmas tu asistencia?`
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    if (dayAppointments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-[#8A93A8]">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-[#0B1023] mb-1">No hay turnos agendados</h3>
          <p className="text-[13px] text-[#8A93A8] max-w-sm mb-6">
            No se encontraron citas programadas para este día o con los filtros activos.
          </p>
          <Button onClick={() => setShowBookingModal(true)} className="bg-[#2563FF] hover:bg-[#1D4ED8] text-white rounded-xl px-5 py-2 flex items-center gap-2 text-[13px] font-bold">
            <Plus className="w-4 h-4" /> Agendar Turno
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col bg-white p-4 md:p-6 space-y-4">
        {dayAppointments.map((appt) => {
          const profColor = getProfColor(appt.profesional_id)
          const statusColor = getStatusColor(appt.estado)
          const patientName = `${appt.paciente?.apellido || ''}, ${appt.paciente?.nombre || ''}`
          const isConfirmed = appt.estado.startsWith('Confirmado')
          const isAtendido = appt.estado === 'Atendido'
          const isCancelado = appt.estado === 'Cancelado' || appt.estado === 'Ausente'

          return (
            <div
              key={appt.id}
              onClick={() => setSelectedAppointment(appt)}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/40 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all cursor-pointer gap-4"
            >
              {/* Left Side: Time and Patient Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                {/* Time Slot Badge */}
                <div className="flex sm:flex-col items-center sm:items-start shrink-0 bg-[#EEF3FF] text-[#2563FF] px-3.5 py-2.5 rounded-xl border border-[#2563FF]/10 min-w-[100px] gap-2 sm:gap-0">
                  <div className="flex items-center gap-1.5 sm:mb-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold font-mono">{appt.hora_inicio.substring(0, 5)}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">a {appt.hora_fin.substring(0, 5)} hs</span>
                </div>

                {/* Patient Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-bold text-[#0B1023] capitalize truncate">
                      {patientName}
                    </h3>
                    {appt.sobre_turno && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Sobreturno
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-3 gap-y-1 font-medium">
                    {appt.paciente?.numero_documento && (
                      <span>DNI: {appt.paciente.numero_documento}</span>
                    )}
                    {appt.paciente?.telefono && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {appt.paciente.telefono}
                      </span>
                    )}
                    {(appt.paciente?.obraSocial?.nombre || appt.paciente?.obra_social_nombre_custom) && (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-emerald-100">
                        {appt.paciente.obraSocial?.nombre || appt.paciente.obra_social_nombre_custom}
                        {appt.paciente.numero_afiliado ? ` (Nº ${appt.paciente.numero_afiliado})` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Side: Doctor and Service */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:px-6 md:border-l md:border-r border-gray-100 min-w-[200px] lg:min-w-[250px]">
                {/* Professional Info */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: profColor }}
                  >
                    {getInitials(appt.profesional)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0B1023]">
                      {appt.profesional?.nombre} {appt.profesional?.apellido}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {appt.profesional?.especialidad}
                    </p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 truncate max-w-[120px]">
                    {appt.servicio?.nombre}
                  </span>
                  <span className="text-xs font-semibold text-[#2563FF] mt-0.5">
                    ${appt.servicio?.precio_base}
                  </span>
                </div>
              </div>

              {/* Right Side: Status and Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                {/* Status Badge */}
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border shrink-0 text-center min-w-[100px]"
                  style={{
                    backgroundColor: `${statusColor}10`,
                    borderColor: `${statusColor}20`,
                    color: statusColor
                  }}
                >
                  {appt.estado}
                </span>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {/* Atendido Button */}
                  {!isAtendido && !isCancelado && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'Atendido')}
                      className="p-2 bg-green-50 text-green-600 border border-green-100 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Marcar como Atendido"
                    >
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </button>
                  )}
                  {/* Cancelar Button */}
                  {!isCancelado && !isAtendido && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'Cancelado')}
                      className="p-2 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Marcar como Cancelado"
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                  )}
                  {/* WhatsApp button */}
                  {appt.paciente?.telefono && (
                    <button
                      onClick={() => handleWhatsApp(appt)}
                      className="p-2 bg-[#E8F8F0] text-[#075E54] border border-[#25D366]/20 hover:bg-[#25D366] hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
                      title="Enviar recordatorio WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.42 9.86-9.864.001-2.63-1.019-5.101-2.871-6.956C16.61 1.93 14.136.91 11.513.91c-5.44 0-9.863 4.42-9.865 9.864 0 1.702.451 3.361 1.307 4.808L1.93 21.07l5.717-1.498-.999-.418z" />
                        <path d="M17.472 14.382c-.3-.149-1.778-.878-2.046-.976-.268-.099-.463-.149-.658.149-.195.298-.753.946-.922 1.139-.168.193-.337.217-.637.068-.3-.15-1.266-.467-2.41-1.484-.892-.796-1.493-1.78-1.668-2.079-.175-.299-.019-.461.13-.61.135-.133.3-.349.45-.523.15-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.149-.658-1.586-.901-2.17-.236-.57-.478-.493-.658-.502-.17-.008-.364-.01-.557-.01-.193 0-.507.072-.772.36-.265.287-1.011.987-1.011 2.408s1.026 2.793 1.17 2.991c.143.198 2.017 3.08 4.887 4.318.683.295 1.218.47 1.633.603.687.218 1.312.187 1.806.114.55-.082 1.778-.726 2.028-1.428.25-.701.25-1.302.175-1.428-.075-.126-.269-.198-.569-.347z" />
                      </svg>
                    </button>
                  )}
                  {/* Edit button */}
                  <button
                    onClick={() => { setSelectedAppointment(appt); setShowEditModal(true); }}
                    className="p-2 bg-gray-50 text-gray-600 border border-gray-100 hover:bg-[#2563FF] hover:text-white rounded-xl transition-all shadow-sm"
                    title="Editar Turno"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                    </svg>
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteAppointment(appt.id)}
                    className="p-2 bg-red-50 text-red-500 border border-red-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                    title="Eliminar Turno"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`h-auto flex flex-col font-sans relative ${isFullscreen ? 'bg-[#FAF9F6] p-8 overflow-y-auto w-full h-full' : ''}`}>
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
            <button onClick={() => setViewType('agenda')} className={`px-4 h-full border-l border-[#E8E0D6] transition ${viewType === 'agenda' ? 'bg-[#0B1023] text-white font-semibold' : 'text-[#8A93A8] hover:bg-gray-50 hover:text-[#4B5568]'}`}>Agenda</button>
          </div>
          {/* Color Mode Selector */}
          <div className="flex items-center bg-white border border-[#E8E0D6] rounded-xl overflow-hidden h-[38px] text-[13px] font-medium">
            <span className="px-3 text-[#8A93A8] border-r border-[#E8E0D6] bg-gray-50/50 h-full flex items-center text-[10px] uppercase tracking-wider font-bold shrink-0">Colores</span>
            <button 
              onClick={() => setColorMode('service')} 
              className={`px-3.5 h-full transition ${colorMode === 'service' ? 'bg-[#0B1023] text-white font-semibold' : 'text-[#8A93A8] hover:bg-gray-50 hover:text-[#4B5568]'}`}
              title="Colorear por Servicios"
            >
              Servicios
            </button>
            <button 
              onClick={() => setColorMode('status')} 
              className={`px-3.5 h-full border-l border-[#E8E0D6] transition ${colorMode === 'status' ? 'bg-[#0B1023] text-white font-semibold' : 'text-[#8A93A8] hover:bg-gray-50 hover:text-[#4B5568]'}`}
              title="Colorear por Estados"
            >
              Estados
            </button>
          </div>
          <button
            onClick={() => exportApi.turnos().catch(() => toast({ variant: "destructive", title: "Error", description: "Error al exportar turnos" }))}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E0D6] text-[#4B5568] rounded-xl font-medium hover:bg-gray-50 text-[13px] transition"
          >
            <Download className="w-4 h-4 text-[#8A93A8]" /> Exportar
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E0D6] text-[#4B5568] rounded-xl font-medium hover:bg-gray-50 text-[13px] transition"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#8A93A8]" />
                <span>Salir Completa</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#8A93A8]" />
                <span>Pantalla Completa</span>
              </>
            )}
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
      <div className="flex-initial flex flex-col">
        {/* Calendar Grid */}
        <div className="flex-initial bg-white rounded-2xl border border-[#E8E0D6] flex flex-col min-w-0 overflow-visible relative shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {/* Navigation Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 border-b border-[#E8E0D6]/60 gap-4 bg-white shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-lg font-semibold text-[#0B1023] capitalize min-w-[150px]">{getViewTitle()}</h2>
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-[#E8E0D6]">
                <button onClick={goToToday} className="px-3 py-1 text-[11px] font-semibold text-[#4B5568] hover:bg-white rounded-lg transition-colors">Hoy</button>
                <button onClick={() => navigate('prev')} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-[#8A93A8]" /></button>
                <button onClick={() => navigate('next')} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-[#8A93A8]" /></button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-semibold text-[#8A93A8] uppercase tracking-wider">
              {colorMode === 'status' ? (
                <>
                  <button
                    onClick={() => toggleStatusFilter('Pendiente')}
                    className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                      selectedStatuses.includes('Pendiente')
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'bg-gray-50/50 text-gray-400 border-gray-200/50 opacity-50 hover:opacity-75 font-normal'
                    }`}
                    title="Filtrar Pendientes"
                  >
                    <Hourglass className="w-3 h-3" /> Pendiente
                  </button>
                  <button
                    onClick={() => toggleStatusFilter('Confirmado')}
                    className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                      selectedStatuses.includes('Confirmado')
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'bg-gray-50/50 text-gray-400 border-gray-200/50 opacity-50 hover:opacity-75 font-normal'
                    }`}
                    title="Filtrar Confirmados"
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedStatuses.includes('Confirmado') ? 'bg-green-500' : 'bg-gray-400'}`}></div> Confirmado
                  </button>
                  <button
                    onClick={() => toggleStatusFilter('Atendido')}
                    className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                      selectedStatuses.includes('Atendido')
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'bg-gray-50/50 text-gray-400 border-gray-200/50 opacity-50 hover:opacity-75 font-normal'
                    }`}
                    title="Filtrar Atendidos"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Atendido
                  </button>
                  <button
                    onClick={() => toggleStatusFilter('Cancelado')}
                    className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                      selectedStatuses.includes('Cancelado')
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'bg-gray-50/50 text-gray-400 border-gray-200/50 opacity-50 hover:opacity-75 font-normal'
                    }`}
                    title="Filtrar Cancelados"
                  >
                    <XCircle className="w-3 h-3" /> Cancelado
                  </button>
                </>
              ) : (
                <>
                  {servicios.map((s) => {
                    const isHidden = hiddenServiceIds.includes(s.id)
                    const sColor = s.color || '#3B82F6'
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleServiceFilter(s.id)}
                        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                          !isHidden
                            ? 'shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:opacity-90'
                            : 'bg-gray-50/50 text-gray-400 border-gray-200/50 opacity-40 hover:opacity-60 font-normal line-through'
                        }`}
                        style={{
                          backgroundColor: !isHidden ? `${sColor}15` : undefined,
                          borderColor: !isHidden ? `${sColor}40` : undefined,
                          color: !isHidden ? sColor : undefined
                        }}
                        title={`Filtrar ${s.nombre}`}
                      >
                        <div 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: !isHidden ? sColor : '#9CA3AF' }}
                        />
                        <span className="truncate max-w-[120px]">{s.nombre}</span>
                      </button>
                    )
                  })}
                </>
              )}
              <button onClick={() => setShowNewModal(true)} className="px-3 py-1.5 border border-[#E8E0D6] rounded-xl text-[#2563FF] hover:bg-[#EEF3FF] flex items-center gap-1 transition-colors font-semibold"><Plus className="w-3 h-3" /> Sobreturno</button>
            </div>
          </div>

          <div className="flex-initial bg-white">
            {viewType === 'day' && renderDayView()}
            {viewType === 'week' && renderWeekView()}
            {viewType === 'month' && renderMonthView()}
            {viewType === 'agenda' && renderAgendaView()}
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

              <div className="flex flex-wrap justify-end gap-2.5 pt-4 border-t border-[#E8E0D6]/60">
                <button
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="px-4 py-2 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
                >
                  Eliminar
                </button>
                <div className="flex-1" />
                {selectedAppointment.estado !== 'Atendido' && selectedAppointment.estado !== 'Cancelado' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'Atendido');
                        setSelectedAppointment(null);
                        toast({ title: "Éxito", description: "Turno marcado como Atendido" });
                      }}
                      className="px-4 py-2 text-[13px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" strokeWidth={3} /> Atendido
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'Cancelado');
                        setSelectedAppointment(null);
                        toast({ title: "Éxito", description: "Turno marcado como Cancelado" });
                      }}
                      className="px-4 py-2 text-[13px] font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" strokeWidth={3} /> Cancelar
                    </button>
                  </>
                )}
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

      {hoveredAppt && (
        <div
          className="absolute bg-white border border-gray-100 rounded-2xl shadow-xl p-3.5 z-[100] pointer-events-none flex flex-col gap-1.5 w-64 text-left font-sans transition-all duration-150 animate-in fade-in-50 slide-in-from-bottom-2 duration-150"
          style={{
            left: `${hoveredAppt.x + hoveredAppt.width / 2}px`,
            top: hoveredAppt.y < 150 
              ? `${hoveredAppt.y + hoveredAppt.height + 8}px` 
              : `${hoveredAppt.y - 8}px`,
            transform: hoveredAppt.y < 150 
              ? 'translate(-50%, 0)' 
              : 'translate(-50%, -100%)',
          }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 font-mono">
              {hoveredAppt.appointment.hora_inicio.substring(0, 5)} - {hoveredAppt.appointment.hora_fin.substring(0, 5)} hs
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{
                backgroundColor: `${getStatusColor(hoveredAppt.appointment.estado)}15`,
                color: getStatusColor(hoveredAppt.appointment.estado),
              }}
            >
              {hoveredAppt.appointment.estado}
            </span>
          </div>
          <div className="font-bold text-xs text-[#0B1023] capitalize leading-snug">
            {hoveredAppt.appointment.paciente?.nombre} {hoveredAppt.appointment.paciente?.apellido}
          </div>
          <div className="text-[10px] text-gray-500 font-medium leading-none">
            DNI: {hoveredAppt.appointment.paciente?.numero_documento || '—'}
          </div>
          {hoveredAppt.appointment.paciente?.telefono && (
            <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" /> {hoveredAppt.appointment.paciente.telefono}
            </div>
          )}
          {(hoveredAppt.appointment.paciente?.obraSocial?.nombre || hoveredAppt.appointment.paciente?.obra_social_nombre_custom) && (
            <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 w-fit">
              {hoveredAppt.appointment.paciente.obraSocial?.nombre || hoveredAppt.appointment.paciente.obra_social_nombre_custom}
              {hoveredAppt.appointment.paciente.numero_afiliado ? ` (Nº ${hoveredAppt.appointment.paciente.numero_afiliado})` : ''}
            </div>
          )}
          <hr className="border-gray-100 my-0.5" />
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredAppt.profColor }} />
            <span className="text-[10px] font-semibold text-[#0B1023]">
              {hoveredAppt.appointment.profesional?.nombre} {hoveredAppt.appointment.profesional?.apellido}
            </span>
          </div>
          <div className="text-[9px] font-medium text-gray-400">
            {hoveredAppt.appointment.servicio?.nombre} (${hoveredAppt.appointment.servicio?.precio_base})
          </div>
        </div>
      )}
    </div>
  )
}