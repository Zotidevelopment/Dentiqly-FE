import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { BrandLogo } from "../brand/BrandLogo";
import { TrialLink } from "../ui/TrialLink";

/**
 * Encabezado y pie de la landing, compartidos con las páginas públicas
 * ("Sobre nosotros"). En la home los enlaces son anclas (#precios); en las
 * otras páginas apuntan a la home (/#precios) y LandingPage hace el scroll.
 */

const secciones = [
  ["El software", "funcionalidades"],
  ["Ver demo", "demo"],
  ["Precios", "precios"],
  ["Preguntas frecuentes", "faq"],
] as const;

const SeccionLink: React.FC<{
  id: string;
  enHome: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ id, enHome, className, onClick, children }) =>
  enHome ? (
    <a href={`#${id}`} className={className} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link to={`/#${id}`} className={className} onClick={onClick}>
      {children}
    </Link>
  );

export function LandingHeader({ enHome = true }: { enHome?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  return (
    <header className="lp-header">
      <nav className="lp-container lp-nav" aria-label="Navegación principal">
        <Link to="/" aria-label="Dentiqly, inicio" className="lp-logo">
          <BrandLogo alt="Dentiqly" />
        </Link>
        <div className="lp-nav-links">
          {secciones.map(([label, id]) => (
            <SeccionLink key={id} id={id} enHome={enHome}>
              {label}
            </SeccionLink>
          ))}
        </div>
        <div className="lp-nav-actions">
          <Link to="/login" className="lp-login">
            Ingresar
          </Link>
          <TrialLink
            ctaLocation="navbar"
            ctaLabel="Empezar gratis"
            className="lp-button lp-button-small"
          >
            Empezar gratis <ArrowUpRight size={16} />
          </TrialLink>
        </div>
        <button
          className="lp-menu-toggle"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="lp-mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <nav
          id="lp-mobile-menu"
          className="lp-mobile-menu"
          aria-label="Navegación móvil"
        >
          {secciones.map(([label, id]) => (
            <SeccionLink key={id} id={id} enHome={enHome} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={18} />
            </SeccionLink>
          ))}
          <Link to="/login" onClick={() => setOpen(false)}>
            Ingresar a mi cuenta
            <ArrowRight size={18} />
          </Link>
          <TrialLink
            ctaLocation="navbar"
            className="lp-button"
            onClick={() => setOpen(false)}
          >
            Empezar gratis <ArrowRight size={18} />
          </TrialLink>
        </nav>
      )}
    </header>
  );
}

export function LandingFooter({ enHome = true }: { enHome?: boolean }) {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-top">
          <div>
            <Link to="/" className="lp-logo">
              <BrandLogo alt="Dentiqly" loading="lazy" />
            </Link>
            <p>
              El orden que tu consultorio necesita.
              <br />
              El tiempo que tus pacientes merecen.
            </p>
          </div>
          <nav aria-label="Producto">
            <span>PRODUCTO</span>
            <SeccionLink id="funcionalidades" enHome={enHome}>El software</SeccionLink>
            <SeccionLink id="demo" enHome={enHome}>Demo interactiva</SeccionLink>
            <SeccionLink id="precios" enHome={enHome}>Precios</SeccionLink>
          </nav>
          <nav aria-label="Dentiqly">
            <span>HABLEMOS</span>
            <Link to="/sobre-nosotros">Nuestra historia</Link>
            <SeccionLink id="contacto" enHome={enHome}>Contactar al equipo</SeccionLink>
            <a href="mailto:hola@dentiqly.com">
              hola@dentiqly.com <ArrowUpRight size={13} />
            </a>
          </nav>
          <div className="lp-footer-account">
            <span>¿YA USÁS DENTIQLY?</span>
            <Link to="/login" className="lp-text-link">
              Ingresar a mi cuenta <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} Dentiqly</span>
          <span>Hecho para la odontología.</span>
          <div>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/terminos">Términos</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
