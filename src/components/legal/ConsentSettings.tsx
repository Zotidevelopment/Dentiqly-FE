import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { getStoredConsent, setConsent, type ConsentValue } from '../../lib/analytics'

/**
 * Control para revisar o cambiar la decisión sobre cookies de analítica.
 *
 * No es un extra: bajo GDPR retirar el consentimiento tiene que ser tan fácil
 * como haberlo dado, y el banner sólo aparece una vez.
 */
export const ConsentSettings: React.FC = () => {
  const [consent, setConsentState] = useState<ConsentValue | null>(getStoredConsent)
  const [guardado, setGuardado] = useState(false)

  const elegir = (valor: ConsentValue) => {
    setConsent(valor)
    setConsentState(valor)
    setGuardado(true)
    window.setTimeout(() => setGuardado(false), 2500)
  }

  const estado =
    consent === 'granted' ? 'Aceptadas'
    : consent === 'denied' ? 'Rechazadas'
    : 'Sin elegir (se aplican los valores por defecto de tu región)'

  return (
    <div className="not-prose my-6 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
      <p className="text-sm font-bold text-gray-900 m-0">Tu elección actual</p>
      <p className="text-sm text-gray-600 mt-1 mb-4">
        Cookies de analítica: <strong className="text-gray-900">{estado}</strong>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => elegir('granted')}
          aria-pressed={consent === 'granted'}
          className={`px-4 py-2 text-[13px] font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563FF]/40 ${
            consent === 'granted'
              ? 'bg-[#2563FF] text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => elegir('denied')}
          aria-pressed={consent === 'denied'}
          className={`px-4 py-2 text-[13px] font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563FF]/40 ${
            consent === 'denied'
              ? 'bg-[#2563FF] text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          Rechazar
        </button>

        <span
          role="status"
          className={`inline-flex items-center gap-1.5 text-[13px] font-medium text-green-700 transition-opacity ${
            guardado ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Check size={14} />
          Preferencia guardada
        </span>
      </div>
    </div>
  )
}
