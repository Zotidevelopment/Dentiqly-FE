import React, { useState, useEffect, useRef } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import {
  Calendar,
  Search,
  Plus,
  Trash2,
  Edit2,
  FileText,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X
} from "lucide-react"
import { pacientesApi, profesionalesApi, protocolosApi } from "../../api"
import type { Paciente, Profesional } from "../../types"
import { useToast } from "../../hooks/use-toast"

interface ProtocoloTratamiento {
  id: number
  semana: string
  paciente_id?: string
  profesional_id?: number
  tratamiento?: string
  cuidado_atencion: string
  paciente?: {
    id: string
    nombre: string
    apellido: string
  }
  profesional?: {
    id: number
    nombre: string
    apellido: string
  }
}

export const ProtocolosManager: React.FC = () => {
  // Semana (Lunes)
  const [selectedMonday, setSelectedMonday] = useState<string>(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // ajustar al lunes anterior
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split("T")[0]
  })

  const [protocols, setProtocols] = useState<ProtocoloTratamiento[]>([])
  const [professionals, setProfessionals] = useState<Profesional[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filterPatientSearch, setFilterPatientSearch] = useState("")
  const [filterProfId, setFilterProfId] = useState<string>("TODOS")

  // Formulario de edición/creación
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingProtocolId, setEditingProtocolId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    paciente_id: "",
    profesional_id: "",
    tratamiento: "",
    cuidado_atencion: ""
  })

  // Búsqueda de pacientes en formulario
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [patientResults, setPatientResults] = useState<Paciente[]>([])
  const [patientSearchLoading, setPatientSearchLoading] = useState(false)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [selectedPatientObject, setSelectedPatientObject] = useState<Paciente | null>(null)
  const patientDropdownRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  // Cargar profesionales
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        const res = await profesionalesApi.listar()
        setProfessionals(res.data)
      } catch (err) {
        console.error("Error al cargar profesionales:", err)
      }
    }
    loadProfessionals()
  }, [])

  // Cargar protocolos de la semana seleccionada
  const loadProtocols = async () => {
    setLoading(true)
    try {
      const data = await protocolosApi.listar({ semana: selectedMonday })
      setProtocols(data)
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al cargar protocolos",
        description: err.message || "Por favor intente nuevamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProtocols()
  }, [selectedMonday])

  // Autocomplete de búsqueda de pacientes en el modal
  useEffect(() => {
    if (patientSearchQuery.length < 2) {
      setPatientResults([])
      return
    }
    const delay = setTimeout(async () => {
      setPatientSearchLoading(true)
      try {
        const res = await pacientesApi.listar({ search: patientSearchQuery, limit: 10 })
        setPatientResults(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setPatientSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(delay)
  }, [patientSearchQuery])

  // Cerrar dropdown de pacientes al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Helper para avanzar/retroceder semana
  const navigateWeek = (weeks: number) => {
    const current = new Date(selectedMonday + "T12:00:00")
    current.setDate(current.getDate() + weeks * 7)
    setSelectedMonday(current.toISOString().split("T")[0])
  }

  const getWeekRangeLabel = () => {
    const monday = new Date(selectedMonday + "T12:00:00")
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }
    return `${monday.toLocaleDateString("es-AR", options)} al ${sunday.toLocaleDateString("es-AR", options)}`
  }

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setEditingProtocolId(null)
    setFormData({
      paciente_id: "",
      profesional_id: "",
      tratamiento: "",
      cuidado_atencion: ""
    })
    setPatientSearchQuery("")
    setSelectedPatientObject(null)
    setShowFormModal(true)
  }

  // Abrir modal de edición
  const handleOpenEdit = (proto: ProtocoloTratamiento) => {
    setEditingProtocolId(proto.id)
    setFormData({
      paciente_id: proto.paciente_id || "",
      profesional_id: proto.profesional_id ? String(proto.profesional_id) : "",
      tratamiento: proto.tratamiento || "",
      cuidado_atencion: proto.cuidado_atencion
    })
    
    if (proto.paciente) {
      setSelectedPatientObject({
        id: proto.paciente_id,
        nombre: proto.paciente.nombre,
        apellido: proto.paciente.apellido
      } as any)
      setPatientSearchQuery(`${proto.paciente.nombre} ${proto.paciente.apellido}`)
    } else {
      setSelectedPatientObject(null)
      setPatientSearchQuery("")
    }
    
    setShowFormModal(true)
  }

  // Guardar protocolo
  const handleSaveProtocol = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cuidado_atencion.trim()) {
      toast({
        title: "Campo requerido",
        description: "Debe ingresar las indicaciones de cuidado o atención.",
        variant: "destructive"
      })
      return
    }

    try {
      const payload = {
        semana: selectedMonday,
        paciente_id: formData.paciente_id || null,
        profesional_id: formData.profesional_id ? parseInt(formData.profesional_id) : null,
        tratamiento: formData.tratamiento || null,
        cuidado_atencion: formData.cuidado_atencion
      } as any

      if (editingProtocolId) {
        await protocolosApi.actualizar(editingProtocolId, payload)
        toast({ title: "Protocolo actualizado", description: "El protocolo de tratamiento ha sido modificado con éxito." })
      } else {
        await protocolosApi.crear(payload)
        toast({ title: "Protocolo creado", description: "El protocolo de tratamiento ha sido registrado con éxito." })
      }

      setShowFormModal(false)
      loadProtocols()
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al guardar protocolo",
        description: err.message || "Por favor intente de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Eliminar protocolo
  const handleDeleteProtocol = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este protocolo?")) return

    try {
      await protocolosApi.eliminar(id)
      toast({ title: "Protocolo eliminado", description: "El protocolo de tratamiento ha sido removido." })
      loadProtocols()
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al eliminar",
        description: err.message || "Ocurrió un error al intentar eliminar el registro.",
        variant: "destructive"
      })
    }
  }

  // Seleccionar paciente del autocomplete
  const selectPatient = (patient: Paciente) => {
    setSelectedPatientObject(patient)
    setFormData(prev => ({ ...prev, paciente_id: patient.id }))
    setPatientSearchQuery(`${patient.nombre} ${patient.apellido}`)
    setShowPatientDropdown(false)
  }

  // Filtrar listado en memoria
  const filteredProtocols = protocols.filter(proto => {
    // Filtrar profesional
    if (filterProfId !== "TODOS" && String(proto.profesional_id) !== filterProfId) {
      return false
    }
    // Filtrar paciente (búsqueda rápida)
    if (filterPatientSearch.trim()) {
      const q = filterPatientSearch.toLowerCase()
      const patientName = proto.paciente ? `${proto.paciente.nombre} ${proto.paciente.apellido}`.toLowerCase() : ""
      const treatment = proto.tratamiento ? proto.tratamiento.toLowerCase() : ""
      const description = proto.cuidado_atencion.toLowerCase()
      
      return patientName.includes(q) || treatment.includes(q) || description.includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#2563FF]" />
            Protocolos de Tratamientos
          </h1>
          <p className="text-sm text-[#9C9489] mt-1">
            Notas de atención y cuidado especial para pacientes programados esta semana.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold flex items-center gap-2 rounded-xl py-2 px-4 shadow-[0_8px_20px_rgba(37,99,255,0.25)] active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Añadir Protocolo
        </Button>
      </div>

      {/* ═══ WEEK NAVIGATOR & FILTERS ═══ */}
      <Card className="p-5 border border-gray-100 shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Navegador de semanas */}
          <div className="flex items-center gap-3 self-center lg:self-auto bg-gray-50 border border-gray-100 rounded-2xl p-1">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
              title="Semana anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center px-4 min-w-[220px]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Semana del lunes</span>
              <span className="text-sm font-extrabold text-gray-800 mt-1">{getWeekRangeLabel()}</span>
            </div>

            <button
              onClick={() => navigateWeek(1)}
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
              title="Semana siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Filtros de búsqueda */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, tratamiento..."
                value={filterPatientSearch}
                onChange={(e) => setFilterPatientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 transition-all text-gray-800"
              />
              {filterPatientSearch && (
                <button
                  onClick={() => setFilterPatientSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div>
              <select
                value={filterProfId}
                onChange={(e) => setFilterProfId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:bg-white focus:border-[#2563FF] transition-all"
              >
                <option value="TODOS">Filtrar por Profesional: TODOS</option>
                {professionals.map(p => (
                  <option key={p.id} value={String(p.id)}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* ═══ PROTOCOLS GRID ═══ */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 text-[#2563FF] animate-spin" />
          <span className="text-sm font-semibold text-gray-500">Cargando protocolos...</span>
        </div>
      ) : filteredProtocols.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center p-6">
          <div className="w-14 h-14 rounded-full bg-[#2563FF]/10 flex items-center justify-center mb-3.5 text-[#2563FF]">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-extrabold text-gray-800">No hay protocolos anotados</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
            {filterPatientSearch.trim() || filterProfId !== "TODOS"
              ? "Ningún protocolo coincide con los filtros aplicados."
              : "No se registraron cuidados especiales para esta semana. Presioná 'Añadir Protocolo' para empezar."}
          </p>
          {(filterPatientSearch.trim() || filterProfId !== "TODOS") && (
            <Button
              onClick={() => {
                setFilterPatientSearch("")
                setFilterProfId("TODOS")
              }}
              variant="outline"
              className="mt-4 text-xs"
            >
              Restablecer filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProtocols.map(proto => (
            <Card
              key={proto.id}
              className="group relative flex flex-col border border-gray-100 hover:border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white overflow-hidden"
            >
              {/* Header de la tarjeta */}
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#2563FF]">
                      <User className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="text-[15px] font-extrabold text-gray-900">
                        {proto.paciente ? `${proto.paciente.nombre} ${proto.paciente.apellido}` : "Paciente General"}
                      </span>
                    </div>
                    
                    {proto.tratamiento && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#2563FF]/10 text-[#2563FF] border border-[#2563FF]/5">
                        <Activity className="h-3.5 w-3.5 shrink-0" />
                        {proto.tratamiento}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                    <button
                      onClick={() => handleOpenEdit(proto)}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProtocol(proto.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contenido / Cuidados */}
                <div className="bg-gray-50 border border-gray-100/50 rounded-xl p-4 min-h-[90px] flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-[#2563FF] shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 font-medium whitespace-pre-line leading-relaxed">
                    {proto.cuidado_atencion}
                  </p>
                </div>
              </div>

              {/* Footer de la tarjeta */}
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-700">
                  Prof: {proto.profesional ? `${proto.profesional.nombre} ${proto.profesional.apellido}` : "Cualquier Profesional"}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(proto.semana + 'T12:00:00').toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ═══ FORM MODAL (Create/Edit) ═══ */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2563FF]" />
                {editingProtocolId ? "Editar Protocolo" : "Añadir Protocolo de Cuidado"}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProtocol} className="p-6 space-y-4">
              {/* Autocomplete de Paciente */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Paciente (Opcional, en blanco para protocolo general)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Escribir nombre del paciente..."
                    value={patientSearchQuery}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value)
                      setShowPatientDropdown(true)
                      if (!e.target.value) {
                        setFormData(prev => ({ ...prev, paciente_id: "" }))
                        setSelectedPatientObject(null)
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 transition-all text-gray-800"
                  />
                  {patientSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setPatientSearchQuery("")
                        setFormData(prev => ({ ...prev, paciente_id: "" }))
                        setSelectedPatientObject(null)
                        setPatientResults([])
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown de Autocompletado */}
                {showPatientDropdown && patientSearchQuery.length >= 2 && (
                  <div
                    ref={patientDropdownRef}
                    className="absolute z-10 w-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-[220px] overflow-y-auto no-scrollbar py-1.5"
                  >
                    {patientSearchLoading ? (
                      <div className="px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2563FF]" />
                        Buscando paciente...
                      </div>
                    ) : patientResults.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-gray-400 italic">
                        No se encontraron pacientes para "{patientSearchQuery}"
                      </div>
                    ) : (
                      patientResults.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPatient(p)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex flex-col"
                        >
                          <span className="font-bold">{p.nombre} {p.apellido}</span>
                          <span className="text-[10px] text-gray-400">DNI: {p.numero_documento} | {p.obra_social_nombre_custom || p.obraSocial?.nombre || "Particular"}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Profesional */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Profesional Responsable (Opcional)
                </label>
                <select
                  value={formData.profesional_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, profesional_id: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 transition-all"
                >
                  <option value="">Cualquier profesional</option>
                  {professionals.map(p => (
                    <option key={p.id} value={String(p.id)}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
              </div>

              {/* Tratamiento */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Tratamiento o Servicio (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ortodoncia, Implante, Extracción..."
                  value={formData.tratamiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, tratamiento: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 transition-all text-gray-800"
                />
              </div>

              {/* Cuidado / Atención */}
              <div>
                <label className="block text-xs font-bold text-[#2563FF] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  Cuidado o Atención Especial Requerida *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detallar indicaciones específicas para este tratamiento durante esta semana..."
                  value={formData.cuidado_atencion}
                  onChange={(e) => setFormData(prev => ({ ...prev, cuidado_atencion: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/5 transition-all text-gray-800 font-medium"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  variant="outline"
                  className="rounded-xl px-5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl px-6 py-2.5 shadow-[0_8px_20px_rgba(37,99,255,0.25)] active:scale-95 transition-all"
                >
                  {editingProtocolId ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
