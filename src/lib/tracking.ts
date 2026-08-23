/**
 * Carga de GA4 y del Pixel de Meta, y puente desde los eventos de analytics.ts.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * ---------------------------
 * El plan original era configurar GA4 y el Pixel *dentro* del contenedor de
 * GTM (GTM-MC27DVMG), sin tocar el código. Pero el contenedor está vacío: no
 * tiene ninguna etiqueta cargada, así que todo lo que analytics.ts empuja al
 * dataLayer se queda ahí y no llega a ningún lado. Auditado en producción:
 * cero requests a google-analytics.com y `window.fbq` indefinido.
 *
 * Mientras eso siga así, este módulo carga los dos destinos desde el código y
 * les reenvía cada evento. Es una vía paralela a GTM, no un reemplazo: GTM
 * sigue cargando y sirviendo para cualquier otra etiqueta.
 *
 * SI ALGÚN DÍA SE CONFIGURA GA4 DENTRO DE GTM: hay que vaciar la variable de
 * entorno VITE_GA4_ID, o cada evento se va a contar dos veces.
 */

/**
 * ID de GA4 de Dentiqly. Estaba documentado en analytics.ts como "se
 * configura dentro de GTM", pero nunca se cargó ahí.
 */
const GA4_ID = (import.meta.env.VITE_GA4_ID ?? 'G-7FTCE52704') as string

/**
 * ID del Pixel de Meta. Sin esto los anuncios de Instagram no pueden optimizar
 * hacia registros ni armar públicos de retargeting: Meta solo ve el clic.
 * Se saca de Meta Events Manager (es un número de ~15 dígitos).
 */
const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID ?? '') as string

const CONSENT_KEY = 'dentiqly_cookie_consent'

const isBrowser = typeof window !== 'undefined'

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[] }
    _fbq?: unknown
  }
}

let iniciado = false

/** Lee el consentimiento sin importar analytics.ts, para no crear un ciclo. */
function consentimientoGuardado(): 'granted' | 'denied' | null {
  if (!isBrowser) return null
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

function cargarScript(src: string): void {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

function iniciarGa4(): void {
  if (!GA4_ID) return

  cargarScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`)

  // gtag() ya está definida en index.html junto con los valores por defecto de
  // Consent Mode, y empuja al mismo dataLayer que lee gtag.js.
  window.gtag?.('js', new Date())
  window.gtag?.('config', GA4_ID, {
    // La SPA emite su propio page_view en cada cambio de ruta (RouteTracker).
    // Con el automático activado, la primera vista se contaría dos veces.
    send_page_view: false,
  })
}

function iniciarMetaPixel(): void {
  if (!META_PIXEL_ID) return

  /* eslint-disable */
  // Snippet oficial de Meta, con la cola de eventos previa a la carga.
  ;(function (f: any, b: any, e: string, v: string) {
    if (f.fbq) return
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    })
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    const t = b.createElement(e) as HTMLScriptElement
    t.async = true
    t.src = v
    const s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  // Consent Mode del Pixel: si la persona ya rechazó, no se le manda nada
  // hasta que cambie de opinión.
  if (consentimientoGuardado() === 'denied') {
    window.fbq?.('consent', 'revoke')
  }

  window.fbq?.('init', META_PIXEL_ID)
}

/** Carga GA4 y el Pixel. Idempotente: llamar una sola vez, desde main.tsx. */
export function initTracking(): void {
  if (!isBrowser || iniciado) return
  iniciado = true
  iniciarGa4()
  iniciarMetaPixel()
}

/** Propaga al Pixel el cambio de consentimiento hecho desde el banner. */
export function setPixelConsent(value: 'granted' | 'denied'): void {
  if (!isBrowser) return
  window.fbq?.('consent', value === 'granted' ? 'grant' : 'revoke')
}

/**
 * Eventos del dataLayer que tienen equivalente estándar en el Pixel de Meta.
 *
 * `sign_up` → `CompleteRegistration` es el que importa: es el que hay que
 * elegir como objetivo de la campaña para que Instagram deje de optimizar por
 * clics y empiece a buscar gente que se registra.
 */
const EVENTOS_META: Record<string, { nombre: string; estandar: boolean }> = {
  page_view: { nombre: 'PageView', estandar: true },
  sign_up: { nombre: 'CompleteRegistration', estandar: true },
  begin_checkout: { nombre: 'InitiateCheckout', estandar: true },
  signup_started: { nombre: 'SignupStarted', estandar: false },
  start_trial_click: { nombre: 'StartTrialClick', estandar: false },
}

/**
 * Reenvía a GA4 y al Pixel un evento ya empujado al dataLayer.
 *
 * La llama analytics.ts desde push(), así que ningún componente necesita
 * enterarse de que existen estos destinos.
 */
export function forwardEvent(evento: Record<string, unknown> & { event: string }): void {
  if (!isBrowser) return

  const { event: nombre, ...params } = evento

  // Consent Mode y user_reset no son eventos: no se reenvían.
  if (nombre === 'cookie_consent_decision' || nombre === 'user_reset') return

  if (nombre === 'user_identified') {
    // En GA4 el user_id es una propiedad persistente, no un evento.
    window.gtag?.('set', { user_id: params.user_id })
    return
  }

  if (GA4_ID) {
    window.gtag?.('event', nombre, params)
  }

  const meta = EVENTOS_META[nombre]
  if (meta) {
    window.fbq?.(meta.estandar ? 'track' : 'trackCustom', meta.nombre, {
      value: params.value,
      currency: params.currency,
    })
  }
}
