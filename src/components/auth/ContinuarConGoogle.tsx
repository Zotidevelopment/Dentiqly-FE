import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Building2, Loader2, X } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

/**
 * Botón "Continuar con Google" (Google Identity Services).
 *
 * - Si el email ya tiene cuenta, inicia sesión.
 * - Si es nuevo, pide solo el nombre de la clínica y la crea en prueba gratis.
 * Si VITE_GOOGLE_CLIENT_ID no está configurado, no se muestra nada.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, opciones: Record<string, unknown>) => void
        }
      }
    }
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCRIPT_URL = "https://accounts.google.com/gsi/client"

let cargaScript: Promise<void> | null = null
const cargarGoogle = () => {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!cargaScript) {
    cargaScript = new Promise((resolve, reject) => {
      const s = document.createElement("script")
      s.src = SCRIPT_URL
      s.async = true
      s.defer = true
      s.onload = () => resolve()
      s.onerror = () => {
        cargaScript = null
        reject(new Error("No se pudo cargar Google"))
      }
      document.head.appendChild(s)
    })
  }
  return cargaScript
}

export interface SesionGoogle {
  nuevo?: boolean
  user?: { role?: string; email?: string }
  clinica?: { slug?: string } | null
  tenant?: { slug?: string } | null
}

interface Props {
  /** "signup_with" en el registro ("Registrarse con Google"), "continue_with" en el login. */
  texto?: "signup_with" | "continue_with" | "signin_with"
  onSesion: (respuesta: SesionGoogle) => void
  onError: (mensaje: string) => void
}

export const ContinuarConGoogle: React.FC<Props> = ({ texto = "continue_with", onSesion, onError }) => {
  const { loginConGoogle } = useAuth()
  const contenedor = useRef<HTMLDivElement>(null)
  const [credencial, setCredencial] = useState<string | null>(null)
  const [nombreGoogle, setNombreGoogle] = useState("")
  const [nombreClinica, setNombreClinica] = useState("")
  const [telefono, setTelefono] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [disponible, setDisponible] = useState(Boolean(CLIENT_ID))

  // Las funciones de props cambian en cada render: se leen por ref desde el callback de Google.
  const callbacks = useRef({ onSesion, onError, loginConGoogle })
  callbacks.current = { onSesion, onError, loginConGoogle }

  useEffect(() => {
    if (!CLIENT_ID) return
    let vigente = true
    cargarGoogle()
      .then(() => {
        if (!vigente || !contenedor.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          ux_mode: "popup",
          callback: async ({ credential }: { credential: string }) => {
            try {
              const r = await callbacks.current.loginConGoogle({ credential })
              if (r.needs_clinic) {
                setNombreGoogle(r.nombre || "")
                setCredencial(credential)
                return
              }
              callbacks.current.onSesion(r)
            } catch (e) {
              callbacks.current.onError(e instanceof Error ? e.message : "No pudimos entrar con Google.")
            }
          },
        })
        const ancho = Math.min(contenedor.current.offsetWidth || 360, 400)
        window.google.accounts.id.renderButton(contenedor.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: texto,
          logo_alignment: "center",
          width: ancho,
          locale: "es",
        })
      })
      .catch(() => vigente && setDisponible(false))
    return () => {
      vigente = false
    }
  }, [texto])

  const crearClinica = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!credencial || nombreClinica.trim().length < 2) return
    setEnviando(true)
    try {
      const r = await loginConGoogle({ credential: credencial, nombre_clinica: nombreClinica.trim(), telefono: telefono.trim() || undefined })
      setCredencial(null)
      onSesion(r)
    } catch (err) {
      // El token de Google dura una hora: si venció, hay que volver a tocar el botón.
      onError(err instanceof Error ? err.message : "No pudimos crear tu clínica.")
      setCredencial(null)
    } finally {
      setEnviando(false)
    }
  }

  if (!disponible) return null

  return (
    <>
      <div ref={contenedor} className="flex min-h-[44px] w-full justify-center" />
      <div className="my-5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
        <span className="h-px flex-1 bg-gray-100" />o con tu email<span className="h-px flex-1 bg-gray-100" />
      </div>

      {credencial &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2440]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="google-clinica-titulo">
            <form onSubmit={crearClinica} className="w-full max-w-[420px] rounded-[22px] bg-white p-6 shadow-[0_30px_60px_-20px_#0B244066] sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2440] text-[#8FB2FF]">
                  <Building2 size={20} />
                </span>
                <button type="button" onClick={() => setCredencial(null)} aria-label="Cancelar" className="rounded-lg p-1.5 text-[#93A3B8] hover:bg-[#F5F8FF]">
                  <X size={18} />
                </button>
              </div>
              <h2 id="google-clinica-titulo" className="mt-4 text-[21px] font-semibold tracking-[-0.02em] text-[#0B2440]">
                {nombreGoogle ? `¡Hola, ${nombreGoogle.split(" ")[0]}!` : "¡Ya casi!"} ¿Cómo se llama tu clínica?
              </h2>
              <p className="mt-1.5 text-[14px] text-[#53677E]">Es lo único que falta. Empezás con 14 días gratis, sin tarjeta.</p>

              <label htmlFor="google-clinica" className="mt-5 block text-[13px] font-semibold text-[#0B2440]">Nombre de la clínica</label>
              <input id="google-clinica" autoFocus required minLength={2} maxLength={100} value={nombreClinica}
                onChange={(e) => setNombreClinica(e.target.value)} placeholder="Ej: Consultorio Dental Belgrano"
                className="mt-1.5 w-full rounded-xl border border-[#DCE5EE] px-3.5 py-3 text-[15px] text-[#0B2440] focus:border-[#2458ED] focus:outline-none focus:ring-2 focus:ring-[#2458ED]/15" />

              <label htmlFor="google-telefono" className="mt-4 block text-[13px] font-semibold text-[#0B2440]">Teléfono <span className="font-normal text-[#93A3B8]">(opcional)</span></label>
              <input id="google-telefono" type="tel" maxLength={40} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="11 2345 6789"
                className="mt-1.5 w-full rounded-xl border border-[#DCE5EE] px-3.5 py-3 text-[15px] text-[#0B2440] focus:border-[#2458ED] focus:outline-none focus:ring-2 focus:ring-[#2458ED]/15" />

              <button type="submit" disabled={enviando || nombreClinica.trim().length < 2}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2458ED] px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-[#1744CD] disabled:opacity-50">
                {enviando && <Loader2 size={17} className="animate-spin" />}
                Crear mi clínica
              </button>
            </form>
          </div>,
          document.body,
        )}
    </>
  )
}
