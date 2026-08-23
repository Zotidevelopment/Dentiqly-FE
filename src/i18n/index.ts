import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import esLanding from './locales/es/landing.json'
import enLanding from './locales/en/landing.json'
import esCommon from './locales/es/common.json'
import enCommon from './locales/en/common.json'

/**
 * El idioma está fijado en español, a propósito.
 *
 * Antes se usaba i18next-browser-languagedetector con order
 * ['localStorage', 'navigator']. El problema: solo cuatro componentes de la
 * landing están traducidos (HeroSection, PricingSection, FaqSection y
 * CtaSection). Todo el resto —showcase de producto, seguridad, testimonios,
 * el panel de demo— tiene el texto en español escrito directo en el JSX.
 *
 * Así que a cualquiera con el navegador en inglés le salía la página mezclada:
 * medido en producción, 20 líneas en inglés contra 67 en español, con el
 * titular principal en inglés y el resto no. Y como el detector cacheaba la
 * decisión en localStorage, quedaba pegada para esa persona en visitas
 * siguientes.
 *
 * Tampoco había forma de elegir idioma: no existe ningún selector en la app,
 * nadie llama a changeLanguage(). El inglés no era una función, era un
 * accidente de detección.
 *
 * Las traducciones en inglés se dejan cargadas para no perder el trabajo.
 * PARA REACTIVAR EL INGLÉS hacen falta dos cosas, en este orden:
 *   1. Traducir las secciones que hoy tienen el texto fijo en el JSX.
 *   2. Agregar un selector visible y volver a poner el detector, pero con
 *      order: ['localStorage'] únicamente — nunca 'navigator', que es lo que
 *      cambiaba el idioma sin que nadie lo pidiera.
 */
i18n
  .use(initReactI18next)
  .init({
    lng: 'es',
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    debug: false,
    interpolation: { escapeValue: false },
    resources: {
      es: { landing: esLanding, common: esCommon },
      en: { landing: enLanding, common: enCommon },
    },
  })

export default i18n
