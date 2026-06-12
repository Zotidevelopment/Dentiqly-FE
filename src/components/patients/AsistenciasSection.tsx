import React, { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import {
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  FolderArchive,
  FolderOpen,
  Settings,
  Plus,
  Loader2,
  Calendar,
  CheckCircle,
  FileText,
  X
} from "lucide-react"
import { asistenciasApi, AsistenciaCiclo } from "../../api/asistencias"
import { useToast } from "../../hooks/use-toast"

interface AsistenciasSectionProps {
  pacienteId: string
}

export const AsistenciasSection: React.FC<AsistenciasSectionProps> = ({ pacienteId }) => {
  const [cycles, setCycles] = useState<AsistenciaCiclo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({})
  
  // Edición del ciclo
  const [editingLimitId, setEditingLimitId] = useState<number | null>(null)
  const [newLimit, setNewLimit] = useState(10)
  const [newObservaciones, setNewObservaciones] = useState("")
  const [showConfig, setShowConfig] = useState(false)
  
  // Nuevo ciclo manual
  const [creatingCycle, setCreatingCycle] = useState(false)
  const [manualLimit, setManualLimit] = useState(10)
  const [manualObs, setManualObs] = useState("")

  const { toast } = useToast()

  const loadCycles = async () => {
    setLoading(true)
    try {
      const data = await asistenciasApi.listarCiclos(pacienteId)
      setCycles(data)
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al cargar asistencias",
        description: err.message || "Por favor intente nuevamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pacienteId) {
      loadCycles()
    }
  }, [pacienteId])

  const toggleFolder = (id: number) => {
    setExpandedFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Finalizar / archivar ciclo
  const handleArchive = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea finalizar y archivar este ciclo? Se iniciará un nuevo ciclo de asistencias desde 0.")) return

    try {
      await asistenciasApi.archivarCicloManual(id)
      toast({
        title: "Ciclo archivado",
        description: "El ciclo ha sido completado y archivado. Las próximas asistencias se contarán en un nuevo ciclo."
      })
      loadCycles()
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al archivar ciclo",
        description: err.message || "No se pudo archivar el ciclo.",
        variant: "destructive"
      })
    }
  }

  // Crear ciclo manual
  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await asistenciasApi.crearCicloManual({
        paciente_id: pacienteId,
        sesiones_totales: manualLimit,
        observaciones: manualObs
      })
      toast({
        title: "Nuevo ciclo de asistencias iniciado",
        description: `Se ha iniciado un nuevo ciclo con un límite de ${manualLimit} sesiones.`
      })
      setCreatingCycle(false)
      setManualLimit(10)
      setManualObs("")
      loadCycles()
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al crear ciclo",
        description: err.message || "No se pudo iniciar el ciclo.",
        variant: "destructive"
      })
    }
  }

  // Actualizar ciclo
  const handleUpdateCiclo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingLimitId === null) return

    try {
      await asistenciasApi.actualizarCiclo(editingLimitId, {
        sesiones_totales: newLimit,
        observaciones: newObservaciones
      })
      toast({
        title: "Configuración actualizada",
        description: "Los parámetros del ciclo de asistencia han sido guardados."
      })
      setShowConfig(false)
      setEditingLimitId(null)
      loadCycles()
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al guardar cambios",
        description: err.message || "No se pudo actualizar el ciclo.",
        variant: "destructive"
      })
    }
  }

  const activeCycle = cycles.find(c => c.estado === "Activo")
  const archivedCycles = cycles.filter(c => c.estado === "Completado")

  const handleOpenConfig = (cycle: AsistenciaCiclo) => {
    setEditingLimitId(cycle.id)
    setNewLimit(cycle.sesiones_totales)
    setNewObservaciones(cycle.observaciones || "")
    setShowConfig(true)
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-[#E8E0D6] rounded-2xl">
        <Loader2 className="h-8 w-8 text-[#2563FF] animate-spin" />
        <span className="text-sm font-semibold text-gray-500">Cargando historial de asistencias...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ═══ ACTIVE CYCLE SECTION ═══ */}
      <Card className="p-6 border border-[#E8E0D6] rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D6]/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563FF]/10 flex items-center justify-center text-[#2563FF]">
              <CalendarCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900 leading-snug">Ciclo de Asistencias Activo</h2>
              <p className="text-xs text-[#8A93A8]">Seguimiento de sesiones ordenadas por el médico.</p>
            </div>
          </div>

          {activeCycle && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleOpenConfig(activeCycle)}
                variant="outline"
                className="py-1.5 px-3.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 border-[#E8E0D6] hover:bg-gray-50 hover:text-gray-900"
              >
                <Settings className="h-3.5 w-3.5 text-gray-400" />
                Configurar Límite
              </Button>
              <Button
                onClick={() => handleArchive(activeCycle.id)}
                className="bg-[#0B1023] hover:bg-[#1A2542] text-white py-1.5 px-3.5 text-xs font-semibold rounded-xl"
              >
                Finalizar Ciclo
              </Button>
            </div>
          )}
        </div>

        {activeCycle ? (
          <div className="space-y-5">
            {/* Progreso Visual */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-sm">
                <span className="font-extrabold text-gray-800">
                  Sesiones Completadas: <span className="text-[#2563FF]">{activeCycle.sesiones_completadas}</span> / {activeCycle.sesiones_totales}
                </span>
                <span className="text-xs font-bold text-[#8A93A8]">
                  {Math.round((activeCycle.sesiones_completadas / activeCycle.sesiones_totales) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100/50 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2563FF] to-[#02E3FF] transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, (activeCycle.sesiones_completadas / activeCycle.sesiones_totales) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fechas e Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#8A93A8]" />
                <span>Inicio del ciclo: <strong className="text-gray-800">{activeCycle.fecha_inicio ? new Date(activeCycle.fecha_inicio + 'T12:00:00').toLocaleDateString("es-AR") : "Sin sesiones"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-[#8A93A8]" />
                <span>Última sesión: <strong className="text-gray-800">{activeCycle.fecha_fin ? new Date(activeCycle.fecha_fin + 'T12:00:00').toLocaleDateString("es-AR") : "Sin sesiones"}</strong></span>
              </div>
              {activeCycle.observaciones && (
                <div className="flex items-start gap-2 col-span-1 md:col-span-3 pt-2.5 border-t border-gray-200/50">
                  <FileText className="h-4 w-4 text-[#8A93A8] shrink-0 mt-0.5" />
                  <span className="font-normal text-gray-500">Notas: <strong className="font-semibold text-gray-700">{activeCycle.observaciones}</strong></span>
                </div>
              )}
            </div>

            {/* Turnos Atendidos */}
            <div className="space-y-3.5">
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Historial de sesiones del ciclo</h4>
              {!activeCycle.turnos || activeCycle.turnos.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay visitas marcadas como 'Atendido' en este ciclo todavía.</p>
              ) : (
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white">
                  {activeCycle.turnos.map((t, idx) => (
                    <div key={t.id} className="p-3 sm:px-4 flex items-center justify-between text-sm hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-bold text-xs border border-green-100 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="font-bold text-gray-800">
                            {new Date(t.fecha + 'T12:00:00').toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                          </span>
                          <span className="hidden sm:inline text-gray-300">|</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {t.hora_inicio.substring(0,5)} hs
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200/50 py-1 px-2.5 rounded-lg">
                        {t.profesional ? `${t.profesional.nombre} ${t.profesional.apellido}` : "Profesional"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center p-6">
            <p className="text-sm text-gray-500 font-medium">No hay ningún ciclo activo abierto para este paciente.</p>
            <Button
              onClick={() => setCreatingCycle(true)}
              className="mt-4 bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold py-1.5 px-4 text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Iniciar Ciclo
            </Button>
          </div>
        )}
      </Card>

      {/* ═══ HISTORICAL ARCHIVED CYCLES ═══ */}
      <Card className="p-6 border border-[#E8E0D6] rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#E8E0D6]/60 pb-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <FolderArchive className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-[15px] font-extrabold text-gray-900 leading-snug">Ciclos Completados (Historial)</h2>
            <p className="text-xs text-[#8A93A8]">Carpetas de sesiones completadas anteriormente.</p>
          </div>
        </div>

        {archivedCycles.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-6">No hay ciclos archivados en el historial de este paciente.</p>
        ) : (
          <div className="space-y-3">
            {archivedCycles.map((c, idx) => {
              const isExpanded = !!expandedFolders[c.id]
              return (
                <div key={c.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-gray-200 transition-all shadow-sm">
                  {/* Folder Header */}
                  <button
                    onClick={() => toggleFolder(c.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <FolderOpen className="h-5.5 w-5.5 text-amber-500 shrink-0" />
                      ) : (
                        <FolderArchive className="h-5.5 w-5.5 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <span className="text-sm font-extrabold text-gray-800">
                          Ciclo #{archivedCycles.length - idx} - {c.sesiones_completadas} sesiones
                        </span>
                        <div className="text-[11px] text-gray-400 font-semibold mt-0.5">
                          {c.fecha_inicio ? new Date(c.fecha_inicio + 'T12:00:00').toLocaleDateString("es-AR") : "?"} al {c.fecha_fin ? new Date(c.fecha_fin + 'T12:00:00').toLocaleDateString("es-AR") : "?"}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>

                  {/* Folded Content */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
                      {c.observaciones && (
                        <div className="bg-white border border-gray-100 rounded-xl p-3 text-xs text-gray-600">
                          <strong className="block text-gray-700 mb-0.5">Observaciones:</strong>
                          {c.observaciones}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Detalle de visitas</span>
                        {!c.turnos || c.turnos.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No hay registros de turnos en este ciclo.</p>
                        ) : (
                          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                            {c.turnos.map((t, tIdx) => (
                              <div key={t.id} className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                  <span className="font-bold text-gray-700">
                                    {new Date(t.fecha + 'T12:00:00').toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                </div>
                                <span className="text-gray-500 font-medium">
                                  {t.profesional ? `${t.profesional.nombre} ${t.profesional.apellido}` : "Profesional"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* ═══ MODAL CONFIG LIMIT (Active Cycle) ═══ */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Settings className="h-4.5 w-4.5 text-[#2563FF]" />
                Ajustar Ciclo
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCiclo} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Sesiones Totales del Ciclo</label>
                <input
                  type="number"
                  min={1}
                  value={newLimit}
                  onChange={(e) => setNewLimit(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 text-gray-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notas / Indicación Médica</label>
                <textarea
                  rows={3}
                  placeholder="Ej: Orden médica autorizada por 10 sesiones, kinesiología..."
                  value={newObservaciones}
                  onChange={(e) => setNewObservaciones(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 text-gray-800"
                />
              </div>
              <div className="flex items-center justify-end gap-3.5 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  variant="outline"
                  className="rounded-xl px-4 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl px-5 py-2 text-xs"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL CREATE NEW CYCLE MANUAL ═══ */}
      {creatingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5 text-[#2563FF]" />
                Nuevo Ciclo de Asistencia
              </h3>
              <button
                onClick={() => setCreatingCycle(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCycle} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Sesiones Totales del Ciclo</label>
                <input
                  type="number"
                  min={1}
                  value={manualLimit}
                  onChange={(e) => setManualLimit(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 text-gray-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notas / Indicación Médica</label>
                <textarea
                  rows={3}
                  placeholder="Ej: Autorizado por 10 sesiones, obra social..."
                  value={manualObs}
                  onChange={(e) => setManualObs(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 text-gray-800"
                />
              </div>
              <div className="flex items-center justify-end gap-3.5 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={() => setCreatingCycle(false)}
                  variant="outline"
                  className="rounded-xl px-4 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl px-5 py-2 text-xs"
                >
                  Iniciar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
