import React, { useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

export const FooterSection: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === "/"

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      if (isLanding) {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      } else {
        navigate("/" + href)
      }
    },
    [isLanding, navigate]
  )

  return (
    <footer className="bg-[#0A0F2D] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <img
              src="/assets/dentiqly-logo.png"
              alt="Dentiqly - Software de gestión dental para clínicas odontológicas"
              className="h-8 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Dentiqly es el software dental todo en uno para clínicas odontológicas en Argentina.
              Gestión de turnos online, historias clínicas digitales, odontogramas interactivos
              y recordatorios automáticos por email.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <a href="mailto:hola@dentiqly.com" className="hover:text-[#2563FF] transition-colors">
                hola@dentiqly.com
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <nav aria-label="Plataforma">
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Plataforma</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#producto" onClick={(e) => handleAnchorClick(e, "#producto")} className="hover:text-white transition-colors">
                  Software dental
                </a>
              </li>
              <li>
                <a href="#funcionalidades-tabs" onClick={(e) => handleAnchorClick(e, "#funcionalidades-tabs")} className="hover:text-white transition-colors">
                  Odontograma digital
                </a>
              </li>
              <li>
                <a href="#funcionalidades-tabs" onClick={(e) => handleAnchorClick(e, "#funcionalidades-tabs")} className="hover:text-white transition-colors">
                  Gestión de turnos online
                </a>
              </li>
              <li>
                <a href="#funcionalidades-tabs" onClick={(e) => handleAnchorClick(e, "#funcionalidades-tabs")} className="hover:text-white transition-colors">
                  Recordatorios por email
                </a>
              </li>
              <li>
                <a href="#seguridad" onClick={(e) => handleAnchorClick(e, "#seguridad")} className="hover:text-white transition-colors">
                  Seguridad de datos
                </a>
              </li>
              <li>
                <a href="#precios" onClick={(e) => handleAnchorClick(e, "#precios")} className="hover:text-white transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => handleAnchorClick(e, "#faq")} className="hover:text-white transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </nav>

          {/* Features Keywords */}
          <nav aria-label="Funcionalidades">
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Funcionalidades</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#producto" onClick={(e) => handleAnchorClick(e, "#producto")} className="hover:text-white transition-colors">
                  Historia clínica dental digital
                </a>
              </li>
              <li>
                <a href="#producto" onClick={(e) => handleAnchorClick(e, "#producto")} className="hover:text-white transition-colors">
                  Agenda dental online
                </a>
              </li>
              <li>
                <a href="#producto" onClick={(e) => handleAnchorClick(e, "#producto")} className="hover:text-white transition-colors">
                  Gestión multi-sucursal
                </a>
              </li>
              <li>
                <a href="#producto" onClick={(e) => handleAnchorClick(e, "#producto")} className="hover:text-white transition-colors">
                  Portal de pacientes
                </a>
              </li>
              <li>
                <a href="#producto" onClick={(e) => handleAnchorClick(e, "#producto")} className="hover:text-white transition-colors">
                  Dashboard y métricas
                </a>
              </li>
              <li>
                <a href="#producto" onClick={(e) => handleAnchorClick(e, "#producto")} className="hover:text-white transition-colors">
                  Recordatorios automáticos
                </a>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Compañía">
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Compañía</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/sobre-nosotros" className="hover:text-white transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Registrarse gratis
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <a href="mailto:hola@dentiqly.com" className="hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>

            <h3 className="font-bold text-white mt-8 mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/privacidad" className="hover:text-white transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="hover:text-white transition-colors">
                  Términos de servicio
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </nav>

        </div>

        {/* CTA Bar */}
        <div className="border-t border-white/10 pt-10 mb-10">
          <div className="bg-gradient-to-r from-[#2563FF]/20 to-[#0047FF]/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white font-semibold text-lg mb-1">
                Probá Dentiqly gratis por 14 días
              </p>
              <p className="text-gray-400 text-sm">
                Sin tarjeta de crédito. Gestión de turnos, historias clínicas y odontogramas desde el primer día.
              </p>
            </div>
            <Link
              to="/register"
              className="shrink-0 bg-[#2563FF] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              Comenzar prueba gratuita
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Dentiqly. Software de gestión dental. Todos los derechos reservados. Argentina.
          </p>
          <p className="text-gray-600 text-xs max-w-md text-center md:text-right">
            Software para dentistas y clínicas odontológicas. Turnos online, historias clínicas digitales,
            odontograma interactivo y recordatorios automáticos por email.
          </p>
        </div>
      </div>
    </footer>
  )
}
