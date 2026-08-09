"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Plus, Save, X, Calendar, Trash2, Eye, Edit3, ArrowUp, ArrowDown, Eraser, ChevronDown } from "lucide-react"
import { odontogramasApi } from "../../api/odontogramas"
import type { DientesData, DatosDiente } from "../../api/odontogramas"
import type { Odontograma, CrearOdontogramaData } from "../../types"
import { useToast } from "../../hooks/use-toast"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import { todayISO, formatLocalDate } from "../../utils/date"
import { getDienteImageSrc } from "../../utils/dienteImages"
import { ToothAnatomicalSVG } from "./ToothAnatomicalSVG"

interface OdontogramSectionProps {
  pacienteId: string | number
}

const DIENTES_SUPERIORES = [
  "1.8", "1.7", "1.6", "1.5", "1.4", "1.3", "1.2", "1.1",
  "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"
]

const DIENTES_INFERIORES = [
  "4.8", "4.7", "4.6", "4.5", "4.4", "4.3", "4.2", "4.1",
  "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"
]

const DIENTES_TEMPORARIOS_SUPERIORES = [
  "5.5", "5.4", "5.3", "5.2", "5.1", "6.1", "6.2", "6.3", "6.4", "6.5"
]

const DIENTES_TEMPORARIOS_INFERIORES = [
  "8.5", "8.4", "8.3", "8.2", "8.1", "7.1", "7.2", "7.3", "7.4", "7.5"
]

const TRATAMIENTOS = [
  { value: "corona", label: "Corona" },
  { value: "implante", label: "Implante" },
  { value: "ausente", label: "Ausente" },
  { value: "extraccion", label: "Extracción" },
  { value: "aparato_ortodontico_fijo", label: "Aparato ortodóntico fijo" },
  { value: "aparato_ortodontico_removible", label: "Aparato ortodóntico removible" },
  { value: "puente", label: "Puente" },
  { value: "poste", label: "Poste" },
  { value: "tratamiento_endodontico", label: "Tratamiento endodóntico (conducto)" },
  { value: "perno", label: "Perno" },
  { value: "protesis_total_removible", label: "Prótesis total removible" },
  { value: "protesis_parcial_removible", label: "Prótesis parcial removible" },
  { value: "fractura", label: "Fractura" },
  { value: "resto_radicular", label: "Resto radicular" },
  { value: "caries", label: "Caries" },
  { value: "intrusion", label: "Intrusión" },
  { value: "extrusion", label: "Extrusión" },
  { value: "giroversion_antihoraria", label: "Giroversión antihoraria" },
  { value: "giroversion_horaria", label: "Giroversión horaria" },
  { value: "migracion_derecha", label: "Migración derecha" },
  { value: "migracion_izquierda", label: "Migración izquierda" },
  { value: "incrustacion", label: "Incrustación" },
  { value: "restauracion", label: "Restauración" },
  { value: "sellador", label: "Sellador" },
  { value: "carilla", label: "Carilla" },
  { value: "superficie_desgastada", label: "Superficie desgastada" },
  { value: "diastema", label: "Diastema" },
  { value: "supernumerario", label: "Supernumerario" },
  { value: "erupcion_up", label: "Erupción (Arriba)" },
  { value: "erupcion_down", label: "Erupción (Abajo)" },
]

type EstadoTipo = "buen_estado" | "mal_estado"

const ESTADO_COLORS: Record<EstadoTipo, string> = {
  buen_estado: "#2563EB",
  mal_estado: "#EF4444",
}

