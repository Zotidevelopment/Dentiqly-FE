import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus, Users, Check, X, Copy,
  Clock, Stethoscope, Link2,
  CalendarDays, Activity, BarChart3, ArrowRight,
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight,
  ClipboardList, Sparkles, UserPlus,
} from 'lucide-react';
import { turnosApi, profesionalesApi, serviciosApi, pacientesApi } from '../../api';
import { configuracionApi } from '../../api/configuracion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import type { Turno } from '../../types';
import { OnboardingChecklist } from './OnboardingChecklist';

interface DashboardStats {
  totalTurnos: number;
  turnosHoy: number;
  totalProfesionales: number;
  totalServicios: number;
  totalPacientes: number;
  turnosPorEstado: Record<string, number>;
  turnosRecientes: Turno[];
  turnosPorProf: Record<string, number>;
  appointmentTrend: { fecha: string; count: number }[];
  turnosDeHoy: Turno[];
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const dayNames = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

const MiniCalendar: React.FC<{ turnosDeHoy?: Turno[] }> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) currentWeek.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const isToday = (day: number | null) =>
    day !== null && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white capitalize">{monthName}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white/40" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-white/30 py-1.5">{d}</div>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <div key={`${wi}-${di}`} className="text-center py-1">
              {day !== null ? (
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                    isToday(day)
                      ? 'bg-dental-secondary text-white font-bold'
                      : 'text-white/60 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  {day}
                </span>
              ) : (
                <span className="inline-flex w-7 h-7" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const timelineColors = [
  { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-700' },
  { bg: 'bg-violet-100', border: 'border-l-violet-500', text: 'text-violet-700' },
  { bg: 'bg-amber-100', border: 'border-l-amber-500', text: 'text-amber-700' },
  { bg: 'bg-rose-100', border: 'border-l-rose-500', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', border: 'border-l-cyan-500', text: 'text-cyan-700' },
];

export const Dashboard: React.FC<{
  onNavigate?: (view: string) => void,
  slug?: string
}> = ({ onNavigate, slug }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [hideBanner, setHideBanner] = useState(false);
  const bookingUrl = slug ? `${window.location.origin}/${slug}` : '';

  const [stats, setStats] = useState<DashboardStats>({
    totalTurnos: 0, turnosHoy: 0, totalProfesionales: 0,
    totalServicios: 0, totalPacientes: 0, turnosPorEstado: {},
    turnosRecientes: [], turnosPorProf: {}, appointmentTrend: [],
    turnosDeHoy: []
  });
  const [loading, setLoading] = useState(true);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() =>
    sessionStorage.getItem('onboarding_checklist_dismissed_session') === 'true'
  );
  const [clinicConfig, setClinicConfig] = useState<{ hasClinicInfo: boolean; hasSchedule: boolean }>({
    hasClinicInfo: false,
    hasSchedule: false,
  });

  const handleCopyLink = () => {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast({ title: "Enlace copiado", description: "El link de reservas fue copiado al portapapeles." });
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchStats = async () => {
    try {
      const desde = new Date();
      desde.setDate(desde.getDate() - 30);
      const hasta = new Date();
      hasta.setDate(hasta.getDate() + 90);

      const [turnosRes, profRes, servRes, pacRes] = await Promise.all([
        turnosApi.listar({
          limit: 5000,
          fecha_desde: desde.toISOString().split('T')[0],
          fecha_hasta: hasta.toISOString().split('T')[0]
        }).catch(() => ({ data: [] })),
        profesionalesApi.listar({ estado: 'Activo', limit: 100 }).catch(() => ({ data: [] })),
        serviciosApi.listar().catch(() => ({ data: [] })),
        pacientesApi.listar({ limit: 5000 }).catch(() => ({ data: [] }))
      ]);

      const turnos = turnosRes.data || [];
      const profesionales = profRes.data || [];
      const pacientes = pacRes.data || [];
      const today = new Date().toISOString().split('T')[0];
      const turnosDeHoy = turnos
        .filter(t => t.fecha === today)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      const turnosHoy = turnosDeHoy.length;

      const turnosPorEstado: Record<string, number> = {};
      turnos.forEach(turno => {
        turnosPorEstado[turno.estado] = (turnosPorEstado[turno.estado] || 0) + 1;
      });

      const turnosRecientes = [...turnos]
        .sort((a, b) => {
          const dateComparison = b.fecha.localeCompare(a.fecha);
          if (dateComparison !== 0) return dateComparison;
          return b.hora_inicio.localeCompare(a.hora_inicio);
        })
        .slice(0, 6);

      const appointmentTrend: { fecha: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = turnos.filter(t => t.fecha === dateStr).length;
        appointmentTrend.push({ fecha: dateStr, count });
      }

      setStats({
        totalTurnos: turnos.length,
        turnosHoy,
        totalProfesionales: profesionales.length,
        totalServicios: servRes.data?.length || 0,
        totalPacientes: pacientes.length,
        turnosPorEstado,
        turnosRecientes,
        turnosPorProf: {},
        appointmentTrend,
        turnosDeHoy
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem('onboarding_checklist_dismissed');
    fetchStats();
    fetchClinicConfig();
  }, []);

  const fetchClinicConfig = async () => {
    try {
      const settings = await configuracionApi.listar();
      const getValue = (key: string) => {
        const s = settings.find((s: any) => s.clave === key);
        return s?.valor;
      };
      const clinicAddress = getValue('clinic_address');
      const clinicPhone = getValue('clinic_phone');
      const hasClinicInfo = !!(clinicAddress && clinicPhone);
      const businessHours = getValue('business_hours');
      let hasSchedule = false;
      if (businessHours) {
        try {
          const hours = typeof businessHours === 'string' ? JSON.parse(businessHours) : businessHours;
          hasSchedule = Object.values(hours).some((day: any) => day?.activo);
        } catch { hasSchedule = false; }
      }
      setClinicConfig({ hasClinicInfo, hasSchedule });
    } catch {
      // silencioso
    }
  };

  const handleDismissOnboarding = () => {
    sessionStorage.setItem('onboarding_checklist_dismissed_session', 'true');
    setOnboardingDismissed(true);
  };

  const isNewClinic =
    !onboardingDismissed &&
    (stats.totalProfesionales === 0 ||
      stats.totalPacientes === 0 ||
      !clinicConfig.hasClinicInfo ||
      !clinicConfig.hasSchedule);

  const handleUpdateStatus = async (id: number, nuevoEstado: string) => {
    try {
      await turnosApi.actualizar(id, { estado: nuevoEstado });
      toast({
        title: nuevoEstado === 'Confirmado' ? "Turno Confirmado" : "Turno Cancelado",
        description: "El estado del turno se ha actualizado correctamente.",
      });
      fetchStats();
    } catch (e: any) {
      console.error('Error al actualizar estado:', e);
      toast({
        title: "Error",
        description: e.response?.data?.error || "No se pudo actualizar el estado del turno.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1023] flex items-center justify-center animate-pulse-soft">
            <Sparkles className="w-5 h-5 text-[#2563FF]" />
          </div>
          <p className="text-sm font-medium text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const maxTrendValue = Math.max(...stats.appointmentTrend.map(d => d.count), 1);
  const atendidos = stats.turnosPorEstado['Atendido'] || 0;
  const pendientes = stats.turnosPorEstado['Pendiente'] || 0;
  const ausentes = stats.turnosPorEstado['Ausente'] || 0;
  const confirmados = stats.turnosPorEstado['Confirmado'] || 0;

  const todayLabel = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  return (
    <div className="font-sans relative">
      {/* ── Decorative background reliefs ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        {/* Large gradient wash — top right corner */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(37,99,255,0.07) 0%, rgba(11,16,35,0.04) 40%, transparent 70%)' }}
        />
        {/* Medium blob — bottom left */}
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(11,16,35,0.05) 0%, rgba(37,99,255,0.03) 40%, transparent 70%)' }}
        />
        {/* Accent glow — mid-right */}
        <div className="absolute top-[40%] -right-10 w-[350px] h-[350px] rounded-full opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(37,99,255,0.05) 0%, transparent 60%)' }}
        />

        {/* Dot grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]">
          <defs>
            <pattern id="dashboard-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#0B1023" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-dots)" />
        </svg>

        {/* Dashed circle — top left area */}
        <svg className="absolute top-20 left-4 w-[160px] h-[160px] opacity-[0.06]" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="72" stroke="#0B1023" strokeWidth="1.5" strokeDasharray="10 8" />
          <circle cx="80" cy="80" r="45" stroke="#2563FF" strokeWidth="1" strokeDasharray="6 5" />
          <circle cx="80" cy="80" r="20" stroke="#0B1023" strokeWidth="0.8" strokeDasharray="3 4" />
        </svg>

        {/* Rounded rect — bottom right */}
        <svg className="absolute bottom-24 right-24 w-[120px] h-[120px] opacity-[0.05]" viewBox="0 0 120 120" fill="none">
          <rect x="10" y="10" width="100" height="100" rx="24" stroke="#0B1023" strokeWidth="1.5" strokeDasharray="8 6" />
          <rect x="30" y="30" width="60" height="60" rx="14" stroke="#2563FF" strokeWidth="1" strokeDasharray="5 5" />
        </svg>

        {/* Diamond shape — mid left */}
        <svg className="absolute top-[55%] left-10 w-[80px] h-[80px] opacity-[0.045]" viewBox="0 0 80 80" fill="none">
          <rect x="15" y="15" width="50" height="50" rx="8" stroke="#0B1023" strokeWidth="1.5" transform="rotate(45 40 40)" />
        </svg>

        {/* Horizontal accent line — top */}
        <div className="absolute top-[180px] left-0 right-0 h-px opacity-[0.04]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #0B1023 30%, #2563FF 50%, #0B1023 70%, transparent 100%)' }}
        />
      </div>

      {/* ── Main content (above decorative layer) ── */}
      <div className="flex flex-col xl:flex-row gap-6 relative z-10">
        {/* ═══ LEFT / MAIN CONTENT ═══ */}
        <div className="flex-1 min-w-0">

          {/* Greeting */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl lg:text-[28px] font-extrabold text-[#0B1023] tracking-tight">
              {getGreeting()}, {user?.nombre || 'Doc'}!
            </h1>
            <p className="text-gray-400 mt-1 text-sm leading-relaxed max-w-xl">
              {isNewClinic
                ? 'Bienvenido a Dentiqly. Seguí estos pasos para dejar tu clínica lista.'
                : <>Hoy tenés <span className="font-semibold text-[#0B1023]">{stats.turnosHoy} turnos</span> programados. Controlá los pacientes y el rendimiento de tu clínica.</>
              }
            </p>
          </div>

          {/* ═══ ONBOARDING CHECKLIST ═══ */}
          {isNewClinic && (
            <OnboardingChecklist
              totalProfesionales={stats.totalProfesionales}
              totalServicios={stats.totalServicios}
              totalPacientes={stats.totalPacientes}
              hasClinicInfo={clinicConfig.hasClinicInfo}
              hasSchedule={clinicConfig.hasSchedule}
              slug={slug}
              onNavigate={(view) => onNavigate?.(view)}
              onDismiss={handleDismissOnboarding}
            />
          )}

          {/* ═══ STAT CARDS — 2×2 GRID ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 stagger-children">

            {/* Card 1 — Pacientes (soft blue) */}
            <div className="bg-[#DBEAFE] rounded-2xl p-5 relative overflow-hidden group card-hover">
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-blue-900 mb-3">Pacientes:</p>
              <div className="flex gap-5 mb-4">
                <div>
                  <p className="text-2xl font-extrabold text-blue-900">{stats.totalPacientes}</p>
                  <p className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-blue-900">{stats.turnosHoy}</p>
                  <p className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider">Hoy</p>
                </div>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1.5 h-10">
                {stats.appointmentTrend.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-400/40 rounded-sm transition-all group-hover:bg-blue-500/50"
                    style={{ height: `${Math.max((d.count / maxTrendValue) * 100, 8)}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Card 2 — Resumen de visitas (soft green) */}
            <div className="bg-[#D1FAE5] rounded-2xl p-5 relative overflow-hidden group card-hover">
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-emerald-900 mb-3">Resumen de turnos:</p>
              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-2xl font-extrabold text-emerald-900">{stats.totalTurnos}</p>
                  <p className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-emerald-900">{atendidos}</p>
                  <p className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Atendidos</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-emerald-900">{pendientes}</p>
                  <p className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Pendientes</p>
                </div>
              </div>
              {/* Mini line chart */}
              <svg className="w-full h-10" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d={`M0,${30 - (stats.appointmentTrend[0]?.count / maxTrendValue) * 28} ${stats.appointmentTrend.map((d, i) => `L${(i / 6) * 100},${30 - (d.count / maxTrendValue) * 28}`).join(' ')}`}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                />
              </svg>
            </div>

            {/* Card 3 — Por estado (soft rose) */}
            <div className="bg-[#FFE4E6] rounded-2xl p-5 relative overflow-hidden group card-hover">
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-400/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-rose-900 mb-3">Por estado:</p>
              <div className="flex gap-5 mb-4">
                {[
                  { n: atendidos, label: 'Atendido', dot: 'bg-emerald-500' },
                  { n: confirmados, label: 'Confirm.', dot: 'bg-blue-500' },
                  { n: ausentes, label: 'Ausente', dot: 'bg-rose-500' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <div>
                      <p className="text-lg font-extrabold text-rose-900 leading-none">{s.n}</p>
                      <p className="text-[9px] font-semibold text-rose-600/70 uppercase">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Horizontal bars */}
              <div className="space-y-1.5">
                {[
                  { w: stats.totalTurnos > 0 ? (atendidos / stats.totalTurnos) * 100 : 0, color: 'bg-emerald-500' },
                  { w: stats.totalTurnos > 0 ? (confirmados / stats.totalTurnos) * 100 : 0, color: 'bg-blue-500' },
                  { w: stats.totalTurnos > 0 ? (ausentes / stats.totalTurnos) * 100 : 0, color: 'bg-rose-500' },
                ].map((bar, i) => (
                  <div key={i} className="h-1.5 bg-rose-200/50 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.max(bar.w, 2)}%` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4 — Servicios (soft violet) */}
            <div className="bg-[#EDE9FE] rounded-2xl p-5 relative overflow-hidden group card-hover">
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-violet-400/20 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-sm font-bold text-violet-900 mb-3">Servicios:</p>
              <div className="flex gap-5 mb-4">
                <div>
                  <p className="text-2xl font-extrabold text-violet-900">{stats.totalServicios}</p>
                  <p className="text-[10px] font-semibold text-violet-600/70 uppercase tracking-wider">Activos</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-violet-900">{stats.totalProfesionales}</p>
                  <p className="text-[10px] font-semibold text-violet-600/70 uppercase tracking-wider">Profesionales</p>
                </div>
              </div>
              {/* Decorative dots grid */}
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: Math.min(stats.totalServicios, 20) }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-violet-400/30 group-hover:bg-violet-400/50 transition-colors" />
                ))}
              </div>
            </div>
          </div>

          {/* ═══ BOOKING BANNER ═══ */}
          {!hideBanner && slug && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between mb-6 relative overflow-hidden animate-fade-in shadow-sm">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg viewBox="0 0 400 120" className="w-full h-full">
                  <circle cx="350" cy="20" r="80" fill="#2563FF" />
                  <circle cx="380" cy="100" r="40" fill="var(--brand-secondary)" />
                </svg>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-dental-secondary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1023]">Compartí tu portal de reservas automático</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Tus pacientes pueden reservar online 24/7</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 text-sm font-semibold bg-gray-50 hover:bg-gray-100 text-[#0B1023] px-4 py-2 rounded-xl transition-all active:scale-[0.98] border border-gray-100"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  {copied ? '¡Copiado!' : 'Copiar enlace'}
                </button>
                <button
                  onClick={() => setHideBanner(true)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>
          )}

          {/* ═══ PATIENT LIST ═══ */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-[#0B1023] flex items-center gap-2">
                Lista de pacientes
              </h2>
              <button
                onClick={() => onNavigate?.('calendar')}
                className="flex items-center gap-1 text-xs font-semibold text-dental-secondary hover:opacity-80 transition-opacity"
              >
                Ver todos
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Paciente</th>
                    <th className="pb-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Servicio</th>
                    <th className="pb-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="pb-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="pb-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Hora</th>
                    <th className="pb-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.turnosRecientes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-gray-200" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">Sin turnos registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stats.turnosRecientes.map((turno) => {
                      const initials = `${turno.paciente?.nombre?.charAt(0) || ''}${turno.paciente?.apellido?.charAt(0) || ''}`;
                      const avatarBgs = ['bg-blue-500/20 text-blue-400', 'bg-emerald-500/20 text-emerald-400', 'bg-violet-500/20 text-violet-400', 'bg-amber-500/20 text-amber-400', 'bg-rose-500/20 text-rose-400', 'bg-cyan-500/20 text-cyan-400'];
                      const avatarStyle = avatarBgs[turno.id % avatarBgs.length];

                      return (
                        <tr key={turno.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${avatarStyle.split(' ')[0].replace('/20', '/10')} ${avatarStyle.split(' ')[1]} flex items-center justify-center font-bold text-[10px] shrink-0`}>
                                {initials}
                              </div>
                              <span className="font-semibold text-[#0B1023] truncate max-w-[120px] text-[13px]">
                                {turno.paciente?.nombre} {turno.paciente?.apellido}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-[13px] text-gray-500 font-medium">{turno.servicio?.nombre || 'General'}</span>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              turno.estado === 'Atendido' ? 'bg-emerald-50 text-emerald-600' :
                              turno.estado === 'Confirmado' || turno.estado === 'Confirmado por Whatsapp' ? 'bg-blue-50 text-blue-600' :
                              turno.estado === 'Pendiente' ? 'bg-amber-50 text-amber-600' :
                              turno.estado === 'Ausente' ? 'bg-gray-100 text-gray-500' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {turno.estado}
                            </span>
                          </td>
                          <td className="py-3 text-[13px] text-gray-500 font-medium">
                            {new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3">
                            <span className="text-[13px] font-bold text-dental-secondary bg-dental-secondary/5 px-2 py-0.5 rounded-md border border-dental-secondary/10">
                              {turno.hora_inicio}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {turno.estado === 'Pendiente' ? (
                              <div className="flex justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleUpdateStatus(turno.id, 'Confirmado')}
                                  className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-all active:scale-95"
                                  title="Confirmar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(turno.id, 'Cancelado')}
                                  className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all active:scale-95"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="w-full xl:w-[300px] shrink-0 space-y-5">

          {/* Calendar */}
          {/* Calendar Wrapper */}
          <div className="bg-[#0B1023] rounded-2xl p-5 shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
            <MiniCalendar />
            <button
              onClick={() => onNavigate?.('calendar')}
              className="w-full mt-4 py-2.5 bg-dental-secondary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Agregar turno
            </button>
          </div>

          {/* Today's Timeline */}
          {/* Today's Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-fade-in" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#0B1023] capitalize">{todayLabel}</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs text-gray-400">Agenda de hoy</p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {stats.turnosDeHoy.length === 0 ? (
              <div className="text-center py-6">
                <CalendarDays className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Sin turnos para hoy</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.turnosDeHoy.slice(0, 6).map((turno, i) => {
                  return (
                    <div
                      key={turno.id}
                      className="bg-gray-50 rounded-xl p-3 border-l-[3px] transition-all hover:bg-gray-100 hover:scale-[1.02]"
                      style={{ borderLeftColor: ['#60A5FA','#34D399','#A78BFA','#FBBF24','#FB7185','#22D3EE'][i % 6] }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#0B1023]">
                            {turno.servicio?.nombre || 'Consulta'}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {turno.paciente?.nombre} {turno.paciente?.apellido}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-dental-secondary bg-dental-secondary/5 px-1.5 py-0.5 rounded border border-dental-secondary/10">
                          {turno.hora_inicio}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {stats.turnosDeHoy.length > 0 && (
              <button
                onClick={() => onNavigate?.('calendar')}
                className="w-full mt-4 py-2 text-xs font-semibold text-dental-secondary bg-dental-secondary/5 rounded-xl hover:bg-dental-secondary/10 transition-colors border border-dental-secondary/10"
              >
                Ver todos los detalles
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
