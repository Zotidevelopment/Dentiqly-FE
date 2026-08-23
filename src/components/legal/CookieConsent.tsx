import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import { getStoredConsent, setConsent } from '../../lib/analytics'

/**
 * Rutas estáticas de un solo segmento. Cualquier otra ruta de un segmento es
 * el booking público de una clínica (/:slug), donde el banner no se muestra.
 */
const RUTAS_ESTATICAS = new Set([
  'login', 'register', 'forgot-password', 'reset-password',
  'privacidad', 'terminos', 'cookies', 'sobre-nosotros',
  'reserva', 'demo', 'admin', 'paciente',
])

/**
 * Rutas donde la persona está completando un formulario nuestro.
 *
 * Mismo criterio que el booking público: interrumpir a alguien en mitad de un
 * formulario cuesta conversiones. En móvil el banner llegaba a tapar los
 * campos de email y contraseña y el botón de envío, así que acá directamente
 * no aparece. El consentimiento se le pide en la landing, antes de entrar.
 */
const RUTAS_DE_CONVERSION = new Set([
  'register', 'login', 'forgot-password', 'reset-password',
])

/** True en la página pública de reservas de una clínica. */
const esBookingPublico = (pathname: string): boolean => {
  const segmentos = pathname.split('/').filter(Boolean)
  if (segmentos.length === 0) return false
  if (segmentos[0] === 'reserva') return true
  return segmentos.length === 1 && !RUTAS_ESTATICAS.has(segmentos[0])
}

/** True en el registro, login y recuperación de contraseña. */
const esRutaDeConversion = (pathname: string): boolean => {
  const segmentos = pathname.split('/').filter(Boolean)
  return segmentos.length === 1 && RUTAS_DE_CONVERSION.has(segmentos[0])
}

/**
 * Banner de consentimiento de cookies (Consent Mode v2).
 *
 * Los valores por defecto ya se fijan en index.html antes de que cargue GTM:
 * denegado en el EEE/Reino Unido/Suiza, concedido en el resto. Este banner
 * sirve para que la persona cambie esa decisión y para dejarla registrada.
 *
 * No aparece en el booking público de las clínicas ni en el registro/login:
 * interrumpir a alguien en mitad de un formulario le cuesta conversiones a
 * quien lo está completando.
 *
 * Mientras está visible reserva su propia altura como padding-bottom del
 * body. Sin eso, al ser `fixed`, se apoyaba encima del contenido y en
 * pantallas de menos de ~700px de alto tapaba el CTA del hero por completo.
 */
export const CookieConsent: React.FC = () => {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  const oculto = esBookingPublico(pathname) || esRutaDeConversion(pathname)

  /**
   * Aparece recién cuando la persona scrolleó más de media pantalla.
   *
   * Antes salía a los 800ms, encima del hero: en un teléfono de 664px de alto
   * el banner se apoyaba justo sobre el CTA principal, así que la primera
   * pantalla que veía alguien que llegaba desde Instagram no tenía ningún
   * botón disponible. Empujar el body no alcanza, porque el hero mide una
   * pantalla y el CTA queda dentro igual.
   *
   * El temporizador es la red de seguridad para quien no scrollea: sin él, en
   * el EEE —donde el consentimiento arranca denegado— no habría forma de
   * concederlo nunca.
   */
  useEffect(() => {
    if (getStoredConsent() !== null) return

    let timer = 0

    const mostrar = () => {
      setVisible(true)
      limpiar()
    }
    const alScrollear = () => {
      if (window.scrollY > window.innerHeight * 0.5) mostrar()
    }
    function limpiar() {
      window.removeEventListener('scroll', alScrollear)
      window.clearTimeout(timer)
    }

    window.addEventListener('scroll', alScrollear, { passive: true })
    timer = window.setTimeout(mostrar, 12000)
    alScrollear() // por si la página se recuperó con scroll ya hecho

    return limpiar
  }, [])

  /**
   * Empuja el contenido hacia arriba tanto como mida el banner, y lo devuelve
   * al desmontarse. Se mide con ResizeObserver porque la altura depende del
   * ancho del texto, que cambia al rotar el teléfono.
   */
  useLayoutEffect(() => {
    if (!visible || oculto) return
    const el = bannerRef.current
    if (!el) return

    const anterior = document.body.style.paddingBottom
    const aplicar = () => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`
    }

    aplicar()
    const observer = new ResizeObserver(aplicar)
    observer.observe(el)

    return () => {
      observer.disconnect()
      document.body.style.paddingBottom = anterior
    }
  }, [visible, oculto])

  if (!visible || oculto) return null

  const decidir = (valor: 'granted' | 'denied') => {
    setConsent(valor)
    setVisible(false)
  }

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 inset-x-0 z-[100] p-2 sm:p-4 animate-in slide-in-from-bottom duration-300"
    >
      <div className="mx-auto max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
          <div className="flex gap-2.5 sm:gap-3 flex-1">
            <div className="hidden sm:flex shrink-0 w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
              <Cookie className="text-[#2563FF]" size={18} />
            </div>
            <div>
              <p id="cookie-consent-title" className="text-[13px] sm:text-sm font-bold text-gray-900">
                Usamos cookies para entender cómo se usa Dentiqly
              </p>
              {/* En móvil el detalle sobra: la decisión se toma con dos botones. */}
              <p id="cookie-consent-desc" className="hidden sm:block text-[13px] text-gray-600 mt-0.5 leading-relaxed">
                Nos sirven para medir qué funciona y mejorar el producto. Podés rechazarlas
                y el sitio funciona igual. Más detalle en{' '}
                <Link to="/cookies" className="text-[#2563FF] font-semibold hover:underline">
                  la política de cookies
                </Link>
                .
              </p>
              <p className="sm:hidden text-[12px] text-gray-500 mt-0.5 leading-snug">
                El sitio funciona igual si las rechazás.{' '}
                <Link to="/cookies" className="text-[#2563FF] font-semibold">
                  Más info
                </Link>
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => decidir('denied')}
              className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563FF]/40 transition-colors"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => decidir('granted')}
              className="flex-1 sm:flex-none px-5 py-2 sm:py-2.5 text-[13px] font-semibold text-white bg-[#2563FF] rounded-full hover:bg-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563FF]/40 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
