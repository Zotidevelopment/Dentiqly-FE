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
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface AdminLayoutProps {
  children: React.ReactNode
  currentView: string
  onViewChange: (view: string) => void
  onSearch?: (query: string) => void
  subscriptionStatus?: any
  onActivatePlan?: () => void
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
  onActivatePlan
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  const menuGroups: MenuGroup[] = [
    {
      label: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'patients', label: 'Pacientes', icon: UserCog },
      ]
    },
    {
      label: 'Gestión',
      items: [
        { id: 'professionals', label: 'Profesionales', icon: Users },
        { id: 'services', label: 'Servicios', icon: Briefcase },
        { id: 'obras-sociales', label: 'Obras Sociales', icon: Shield },
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
        { id: 'usuarios', label: 'Equipo', icon: Users },
        { id: 'feriados', label: 'Feriados', icon: Calendar },
        { id: 'ausencias', label: 'Ausencias', icon: CalendarOff },
        { id: 'sucursales', label: 'Sucursales', icon: MapIcon },
        { id: 'recordatorios', label: 'Recordatorios', icon: Bell },
        { id: 'settings', label: 'Configuración', icon: Settings },
      ]
    }
  ]

  const filterChips = [
    { label: 'Pacientes', view: 'patients' },
    { label: 'Turnos', view: 'calendar' },
    { label: 'Servicios', view: 'services' },
    { label: 'Profesionales', view: 'professionals' },
  ]

  const userInitials = user
    ? `${(user.nombre || '').charAt(0)}${(user.apellido || '').charAt(0)}`.toUpperCase()
    : 'AD'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[250px]'

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* ═══ MOBILE TOP BAR ═══ */}
      <div className="lg:hidden h-14 bg-[#0B1023] flex items-center justify-between px-4 sticky top-0 z-[45]">
        <div className="flex items-center gap-2">
          <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-7 w-auto brightness-0 invert" />
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-white/10 rounded-xl text-white/70 transition-all active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ═══ SIDEBAR ═══ */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:inset-auto flex`}>
        <div className={`${sidebarWidth} bg-[#0B1023] flex flex-col overflow-hidden lg:m-3 lg:rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:h-[calc(100vh-24px)] shadow-xl`}>

          {/* Logo + Collapse toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-5'} h-[64px] border-b border-white/[0.06]`}>
            {!collapsed && (
              <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-8 w-auto brightness-0 invert" />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/40 hover:text-white/70 transition-all"
              title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2.5 overflow-y-auto dark-scrollbar pt-4 pb-4">
            <div className="space-y-5">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  {!collapsed && (
                    <p className="px-3 mb-1.5 text-[10px] font-bold text-white/25 uppercase tracking-[0.14em]">
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
                          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-2.5 ${collapsed ? 'px-0 py-2.5' : 'px-3 py-2'} text-[13px] font-medium rounded-xl transition-all duration-150 ${
                            isActive
                              ? 'bg-[#2563FF] text-white shadow-md shadow-[#2563FF]/20'
                              : 'text-white/40 hover:bg-white/[0.06] hover:text-white/70'
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
                {subscriptionStatus?.subscription_status !== 'active' ? (
                  <button
                    onClick={onActivatePlan}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-2.5 px-3 rounded-xl mb-2 text-[13px] shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Pagar Plan PRO
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1 bg-white/[0.03]">
                    <div className="w-8 h-8 rounded-full bg-[#2563FF]/20 flex items-center justify-center text-[#2563FF] shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#2563FF] truncate leading-tight">Plan PRO</p>
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563FF] to-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold">
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
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="hidden lg:flex h-[60px] items-center justify-between px-8 sticky top-0 z-30 bg-white border-b border-gray-200/50">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1 max-w-sm">
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
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#2563FF] focus:ring-2 focus:ring-[#2563FF]/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {filterChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => onViewChange(chip.view)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                    currentView === chip.view
                      ? 'bg-[#0B1023] text-white'
                      : 'text-[#9C9489] bg-white border border-gray-200 hover:bg-gray-50 hover:text-[#6B6560]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-6">
            <button
              onClick={() => onViewChange('recordatorios')}
              className="relative p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              <Bell className="h-4 w-4 text-[#9C9489]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2563FF] rounded-full" />
            </button>
            
            {subscriptionStatus && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl mx-1">
                {subscriptionStatus.subscription_status === 'trialing' ? (
                  <>
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">
                      Prueba gratis ({Math.max(0, Math.ceil((new Date(subscriptionStatus.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días)
                    </span>
                  </>
                ) : subscriptionStatus.subscription_status === 'active' ? (
                  <>
                    <Sparkles className="h-4 w-4 text-[#2563FF]" />
                    <span className="text-xs font-bold text-[#2563FF]">Plan PRO</span>
                  </>
                ) : (
                   <span className="text-xs font-semibold text-gray-500">Plan inactivo</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563FF] to-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold">
                {userInitials}
              </div>
              <span className="text-sm font-semibold text-[#3D3832]">{user?.nombre || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 no-scrollbar min-h-0">
          <div className="max-w-[1600px] mx-auto animate-fade-in h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
