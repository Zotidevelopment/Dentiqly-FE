import { BrandLogo } from "../brand/BrandLogo";
import React, { Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Menu,
  MousePointer2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { SEO, PAGE_SEO } from "../seo/SEO";
import { TrialLink } from "../ui/TrialLink";
import { ProductScreenshot } from "./components/ProductScreenshot";
import {
  LandingPricing,
  LandingQuestions,
  LandingContact,
} from "./sections/LandingConversion";
import { ProductHero } from "./components/ProductHero";
import { ProductMotion } from "./components/ProductMotion";
import { ProductIcon, type ProductIconName } from "./ui/ProductIcon";
import "./landing.css";
import "./product-motion.css";

const LiveDemo = React.lazy(() =>
  import("./sections/ProductShowcase").then((m) => ({
    default: m.ProductShowcase,
  })),
);
const links = [
  ["El software", "#funcionalidades"],
  ["Ver demo", "#demo"],
  ["Precios", "#precios"],
] as const;

function LandingHeader() {
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
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <a href="#faq">Preguntas frecuentes</a>
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
          {[...links, ["Preguntas frecuentes", "#faq"]].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={18} />
            </a>
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

const workflows = [
  {
    number: "01",
    label: "Antes del turno",
    title: "Una agenda que trabaja con vos.",
    text: "Organizá los horarios de cada profesional, compartí tu enlace de reservas y enviá recordatorios por email. El equipo de recepción y vos, con la misma información a mano.",
    points: [
      "Vistas diaria, semanal y mensual",
      "Reservas online para tus pacientes",
      "Recordatorios por email en un clic",
    ],
    icon: "agenda" as ProductIconName,
  },
  {
    number: "02",
    label: "Durante la atención",
    title: "Cada paciente, con su historia completa.",
    text: "De la primera consulta al próximo tratamiento: encontrá la historia clínica, el odontograma y los archivos del paciente en su ficha. Seguí la atención con el contexto que necesitás.",
    points: [
      "Odontograma interactivo por pieza",
      "Historia clínica y planes de tratamiento",
      "Radiografías, imágenes y documentos",
    ],
    icon: "patient" as ProductIconName,
  },
  {
    number: "03",
    label: "Al cerrar el día",
    title: "Sabé qué cobraste. Y qué falta cobrar.",
    text: "Registrá ingresos y egresos, consultá los saldos de tus pacientes y liquidá a tus profesionales. Terminá el día con una visión clara de los números de tu clínica.",
    points: [
      "Caja y cuenta corriente por paciente",
      "Liquidaciones de profesionales",
      "Métricas para seguir tu consultorio",
    ],
    icon: "finance" as ProductIconName,
  },
];

function ProductWorkflow() {
  const [active, setActive] = useState(0);
  const item = workflows[active];
  return (
    <section id="funcionalidades" className="lp-section lp-workflow">
      <div className="lp-container">
        <div className="lp-section-top">
          <p className="lp-eyebrow">Todo tu consultorio, conectado</p>
          <span className="lp-side-note">
            De la primera reserva al último cobro.
          </span>
        </div>
        <h2>
          Tu consultorio, de la primera reserva
          <br />
          <span className="lp-muted-heading">al último cobro del día.</span>
        </h2>
        <div
          className="lp-workflow-tabs"
          role="tablist"
          aria-label="Explorar funcionalidades"
        >
          {workflows.map((entry, index) => (
            <button
              key={entry.number}
              id={`workflow-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-controls="workflow-panel"
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (
                  ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? 2
                        : (active + (event.key === "ArrowRight" ? 1 : 2)) % 3;
                  setActive(next);
                  document.getElementById(`workflow-tab-${next}`)?.focus();
                }
              }}
            >
              <span>{entry.number}</span>
              {entry.label}
              <ProductIcon name={entry.icon} size={26} />
            </button>
          ))}
        </div>
        <div
          className="lp-workflow-panel"
          id="workflow-panel"
          role="tabpanel"
          aria-labelledby={`workflow-tab-${active}`}
          tabIndex={0}
        >
          <div className="lp-workflow-copy" key={active}>
            <span className="lp-index">/ {item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <ul className="lp-check-list">
              {item.points.map((point) => (
                <li key={point}>
                  <Check size={16} />
                  {point}
                </li>
              ))}
            </ul>
            <TrialLink
              ctaLocation="product_showcase"
              ctaLabel={`Probar ${item.label}`}
              className="lp-text-link"
            >
              Quiero probarlo <ArrowRight size={17} />
            </TrialLink>
          </div>
          <div className="lp-workflow-visual">
            <ProductMotion key={item.icon} variant={item.icon} />
            <ProductScreenshot
              compact
              view={
                active === 0
                  ? "agenda"
                  : active === 1
                    ? "odontogram"
                    : "finance"
              }
            />
          </div>
        </div>
        <div className="lp-extra-features">
          <span>
            <Users size={18} /> Roles para todo tu equipo
          </span>
          <span>
            <CalendarDays size={18} /> Gestión de sucursales
          </span>
          <span>
            <ShieldCheck size={18} /> Acceso desde tu navegador
          </span>
        </div>
      </div>
    </section>
  );
}

function ProductDemo() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <section id="demo" className="lp-section lp-demo">
      <div className="lp-container">
        <div className="lp-demo-heading">
          <div>
            <p className="lp-eyebrow">Conocé Dentiqly por dentro</p>
            <h2>
              Así de simple es trabajar
              <br />
              con Dentiqly.
            </h2>
          </div>
          <div className="lp-demo-intro">
            <p>
              Explorá el panel con datos de ejemplo. Abrí la agenda, buscá un
              paciente y descubrí cómo se siente trabajar con Dentiqly.
            </p>
            <button
              type="button"
              className="lp-button lp-button-dark"
              onClick={() => setShowDemo(!showDemo)}
              aria-expanded={showDemo}
              aria-controls="lp-demo-content"
            >
              {showDemo ? "Cerrar demo" : "Abrir demo interactiva"}
              {showDemo ? <X size={18} /> : <MousePointer2 size={18} />}
            </button>
            <span className="lp-small-note">
              Sin registro. Sin modificar datos reales.
            </span>
          </div>
        </div>
        <div id="lp-demo-content">
          {showDemo ? (
            <div className="lp-live-demo">
              <Suspense
                fallback={
                  <p className="lp-demo-loading" role="status">
                    Preparando tu consultorio de prueba…
                  </p>
                }
              >
                <LiveDemo embedded />
              </Suspense>
            </div>
          ) : (
            <button
              className="lp-demo-screenshot"
              type="button"
              onClick={() => setShowDemo(true)}
              aria-label="Abrir la demo interactiva de Dentiqly"
            >
              <div className="lp-browser-bar">
                <span className="lp-window-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>dentiqly.com / tu consultorio</span>
                <ShieldCheck size={14} />
              </div>
              <img
                src="/assets/screenshots/product-dashboard-v3.webp"
                alt="Captura real del panel de Dentiqly con indicadores y agenda del día, usando datos de demostración"
                width="1920"
                height="1080"
                loading="lazy"
              />
              <span className="lp-screenshot-action">
                <MousePointer2 size={18} />
                Explorar el producto <ArrowUpRight size={18} />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export const LandingPage: React.FC = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);
  return (
    <div className="dentiqly-landing">
      <SEO {...PAGE_SEO.home} />
      <a className="lp-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <LandingHeader />
      <main id="contenido">
        <ProductHero />
        <section className="lp-trust-ribbon lp-container" id="por-que-dentiqly">
          <div>
            <p>Creado en un consultorio. Pensado para el tuyo.</p>
            <span>
              Dentiqly nació como el sistema interno del centro odontológico
              ODAF.
            </span>
          </div>
          <Link to="/sobre-nosotros">
            <img
              src="/assets/odaf-logo.png"
              alt="Centro odontológico ODAF"
              width="80"
              height="35"
            />
            <span>
              Conocé nuestra historia <ArrowUpRight size={16} />
            </span>
          </Link>
        </section>
        <ProductWorkflow />
        <ProductDemo />
        <section className="lp-start">
          <div className="lp-container lp-start-grid">
            <h2>De la cuenta creada al primer turno agendado.</h2>
            <ol>
              {[
                ["Creá tu cuenta", "Empezá tu prueba gratis, sin tarjeta."],
                [
                  "Configurá tu consultorio",
                  "Sumá profesionales, servicios y horarios.",
                ],
                [
                  "Agendá tu primer paciente",
                  "Y empezá a trabajar con todo conectado.",
                ],
              ].map(([title, text], i) => (
                <li key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  {i < 2 && <ChevronRight size={17} />}
                </li>
              ))}
            </ol>
          </div>
        </section>
        <LandingPricing />
        <LandingQuestions />
        <LandingContact />
        <section className="lp-final">
          <div className="lp-container">
            <p className="lp-eyebrow">
              Un consultorio más organizado empieza acá
            </p>
            <div className="lp-final-row">
              <h2>
                Dale a tu clínica
                <br />
                su próximo paso.
              </h2>
              <TrialLink
                ctaLocation="cta_section"
                ctaLabel="Crear mi cuenta gratis"
                className="lp-final-link"
              >
                <ArrowRight size={19} />
                <span>Crear mi cuenta gratis</span>
              </TrialLink>
            </div>
            <div className="lp-final-bottom">
              <span>14 días para conocer una nueva forma de trabajar.</span>
              <span>Sin tarjeta. Sin instalaciones.</span>
            </div>
          </div>
        </section>
      </main>
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
              <a href="#funcionalidades">El software</a>
              <a href="#demo">Demo interactiva</a>
              <a href="#precios">Precios</a>
            </nav>
            <nav aria-label="Dentiqly">
              <span>HABLEMOS</span>
              <Link to="/sobre-nosotros">Nuestra historia</Link>
              <a href="#contacto">Contactar al equipo</a>
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
    </div>
  );
};
