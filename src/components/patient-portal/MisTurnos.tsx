import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { patientPortalApi } from "../../api/patient-portal"
import { Calendar, Clock, User, ArrowRight } from "lucide-react"
import { format, parseISO, isAfter, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "../../hooks/use-toast"

export const MisTurnos: React.FC = () => {
  const [turnos, setTurnos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [filtro, setFiltro] = useState<"todos" | "proximos" | "pasados" | "cancelados">("todos")

  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const data = await patientPortalApi.obtenerMisTurnos()
        setTurnos(data)
      } catch (error) {
        console.error("Error al cargar turnos:", error)
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar tus turnos" })
      } finally {
        setLoading(false)
      }
    }
    cargarTurnos()
  }, [])

  const filtrarTurnos = () => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return turnos.filter((turno) => {
      const fechaTurno = parseISO(turno.fecha)

      switch (filtro) {
        case "proximos":
          return (isAfter(fechaTurno, hoy) || isSameDay(fechaTurno, hoy)) && turno.estado !== "Cancelado"
        case "pasados":
          return !isAfter(fechaTurno, hoy) && !isSameDay(fechaTurno, hoy) && turno.estado !== "Cancelado"
        case "cancelados":
          return turno.estado === "Cancelado"
        default:
          return true
      }
    })
  }

  const formatearFecha = (fecha: string) => {
    try {
      return format(parseISO(fecha), "EEE d 'de' MMM yyyy", { locale: es })
    } catch {
      return fecha
    }
  }

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case "Confirmado":
      case "Confirmado por email":
      case "Confirmado por SMS":
      case "Confirmado por WhatsApp":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Pendiente":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Cancelado":
        return "bg-red-50 text-red-600 border-red-200"
      case "Atendido":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Ausente":
        return "bg-gray-50 text-gray-600 border-gray-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const puedeAccionar = (turno: any) => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaTurno = parseISO(turno.fecha)
    return isAfter(fechaTurno, hoy) && turno.estado !== "Cancelado" && turno.estado !== "Atendido"
  }

  const turnosFiltrados = filtrarTurnos()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563FF]" />
          <span className="text-[#8A93A8] font-medium">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#0B1023]">Mis Turnos</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["todos", "proximos", "pasados", "cancelados"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filtro === f
                ? "bg-[#2563FF] text-white shadow-[0_4px_15px_rgba(37,99,255,0.25)]"
                : "bg-white text-[#5A6178] border border-gray-100 hover:border-[#2563FF]/30 hover:text-[#2563FF]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Turnos list */}
      {turnosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[#8A93A8]" />
          </div>
          <h3 className="text-lg font-bold text-[#0B1023] mb-2">No hay turnos en esta categoria</h3>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#2563FF] text-white rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.25)]"
          >
            Reservar Turno
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {turnosFiltrados.map((turno) => (
            <div
              key={turno.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 hover:border-gray-200 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${getEstadoStyles(turno.estado)}`}
                    >
                      {turno.estado}
                    </span>
                    {turno.servicio?.nombre && (
                      <span className="px-3 py-1 rounded-lg bg-[#F7F8FA] text-[#5A6178] text-xs font-medium">
                        {turno.servicio.nombre}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={16} className="text-[#8A93A8]" />
                      <span className="text-sm font-semibold text-[#0B1023] capitalize">{formatearFecha(turno.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-[#8A93A8]" />
                      <span className="text-sm text-[#5A6178]">{turno.hora_inicio} - {turno.hora_fin}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User size={16} className="text-[#8A93A8]" />
                      <span className="text-sm text-[#5A6178]">
                        {turno.profesional?.nombre} {turno.profesional?.apellido}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link
                    to={`/paciente/turnos/${turno.id}`}
                    className="px-4 py-2 rounded-xl font-bold text-sm border border-gray-200 text-[#5A6178] hover:border-[#2563FF]/30 hover:text-[#2563FF] transition-all"
                  >
                    Ver
                  </Link>
                  {puedeAccionar(turno) && (
                    <>
                      <Link
                        to={`/paciente/turnos/${turno.id}/reprogramar`}
                        className="px-4 py-2 rounded-xl font-bold text-sm bg-[#2563FF] text-white hover:bg-[#1D4ED8] transition-colors"
                      >
                        Reprogramar
                      </Link>
                      <Link
                        to={`/paciente/turnos/${turno.id}/cancelar`}
                        className="px-4 py-2 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Cancelar
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
