"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Profesional, Servicio } from "../../types"
import { serviciosApi } from "../../api/servicios"
import { User, Check } from "lucide-react"

interface ProfessionalSelectionProps {
  selectedService: Servicio | null
  selectedProfessional: Profesional | null
  onProfessionalSelect: (professional: Profesional) => void
  isAdmin?: boolean
}

export const ProfessionalSelection: React.FC<ProfessionalSelectionProps> = ({
  selectedService,
  selectedProfessional,
  onProfessionalSelect,
  isAdmin = false
}) => {
  const [professionals, setProfessionals] = useState<Profesional[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true)
      try {
        if (selectedService) {
          const response = await serviciosApi.obtenerProfesionales(selectedService.id)
          if (response.profesionales) {
            setProfessionals(response.profesionales.filter((prof: Profesional) => prof.estado === "Activo"))
          }
        }
      } catch (error) {
        console.error("Error fetching professionals:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchAllProfessionals = async () => {
      setLoading(true)
      try {
        const { profesionalesApi } = await import("../../api/profesionales")
        const response = await profesionalesApi.listar({ estado: "Activo", limit: 100 })
        setProfessionals(response.data)
      } catch (error) {
        console.error("Error fetching all professionals:", error)
      } finally {
        setLoading(false)
      }
    }

    if (selectedService) {
      fetchProfessionals()
    } else if (isAdmin) {
      fetchAllProfessionals()
    } else {
      setProfessionals([])
      setLoading(false)
    }
  }, [selectedService, isAdmin])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center bg-gray-50/50 p-6 rounded-2xl animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gray-100 mb-4"></div>
            <div className="h-4 w-24 bg-gray-100 mb-2"></div>
            <div className="h-3 w-16 bg-gray-100"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {professionals.map((professional) => {
        const isSelected = selectedProfessional?.id === professional.id
        return (
          <div
            key={professional.id}
            onClick={() => onProfessionalSelect(professional)}
            className={`
              relative flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-center
              ${isSelected
                ? "border-[#2458ED] bg-blue-50/50 shadow-md scale-[1.01]"
                : "border-gray-100 bg-white hover:border-[#2458ED]/30 hover:shadow-sm"
              }
            `}
          >
            {/* Avatar */}
            <div className={`
              relative w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4 p-1 border-2 transition-all duration-300
              ${isSelected ? "border-[#2458ED]" : "border-gray-100"}
            `}>
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 shadow-inner">
                {professional.foto_url ? (
                  <img 
                    src={professional.foto_url} 
                    alt={`${professional.nombre} ${professional.apellido}`} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <User size={32} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-[#2458ED] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h4 className={`text-base font-bold leading-tight transition-colors ${isSelected ? "text-blue-900" : "text-[#0B2440]"}`}>
                {professional.apellido} {professional.nombre}
              </h4>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{professional.especialidad}</p>
            </div>
          </div>
        )
      })}
      
      {professionals.length === 0 && !loading && (
        <div className="col-span-full text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <h4 className="text-base font-bold text-gray-900 mb-1">No se encontraron profesionales</h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {selectedService 
              ? "Este servicio no tiene profesionales asignados."
              : "No hay profesionales activos disponibles."}
          </p>
        </div>
      )}
    </div>
  )
}

