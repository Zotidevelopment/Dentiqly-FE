import React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { trackStartTrialClick, CtaLocation } from '../../lib/analytics'

interface TrialLinkProps extends Omit<LinkProps, 'to'> {
  /** Sección de la que sale el clic. Es lo que permite saber qué parte de la landing convierte. */
  ctaLocation: CtaLocation
  /** Texto del botón, para comparar copy entre variantes. */
  ctaLabel?: string
  /** Por defecto /register; se puede sobreescribir para campañas con querystring. */
  to?: LinkProps['to']
}

/**
 * Link a la prueba gratuita que emite `start_trial_click` antes de navegar.
 *
 * Existe para que ningún CTA nuevo nazca sin tracking: en vez de repetir un
 * onClick en cada sección, se usa este componente y el evento viaja solo.
 */
export const TrialLink: React.FC<TrialLinkProps> = ({
  ctaLocation,
  ctaLabel,
  to = '/register',
  onClick,
  children,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackStartTrialClick(ctaLocation, ctaLabel)
    onClick?.(e)
  }

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
