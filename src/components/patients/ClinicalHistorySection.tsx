"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Plus, Edit, Trash2, FileText, Calendar, X } from "lucide-react"
import { historialesClinicosApi } from "../../api"
import { useToast } from "../../hooks/use-toast"
import { useProfesionalesActivos, nombreProfesional } from "./useProfesionalesActivos"
import type { HistorialClinico, CrearHistorialClinicoData } from "../../types"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import { todayISO, formatLocalDate } from "../../utils/date"

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
  const [saving, setSaving] = useState(false)
  const profesionales = useProfesionalesActivos()
  const { toast } = useToast()

  useEffect(() => {
    fetchHistoriales()
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
      paciente_id: String(pacienteId),
      fecha: todayISO(),
      profesional_id: profesionales[0]?.id,
    } as Partial<CrearHistorialClinicoData>)
    setModalMode("create")
    setShowModal(true)
  }

  const handleEdit = (historial: HistorialClinico) => {
    setSelectedHistorial(historial)
    // El backend guarda examen_clinico y tratamiento_realizado; el formulario
    // usa examen_fisico y tratamiento. Sin este mapeo, al editar esos campos
    // aparecían vacíos y lo que se escribía pisaba el texto original.
    const h = historial as HistorialClinico & { examen_clinico?: string; tratamiento_realizado?: string }
    setFormData({
      ...historial,
      examen_fisico: h.examen_clinico ?? h.examen_fisico ?? "",
      tratamiento: h.tratamiento_realizado ?? h.tratamiento ?? "",
    })
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
    if (saving) return
    const profesionalId = (formData as any).profesional_id || profesionales[0]?.id
    if (!profesionalId) {
      toast({ variant: "destructive", title: "Falta el profesional", description: "Cargá al menos un profesional activo para registrar historias clínicas." })
      return
    }
    const { profesional: _p, paciente: _pa, createdAt: _c, updatedAt: _u, examen_fisico, tratamiento, ...resto } = formData as any
    const payload = {
      ...resto,
      profesional_id: profesionalId,
      // Se mandan aunque estén vacíos para que el usuario pueda borrarlos.
      examen_clinico: examen_fisico ?? null,
      tratamiento_realizado: tratamiento ?? null,
    }
    try {
      setSaving(true)
      if (modalMode === "create") {
        await historialesClinicosApi.crear(payload)
      } else if (modalMode === "edit" && selectedHistorial) {
        await historialesClinicosApi.actualizar(selectedHistorial.id, payload)
      }
      setShowModal(false)
      fetchHistoriales()
      toast({ title: modalMode === "create" ? "Registro creado" : "Cambios guardados" })
    } catch (error) {
      toast({ variant: "destructive", title: "No se pudo guardar", description: error instanceof Error ? error.message : "Intentá de nuevo." })
    } finally {
      setSaving(false)
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
                      {formatLocalDate(historial.fecha, { day: "2-digit", month: "2-digit", year: "numeric" }, "es-ES")}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "view"
                  ? "Ver Historia Clínica"
                  : modalMode === "create"
                    ? "Nueva Historia Clínica"
                    : "Editar Historia Clínica"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {modalMode === "view" && selectedHistorial ? (
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="font-medium">{formatLocalDate(selectedHistorial.fecha, { day: "2-digit", month: "2-digit", year: "numeric" }, "es-ES")}</p>
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
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesional que atendió *</label>
                  <select
                    required
                    value={(formData as any).profesional_id || ""}
                    onChange={(e) => setFormData({ ...formData, profesional_id: Number(e.target.value) } as Partial<CrearHistorialClinicoData>)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>Elegí un profesional</option>
                    {profesionales.map((p) => <option key={p.id} value={p.id}>{nombreProfesional(p)}</option>)}
                  </select>
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

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? "Guardando..." : modalMode === "create" ? "Crear Registro" : "Guardar Cambios"}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
