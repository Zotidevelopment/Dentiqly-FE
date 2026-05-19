import { useState, useEffect, useMemo } from "react"
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  Loader2,
  UserPlus,
} from "lucide-react"
import { usuariosClinicaApi } from "../../api/usuarios-clinica"
import type { UsuarioClinica } from "../../api/usuarios-clinica"
import { useAuth } from "../../hooks/useAuth"
import { useToast } from "../../hooks/use-toast"
import {
  tokens,
  labelStyle,
  inputStyle,
  pageWrapper,
  getInitials,
  getAvatarStyle,
  modalOverlay,
  modalCard,
  btnPrimary,
  btnSecondary,
  btnDanger,
} from "./adminDesign"

const ROLES = [
  { value: "admin", label: "Administrador", desc: "Acceso completo a toda la plataforma" },
  { value: "odontologo", label: "Odontólogo", desc: "Agenda, pacientes, odontograma y tratamientos" },
  { value: "recepcionista", label: "Recepcionista", desc: "Agenda, pacientes y caja" },
  { value: "staff", label: "Staff", desc: "Acceso limitado de solo lectura" },
]

const roleBadge = (role: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    admin: { bg: tokens.violetFaint, color: tokens.violet },
    odontologo: { bg: tokens.blueFaint, color: tokens.blue },
    recepcionista: { bg: tokens.greenFaint, color: tokens.greenText },
    staff: { bg: tokens.grayPill, color: tokens.grayPillTx },
  }
  const s = map[role] || map.staff
  return {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 4,
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: s.bg,
    color: s.color,
    textTransform: "capitalize" as const,
  }
}

