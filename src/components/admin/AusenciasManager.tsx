"use client"

import React, { useState, useEffect } from 'react';
import {
  CalendarOff,
  Plus,
  Trash2,
  User,
  X,
  Search,
  ArrowUpDown,
  Clock,
  Calendar,
  RefreshCcw
} from 'lucide-react';
import { ausenciasApi, Ausencia } from '../../api/ausencias';
import { profesionalesApi } from '../../api/profesionales';
import type { Profesional } from '../../types';
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'
import { useToast } from "../../hooks/use-toast"
import { ConfirmationModal } from "../ui/ConfirmationModal"

const tokens = sharedTokens
const labelStyle = sharedLabelStyle
const inputStyle = sharedInputStyle

export const AusenciasManager: React.FC = () => {
  const { toast } = useToast()
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    profesional_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
    es_recurrente: false,
    dia_semana: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ausenciasData, profesionalesData] = await Promise.all([
        ausenciasApi.listar(),
        profesionalesApi.listar({ limit: 100 })
      ]);
      setAusencias(ausenciasData || []);
      setProfesionales(profesionalesData.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos de ausencias" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Está seguro de eliminar este registro de ausencia/vacaciones?",
      onConfirm: async () => {
        try {
          await ausenciasApi.eliminar(id);
          setAusencias(ausencias.filter(a => a.id !== id));
        } catch (err) {
          console.error('Error al eliminar:', err);
          toast({ variant: "destructive", title: "Error", description: "Error al eliminar la ausencia" });
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.profesional_id || !formData.fecha_inicio || !formData.fecha_fin) {
        toast({ variant: "destructive", title: "Validación", description: "Por favor complete todos los campos obligatorios" });
        return;
      }

      await ausenciasApi.crear({
        profesional_id: Number(formData.profesional_id),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        hora_inicio: formData.hora_inicio || undefined,
        hora_fin: formData.hora_fin || undefined,
        motivo: formData.motivo,
        es_recurrente: formData.es_recurrente,
        dia_semana: formData.es_recurrente ? Number(formData.dia_semana) : undefined
      });

      setIsModalOpen(false);
      setFormData({ profesional_id: '', fecha_inicio: '', fecha_fin: '', hora_inicio: '', hora_fin: '', motivo: '', es_recurrente: false, dia_semana: '' });
      fetchData();
    } catch (err) {
      console.error('Error al crear:', err);
      toast({ variant: "destructive", title: "Error", description: "Error al crear el registro de ausencia" });
    }
  };

  const filteredAusencias = ausencias.filter(a => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    const profName = a.profesional ? `${a.profesional.apellido} ${a.profesional.nombre}`.toLowerCase() : "";
    return profName.includes(lower) || (a.motivo || "").toLowerCase().includes(lower);
  });

  return (
    <div style={pageWrapper}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Ausencias y Vacaciones
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Gestioná los periodos de inactividad o licencias del staff médico
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
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
          Registrar Ausencia
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
            placeholder="Buscar por profesional o motivo…"
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
          <CalendarOff size={15} color={tokens.blue} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{filteredAusencias.length}</span>
          <span style={{ fontSize: 13, color: tokens.grayMuted }}>registros</span>
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
                  { label: "Desde", sortable: true },
                  { label: "Hasta / Recurrencia", sortable: true },
                  { label: "Motivo", sortable: false },
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
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 100, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 120, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    <td style={{ padding: "14px 16px" }}><div style={{ width: 80, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    <td style={{ padding: "14px 16px" }} />
                  </tr>
                ))
              ) : filteredAusencias.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "56px 0" }}>
                    <CalendarOff size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No hay ausencias registradas</p>
                  </td>
                </tr>
              ) : (
                filteredAusencias.map((a, idx) => {
                  const isLast = idx === filteredAusencias.length - 1
                  return (
                    <tr
                      key={a.id}
                      style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, transition: "background 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Profesional */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: tokens.blueFaint, color: tokens.blue,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700
                          }}>
                            {(a.profesional?.nombre || "").charAt(0)}{(a.profesional?.apellido || "").charAt(0)}
                          </div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                            {a.profesional?.apellido}, {a.profesional?.nombre}
                          </p>
                        </div>
                      </td>

                      {/* Desde */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 13, color: tokens.grayText }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Calendar size={12} color={tokens.grayMuted} />
                            {new Date(a.fecha_inicio).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                          </div>
                          {a.hora_inicio && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: tokens.blue, fontWeight: 600, marginTop: 2 }}>
                              <Clock size={11} /> {a.hora_inicio.substring(0, 5)} hs
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Hasta */}
                      <td style={{ padding: "11px 16px" }}>
                        {a.es_recurrente ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: tokens.orangeText, background: tokens.orangeFaint, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, width: "fit-content" }}>
                            <RefreshCcw size={12} />
                            Cada {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][a.dia_semana || 0]}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: tokens.grayText }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Calendar size={12} color={tokens.grayMuted} />
                              {new Date(a.fecha_fin).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                            </div>
                            {a.hora_fin && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: tokens.blue, fontWeight: 600, marginTop: 2 }}>
                                <Clock size={11} /> {a.hora_fin.substring(0, 5)} hs
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Motivo */}
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          display: "inline-flex", padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          background: tokens.grayPill, color: tokens.grayPillTx
                        }}>
                          {a.motivo || 'Sin motivo'}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleDelete(a.id)}
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

      {/* Modal Crear Ausencia */}
      {isModalOpen && (
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
                Registrar Ausencia
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  <label style={labelStyle}>Profesional *</label>
                  <select
                    value={formData.profesional_id}
                    onChange={(e) => setFormData({ ...formData, profesional_id: e.target.value })}
                    style={{ ...inputStyle, borderColor: focusedField === "prof" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("prof")}
                    onBlur={() => setFocusedField(null)}
                    required
                  >
                    <option value="">Seleccione un profesional</option>
                    {profesionales.map(p => (
                      <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Desde Fecha *</label>
                    <input
                      type="date" required
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      style={{ ...inputStyle, borderColor: focusedField === "finic" ? tokens.blue : tokens.grayBorder }}
                      onFocus={() => setFocusedField("finic")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Hasta Fecha *</label>
                    <input
                      type="date" required
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                      min={formData.fecha_inicio}
                      style={{ ...inputStyle, borderColor: focusedField === "ffin" ? tokens.blue : tokens.grayBorder }}
                      onFocus={() => setFocusedField("ffin")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Hora Inicio (Opcional)</label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      style={{ ...inputStyle, borderColor: focusedField === "hinic" ? tokens.blue : tokens.grayBorder }}
                      onFocus={() => setFocusedField("hinic")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Hora Fin (Opcional)</label>
                    <input
                      type="time"
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      style={{ ...inputStyle, borderColor: focusedField === "hfin" ? tokens.blue : tokens.grayBorder }}
                      onFocus={() => setFocusedField("hfin")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div style={{ background: tokens.blueFaint, padding: 16, borderRadius: 12, border: `0.5px solid ${tokens.blue}22` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      id="es_recurrente"
                      checked={formData.es_recurrente}
                      onChange={(e) => setFormData({ ...formData, es_recurrente: e.target.checked })}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    <label htmlFor="es_recurrente" style={{ fontSize: 13, fontWeight: 600, color: tokens.navy, cursor: "pointer" }}>
                      ¿Es un bloqueo recurrente?
                    </label>
                  </div>
                  {formData.es_recurrente && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ ...labelStyle, color: tokens.blue }}>Día de la semana</label>
                      <select
                        value={formData.dia_semana}
                        onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                        style={{ ...inputStyle, background: tokens.white }}
                        required={formData.es_recurrente}
                      >
                        <option value="">Seleccione un día</option>
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miércoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábado</option>
                        <option value="0">Domingo</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Motivo (Opcional)</label>
                  <input
                    type="text"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Ej: Vacaciones, Congreso, etc."
                    style={{ ...inputStyle, borderColor: focusedField === "mot" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("mot")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `0.5px solid ${tokens.grayBorder}` }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  onMouseEnter={e => (e.currentTarget.style.background = tokens.blueHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = tokens.blue)}
                >
                  Guardar Ausencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
