"use client"

import React, { useState, useEffect } from "react"
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'
import { configuracionApi, Setting } from "../../api/configuracion"
import {
  Save,
  Building2,
  CreditCard,
  Loader2,
  MessageSquare,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Wallet,
  Calendar,
} from "lucide-react"
import { useToast } from "../../hooks/use-toast"

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens

/* ─── Label styles ────────────────────────────────────────────────────── */
const labelStyle = sharedLabelStyle

const inputStyle = sharedInputStyle

export const SettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"general" | "banking" | "horarios">("general")
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { toast } = useToast()

  // Form states
  const [bankData, setBankData] = useState({
    bank_name: "",
    bank_account_holder: "",
    bank_cbu: "",
    bank_alias: "",
    bank_whatsapp: "",
    sena_enabled: false,
    sena_monto: ""
  })

  const [generalData, setGeneralData] = useState({
    clinic_name: "",
    clinic_address: "",
    clinic_phone: "",
    clinic_google_maps: "",
    online_booking_enabled: true
  })

  const DAY_LABELS: Record<string, string> = {
    lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
    jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo"
  }
  const DAY_KEYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

  type Rango = { inicio: string; fin: string }
  type DiaHorario = { activo: boolean; rangos: Rango[] }
  type HorariosNegocio = Record<string, DiaHorario>

  const defaultHorarios: HorariosNegocio = {
    lunes:     { activo: true,  rangos: [{ inicio: "09:00", fin: "18:00" }] },
    martes:    { activo: true,  rangos: [{ inicio: "09:00", fin: "18:00" }] },
    miercoles: { activo: true,  rangos: [{ inicio: "09:00", fin: "18:00" }] },
    jueves:    { activo: true,  rangos: [{ inicio: "09:00", fin: "18:00" }] },
    viernes:   { activo: true,  rangos: [{ inicio: "09:00", fin: "18:00" }] },
    sabado:    { activo: false, rangos: [{ inicio: "09:00", fin: "13:00" }] },
    domingo:   { activo: false, rangos: [] },
  }

  const [horariosData, setHorariosData] = useState<HorariosNegocio>(defaultHorarios)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await configuracionApi.listar()
      setSettings(data)
      
      const bankFields: any = { ...bankData }
      const generalFields: any = { ...generalData }
      
      data.forEach(s => {
        if (s.clave === "sena_enabled") {
          bankFields.sena_enabled = s.valor === true || s.valor === "true"
        } else if (s.clave === "sena_monto") {
          bankFields.sena_monto = String(s.valor || "")
        } else if (s.clave in bankFields) {
          bankFields[s.clave] = s.valor
        }
        if (s.clave === "online_booking_enabled") {
          generalFields.online_booking_enabled = s.valor === true || s.valor === "true"
        } else if (s.clave in generalFields) {
          generalFields[s.clave] = s.valor
        }
        if (s.clave === "business_hours" && s.valor) {
          try {
            const parsed = typeof s.valor === "string" ? JSON.parse(s.valor) : s.valor
            setHorariosData(parsed)
          } catch { /* keep defaults */ }
        }
      })
      setBankData(bankFields)
      setGeneralData(generalFields)
    } catch (error) {
      console.error("Error:", error)
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la configuración" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneralData = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let mapsUrl = generalData.clinic_google_maps.trim()
      if (mapsUrl.includes('<iframe')) {
        const match = mapsUrl.match(/src="([^"]+)"/)
        if (match && match[1]) mapsUrl = match[1]
      } else {
        const urlMatch = mapsUrl.match(/https:\/\/www\.google\.com\/maps\/embed\?[^ \n\r\t"]+/)
        if (urlMatch) mapsUrl = urlMatch[0]
      }
      
      const updatedData = { ...generalData, clinic_google_maps: mapsUrl }
      const entries = Object.entries(updatedData)
      for (const [key, value] of entries) {
        const tipo = key === "online_booking_enabled" ? "boolean" : "string"
        await configuracionApi.crear({ clave: key, valor: value, tipo: tipo, categoria: "general" })
      }
      toast({ title: "Éxito", description: "Configuración general actualizada" })
      fetchSettings()
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBankData = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { sena_enabled, sena_monto, ...bankFields } = bankData
      for (const [key, value] of Object.entries(bankFields)) {
        await configuracionApi.crear({ clave: key, valor: value, tipo: "string", categoria: "banking" })
      }
      await configuracionApi.crear({ clave: "sena_enabled", valor: sena_enabled, tipo: "boolean", categoria: "banking" })
      await configuracionApi.crear({ clave: "sena_monto", valor: sena_monto ? Number(sena_monto) : 0, tipo: "number", categoria: "banking" })
      toast({ title: "Éxito", description: "Datos bancarios actualizados" })
      fetchSettings()
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveHorarios = async () => {
    setSaving(true)
    try {
      await configuracionApi.crear({
        clave: "business_hours",
        valor: JSON.stringify(horariosData),
        tipo: "json",
        categoria: "horarios"
      })
      toast({ title: "Éxito", description: "Horarios de atención actualizados" })
      fetchSettings()
    } catch {
      toast({ title: "Error", description: "No se pudieron guardar los horarios.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const updateDia = (dia: string, field: string, value: any) => {
    setHorariosData(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value }
    }))
  }

  const updateRango = (dia: string, index: number, field: "inicio" | "fin", value: string) => {
    setHorariosData(prev => {
      const rangos = [...prev[dia].rangos]
      rangos[index] = { ...rangos[index], [field]: value }
      return { ...prev, [dia]: { ...prev[dia], rangos } }
    })
  }

  const addRango = (dia: string) => {
    setHorariosData(prev => {
      const rangos = [...prev[dia].rangos, { inicio: "14:00", fin: "18:00" }]
      return { ...prev, [dia]: { ...prev[dia], rangos } }
    })
  }

  const removeRango = (dia: string, index: number) => {
    setHorariosData(prev => {
      const rangos = prev[dia].rangos.filter((_, i) => i !== index)
      return { ...prev, [dia]: { ...prev[dia], rangos } }
    })
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 12 }}>
        <Loader2 className="animate-spin" color={tokens.blue} size={32} />
        <p style={{ fontSize: 14, color: tokens.grayMuted, fontWeight: 500 }}>Cargando configuración…</p>
      </div>
    )
  }

  return (
    <div style={pageWrapper}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Configuración del Sistema
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Personalizá los detalles de tu clínica y las preferencias de reserva
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: tokens.grayRow, padding: 4, borderRadius: 12, overflowX: "auto", maxWidth: "100%" }}>
        {[
          { id: "general", label: "General", icon: Building2 },
          { id: "horarios", label: "Horarios", icon: Clock },
          { id: "banking", label: "Pagos y Cuentas", icon: CreditCard },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "general" | "banking" | "horarios")}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 9,
              border: "none", background: activeTab === tab.id ? tokens.white : "transparent",
              color: activeTab === tab.id ? tokens.blue : tokens.grayMuted,
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500, cursor: "pointer",
              boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
              transition: "all 0.15s", fontFamily: "Inter, -apple-system, sans-serif"
            }}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content Card ── */}
      <div style={{ background: tokens.white, borderRadius: 16, border: `0.5px solid ${tokens.grayBorder}`, overflow: "hidden" }}>
        {activeTab === "general" && (
          <form onSubmit={handleSaveGeneralData} style={{ padding: 32 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: tokens.navy, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <Building2 size={16} color={tokens.blue} /> Información Básica
                </h3>
                <div>
                  <label style={labelStyle}>Nombre de la Clínica</label>
                  <input type="text" value={generalData.clinic_name} onChange={e => setGeneralData({...generalData, clinic_name: e.target.value})} style={inputStyle} placeholder="Ej: Dental Center" />
                </div>
                <div>
                  <label style={labelStyle}>Dirección Principal</label>
                  <input type="text" value={generalData.clinic_address} onChange={e => setGeneralData({...generalData, clinic_address: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono de Contacto</label>
                  <input type="text" value={generalData.clinic_phone} onChange={e => setGeneralData({...generalData, clinic_phone: e.target.value})} style={inputStyle} />
                </div>

                <div style={{ borderTop: `1px solid ${tokens.grayRow}`, paddingTop: 20, marginTop: 10 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: tokens.navy, margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={16} color={tokens.blue} /> Reserva de Turnos Online
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: generalData.online_booking_enabled ? tokens.blueFaint : tokens.grayBg, borderRadius: 12, border: `1px solid ${generalData.online_booking_enabled ? tokens.blue + "33" : tokens.grayBorder}`, transition: "all 0.15s" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: tokens.navy, margin: 0 }}>Habilitar reserva online</p>
                      <p style={{ fontSize: 11, color: tokens.grayMuted, margin: "2px 0 0 0" }}>
                        {generalData.online_booking_enabled ? "Los pacientes pueden reservar turnos libremente desde la web" : "Las reservas online públicas estarán bloqueadas"}
                      </p>
                    </div>
                    <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={generalData.online_booking_enabled}
                        onChange={e => setGeneralData({...generalData, online_booking_enabled: e.target.checked})}
                        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                      />
                      <div style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: generalData.online_booking_enabled ? tokens.blue : "#D1D5DB",
                        transition: "background 0.2s", position: "relative"
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 10,
                          background: "white", position: "absolute", top: 2,
                          left: generalData.online_booking_enabled ? 22 : 2,
                          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                        }} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: tokens.navy, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} color={tokens.blue} /> Ubicación Digital
                </h3>
                <div>
                  <label style={labelStyle}>Google Maps Embed URL</label>
                  <textarea 
                    value={generalData.clinic_google_maps} 
                    onChange={e => setGeneralData({...generalData, clinic_google_maps: e.target.value})} 
                    style={{ ...inputStyle, height: 100, resize: "none", fontSize: 11, fontFamily: "monospace" }} 
                    placeholder="Pega el link de 'Insertar mapa'..."
                  />
                  <p style={{ fontSize: 11, color: tokens.grayMuted, marginTop: 8 }}>Este mapa se mostrará en el pie de página de las reservas.</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `0.5px solid ${tokens.grayRow}`, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit" disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: tokens.blue, color: tokens.white,
                  border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", transition: "background 0.15s", opacity: saving ? 0.7 : 1
                }}
                onMouseEnter={e => { if(!saving) e.currentTarget.style.background = tokens.blueHover }}
                onMouseLeave={e => { if(!saving) e.currentTarget.style.background = tokens.blue }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Guardar Configuración
              </button>
            </div>
          </form>
        )}

        {activeTab === "horarios" && (
          <div style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: tokens.navy, margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} color={tokens.blue} /> Horarios de Atención
              </h3>
              <p style={{ fontSize: 12, color: tokens.grayMuted, margin: 0 }}>
                Configurá los días y horarios en que tu clínica atiende. Estos horarios se muestran en el sistema de reservas online.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DAY_KEYS.map(dia => {
                const diaData = horariosData[dia]
                return (
                  <div
                    key={dia}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 16px",
                      background: diaData.activo ? tokens.white : tokens.grayBg,
                      borderRadius: 12, border: `1px solid ${diaData.activo ? tokens.grayBorder : "#E8E8E8"}`,
                      transition: "all 0.15s"
                    }}
                  >
                    {/* Day name + toggle */}
                    <div style={{ width: 120, flexShrink: 0, paddingTop: 6 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={diaData.activo}
                          onChange={e => updateDia(dia, "activo", e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: tokens.blue }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 600, color: diaData.activo ? tokens.navy : tokens.grayMuted }}>
                          {DAY_LABELS[dia]}
                        </span>
                      </label>
                    </div>

                    {/* Time ranges */}
                    <div style={{ flex: 1 }}>
                      {diaData.activo ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {diaData.rangos.map((rango, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="time"
                                value={rango.inicio}
                                onChange={e => updateRango(dia, idx, "inicio", e.target.value)}
                                style={{ ...inputStyle, width: 130, padding: "6px 10px", fontSize: 13 }}
                              />
                              <span style={{ fontSize: 12, color: tokens.grayMuted, fontWeight: 500 }}>a</span>
                              <input
                                type="time"
                                value={rango.fin}
                                onChange={e => updateRango(dia, idx, "fin", e.target.value)}
                                style={{ ...inputStyle, width: 130, padding: "6px 10px", fontSize: 13 }}
                              />
                              {diaData.rangos.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRango(dia, idx)}
                                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: tokens.red, display: "flex" }}
                                  title="Eliminar rango"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {diaData.rangos.length < 3 && (
                            <button
                              type="button"
                              onClick={() => addRango(dia)}
                              style={{
                                display: "flex", alignItems: "center", gap: 4, background: "none",
                                border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                                color: tokens.blue, padding: "2px 0"
                              }}
                            >
                              <Plus size={12} /> Agregar rango horario
                            </button>
                          )}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: tokens.grayMuted, fontStyle: "italic", margin: 0, paddingTop: 6 }}>
                          Cerrado
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: `0.5px solid ${tokens.grayRow}`, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button" onClick={handleSaveHorarios} disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: tokens.blue, color: tokens.white,
                  border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", transition: "background 0.15s", opacity: saving ? 0.7 : 1
                }}
                onMouseEnter={e => { if(!saving) e.currentTarget.style.background = tokens.blueHover }}
                onMouseLeave={e => { if(!saving) e.currentTarget.style.background = tokens.blue }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Guardar Horarios
              </button>
            </div>
          </div>
        )}

        {activeTab === "banking" && (
          <form onSubmit={handleSaveBankData} style={{ padding: 32 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: tokens.navy, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <CreditCard size={16} color={tokens.blue} /> Datos de Transferencia
                </h3>
                <div>
                  <label style={labelStyle}>Entidad Bancaria</label>
                  <input type="text" value={bankData.bank_name} onChange={e => setBankData({...bankData, bank_name: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Titular de Cuenta</label>
                  <input type="text" value={bankData.bank_account_holder} onChange={e => setBankData({...bankData, bank_account_holder: e.target.value})} style={inputStyle} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>CBU / CVU</label>
                    <input type="text" value={bankData.bank_cbu} onChange={e => setBankData({...bankData, bank_cbu: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Alias</label>
                    <input type="text" value={bankData.bank_alias} onChange={e => setBankData({...bankData, bank_alias: e.target.value})} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: tokens.navy, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquare size={16} color={tokens.green} /> WhatsApp de Comprobantes
                </h3>
                <div>
                  <label style={labelStyle}>Número de WhatsApp</label>
                  <input type="text" value={bankData.bank_whatsapp} onChange={e => setBankData({...bankData, bank_whatsapp: e.target.value})} style={inputStyle} placeholder="54911..." />
                </div>

                <div style={{ borderTop: `1px solid ${tokens.grayRow}`, paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: tokens.navy, margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <Wallet size={16} color={tokens.blue} /> Seña / Depósito
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: bankData.sena_enabled ? tokens.blueFaint : tokens.grayBg, borderRadius: 12, border: `1px solid ${bankData.sena_enabled ? tokens.blue + "33" : tokens.grayBorder}`, marginBottom: 12, transition: "all 0.15s" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: tokens.navy, margin: 0 }}>Requerir seña en reservas online</p>
                      <p style={{ fontSize: 11, color: tokens.grayMuted, margin: "2px 0 0 0" }}>
                        {bankData.sena_enabled ? "Los pacientes verán el paso de pago de seña al reservar" : "El paso de seña no se mostrará en las reservas"}
                      </p>
                    </div>
                    <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={bankData.sena_enabled}
                        onChange={e => setBankData({...bankData, sena_enabled: e.target.checked})}
                        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                      />
                      <div style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: bankData.sena_enabled ? tokens.blue : "#D1D5DB",
                        transition: "background 0.2s", position: "relative"
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 10,
                          background: "white", position: "absolute", top: 2,
                          left: bankData.sena_enabled ? 22 : 2,
                          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                        }} />
                      </div>
                    </label>
                  </div>
                  {bankData.sena_enabled && (
                    <div>
                      <label style={labelStyle}>Monto de la seña ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={bankData.sena_monto}
                        onChange={e => setBankData({...bankData, sena_monto: e.target.value})}
                        style={inputStyle}
                        placeholder="Ej: 5000"
                      />
                    </div>
                  )}
                </div>

                <div style={{ padding: 16, background: tokens.blueFaint, borderRadius: 12, border: `0.5px solid ${tokens.blue}22` }}>
                  <p style={{ fontSize: 12, color: tokens.navy, fontWeight: 600, margin: "0 0 4px 0" }}>Importante</p>
                  <p style={{ fontSize: 11.5, color: tokens.grayText, margin: 0, lineHeight: 1.5 }}>
                    Estos datos bancarios se presentarán al finalizar una reserva online para que el paciente envíe el comprobante de seña.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `0.5px solid ${tokens.grayRow}`, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit" disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: tokens.blue, color: tokens.white,
                  border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", transition: "background 0.15s", opacity: saving ? 0.7 : 1
                }}
                onMouseEnter={e => { if(!saving) e.currentTarget.style.background = tokens.blueHover }}
                onMouseLeave={e => { if(!saving) e.currentTarget.style.background = tokens.blue }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Actualizar Datos de Pago
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}

