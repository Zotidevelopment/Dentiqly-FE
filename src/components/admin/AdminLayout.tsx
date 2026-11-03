import { BrandLogo } from '../brand/BrandLogo'
import React, { useState } from 'react'
import {
  Calendar,
  Users,
  Briefcase,
  Settings,
  LogOut,
  X,
  UserCog,
  FileText,
  Wallet,
  DollarSign,
  CalendarOff,
  Shield,
  Bell,
  Menu,
  Search,
  MapPin as MapIcon,
  LayoutDashboard,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Sparkles,
  CalendarCheck,
  HelpCircle,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { canAccessView, puede } from '../../config/permissions'

interface AdminLayoutProps {
  children: React.ReactNode
  currentView: string
  onViewChange: (view: string) => void
  onSearch?: (query: string) => void
  subscriptionStatus?: any
  onActivatePlan?: () => void
  /** Abre el recorrido guiado del panel. */
  onAyuda?: () => void
}

interface MenuGroup {
  label: string
  items: { id: string; label: string; icon: React.ElementType }[]
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentView,
  onViewChange,
  onSearch,
  subscriptionStatus,
  onActivatePlan,
  onAyuda,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  const userRole = user?.role

  const allMenuGroups: MenuGroup[] = [
    {
      label: 'General',
      items: [
        { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'patients', label: 'Pacientes', icon: UserCog },
        { id: 'asistencias', label: 'Asistencias', icon: CalendarCheck },
        { id: 'protocolos', label: 'Protocolos', icon: FileText },
      ]
    },
    {
      // Antes "Configuración" estaba última en "Herramientas" y nadie la encontraba.
      label: 'Mi clínica',
      items: [
        { id: 'settings', label: 'Datos de la clínica', icon: Building2 },
        { id: 'professionals', label: 'Profesionales', icon: Users },
        { id: 'services', label: 'Servicios y precios', icon: Briefcase },
        { id: 'obras-sociales', label: 'Obras Sociales', icon: Shield },
        { id: 'feriados', label: 'Feriados', icon: CalendarOff },
        { id: 'sucursales', label: 'Sucursales', icon: MapIcon },
      ]
    },
    {
      label: 'Finanzas',
      items: [
        { id: 'liquidaciones', label: 'Liquidaciones', icon: DollarSign },
        { id: 'debtors', label: 'Reporte de deudores', icon: FileText },
        { id: 'cashflow', label: 'Flujo de caja', icon: Wallet },
      ]
    },
    {
      label: 'Herramientas',
      items: [
        { id: 'usuarios', label: 'Equipo y accesos', icon: Users },
        { id: 'ausencias', label: 'Ausencias', icon: CalendarOff },
        { id: 'recordatorios', label: 'Recordatorios', icon: Bell },
      ]
    }
  ]

  const menuGroups = allMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessView(userRole, item.id)),
    }))
    .filter((group) => group.items.length > 0)

  const filterChips = [
    { label: 'Pacientes', view: 'patients' },
    { label: 'Turnos', view: 'calendar' },
    { label: 'Servicios', view: 'services' },
    { label: 'Profesionales', view: 'professionals' },
  ].filter((chip) => canAccessView(userRole, chip.view))

  const userInitials = user
    ? `${(user.nombre || '').charAt(0)}${(user.apellido || '').charAt(0)}`.toUpperCase()
    : 'AD'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (window.location.pathname.startsWith('/demo')) {
      window.location.href = '/'
    } else {
      window.location.href = '/login'
    }
  }

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[250px]'

  return (
    <div className="dentiqly-workspace h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ═══ MOBILE TOP BAR ═══ */}
      <div className="lg:hidden h-14 bg-[#0B2440] flex items-center justify-between px-4 sticky top-0 z-[45]">
        <div className="flex items-center gap-2">
          <BrandLogo tone="inverse" alt="Dentiqly" className="h-7 w-auto" />
        </div>
        <div className="flex items-center gap-1">
        {onAyuda && (
          <button
            type="button"
            onClick={onAyuda}
            aria-label="Ayuda: ver recorrido del panel"
            data-tour="header-ayuda"
            className="p-2 hover:bg-white/10 rounded-xl text-white/70 transition-all active:scale-95"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir navegación"
          aria-expanded={sidebarOpen}
          className="p-2 hover:bg-white/10 rounded-xl text-white/70 transition-all active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
        </div>
      </div>

      {/* ═══ SIDEBAR ═══ */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:inset-auto flex`}>
        <div className={`dentiqly-sidebar ${sidebarWidth} flex flex-col overflow-hidden lg:m-3 lg:rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:h-[calc(100vh-24px)]`}>

          {/* Logo + Collapse toggle */}
          <div className={`flex items-center ${collapsed ? 'flex-col justify-center gap-2 px-2 py-3 min-h-[92px]' : 'justify-between px-5 h-[72px]'} border-b border-white/[0.08]`}>
            <BrandLogo tone="inverse" variant={collapsed ? 'mark' : 'full'} alt="Dentiqly" className={collapsed ? 'h-7 w-auto' : 'h-8 w-auto'} />
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/65 hover:text-white/70 transition-all"
              title={collapsed ? 'Expandir navegación' : 'Contraer navegación'}
              aria-label={collapsed ? 'Expandir navegación' : 'Contraer navegación'}
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav aria-label="Gestión del consultorio" className="flex-1 px-2.5 overflow-y-auto dark-scrollbar pt-4 pb-4">
            <div className="space-y-5">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  {!collapsed && (
                    <p className="px-3 mb-1.5 text-[10px] font-bold text-white/50 uppercase tracking-[0.14em]">
                      {group.label}
                    </p>
                  )}
                  {collapsed && <div className="h-px bg-white/[0.06] mx-2 mb-2" />}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = currentView === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onViewChange(item.id)
                            setSidebarOpen(false)
                          }}
                          title={collapsed ? item.label : undefined}
                          aria-label={item.label}
                          data-tour={`nav-${item.id}`}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-2.5 ${collapsed ? 'px-0 py-2.5' : 'px-3 py-2'} text-[13px] font-medium rounded-xl transition-all duration-150 ${
                            isActive
                              ? 'bg-[#2458ED] text-white shadow-md shadow-[#2458ED]/20'
                              : 'text-white/65 hover:bg-white/[0.06] hover:text-white/70'
                          }`}
                        >
                          <Icon className={`h-[16px] w-[16px] flex-shrink-0 ${
                            isActive ? 'text-white' : ''
                          }`} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* User + Logout -> Plan + Logout */}
          <div className="px-2.5 pb-3 border-t border-white/[0.06] pt-3">
            {!collapsed ? (
              <>
                {subscriptionStatus?.subscription_status !== 'active' && !puede(userRole, 'gestionarPlan') ? (
                  // El pago lo hace el administrador: al resto solo se le avisa.
                  <p className="px-3 py-2 mb-1 text-[11.5px] leading-snug text-white/45">Plan sin activar. Avisale al administrador de la clínica.</p>
                ) : subscriptionStatus?.subscription_status !== 'active' ? (
                  <button
                    onClick={onActivatePlan}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 text-white font-bold py-2.5 px-3 rounded-xl mb-2 text-[13px] shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Pagar Plan PRO
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1 bg-white/[0.03]">
                    <div className="w-8 h-8 rounded-full bg-[#2458ED]/20 flex items-center justify-center text-[#2458ED] shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#2458ED] truncate leading-tight">Plan PRO</p>
                      <p className="text-[10px] text-white/50 truncate">Suscripción Activa</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut className="h-[16px] w-[16px]" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2458ED] flex items-center justify-center text-white text-[10px] font-bold">
                  {userInitials}
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut className="h-[16px] w-[16px]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar navegación"
          className="lg:hidden p-2 mt-4 ml-2 h-fit bg-black/20 backdrop-blur-sm rounded-full text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ═══ OVERLAY (mobile) ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="dentiqly-workspace-main flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <header className="dentiqly-workspace-header hidden lg:flex h-[72px] items-center justify-between px-6 xl:px-8 sticky top-0 z-30 bg-white">
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-2xl">
            <div className="relative flex-1 min-w-0 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9C9489]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() && onSearch) {
                    onSearch(searchQuery.trim())
                    setSearchQuery('')
                  }
                }}
                placeholder="Buscar pacientes..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#2458ED] focus:ring-2 focus:ring-[#2458ED]/10 transition-all"
              />
            </div>
            <div className="hidden xl:flex items-center gap-1.5">
              {filterChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => onViewChange(chip.view)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                    currentView === chip.view
                      ? 'bg-[#0B2440] text-white'
                      : 'text-[#9C9489] bg-white border border-gray-200 hover:bg-gray-50 hover:text-[#6B6560]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-6">
            {onAyuda && (
              <button
                type="button"
                onClick={onAyuda}
                data-tour="header-ayuda"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-[#0B2440] hover:border-[#2458ED] hover:text-[#2458ED] transition-all"
              >
                <HelpCircle className="h-4 w-4" />
                Ayuda
              </button>
            )}
            {canAccessView(userRole, 'settings') && (
              <button
                type="button"
                onClick={() => onViewChange('settings')}
                title="Datos de la clínica"
                aria-label="Datos de la clínica"
                className={`p-2 border rounded-xl transition-all ${currentView === 'settings' ? 'bg-[#0B2440] border-[#0B2440] text-white' : 'bg-white border-gray-200 text-[#9C9489] hover:bg-gray-50'}`}
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            {canAccessView(userRole, 'recordatorios') && (
            <button
              onClick={() => onViewChange('recordatorios')}
              aria-label="Ver recordatorios"
              className="relative p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              <Bell className="h-4 w-4 text-[#9C9489]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2458ED] rounded-full" />
            </button>
            )}
            
            {subscriptionStatus && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl mx-1">
                {subscriptionStatus.subscription_status === 'trialing' ? (
                  <>
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">
                      Prueba gratis ({Math.max(0, Math.ceil((new Date(subscriptionStatus.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días)
                    </span>
                  </>
                ) : subscriptionStatus.subscription_status === 'active' ? (
                  <>
                    <Sparkles className="h-4 w-4 text-[#2458ED]" />
                    <span className="text-xs font-bold text-[#2458ED]">Plan PRO</span>
                  </>
                ) : (
                   <span className="text-xs font-semibold text-gray-500">Plan inactivo</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-[#2458ED] flex items-center justify-center text-white text-[10px] font-bold">
                {userInitials}
              </div>
              <span className="text-sm font-semibold text-[#3D3832]">{user?.nombre || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 no-scrollbar min-h-0">
          <div className="max-w-[1600px] mx-auto animate-fade-in min-h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
