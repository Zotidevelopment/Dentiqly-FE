/**
 * Capa de tracking sobre el dataLayer de Google Tag Manager (GTM-MC27DVMG).
 *
 * El contenedor de GTM se carga desde index.html. Este módulo es el único
 * lugar donde se empujan eventos: nunca llamar a window.dataLayer.push()
 * directamente desde un componente.
 *
 * GA4 (G-7FTCE52704) iba a configurarse DENTRO de GTM, pero el contenedor
 * quedó vacío y ningún evento llegaba a destino. Hasta que eso se resuelva,
 * tracking.ts carga GA4 y el Pixel de Meta desde el código y push() les
 * reenvía cada evento. Los componentes siguen llamando solo a este módulo.
 *
 * OJO: los eventos de dinero (purchase, subscription_renewed) NO se disparan
 * desde acá. El pago se confirma por webhook en el backend
 * (billingController.handleWebhookMP), sin browser de por medio. Ver el
 * comentario en trackCheckoutStarted().
 */

import { forwardEvent, setPixelConsent } from './tracking'

type DataLayerEvent = Record<string, unknown> & { event: string }

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[]
    /** Definida en index.html junto con los valores por defecto de Consent Mode. */
    gtag?: (...args: unknown[]) => void
  }
}

/** Origen del CTA, para saber qué sección de la landing convierte mejor. */
export type CtaLocation =
  | 'navbar'
  | 'hero'
  | 'product_showcase'
  | 'performance'
  | 'pricing'
  | 'cta_section'
  | 'footer'
  | 'about'
  | 'login_page'

const isBrowser = typeof window !== 'undefined'

function push(event: DataLayerEvent): void {
  if (!isBrowser) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
  // El contenedor de GTM está vacío, así que además del dataLayer el evento se
  // manda directo a GA4 y al Pixel. Ver el comentario de cabecera de tracking.ts.
  forwardEvent(event)
}

/**
 * Pageview manual para la SPA.
 *
 * El snippet de GTM solo dispara en la carga inicial, así que cada
 * navegación de react-router tiene que empujarse a mano.
 *
 * En GTM: la etiqueta Google Tag debe tener DESACTIVADO el envío automático
 * de page_view, y una etiqueta GA4 Event escucha este evento. Si se dejan
 * las dos, la primera vista de cada sesión se cuenta dos veces.
 */
export function trackPageView(path: string, title?: string): void {
  push({
    event: 'page_view',
    page_path: path,
    page_location: isBrowser ? window.location.href : path,
    page_title: title ?? (isBrowser ? document.title : ''),
  })
}

/**
 * Identifica al usuario logueado para unir sesiones entre dispositivos y
 * segmentar por clínica. Llamar tras el login y al restaurar la sesión.
 */
export function identifyUser(params: {
  userId: string | number
  clinicaId?: string | number
  clinicaSlug?: string
  role?: string
  plan?: string
}): void {
  push({
    event: 'user_identified',
    user_id: String(params.userId),
    clinica_id: params.clinicaId != null ? String(params.clinicaId) : undefined,
    clinica_slug: params.clinicaSlug,
    user_role: params.role,
    user_plan: params.plan,
  })
}

/** Limpia la identidad al cerrar sesión para no atribuir tráfico al usuario anterior. */
export function resetUser(): void {
  push({ event: 'user_reset', user_id: undefined, clinica_id: undefined })
}

// ---------------------------------------------------------------------------
// Microconversiones — optimizan campañas mientras no hay volumen de pagos
// ---------------------------------------------------------------------------

/** Clic en cualquier CTA que lleva a /register. */
export function trackStartTrialClick(location: CtaLocation, label?: string): void {
  push({ event: 'start_trial_click', cta_location: location, cta_label: label })
}

/** El usuario llegó al formulario de registro y empezó a completarlo. */
export function trackSignupStarted(): void {
  push({ event: 'signup_started' })
}

/**
 * Registro completado con éxito.
 * Se usa el nombre `sign_up` (evento recomendado de GA4) en lugar de
 * `signup_completed` porque GA4 lo reconoce y lo reporta sin configuración.
 */
export function trackSignupCompleted(method: string = 'email'): void {
  push({ event: 'sign_up', method })
}

/**
 * Login exitoso. `is_first_login` separa la activación del uso recurrente.
 * Se usa `login` (recomendado de GA4) en vez de `first_login`.
 */
export function trackLogin(method: string = 'email', isFirstLogin = false): void {
  push({ event: 'login', method, is_first_login: isFirstLogin })
}

/** El usuario entró al flujo de onboarding de la clínica. */
export function trackOnboardingStarted(): void {
  push({ event: 'onboarding_started' })
}

export function trackOnboardingCompleted(): void {
  push({ event: 'onboarding_completed' })
}

