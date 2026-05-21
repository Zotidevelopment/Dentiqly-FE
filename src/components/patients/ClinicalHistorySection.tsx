"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Plus, Edit, Trash2, FileText, Calendar, X } from "lucide-react"
import { historialesClinicosApi, profesionalesApi } from "../../api"
import type { HistorialClinico, CrearHistorialClinicoData } from "../../types"
import { ConfirmationModal } from "../ui/ConfirmationModal"

interface ClinicalHistorySectionProps {
  pacienteId: string | number
}

export const ClinicalHistorySection: React.FC<ClinicalHistorySectionProps> = ({ pacienteId }) => {
  const [historiales, setHistoriales] = useState<HistorialClinico[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("view")
  const [selectedHistorial, setSelectedHistorial] = useState<HistorialClinico | null>(null)
  const [formData, setFormData] = useState<Partial<CrearHistorialClinicoData>>({})
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)
  const [defaultProfesionalId, setDefaultProfesionalId] = useState<number | null>(null)

  useEffect(() => {
    fetchHistoriales()
    profesionalesApi.listar({ estado: 'Activo', limit: 1 })
      .then(res => {
        const profs = res.data || res
        if (Array.isArray(profs) && profs.length > 0) setDefaultProfesionalId(profs[0].id)
      })
      .catch(() => {})
  }, [pacienteId])

  const fetchHistoriales = async () => {
    try {
      setLoading(true)
      const data = await historialesClinicosApi.listar(pacienteId)
      setHistoriales(data)
    } catch (error) {
      console.error("Error fetching clinical histories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      paciente_id: pacienteId,
      fecha: new Date().toISOString().split("T")[0],
    })
    setModalMode("create")
    setShowModal(true)
  }

  const handleEdit = (historial: HistorialClinico) => {
    setSelectedHistorial(historial)
    setFormData(historial)
    setModalMode("edit")
    setShowModal(true)
  }

  const handleView = (historial: HistorialClinico) => {
    setSelectedHistorial(historial)
    setModalMode("view")
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este historial clínico?",
      onConfirm: async () => {
        try {
          await historialesClinicosApi.eliminar(id)
          fetchHistoriales()
        } catch (error) {
          console.error("Error deleting clinical history:", error)
        }
        setConfirmAction(null)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = {
        ...formData,
        profesional_id: defaultProfesionalId,
        examen_clinico: formData.examen_fisico || (formData as any).examen_clinico,
        tratamiento_realizado: formData.tratamiento || (formData as any).tratamiento_realizado,
      }
      delete payload.examen_fisico
      delete payload.tratamiento

      if (modalMode === "create") {
        await historialesClinicosApi.crear(payload)
      } else if (modalMode === "edit" && selectedHistorial) {
        await historialesClinicosApi.actualizar(selectedHistorial.id, payload)
      }
      setShowModal(false)
      fetchHistoriales()
    } catch (error) {
      console.error("Error saving clinical history:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando historiales clínicos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Historia Clínica</h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {historiales.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No hay registros de historia clínica</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4 bg-transparent">
            Crear primer registro
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {historiales.map((historial) => (
            <Card key={historial.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1" onClick={() => handleView(historial)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(historial.fecha).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  {historial.motivo_consulta && (
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Motivo:</span> {historial.motivo_consulta}
                    </p>
                  )}
                  {historial.diagnostico && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Diagnóstico:</span> {historial.diagnostico}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(historial)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(historial.id)}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "view"
                  ? "Ver Historia Clínica"
                  : modalMode === "create"
                    ? "Nueva Historia Clínica"
                    : "Editar Historia Clínica"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalMode === "view" && selectedHistorial ? (
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="font-medium">{new Date(selectedHistorial.fecha).toLocaleDateString("es-ES")}</p>
                </div>
                {selectedHistorial.motivo_consulta && (
                  <div>
                    <p className="text-xs text-gray-500">Motivo de Consulta</p>
                    <p className="text-sm">{selectedHistorial.motivo_consulta}</p>
                  </div>
                )}
                {selectedHistorial.enfermedad_actual && (
                  <div>
                    <p className="text-xs text-gray-500">Enfermedad Actual</p>
                    <p className="text-sm">{selectedHistorial.enfermedad_actual}</p>
                  </div>
                )}
                {selectedHistorial.antecedentes_personales && (
                  <div>
                    <p className="text-xs text-gray-500">Antecedentes Personales</p>
                    <p className="text-sm">{selectedHistorial.antecedentes_personales}</p>
                  </div>
                )}
                {selectedHistorial.antecedentes_familiares && (
                  <div>
                    <p className="text-xs text-gray-500">Antecedentes Familiares</p>
                    <p className="text-sm">{selectedHistorial.antecedentes_familiares}</p>
                  </div>
                )}
                {(selectedHistorial.examen_fisico || (selectedHistorial as any).examen_clinico) && (
                  <div>
                    <p className="text-xs text-gray-500">Examen Clínico</p>
                    <p className="text-sm">{selectedHistorial.examen_fisico || (selectedHistorial as any).examen_clinico}</p>
                  </div>
                )}
                {selectedHistorial.diagnostico && (
                  <div>
                    <p className="text-xs text-gray-500">Diagnóstico</p>
                    <p className="text-sm">{selectedHistorial.diagnostico}</p>
                  </div>
                )}
                {(selectedHistorial.tratamiento || (selectedHistorial as any).tratamiento_realizado) && (
                  <div>
                    <p className="text-xs text-gray-500">Tratamiento</p>
                    <p className="text-sm">{selectedHistorial.tratamiento || (selectedHistorial as any).tratamiento_realizado}</p>
                  </div>
                )}
                {selectedHistorial.observaciones && (
                  <div>
                    <p className="text-xs text-gray-500">Observaciones</p>
                    <p className="text-sm">{selectedHistorial.observaciones}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha || ""}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Consulta</label>
                  <textarea
                    rows={2}
                    value={formData.motivo_consulta || ""}
                    onChange={(e) => setFormData({ ...formData, motivo_consulta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedad Actual</label>
                  <textarea
                    rows={3}
                    value={formData.enfermedad_actual || ""}
                    onChange={(e) => setFormData({ ...formData, enfermedad_actual: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antecedentes Personales</label>
                  <textarea
                    rows={3}
                    value={formData.antecedentes_personales || ""}
                    onChange={(e) => setFormData({ ...formData, antecedentes_personales: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antecedentes Familiares</label>
                  <textarea
                    rows={3}
                    value={formData.antecedentes_familiares || ""}
                    onChange={(e) => setFormData({ ...formData, antecedentes_familiares: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examen Físico</label>
                  <textarea
                    rows={3}
                    value={formData.examen_fisico || ""}
                    onChange={(e) => setFormData({ ...formData, examen_fisico: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                  <textarea
                    rows={2}
                    value={formData.diagnostico || ""}
                    onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
                  <textarea
                    rows={3}
                    value={formData.tratamiento || ""}
                    onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    rows={2}
                    value={formData.observaciones || ""}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{modalMode === "create" ? "Crear Registro" : "Guardar Cambios"}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
