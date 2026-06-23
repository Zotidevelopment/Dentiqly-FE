"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Calendar,
  Trash2,
  Plus,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react"
import { feriadosApi, type Feriado } from "../../api/feriados"
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'
import { useToast } from "../../hooks/use-toast"
import { ConfirmationModal } from "../ui/ConfirmationModal"

const tokens = sharedTokens
const labelStyle = sharedLabelStyle
const inputStyle = sharedInputStyle

export const FeriadosManager: React.FC = () => {
  const { toast } = useToast()
  const [feriados, setFeriados] = useState<Feriado[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ fecha: "", descripcion: "" })
  const [saving, setSaving] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)

  useEffect(() => {
    fetchFeriados()
  }, [selectedYear])

  const fetchFeriados = async () => {
    try {
      setLoading(true)
      const data = await feriadosApi.listar(selectedYear)
      setFeriados(data || [])
    } catch (error) {
      console.error("Error fetching holidays:", error)
      setFeriados([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await feriadosApi.crear(formData)
      setShowModal(false)
      setFormData({ fecha: "", descripcion: "" })
      fetchFeriados()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Error al crear feriado" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este feriado?",
      onConfirm: async () => {
        try {
          await feriadosApi.eliminar(id)
          fetchFeriados()
        } catch (error) {
          console.error("Error deleting holiday:", error)
          toast({ variant: "destructive", title: "Error", description: "Error al eliminar el feriado" })
        }
      }
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  return (
    <div style={pageWrapper}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Gestión de Feriados
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Administrá los días no laborables para el calendario de turnos
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "0 14px", height: 40, borderRadius: 10,
              border: `0.5px solid ${tokens.grayBorder}`, background: tokens.white,
              fontSize: 13, fontWeight: 600, color: tokens.navy, cursor: "pointer",
              outline: "none", fontFamily: "Inter, -apple-system, sans-serif"
            }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
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
            Nuevo Feriado
          </button>
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
                  { label: "Fecha", sortable: true },
                  { label: "Descripción / Motivo", sortable: true },
                  { label: "Año", sortable: false },
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
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 140, height: 11, borderRadius: 5, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} /></td>
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 200, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 60, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    <td style={{ padding: "14px 16px" }} />
                  </tr>
                ))
              ) : feriados.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "56px 0" }}>
                    <Calendar size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No hay feriados para {selectedYear}</p>
                  </td>
                </tr>
              ) : (
                feriados.map((feriado, idx) => {
                  const isLast = idx === feriados.length - 1
                  return (
                    <tr
                      key={feriado.id}
                      style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, transition: "background 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Fecha */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: tokens.redFaint, color: tokens.red,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, margin: 0, textTransform: "capitalize" }}>
                              {formatDate(feriado.fecha)}
                            </p>
                            <p style={{ fontSize: 11, color: tokens.grayMuted, margin: 0 }}>
                              {feriado.fecha}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Descripción */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 13.5, color: tokens.grayText, fontWeight: 500 }}>
                          {feriado.descripcion || "Sin descripción"}
                        </div>
                      </td>

                      {/* Año */}
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          display: "inline-flex", padding: "3px 8px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          background: tokens.grayPill || "#F1F5F9",
                          color: tokens.grayMuted,
                        }}>
                          {new Date(feriado.fecha + "T12:00:00").getFullYear()}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleDelete(feriado.id)}
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

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmationModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            confirmAction.onConfirm()
            setConfirmAction(null)
          }}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText="Eliminar"
          variant="destructive"
        />
      )}

      {/* Modal Crear Feriado */}
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
                Agregar Feriado
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
            <form onSubmit={handleCreate} style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Fecha *</label>
                  <input
                    type="date" required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    style={{ ...inputStyle, borderColor: focusedField === "fecha" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("fecha")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej: Día de la Independencia"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    style={{ ...inputStyle, borderColor: focusedField === "desc" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("desc")}
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
                  {saving ? "Guardando..." : "Agregar Feriado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


