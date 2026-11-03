import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { patientPortalApi, PacienteProfile } from "../../api/patient-portal"
import { Calendar, Clock, CheckCircle, XCircle, User, ArrowRight, Sparkles } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export const DashboardPaciente: React.FC = () => {
  const [perfil, setPerfil] = useState<PacienteProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await patientPortalApi.obtenerPerfil()
        setPerfil(data)
      } catch (error) {
        console.error("Error al cargar perfil:", error)
      } finally {
        setLoading(false)
      }
    }
    cargarPerfil()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2458ED]" />
          <span className="text-[#8A93A8] font-medium">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!perfil) return null

  const { paciente, proximoTurno, estadisticas } = perfil

  const formatearFecha = (fecha: string) => {
    try {
      return format(parseISO(fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
    } catch {
      return fecha
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2440]">
            Hola, {paciente.nombre} {paciente.apellido}
          </h1>
          <p className="text-[#8A93A8] text-sm font-medium mt-1">Bienvenido a tu portal de salud dental</p>
        </div>
      </div>

      {/* Next appointment */}
      {proximoTurno ? (
        <div className="bg-[#0B2440] rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#2458ED]" />
                  <span className="text-[#83B3FF] text-xs font-bold uppercase tracking-wider">Próximo turno</span>
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-3 text-white">
                    <Calendar size={18} className="text-white/40" />
                    <span className="font-semibold capitalize">{formatearFecha(proximoTurno.fecha)}</span>
                  </p>
                  <p className="flex items-center gap-3 text-white/70">
                    <Clock size={18} className="text-white/40" />
                    <span>{proximoTurno.hora_inicio} - {proximoTurno.hora_fin}</span>
                  </p>
                  <p className="flex items-center gap-3 text-white/70">
                    <User size={18} className="text-white/40" />
                    <span>
                      {proximoTurno.profesional?.nombre} {proximoTurno.profesional?.apellido}
                      {proximoTurno.profesional?.especialidad && (
                        <span className="text-white/40"> — {proximoTurno.profesional.especialidad}</span>
                      )}
                    </span>
                  </p>
                  {proximoTurno.servicio?.nombre && (
                    <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-medium">
                      {proximoTurno.servicio.nombre}
                    </span>
                  )}
                </div>
              </div>
              <Link
                to={`/paciente/turnos/${proximoTurno.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2458ED] text-white rounded-xl text-sm font-bold hover:bg-[#1744CD] transition-colors shadow-[0_4px_15px_rgba(37,99,255,0.3)]"
              >
                Ver detalle
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[#8A93A8]" />
          </div>
          <h3 className="text-lg font-bold text-[#0B2440] mb-2">No tenés turnos próximos</h3>
          <p className="text-[#65788D] text-sm mb-5">Agendá tu próximo turno con tu clínica</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2458ED] text-white rounded-xl font-bold text-sm hover:bg-[#1744CD] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.25)]"
          >
            Reservar Turno
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Turnos" value={estadisticas.totalTurnos} color="#2458ED" />
        <StatCard icon={CheckCircle} label="Completados" value={estadisticas.turnosCompletados} color="#10B981" />
        <StatCard icon={Clock} label="Pendientes" value={estadisticas.turnosPendientes} color="#F59E0B" />
        <StatCard icon={XCircle} label="Cancelados" value={estadisticas.turnosCancelados} color="#EF4444" />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-[#0B2440] mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/paciente/turnos" label="Ver Turnos" icon={Calendar} />
          <QuickAction to="/paciente/mis-datos" label="Mis Datos" icon={User} />
          <QuickAction to="/paciente/historial" label="Historial" icon={CheckCircle} />
          <QuickAction to="/paciente/tratamientos" label="Tratamientos" icon={Clock} />
        </div>
      </div>
    </div>
  )
}

const StatCard: React.FC<{ icon: any; label: string; value: number; color: string }> = ({
  icon: Icon,
  label,
  value,
  color,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[#0B2440]">{value}</p>
        <p className="text-xs text-[#8A93A8] font-medium">{label}</p>
      </div>
    </div>
  </div>
)

const QuickAction: React.FC<{ to: string; label: string; icon: any }> = ({ to, label, icon: Icon }) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-2.5 p-5 rounded-xl border border-gray-100 hover:border-[#2458ED]/30 hover:bg-[#2458ED]/5 transition-all group"
  >
    <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] flex items-center justify-center group-hover:bg-[#2458ED]/10 transition-colors">
      <Icon size={20} className="text-[#8A93A8] group-hover:text-[#2458ED] transition-colors" />
    </div>
    <span className="text-sm font-semibold text-[#5A6178] group-hover:text-[#2458ED] transition-colors">{label}</span>
  </Link>
)
