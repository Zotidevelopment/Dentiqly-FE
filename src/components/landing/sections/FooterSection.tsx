import { BrandLogo } from '../../brand/BrandLogo'
import React, { useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Mail } from "lucide-react"
import { TrialLink } from "../../ui/TrialLink"

const PRODUCT_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Demo interactiva", href: "#demo" },
  { label: "Por qué Dentiqly", href: "#por-que-dentiqly" },
  { label: "Precios", href: "#precios" },
  { label: "Seguridad", href: "#seguridad" },
  { label: "Preguntas frecuentes", href: "#faq" },
]

const FEATURE_LINKS = [
  { label: "Agenda y turnos online", href: "#funcionalidades" },
  { label: "Reservas online 24/7", href: "#funcionalidades" },
  { label: "Recordatorios por email", href: "#funcionalidades" },
  { label: "Odontograma digital", href: "#funcionalidades" },
  { label: "Historia clínica digital", href: "#funcionalidades" },
  { label: "Caja y liquidaciones", href: "#funcionalidades" },
  { label: "Multi-sucursal", href: "#funcionalidades" },
]

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

  const linkClass = "text-[14px] text-white/55 transition-colors hover:text-white"
  const headingClass = "mb-5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white/40"

  return (
    <footer className="bg-[#070B1A] pb-10 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Marca */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <BrandLogo tone="inverse"
              alt="Dentiqly, software de gestión para clínicas odontológicas"
              className="h-7 w-auto"
            />
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/55">
              El software todo en uno para clínicas odontológicas: agenda y reservas online, historia clínica,
              odontograma, recordatorios por email y caja. Hecho en Argentina.
            </p>
            <a href="mailto:hola@dentiqly.com" className="mt-5 inline-flex items-center gap-2 text-[14px] text-white/70 transition-colors hover:text-white">
              <Mail size={15} className="text-brand-blue-light" />
              hola@dentiqly.com
            </a>
          </div>

          <nav aria-label="Producto">
            <h3 className={headingClass}>Producto</h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} onClick={(e) => handleAnchorClick(e, l.href)} className={linkClass}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Funcionalidades">
            <h3 className={headingClass}>Funcionalidades</h3>
            <ul className="space-y-3">
              {FEATURE_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} onClick={(e) => handleAnchorClick(e, l.href)} className={linkClass}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Compañía">
            <h3 className={headingClass}>Compañía</h3>
            <ul className="space-y-3">
              <li><Link to="/sobre-nosotros" className={linkClass}>Sobre nosotros</Link></li>
              <li>
                <TrialLink ctaLocation="footer" ctaLabel="Empezar gratis" className={linkClass}>
                  Empezar gratis
                </TrialLink>
              </li>
              <li><Link to="/login" className={linkClass}>Iniciar sesión</Link></li>
              <li><a href="mailto:hola@dentiqly.com" className={linkClass}>Contacto</a></li>
            </ul>
            <h3 className={`${headingClass} mt-8`}>Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacidad" className={linkClass}>Política de privacidad</Link></li>
              <li><Link to="/terminos" className={linkClass}>Términos de servicio</Link></li>
              <li><Link to="/cookies" className={linkClass}>Política de cookies</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/[0.08] pt-7 text-[12.5px] text-white/40 md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} Dentiqly. Todos los derechos reservados.</p>
          <p>Software de gestión dental para clínicas de Argentina y Latinoamérica.</p>
        </div>
      </div>
    </footer>
  )
}
