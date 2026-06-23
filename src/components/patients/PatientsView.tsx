"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  ArrowUpDown,
  Download,
} from "lucide-react"
import { pacientesApi, obrasSocialesApi, exportApi } from "../../api"
import { apiClient } from "../../lib/api-client"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import { useToast } from "../../hooks/use-toast"
import type { Paciente, CrearPacienteData, ObraSocial } from "../../types"
import { PatientDetailView } from "./PatientDetailView"
import { AdminAppointmentModal } from "../admin/AdminAppointmentModal"
import { ImageCropper } from "../ui/ImageCropper"
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper, getInitials, getAvatarStyle } from '../admin/adminDesign'

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens

const calculateAge = (birthDate: string) => {
  if (!birthDate) return "—"
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

/* ─── Label styles ────────────────────────────────────────────────────── */
const labelStyle = sharedLabelStyle

const inputStyle = sharedInputStyle

/* ═══════════════════════════════════════════════════════════════════════ */
interface PatientsViewProps {
  initialPatientId?: string | number
  initialSearchTerm?: string
}

export const PatientsView: React.FC<PatientsViewProps> = ({ initialPatientId, initialSearchTerm }) => {
  const [patients, setPatients] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">("view")
  const [formData, setFormData] = useState<Partial<CrearPacienteData>>({})
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [cropperData, setCropperData] = useState<{ imageSrc: string; patientId: string } | null>(null)
  const { toast } = useToast()

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

  useEffect(() => { fetchPatients(); fetchObrasSociales() }, [currentPage, searchTerm])

  useEffect(() => {
    if (initialPatientId) {
      const loadInitialPatient = async () => {
        try {
          const patient = await pacientesApi.obtener(String(initialPatientId))
          setSelectedPatient(patient)
          setViewMode("detail")
        } catch (e) {
          console.error("Error loading patient:", e)
          toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el paciente" })
        }
      }
      loadInitialPatient()
    }
  }, [initialPatientId])

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm)
      setCurrentPage(1)
    }
  }, [initialSearchTerm])

  const fetchObrasSociales = async () => {
    try {
      const res = await obrasSocialesApi.listar()
      setObrasSociales(res || [])
    } catch (e) { console.error(e); toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las obras sociales" }) }
  }

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await pacientesApi.listar({ page: currentPage, limit: 12, search: searchTerm || undefined })
      setPatients(res?.data || [])
      setTotalPages(res?.pagination?.totalPages || 1)
      setTotalPatients(res?.pagination?.totalItems || res?.data?.length || 0)
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los pacientes" })
      setPatients([]); setTotalPages(1); setTotalPatients(0)
    } finally { setLoading(false) }
  }

  const handleCreatePatient = () => {
    setFormData({ condicion: "Activo", tipo_facturacion: "B" })
    setModalMode("create"); setShowModal(true)
  }

  const handleEditPatient = (patient: Paciente) => {
    setSelectedPatient(patient); setFormData(patient)
    setModalMode("edit"); setShowModal(true)
  }

  const handleViewPatient = (patient: Paciente) => {
    setSelectedPatient(patient); setViewMode("detail")
  }

  const handleDeletePatientClick = (id: string) =>
    setConfirmDelete({ isOpen: true, id })

  const handleConfirmDeletePatient = async () => {
    if (!confirmDelete.id) return
    try {
      await pacientesApi.eliminar(confirmDelete.id)
      fetchPatients()
      setConfirmDelete({ isOpen: false, id: null })
    } catch { toast({ variant: "destructive", title: "Error", description: "Error al eliminar el paciente" }) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalMode === "create") await pacientesApi.crear(formData as CrearPacienteData)
      else if (modalMode === "edit" && selectedPatient) await pacientesApi.actualizar(selectedPatient.id, formData)
      setShowModal(false); fetchPatients()
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message || "Error al guardar el paciente" }) }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, patientId: string) => {
    const file = e.target.files?.[0]; if (!file) return
    // Read file and open cropper instead of uploading directly
    const reader = new FileReader()
    reader.onload = () => {
      setCropperData({ imageSrc: reader.result as string, patientId })
    }
    reader.readAsDataURL(file)
    // Reset the input so the same file can be selected again
    e.target.value = ''
  }

  const handleCroppedUpload = async (croppedBlob: Blob) => {
    if (!cropperData) return
    const { patientId } = cropperData
    setCropperData(null)
    try {
      setUploadingPhoto(true)
      const fd = new FormData()
      fd.append("foto", croppedBlob, "foto-recortada.jpg")
      const updated = await apiClient.put<Paciente>(`/pacientes/${patientId}/foto`, fd)
      if (selectedPatient?.id === patientId)
        setSelectedPatient({ ...selectedPatient, foto_url: updated.foto_url })
      fetchPatients()
    } catch { toast({ variant: "destructive", title: "Error", description: "Error al subir la foto" }) }
    finally { setUploadingPhoto(false) }
  }

  const getPhotoUrl = (patient: Paciente) => {
    if (!patient.foto_url) return null
    if (patient.foto_url.startsWith("http") || patient.foto_url.startsWith("/") || patient.foto_url.startsWith("data:")) return patient.foto_url
    return `${API_BASE_URL.replace(/\/api$/, "")}/${patient.foto_url.replace(/^src\//, "")}`
  }

  /* ── render ── */
  return (
    <div style={pageWrapper}>
      {viewMode === "detail" && selectedPatient ? (
        <PatientDetailView
          patient={selectedPatient}
          onBack={() => setViewMode("list")}
          onEdit={(p) => { setSelectedPatient(p); setFormData(p); setModalMode("edit"); setShowModal(true) }}
          onPhotoUpload={handlePhotoUpload}
          uploadingPhoto={uploadingPhoto}
          getPhotoUrl={getPhotoUrl}
          onBookTurno={() => setShowBookingModal(true)}
        />
      ) : (
        <>
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
                Gestión de Pacientes
              </h1>
              <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
                Administrá los pacientes registrados en el centro
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => exportApi.pacientes().catch(() => toast({ variant: "destructive", title: "Error", description: "Error al exportar" }))}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: tokens.blue, color: tokens.white,
                  border: "none", borderRadius: 999, padding: "9px 18px",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  fontFamily: "Inter, -apple-system, sans-serif",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = tokens.blueHover)}
                onMouseLeave={e => (e.currentTarget.style.background = tokens.blue)}
              >
                <Download size={15} color={tokens.white} />
                Exportar CSV
              </button>
              <button
                onClick={handleCreatePatient}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: tokens.blue, color: tokens.white,
                  border: "none", borderRadius: 999, padding: "9px 18px",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Inter, -apple-system, sans-serif",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = tokens.blueHover)}
                onMouseLeave={e => (e.currentTarget.style.background = tokens.blue)}
              >
                <Plus size={15} />
                + Nuevo paciente
              </button>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center">
            {/* Search */}
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 10,
              background: tokens.white, border: "1px solid rgba(37, 99, 255, 0.25)",
              borderRadius: 999, padding: "0 14px", height: 40,
            }}>
              <Search size={15} color={tokens.blue} style={{ opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, teléfono o email…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 13, color: tokens.blue, flex: 1,
                  fontFamily: "Inter, -apple-system, sans-serif",
                }}
              />
            </div>
            {/* Counter */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
              borderRadius: 10, padding: "0 14px", height: 40, whiteSpace: "nowrap",
            }}>
              <Users size={15} color={tokens.blue} />
              <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{totalPatients}</span>
              <span style={{ fontSize: 13, color: tokens.grayMuted }}>pacientes en total</span>
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
                      { label: "Paciente", sortable: true },
                      { label: "Teléfono", sortable: true },
                      { label: "N° Afiliado", sortable: true },
                      { label: "Documento", sortable: true },
                      { label: "Edad / Sexo", sortable: true },
                      { label: "Estado", sortable: false },
                      { label: "", sortable: false },
                    ].map((col, i) => (
                      <th key={i} style={{
                        textAlign: "left", padding: "12px 16px",
                        fontSize: 11, fontWeight: 600, color: tokens.grayMuted,
                        whiteSpace: "nowrap",
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
                    [...Array(6)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: `0.5px solid ${tokens.grayRow}` }}>
                        <td style={{ padding: "11px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} />
                            <div>
                              <div style={{ width: 120, height: 11, borderRadius: 5, background: tokens.grayRow, marginBottom: 5 }} />
                              <div style={{ width: 80, height: 9, borderRadius: 5, background: tokens.grayRow }} />
                            </div>
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
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "56px 0" }}>
                        <Users size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                        <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No hay pacientes registrados</p>
                        <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 4, opacity: 0.7 }}>
                          Comenzá registrando tu primer paciente
                        </p>
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient, idx) => {
                      const avColor = getAvatarStyle(patient.id)
                      const isLast = idx === patients.length - 1
                      return (
                        <tr
                          key={patient.id}
                          style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, cursor: "pointer", transition: "background 0.12s" }}
                          onClick={() => handleViewPatient(patient)}
                          onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Patient */}
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ position: "relative", flexShrink: 0 }}>
                                {getPhotoUrl(patient) ? (
                                  <img
                                    src={getPhotoUrl(patient)!}
                                    alt={`${patient.nombre} ${patient.apellido}`}
                                    style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }}
                                  />
                                ) : (
                                  <div style={{
                                    width: 34, height: 34, borderRadius: 9,
                                    background: avColor.bg, color: avColor.color,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, fontWeight: 700,
                                  }}>
                                    {getInitials(patient.nombre, patient.apellido)}
                                  </div>
                                )}
                                <div style={{
                                  width: 8, height: 8, borderRadius: "50%",
                                  border: `1.5px solid ${tokens.white}`,
                                  background: patient.condicion === "Activo" ? tokens.green : tokens.grayDot,
                                  position: "absolute", bottom: -1, right: -1,
                                }} />
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: tokens.navy, margin: 0, whiteSpace: "nowrap" }}>
                                  {patient.apellido}, {patient.nombre}
                                </p>
                                <p style={{ fontSize: 11.5, color: tokens.grayMuted, margin: "2px 0 0" }}>
                                  {patient.obraSocial?.nombre || patient.obra_social_nombre_custom || "Sin obra social"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: tokens.grayText, whiteSpace: "nowrap" }}>
                              <Phone size={13} color={tokens.grayBorder} />
                              {patient.telefono || <span style={{ color: tokens.grayBorder }}>—</span>}
                            </div>
                          </td>

                          {/* Nº Afiliado */}
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ fontSize: 13, color: tokens.grayText, fontWeight: 600, fontFamily: "Inter, monospace" }}>
                              {patient.numero_afiliado || <span style={{ color: tokens.grayBorder, fontWeight: 400 }}>—</span>}
                            </div>
                          </td>

                          {/* Doc */}
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ fontSize: 13, color: tokens.grayText, whiteSpace: "nowrap" }}>
                              <span style={{ fontSize: 10.5, fontWeight: 600, color: tokens.grayMuted, marginRight: 4 }}>
                                {patient.tipo_documento}
                              </span>
                              {patient.numero_documento || <span style={{ color: tokens.grayBorder }}>—</span>}
                            </div>
                          </td>

                          {/* Age/Sex */}
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: tokens.grayText, whiteSpace: "nowrap" }}>
                              <Calendar size={13} color={tokens.grayBorder} />
                              {patient.fecha_nacimiento
                                ? `${calculateAge(patient.fecha_nacimiento)} años · ${patient.sexo || "—"}`
                                : <span style={{ color: tokens.grayBorder }}>—</span>}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center",
                              padding: "3px 10px", borderRadius: 6,
                              fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                              background: patient.condicion === "Activo" ? tokens.greenFaint : tokens.grayPill,
                              color: patient.condicion === "Activo" ? tokens.greenText : tokens.grayPillTx,
                            }}>
                              {patient.condicion || "Inactivo"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "11px 16px" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <button
                                onClick={() => handleEditPatient(patient)}
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
                                onClick={() => handleDeletePatientClick(patient.id)}
                                title="Eliminar"
                                style={{
                                  width: 30, height: 30, borderRadius: 7, border: "none",
                                  background: "transparent", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: tokens.grayMuted, transition: "all 0.12s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#EF4444" }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderTop: `0.5px solid ${tokens.grayRow}`,
              }}>
                <p style={{ fontSize: 12.5, color: tokens.grayMuted }}>
                  Página <strong style={{ color: tokens.navy }}>{currentPage}</strong> de {totalPages}
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { icon: <ChevronLeft size={15} />, action: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 },
                    { icon: <ChevronRight size={15} />, action: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      disabled={btn.disabled}
                      style={{
                        width: 30, height: 30, borderRadius: 7,
                        border: `0.5px solid ${tokens.grayBorder}`,
                        background: tokens.white, cursor: btn.disabled ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: btn.disabled ? tokens.grayBorder : tokens.grayText,
                        opacity: btn.disabled ? 0.5 : 1,
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={e => { if (!btn.disabled) { e.currentTarget.style.background = tokens.blueFaint; e.currentTarget.style.borderColor = tokens.blue; e.currentTarget.style.color = tokens.blue } }}
                      onMouseLeave={e => { if (!btn.disabled) { e.currentTarget.style.background = tokens.white; e.currentTarget.style.borderColor = tokens.grayBorder; e.currentTarget.style.color = tokens.grayText } }}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal Create / Edit ── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(11,16,35,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50, padding: 16,
        }}>
          <div style={{
            background: tokens.white, borderRadius: 16,
            maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 24px 48px rgba(11,16,35,0.12)",
          }}>
            {/* Modal header */}
            <div style={{
              padding: "18px 24px", borderBottom: `0.5px solid ${tokens.grayBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              position: "sticky", top: 0, background: tokens.white, zIndex: 10,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                {modalMode === "create" ? "Nuevo Paciente" : "Editar Paciente"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Apellido */}
                <div>
                  <label style={labelStyle}>Apellido *</label>
                  <input
                    type="text" required
                    value={formData.apellido || ""}
                    onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Apellido del paciente"
                    style={{ ...inputStyle, borderColor: focusedField === "apellido" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("apellido")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input
                    type="text" required
                    value={formData.nombre || ""}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Nombre del paciente"
                    style={{ ...inputStyle, borderColor: focusedField === "nombre" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("nombre")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Tipo documento */}
                <div>
                  <label style={labelStyle}>Tipo de Documento *</label>
                  <select
                    required
                    value={formData.tipo_documento || ""}
                    onChange={e => setFormData({ ...formData, tipo_documento: e.target.value as any })}
                    style={{ ...inputStyle, borderColor: focusedField === "tipodoc" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("tipodoc")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Cédula">Cédula</option>
                  </select>
                </div>

                {/* Número documento */}
                <div>
                  <label style={labelStyle}>Número de Documento *</label>
                  <input
                    type="text" required
                    value={formData.numero_documento || ""}
                    onChange={e => setFormData({ ...formData, numero_documento: e.target.value })}
                    placeholder="Ej: 35.123.456"
                    style={{ ...inputStyle, borderColor: focusedField === "numdoc" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("numdoc")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Fecha nacimiento */}
                <div>
                  <label style={labelStyle}>Fecha de Nacimiento *</label>
                  <input
                    type="date" required
                    value={formData.fecha_nacimiento || ""}
                    onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    style={{ ...inputStyle, borderColor: focusedField === "fnac" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("fnac")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label style={labelStyle}>Sexo *</label>
                  <select
                    required
                    value={formData.sexo || ""}
                    onChange={e => setFormData({ ...formData, sexo: e.target.value as any })}
                    style={{ ...inputStyle, borderColor: focusedField === "sexo" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("sexo")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Teléfono */}
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono || ""}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej: +54 9 11 ..."
                    style={{ ...inputStyle, borderColor: focusedField === "tel" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("tel")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="paciente@ejemplo.com"
                    style={{ ...inputStyle, borderColor: focusedField === "email" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Obra social */}
                <div>
                  <label style={labelStyle}>Obra Social</label>
                  <select
                    value={formData.obra_social_id || ""}
                    onChange={e => setFormData({ ...formData, obra_social_id: e.target.value ? Number(e.target.value) : undefined })}
                    style={{ ...inputStyle, borderColor: focusedField === "os" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("os")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="">Sin obra social</option>
                    {obrasSociales.map(os => (
                      <option key={os.id} value={os.id}>{os.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Condición */}
                <div>
                  <label style={labelStyle}>Condición</label>
                  <select
                    value={formData.condicion || "Activo"}
                    onChange={e => setFormData({ ...formData, condicion: e.target.value })}
                    style={{ ...inputStyle, borderColor: focusedField === "cond" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("cond")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                {/* Dirección */}
                <div>
                  <label style={labelStyle}>Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion || ""}
                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej: Av. Corrientes 1234"
                    style={{ ...inputStyle, borderColor: focusedField === "dir" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("dir")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Ocupación */}
                <div>
                  <label style={labelStyle}>Ocupación</label>
                  <input
                    type="text"
                    value={formData.ocupacion || ""}
                    onChange={e => setFormData({ ...formData, ocupacion: e.target.value })}
                    placeholder="Ej: Ingeniero, Estudiante"
                    style={{ ...inputStyle, borderColor: focusedField === "ocup" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("ocup")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Número de Afiliado */}
                <div>
                  <label style={labelStyle}>Número de Afiliado</label>
                  <input
                    type="text"
                    value={formData.numero_afiliado || ""}
                    onChange={e => setFormData({ ...formData, numero_afiliado: e.target.value })}
                    placeholder="Nº de afiliado"
                    style={{ ...inputStyle, borderColor: focusedField === "afil" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("afil")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Tipo de Facturación */}
                <div>
                  <label style={labelStyle}>Tipo de Facturación</label>
                  <select
                    value={formData.tipo_facturacion || "B"}
                    onChange={e => setFormData({ ...formData, tipo_facturacion: e.target.value as 'A' | 'B' | 'C' })}
                    style={{ ...inputStyle, borderColor: focusedField === "factu" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("factu")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="A">Factura A</option>
                    <option value="B">Factura B</option>
                    <option value="C">Factura C</option>
                  </select>
                </div>

                {/* Información Adicional — full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Información Adicional / Notas</label>
                  <textarea
                    value={formData.informacion_adicional || ""}
                    onChange={e => setFormData({ ...formData, informacion_adicional: e.target.value })}
                    placeholder="Notas internas sobre el paciente..."
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 60, borderColor: focusedField === "info" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("info")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* Form actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `0.5px solid ${tokens.grayBorder}` }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "9px 18px", fontSize: 13, fontWeight: 500,
                    border: `0.5px solid ${tokens.grayBorder}`, borderRadius: 999,
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
                  style={{
                    padding: "9px 20px", fontSize: 13, fontWeight: 700,
                    background: tokens.blue, color: tokens.white,
                    border: "none", borderRadius: 999, cursor: "pointer",
                    fontFamily: "Inter, -apple-system, sans-serif", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.blueHover }}
                  onMouseLeave={e => { e.currentTarget.style.background = tokens.blue }}
                >
                  {modalMode === "create" ? "Crear" : "Actualizar"} paciente
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
        onConfirm={handleConfirmDeletePatient}
        title="Eliminar Paciente"
        message="¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer."
      />

      {/* ── Booking modal ── */}
      {showBookingModal && selectedPatient && (
        <AdminAppointmentModal
          initialData={{
            paciente_id: selectedPatient.id,
            paciente_nombre: `${selectedPatient.apellido}, ${selectedPatient.nombre} (DNI: ${selectedPatient.numero_documento})`,
            fecha: new Date().toISOString().split("T")[0],
            sobre_turno: true,
          }}
          onClose={() => setShowBookingModal(false)}
          onCreate={() => { setShowBookingModal(false); fetchPatients() }}
        />
      )}

      {/* ── Image Cropper ── */}
      {cropperData && (
        <ImageCropper
          imageSrc={cropperData.imageSrc}
          onCropComplete={handleCroppedUpload}
          onCancel={() => setCropperData(null)}
          aspectRatio={1}
          cropShape="round"
        />
      )}
    </div>
  )
}