export function UsersManager() {
  const [usuarios, setUsuarios] = useState<UsuarioClinica[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UsuarioClinica | null>(null)
  const [formData, setFormData] = useState({ nombre: "", apellido: "", email: "", role: "recepcionista" })
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const itemsPerPage = 12

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const data = await usuariosClinicaApi.listar()
      setUsuarios(data)
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los usuarios" })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setFormData({ nombre: "", apellido: "", email: "", role: "recepcionista" })
    setShowModal(true)
  }

  const handleOpenEdit = (u: UsuarioClinica) => {
    setEditingUser(u)
    setFormData({ nombre: u.nombre, apellido: u.apellido, email: u.email, role: u.role })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Nombre y apellido son obligatorios." })
      return
    }
    if (!editingUser && (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email))) {
      toast({ variant: "destructive", title: "Error", description: "Ingresá un email válido." })
      return
    }
    setSaving(true)
    try {
      if (editingUser) {
        await usuariosClinicaApi.actualizar(editingUser.id, formData)
        toast({ title: "Usuario actualizado", description: `${formData.nombre} ${formData.apellido} fue actualizado.` })
      } else {
        await usuariosClinicaApi.crear(formData)
        toast({ title: "Usuario creado", description: `Se envió una invitación a ${formData.email} con las credenciales de acceso.` })
      }
      setShowModal(false)
      cargarUsuarios()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || error.message || "No se pudo guardar el usuario",
      })
    } finally {
      setSaving(false)
    }
  }

  const [confirmDelete, setConfirmDelete] = useState<UsuarioClinica | null>(null)

  const handleDelete = async (u: UsuarioClinica) => {
    if (String(u.id) === String(user?.id)) {
      toast({ variant: "destructive", title: "Error", description: "No podés eliminarte a vos mismo." })
      return
    }
    setConfirmDelete(u)
  }

  const handleConfirmDelete = async () => {
    const u = confirmDelete
    if (!u) return
    setConfirmDelete(null)

    try {
      await usuariosClinicaApi.eliminar(u.id)
      toast({ title: "Usuario eliminado", description: `${u.nombre} ${u.apellido} fue desactivado.` })
      cargarUsuarios()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || error.message || "No se pudo eliminar el usuario",
      })
    }
  }

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios
    const lower = searchTerm.toLowerCase()
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(lower) ||
        u.apellido.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower)
    )
  }, [usuarios, searchTerm])

  const { paginated, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return {
      paginated: filteredUsuarios.slice(start, start + itemsPerPage),
      totalPages: Math.ceil(filteredUsuarios.length / itemsPerPage),
    }
  }, [filteredUsuarios, currentPage])

  const pageStyle: React.CSSProperties = { ...pageWrapper, background: tokens.grayBg, padding: "28px 32px" }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Equipo
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Gestioná los usuarios de tu clínica y sus permisos
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: tokens.blue, color: tokens.white,
            border: "none", borderRadius: 10, padding: "9px 18px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "Inter, -apple-system, sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = tokens.blueHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = tokens.blue)}
        >
          <UserPlus size={15} />
          Invitar usuario
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center">
        <div
          style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
            borderRadius: 10, padding: "0 14px", height: 40,
          }}
        >
          <Search size={15} color={tokens.grayMuted} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: tokens.navy, flex: 1,
              fontFamily: "Inter, -apple-system, sans-serif",
            }}
          />
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: tokens.white, border: `0.5px solid ${tokens.grayBorder}`,
            borderRadius: 10, padding: "0 14px", height: 40, whiteSpace: "nowrap",
          }}
        >
          <Users size={15} color={tokens.blue} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{filteredUsuarios.length}</span>
          <span style={{ fontSize: 13, color: tokens.grayMuted }}>usuarios</span>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: tokens.white, borderRadius: 14,
          border: `0.5px solid ${tokens.grayBorder}`, overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${tokens.grayBorder}` }}>
                {["Usuario", "Email", "Rol", ""].map((col, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: "left", padding: "12px 16px",
                      fontSize: 11, fontWeight: 600, color: tokens.grayMuted,
                      textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `0.5px solid ${tokens.grayRow}` }}>
                    {[140, 180, 80, 60].map((w, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ width: w, height: 11, borderRadius: 5, background: tokens.grayRow, animation: "pulse 1.5s infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "56px 0" }}>
                    <Users size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>
                      {searchTerm ? "No hay usuarios que coincidan" : "Aún no hay usuarios adicionales"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((u, idx) => {
                  const isLast = idx === paginated.length - 1
                  const avatar = getAvatarStyle(u.id)
                  const isSelf = String(u.id) === String(user?.id)
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: isLast ? "none" : `0.5px solid ${tokens.grayRow}`,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = tokens.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34, height: 34, borderRadius: 9,
                              background: avatar.bg, color: avatar.color,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700, flexShrink: 0,
                            }}
                          >
                            {getInitials(u.nombre, u.apellido)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                              {u.apellido}, {u.nombre}
                              {isSelf && (
                                <span style={{ fontSize: 10, color: tokens.grayMuted, fontWeight: 400, marginLeft: 6 }}>(tú)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: tokens.grayText }}>
                          <Mail size={12} color={tokens.grayMuted} />
                          {u.email}
                        </div>
                      </td>

                      <td style={{ padding: "11px 16px" }}>
                        <span style={roleBadge(u.role)}>
                          <Shield size={10} />
                          {ROLES.find((r) => r.value === u.role)?.label || u.role}
                        </span>
                      </td>

                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Editar"
                            style={{
                              width: 30, height: 30, borderRadius: 7, border: "none",
                              background: "transparent", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: tokens.grayMuted, transition: "all 0.12s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = tokens.blueFaint; e.currentTarget.style.color = tokens.blue }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}
                          >
                            <Edit size={14} />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(u) }}
                              title="Eliminar"
                              style={{
                                width: 30, height: 30, borderRadius: 7, border: "none",
                                background: "transparent", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: tokens.grayMuted, transition: "all 0.12s",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = tokens.redFaint; e.currentTarget.style.color = tokens.red }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: "12px 16px", borderTop: `0.5px solid ${tokens.grayRow}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: tokens.grayMuted }}>Página {currentPage} de {totalPages}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{ padding: 6, borderRadius: 8, border: `0.5px solid ${tokens.grayBorder}`, background: tokens.white, cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ padding: 6, borderRadius: 8, border: `0.5px solid ${tokens.grayBorder}`, background: tokens.white, cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={{ ...modalCard, maxWidth: 480, display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${tokens.grayBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: tokens.navy, margin: 0 }}>
                {editingUser ? "Editar usuario" : "Invitar usuario"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: tokens.grayMuted, padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    style={inputStyle}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    style={inputStyle}
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="juan@clinica.com"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Rol</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                        border: `1.5px solid ${formData.role === r.value ? tokens.blue : tokens.grayBorder}`,
                        background: formData.role === r.value ? tokens.blueFaint : tokens.white,
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={formData.role === r.value}
                        onChange={() => setFormData({ ...formData, role: r.value })}
                        style={{ display: "none" }}
                      />
                      <div
                        style={{
                          width: 14, height: 14, borderRadius: "50%",
                          border: `2px solid ${formData.role === r.value ? tokens.blue : tokens.grayBorder}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {formData.role === r.value && (
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: tokens.blue }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: tokens.navy, margin: 0 }}>{r.label}</p>
                        <p style={{ fontSize: 10, color: tokens.grayMuted, margin: 0 }}>{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {!editingUser && (
                <div
                  style={{
                    padding: "8px 12px", borderRadius: 8,
                    background: tokens.blueFaint, marginBottom: 16,
                    fontSize: 11, color: tokens.blue, lineHeight: 1.4,
                  }}
                >
                  Se enviará un email con las credenciales temporales al usuario invitado.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {editingUser ? "Guardar cambios" : "Enviar invitación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...modalCard, maxWidth: 400, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: tokens.navy, margin: "0 0 8px 0" }}>Confirmar eliminación</h3>
            <p style={{ fontSize: 13, color: tokens.grayText, margin: "0 0 20px 0" }}>
              ¿Estás seguro de eliminar a <strong>{confirmDelete.nombre} {confirmDelete.apellido}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={btnSecondary}>Cancelar</button>
              <button onClick={handleConfirmDelete} style={btnDanger}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
