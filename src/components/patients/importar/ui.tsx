// Piezas visuales compartidas por los pasos del importador.
import type React from "react"

export const fmt = (n: number) => new Intl.NumberFormat("es-AR").format(n)

export const COLORES = {
  azul: "var(--brand-primary, #2458ED)",
  tinta: "#0B2440",
  gris: "#65788D",
  borde: "#DCE5EE",
  fondo: "#F5F8FF",
}

export function Boton({ variante = "primario", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" | "peligro" | "texto" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
  const estilos = {
    primario: "text-white shadow-sm hover:brightness-110",
    secundario: "bg-white border border-[#DCE5EE] text-[#4B5568] hover:bg-[#F5F8FF]",
    peligro: "bg-white border border-red-200 text-red-700 hover:bg-red-50",
    texto: "text-[#2458ED] hover:underline px-1 py-1",
  }[variante]
  return <button type="button" {...props} className={`${base} ${estilos} ${className}`} style={variante === "primario" ? { background: COLORES.azul, ...props.style } : props.style} />
}

export function Pildora({ tono, children }: { tono: "verde" | "ambar" | "rojo" | "gris" | "azul"; children: React.ReactNode }) {
  const t = {
    verde: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ambar: "bg-amber-50 text-amber-800 border-amber-200",
    rojo: "bg-red-50 text-red-700 border-red-200",
    gris: "bg-slate-100 text-slate-600 border-slate-200",
    azul: "bg-blue-50 text-blue-700 border-blue-200",
  }[tono]
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${t}`}>{children}</span>
}

export function Tarjeta({ titulo, valor, detalle, tono = "gris", onClick, activa }: { titulo: string; valor: string; detalle?: string; tono?: "verde" | "ambar" | "rojo" | "gris" | "azul"; onClick?: () => void; activa?: boolean }) {
  const color = { verde: "text-emerald-700", ambar: "text-amber-700", rojo: "text-red-700", gris: "text-[#0B2440]", azul: "text-[#2458ED]" }[tono]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-2xl border bg-white px-4 py-3 text-left transition ${onClick ? "hover:border-[#2458ED]/40" : "cursor-default"} ${activa ? "border-[#2458ED] ring-2 ring-[#2458ED]/15" : "border-[#DCE5EE]"}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#65788D]">{titulo}</div>
      <div className={`mt-0.5 text-[22px] font-bold leading-tight ${color}`}>{valor}</div>
      {detalle && <div className="mt-0.5 text-[11.5px] text-[#65788D]">{detalle}</div>}
    </button>
  )
}

export function Opcion<T extends string>({ valor, actual, onCambio, titulo, detalle }: { valor: T; actual: T; onCambio: (v: T) => void; titulo: string; detalle?: string }) {
  const activa = valor === actual
  return (
    <label className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-2.5 transition ${activa ? "border-[#2458ED] bg-[#EAF2FF]" : "border-[#DCE5EE] bg-white hover:bg-[#F8FAFF]"}`}>
      <input type="radio" className="mt-0.5 accent-[#2458ED]" checked={activa} onChange={() => onCambio(valor)} />
      <span>
        <span className="block text-[13px] font-semibold text-[#0B2440]">{titulo}</span>
        {detalle && <span className="block text-[12px] text-[#65788D]">{detalle}</span>}
      </span>
    </label>
  )
}

export const selectClase = "w-full rounded-lg border border-[#DCE5EE] bg-white px-2.5 py-2 text-[13px] text-[#0B2440] outline-none focus:border-[#2458ED] focus:ring-2 focus:ring-[#2458ED]/15"
