/**
 * Clases compartidas de los botones de la landing.
 * Un solo lugar para que todos los CTAs se vean iguales.
 */
const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"

export const btnPrimary = `${base} bg-brand-blue text-white px-6 py-3.5 text-[15px] shadow-[0_10px_28px_-10px_rgba(37,99,255,0.75)] hover:bg-brand-blue-hover hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_rgba(37,99,255,0.85)] active:translate-y-0`

export const btnPrimaryLg = `${base} bg-brand-blue text-white px-7 py-4 text-[16px] shadow-[0_12px_32px_-10px_rgba(37,99,255,0.8)] hover:bg-brand-blue-hover hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-10px_rgba(37,99,255,0.9)] active:translate-y-0`

export const btnSecondary = `${base} bg-white text-brand-ink px-6 py-3.5 text-[15px] ring-1 ring-inset ring-brand-ink/[0.12] hover:ring-brand-ink/25 hover:bg-brand-surface`

export const btnSecondaryLg = `${base} bg-white text-brand-ink px-7 py-4 text-[16px] ring-1 ring-inset ring-brand-ink/[0.12] hover:ring-brand-ink/25 hover:bg-brand-surface`

export const btnOnDark = `${base} bg-white text-brand-navy px-7 py-4 text-[16px] shadow-[0_12px_32px_-12px_rgba(255,255,255,0.5)] hover:bg-brand-blue-tint hover:-translate-y-0.5 active:translate-y-0`

export const btnGhostOnDark = `${base} bg-white/[0.06] text-white px-6 py-3.5 text-[15px] ring-1 ring-inset ring-white/15 hover:bg-white/[0.12] hover:ring-white/30`

export const btnSm = `${base} bg-brand-blue text-white px-5 h-10 text-[13.5px] shadow-sm shadow-brand-blue/30 hover:bg-brand-blue-hover`
