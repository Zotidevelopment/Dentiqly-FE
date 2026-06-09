"use client"

import React, { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import {
  Calendar,
  Users,
  CheckSquare,
  TrendingUp,
  UserCheck,
  Search,
  Filter,
  Loader2,
  Building,
  ChevronLeft,
  ChevronRight,
  UserX,
  RefreshCw,
  Clock
} from "lucide-react"
import { turnosApi } from "../../api"
import type { Turno } from "../../types"
import { useToast } from "../../hooks/use-toast"

export const AsistenciasManager: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })
  const [appointments, setAppointments] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedObraSocial, setSelectedObraSocial] = useState("TODAS")
  const [selectedEstado, setSelectedEstado] = useState("TODOS")
  const [periodFilter, setPeriodFilter] = useState<"diario" | "semana" | "mes">("diario")
  const [breakdownType, setBreakdownType] = useState<"obra_social" | "servicio">("obra_social")
  const [currentMonthKey, setCurrentMonthKey] = useState("")
  const { toast } = useToast()

  const getTodayDate = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getTomorrowDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getYesterdayDate = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const setToday = () => setSelectedDate(getTodayDate())
  const setTomorrow = () => setSelectedDate(getTomorrowDate())
  const setYesterday = () => setSelectedDate(getYesterdayDate())

  const getExtendedMonthRange = (dateStr: string) => {
    const [year, month] = dateStr.split("-").map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)
    
    const extendedStart = new Date(start)
    extendedStart.setDate(start.getDate() - 7)
    
    const extendedEnd = new Date(end)
    extendedEnd.setDate(end.getDate() + 7)
    
    const format = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}`
    }
    
    return { startDate: format(extendedStart), endDate: format(extendedEnd) }
  }

  const isSameWeek = (dateStr1: string, dateStr2: string) => {
    const d1 = new Date(dateStr1 + "T12:00:00")
    const d2 = new Date(dateStr2 + "T12:00:00")
    
    const day2 = d2.getDay()
    const diffToMonday2 = day2 === 0 ? -6 : 1 - day2
    
    const monday2 = new Date(d2)
    monday2.setDate(d2.getDate() + diffToMonday2)
    monday2.setHours(0, 0, 0, 0)
    
    const sunday2 = new Date(monday2)
    sunday2.setDate(monday2.getDate() + 6)
    sunday2.setHours(23, 59, 59, 999)
    
    const t1 = d1.getTime()
    return t1 >= monday2.getTime() && t1 <= sunday2.getTime()
  }

  const isSameMonth = (dateStr1: string, dateStr2: string) => {
    const [y1, m1] = dateStr1.split("-")
    const [y2, m2] = dateStr2.split("-")
    return y1 === y2 && m1 === m2
  }

  useEffect(() => {
    const [year, month] = selectedDate.split("-")
    const monthKey = `${year}-${month}`
    if (monthKey !== currentMonthKey) {
      setCurrentMonthKey(monthKey)
      fetchMonthlyAppointments(selectedDate)
    }
  }, [selectedDate])

  const fetchMonthlyAppointments = async (targetDate: string) => {
    try {
      setLoading(true)
      const { startDate, endDate } = getExtendedMonthRange(targetDate)
      const response = await turnosApi.listar({
        fecha_desde: startDate,
        fecha_hasta: endDate,
        limit: 1000,
      })
      setAppointments(response.data || [])
    } catch (error) {
      console.error("Error fetching monthly appointments:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los turnos del mes.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      setUpdatingId(id)
      await turnosApi.actualizar(id, { estado: newStatus })
      toast({
        title: "Estado actualizado",
        description: `El turno ha sido marcado como ${newStatus}.`,
      })
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? { ...appt, estado: newStatus } : appt
        )
      )
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado del turno.",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const changeDate = (days: number) => {
    const date = new Date(selectedDate + "T12:00:00")
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Daily Filtered Appointments for Cards & Table
  const dailyAppointments = appointments.filter((appt) => appt.fecha === selectedDate)

  // Aggregations
  const totalScheduled = dailyAppointments.length
  const totalAttended = dailyAppointments.filter((appt) => appt.estado === "Atendido").length
  const attendanceRate = totalScheduled > 0 ? Math.round((totalAttended / totalScheduled) * 100) : 0

  const totalConfirmed = dailyAppointments.filter((appt) => appt.estado === "Confirmado").length
  const totalPending = dailyAppointments.filter((appt) => appt.estado === "Pendiente").length
  const totalAbsent = dailyAppointments.filter((appt) => appt.estado === "Ausente").length

  // Get trends for the last 7 days ending on selectedDate
  const getScheduledTrend = () => {
    const trend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selectedDate + "T12:00:00")
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const count = appointments.filter((t) => t.fecha === dateStr).length
      trend.push(count)
    }
    return trend
  }

  const getAttendedTrend = () => {
    const trend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selectedDate + "T12:00:00")
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const count = appointments.filter((t) => t.fecha === dateStr && t.estado === "Atendido").length
      trend.push(count)
    }
    return trend
  }

  const scheduledTrend = getScheduledTrend()
  const maxScheduledTrend = Math.max(...scheduledTrend, 1)

  const attendedTrend = getAttendedTrend()
  const maxAttendedTrend = Math.max(...attendedTrend, 1)
  const linePath = `M0,${30 - (attendedTrend[0] / maxAttendedTrend) * 28} ${attendedTrend.map((count, i) => `L${(i / 6) * 100},${30 - (count / maxAttendedTrend) * 28}`).join(' ')}`

  // Obra Social aggregation based on period filter
  const getPeriodFilteredAppointments = () => {
    if (periodFilter === "diario") {
      return dailyAppointments
    }
    if (periodFilter === "semana") {
      return appointments.filter((appt) => isSameWeek(appt.fecha, selectedDate))
    }
    if (periodFilter === "mes") {
      return appointments.filter((appt) => isSameMonth(appt.fecha, selectedDate))
    }
    return appointments
  }

  const periodAppointments = getPeriodFilteredAppointments()
  const periodTotalAttended = periodAppointments.filter((appt) => appt.estado === "Atendido").length

  const obraSocialCounts: Record<string, number> = {}
  periodAppointments.forEach((appt) => {
    if (appt.estado === "Atendido") {
      const name = appt.paciente?.obraSocial?.nombre || appt.paciente?.obra_social_nombre_custom || "Particular"
      obraSocialCounts[name] = (obraSocialCounts[name] || 0) + 1
    }
  })

  // List of unique Obras Sociales for stats
  const obraSocialStats = Object.entries(obraSocialCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Service aggregation based on period filter
  const serviceCounts: Record<string, number> = {}
  periodAppointments.forEach((appt) => {
    if (appt.estado === "Atendido") {
      const name = appt.servicio?.nombre || "Sin servicio"
      serviceCounts[name] = (serviceCounts[name] || 0) + 1
    }
  })

  // List of unique Services for stats
  const serviceStats = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const activeStats = breakdownType === "obra_social" ? obraSocialStats : serviceStats;

  // List of unique Obras Sociales for filter dropdown
  const allObrasSociales = Array.from(
    new Set(
      appointments.map(
        (appt) => appt.paciente?.obraSocial?.nombre || appt.paciente?.obra_social_nombre_custom || "Particular"
      )
    )
  ).sort()

  // Filtered appointments for table (always daily, with user-selected search & filters)
  const filteredAppointments = dailyAppointments.filter((appt) => {
    const term = searchTerm.toLowerCase()
    const patientName = `${appt.paciente?.nombre || ""} ${appt.paciente?.apellido || ""}`.toLowerCase()
    const patientDoc = appt.paciente?.numero_documento || ""
    const patientEmail = appt.paciente?.email || ""
    const patientPhone = appt.paciente?.telefono || ""
    const profName = `${appt.profesional?.nombre || ""} ${appt.profesional?.apellido || ""}`.toLowerCase()

    const matchesSearch = patientName.includes(term) || 
      patientDoc.includes(term) ||
      patientEmail.includes(term) ||
      patientPhone.includes(term) ||
      profName.includes(term)

    const patientOS = appt.paciente?.obraSocial?.nombre || appt.paciente?.obra_social_nombre_custom || "Particular"
    const matchesOS = selectedObraSocial === "TODAS" || patientOS === selectedObraSocial

    const matchesEstado = selectedEstado === "TODOS" || appt.estado === selectedEstado

    return matchesSearch && matchesOS && matchesEstado
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1023] tracking-tight">Control de Asistencias</h2>
          <p className="text-xs text-gray-500 mt-0.5">Supervisión diaria y desglose de cobertura médica.</p>
        </div>

        {/* Quick Date Selectors & Navigation Wrapper */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Selector Pills */}
          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200/50 shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={setYesterday}
              className={`h-8 px-3.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedDate === getYesterdayDate()
                  ? "bg-white text-[#2563FF] shadow-xs border border-gray-200/40"
                  : "text-gray-500 hover:text-gray-900 bg-transparent"
              }`}
            >
              Ayer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={setToday}
              className={`h-8 px-3.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedDate === getTodayDate()
                  ? "bg-white text-[#2563FF] shadow-xs border border-gray-200/40"
                  : "text-gray-500 hover:text-gray-900 bg-transparent"
              }`}
            >
              Hoy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={setTomorrow}
              className={`h-8 px-3.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedDate === getTomorrowDate()
                  ? "bg-white text-[#2563FF] shadow-xs border border-gray-200/40"
                  : "text-gray-500 hover:text-gray-900 bg-transparent"
              }`}
            >
              Mañana
            </Button>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#E8E0D6] shadow-sm">
            <Button variant="outline" size="sm" onClick={() => changeDate(-1)} className="h-8 w-8 p-0 bg-transparent cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="relative flex items-center px-2">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-gray-700 focus:outline-none bg-transparent cursor-pointer"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => changeDate(1)} className="h-8 w-8 p-0 bg-transparent cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMonthlyAppointments(selectedDate)}
              className="h-8 w-8 p-0 bg-transparent cursor-pointer"
              title="Recargar"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl border border-[#E8E0D6]/40 flex items-center gap-2">
        <span className="capitalize">{formatDisplayDate(selectedDate)}</span>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 — Turnos Agendados (soft blue) */}
        <div className="bg-[#DBEAFE] rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-blue-900 mb-3">Turnos Agendados:</p>
          <div className="flex gap-5 mb-4">
            <div>
              <p className="text-2xl font-extrabold text-blue-900">{totalScheduled}</p>
              <p className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider">Total Hoy</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-900">{totalPending}</p>
              <p className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider">Pendientes</p>
            </div>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 h-10">
            {scheduledTrend.map((count, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-400/40 rounded-sm transition-all group-hover:bg-blue-500/50"
                style={{ height: `${Math.max((count / maxScheduledTrend) * 100, 8)}%` }}
                title={`${count} turnos`}
              />
            ))}
          </div>
        </div>

        {/* Card 2 — Pacientes Atendidos (soft green) */}
        <div className="bg-[#D1FAE5] rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-[#047857] mb-3">Resumen de Turnos:</p>
          <div className="flex gap-5 mb-4">
            <div>
              <p className="text-2xl font-extrabold text-emerald-900">{totalAttended}</p>
              <p className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Atendidos</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-900">{attendanceRate}%</p>
              <p className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Tasa Asistencia</p>
            </div>
          </div>
          {/* Mini line chart */}
          <div className="h-10 flex items-end">
            <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path
                d={linePath}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </svg>
          </div>
        </div>

        {/* Card 3 — Por Estado (soft pink/rose) */}
        <div className="bg-[#FFE4E6] rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-400/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-sm font-bold text-rose-900 mb-3">Por Estado:</p>
          <div className="flex gap-4 mb-4">
            {[
              { n: totalAttended, label: 'Atendido', dot: 'bg-emerald-500' },
              { n: totalConfirmed, label: 'Confirm.', dot: 'bg-blue-500' },
              { n: totalAbsent, label: 'Ausente', dot: 'bg-rose-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <div>
                  <p className="text-lg font-extrabold text-rose-900 leading-none">{s.n}</p>
                  <p className="text-[9px] font-semibold text-rose-600/70 uppercase leading-none mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Horizontal progress bars */}
          <div className="space-y-1.5">
            {[
              { w: totalScheduled > 0 ? (totalAttended / totalScheduled) * 100 : 0, color: 'bg-emerald-500' },
              { w: totalScheduled > 0 ? (totalConfirmed / totalScheduled) * 100 : 0, color: 'bg-blue-500' },
              { w: totalScheduled > 0 ? (totalAbsent / totalScheduled) * 100 : 0, color: 'bg-rose-500' },
            ].map((bar, i) => (
              <div key={i} className="h-1.5 bg-rose-200/50 rounded-full overflow-hidden">
                <div className={`h-full ${bar.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.max(bar.w, 2)}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Obra Social/Service Breakdown Card */}
        <Card className="p-5 border-[#E8E0D6] flex flex-col h-fit">
          <div className="flex flex-col gap-3 pb-4 border-b border-[#E8E0D6]/60 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-[#2563FF]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Desglose de Asistencias
                </h3>
              </div>
              
              {/* Period Filters */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200/50 shadow-xs">
                <button
                  onClick={() => setPeriodFilter("diario")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    periodFilter === "diario"
                      ? "bg-white text-[#2563FF] shadow-xs"
                      : "text-gray-500 hover:text-gray-900 bg-transparent"
                  }`}
                >
                  Día
                </button>
                <button
                  onClick={() => setPeriodFilter("semana")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    periodFilter === "semana"
                      ? "bg-white text-[#2563FF] shadow-xs"
                      : "text-gray-500 hover:text-gray-900 bg-transparent"
                  }`}
                >
                  Sem.
                </button>
                <button
                  onClick={() => setPeriodFilter("mes")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    periodFilter === "mes"
                      ? "bg-white text-[#2563FF] shadow-xs"
                      : "text-gray-500 hover:text-gray-900 bg-transparent"
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>

            {/* Toggle tabs for Obra Social vs Servicio */}
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200/40 shadow-inner">
              <button
                onClick={() => setBreakdownType("obra_social")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  breakdownType === "obra_social"
                    ? "bg-white text-[#2563FF] shadow-sm border border-gray-200/30"
                    : "text-gray-500 hover:text-gray-900 bg-transparent"
                }`}
              >
                Por Obra Social
              </button>
              <button
                onClick={() => setBreakdownType("servicio")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  breakdownType === "servicio"
                    ? "bg-white text-[#2563FF] shadow-sm border border-gray-200/30"
                    : "text-gray-500 hover:text-gray-900 bg-transparent"
                }`}
              >
                Por Servicio
              </button>
            </div>
          </div>

          {activeStats.length > 0 && (
            <div className="mb-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {periodFilter === "diario" 
                ? "Período: Diario" 
                : periodFilter === "semana" 
                ? "Período: Semanal" 
                : "Período: Mensual"}
            </div>
          )}

          {activeStats.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No hay asistencias registradas para clasificar{" "}
              {periodFilter === "diario" ? "hoy" : periodFilter === "semana" ? "esta semana" : "este mes"}.
            </div>
          ) : (
            <div className="space-y-4">
              {activeStats.map((stat, i) => {
                const percentage = periodTotalAttended > 0 ? Math.round((stat.count / periodTotalAttended) * 100) : 0
                // Use distinct curated colors
                const colors = [
                  "bg-blue-500",
                  "bg-emerald-500",
                  "bg-indigo-500",
                  "bg-purple-500",
                  "bg-amber-500",
                  "bg-teal-500"
                ]
                const barColor = colors[i % colors.length]

                return (
                  <div key={stat.name} className="space-y-1">
                     <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700 truncate max-w-[150px]">{stat.name}</span>
                      <span className="font-bold text-gray-900">{stat.count} {stat.count === 1 ? "paciente" : "pacientes"} <span className="text-gray-400 font-normal">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Detailed Appointments List */}
        <Card className="p-5 border-[#E8E0D6] lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 pb-4 border-b border-[#E8E0D6]/60 mb-4">
            <CheckSquare className="h-4 w-4 text-[#2563FF]" />
            <h3 className="text-sm font-bold text-gray-900">Registro Diario de Pacientes</h3>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar paciente por nombre o DNI..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/10 transition-all"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={selectedObraSocial}
                  onChange={(e) => setSelectedObraSocial(e.target.value)}
                  className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas las Obras Sociales</option>
                  <option value="Particular">Particular</option>
                  {allObrasSociales
                    .filter((os) => os !== "Particular")
                    .map((os) => (
                      <option key={os} value={os}>
                        {os}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs">
                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="Atendido">Atendidos</option>
                  <option value="Confirmado">Confirmados</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Ausente">Ausentes</option>
                  <option value="Cancelado">Cancelados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563FF]" />
              <p className="text-xs">Cargando turnos...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs border border-dashed rounded-2xl bg-gray-50/20">
              No se encontraron turnos con los filtros seleccionados para este día.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Obra Social</th>
                    <th className="px-4 py-3">Profesional / Servicio</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredAppointments.map((appt) => {
                    const osName = appt.paciente?.obraSocial?.nombre || appt.paciente?.obra_social_nombre_custom || "Particular"
                    const isAttended = appt.estado === "Atendido"
                    const isAbsent = appt.estado === "Ausente"

                    return (
                      <tr key={appt.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {appt.hora_inicio.substring(0, 5)} hs
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-semibold text-gray-800">
                            {appt.paciente?.nombre} {appt.paciente?.apellido}
                          </div>
                          {appt.paciente?.numero_documento && (
                            <div className="text-[10px] text-gray-400">DNI {appt.paciente.numero_documento}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            osName === "Particular" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-700"
                          }`}>
                            {osName}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-gray-700">Dr/a. {appt.profesional?.nombre} {appt.profesional?.apellido}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{appt.servicio?.nombre}</div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAttended ? "bg-green-100 text-green-800 border-green-200" : 
                            isAbsent ? "bg-red-100 text-red-800 border-red-200" : 
                            appt.estado === "Cancelado" ? "bg-gray-100 text-gray-800 border-gray-200" :
                            "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }`}>
                            {appt.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            {isAttended ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(appt.id, "Confirmado")}
                                disabled={updatingId === appt.id}
                                className="h-7 px-2 bg-transparent text-gray-500 hover:text-gray-700 border-gray-200 text-[10px]"
                                title="Revertir asistencia"
                              >
                                Revertir
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(appt.id, "Atendido")}
                                  disabled={updatingId === appt.id}
                                  className="h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white border-transparent text-[10px] flex items-center gap-1 font-bold"
                                  title="Marcar Asistencia"
                                >
                                  <UserCheck className="h-3 w-3" />
                                  Presente
                                </Button>
                                {!isAbsent && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(appt.id, "Ausente")}
                                    disabled={updatingId === appt.id}
                                    className="h-7 px-2 bg-transparent text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50 text-[10px] flex items-center gap-1"
                                    title="Marcar Ausencia"
                                  >
                                    <UserX className="h-3 w-3" />
                                    Ausente
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
