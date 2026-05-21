"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  TrendingDown, 
  Calendar,
  ShieldCheck,
  User,
  AlertCircle
} from "lucide-react"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDeudores } from '../../api/cuenta-corriente';
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'
import { useToast } from "../../hooks/use-toast"

interface Deudor {
    paciente: {
        id: string;
        nombre: string;
        apellido: string;
        obra_social?: string;
    };
    deudaTotal: number;
    fechaDesde: string;
}

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens
const labelStyle = sharedLabelStyle
const inputStyle = sharedInputStyle

const DebtorsReport = () => {
    const [deudores, setDeudores] = useState<Deudor[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchDeudores = async () => {
            try {
                setLoading(true);
                const data = await getDeudores();
                setDeudores(data || []);
            } catch (error) {
                console.error("Error fetching debtors:", error);
                toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos de deudores" });
            } finally {
                setLoading(false);
            }
        };

        fetchDeudores();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            const [year, month, day] = dateString.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return format(date, "d 'de' MMM. yyyy", { locale: es });
        } catch (e) {
            return dateString;
        }
    };

    const filteredDeudores = useMemo(() => {
      if (!searchTerm) return deudores;
      const lower = searchTerm.toLowerCase();
      return deudores.filter(d => 
        d.paciente.nombre.toLowerCase().includes(lower) || 
        d.paciente.apellido.toLowerCase().includes(lower)
      );
    }, [deudores, searchTerm]);

    const { paginatedDeudores, totalPages } = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            paginatedDeudores: filteredDeudores.slice(startIndex, endIndex),
            totalPages: Math.ceil(filteredDeudores.length / itemsPerPage)
        };
    }, [filteredDeudores, currentPage]);

    return (
        <div style={pageWrapper}>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
                        Reporte de Deudores
                    </h1>
                    <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
                        Control de pacientes con saldo pendiente y cuentas corrientes
                    </p>
                </div>
                <div className="flex flex-wrap gap-2.5 items-center">
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: tokens.redFaint, padding: "8px 16px", borderRadius: 10,
                    border: `0.5px solid ${tokens.red}33`,
                  }}>
                    <TrendingDown size={16} color={tokens.red} />
                    <div>
                      <p style={{ fontSize: 10, color: tokens.redText, fontWeight: 600, textTransform: "uppercase", margin: 0 }}>Deuda Total</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: tokens.redText, margin: 0 }}>
                        {formatCurrency(deudores.reduce((acc, curr) => acc + curr.deudaTotal, 0))}
                      </p>
                    </div>
                  </div>
                </div>
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
                    placeholder="Buscar paciente por nombre o apellido…"
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
                  <Users size={15} color={tokens.blue} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{filteredDeudores.length}</span>
                  <span style={{ fontSize: 13, color: tokens.grayMuted }}>pacientes</span>
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
                          { label: "Obra Social", sortable: true },
                          { label: "Deuda Desde", sortable: true },
                          { label: "Saldo Pendiente", sortable: true },
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
                            <td style={{ padding: "11px 16px" }}><div style={{ width: 140, height: 11, borderRadius: 5, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} /></td>
                            {[...Array(3)].map((_, j) => (
                              <td key={j} style={{ padding: "11px 16px" }}><div style={{ width: 90, height: 11, borderRadius: 5, background: tokens.grayRow }} /></td>
                            ))}
                            <td style={{ padding: "11px 16px" }} />
                          </tr>
                        ))
                      ) : paginatedDeudores.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "56px 0" }}>
                            <AlertCircle size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                            <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No se encontraron pacientes deudores</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedDeudores.map((deudor, idx) => {
                          const isLast = idx === paginatedDeudores.length - 1
                          return (
                            <tr
                              key={idx}
                              style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, cursor: "pointer", transition: "background 0.12s" }}
                              onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              {/* Paciente */}
                              <td style={{ padding: "14px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: tokens.redFaint, color: tokens.red,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, fontWeight: 700
                                  }}>
                                    <User size={14} />
                                  </div>
                                  <p style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                                    {deudor.paciente.apellido}, {deudor.paciente.nombre}
                                  </p>
                                </div>
                              </td>

                              {/* Obra Social */}
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText }}>
                                  <ShieldCheck size={12} color={tokens.grayMuted} />
                                  {deudor.paciente.obra_social || 'PARTICULAR'}
                                </div>
                              </td>

                              {/* Fecha */}
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText }}>
                                  <Calendar size={12} color={tokens.grayMuted} />
                                  {formatDate(deudor.fechaDesde)}
                                </div>
                              </td>

                              {/* Saldo */}
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: tokens.redText }}>
                                  {formatCurrency(deudor.deudaTotal)}
                                </div>
                              </td>

                              {/* Action */}
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                  <button style={{
                                    padding: "6px 12px", fontSize: 11, fontWeight: 600,
                                    background: tokens.white, color: tokens.navy,
                                    border: `0.5px solid ${tokens.grayBorder}`, borderRadius: 6,
                                    cursor: "pointer", transition: "all 0.12s"
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = tokens.blue; e.currentTarget.style.color = tokens.navy; e.currentTarget.style.borderColor = tokens.blue }}
                                  onMouseLeave={e => { e.currentTarget.style.background = tokens.white; e.currentTarget.style.color = tokens.navy; e.currentTarget.style.borderColor = tokens.grayBorder }}
                                  >
                                    VER CUENTA
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
                  <div style={{ padding: "12px 16px", borderTop: `0.5px solid ${tokens.grayRow}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 12, color: tokens.grayMuted }}>Mostrando {paginatedDeudores.length} de {filteredDeudores.length} pacientes</p>
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
        </div>
    );
};

export default DebtorsReport;

