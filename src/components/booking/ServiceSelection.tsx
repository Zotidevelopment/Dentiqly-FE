"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Servicio } from "../../types"
import { serviciosApi } from "../../api/servicios"
import { Clock, Plus, AlertCircle } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

interface ServiceSelectionProps {
  selectedService: Servicio | null
  onServiceSelect: (service: Servicio) => void
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ selectedService, onServiceSelect }) => {
  const [services, setServices] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await serviciosApi.listar({ estado: "Activo", solo_con_profesionales: true })
      if (response && response.data) {
        setServices(response.data)
      } else {
        setServices([])
      }
    } catch (error) {
      console.error("Error loading services:", error)
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los servicios disponibles" })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" data-testid="loading-skeleton"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-medium text-center">
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {services.map((service) => {
        const isSelected = selectedService?.id === service.id
        return (
          <div
            key={service.id}
            onClick={() => onServiceSelect(service)}
            className={`
              relative group p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[100px]
              ${isSelected
                ? "border-[#2563FF] bg-blue-50/50 shadow-md scale-[1.01]"
                : "border-gray-100 bg-white hover:border-[#2563FF]/30 hover:shadow-sm"
              }
            `}
          >
            <div className="flex-1 pr-6 space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-[#2563FF]/80" : "text-gray-400"}`}>
                {service.categoria || "TRATAMIENTO"}
              </span>
              <h4 className={`text-sm font-bold leading-tight ${isSelected ? "text-blue-900" : "text-[#0A0F2D]"} transition-colors`}>
                {service.nombre}
              </h4>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-gray-400">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{service.duracion_estimada} MIN</span>
            </div>

            {/* Selection Tick */}
            <div className={`
              absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
              ${isSelected ? "bg-[#2563FF] text-white opacity-100" : "bg-gray-100 text-gray-300 opacity-0 group-hover:opacity-100"}
            `}>
              <Plus size={12} className={isSelected ? "rotate-45" : ""} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

