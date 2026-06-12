"use client"

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Minus,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Download,
  Trash2,
} from "lucide-react"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cuentaCorrienteApi } from '../../api/cuenta-corriente';
import { exportApi } from '../../api/export';
import { useToast } from '../../hooks/use-toast';
import { NewMovementModal } from './cashflow/NewMovementModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'

/* ─── Dentiqly design tokens ─────────────────────────────────────────── */
const tokens = sharedTokens
const labelStyle = sharedLabelStyle
const inputStyle = sharedInputStyle

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function CashFlow() {
    const { toast } = useToast();
    const [movimientos, setMovimientos] = useState<any[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Ingreso' | 'Egreso'>('Ingreso');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmAction, setConfirmAction] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
    const itemsPerPage = 12;

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await cuentaCorrienteApi.getFlujoCaja();
            setMovimientos(data.movimientos || []);
            setBalance(data.balance || 0);
        } catch (error) {
            console.error("Error fetching cash flow:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (type: 'Ingreso' | 'Egreso') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleMovementRegistered = () => {
        fetchData();
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        setConfirmAction({
            isOpen: true,
            title: "Confirmar eliminación",
            message: "¿Estás seguro de que deseas eliminar este movimiento de caja?",
            onConfirm: async () => {
                try {
                    await cuentaCorrienteApi.eliminar(id);
                    toast({ title: "Éxito", description: "El movimiento ha sido eliminado correctamente." });
                    fetchData();
                } catch (error) {
                    console.error('Error deleting movement:', error);
                    toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el movimiento." });
                }
                setConfirmAction(null);
            }
        });
    };

    const financeStats = useMemo(() => {
        const today = new Date();
        
        const getMonday = (d: Date) => {
            const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        const startOfWeek = getMonday(today);

        let dayIncome = 0;
        let dayEgress = 0;
        let weekIncome = 0;
        let weekEgress = 0;
        let monthIncome = 0;
        let monthEgress = 0;

        let dayCashIncome = 0;
        let dayCashEgress = 0;
        let weekCashIncome = 0;
        let weekCashEgress = 0;

        movimientos.forEach(m => {
            const amount = parseFloat(m.monto) || 0;
            const mDate = parseLocalDate(m.fecha);
            const isCash = (m.forma_pago || "").toLowerCase() === 'efectivo';

            // Check Day
            if (mDate.toDateString() === today.toDateString()) {
                if (m.tipo === 'Ingreso') {
                    dayIncome += amount;
                    if (isCash) dayCashIncome += amount;
                } else {
                    dayEgress += amount;
                    if (isCash) dayCashEgress += amount;
                }
            }

            // Check Week
            if (mDate >= startOfWeek && mDate <= today) {
                if (m.tipo === 'Ingreso') {
                    weekIncome += amount;
                    if (isCash) weekCashIncome += amount;
                } else {
                    weekEgress += amount;
                    if (isCash) weekCashEgress += amount;
                }
            }

            // Check Month
            if (mDate.getFullYear() === today.getFullYear() && mDate.getMonth() === today.getMonth()) {
                if (m.tipo === 'Ingreso') monthIncome += amount;
                else monthEgress += amount;
            }
        });

        return {
            day: { income: dayIncome, egress: dayEgress, balance: dayIncome - dayEgress },
            week: { income: weekIncome, egress: weekEgress, balance: weekIncome - weekEgress },
            month: { income: monthIncome, egress: monthEgress, balance: monthIncome - monthEgress },
            cash: {
                dayBalance: dayCashIncome - dayCashEgress,
                weekBalance: weekCashIncome - weekCashEgress,
                dayIncome: dayCashIncome,
                dayEgress: dayCashEgress,
                weekIncome: weekCashIncome,
                weekEgress: weekCashEgress
            }
        };
    }, [movimientos]);

    const filteredMovimientos = useMemo(() => {
      if (!searchTerm) return movimientos;
      const lower = searchTerm.toLowerCase();
      return movimientos.filter(m => 
        (m.pacienteNombre || "").toLowerCase().includes(lower) || 
        (m.descripcion || "").toLowerCase().includes(lower) ||
        (m.forma_pago || "").toLowerCase().includes(lower)
      );
    }, [movimientos, searchTerm]);

    const { paginatedMovimientos, totalPages } = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            paginatedMovimientos: filteredMovimientos.slice(startIndex, endIndex),
            totalPages: Math.ceil(filteredMovimientos.length / itemsPerPage)
        };
    }, [filteredMovimientos, currentPage]);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 2
      }).format(amount);
    };

    return (
        <div style={pageWrapper}>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
                        Flujo de Caja
                    </h1>
                    <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
                        Movimientos históricos de ingresos y egresos de la clínica
                    </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => exportApi.flujoCaja().catch(() => toast({ variant: "destructive", title: "Error", description: "No se pudo exportar el flujo de caja" }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: tokens.white, color: tokens.grayText,
                        border: `0.5px solid ${tokens.grayBorder}`, borderRadius: 10, padding: "9px 18px",
                        fontSize: 13, fontWeight: 500, cursor: "pointer",
                        fontFamily: "Inter, -apple-system, sans-serif",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = tokens.grayBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = tokens.white)}
                    >
                      <Download size={15} />
                      Exportar
                    </button>
                    <button
                      onClick={() => handleOpenModal('Egreso')}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: "#2563FF", color: "#FFFFFF",
                        border: "none", borderRadius: 10, padding: "9px 18px",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                        fontFamily: "Inter, -apple-system, sans-serif",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1E40AF")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#2563FF")}
                    >
                      <Minus size={15} />
                      Extraer / Deuda
                    </button>
                    <button
                      onClick={() => handleOpenModal('Ingreso')}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: "#2563FF", color: "#FFFFFF",
                        border: "none", borderRadius: 10, padding: "9px 18px",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                        fontFamily: "Inter, -apple-system, sans-serif",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1E40AF")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#2563FF")}
                    >
                      <Plus size={15} />
                      Registrar Ingreso
                    </button>
                </div>
            </div>

            {/* ── Dashboard Cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 24 }}>
              {/* Balance Histórico */}
              <div style={{ background: tokens.white, padding: 20, borderRadius: 16, border: `0.5px solid ${tokens.grayBorder}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: tokens.grayMuted, textTransform: "uppercase" }}>Balance Histórico</span>
                  <div style={{ padding: 6, borderRadius: 8, background: balance >= 0 ? tokens.greenFaint : tokens.redFaint }}>
                    {balance >= 0 ? <TrendingUp size={16} color={tokens.green} /> : <TrendingDown size={16} color={tokens.red} />}
                  </div>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: balance >= 0 ? tokens.greenText : tokens.redText, margin: 0 }}>
                  {formatCurrency(balance)}
                </h2>
              </div>

              {/* Totales Diario */}
              <div style={{ background: tokens.white, padding: 20, borderRadius: 16, border: `0.5px solid ${tokens.grayBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: tokens.grayMuted, textTransform: "uppercase" }}>Totales de Hoy</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: tokens.blue, background: tokens.blueFaint, padding: "2px 8px", borderRadius: 6 }}>Diario</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Ingresos:</span>
                    <span style={{ fontWeight: 655, color: tokens.greenText }}>+ {formatCurrency(financeStats.day.income)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Egresos:</span>
                    <span style={{ fontWeight: 655, color: tokens.redText }}>- {formatCurrency(financeStats.day.egress)}</span>
                  </div>
                  <div style={{ borderTop: `0.5px solid ${tokens.grayBorder}`, marginTop: 6, paddingTop: 4, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: tokens.navy }}>Balance:</span>
                    <span style={{ color: financeStats.day.balance >= 0 ? tokens.greenText : tokens.redText }}>
                      {financeStats.day.balance >= 0 ? '+' : ''} {formatCurrency(financeStats.day.balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Totales Semanal */}
              <div style={{ background: tokens.white, padding: 20, borderRadius: 16, border: `0.5px solid ${tokens.grayBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: tokens.grayMuted, textTransform: "uppercase" }}>Esta Semana</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: "2px 8px", borderRadius: 6 }}>Semanal</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Ingresos:</span>
                    <span style={{ fontWeight: 655, color: tokens.greenText }}>+ {formatCurrency(financeStats.week.income)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Egresos:</span>
                    <span style={{ fontWeight: 655, color: tokens.redText }}>- {formatCurrency(financeStats.week.egress)}</span>
                  </div>
                  <div style={{ borderTop: `0.5px solid ${tokens.grayBorder}`, marginTop: 6, paddingTop: 4, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: tokens.navy }}>Balance:</span>
                    <span style={{ color: financeStats.week.balance >= 0 ? tokens.greenText : tokens.redText }}>
                      {financeStats.week.balance >= 0 ? '+' : ''} {formatCurrency(financeStats.week.balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Totales Mensual */}
              <div style={{ background: tokens.white, padding: 20, borderRadius: 16, border: `0.5px solid ${tokens.grayBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: tokens.grayMuted, textTransform: "uppercase" }}>Este Mes</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#EA580C', background: '#FFF7ED', padding: "2px 8px", borderRadius: 6 }}>Mensual</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Ingresos:</span>
                    <span style={{ fontWeight: 655, color: tokens.greenText }}>+ {formatCurrency(financeStats.month.income)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Egresos:</span>
                    <span style={{ fontWeight: 655, color: tokens.redText }}>- {formatCurrency(financeStats.month.egress)}</span>
                  </div>
                  <div style={{ borderTop: `0.5px solid ${tokens.grayBorder}`, marginTop: 6, paddingTop: 4, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: tokens.navy }}>Balance:</span>
                    <span style={{ color: financeStats.month.balance >= 0 ? tokens.greenText : tokens.redText }}>
                      {financeStats.month.balance >= 0 ? '+' : ''} {formatCurrency(financeStats.month.balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Efectivo en Caja */}
              <div style={{ background: tokens.white, padding: 20, borderRadius: 16, border: `1.5px solid ${tokens.green}`, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tokens.greenText, textTransform: "uppercase" }}>Efectivo en Caja</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: tokens.greenText, background: tokens.greenFaint, padding: "2px 8px", borderRadius: 6 }}>Efectivo</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Efectivo Hoy:</span>
                    <span style={{ fontWeight: 700, color: financeStats.cash.dayBalance >= 0 ? tokens.greenText : tokens.redText }}>
                      {financeStats.cash.dayBalance >= 0 ? '+' : ''} {formatCurrency(financeStats.cash.dayBalance)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: tokens.grayText }}>Efectivo Semana:</span>
                    <span style={{ fontWeight: 700, color: financeStats.cash.weekBalance >= 0 ? tokens.greenText : tokens.redText }}>
                      {financeStats.cash.weekBalance >= 0 ? '+' : ''} {formatCurrency(financeStats.cash.weekBalance)}
                    </span>
                  </div>
                  <div style={{ borderTop: `0.5px solid ${tokens.grayBorder}`, marginTop: 6, paddingTop: 6, display: "flex", flexDirection: "column", gap: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: tokens.grayMuted }}>
                      <span>Ingresos/Egresos Hoy:</span>
                      <span>+{formatCurrency(financeStats.cash.dayIncome)} / -{formatCurrency(financeStats.cash.dayEgress)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Quick Filters row ── */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
              <div style={{
                background: tokens.white, padding: "6px 14px", borderRadius: 10,
                border: `0.5px solid ${tokens.grayBorder}`, fontSize: 12, color: tokens.grayText,
                display: "flex", alignItems: "center", gap: 6
              }}>
                <Calendar size={14} /> Periodo: Todos
              </div>
              <div style={{
                background: tokens.white, padding: "6px 14px", borderRadius: 10,
                border: `0.5px solid ${tokens.grayBorder}`, fontSize: 12, color: tokens.grayText,
                display: "flex", alignItems: "center", gap: 6
              }}>
                <CreditCard size={14} /> Forma de Pago: Todas
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
                    placeholder="Buscar por descripción, paciente o forma de pago…"
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
                  <FileText size={15} color={tokens.blue} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{filteredMovimientos.length}</span>
                  <span style={{ fontSize: 13, color: tokens.grayMuted }}>movimientos</span>
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
                          { label: "Descripción / Origen", sortable: true },
                          { label: "Forma de Pago", sortable: true },
                          { label: "Tipo", sortable: true },
                          { label: "Importe", sortable: true },
                          { label: "Acciones", sortable: false },
                        ].map((col, i) => (
                          <th key={i} style={{
                            textAlign: col.label === "Acciones" ? "right" : "left", padding: "12px 16px",
                            fontSize: 11, fontWeight: 600, color: tokens.grayMuted,
                            textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: col.label === "Acciones" ? "flex-end" : "flex-start", gap: 4 }}>
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
                            {[...Array(6)].map((_, j) => (
                              <td key={j} style={{ padding: "11px 16px" }}><div style={{ width: 90, height: 11, borderRadius: 5, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} /></td>
                            ))}
                          </tr>
                        ))
                      ) : paginatedMovimientos.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "56px 0" }}>
                            <DollarSign size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                            <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No se registraron movimientos todavía</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedMovimientos.map((m, idx) => {
                          const isLast = idx === paginatedMovimientos.length - 1
                          return (
                            <tr
                              key={m.id}
                              style={{ borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`, transition: "background 0.12s" }}
                              onMouseEnter={e => (e.currentTarget.style.background = tokens.rowHover)}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              {/* Fecha */}
                              <td style={{ padding: "14px 16px" }}>
                                <div style={{ fontSize: 13, color: tokens.grayText, display: "flex", alignItems: "center", gap: 6 }}>
                                  <Calendar size={12} color={tokens.grayMuted} />
                                  {format(new Date(m.fecha), "d MMM. yyyy", { locale: es })}
                                </div>
                              </td>

                              {/* Descripción */}
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, textTransform: "uppercase" }}>
                                    {m.pacienteNombre ? m.pacienteNombre : (m.descripcion || 'Movimiento General')}
                                  </span>
                                  <span style={{ fontSize: 11, color: tokens.grayMuted }}>
                                    {m.obraSocial ? `${m.obraSocial} | ` : ''}
                                    {m.tipo} {m.descripcion && m.pacienteNombre ? ` | ${m.descripcion}` : ''}
                                  </span>
                                </div>
                              </td>

                              {/* Forma de Pago */}
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText }}>
                                  <CreditCard size={12} color={tokens.grayMuted} />
                                  {m.forma_pago || '—'}
                                </div>
                              </td>

                              {/* Tipo */}
                              <td style={{ padding: "11px 16px" }}>
                                <span style={{
                                  display: "inline-flex", padding: "3px 10px", borderRadius: 6,
                                  fontSize: 11, fontWeight: 600,
                                  background: m.tipo === 'Ingreso' ? tokens.greenFaint : tokens.redFaint,
                                  color: m.tipo === 'Ingreso' ? tokens.greenText : tokens.redText,
                                }}>
                                  {m.tipo}
                                </span>
                              </td>

                              {/* Importe */}
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: m.tipo === 'Ingreso' ? tokens.greenText : tokens.redText }}>
                                  {m.tipo === 'Ingreso' ? '+' : '-'} {formatCurrency(m.monto)}
                                </div>
                              </td>

                              {/* Acciones */}
                              <td style={{ padding: "11px 16px", textAlign: "right" }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(m.id);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: tokens.redText,
                                    cursor: "pointer",
                                    padding: 6,
                                    borderRadius: 8,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.15s, transform 0.1s",
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = tokens.redFaint;
                                    e.currentTarget.style.transform = "scale(1.08)";
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = "none";
                                    e.currentTarget.style.transform = "none";
                                  }}
                                  title="Eliminar movimiento"
                                >
                                  <Trash2 size={15} />
                                </button>
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
                    <p style={{ fontSize: 12, color: tokens.grayMuted }}>Mostrando {paginatedMovimientos.length} de {filteredMovimientos.length} movimientos</p>
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

            {isModalOpen && (
                <NewMovementModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleMovementRegistered}
                    type={modalType}
                />
            )}

            {confirmAction && (
                <ConfirmationModal
                    isOpen={confirmAction.isOpen}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={() => { confirmAction.onConfirm(); }}
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmText="Confirmar"
                    variant="destructive"
                />
            )}
        </div>
    );
}

