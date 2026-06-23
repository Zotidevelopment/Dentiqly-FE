"use client"

import { useState, useEffect, useMemo } from "react"
import { ConfirmationModal } from "../ui/ConfirmationModal"
import { 
  Users, 
  Plus, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X,
  CreditCard
} from "lucide-react"
import { liquidacionesApi } from "../../api/liquidaciones"
import { exportApi } from "../../api/export"
import type { Liquidacion } from "../../types"
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'
import { useToast } from "../../hooks/use-toast"
import { NuevaLiquidacionModal } from "./liquidaciones/NuevaLiquidacionModal"
import { LiquidacionDetailModal } from "./liquidaciones/LiquidacionDetailModal"

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens
const labelStyle = sharedLabelStyle
const inputStyle = sharedInputStyle

export function LiquidacionesManager() {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<Liquidacion | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 12
  const { toast } = useToast()
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const liquidacionesRes = await liquidacionesApi.listar({ limit: 500 })
      setLiquidaciones(liquidacionesRes.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las liquidaciones",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLiquidacionClick = async (id: number) => {
    try {
      const fullLiquidacion = await liquidacionesApi.obtener(id)
      setSelectedLiquidacion(fullLiquidacion)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el detalle de la liquidación",
      })
    }
  }

  const handleAnular = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Anular liquidación",
      message: "¿Está seguro de anular esta liquidación?",
      onConfirm: async () => {
        try {
          await liquidacionesApi.anular(id)
          toast({
            title: "Éxito",
            description: "Liquidación anulada correctamente",
          })
          setSelectedLiquidacion(null)
          cargarDatos()
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "No se pudo anular la liquidación",
          })
        }
        setConfirmAction(null)
      }
    })
  }

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    return `${s.toLocaleDateString('es-AR', options)} - ${e.toLocaleDateString('es-AR', options)}`
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(Number(amount))
  }

  const filteredLiquidaciones = useMemo(() => {
    if (!searchTerm) return liquidaciones
    const lower = searchTerm.toLowerCase()
    return liquidaciones.filter(l => 
      l.profesional?.nombre.toLowerCase().includes(lower) || 
      l.profesional?.apellido.toLowerCase().includes(lower)
    )
  }, [liquidaciones, searchTerm])

  const { paginatedLiquidaciones, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      paginatedLiquidaciones: filteredLiquidaciones.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredLiquidaciones.length / itemsPerPage)
    };
  }, [filteredLiquidaciones, currentPage]);

  const pageStyle: React.CSSProperties = {
    ...pageWrapper,
    background: tokens.grayBg,
  }

  return (
    <div style={pageStyle}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: tokens.navy, letterSpacing: "-0.5px", margin: 0 }}>
            Liquidaciones
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Gestioná el pago de honorarios a tus profesionales
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => exportApi.liquidaciones().catch(() => toast({ variant: "destructive", title: "Error", description: "No se pudo exportar" }))}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: tokens.blue, color: tokens.white,
              border: "none", borderRadius: 999, padding: "9px 18px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = tokens.blueHover)}
            onMouseLeave={e => (e.currentTarget.style.background = tokens.blue)}
          >
            <Download size={15} color={tokens.white} />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: tokens.blue, color: tokens.white,
              border: "none", borderRadius: 999, padding: "9px 18px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = tokens.blueHover)}
            onMouseLeave={e => (e.currentTarget.style.background = tokens.blue)}
          >
            <Plus size={15} />
            Nueva Liquidación
          </button>
        </div>
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
            placeholder="Buscar por profesional…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: tokens.blue, flex: 1,
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          />
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
          borderRadius: 10, padding: "0 14px", height: 40, whiteSpace: "nowrap",
        }}>
          <FileText size={15} color={tokens.blue} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{filteredLiquidaciones.length}</span>
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
                  { label: "Período", sortable: true },
                  { label: "Servicios", sortable: true },
                  { label: "Monto Profesional", sortable: true },
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
                    <td style={{ padding: "11px 16px" }}><div style={{ width: 120, height: 11, borderRadius: 5, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} /></td>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} style={{ padding: "11px 16px" }}><div style={{ width: 80, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                    ))}
                    <td style={{ padding: "11px 16px" }} />
                  </tr>
                ))
              ) : paginatedLiquidaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "56px 0" }}>
                    <FileText size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No hay liquidaciones que coincidan</p>
                  </td>
                </tr>
              ) : (
                paginatedLiquidaciones.map((liq, idx) => {
                  const isLast = idx === paginatedLiquidaciones.length - 1
                  return (
                    <tr
                      key={liq.id}
                      onClick={() => handleLiquidacionClick(liq.id)}
                      style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, cursor: "pointer", transition: "background 0.12s" }}
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
                            {(liq.profesional?.nombre || "").charAt(0)}{(liq.profesional?.apellido || "").charAt(0)}
                          </div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                            {liq.profesional?.apellido}, {liq.profesional?.nombre}
                          </p>
                        </div>
                      </td>

                      {/* Período */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText }}>
                          <Clock size={12} color={tokens.grayMuted} />
                          {formatDateRange(liq.periodo_inicio, liq.periodo_fin)}
                        </div>
                      </td>

                      {/* Cantidad */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 13, color: tokens.navy, fontWeight: 500 }}>
                          {liq.cantidad_prestaciones || 0} serv.
                        </div>
                      </td>

                      {/* Monto */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>
                          {formatCurrency(liq.monto_profesional)}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          background: liq.estado === "Pagada" ? tokens.greenFaint : (liq.estado === "Generada" ? tokens.orangeFaint : tokens.grayPill),
                          color: liq.estado === "Pagada" ? tokens.greenText : (liq.estado === "Generada" ? tokens.orangeText : tokens.grayPillTx),
                        }}>
                          {liq.estado === "Pagada" && <CheckCircle2 size={10} />}
                          {liq.estado}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); console.log("Download", liq.id) }}
                            title="Descargar"
                            style={{
                              width: 30, height: 30, borderRadius: 7, border: "none",
                              background: "transparent", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: tokens.grayMuted, transition: "all 0.12s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = tokens.blueFaint; e.currentTarget.style.color = tokens.blue }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}
                          >
                            <Download size={14} />
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

        {/* Pagination placeholder if needed, using internal logic as it was in original */}
        {totalPages > 1 && (
           <div style={{ padding: "12px 16px", borderTop: `0.5px solid ${tokens.grayRow}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: tokens.grayMuted }}>Página {currentPage} de {totalPages}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={{ padding: 6, borderRadius: 8, border: `0.5px solid ${tokens.grayBorder}`, background: tokens.white, cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{ padding: 6, borderRadius: 8, border: `0.5px solid ${tokens.grayBorder}`, background: tokens.white, cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
           </div>
        )}
      </div>

      <NuevaLiquidacionModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={cargarDatos}
      />

      <LiquidacionDetailModal
        open={!!selectedLiquidacion}
        onOpenChange={(open) => !open && setSelectedLiquidacion(null)}
        liquidacion={selectedLiquidacion}
        onDelete={handleAnular}
        onDownload={(id) => console.log("Download", id)}
      />

      {confirmAction && (
        <ConfirmationModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText="Confirmar"
          variant="destructive"
        />
      )}
    </div>
  )
}


