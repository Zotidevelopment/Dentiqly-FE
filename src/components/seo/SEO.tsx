import { Helmet } from 'react-helmet-async'
import { brand } from '../../config/brand'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogType?: string
  ogImage?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown>
}

const BASE_URL = 'https://dentiqly.com'
const DEFAULT_TITLE = 'Dentiqly - Software de Gestión Dental | Turnos, Historias Clínicas y Odontogramas'
const DEFAULT_DESCRIPTION = 'Dentiqly conecta la agenda, las historias clínicas, los odontogramas y los cobros de tu consultorio. Probalo gratis durante 14 días, sin tarjeta de crédito.'
const DEFAULT_IMAGE = `${BASE_URL}${brand.assets.social}`

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | Dentiqly` : DEFAULT_TITLE
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:site_name" content="Dentiqly" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}

export const PAGE_SEO = {
  home: {
    description: DEFAULT_DESCRIPTION,
    canonical: '/',
  },
  register: {
    title: 'Registrarse Gratis - Prueba 14 Días',
    description: 'Registrate gratis en Dentiqly y probá el software dental más completo durante 14 días. Sin tarjeta de crédito. Gestión de turnos, historias clínicas y odontogramas.',
    canonical: '/register',
  },
  login: {
    title: 'Iniciar Sesión',
    description: 'Accedé a tu cuenta de Dentiqly. Software de gestión dental para clínicas odontológicas con turnos online, historias clínicas y odontogramas.',
    canonical: '/login',
    noindex: true,
  },
  about: {
    title: 'Sobre Nosotros - Quiénes Somos',
    description: 'Conocé al equipo detrás de Dentiqly, el software dental creado por y para odontólogos en Argentina. Nuestra misión es digitalizar la gestión de clínicas dentales.',
    canonical: '/sobre-nosotros',
  },
  privacy: {
    title: 'Política de Privacidad',
    description: 'Política de privacidad de Dentiqly. Conocé cómo protegemos tus datos personales y los de tus pacientes con encriptación AES-256 y protocolos de seguridad empresarial.',
    canonical: '/privacidad',
  },
  terms: {
    title: 'Términos y Condiciones',
    description: 'Términos y condiciones de uso de Dentiqly, el software de gestión dental para clínicas odontológicas en Argentina.',
    canonical: '/terminos',
  },
  cookies: {
    title: 'Política de Cookies',
    description: 'Política de cookies de Dentiqly. Información sobre el uso de cookies en nuestro software de gestión dental.',
    canonical: '/cookies',
  },
  booking: {
    title: 'Reservar Turno Online',
    description: 'Reservá tu turno odontológico online de forma rápida y sencilla. Sistema de turnos online de Dentiqly para clínicas dentales.',
    canonical: '/booking',
  },
} as const
