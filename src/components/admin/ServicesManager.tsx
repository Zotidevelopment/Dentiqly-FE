"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Briefcase, Clock, DollarSign, Tag, X, ArrowUpDown, Layers } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { useToast } from '../../hooks/use-toast'
import { ConfirmationModal } from '../ui/ConfirmationModal'
import type { Servicio, CrearServicioData } from '../../types'
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens

/* ─── Label styles ────────────────────────────────────────────────────── */
const labelStyle = sharedLabelStyle

const inputStyle = sharedInputStyle

export const ServicesManager: React.FC = () => {
  const { toast } = useToast()
  const [services, setServices] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Servicio | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | number | null }>({
    isOpen: false,
    id: null
  })

  const [formData, setFormData] = useState<CrearServicioData>({
    nombre: '',
    descripcion: '',
    precio_base: 0,
    duracion_estimada: 30,
    categoria: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CrearServicioData, string>>>({})

  const categorias = [
    'Odontología General',
    'Ortodoncia',
    'Endodoncia',
    'Periodoncia',
    'Cirugía',
    'Estética Dental',
    'Implantes',
    'Prótesis',
    'Odontopediatría',
    'Otro'
  ]

  useEffect(() => {
    fetchServices()
  }, [searchTerm])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await adminApi.servicios.listar({
        search: searchTerm
      })
      setServices(response.data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CrearServicioData, string>> = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.categoria) newErrors.categoria = 'La categoría es requerida'
    if (formData.precio_base <= 0) newErrors.precio_base = 'El precio debe ser mayor a 0'
    if (formData.duracion_estimada < 5 || formData.duracion_estimada > 480) {
      newErrors.duracion_estimada = 'La duración debe estar entre 5 y 480 minutos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_base: formData.precio_base,
        duracion_estimada: formData.duracion_estimada,
        categoria: formData.categoria
      }

      if (editingService) {
        await adminApi.servicios.actualizar(editingService.id, dataToSend)
      } else {
        await adminApi.servicios.crear(dataToSend)
      }
      
      resetForm()
      fetchServices()
    } catch (error) {
      console.error('Error saving service:', error)
    }
  }

  const handleEdit = (service: Servicio) => {
    setEditingService(service)
    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion || '',
      precio_base: service.precio_base,
      duracion_estimada: service.duracion_estimada,
      categoria: service.categoria || ''
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
      await adminApi.servicios.eliminar(confirmDelete.id)
      fetchServices()
      setConfirmDelete({ isOpen: false, id: null })
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({ variant: "destructive", title: "Error", description: "Error al eliminar el servicio" })
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio_base: 0,
      duracion_estimada: 30,
      categoria: ''
    })
    setErrors({})
    setEditingService(null)
    setShowForm(false)
  }

  const handleChange = (field: keyof CrearServicioData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div style={pageWrapper}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Gestión de Servicios
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Administrá el catálogo de prestaciones del centro
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
          Nuevo Servicio
        </button>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center">
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 10,
          background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
          borderRadius: 10, padding: "0 14px", height: 40,
        }}>
          <Search size={15} color={tokens.grayMuted} />
          <input
            type="text"
            placeholder="Buscar servicios…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: tokens.navy, flex: 1,
              fontFamily: "Inter, -apple-system, sans-serif",
            }}
          />
        </div>
        
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
          borderRadius: 10, padding: "0 14px", height: 40, whiteSpace: "nowrap",
        }}>
          <Layers size={15} color={tokens.blue} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{services.length}</span>
          <span style={{ fontSize: 13, color: tokens.grayMuted }}>servicios</span>
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
                  { label: "Servicio", sortable: true },
                  { label: "Categoría", sortable: true },
                  { label: "Duración", sortable: true },
                  { label: "Precio Base", sortable: true },
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
                      <div style={{ width: 140, height: 11, borderRadius: 5, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} />
                    </td>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} style={{ padding: "11px 16px" }}>
                        <div style={{ width: 80, height: 11, borderRadius: 5, background: tokens.grayRow }} />
                      </td>
                    ))}
                    <td style={{ padding: "11px 16px" }} />
                  </tr>
                ))
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "56px 0" }}>
                    <Briefcase size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No hay servicios registrados</p>
                  </td>
                </tr>
              ) : (
                services.map((service, idx) => {
                  const isLast = idx === services.length - 1
                  return (
                    <tr
                      key={service.id}
                      style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, transition: "background 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Servicio */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: tokens.blueFaint, color: tokens.blue,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                              {service.nombre}
                            </p>
                            {service.descripcion && (
                              <p style={{ fontSize: 11, color: tokens.grayMuted, margin: "2px 0 0", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {service.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText }}>
                          <Tag size={12} color={tokens.grayMuted} />
                          {service.categoria || "—"}
                        </div>
                      </td>

                      {/* Duración */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText }}>
                          <Clock size={12} color={tokens.grayMuted} />
                          {service.duracion_estimada} min
                        </div>
                      </td>

                      {/* Precio */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.grayMuted, marginRight: 4 }}>$</span>
                          {parseFloat(String(service.precio_base || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                          background: service.estado === "Activo" ? tokens.greenFaint : tokens.grayPill,
                          color: service.estado === "Activo" ? tokens.greenText : tokens.grayPillTx,
                        }}>
                          {service.estado || "Inactivo"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEdit(service)}
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
                            onClick={(e) => handleDeleteClick(e, service.id)}
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
        <div style={{
          position: "fixed", inset: 0, background: "rgba(11,16,35,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50, padding: 16, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: tokens.white, borderRadius: 16,
            maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 24px 48px rgba(11,16,35,0.12)",
          }}>
            <div style={{
              padding: "18px 24px", borderBottom: `0.5px solid ${tokens.grayBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              position: "sticky", top: 0, background: tokens.white, zIndex: 10,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
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

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nombre del Servicio *</label>
                  <input
                    type="text" required
                    value={formData.nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                    placeholder="Ej: Limpieza dental"
                    style={{ ...inputStyle, borderColor: (focusedField === "nombre" || errors.nombre) ? (errors.nombre ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("nombre")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.nombre && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.nombre}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={e => handleChange('categoria', e.target.value)}
                    style={{ ...inputStyle, borderColor: (focusedField === "cat" || errors.categoria) ? (errors.categoria ? tokens.red : tokens.blue) : tokens.grayBorder }}
                    onFocus={() => setFocusedField("cat")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.categoria && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.categoria}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    rows={2}
                    value={formData.descripcion}
                    onChange={e => handleChange('descripcion', e.target.value)}
                    placeholder="Breve descripción del servicio..."
                    style={{ ...inputStyle, height: "auto", resize: "none", borderColor: focusedField === "desc" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("desc")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Precio Base *</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: tokens.grayMuted }}>$</span>
                      <input
                        type="number" required step="0.01"
                        value={formData.precio_base}
                        onChange={e => handleChange('precio_base', parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, paddingLeft: 22, borderColor: (focusedField === "precio" || errors.precio_base) ? (errors.precio_base ? tokens.red : tokens.blue) : tokens.grayBorder }}
                        onFocus={() => setFocusedField("precio")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                    {errors.precio_base && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.precio_base}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Duración (min) *</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number" required
                        value={formData.duracion_estimada}
                        onChange={e => handleChange('duracion_estimada', parseInt(e.target.value) || 30)}
                        style={{ ...inputStyle, borderColor: (focusedField === "dur" || errors.duracion_estimada) ? (errors.duracion_estimada ? tokens.red : tokens.blue) : tokens.grayBorder }}
                        onFocus={() => setFocusedField("dur")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                    {errors.duracion_estimada && <p style={{ color: tokens.red, fontSize: 11, marginTop: 4 }}>{errors.duracion_estimada}</p>}
                  </div>
                </div>
              </div>

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
                  style={{
                    padding: "9px 20px", fontSize: 13, fontWeight: 700,
                    background: tokens.blue, color: tokens.white,
                    border: "none", borderRadius: 9, cursor: "pointer",
                    fontFamily: "Inter, -apple-system, sans-serif", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.blueHover }}
                  onMouseLeave={e => { e.currentTarget.style.background = tokens.blue }}
                >
                  {editingService ? 'Actualizar' : 'Crear'} Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Servicio"
        message="¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer."
      />
    </div>
  )
}
