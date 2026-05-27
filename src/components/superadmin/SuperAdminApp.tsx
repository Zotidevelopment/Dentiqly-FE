import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, Building, Activity, LogOut, CheckCircle, Clock, XCircle,
  Search, Calendar, Stethoscope, UserCheck, TrendingUp, Eye, ChevronRight,
  BarChart3, AlertTriangle, CreditCard, Settings, ArrowLeft, MapPin, Briefcase
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../lib/api-client';
import { useToast } from '../../hooks/use-toast';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ClinicStats {
  pacientes: number;
  profesionales: number;
  turnos: number;
  servicios: number;
  sucursales: number;
  usuarios: number;
}

interface ClinicData {
  id: string;
  nombre: string;
  slug: string;
  plan: string;
  subscription_status: string;
  billing_plan?: string;
  trial_ends_at?: string;
  last_payment_date?: string;
  billing_cycle_end?: string;
  activo: boolean;
  createdAt: string;
  telefono?: string;
  web_url?: string;
  usuarios?: { id: string; nombre: string; email: string }[];
  stats: ClinicStats;
  trial_days_remaining: number;
}

interface SuperAdminStats {
  totalClinics: number;
  activeClinics: number;
  trialingClinics: number;
  pendingClinics: number;
  suspendedClinics: number;
  totalUsers: number;
  totalPacientes: number;
  totalTurnos: number;
  totalProfesionales: number;
}

interface ClinicDetail {
  clinica: any;
  stats: {
    pacientes: number;
    profesionales: number;
    turnos: number;
    servicios: number;
    turnosPorEstado: Record<string, number>;
    turnosUltimos30: number;
    pacientesUltimos30: number;
  };
  trial_days_remaining: number;
}

