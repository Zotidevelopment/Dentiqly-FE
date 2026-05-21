import React, { useState, useEffect } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { patientPortalApi, clearPatientToken } from "../../api/patient-portal"
import { Calendar, User, FileText, Folder, Clock, LogOut, Menu, X, Home, ChevronRight } from "lucide-react"

export const PatientLayout: React.FC = () => {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfil = await patientPortalApi.obtenerPerfil()
        setNombre(perfil.paciente?.nombre || "")
        setApellido(perfil.paciente?.apellido || "")
      } catch (error) {
        console.error("Error al cargar perfil:", error)
      } finally {
        setLoading(false)
      }
    }
    cargarPerfil()
  }, [])

  const handleLogout = () => {
    clearPatientToken()
    navigate("/paciente/login")
  }

  const navItems = [
    { to: "/paciente/dashboard", icon: Home, label: "Inicio" },
    { to: "/paciente/turnos", icon: Calendar, label: "Mis Turnos" },
    { to: "/paciente/mis-datos", icon: User, label: "Mis Datos" },
    { to: "/paciente/historial", icon: FileText, label: "Mi Historial" },
    { to: "/paciente/tratamientos", icon: Clock, label: "Tratamientos" },
    { to: "/paciente/archivos", icon: Folder, label: "Archivos" },
  ]

  const initials = `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563FF]" />
          <span className="text-[#8A93A8] font-medium">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8FA]">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-[#0B1023] text-white shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#0B1023] transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-8 w-auto brightness-0 invert" />
          </div>
          <p className="text-white/30 text-xs font-medium mt-2 uppercase tracking-wider">Portal del Paciente</p>
        </div>

        {/* User info */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563FF] to-[#02E3FF] flex items-center justify-center">
              <span className="text-white text-sm font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{nombre} {apellido}</p>
              <p className="text-white/30 text-xs">Paciente</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#2563FF] text-white shadow-[0_4px_15px_rgba(37,99,255,0.3)]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#F7F8FA]/80 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm pl-12 lg:pl-0">
            <span className="text-[#8A93A8]">Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A93A8]" />
            <span className="text-[#0B1023] font-semibold">Hola, {nombre}</span>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
