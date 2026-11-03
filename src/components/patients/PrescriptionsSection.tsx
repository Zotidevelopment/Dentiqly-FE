"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Plus, Edit, Trash2, Calendar, X, Pill } from "lucide-react"
import { prescripcionesApi } from "../../api"
import { useToast } from "../../hooks/use-toast"
import { useProfesionalesActivos, nombreProfesional } from "./useProfesionalesActivos"

interface Medicamento { medicamento: string; dosis: string; frecuencia: string; duracion: string }
const MEDICAMENTO_VACIO: Medicamento = { medicamento: "", dosis: "", frecuencia: "", duracion: "" }
import type { Prescripcion, CrearPrescripcionData } from "../../types"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import { todayISO, formatLocalDate } from "../../utils/date"

interface PrescriptionsSectionProps {
  pacienteId: string | number
}

export const PrescriptionsSection: React.FC<PrescriptionsSectionProps> = ({ pacienteId }) => {
  const [prescripciones, setPrescripciones] = useState<Prescripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("view")
  const [selectedPrescripcion, setSelectedPrescripcion] = useState<Prescripcion | null>(null)
  const [formData, setFormData] = useState<Partial<CrearPrescripcionData>>({})
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)
  // Todos los medicamentos de la receta. Antes el formulario editaba solo el
  // primero y al guardar se perdían los demás.
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([{ ...MEDICAMENTO_VACIO }])
  const [profesionalId, setProfesionalId] = useState<number | "">("")
  const [saving, setSaving] = useState(false)
  const profesionales = useProfesionalesActivos()
  const { toast } = useToast()

  useEffect(() => {
    fetchPrescripciones()
  }, [pacienteId])

  const actualizarMedicamento = (i: number, campo: keyof Medicamento, valor: string) =>
    setMedicamentos((lista) => lista.map((m, j) => (j === i ? { ...m, [campo]: valor } : m)))

  const fetchPrescripciones = async () => {
    try {
      setLoading(true)
      const data = await prescripcionesApi.listar(pacienteId)
      setPrescripciones(data)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      paciente_id: String(pacienteId),
      fecha: todayISO(),
    })
    setMedicamentos([{ ...MEDICAMENTO_VACIO }])
    setProfesionalId(profesionales[0]?.id ?? "")
    setModalMode("create")
    setShowModal(true)
  }

  const handleEdit = (prescripcion: Prescripcion) => {
    setSelectedPrescripcion(prescripcion)
    const meds: Medicamento[] = ((prescripcion as any).medicamentos || []).map((m: any) => ({
      medicamento: m.medicamento || "", dosis: m.dosis || "", frecuencia: m.frecuencia || "", duracion: m.duracion || "",
    }))
    setMedicamentos(meds.length ? meds : [{ ...MEDICAMENTO_VACIO }])
    setProfesionalId((prescripcion as any).profesional_id ?? profesionales[0]?.id ?? "")
    setFormData({ ...prescripcion })
    setModalMode("edit")
    setShowModal(true)
  }

  const handleView = (prescripcion: Prescripcion) => {
    setSelectedPrescripcion(prescripcion)
    setModalMode("view")
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar esta prescripción?",
      onConfirm: async () => {
        try {
          await prescripcionesApi.eliminar(id)
          fetchPrescripciones()
        } catch (error) {
          console.error("Error deleting prescription:", error)
        }
        setConfirmAction(null)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    const profesional = profesionalId || profesionales[0]?.id
    if (!profesional) {
      toast({ variant: "destructive", title: "Falta el profesional", description: "Cargá al menos un profesional activo para emitir recetas." })
      return
    }
    const validos = medicamentos
      .map((m) => ({ medicamento: m.medicamento.trim(), dosis: m.dosis.trim(), frecuencia: m.frecuencia.trim(), duracion: m.duracion.trim() }))
      .filter((m) => m.medicamento)
    if (validos.length === 0) {
      toast({ variant: "destructive", title: "Falta el medicamento", description: "Cargá al menos un medicamento." })
      return
    }
    const payload: any = {
      paciente_id: formData.paciente_id,
      profesional_id: profesional,
      fecha: formData.fecha,
      medicamentos: validos,
      indicaciones: formData.indicaciones ?? null,
    }
    try {
      setSaving(true)
      if (modalMode === "create") {
        await prescripcionesApi.crear(payload)
      } else if (modalMode === "edit" && selectedPrescripcion) {
        await prescripcionesApi.actualizar(selectedPrescripcion.id, payload)
      }
      setShowModal(false)
      fetchPrescripciones()
      toast({ title: modalMode === "create" ? "Receta creada" : "Cambios guardados" })
    } catch (error) {
      toast({ variant: "destructive", title: "No se pudo guardar", description: error instanceof Error ? error.message : "Intentá de nuevo." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando prescripciones...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Prescripciones</h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Prescripción
        </Button>
      </div>

      {prescripciones.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <Pill className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No hay prescripciones registradas</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4 bg-transparent">
            Crear primera prescripción
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescripciones.map((prescripcion) => (
            <Card key={prescripcion.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1" onClick={() => handleView(prescripcion)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatLocalDate(prescripcion.fecha, { day: "2-digit", month: "2-digit", year: "numeric" }, "es-ES")}
                    </span>
                  </div>
                  {((prescripcion as any).medicamentos || []).map((med: any, idx: number) => (
                    <div key={idx} className="mb-1">
                      <p className="text-sm font-semibold text-gray-900">{med.medicamento}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                        <div><span className="font-medium">Dosis:</span> {med.dosis}</div>
                        <div><span className="font-medium">Frecuencia:</span> {med.frecuencia}</div>
                        <div><span className="font-medium">Duración:</span> {med.duracion}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(prescripcion)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(prescripcion.id)}>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center z-10 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "view"
                  ? "Ver Prescripción"
                  : modalMode === "create"
                    ? "Nueva Prescripción"
                    : "Editar Prescripción"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {modalMode === "view" && selectedPrescripcion ? (
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="font-medium">{formatLocalDate(selectedPrescripcion.fecha, { day: "2-digit", month: "2-digit", year: "numeric" }, "es-ES")}</p>
                </div>
                {((selectedPrescripcion as any).medicamentos || []).map((med: any, idx: number) => (
                  <div key={idx} className="border-b pb-3">
                    <p className="text-xs text-gray-500">Medicamento</p>
                    <p className="font-medium">{med.medicamento}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Dosis</p>
                        <p className="text-sm">{med.dosis}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Frecuencia</p>
                        <p className="text-sm">{med.frecuencia}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duración</p>
                        <p className="text-sm">{med.duracion}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedPrescripcion.indicaciones && (
                  <div>
                    <p className="text-xs text-gray-500">Indicaciones</p>
                    <p className="text-sm">{selectedPrescripcion.indicaciones}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesional que prescribe *</label>
                  <select
                    required
                    value={profesionalId}
                    onChange={(e) => setProfesionalId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>Elegí un profesional</option>
                    {profesionales.map((p) => <option key={p.id} value={p.id}>{nombreProfesional(p)}</option>)}
                  </select>
                </div>

                {medicamentos.map((med, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Medicamento {medicamentos.length > 1 ? i + 1 : ""}</span>
                      {medicamentos.length > 1 && (
                        <button type="button" onClick={() => setMedicamentos((l) => l.filter((_, j) => j !== i))}
                          className="text-xs font-semibold text-red-600 hover:underline">Quitar</button>
                      )}
                    </div>
                    <input
                      type="text"
                      required={i === 0}
                      aria-label="Medicamento"
                      value={med.medicamento}
                      onChange={(e) => actualizarMedicamento(i, "medicamento", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Ibuprofeno 600mg"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" aria-label="Dosis" value={med.dosis} onChange={(e) => actualizarMedicamento(i, "dosis", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Dosis: 1 comprimido" />
                      <input type="text" aria-label="Frecuencia" value={med.frecuencia} onChange={(e) => actualizarMedicamento(i, "frecuencia", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Cada 8 horas" />
                      <input type="text" aria-label="Duración" value={med.duracion} onChange={(e) => actualizarMedicamento(i, "duracion", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Por 7 días" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setMedicamentos((l) => [...l, { ...MEDICAMENTO_VACIO }])}
                  className="text-sm font-semibold text-blue-600 hover:underline">+ Agregar otro medicamento</button>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indicaciones</label>
                  <textarea
                    rows={3}
                    value={formData.indicaciones || ""}
                    onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Instrucciones adicionales para el paciente"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? "Guardando..." : modalMode === "create" ? "Crear Prescripción" : "Guardar Cambios"}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
