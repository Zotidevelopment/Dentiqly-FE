export type ProductIconName = 'booking' | 'agenda' | 'patient' | 'finance'
/** Íconos extra de la misma familia, fuera del selector de producto. */
export type ProductIconAnyName = ProductIconName | 'clinic' | 'plan'

/** A small family of dental-workflow symbols, drawn on the same 40px grid. */
export function ProductIcon({ name, size = 32, className = '' }: { name: ProductIconAnyName; size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {name === 'booking' && <>
      <rect x="6" y="8" width="26" height="25" rx="6" fill="var(--icon-fill, #D7E8FF)" />
      <path d="M6 16H32M13 5V11M25 5V11" />
      <path d="M13 22H18M13 27H16" />
      <circle cx="28" cy="28" r="9" fill="var(--icon-paper, #FFFFFF)" />
      <path d="M28 23V28L31 30" />
    </>}
    {name === 'agenda' && <>
      <rect x="5" y="6" width="29" height="29" rx="6" fill="var(--icon-fill, #D7E8FF)" />
      <path d="M5 15H34M13 4V9M26 4V9M14 15V35" />
      <path d="M19 21H28M19 28H24" />
      <rect x="8" y="19" width="3" height="5" rx="1" fill="currentColor" stroke="none" />
      <circle cx="31" cy="31" r="7" fill="var(--icon-paper, #FFFFFF)" />
      <path d="M31 28V34M28 31H34" />
    </>}
    {name === 'patient' && <>
      <path d="M5 13C5 10 7 8 10 8H17L20 12H30C33 12 35 14 35 17V30C35 33 33 35 30 35H10C7 35 5 33 5 30V13Z" fill="var(--icon-fill, #E9DFFF)" />
      <path d="M13 23C12 17 16 16 20 18C24 16 28 17 27 23C26 28 25 31 23 30L20 26L17 30C15 31 14 28 13 23Z" fill="var(--icon-paper, #FFFFFF)" />
      <path d="M11 4H25M29 4H31" />
    </>}
    {name === 'finance' && <>
      <path d="M7 12L27 6C30 5 32 7 32 10V14" />
      <rect x="5" y="12" width="30" height="23" rx="6" fill="var(--icon-fill, #F8E4C0)" />
      <path d="M5 18H35" />
      <path d="M35 23H27C25 23 24 25 24 27C24 29 25 31 27 31H35" fill="var(--icon-paper, #FFFFFF)" />
      <circle cx="28" cy="27" r="1" fill="currentColor" stroke="none" />
      <path d="M11 25H17M11 29H14" />
    </>}
    {name === 'clinic' && <>
      <path d="M8 35V16L20 8L32 16V35" fill="var(--icon-fill, #D7E8FF)" />
      <path d="M4 35H36" />
      <path d="M17 35V27C17 26 18 25 19 25H21C22 25 23 26 23 27V35" fill="var(--icon-paper, #FFFFFF)" />
      <path d="M13 20H15M25 20H27" />
      <circle cx="29" cy="10" r="7" fill="var(--icon-paper, #FFFFFF)" />
      <path d="M29 7V13M26 10H32" />
    </>}
    {name === 'plan' && <>
      <path d="M20 5L33 10V19C33 27 27 33 20 36C13 33 7 27 7 19V10L20 5Z" fill="var(--icon-fill, #D7E8FF)" />
      <circle cx="20" cy="20" r="8" fill="var(--icon-paper, #FFFFFF)" />
      <path d="M16.5 20L19 22.5L24 17.5" />
    </>}
  </svg>
}
