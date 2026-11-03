import React from "react"

/**
 * Estrella de cuatro puntas del isotipo de Dentiqly.
 * Es el motivo gráfico de la landing: aparece en eyebrows, badges y detalles.
 */
export const Spark: React.FC<{ size?: number; className?: string }> = ({ size = 14, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0c.55 7.3 4.7 11.45 12 12-7.3.55-11.45 4.7-12 12-.55-7.3-4.7-11.45-12-12 7.3-.55 11.45-4.7 12-12z" />
  </svg>
)
