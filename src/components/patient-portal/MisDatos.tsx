import React, { useState, useEffect } from "react"
import { patientPortalApi, PacienteProfile } from "../../api/patient-portal"
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Heart, AlertCircle } from "lucide-react"

export const MisDatos: React.FC = () => {
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

  const { paciente } = perfil

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const initials = `${paciente.nombre?.charAt(0) || ''}${paciente.apellido?.charAt(0) || ''}`

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-[#0B2440]">Mis Datos Personales</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2458ED] flex items-center justify-center">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0B2440]">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <p className="text-sm text-[#8A93A8] font-medium mt-0.5">
                Paciente registrado
              </p>
            </div>
          </div>
        </div>

        {/* Data rows */}
        <div className="divide-y divide-gray-50">
          <DataRow icon={User} label="Tipo de Documento" value={paciente.tipo_documento} />
          <DataRow icon={CreditCard} label="Numero de Documento" value={paciente.numero_documento} />
          <DataRow icon={Calendar} label="Fecha de Nacimiento" value={formatDate(paciente.fecha_nacimiento)} />
          <DataRow icon={User} label="Sexo" value={paciente.sexo} />
          <DataRow icon={Mail} label="Email" value={paciente.email} />
          <DataRow icon={Phone} label="Telefono" value={paciente.telefono} />
          <DataRow icon={MapPin} label="Direccion" value={paciente.direccion} />
          <DataRow icon={Heart} label="Obra Social" value={paciente.obraSocial} />
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-100">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 font-medium">
          Para modificar tus datos personales, por favor contacta con tu clinica dental.
        </p>
      </div>
    </div>
  )
}

const DataRow: React.FC<{ icon: any; label: string; value: string | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 px-6 lg:px-8 py-4 hover:bg-[#F7F8FA]/50 transition-colors">
    <div className="w-10 h-10 rounded-xl bg-[#2458ED]/8 flex items-center justify-center shrink-0">
      <Icon size={18} className="text-[#2458ED]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-[#8A93A8] font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-[#0B2440] mt-0.5 truncate">{value || "-"}</p>
    </div>
  </div>
)
