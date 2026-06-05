"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Plus, Edit, Trash2, Calendar, X, ClipboardList, DollarSign } from "lucide-react"
import { planesTratamientoApi } from "../../api"
import type { PlanTratamiento, CrearPlanTratamientoData } from "../../types"
import { useToast } from "../../hooks/use-toast"
import { ConfirmationModal } from "../ui/ConfirmationModal"

interface TreatmentPlansSectionProps {
  pacienteId: string | number
}

export const TreatmentPlansSection: React.FC<TreatmentPlansSectionProps> = ({ pacienteId }) => {
  const [planes, setPlanes] = useState<PlanTratamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("view")
  const [selectedPlan, setSelectedPlan] = useState<PlanTratamiento | null>(null)
  const [formData, setFormData] = useState<Partial<CrearPlanTratamientoData>>({})
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlanes()
  }, [pacienteId])

  const fetchPlanes = async () => {
    try {
      setLoading(true)
      const data = await planesTratamientoApi.listar(pacienteId)
      setPlanes(data)
    } catch (error) {
      console.error("Error fetching treatment plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      paciente_id: pacienteId,
      fecha_inicio: new Date().toISOString().split("T")[0],
      estado: "Planificado",
    })
    setModalMode("create")
    setShowModal(true)
  }

  const handleEdit = (plan: PlanTratamiento) => {
    setSelectedPlan(plan)
    setFormData(plan)
    setModalMode("edit")
    setShowModal(true)
  }

  const handleView = (plan: PlanTratamiento) => {
    setSelectedPlan(plan)
    setModalMode("view")
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este plan de tratamiento?",
      onConfirm: async () => {
        try {
          await planesTratamientoApi.eliminar(id)
          fetchPlanes()
        } catch (error) {
          console.error("Error deleting treatment plan:", error)
        }
        setConfirmAction(null)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación de fechas
    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
        toast({ variant: "destructive", title: "Validación", description: "La fecha de fin no puede ser anterior a la fecha de inicio." })
        return
      }
    }

    try {
      if (modalMode === "create") {
        await planesTratamientoApi.crear(formData as CrearPlanTratamientoData)
      } else if (modalMode === "edit" && selectedPlan) {
        await planesTratamientoApi.actualizar(selectedPlan.id, formData)
      }
      setShowModal(false)
      fetchPlanes()
    } catch (error: any) {
      console.error("Error saving treatment plan:", error)
      const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || "Error al guardar el plan de tratamiento. Por favor, intente nuevamente."
      toast({ variant: "destructive", title: "Error", description: errorMsg })
    }
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "Planificado":
        return "bg-blue-100 text-blue-800"
      case "En_Progreso":
        return "bg-yellow-100 text-yellow-800"
      case "Completado":
        return "bg-green-100 text-green-800"
      case "Cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando planes de tratamiento...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Planes de Tratamiento</h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {planes.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No hay planes de tratamiento registrados</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4 bg-transparent">
            Crear primer plan
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {planes.map((plan) => (
            <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1" onClick={() => handleView(plan)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeColor(plan.estado)}`}
                    >
                      {plan.estado.replace("_", " ")}
                    </span>
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(plan.fecha_inicio).toLocaleDateString("es-ES")}
                      {plan.fecha_fin && ` - ${new Date(plan.fecha_fin).toLocaleDateString("es-ES")}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{plan.descripcion}</p>
                  {plan.costo_estimado && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${plan.costo_estimado.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {confirmAction && (
        <ConfirmationModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => { confirmAction.onConfirm(); }}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText="Confirmar"
          variant="destructive"
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center z-10 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "view"
                  ? "Ver Plan de Tratamiento"
                  : modalMode === "create"
                    ? "Nuevo Plan de Tratamiento"
                    : "Editar Plan de Tratamiento"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {modalMode === "view" && selectedPlan ? (
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeColor(selectedPlan.estado)}`}
                  >
                    {selectedPlan.estado.replace("_", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Inicio</p>
                    <p className="font-medium">{new Date(selectedPlan.fecha_inicio).toLocaleDateString("es-ES")}</p>
                  </div>
                  {selectedPlan.fecha_fin && (
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Fin</p>
                      <p className="font-medium">{new Date(selectedPlan.fecha_fin).toLocaleDateString("es-ES")}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Descripción</p>
                  <p className="text-sm">{selectedPlan.descripcion}</p>
                </div>
                {selectedPlan.costo_estimado && (
                  <div>
                    <p className="text-xs text-gray-500">Costo Estimado</p>
                    <p className="font-medium text-lg">${selectedPlan.costo_estimado.toLocaleString()}</p>
                  </div>
                )}
                {selectedPlan.observaciones && (
                  <div>
                    <p className="text-xs text-gray-500">Observaciones</p>
                    <p className="text-sm">{selectedPlan.observaciones}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_inicio || ""}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                    <input
                      type="date"
                      value={formData.fecha_fin || ""}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <select
                    required
                    value={formData.estado || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as "Planificado" | "En_Progreso" | "Completado" | "Cancelado",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Planificado">Planificado</option>
                    <option value="En_Progreso">En Progreso</option>
                    <option value="Completado">Completado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.descripcion || ""}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe el plan de tratamiento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costo_estimado || ""}
                    onChange={(e) => setFormData({ ...formData, costo_estimado: e.target.value ? Number.parseFloat(e.target.value) : 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    rows={3}
                    value={formData.observaciones || ""}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">{modalMode === "create" ? "Crear Plan" : "Guardar Cambios"}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