type View = 'dashboard' | 'detail';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active: { label: 'Activa', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
  trialing: { label: 'Trial', color: 'text-blue-700', bg: 'bg-blue-100', icon: Clock },
  pending_payment: { label: 'Pago Pend.', color: 'text-amber-700', bg: 'bg-amber-100', icon: AlertTriangle },
  suspended: { label: 'Suspendida', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
  past_due: { label: 'Vencida', color: 'text-orange-700', bg: 'bg-orange-100', icon: AlertTriangle },
  cancelled: { label: 'Cancelada', color: 'text-gray-700', bg: 'bg-gray-100', icon: XCircle },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.cancelled;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ElementType; color: string; bgColor: string }> = ({ label, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
    <p className="text-gray-500 text-sm font-medium mb-2">{label}</p>
    <div className="flex items-center justify-between">
      <p className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('es-AR') : value}</p>
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

const ClinicDetailView: React.FC<{ clinicId: string; onBack: () => void }> = ({ clinicId, onBack }) => {
  const [detail, setDetail] = useState<ClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPayment, setGeneratingPayment] = useState(false);
  const { toast } = useToast();

  const handleGenerateTestPayment = async () => {
    setGeneratingPayment(true);
    try {
      const response = await apiClient.post<{ init_point: string }>(`/superadmin/clinics/${clinicId}/test-payment`);
      if (response.init_point) {
        window.open(response.init_point, '_blank');
        toast({ title: 'Preferencia creada', description: 'Se abrió la pasarela de MercadoPago en una pestaña nueva.' });
      } else {
        toast({ title: 'Error', description: 'No se pudo obtener el punto de inicio de pago.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error generating test payment:', error);
      toast({ title: 'Error', description: 'Error al generar el pago de prueba.', variant: 'destructive' });
    } finally {
      setGeneratingPayment(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await apiClient.get<ClinicDetail>(`/superadmin/clinics/${clinicId}`);
        setDetail(data);
      } catch {
        toast({ title: 'Error', description: 'No se pudo cargar el detalle', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Activity className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!detail) return null;

  const { clinica, stats } = detail;
  const admin = clinica.usuarios?.find((u: any) => u.role === 'admin');

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al listado
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{clinica.nombre}</h2>
          <p className="text-gray-500 text-sm mt-1">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">/{clinica.slug}</span>
            {clinica.telefono && <span className="ml-3">{clinica.telefono}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateTestPayment}
            disabled={generatingPayment}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shrink-0"
          >
            {generatingPayment ? (
              <Activity className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Pago de Prueba ($1)
          </button>
          <StatusBadge status={clinica.subscription_status} />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Admin</p>
          <p className="text-sm font-bold text-gray-900">{admin?.nombre || 'N/A'}</p>
          <p className="text-xs text-gray-400">{admin?.email || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Registrado</p>
          <p className="text-sm font-bold text-gray-900">{new Date(clinica.createdAt).toLocaleDateString('es-AR')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Plan</p>
          <p className="text-sm font-bold text-gray-900 capitalize">{clinica.billing_plan || 'Mensual'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">
            {clinica.subscription_status === 'trialing' ? 'Trial restante' : 'Próximo cobro'}
          </p>
          <p className="text-sm font-bold text-gray-900">
            {clinica.subscription_status === 'trialing'
              ? `${detail.trial_days_remaining} días`
              : clinica.billing_cycle_end
                ? new Date(clinica.billing_cycle_end).toLocaleDateString('es-AR')
                : 'N/A'
            }
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas de uso</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Pacientes" value={stats.pacientes} icon={Users} color="text-blue-600" bgColor="bg-blue-100" />
        <StatCard label="Profesionales" value={stats.profesionales} icon={Stethoscope} color="text-purple-600" bgColor="bg-purple-100" />
        <StatCard label="Turnos Total" value={stats.turnos} icon={Calendar} color="text-green-600" bgColor="bg-green-100" />
        <StatCard label="Servicios" value={stats.servicios} icon={Briefcase} color="text-amber-600" bgColor="bg-amber-100" />
        <StatCard label="Turnos (30d)" value={stats.turnosUltimos30} icon={TrendingUp} color="text-cyan-600" bgColor="bg-cyan-100" />
        <StatCard label="Pac. nuevos (30d)" value={stats.pacientesUltimos30} icon={UserCheck} color="text-pink-600" bgColor="bg-pink-100" />
      </div>

      {/* Turnos por estado */}
      {Object.keys(stats.turnosPorEstado).length > 0 && (
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Turnos por estado</h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.turnosPorEstado).map(([estado, count]) => (
                <div key={estado} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 capitalize">{estado}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Usuarios del equipo */}
      {clinica.usuarios && clinica.usuarios.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Equipo ({clinica.usuarios.length})</h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 text-xs font-semibold text-gray-600">Nombre</th>
                  <th className="p-3 text-xs font-semibold text-gray-600">Email</th>
                  <th className="p-3 text-xs font-semibold text-gray-600">Rol</th>
                  <th className="p-3 text-xs font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {clinica.usuarios.map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-900">{u.nombre}</td>
                    <td className="p-3 text-sm text-gray-500">{u.email}</td>
                    <td className="p-3 text-sm capitalize text-gray-600">{u.role}</td>
                    <td className="p-3">
                      <span className={`text-xs font-bold ${u.activo ? 'text-green-600' : 'text-gray-400'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Sucursales */}
      {clinica.sucursales && clinica.sucursales.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">Sucursales ({clinica.sucursales.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinica.sucursales.map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-bold text-gray-900">{s.nombre}</p>
                </div>
                <p className="text-xs text-gray-500">{s.direccion}</p>
                {s.telefono && <p className="text-xs text-gray-400 mt-1">{s.telefono}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const SuperAdminApp: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [stats, setStats] = useState<SuperAdminStats>({
    totalClinics: 0, activeClinics: 0, trialingClinics: 0, pendingClinics: 0,
    suspendedClinics: 0, totalUsers: 0, totalPacientes: 0, totalTurnos: 0, totalProfesionales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>('clinics');
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const [generatingPaymentId, setGeneratingPaymentId] = useState<string | null>(null);

  const fetchClinics = async () => {
    try {
      const response = await apiClient.get<{ clinicas: ClinicData[]; stats: SuperAdminStats }>('/superadmin/clinics');
      setClinics(response.clinicas);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar las clínicas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestPayment = async (clinicId: string) => {
    setGeneratingPaymentId(clinicId);
    try {
      const response = await apiClient.post<{ init_point: string }>(`/superadmin/clinics/${clinicId}/test-payment`);
      if (response.init_point) {
        window.open(response.init_point, '_blank');
        toast({ title: 'Preferencia creada', description: 'Se abrió la pasarela de MercadoPago en una pestaña nueva.' });
      } else {
        toast({ title: 'Error', description: 'No se pudo obtener el punto de inicio de pago.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error generating test payment:', error);
      toast({ title: 'Error', description: 'Error al generar el pago de prueba.', variant: 'destructive' });
    } finally {
      setGeneratingPaymentId(null);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar cambio de estado",
      message: `¿Estás seguro de cambiar el estado a ${statusConfig[newStatus]?.label || newStatus}?`,
      onConfirm: async () => {
        setConfirmAction(null);
        setUpdating(id);
        try {
          await apiClient.put(`/superadmin/clinics/${id}/status`, { status: newStatus });
          toast({ title: 'Estado actualizado', description: 'La clínica ha sido actualizada correctamente.' });
          fetchClinics();
        } catch (error) {
          console.error('Error updating status:', error);
          toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
        } finally {
          setUpdating(null);
        }
      }
    });
  };

  const handleViewDetail = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setView('detail');
  };

  const isSuperAdmin = !(user?.clinica_id || user?.clinicaId) || user?.role === 'superadmin';

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
        <p className="text-gray-500">Esta área es exclusiva para los administradores de la plataforma.</p>
        <button onClick={logout} className="px-4 py-2 bg-[#2563FF] text-white rounded-lg font-medium">Volver</button>
      </div>
    );
  }

  const filteredClinics = clinics.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.usuarios?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A0F2D] text-white flex flex-col h-screen fixed">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-[#02E3FF]" />
          <div>
            <h1 className="font-bold text-xl">Dentiqly</h1>
            <p className="text-xs text-blue-200 uppercase tracking-widest">SuperAdmin</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => { setView('dashboard'); setActiveNav('clinics'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              activeNav === 'clinics' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-5 h-5" /> Clínicas
          </button>
          <button
            onClick={() => { setView('dashboard'); setActiveNav('stats'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              activeNav === 'stats' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-5 h-5" /> Estadísticas
          </button>
          <button
            onClick={() => { setView('dashboard'); setActiveNav('payments'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              activeNav === 'payments' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-5 h-5" /> Pagos
          </button>
          <button
            onClick={() => { setView('dashboard'); setActiveNav('config'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              activeNav === 'config' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" /> Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4">
            <p className="text-sm font-medium text-white">{user?.nombre}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-white hover:bg-red-500 border border-red-400/30 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </div>

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

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {view === 'detail' && selectedClinicId ? (
          <ClinicDetailView clinicId={selectedClinicId} onBack={() => { setView('dashboard'); setSelectedClinicId(null); }} />
        ) : activeNav === 'config' ? (
          <ConfigSection />
        ) : (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Panel de Control General</h2>
              <p className="text-gray-500">Gestión de todos los tenants (clínicas) de la plataforma.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <StatCard label="Total Clínicas" value={stats.totalClinics} icon={Building} color="text-blue-600" bgColor="bg-blue-100" />
              <StatCard label="Activas" value={stats.activeClinics} icon={CheckCircle} color="text-green-600" bgColor="bg-green-100" />
              <StatCard label="En Trial" value={stats.trialingClinics} icon={Clock} color="text-cyan-600" bgColor="bg-cyan-100" />
              <StatCard label="Pago Pendiente" value={stats.pendingClinics} icon={AlertTriangle} color="text-amber-600" bgColor="bg-amber-100" />
              <StatCard label="Suspendidas" value={stats.suspendedClinics} icon={XCircle} color="text-red-600" bgColor="bg-red-100" />
            </div>

            {/* Platform totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Usuarios Totales" value={stats.totalUsers} icon={Users} color="text-purple-600" bgColor="bg-purple-100" />
              <StatCard label="Pacientes Totales" value={stats.totalPacientes} icon={UserCheck} color="text-pink-600" bgColor="bg-pink-100" />
              <StatCard label="Turnos Totales" value={stats.totalTurnos} icon={Calendar} color="text-indigo-600" bgColor="bg-indigo-100" />
              <StatCard label="Profesionales" value={stats.totalProfesionales} icon={Stethoscope} color="text-teal-600" bgColor="bg-teal-100" />
            </div>

            {/* Filters and search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-900">Listado de Clínicas</h3>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar clínica, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563FF] focus:border-[#2563FF] outline-none text-sm w-full md:w-72"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563FF]"
                    >
                      <option value="all">Todos</option>
                      <option value="active">Activas</option>
                      <option value="trialing">Trial</option>
                      <option value="pending_payment">Pago Pend.</option>
                      <option value="suspended">Suspendidas</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Clínica</th>
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Admin</th>
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Estado</th>
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Pacientes</th>
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Profesionales</th>
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Turnos</th>
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Registro</th>
                      <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500">
                          <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Cargando...
                        </td>
                      </tr>
                    ) : filteredClinics.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500">No se encontraron clínicas.</td>
                      </tr>
                    ) : (
                      filteredClinics.map(clinic => {
                        const admin = clinic.usuarios?.[0];
                        return (
                          <tr key={clinic.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-gray-900">{clinic.nombre}</p>
                              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">/{clinic.slug}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium text-gray-800">{admin?.nombre || 'Sin Admin'}</p>
                              <p className="text-xs text-gray-500">{admin?.email || 'N/A'}</p>
                            </td>
                            <td className="p-4">
                              <StatusBadge status={clinic.subscription_status} />
                              {clinic.subscription_status === 'trialing' && clinic.trial_days_remaining > 0 && (
                                <p className="text-xs text-blue-500 mt-1">{clinic.trial_days_remaining}d restantes</p>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-sm font-bold text-gray-900">{clinic.stats.pacientes}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-sm font-bold text-gray-900">{clinic.stats.profesionales}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-sm font-bold text-gray-900">{clinic.stats.turnos}</span>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(clinic.createdAt).toLocaleDateString('es-AR')}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewDetail(clinic.id)}
                                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#2563FF]"
                                  title="Ver detalle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleGenerateTestPayment(clinic.id)}
                                  disabled={generatingPaymentId === clinic.id}
                                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                                  title="Generar Pago de Prueba ($1)"
                                >
                                  {generatingPaymentId === clinic.id ? (
                                    <Activity className="w-4 h-4 animate-spin text-emerald-600" />
                                  ) : (
                                    <CreditCard className="w-4 h-4" />
                                  )}
                                </button>
                                <select
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#2563FF] bg-white"
                                  value=""
                                  onChange={(e) => handleUpdateStatus(clinic.id, e.target.value)}
                                  disabled={updating === clinic.id}
                                >
                                  <option value="" disabled>Cambiar...</option>
                                  <option value="active">Activar</option>
                                  <option value="trialing">Trial</option>
                                  <option value="pending_payment">Pago Pend.</option>
                                  <option value="suspended">Suspender</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
                Mostrando {filteredClinics.length} de {clinics.length} clínicas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ConfigSection: React.FC = () => {
  const [config, setConfig] = useState({
    mp_access_token: '',
    mp_public_key: '',
    mp_webhook_url: '',
    monthly_price: '80000',
    annual_price: '864000',
  });
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('dentiqly_superadmin_config', JSON.stringify(config));
    setSaved(true);
    toast({ title: 'Configuración guardada', description: 'Los cambios se aplicarán cuando configures las variables de entorno en el servidor.' });
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    const stored = localStorage.getItem('dentiqly_superadmin_config');
    if (stored) {
      try { setConfig(JSON.parse(stored)); } catch { localStorage.removeItem('dentiqly_superadmin_config'); }
    }
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-500">Credenciales de MercadoPago y configuración de precios.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#2563FF]" />
            MercadoPago
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Estas credenciales se configuran como variables de entorno en el servidor (MP_ACCESS_TOKEN, etc.).
            Acá podés ver la referencia de qué se necesita.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Access Token</label>
              <input
                type="password"
                value={config.mp_access_token}
                onChange={(e) => setConfig({ ...config, mp_access_token: e.target.value })}
                className="block w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all"
                placeholder="APP_USR-..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Public Key</label>
              <input
                type="text"
                value={config.mp_public_key}
                onChange={(e) => setConfig({ ...config, mp_public_key: e.target.value })}
                className="block w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all"
                placeholder="APP_USR-..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Webhook URL</label>
              <input
                type="url"
                value={config.mp_webhook_url}
                onChange={(e) => setConfig({ ...config, mp_webhook_url: e.target.value })}
                className="block w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all"
                placeholder="https://tu-backend.com/api/billing/webhook"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2563FF]" />
            Precios
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Precio Mensual (ARS)</label>
              <input
                type="number"
                value={config.monthly_price}
                onChange={(e) => setConfig({ ...config, monthly_price: e.target.value })}
                className="block w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Precio Anual (ARS)</label>
              <input
                type="number"
                value={config.annual_price}
                onChange={(e) => setConfig({ ...config, annual_price: e.target.value })}
                className="block w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">
                Equivale a ${Math.round(Number(config.annual_price) / 12).toLocaleString('es-AR')}/mes (10% dto)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-[#2563FF] text-white hover:bg-[#1D4ED8] shadow-[0_8px_20px_rgba(37,99,255,0.25)]'
          }`}
        >
          {saved ? 'Guardado' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
};
