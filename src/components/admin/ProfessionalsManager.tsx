"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  Award,
  Clock,
  Briefcase,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  UserPlus
} from "lucide-react"
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper, cardStyle, btnPrimary, btnSecondary, btnDanger, getInitials, getAvatarStyle } from './adminDesign'
import { adminApi } from "../../api/admin"
import { ScheduleManager } from "../schedule/ScheduleManager"
import { ServiceAssignment } from "./ServiceAssignment"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import { useToast } from "../../hooks/use-toast"
import type { Profesional, CrearProfesionalData, HorariosSemanales, Servicio } from "../../types"

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens

/* ─── Label styles ────────────────────────────────────────────────────── */
const labelStyle = sharedLabelStyle

const inputStyle = sharedInputStyle

type ViewMode = 'list' | 'schedule' | 'services'

export const ProfessionalsManager: React.FC = () => {
  const [professionals, setProfessionals] = useState<Profesional[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedProfessional, setSelectedProfessional] = useState<Profesional | null>(null)
  const [editingProfessional, setEditingProfessional] = useState<Profesional | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | number | null }>({
    isOpen: false,
    id: null
  })

  const { toast } = useToast()
  const [formData, setFormData] = useState<CrearProfesionalData>({
    apellido: "",
    nombre: "",
    numero_documento: "",
    email: "",
    telefono: "",
    especialidad: "",
    numero_matricula: "",
    color: "#2563FF",
    foto_url: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CrearProfesionalData, string>>>({})

  useEffect(() => {
    fetchProfessionals()
  }, [searchTerm, statusFilter])

  useEffect(() => {
    if (!showForm) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetForm()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showForm])

  const fetchProfessionals = async () => {
    try {
      setLoading(true)
      const response = await adminApi.profesionales.listar({
        search: searchTerm,
        estado: statusFilter,
      })
      setProfessionals(response.data)
    } catch (error) {
      console.error("Error fetching professionals:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CrearProfesionalData, string>> = {}

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido"
    if (!formData.numero_documento.trim()) newErrors.numero_documento = "El número de documento es requerido"
    if (!formData.email?.trim()) newErrors.email = "El email es requerido"
    else if (!/\S+@\S+\.\S+/.test(formData.email || "")) newErrors.email = "El email no es válido"
    if (!formData.telefono?.trim()) newErrors.telefono = "El teléfono es requerido"
    if (!formData.especialidad.trim()) newErrors.especialidad = "La especialidad es requerida"
    if (!formData.numero_matricula.trim()) newErrors.numero_matricula = "El número de matrícula es requerido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      if (editingProfessional) {
        await adminApi.profesionales.actualizar(editingProfessional.id, formData)
      } else {
        await adminApi.profesionales.crear(formData)
      }

      toast({
        title: "Éxito",
        description: editingProfessional ? "Profesional actualizado correctamente" : "Profesional creado correctamente"
      })
      resetForm()
      fetchProfessionals()
    } catch (error: any) {
      console.error("Error saving professional:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo guardar el profesional",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (professional: Profesional) => {
    setEditingProfessional(professional)
    setFormData({
      apellido: professional.apellido,
      nombre: professional.nombre,
      numero_documento: professional.numero_documento,
      email: professional.email || "",
      telefono: professional.telefono || "",
      especialidad: professional.especialidad,
      numero_matricula: professional.numero_matricula,
      color: professional.color || "#2563FF",
      foto_url: professional.foto_url || "",
    })
    setShowForm(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation()
    setConfirmDelete({ isOpen: true, id })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return

    try {
      await adminApi.profesionales.eliminar(confirmDelete.id)
      fetchProfessionals()
      setConfirmDelete({ isOpen: false, id: null })
      toast({ title: "Éxito", description: "Profesional eliminado correctamente" })
    } catch (error) {
      console.error("Error deleting professional:", error)
      toast({ variant: "destructive", title: "Error", description: "Error al eliminar el profesional" })
    }
  }

  const handleManageSchedule = (professional: Profesional) => {
    setSelectedProfessional(professional)
    setViewMode('schedule')
  }

  const handleManageServices = (professional: Profesional) => {
    setSelectedProfessional(professional)
    setViewMode('services')
  }

  const handleScheduleUpdate = (horarios: HorariosSemanales) => {
    if (selectedProfessional) {
      setProfessionals((prev) =>
        prev.map((prof) => (prof.id === selectedProfessional.id ? { ...prof, horarios_atencion: horarios } : prof)),
      )
    }
  }

  const handleServicesUpdate = (servicios: Servicio[]) => {
    if (selectedProfessional) {
      setProfessionals((prev) =>
        prev.map((prof) => (prof.id === selectedProfessional.id ? { ...prof, servicios } : prof)),
      )
    }
  }

  const resetForm = () => {
    setFormData({
      apellido: "",
      nombre: "",
      numero_documento: "",
      email: "",
      telefono: "",
      especialidad: "",
      numero_matricula: "",
      color: "#2563FF",
      foto_url: "",
    })
    setErrors({})
    setEditingProfessional(null)
    setShowForm(false)
  }

  const handleChange = (field: keyof CrearProfesionalData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  /* ── styles ── */
  const page: React.CSSProperties = {
    ...pageWrapper,
    background: tokens.grayBg,
  }

  if (viewMode === 'schedule' && selectedProfessional) {
    return (
      <div style={page}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
              Gestión de Horarios
            </h1>
            <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3 }}>
              Configura los horarios de atención de {selectedProfessional.nombre} {selectedProfessional.apellido}
            </p>
          </div>
          <button
            onClick={() => { setViewMode('list'); setSelectedProfessional(null) }}
            style={{
              background: tokens.white, color: tokens.grayText,
              border: `0.5px solid ${tokens.grayBorder}`, borderRadius: 10, padding: "9px 18px",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "Inter, -apple-system, sans-serif", transition: "all 0.12s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = tokens.grayBg}
            onMouseLeave={e => e.currentTarget.style.background = tokens.white}
          >
            Volver
          </button>
        </div>
        <ScheduleManager professional={selectedProfessional} onScheduleUpdate={handleScheduleUpdate} />
      </div>
    )
  }

  if (viewMode === 'services' && selectedProfessional) {
    return (
      <div style={page}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
              Gestión de Servicios
            </h1>
            <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3 }}>
              Asigna servicios a {selectedProfessional.nombre} {selectedProfessional.apellido}
            </p>
          </div>
          <button
            onClick={() => { setViewMode('list'); setSelectedProfessional(null) }}
            style={{
              background: tokens.white, color: tokens.grayText,
              border: `0.5px solid ${tokens.grayBorder}`, borderRadius: 10, padding: "9px 18px",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "Inter, -apple-system, sans-serif", transition: "all 0.12s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = tokens.grayBg}
            onMouseLeave={e => e.currentTarget.style.background = tokens.white}
          >
            Volver
          </button>
        </div>
        <ServiceAssignment professional={selectedProfessional} onServicesUpdate={handleServicesUpdate} />
      </div>
    )
  }

  return (
    <div style={page}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Gestión de Profesionales
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Administrá el staff médico de tu centro
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: tokens.blue, color: tokens.white,
            border: "none", borderRadius: 10, padding: "9px 18px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "Inter, -apple-system, sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = tokens.blueHover)}
          onMouseLeave={e => (e.currentTarget.style.background = tokens.blue)}
        >
          <Plus size={15} />
          Nuevo Profesional
        </button>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center">
        {/* Search */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 10,
          background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
          borderRadius: 10, padding: "0 14px", height: 40,
        }}>
          <Search size={15} color={tokens.grayMuted} />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad o matrícula…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: tokens.navy, flex: 1,
              fontFamily: "Inter, -apple-system, sans-serif",
            }}
          />
        </div>
        
        {/* Status filter */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
          borderRadius: 10, padding: "0 14px", height: 40,
        }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: tokens.navy, cursor: "pointer",
              fontFamily: "Inter, -apple-system, sans-serif",
            }}
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        {/* Counter */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
          borderRadius: 10, padding: "0 14px", height: 40, whiteSpace: "nowrap",
        }}>
          <Users size={15} color={tokens.blue} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{professionals.length}</span>
          <span style={{ fontSize: 13, color: tokens.grayMuted }}>profesionales</span>
        </div>
      </div>

      {/* ── Table card ── */}
      <div style={{
        background: tokens.white, borderRadius: 14,
        border: `0.5px solid ${tokens.grayBorder}`, overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${tokens.grayBorder}` }}>
                {[
                  { label: "Profesional", sortable: true },
                  { label: "Documento", sortable: true },
                  { label: "Contacto", sortable: true },
                  { label: "Especialidad", sortable: true },
                  { label: "Matrícula", sortable: true },
                  { label: "Estado", sortable: false },
                  { label: "", sortable: false },
                ].map((col, i) => (
                  <th key={i} style={{
                    textAlign: "left", padding: "12px 16px",
                    fontSize: 11, fontWeight: 600, color: tokens.grayMuted,
                    textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap",
                  }}>
                    {col.label && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {col.label}
                        {col.sortable && <ArrowUpDown size={11} />}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `0.5px solid ${tokens.grayRow}` }}>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} />
                        <div style={{ width: 120, height: 11, borderRadius: 5, background: tokens.grayRow }} />
                      </div>
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} style={{ padding: "11px 16px" }}>
                        <div style={{ width: 90, height: 11, borderRadius: 5, background: tokens.grayRow }} />
                      </td>
                    ))}
                    <td style={{ padding: "11px 16px" }} />
                  </tr>
                ))
              ) : professionals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "56px 0" }}>
                    <Users size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No hay profesionales registrados</p>
                  </td>
                </tr>
              ) : (
                professionals.map((prof, idx) => {
                  const avColor = getAvatarStyle(prof.id)
                  const isLast = idx === professionals.length - 1
                  return (
                    <tr
                      key={prof.id}
                      style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, cursor: "pointer", transition: "background 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Profesional */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {prof.foto_url ? (
                              <img
                                src={prof.foto_url}
                                alt={`${prof.nombre} ${prof.apellido}`}
                                style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{
                                width: 34, height: 34, borderRadius: 9,
                                background: avColor.bg, color: avColor.color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 700,
                              }}>
                                {getInitials(prof.nombre, prof.apellido)}
                              </div>
                            )}
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%",
                              border: `1.5px solid ${tokens.white}`,
                              background: prof.estado === "Activo" ? tokens.green : tokens.grayDot,
                              position: "absolute", bottom: -1, right: -1,
                            }} />
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: tokens.navy, margin: 0, whiteSpace: "nowrap" }}>
                            {prof.apellido}, {prof.nombre}
                          </p>
                        </div>
                      </td>

                      {/* Documento */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 13, color: tokens.grayText, whiteSpace: "nowrap" }}>
                          {prof.numero_documento}
                        </div>
                      </td>

                      {/* Contacto */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText, whiteSpace: "nowrap" }}>
                            <Mail size={12} color={tokens.grayBorder} />
                            {prof.email}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText, whiteSpace: "nowrap" }}>
                            <Phone size={12} color={tokens.grayBorder} />
                            {prof.telefono}
                          </div>
                        </div>
                      </td>

                      {/* Especialidad */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: tokens.navy, fontWeight: 500 }}>
                          <Award size={13} color={tokens.blue} />
                          {prof.especialidad}
                        </div>
                      </td>

                      {/* Matrícula */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 12.5, fontFamily: "monospace", color: tokens.grayMuted }}>
                          {prof.numero_matricula}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                          background: prof.estado === "Activo" ? tokens.greenFaint : tokens.redFaint,
                          color: prof.estado === "Activo" ? tokens.greenText : tokens.redText,
                        }}>
                          {prof.estado}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 16px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <button
                            onClick={() => handleManageServices(prof)}
                            title="Servicios"
                            style={{
                              width: 30, height: 30, borderRadius: 7, border: "none",
                              background: "transparent", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: tokens.grayMuted, transition: "all 0.12s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = tokens.blueFaint; e.currentTarget.style.color = tokens.blue }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}
                          >
                            <Briefcase size={14} />
                          </button>
                          <button
                            onClick={() => handleManageSchedule(prof)}
                            title="Horarios"
                            style={{
                              width: 30, height: 30, borderRadius: 7, border: "none",
                              background: "transparent", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: tokens.grayMuted, transition: "all 0.12s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = tokens.blueFaint; e.currentTarget.style.color = tokens.blue }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}
                          >
                            <Clock size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(prof)}
                            title="Editar"
                            style={{
                              width: 30, height: 30, borderRadius: 7, border: "none",
                              background: "transparent", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: tokens.grayMuted, transition: "all 0.12s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = tokens.blueFaint; e.currentTarget.style.color = tokens.blue }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, prof.id)}
                            title="Eliminar"
                            style={{
                              width: 30, height: 30, borderRadius: 7, border: "none",
                              background: "transparent", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: tokens.grayMuted, transition: "all 0.12s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = tokens.redFaint; e.currentTarget.style.color = tokens.red }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Create / Edit ── */}
      {showForm && (
        <div onClick={resetForm} style={{
          position: "fixed", inset: 0, background: "rgba(11,16,35,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50, padding: 16,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: tokens.white, borderRadius: 16,
            maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 24px 48px rgba(11,16,35,0.12)",
          }}>
            {/* Modal header */}
            <div style={{
              padding: "18px 24px", borderBottom: `0.5px solid ${tokens.grayBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              position: "sticky", top: 0, background: tokens.white, zIndex: 10,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                {editingProfessional ? "Editar Profesional" : "Nuevo Profesional"}
              </h3>
              <button
                onClick={resetForm}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tokens.grayMuted, transition: "all 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = tokens.grayRow }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input
                    type="text" required
                    value={formData.nombre}
                    onChange={e => handleChange("nombre", e.target.value)}
                    placeholder="Nombre"
                    style={{ ...inputStyle, borderColor: (focusedField === "nombre" || errors.nombre) ? (errors.nombre ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("nombre")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.nombre && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.nombre}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Apellido *</label>
                  <input
                    type="text" required
                    value={formData.apellido}
                    onChange={e => handleChange("apellido", e.target.value)}
                    placeholder="Apellido"
                    style={{ ...inputStyle, borderColor: (focusedField === "apellido" || errors.apellido) ? (errors.apellido ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("apellido")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.apellido && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.apellido}</p>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>DNI / Documento *</label>
                  <input
                    type="text" required
                    value={formData.numero_documento}
                    onChange={e => handleChange("numero_documento", e.target.value)}
                    placeholder="12345678"
                    style={{ ...inputStyle, borderColor: (focusedField === "dni" || errors.numero_documento) ? (errors.numero_documento ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("dni")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.numero_documento && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.numero_documento}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email" required
                    value={formData.email || ""}
                    onChange={e => handleChange("email", e.target.value)}
                    placeholder="email@ejemplo.com"
                    style={{ ...inputStyle, borderColor: (focusedField === "email" || errors.email) ? (errors.email ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.email && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Teléfono *</label>
                  <input
                    type="tel" required
                    value={formData.telefono || ""}
                    onChange={e => handleChange("telefono", e.target.value)}
                    placeholder="+54 11 ..."
                    style={{ ...inputStyle, borderColor: (focusedField === "tel" || errors.telefono) ? (errors.telefono ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("tel")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.telefono && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.telefono}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Especialidad *</label>
                  <input
                    type="text" required
                    value={formData.especialidad}
                    onChange={e => handleChange("especialidad", e.target.value)}
                    placeholder="Ej: Odontología General"
                    style={{ ...inputStyle, borderColor: (focusedField === "esp" || errors.especialidad) ? (errors.especialidad ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("esp")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.especialidad && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.especialidad}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Nº Matrícula *</label>
                  <input
                    type="text" required
                    value={formData.numero_matricula}
                    onChange={e => handleChange("numero_matricula", e.target.value)}
                    placeholder="MP 12345"
                    style={{ ...inputStyle, borderColor: (focusedField === "mat" || errors.numero_matricula) ? (errors.numero_matricula ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("mat")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.numero_matricula && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.numero_matricula}</p>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Color Identificativo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="color"
                      value={formData.color || "#2563FF"}
                      onChange={e => handleChange("color", e.target.value)}
                      style={{ width: 40, height: 40, padding: 2, border: `1px solid ${tokens.grayBorder}`, borderRadius: 8, background: tokens.white, cursor: "pointer" }}
                    />
                    <p style={{ fontSize: 11.5, color: tokens.grayMuted, margin: 0 }}>
                      Se usará para identificar los turnos en el calendario.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `0.5px solid ${tokens.grayBorder}` }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "9px 18px", fontSize: 13, fontWeight: 500,
                    border: `0.5px solid ${tokens.grayBorder}`, borderRadius: 9,
                    background: tokens.white, color: tokens.grayText, cursor: "pointer",
                    fontFamily: "Inter, -apple-system, sans-serif", transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.grayBg }}
                  onMouseLeave={e => { e.currentTarget.style.background = tokens.white }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "9px 20px", fontSize: 13, fontWeight: 700,
                    background: saving ? tokens.grayBorder : tokens.blue, color: tokens.white,
                    border: "none", borderRadius: 9, cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "Inter, -apple-system, sans-serif", transition: "background 0.15s",
                    opacity: saving ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = tokens.blueHover }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = tokens.blue }}
                >
                  {saving ? "Guardando..." : `${editingProfessional ? "Actualizar" : "Crear"} Profesional`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation modal ── */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Profesional"
        message="¿Estás seguro de que deseas eliminar este profesional? Esta acción no se puede deshacer y afectará a los turnos asignados."
      />
    </div>
  )
}
