import React, { useEffect, useState } from 'react'
import { MapPin, Phone, Star, Clock } from 'lucide-react'
import { configuracionApi, ConfiguracionTenant } from '../../api/configuracion'
import { useParams } from 'react-router-dom'

export const BookingSummary: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)
        const data = await configuracionApi.listar()
        // Convert array of settings to object
        const mappedConfig: any = {}
        data.forEach((s: any) => {
          mappedConfig[s.clave] = s.valor
        })
        setConfig(mappedConfig)
      } catch (error) {
        console.error("Error fetching clinic configuration:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchConfig()
  }, [slug])

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm animate-pulse">
        <div className="h-8 bg-gray-100 w-3/4 rounded mb-2"></div>
        <div className="h-4 bg-gray-100 w-1/2 rounded mb-8"></div>
        <div className="space-y-4 mb-8">
          <div className="h-4 bg-gray-100 w-full rounded"></div>
          <div className="h-4 bg-gray-100 w-3/4 rounded"></div>
        </div>
      </div>
    )
  }

  const nombreClinica = config.clinic_name || "Mi Clínica Dental"
  const direccion = config.clinic_address || "Dirección no especificada"
  const telefono = config.clinic_phone || "Teléfono no especificado"
  const googleMapsUrl = config.clinic_google_maps
  const isEmbedLink = googleMapsUrl?.includes('google.com/maps/embed')

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Map Header */}
      {googleMapsUrl && isEmbedLink ? (
        <div className="w-full h-48 bg-gray-100 relative">
          <iframe
            src={googleMapsUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none bg-white/20"></div>
        </div>
      ) : googleMapsUrl ? (
        <div className="w-full h-48 bg-blue-50 flex flex-col items-center justify-center p-6 text-center gap-2">
          <MapPin size={24} className="text-[#2458ED] opacity-40" />
          <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">
            Link de mapa inválido.<br/>Usa un link de "Insertar mapa".
          </p>
        </div>
      ) : null}

      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight">{nombreClinica}</h3>
            <p className="text-xs font-bold text-[#2458ED] uppercase tracking-widest mt-1">Sede Central</p>
          </div>
          <div className="bg-[#2458ED] text-white flex items-center gap-1 px-2.5 py-1 rounded-xl shadow-lg shadow-blue-500/20">
            <Star size={10} className="fill-current" />
            <span className="text-[10px] font-black">5.0</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <MapPin size={16} className="text-gray-400 group-hover:text-[#2458ED] transition-colors" />
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed pt-1">
              {direccion}
            </p>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Phone size={16} className="text-gray-400 group-hover:text-[#2458ED] transition-colors" />
            </div>
            <p className="text-sm text-gray-600 font-medium pt-0.5">
              {telefono}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Clock size={14} className="text-[#2458ED]" />
            </div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Horarios de Atención</h4>
          </div>
          
          <div className="space-y-3.5">
            {(() => {
              const businessHours = config.business_hours
              let parsed: Record<string, { activo: boolean; rangos: { inicio: string; fin: string }[] }> | null = null
              if (businessHours) {
                try {
                  parsed = typeof businessHours === "string" ? JSON.parse(businessHours) : businessHours
                } catch { /* fallback below */ }
              }

              if (parsed) {
                const dayLabels: Record<string, string> = {
                  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
                  jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo"
                }
                const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

                // Group days with same schedule
                const groups: { days: string[]; time: string; closed: boolean }[] = []
                days.forEach(day => {
                  const d = parsed![day]
                  if (!d) return
                  const closed = !d.activo || d.rangos.length === 0
                  const time = closed ? "Cerrado" : d.rangos.map(r => `${r.inicio} - ${r.fin}`).join(", ")
                  const last = groups[groups.length - 1]
                  if (last && last.time === time && last.closed === closed) {
                    last.days.push(dayLabels[day])
                  } else {
                    groups.push({ days: [dayLabels[day]], time, closed })
                  }
                })

                return groups.map((g, i) => {
                  const label = g.days.length <= 2 ? g.days.join(" y ") :
                    `${g.days[0]} a ${g.days[g.days.length - 1]}`
                  return (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-600">{label}</span>
                      <span className={`${g.closed ? 'text-red-400 font-black italic' : 'text-gray-500 font-bold'}`}>
                        {g.time}
                      </span>
                    </div>
                  )
                })
              }

              // Fallback: hardcoded defaults
              return [
                { days: "Lunes a Viernes", time: "9:00 - 18:00" },
                { days: "Sáb y Dom", time: "Cerrado", closed: true }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-600">{item.days}</span>
                  <span className={`${'closed' in item && item.closed ? 'text-red-400 font-black italic' : 'text-gray-500 font-bold'}`}>
                    {item.time}
                  </span>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}