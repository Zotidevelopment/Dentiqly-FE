import React, { useEffect, useState } from 'react'
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

/** True en la página pública de reservas de una clínica. */
const esBookingPublico = (pathname: string): boolean => {
  const segmentos = pathname.split('/').filter(Boolean)
  if (segmentos.length === 0) return false
  if (segmentos[0] === 'reserva') return true
  return segmentos.length === 1 && !RUTAS_ESTATICAS.has(segmentos[0])
}

/**
 * Banner de consentimiento de cookies (Consent Mode v2).
 *
 * Los valores por defecto ya se fijan en index.html antes de que cargue GTM:
 * denegado en el EEE/Reino Unido/Suiza, concedido en el resto. Este banner
 * sirve para que la persona cambie esa decisión y para dejarla registrada.
 *
 * No aparece en el booking público de las clínicas: interrumpir a un paciente
 * en mitad de una reserva le cuesta turnos al cliente, y ahí la relación con
 * el paciente es de la clínica, no de Dentiqly.
 */
export const CookieConsent: React.FC = () => {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (getStoredConsent() === null) {
      // Pequeño margen para no competir con el primer render de la landing.
      const timer = window.setTimeout(() => setVisible(true), 800)
      return () => window.clearTimeout(timer)
    }
  }, [])

  if (!visible || esBookingPublico(pathname)) return null

  const decidir = (valor: 'granted' | 'denied') => {
    setConsent(valor)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 inset-x-0 z-[100] p-3 sm:p-4 animate-in slide-in-from-bottom duration-300"
    >
      <div className="mx-auto max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex gap-3 flex-1">
            <div className="shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Cookie className="h-4.5 w-4.5 text-[#2563FF]" size={18} />
            </div>
            <div>
              <p id="cookie-consent-title" className="text-sm font-bold text-gray-900">
                Usamos cookies para entender cómo se usa Dentiqly
              </p>
              <p id="cookie-consent-desc" className="text-[13px] text-gray-600 mt-0.5 leading-relaxed">
                Nos sirven para medir qué funciona y mejorar el producto. Podés rechazarlas
                y el sitio funciona igual. Más detalle en{' '}
                <Link to="/cookies" className="text-[#2563FF] font-semibold hover:underline">
                  la política de cookies
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => decidir('denied')}
              className="flex-1 sm:flex-none px-4 py-2.5 text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563FF]/40 transition-colors"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => decidir('granted')}
              className="flex-1 sm:flex-none px-5 py-2.5 text-[13px] font-semibold text-white bg-[#2563FF] rounded-full hover:bg-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563FF]/40 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
