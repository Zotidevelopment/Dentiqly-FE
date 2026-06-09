"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Briefcase, Plus, X, AlertCircle } from 'lucide-react'
import { adminApi } from "../../api/admin"
import { useToast } from "../../hooks/use-toast"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import type { Profesional, Servicio } from "../../types"

interface ServiceAssignmentProps {
  professional: Profesional
  onServicesUpdate?: (servicios: Servicio[]) => void
}

export const ServiceAssignment: React.FC<ServiceAssignmentProps> = ({ professional, onServicesUpdate }) => {
  const { toast } = useToast()
  const [assignedServices, setAssignedServices] = useState<Servicio[]>([])
  const [availableServices, setAvailableServices] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [confirmRemove, setConfirmRemove] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  })

  useEffect(() => {
    fetchData()
  }, [professional.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [servicesResponse, allServicesResponse] = await Promise.all([
        adminApi.profesionales.obtenerServicios(professional.id),
        adminApi.servicios.listar({ estado: "Activo" }),
      ])

      setAssignedServices(servicesResponse.servicios)

      const assignedIds = servicesResponse.servicios.map(s => s.id)
      const available = allServicesResponse.data.filter(s => !assignedIds.includes(s.id))
      setAvailableServices(available)
    } catch (error: any) {
      console.error("Error fetching services:", error)
      const msg = error.response?.data?.error || error.message || "No se pudieron cargar los servicios"
      toast({ variant: "destructive", title: "Error", description: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleAddServices = async () => {
    if (selectedServiceIds.length === 0) return

    try {
      setSaving(true)
      const response = await adminApi.profesionales.asignarServicios(professional.id, {
        servicio_ids: selectedServiceIds,
      })

      setAssignedServices(response.servicios)
      onServicesUpdate?.(response.servicios)

      const assignedIds = response.servicios.map(s => s.id)
      const available = availableServices.filter(s => !assignedIds.includes(s.id))
      setAvailableServices(available)

      setSelectedServiceIds([])
      setShowAddModal(false)
      toast({ title: "Éxito", description: "Servicios asignados correctamente" })
    } catch (error: any) {
      console.error("Error assigning services:", error)
      const msg = error.response?.data?.error || error.message || "Error al asignar servicios. Intente nuevamente."
      toast({ variant: "destructive", title: "Error", description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveService = async (servicioId: number) => {
    setConfirmRemove({ isOpen: true, id: servicioId })
  }

  const handleConfirmRemove = async () => {
    if (!confirmRemove.id) return

    try {
      await adminApi.profesionales.removerServicio(professional.id, confirmRemove.id)

      const removedService = assignedServices.find(s => s.id === confirmRemove.id)
      const newAssigned = assignedServices.filter(s => s.id !== confirmRemove.id)

      setAssignedServices(newAssigned)
      if (removedService) {
        setAvailableServices([...availableServices, removedService])
      }

      onServicesUpdate?.(newAssigned)
      toast({ title: "Éxito", description: "Servicio removido correctamente" })
    } catch (error: any) {
      console.error("Error removing service:", error)
      const msg = error.response?.data?.error || error.message || "Error al remover servicio. Intente nuevamente."
      toast({ variant: "destructive", title: "Error", description: msg })
    } finally {
      setConfirmRemove({ isOpen: false, id: null })
    }
  }

  const toggleServiceSelection = (servicioId: number) => {
    setSelectedServiceIds(prev =>
      prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    )
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Servicios Asignados
            </h3>
            <p className="text-sm text-muted-foreground">
              {professional.nombre} {professional.apellido}
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} size="sm" disabled={availableServices.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Asignar Servicios
          </Button>
        </div>

        {assignedServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay servicios asignados</p>
            <p className="text-sm">Asigna servicios a este profesional para que pueda atenderlos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedServices.map((servicio) => (
              <div
                key={servicio.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{servicio.nombre}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground">{servicio.categoria}</span>
                    <span className="text-sm text-muted-foreground">
                      ${Number(servicio.precio_base).toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {servicio.duracion_estimada} min
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveService(servicio.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmationModal
        isOpen={confirmRemove.isOpen}
        onClose={() => setConfirmRemove({ isOpen: false, id: null })}
        onConfirm={handleConfirmRemove}
        title="Remover Servicio"
        message="¿Estás seguro de que quieres remover este servicio?"
      />

      {/* Modal para agregar servicios */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-black text-[#026498] tracking-tight">Asignar Servicios</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">
                Selecciona los servicios que este profesional puede atender
              </p>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-20"
            >
              <X size={24} />
            </button>

            <div className="flex-1 overflow-y-auto p-8">
              {availableServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay más servicios disponibles para asignar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableServices.map((servicio) => (
                    <label
                      key={servicio.id}
                      className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(servicio.id)}
                        onChange={() => toggleServiceSelection(servicio.id)}
                        className="rounded border-input mr-3"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{servicio.nombre}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">{servicio.categoria}</span>
                          <span className="text-sm text-muted-foreground">
                            ${Number(servicio.precio_base).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {servicio.duracion_estimada} min
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedServiceIds([])
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddServices}
                disabled={selectedServiceIds.length === 0 || saving}
              >
                {saving ? "Asignando..." : `Asignar ${selectedServiceIds.length} servicio(s)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
