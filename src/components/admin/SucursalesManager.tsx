"use client"

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  Phone, 
  Mail, 
  Search, 
  X, 
  ArrowUpDown, 
  Building2, 
  ExternalLink 
} from 'lucide-react';
import { sucursalesApi } from '../../api';
import { useToast } from '../../hooks/use-toast';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { tokens as sharedTokens, labelStyle as sharedLabelStyle, inputStyle as sharedInputStyle, pageWrapper } from './adminDesign'

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  activo: boolean;
}

const tokens = sharedTokens
const labelStyle = sharedLabelStyle
const inputStyle = sharedInputStyle

export const SucursalesManager: React.FC = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  const fetchSucursales = async () => {
    try {
      setLoading(true);
      const data = await sucursalesApi.listar();
      setSucursales(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar las sucursales.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const handleEdit = (sucursal: Sucursal) => {
    setEditingId(sucursal.id);
    setFormData({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion || '',
      telefono: sucursal.telefono || '',
      email: sucursal.email || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de que deseas eliminar esta sucursal?",
      onConfirm: async () => {
        try {
          await sucursalesApi.eliminar(id);
          toast({ title: "Éxito", description: "Sucursal eliminada correctamente." });
          fetchSucursales();
        } catch (error) {
          toast({ title: "Error", description: "No se pudo eliminar la sucursal.", variant: "destructive" });
        }
        setConfirmAction(null);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await sucursalesApi.actualizar(editingId, formData);
        toast({ title: "Éxito", description: "Sucursal actualizada correctamente." });
      } else {
        await sucursalesApi.crear(formData);
        toast({ title: "Éxito", description: "Sucursal creada correctamente." });
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ nombre: '', direccion: '', telefono: '', email: '' });
      fetchSucursales();
    } catch (error) {
      toast({ title: "Error", description: "Hubo un problema al guardar la sucursal.", variant: "destructive" });
    }
  };

  const filteredSucursales = (Array.isArray(sucursales) ? sucursales : []).filter(s => 
    (s.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.direccion?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div style={pageWrapper}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: tokens.navy, letterSpacing: "-0.3px", margin: 0 }}>
            Gestión de Sucursales
          </h1>
          <p style={{ fontSize: 13, color: tokens.grayMuted, marginTop: 3, fontWeight: 400 }}>
            Administrá las diferentes sedes y clínicas de la red
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ nombre: '', direccion: '', telefono: '', email: '' }); setShowModal(true); }}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: tokens.blue, color: tokens.white,
            border: "none", borderRadius: 10, padding: "9px 18px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "Inter, -apple-system, sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = tokens.blueHover)}
          onMouseLeave={e => (e.currentTarget.style.background = tokens.blue)}
        >
          <Plus size={15} />
          Nueva Sucursal
        </button>
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
            placeholder="Buscar por nombre o dirección…"
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
          <Building2 size={15} color={tokens.blue} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.navy }}>{filteredSucursales.length}</span>
          <span style={{ fontSize: 13, color: tokens.grayMuted }}>sucursales</span>
        </div>
      </div>

      {/* ── Grid of Sucursales ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 180, background: tokens.white, borderRadius: 16, border: `0.5px solid ${tokens.grayBorder}`, animation: "pulse 1.5s infinite" }} />
          ))
        ) : filteredSucursales.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "56px 0" }}>
            <MapPin size={36} color={tokens.grayBorder} style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: tokens.grayMuted }}>No se encontraron sucursales</p>
          </div>
        ) : (
          filteredSucursales.map((s) => (
            <div 
              key={s.id}
              style={{
                background: tokens.white, borderRadius: 16, border: `0.5px solid ${tokens.grayBorder}`,
                padding: 20, transition: "all 0.2s", position: "relative"
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 24px rgba(11,16,35,0.06)"; e.currentTarget.style.borderColor = tokens.blue + "33" }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = tokens.grayBorder }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: tokens.blueFaint, color: tokens.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={20} />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => handleEdit(s)} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: tokens.grayMuted, transition: "all 0.12s" }} onMouseEnter={e => e.currentTarget.style.background = tokens.grayRow} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(s.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: tokens.grayMuted, transition: "all 0.12s" }} onMouseEnter={e => { e.currentTarget.style.background = tokens.redFaint; e.currentTarget.style.color = tokens.red }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tokens.grayMuted }}><Trash2 size={14} /></button>
                </div>
              </div>

              <h4 style={{ fontSize: 16, fontWeight: 600, color: tokens.navy, margin: "0 0 12px 0" }}>{s.nombre}</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: tokens.grayText }}>
                  <MapPin size={14} color={tokens.grayMuted} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.direccion || 'Sin dirección'}</span>
                </div>
                {s.telefono && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: tokens.grayText }}>
                    <Phone size={14} color={tokens.grayMuted} />
                    <span>{s.telefono}</span>
                  </div>
                )}
                {s.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: tokens.grayText }}>
                    <Mail size={14} color={tokens.grayMuted} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(11,16,35,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50, padding: 16, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: tokens.white, borderRadius: 16,
            maxWidth: 480, width: "100%",
            boxShadow: "0 24px 48px rgba(11,16,35,0.12)",
          }}>
            <div style={{
              padding: "18px 24px", borderBottom: `0.5px solid ${tokens.grayBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.navy, margin: 0 }}>
                {editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tokens.grayMuted, transition: "all 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = tokens.grayRow }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nombre de la Sede *</label>
                  <input
                    type="text" required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Clínica Central"
                    style={{ ...inputStyle, borderColor: focusedField === "nombre" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("nombre")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    placeholder="Av. Santa Fe 1234, CABA"
                    style={{ ...inputStyle, borderColor: focusedField === "dir" ? tokens.blue : tokens.grayBorder }}
                    onFocus={() => setFocusedField("dir")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      style={{ ...inputStyle, borderColor: focusedField === "tel" ? tokens.blue : tokens.grayBorder }}
                      onFocus={() => setFocusedField("tel")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ ...inputStyle, borderColor: focusedField === "email" ? tokens.blue : tokens.grayBorder }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `0.5px solid ${tokens.grayBorder}` }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "9px 18px", fontSize: 13, fontWeight: 500,
                    border: `0.5px solid ${tokens.grayBorder}`, borderRadius: 9,
                    background: tokens.white, color: tokens.grayText, cursor: "pointer",
                    fontFamily: "Inter, -apple-system, sans-serif", transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.grayBg }}
                  onMouseLeave={e => { e.currentTarget.style.background = tokens.white }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 20px", fontSize: 13, fontWeight: 700,
                    background: tokens.blue, color: tokens.white,
                    border: "none", borderRadius: 9, cursor: "pointer",
                    fontFamily: "Inter, -apple-system, sans-serif", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.blueHover }}
                  onMouseLeave={e => { e.currentTarget.style.background = tokens.blue }}
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