// ---------------------------------------------------------------------------
// Eventos de producto — candidatos a Activation Event
//
// Se emiten en TODAS las ocurrencias, no solo la primera. GA4 puede derivar
// "la primera vez" con el parámetro is_first, pero no puede reconstruir el
// volumen total si solo se envía la primera. Medir el uso repetido es lo que
// distingue una clínica que adoptó el producto de una que lo probó y se fue.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Consentimiento (Consent Mode v2)
//
// Los valores por defecto se fijan en index.html, antes de que cargue GTM:
// denegado en el EEE/UK/Suiza, concedido en el resto. Acá sólo se registra el
// cambio cuando la persona decide desde el banner.
// ---------------------------------------------------------------------------

const CONSENT_KEY = 'dentiqly_cookie_consent'

export type ConsentValue = 'granted' | 'denied'

/** Decisión guardada, o null si todavía no eligió. */
export function getStoredConsent(): ConsentValue | null {
  if (!isBrowser) return null
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

/**
 * Aplica y guarda la decisión. Se empuja como `consent`/`update` al dataLayer,
 * que es la señal que Google Consent Mode espera; no es un evento común.
 */
export function setConsent(value: ConsentValue): void {
  if (!isBrowser) return

  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // Modo privado o almacenamiento bloqueado: se aplica igual para esta sesión.
  }

  // Se usa el gtag() que define index.html: Consent Mode espera el formato
  // posicional que esa función genera, no un objeto de evento común.
  window.gtag?.('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  })

  // El Pixel de Meta tiene su propio consentimiento, aparte del de Google.
  setPixelConsent(value)

  push({ event: 'cookie_consent_decision', consent_state: value })
}

/**
 * Lee el client_id de GA4 desde la cookie `_ga`.
 *
 * Formato de la cookie: GA1.1.<client_id_parte1>.<client_id_parte2>
 * El client_id son las dos últimas partes unidas por punto.
 *
 * Hace falta mandarlo al backend antes de ir al checkout: el `purchase` se
 * envía después desde el webhook, y sin este valor GA4 lo toma como un
 * usuario nuevo y no se lo atribuye a la campaña que trajo a la clínica.
 *
 * Devuelve null si GTM todavía no escribió la cookie o si el usuario rechazó
 * las cookies de analytics.
 */
export function getGaClientId(): string | null {
  if (!isBrowser) return null
  const match = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/)
  return match ? match[1] : null
}

/**
 * Marca un hito como alcanzado y devuelve si era la primera vez.
 *
 * Limitación conocida: el marcador vive en localStorage, así que es por
 * navegador y no por clínica. Si la dueña carga el primer paciente desde la
 * compu del consultorio y después desde el celular, el segundo también viaja
 * con is_first=true. Para elegir el Activation Event alcanza; la versión
 * definitiva tiene que venir del backend, que es el único que conoce el
 * estado real de la clínica.
 */
export function isFirstTime(milestone: string): boolean {
  if (!isBrowser) return false
  const key = `dentiqly_milestone_${milestone}`
  if (localStorage.getItem(key)) return false
  localStorage.setItem(key, '1')
  return true
}

/** Paciente cargado. Señal temprana, fácil de alcanzar sin intención real. */
export function trackPatientCreated(isFirst = false): void {
  push({ event: 'patient_created', is_first: isFirst })
}

/** Turno agendado: la clínica está usando el producto en su operación diaria. */
export function trackAppointmentCreated(isFirst = false): void {
  push({ event: 'appointment_created', is_first: isFirst })
}

/**
 * Recordatorio de WhatsApp enviado a un paciente.
 *
 * Se llama `_sent` y no `_enabled` porque el producto no tiene un interruptor
 * de "activar recordatorios": se envían uno a uno o en masa. Es igual de útil
 * como señal —y más fuerte—: implica exponer el producto a pacientes reales.
 */
export function trackWhatsappReminderSent(isFirst = false, bulk = false): void {
  push({ event: 'whatsapp_reminder_sent', is_first: isFirst, is_bulk: bulk })
}

/** Se invitó a un profesional a la clínica: adopción más allá del dueño. */
export function trackProfessionalInvited(): void {
  push({ event: 'professional_invited' })
}

/** Uso del playground / demo (/demo), normalmente antes de registrarse. */
export function trackPlaygroundUsed(isFirst = false): void {
  push({ event: 'playground_used', is_first: isFirst })
}

// ---------------------------------------------------------------------------
// Conversión de pago
// ---------------------------------------------------------------------------

/**
 * El usuario abrió el checkout del plan pago (createPreference).
 * Evento recomendado de GA4.
 *
 * Este es el ÚLTIMO evento de pago que se puede medir desde el frontend con
 * confianza. La confirmación (`purchase`) y la renovación
 * (`subscription_renewed`) ocurren en el webhook de MercadoPago/LemonSqueezy
 * y en subscriptionCron.js, sin browser: hay que enviarlas desde el backend
 * con Measurement Protocol de GA4.
 */
export function trackCheckoutStarted(params: {
  plan: string
  value: number
  currency: string
  billingCycle?: 'monthly' | 'annual'
}): void {
  push({
    event: 'begin_checkout',
    plan: params.plan,
    value: params.value,
    currency: params.currency,
    billing_cycle: params.billingCycle,
  })
}
