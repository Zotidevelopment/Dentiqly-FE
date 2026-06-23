import type React from "react"

export const tokens = {
  blue: "var(--brand-primary, #2563FF)",
  blueHover: "var(--brand-primary-hover, #1D4ED8)",
  blueFaint: "#EEF3FF",
  navy: "#0B1023",

  grayText: "#4B5568",
  grayMuted: "#8A93A8",
  grayBorder: "#E2E0DB",
  grayBg: "#F7F8FA",
  grayRow: "#F7F8FA",
  rowHover: "#F0F2F5",
  white: "#FFFFFF",

  green: "#2563FF", // Compliant success color: brand blue
  greenFaint: "#EEF3FF", // Faint blue
  greenText: "#1D4ED8", // Darker blue

  red: "#0B1023", // Compliant danger/delete color: navy
  redFaint: "#F1F5F9", // Faint gray/white
  redText: "#0B1023", // Navy

  orange: "#02E3FF", // Compliant warning/pending color: celeste
  orangeFaint: "#EEF3FF", // Faint blue
  orangeText: "#0047FF", // Deep brand blue

  violet: "#0B1023", // Compliant accent color: navy
  violetFaint: "#EEF3FF", // Faint blue

  grayDot: "#CBD5E1",
  grayPill: "#F1F5F9",
  grayPillTx: "#64748B",

  cardBorder: "#E2E5EB",
  cardBg: "#FFFFFF",
  pageBg: "#FFFFFF",
  sidebarBg: "#0B1023",

  celeste: "var(--brand-secondary, #2563FF)",
  celesteHover: "#1D4ED8",

  avatarColors: [
    { bg: "#DBEAFE", color: "#2563FF" },
    { bg: "#EEF3FF", color: "#1D4ED8" },
    { bg: "#E0F2FE", color: "#0047FF" },
    { bg: "#F1F5F9", color: "#0B1023" },
    { bg: "#0B1023", color: "#FFFFFF" },
    { bg: "#2563FF", color: "#FFFFFF" },
  ],
}

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 652,
  fontVariationSettings: "'wght' 652",
  color: tokens.grayMuted,
  marginBottom: 6,
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 13,
  border: `1px solid ${tokens.cardBorder}`,
  borderRadius: 12,
  outline: "none",
  color: tokens.navy,
  background: tokens.white,
  fontFamily: "'Instrument Sans', sans-serif",
  letterSpacing: "-0.6px",
  transition: "all 0.15s",
}

export const pageWrapper: React.CSSProperties = {
  fontFamily: "'Instrument Sans', sans-serif",
  letterSpacing: "-0.6px",
}

export const cardStyle: React.CSSProperties = {
  background: tokens.cardBg,
  borderRadius: 16,
  border: `1px solid ${tokens.cardBorder}60`,
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
}

export const tableHeaderStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 652,
  fontVariationSettings: "'wght' 652",
  color: tokens.grayMuted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  paddingBottom: 10,
  borderBottom: `1px solid ${tokens.cardBorder}40`,
}

export const tableRowStyle = (isEven: boolean): React.CSSProperties => ({
  borderBottom: `1px solid ${tokens.cardBorder}30`,
  transition: "background 0.15s",
})

export const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 20px",
  background: "var(--admin-button-bg, #2563FF)",
  color: "var(--admin-button-text, #FFFFFF)",
  border: "none",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 652,
  fontVariationSettings: "'wght' 652",
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "'Instrument Sans', sans-serif",
  letterSpacing: "-0.6px",
}

export const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 20px",
  background: tokens.white,
  color: tokens.grayText,
  border: `1px solid ${tokens.cardBorder}`,
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 652,
  fontVariationSettings: "'wght' 652",
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "'Instrument Sans', sans-serif",
  letterSpacing: "-0.6px",
}

export const btnDanger: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  background: tokens.redFaint,
  color: tokens.redText,
  border: `1px solid ${tokens.grayBorder}`,
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 652,
  fontVariationSettings: "'wght' 652",
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "'Instrument Sans', sans-serif",
  letterSpacing: "-0.6px",
}

export const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  padding: 16,
}

export const modalCard: React.CSSProperties = {
  background: tokens.white,
  borderRadius: 20,
  width: "100%",
  maxWidth: 520,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
}

export const getInitials = (nombre: string, apellido: string) =>
  `${(nombre || "").charAt(0)}${(apellido || "").charAt(0)}`.toUpperCase()

export const getAvatarStyle = (id: string | number) => {
  const strId = String(id)
  const idx = strId.charCodeAt(strId.length - 1) % tokens.avatarColors.length
  return tokens.avatarColors[idx]
}

export const statusBadge = (estado: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    Activo: { bg: tokens.greenFaint, color: tokens.greenText },
    Inactivo: { bg: tokens.redFaint, color: tokens.redText },
    Pendiente: { bg: tokens.orangeFaint, color: tokens.orangeText },
    Confirmado: { bg: tokens.blueFaint, color: tokens.blue },
    Atendido: { bg: tokens.greenFaint, color: tokens.greenText },
    Cancelado: { bg: tokens.redFaint, color: tokens.redText },
    Ausente: { bg: "#1F2937", color: "#FFFFFF" },
  }
  const s = map[estado] || { bg: tokens.grayRow, color: tokens.grayText }
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    background: s.bg,
    color: s.color,
  }
}

