"use client"

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  X,
  Search,
  Check,
  ArrowUpDown,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'
import { obrasSocialesApi } from '../../api/obras-sociales'
import { ConfirmationModal } from '../ui/ConfirmationModal'
import type { ObraSocial } from '../../types'

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens

/* ─── Label styles ────────────────────────────────────────────────────── */
const labelStyle = sharedLabelStyle

const inputStyle = sharedInputStyle

export const ObrasSocialesManager: React.FC = () => {
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nombre: '', plan: '' })
  const [saving, setSaving] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  })

  useEffect(() => {
    fetchObrasSociales()
  }, [])

  const fetchObrasSociales = async () => {
    try {
      setLoading(true)
      const data = await obrasSocialesApi.listar()
      setObrasSociales(data || [])
    } catch (error) {
      console.error('Error fetching obras sociales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({ nombre: '', plan: '' })
    setShowModal(true)
  }

  const handleEdit = (os: ObraSocial) => {
    setEditingId(os.id)
    setFormData({ nombre: os.nombre, plan: '' })
    setShowModal(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setConfirmDelete({ isOpen: true, id })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return
    try {
      await obrasSocialesApi.eliminar(confirmDelete.id)
      fetchObrasSociales()
      setConfirmDelete({ isOpen: false, id: null })
    } catch (error) {
      console.error('Error deleting obra social:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) return
    try {
      setSaving(true)
      if (editingId) {
        await obrasSocialesApi.actualizar(editingId, formData)
      } else {
        await obrasSocialesApi.crear(formData)
      }
      setShowModal(false)
      fetchObrasSociales()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const filtered = obrasSociales.filter((os) =>
    os.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={pageWrapper}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Obras Sociales
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Administrá el listado de prestadoras autorizadas para el centro
          </p>
        </div>
        <button
          onClick={handleCreate}
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
          Nueva Obra Social
        </button>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center">
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 10,
          background: tokens.white, border: "1px solid rgba(37, 99, 255, 0.25)",
          borderRadius: 999, padding: "0 14px", height: 40,
        }}>
          <Search size={15} color={tokens.blue} style={{ opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Buscar obra social…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: tokens.blue, flex: 1,
              fontFamily: "Inter, -apple-system, sans-serif",
            }}
          />
        </div>
        
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
          borderRadius: 10, padding: "0 14px", height: 40, whiteSpace: "nowrap",
        }}>
          <ShieldCheck size={15} color={tokens.blue} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{filtered.length}</span>
          <span style={{ fontSize: 13, color: tokens.grayMuted }}>entidades</span>
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
                  { label: "Obra Social", sortable: true },
                  { label: "Referencia", sortable: true },
                  { label: "Estado", sortable: false },
                  { label: "", sortable: false },
                ].map((col, i) => (
                  <th key={i} style={{
                    textAlign: "left", padding: "12px 16px",
                    fontSize: 11, fontWeight: 600, color: tokens.grayMuted,
                    textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {col.label}
                      {col.sortable && <ArrowUpDown size={11} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `0.5px solid ${tokens.grayRow}` }}>
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 180, height: 11, borderRadius: 5, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 60, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 80, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    <td style={{ padding: "14px 16px" }} />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "56px 0" }}>
                    <Shield size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No hay obras sociales registradas</p>
                  </td>
                </tr>
              ) : (
                filtered.map((os, idx) => {
                  const isLast = idx === filtered.length - 1
                  return (
                    <tr
                      key={os.id}
                      style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, transition: "background 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Nombre */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: tokens.blueFaint, color: tokens.blue,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Shield size={14} />
                          </div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                            {os.nombre}
                          </p>
                        </div>
                      </td>

                      {/* ID */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 12.5, color: tokens.grayMuted, fontFamily: "monospace" }}>
                          ID: #{os.id}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          background: tokens.greenFaint, color: tokens.greenText,
                        }}>
                          <Check size={10} />
                          Activa
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEdit(os)}
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
                            onClick={(e) => handleDeleteClick(e, os.id)}
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

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(11,16,35,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50, padding: 16, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: tokens.white, borderRadius: 16,
            maxWidth: 400, width: "100%",
            boxShadow: "0 24px 48px rgba(11,16,35,0.12)",
          }}>
            <div style={{
              padding: "18px 24px", borderBottom: `0.5px solid ${tokens.grayBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                {editingId ? 'Editar Obra Social' : 'Nueva Obra Social'}
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
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input
                    type="text" required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: OSDE, Swiss Medical..."
                    style={{ ...inputStyle, borderColor: focusedField === "nombre" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("nombre")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Referencia / Plan (opcional)</label>
                  <input
                    type="text"
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    placeholder="Ej: Plan 210..."
                    style={{ ...inputStyle, borderColor: focusedField === "plan" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("plan")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `0.5px solid ${tokens.grayBorder}` }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  type="submit" disabled={saving}
                  style={{
                    padding: "9px 20px", fontSize: 13, fontWeight: 700,
                    background: tokens.blue, color: tokens.white,
                    border: "none", borderRadius: 9, cursor: "pointer",
                    fontFamily: "Inter, -apple-system, sans-serif", transition: "background 0.15s",
                    opacity: saving ? 0.7 : 1
                  }}
                  onMouseEnter={e => { if(!saving) e.currentTarget.style.background = tokens.blueHover }}
                  onMouseLeave={e => { if(!saving) e.currentTarget.style.background = tokens.blue }}
                >
                  {saving ? "Guardando..." : editingId ? "Guardar Cambios" : "Crear"}
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
        title="Eliminar Obra Social"
        message="¿Estás seguro de eliminar esta obra social? Los pacientes asociados perderán esta asignación. Esta acción no se puede deshacer."
      />
    </div>
  )
}


