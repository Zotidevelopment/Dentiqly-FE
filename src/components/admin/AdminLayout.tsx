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
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { canAccessView } from '../../config/permissions'

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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { user } = useAuth()

  React.useEffect(() => {
    document.body.classList.add('dashboard-active')
    return () => {
      document.body.classList.remove('dashboard-active')
    }
  }, [])

  const userRole = user?.role

  const allMenuGroups: MenuGroup[] = [
    {
      label: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'patients', label: 'Pacientes', icon: UserCog },
        { id: 'asistencias', label: 'Asistencias', icon: CalendarCheck },
        { id: 'protocolos', label: 'Protocolos', icon: FileText },
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
  const isPro = subscriptionStatus?.subscription_status === 'active'
  const isTrialing = subscriptionStatus?.subscription_status === 'trialing'

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* ═══ MOBILE TOP BAR ═══ */}
      <div className="lg:hidden h-14 bg-[#2563FF] flex items-center justify-between px-4 sticky top-0 z-[45]">
        <div className="flex items-center gap-2">
          <img src="/assets/dentiqly-logo-white.png?v=2" alt="Dentiqly" className="h-7 w-auto" />
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ═══ SIDEBAR ═══ */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:inset-auto flex`}>
        {/* ── Sidebar body — brand blue ── */}
        <div className={`${sidebarWidth} bg-[#2563FF] flex flex-col overflow-hidden lg:m-3 lg:rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:h-[calc(100vh-24px)] shadow-xl shadow-[#2563FF]/40`}>

          {/* Logo + Collapse toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-5'} h-[64px] border-b border-white/20`}>
            {!collapsed && (
              <img src="/assets/dentiqly-logo-white.png?v=2" alt="Dentiqly" className="h-8 w-auto" />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 hover:bg-[#0B1023]/25 text-white transition-all"
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
                    <p className="px-3 mb-1.5 text-[10px] font-bold text-white/70 tracking-[0.14em]">
                      {group.label}
                    </p>
                  )}
                  {collapsed && <div className="h-px bg-white/30 mx-2 mb-2" />}
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
                          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-2.5 ${collapsed ? 'px-0 py-2.5' : 'px-3 py-2'} text-[13px] rounded-xl transition-all duration-150 ${
                            isActive
                              ? 'bg-white text-[#2563FF] shadow-md shadow-[#0B1023]/15 font-bold'
                              : 'text-white font-medium hover:bg-[#0B1023]/20 hover:text-white'
                          }`}
                        >
                          <Icon className={`h-[16px] w-[16px] flex-shrink-0 ${
                            isActive ? 'text-[#2563FF]' : 'text-white'
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

          {/* Bottom: Plan status + Logout */}
          <div className="px-2.5 pb-3 border-t border-white/20 pt-3">
            {!collapsed ? (
              <>
                {!isPro ? (
                  <button
                    onClick={onActivatePlan}
                    className="w-full flex items-center justify-center gap-2 bg-white text-[#2563FF] font-bold py-2.5 px-3 rounded-xl mb-2 text-[13px] shadow-md shadow-[#0B1023]/15 hover:bg-white/90 hover:scale-[1.02] transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Pagar Plan PRO
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1 bg-white/20">
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-white truncate leading-tight">Plan PRO</p>
                      <p className="text-[10px] text-white/70 truncate">Suscripción Activa</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-white/80 hover:text-white hover:bg-[#0B1023]/20 rounded-xl transition-all"
                >
                  <LogOut className="h-[16px] w-[16px]" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-[10px] font-bold">
                  {userInitials}
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className="p-2 text-white/70 hover:text-white hover:bg-[#0B1023]/20 rounded-xl transition-all"
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
        {/* Header — clean, no bottom border/shadow */}
        <header className="hidden lg:flex h-[60px] items-center justify-between px-8 sticky top-0 z-30 bg-white">
          <div className="flex items-center gap-3 flex-1">
            {/* Nav links — #2562FD background, borderless, white text */}
            <div className="flex items-center gap-0.5 bg-[#2562FD] rounded-full px-2 py-1.5">
              {filterChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => onViewChange(chip.view)}
                  className={`relative px-4 py-1.5 text-[12px] font-semibold transition-all whitespace-nowrap rounded-full ${
                    currentView === chip.view
                      ? 'text-[#2562FD] bg-white shadow-sm'
                      : 'text-white hover:text-white/90 hover:bg-white/10'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            {/* Search bar */}
            <div className="relative flex-1 max-w-xs group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2562FD]/30 group-focus-within:text-[#2562FD] transition-colors" />
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
                className="w-full pl-9 pr-4 py-[7px] bg-white border border-[#2562FD]/25 rounded-full text-[12px] text-[#2562FD]/40 placeholder:text-[#2562FD]/40 focus:text-[#2562FD] focus:placeholder:text-[#2562FD]/50 focus:outline-none focus:border-[#2562FD] focus:ring-2 focus:ring-[#2562FD]/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell — solid filled, brand blue */}
            <button
              onClick={() => onViewChange('recordatorios')}
              className="relative p-2 hover:bg-[#2562FD]/5 rounded-xl transition-all group"
              title="Recordatorios"
            >
              <svg className="h-[20px] w-[20px] text-[#2562FD] group-hover:text-[#1D4ED8] transition-colors" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2562FD] rounded-full ring-2 ring-white" />
            </button>

            {/* Trial badge (only when trialing) */}
            {isTrialing && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#2563FF]/10 rounded-lg">
                <Clock className="h-3.5 w-3.5 text-[#2563FF]" />
                <span className="text-xs font-semibold text-[#2563FF]">
                  Prueba ({Math.max(0, Math.ceil((new Date(subscriptionStatus.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días)
                </span>
              </div>
            )}

            {/* Profile icon — solid blue circle, white user icon inside */}
            <div className="relative">
              <button
                id="profile-btn"
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-[#2562FD] flex items-center justify-center hover:bg-[#1D4ED8] transition-all active:scale-95 shadow-md shadow-[#2562FD]/30"
                title="Mi perfil"
              >
                <svg className="h-[18px] w-[18px] text-white" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div
                    id="profile-dropdown"
                    className="absolute right-0 top-[calc(100%+10px)] z-50 w-[220px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in"
                  >
                    {/* User info */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#2563FF]/10 border-2 border-[#2563FF]/40 flex items-center justify-center shrink-0">
                          <svg className="h-5 w-5 text-[#2563FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#0B1023] truncate">
                            {user?.nombre} {user?.apellido}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">{user?.email || userRole}</p>
                        </div>
                      </div>
                      {/* Plan Pro badge */}
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        isPro
                          ? 'bg-[#2563FF]/10 text-[#2563FF]'
                          : isTrialing
                          ? 'bg-[#2563FF]/10 text-[#2563FF]'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Sparkles className="h-3 w-3" />
                        {isPro ? 'Plan PRO' : isTrialing ? 'Prueba gratis' : 'Sin plan activo'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-2 py-2">
                      <button
                        onClick={() => { onViewChange('settings'); setProfileDropdownOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-600 hover:text-[#0B1023] hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <Settings className="h-4 w-4" />
                        Configuración
                      </button>
                      {!isPro && (
                        <button
                          onClick={() => { onActivatePlan?.(); setProfileDropdownOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-bold text-[#2563FF] hover:text-[#1D4ED8] hover:bg-[#2563FF]/5 rounded-xl transition-all"
                        >
                          <Sparkles className="h-4 w-4" />
                          Activar Plan PRO
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-400 hover:text-[#0B1023] hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
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