const TIPO_BADGE_STYLES: Record<string, string> = {
  Inicial: "bg-blue-50 text-blue-700 border-blue-200",
  Control: "bg-amber-50 text-amber-700 border-amber-200",
  Tratamiento: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

export const OdontogramSection: React.FC<OdontogramSectionProps> = ({ pacienteId }) => {
  const [odontogramas, setOdontogramas] = useState<Odontograma[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("view")
  const [selectedOdontograma, setSelectedOdontograma] = useState<Odontograma | null>(null)
  const [dientesData, setDientesData] = useState<DientesData>({})
  const [observaciones, setObservaciones] = useState("")
  const [tipo, setTipo] = useState<"Inicial" | "Control" | "Tratamiento">("Inicial")
  const [profesionalActual] = useState(1)
  const [mostrarTemporarios, setMostrarTemporarios] = useState(false)

  const [selectedTratamiento, setSelectedTratamiento] = useState<string>("")
  const [selectedEstado, setSelectedEstado] = useState<EstadoTipo>("mal_estado")
  const [isBorrarMode, setIsBorrarMode] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOdontogramas()
  }, [pacienteId])

  const fetchOdontogramas = async () => {
    try {
      setLoading(true)
      const data = await odontogramasApi.listar(pacienteId)
      setOdontogramas(data)
    } catch (error) {
      console.error("Error fetching odontogramas:", error)
    } finally {
      setLoading(false)
    }
  }

  const inicializarDientesVacios = async () => {
    try {
      const response = await odontogramasApi.inicializar()
      setDientesData(response.dientes_data)
    } catch (error) {
      console.error("Error inicializando dientes:", error)
      const todosLosDientes = [
        ...DIENTES_SUPERIORES, ...DIENTES_TEMPORARIOS_SUPERIORES,
        ...DIENTES_TEMPORARIOS_INFERIORES, ...DIENTES_INFERIORES,
      ]
      const dientesVacios: DientesData = {}
      todosLosDientes.forEach((diente) => {
        dientesVacios[diente] = {
          estado: "sano",
          superficies: { oclusal: "sano", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" },
          notas: "",
        }
      })
      setDientesData(dientesVacios)
    }
  }

  const handleCreate = () => {
    inicializarDientesVacios()
    setObservaciones("")
    setTipo("Inicial")
    setSelectedTratamiento("")
    setSelectedEstado("mal_estado")
    setIsBorrarMode(false)
    setModalMode("create")
    setShowModal(true)
  }

  const handleEdit = (odontograma: Odontograma) => {
    setSelectedOdontograma(odontograma)
    setDientesData(odontograma.dientes_data)
    setObservaciones(odontograma.observaciones || "")
    setTipo(odontograma.tipo)
    setSelectedTratamiento("")
    setSelectedEstado("mal_estado")
    setIsBorrarMode(false)
    setModalMode("edit")
    setShowModal(true)
  }

  const handleView = (odontograma: Odontograma) => {
    setSelectedOdontograma(odontograma)
    setDientesData(odontograma.dientes_data)
    setObservaciones(odontograma.observaciones || "")
    setTipo(odontograma.tipo)
    setModalMode("view")
    setShowModal(true)
  }

  const handleDelete = (id: string | number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este odontograma?",
      onConfirm: async () => {
        try {
          await odontogramasApi.eliminar(Number(id))
          fetchOdontogramas()
        } catch (error) {
          console.error("Error deleting odontograma:", error)
        }
        setConfirmAction(null)
      }
    })
  }

  const handleSuperficieClick = (numeroDiente: string, superficie: string) => {
    if (modalMode === "view") return

    if (isBorrarMode) {
      setDientesData((prev) => {
        const currentData = prev[numeroDiente] || {
          estado: "sano",
          superficies: { oclusal: "sano", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" },
          notas: "",
        }
        const newSuperficies = { ...currentData.superficies, [superficie]: "sano" }
        const allSano = Object.values(newSuperficies).every(s => s === "sano")
        return {
          ...prev,
          [numeroDiente]: {
            ...currentData,
            estado: allSano ? "sano" : currentData.estado,
            superficies: newSuperficies,
            tratamientos: {
              ...currentData.tratamientos,
              [superficie]: undefined,
            }
          },
        }
      })
      return
    }

    if (!selectedTratamiento) return

    setDientesData((prev) => {
      const currentData = prev[numeroDiente] || {
        estado: "sano",
        superficies: { oclusal: "sano", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" },
        notas: "",
      }
      const newSuperficies = { ...currentData.superficies, [superficie]: selectedEstado }
      return {
        ...prev,
        [numeroDiente]: {
          ...currentData,
          estado: selectedEstado,
          superficies: newSuperficies,
          tratamientos: {
            ...currentData.tratamientos,
            [superficie]: { tratamiento: selectedTratamiento, estado: selectedEstado },
          }
        },
      }
    })
  }

  const handleDienteClick = (numeroDiente: string) => {
    if (modalMode === "view") return

    if (isBorrarMode) {
      setDientesData((prev) => {
        const currentData = prev[numeroDiente]
        if (!currentData) return prev
        return {
          ...prev,
          [numeroDiente]: {
            ...currentData,
            estado: "sano",
            tratamiento_general: undefined
          }
        }
      })
      return
    }

    if (!selectedTratamiento) return

    const tratamientosGenerales = ["ausente", "corona", "implante", "extraccion", "caries", "restauracion", "erupcion_up", "erupcion_down", "extrusion", "intrusion", "tratamiento_endodontico"]
    if (!tratamientosGenerales.includes(selectedTratamiento)) return

    setDientesData((prev) => {
      const currentData = prev[numeroDiente] || {
        estado: "sano",
        superficies: { oclusal: "sano", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" },
        notas: "",
      }
      return {
        ...prev,
        [numeroDiente]: {
          ...currentData,
          estado: selectedEstado,
          tratamiento_general: { tratamiento: selectedTratamiento, estado: selectedEstado }
        },
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const dataToSend: CrearOdontogramaData = {
        paciente_id: String(pacienteId),
        profesional_id: profesionalActual,
        fecha: todayISO(),
        dientes_data: dientesData,
        observaciones: observaciones,
        tipo: tipo,
      }

      if (modalMode === "create") {
        await odontogramasApi.crear(dataToSend)
      } else if (modalMode === "edit" && selectedOdontograma) {
        await odontogramasApi.actualizar(selectedOdontograma.id, dataToSend)
      }

      setShowModal(false)
      fetchOdontogramas()
    } catch (error) {
      console.error("Error saving odontograma:", error)
      toast({ variant: "destructive", title: "Error", description: "Error al guardar el odontograma" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#2563FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#0A0F2D]">Odontogramas</h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Odontograma
        </Button>
      </div>

      {odontogramas.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-6 w-6 text-[#2563FF]" />
          </div>
          <p className="text-gray-500 mb-4">No hay odontogramas registrados</p>
          <Button onClick={handleCreate} variant="outline" size="sm">
            Crear primer odontograma
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {odontogramas.map((odontograma) => (
            <div
              key={odontograma.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#2563FF]/20 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => handleView(odontograma)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Calendar className="h-4 w-4 text-[#2563FF]" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#0A0F2D]">
                      {formatLocalDate(odontograma.fecha, { day: "numeric", month: "long", year: "numeric" }, "es-ES")}
                    </span>
                    {odontograma.observaciones && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{odontograma.observaciones}</p>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${TIPO_BADGE_STYLES[odontograma.tipo] || TIPO_BADGE_STYLES.Inicial}`}>
                    {odontograma.tipo}
                  </span>
                </div>
                <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleView(odontograma)} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[#2563FF] transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleEdit(odontograma)} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[#2563FF] transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(odontograma.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
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

      {/* ══════════════════════════════════════ MODAL ══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl max-w-[1400px] w-full h-full sm:h-[90vh] overflow-hidden flex flex-col border border-gray-100">

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-[#0A0F2D] to-[#1a2456] px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {modalMode === "view" ? "Ver Odontograma" : modalMode === "create" ? "Nuevo Odontograma" : "Editar Odontograma"}
                  </h3>
                  {selectedOdontograma && (
                    <p className="text-xs sm:text-sm text-blue-200/60">
                      {formatLocalDate(selectedOdontograma.fecha, { day: "numeric", month: "long", year: "numeric" }, "es-ES")}
                    </p>
                  )}
                </div>
                {modalMode !== "view" && (
                  <div className="relative">
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as "Inicial" | "Control" | "Tratamiento")}
                      className="appearance-none pl-3 pr-7 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563FF] cursor-pointer"
                    >
                      <option value="Inicial" className="text-gray-900">Inicial</option>
                      <option value="Control" className="text-gray-900">Control</option>
                      <option value="Tratamiento" className="text-gray-900">Tratamiento</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60 pointer-events-none" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                {modalMode !== "view" && (
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563FF] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Guardar</span>
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>
            </div>

            {/* ── Toolbar ── */}
            {modalMode !== "view" && (
              <div className="bg-white px-3 sm:px-6 py-2.5 border-b border-gray-100 flex items-center gap-2 flex-wrap shrink-0">
                {/* Temporarios toggle */}
                <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                  <input
                    type="checkbox"
                    checked={mostrarTemporarios}
                    onChange={(e) => setMostrarTemporarios(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#2563FF] border-gray-300 rounded focus:ring-[#2563FF]"
                  />
                  <span className="text-gray-700">Temporarios</span>
                </label>

                <div className="hidden sm:block w-px h-8 bg-gray-200" />

                {/* Borrar */}
                <button
                  onClick={() => { setIsBorrarMode(!isBorrarMode); if (!isBorrarMode) setSelectedTratamiento("") }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isBorrarMode
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Borrar
                </button>

                <div className="hidden sm:block w-px h-8 bg-gray-200" />

                {/* Treatment selector */}
                <div className="relative w-full sm:flex-1 sm:max-w-xs">
                  <select
                    value={selectedTratamiento}
                    onChange={(e) => {
                      setSelectedTratamiento(e.target.value)
                      if (e.target.value) setIsBorrarMode(false)
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all cursor-pointer"
                  >
                    <option value="">Seleccionar tratamiento...</option>
                    {TRATAMIENTOS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>

                {selectedTratamiento && (
                  <button onClick={() => setSelectedTratamiento("")} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                )}

                <div className="hidden sm:block w-px h-8 bg-gray-200" />

                {/* Estado toggles */}
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setSelectedEstado("buen_estado")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedEstado === "buen_estado"
                        ? "bg-[#2563FF] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedEstado === "buen_estado" ? "bg-white" : "bg-[#2563FF]"}`} />
                    Buen estado
                  </button>
                  <button
                    onClick={() => setSelectedEstado("mal_estado")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l transition-all ${
                      selectedEstado === "mal_estado"
                        ? "bg-[#EF4444] text-white border-[#EF4444]"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedEstado === "mal_estado" ? "bg-white" : "bg-[#EF4444]"}`} />
                    Mal estado
                  </button>
                </div>

                {selectedTratamiento && (
                  <span className="text-[10px] text-gray-400 w-full sm:w-auto mt-1 sm:mt-0">
                    Hacé click en las superficies para aplicar
                  </span>
                )}
              </div>
            )}

            {modalMode === "view" && (
              <div className="bg-white px-4 sm:px-6 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${TIPO_BADGE_STYLES[tipo] || TIPO_BADGE_STYLES.Inicial}`}>
                    {tipo}
                  </span>
                </div>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                  <input
                    type="checkbox"
                    checked={mostrarTemporarios}
                    onChange={(e) => setMostrarTemporarios(e.target.checked)}
                    className="w-4 h-4 text-[#2563FF] border-gray-300 rounded focus:ring-[#2563FF]"
                  />
                  <span className="text-gray-700">Temporarios</span>
                </label>
              </div>
            )}

            {/* ── Dental Chart ── */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#FAFCFF]">
              <div className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto pb-6 custom-scrollbar">
                  <div className="min-w-[950px] lg:min-w-0 flex flex-col items-center">
                    {/* Upper teeth */}
                <div className="mb-2">
                  <div className="flex justify-center gap-0.5 xl:gap-1">
                    {DIENTES_SUPERIORES.map((num) => (
                      <DienteVisual
                        key={num}
                        numero={num}
                        datos={dientesData[num]}
                        esSuperior={true}
                        isReadOnly={modalMode === "view"}
                        onSuperficieClick={(superficie) => handleSuperficieClick(num, superficie)}
                        onDienteClick={() => handleDienteClick(num)}
                        isBorrarMode={isBorrarMode}
                        hasActiveTratamiento={!!selectedTratamiento || isBorrarMode}
                      />
                    ))}
                  </div>
                </div>

                {/* Temporary upper */}
                {mostrarTemporarios && (
                  <div className="mb-2 pt-3 border-t border-dashed border-gray-200">
                    <div className="flex justify-center gap-0.5 xl:gap-1">
                      {DIENTES_TEMPORARIOS_SUPERIORES.map((num) => (
                        <DienteVisual
                          key={num}
                          numero={num}
                          datos={dientesData[num]}
                          esSuperior={true}
                          isReadOnly={modalMode === "view"}
                          onSuperficieClick={(superficie) => handleSuperficieClick(num, superficie)}
                          onDienteClick={() => handleDienteClick(num)}
                          isBorrarMode={isBorrarMode}
                          hasActiveTratamiento={!!selectedTratamiento || isBorrarMode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="flex items-center gap-6 bg-white px-6">
                      <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Derecha</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Izquierda</span>
                    </div>
                  </div>
                </div>

                {/* Temporary lower */}
                {mostrarTemporarios && (
                  <div className="mb-2 pb-3 border-b border-dashed border-gray-200">
                    <div className="flex justify-center gap-0.5 xl:gap-1">
                      {DIENTES_TEMPORARIOS_INFERIORES.map((num) => (
                        <DienteVisual
                          key={num}
                          numero={num}
                          datos={dientesData[num]}
                          esSuperior={false}
                          isReadOnly={modalMode === "view"}
                          onSuperficieClick={(superficie) => handleSuperficieClick(num, superficie)}
                          onDienteClick={() => handleDienteClick(num)}
                          isBorrarMode={isBorrarMode}
                          hasActiveTratamiento={!!selectedTratamiento || isBorrarMode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Lower teeth */}
                <div>
                  <div className="flex justify-center gap-0.5 xl:gap-1">
                    {DIENTES_INFERIORES.map((num) => (
                      <DienteVisual
                        key={num}
                        numero={num}
                        datos={dientesData[num]}
                        esSuperior={false}
                        isReadOnly={modalMode === "view"}
                        onSuperficieClick={(superficie) => handleSuperficieClick(num, superficie)}
                        onDienteClick={() => handleDienteClick(num)}
                        isBorrarMode={isBorrarMode}
                        hasActiveTratamiento={!!selectedTratamiento || isBorrarMode}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

              {/* Observaciones + Legend row */}
              <div className="mt-5 flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm disabled:bg-gray-50/50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2563FF]/10 focus:border-[#2563FF] transition-all resize-none min-h-[100px]"
                    rows={4}
                    placeholder="Observaciones generales del odontograma..."
                  />
                </div>
                <div className="lg:w-72 shrink-0">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Leyenda
                  </label>
                  <div className="bg-white rounded-xl border border-gray-200/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#2563FF] shadow-sm shadow-blue-200" />
                      <span className="text-sm font-medium text-gray-600">Buen estado</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] shadow-sm shadow-red-200" />
                      <span className="text-sm font-medium text-gray-600">Mal estado</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-200" />
                      <span className="text-sm font-medium text-gray-600">Sano / Sin tratamiento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Diente Visual Component ───────────────────────────────────────────
interface DienteVisualProps {
  numero: string
  datos?: DatosDiente
  esSuperior: boolean
  isReadOnly: boolean
  onSuperficieClick: (superficie: string) => void
  onDienteClick: () => void
  isBorrarMode: boolean
  hasActiveTratamiento: boolean
}

const DienteVisual: React.FC<DienteVisualProps> = ({
  numero,
  datos,
  esSuperior,
  isReadOnly,
  onSuperficieClick,
  onDienteClick,
  isBorrarMode,
  hasActiveTratamiento,
}) => {
  const [imgError, setImgError] = useState(false)
  const imageSrc = getDienteImageSrc(numero)

  const canClick = !isReadOnly && hasActiveTratamiento
  const cursorClass = canClick ? "cursor-pointer" : "cursor-default"

  const renderToothImage = () => {
    const tratamientoGral = datos?.tratamiento_general?.tratamiento || (datos?.estado !== "sano" ? datos?.estado : null)
    const color = datos?.tratamiento_general?.estado === "buen_estado" ? ESTADO_COLORS.buen_estado : ESTADO_COLORS.mal_estado

    return (
      <div
        className={`w-10 h-14 relative flex items-center justify-center ${canClick ? "hover:scale-105 transition-transform" : ""}`}
        onClick={(e) => {
          e.stopPropagation()
          if (canClick) onDienteClick()
        }}
      >
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt={`Diente ${numero}`}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
            style={{
              filter: tratamientoGral === "ausente" || tratamientoGral === "extraccion" ? "opacity(0.15) grayscale(1)" : "none"
            }}
          />
        ) : (
          <svg viewBox="0 0 48 64" className="w-full h-full" style={{ opacity: tratamientoGral ? 0.2 : 1 }}>
            {esSuperior ? (
              <>
                <path d="M 16 28 L 24 8 L 32 28 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
                <rect x="12" y="28" width="24" height="28" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <rect x="12" y="8" width="24" height="28" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
                <path d="M 16 36 L 24 56 L 32 36 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
              </>
            )}
          </svg>
        )}

        {/* Overlay symbols */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {tratamientoGral === "ausente" && (
            <div className="w-full h-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 rotate-45" style={{ backgroundColor: color }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 -rotate-45" style={{ backgroundColor: color }} />
            </div>
          )}
          {tratamientoGral === "extraccion" && (
            <div className="flex flex-col gap-1 items-center">
              <div className="w-7 h-1" style={{ backgroundColor: color }} />
              <div className="w-7 h-1" style={{ backgroundColor: color }} />
            </div>
          )}
          {tratamientoGral === "corona" && (
            <div className="w-9 h-9 rounded-full border-[3px]" style={{ borderColor: color }} />
          )}
          {tratamientoGral === "caries" && (
            <div className="w-5 h-5 rounded-full bg-gray-800/80" />
          )}
          {tratamientoGral === "restauracion" && (
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color, opacity: 0.8 }} />
          )}
          {tratamientoGral === "implante" && (
            <div className="flex flex-col items-center">
              <div className="w-5 h-1.5 bg-gray-700 rounded-t-full" />
              <div className="w-3 h-6 bg-gray-700" />
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-gray-700" />
            </div>
          )}
          {tratamientoGral === "tratamiento_endodontico" && (
            <div className="w-0.5 h-10 rounded-full" style={{ backgroundColor: color }} />
          )}
        </div>
      </div>
    )
  }

  const renderSurfaceSVG = () => (
    <div className="w-[56px] h-[56px]">
      <ToothAnatomicalSVG
        numero={numero}
        esSuperior={esSuperior}
        datos={datos}
        isReadOnly={isReadOnly || !hasActiveTratamiento}
        onSuperficieClick={onSuperficieClick}
        onDienteClick={onDienteClick}
        estadoColors={ESTADO_COLORS}
      />
    </div>
  )

  return (
    <div className={`relative flex flex-col items-center group shrink-0 ${cursorClass}`}>
      {/* Erupción / Extrusión arrows */}
      {(datos?.tratamiento_general?.tratamiento === "erupcion_up" || datos?.tratamiento_general?.tratamiento === "extrusion") && (
        <ArrowUp className="w-4 h-4 absolute -top-4" style={{ color: datos?.tratamiento_general?.estado === "buen_estado" ? ESTADO_COLORS.buen_estado : ESTADO_COLORS.mal_estado }} />
      )}
      {(datos?.tratamiento_general?.tratamiento === "erupcion_down" || datos?.tratamiento_general?.tratamiento === "intrusion") && (
        <ArrowDown className="w-4 h-4 absolute -top-4" style={{ color: datos?.tratamiento_general?.estado === "buen_estado" ? ESTADO_COLORS.buen_estado : ESTADO_COLORS.mal_estado }} />
      )}

      {esSuperior ? (
        <>
          {renderToothImage()}
          <div className="text-center text-[9px] font-bold text-gray-400 my-0.5 group-hover:text-[#2563FF] transition-colors">{numero}</div>
          {renderSurfaceSVG()}
        </>
      ) : (
        <>
          {renderSurfaceSVG()}
          <div className="text-center text-[9px] font-bold text-gray-400 my-0.5 group-hover:text-[#2563FF] transition-colors">{numero}</div>
          {renderToothImage()}
        </>
      )}
    </div>
  )
}
