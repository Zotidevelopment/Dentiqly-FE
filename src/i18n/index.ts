import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import esLanding from './locales/es/landing.json'
import enLanding from './locales/en/landing.json'
import esCommon from './locales/es/common.json'
import enCommon from './locales/en/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    debug: false,
    interpolation: { escapeValue: false },
    resources: {
      es: { landing: esLanding, common: esCommon },
      en: { landing: enLanding, common: enCommon },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'dentiqly_lang',
    },
  })

export default i18n
