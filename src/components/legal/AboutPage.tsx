import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { SEO, PAGE_SEO } from "../seo/SEO";
import { TrialLink } from "../ui/TrialLink";
import { LandingHeader, LandingFooter } from "../landing/LandingChrome";
import { LandingContact } from "../landing/sections/LandingConversion";
import { ProductIcon, type ProductIconName } from "../landing/ui/ProductIcon";
import "../landing/landing.css";
import "../landing/product-motion.css";

/**
 * "Sobre nosotros" con el mismo sistema visual que la landing (clases lp-*).
 * Copy honesto: la historia se apoya en ODAF, sin cifras de clientes ni
 * promesas de tiempos de soporte que no se puedan sostener.
 */

const principios: { icono: ProductIconName; titulo: string; texto: string }[] = [
  {
    icono: "patient",
    titulo: "Hecho con odontólogos",
    texto:
      "Lo diseñamos junto a un equipo que atiende pacientes todos los días, no desde una oficina.",
  },
  {
    icono: "agenda",
    titulo: "Simple para todo el equipo",
    texto:
      "Odontólogos, recepción y administración trabajan con la misma información, y cada uno ve lo que le toca según su rol.",
  },
  {
    icono: "booking",
    titulo: "Tus datos son tuyos",
    texto:
      "Pacientes, turnos e historias clínicas quedan guardados. Si un día cancelás, no perdés nada.",
  },
  {
    icono: "finance",
    titulo: "Un precio claro",
    texto:
      "Un solo plan por clínica, con usuarios y profesionales ilimitados. 7 días gratis y cancelás desde la app.",
  },
];

const resuelve = [
  "Agenda por profesional y reservas online",
  "Historias clínicas, odontograma y archivos",
  "Obras sociales y liquidaciones",
  "Caja y cuenta corriente por paciente",
  "Recordatorios por email en un clic",
  "Equipo, roles y hasta 3 sucursales",
];

export const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="dentiqly-landing">
      <SEO {...PAGE_SEO.about} />
      <a className="lp-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <LandingHeader enHome={false} />

      <main id="contenido">
        {/* ── Hero ── */}
        <section className="lp-hero lp-about-hero">
          <div className="lp-hero-art" aria-hidden="true">
            <svg className="lp-hero-orbit" viewBox="0 0 440 580" fill="none">
              <rect x="83" y="35" width="310" height="460" rx="155" stroke="currentColor" />
              <rect x="40" y="-8" width="396" height="546" rx="198" stroke="currentColor" />
              <path d="M238 112V201C238 236 209 265 174 265H83" stroke="currentColor" strokeDasharray="5 7" />
              <circle cx="238" cy="112" r="7" fill="#f8fbff" stroke="currentColor" strokeWidth="2" />
              <circle cx="83" cy="265" r="7" fill="#d0e1fc" stroke="currentColor" strokeWidth="2" />
            </svg>
            <svg className="lp-hero-route" viewBox="0 0 380 260" fill="none">
              <path d="M-30 215H100C144 215 180 179 180 135V125C180 81 216 45 260 45H400" stroke="currentColor" />
              <path d="M-30 242H100C159 242 207 194 207 135V125C207 96 231 72 260 72H400" stroke="currentColor" strokeDasharray="3 8" />
              <circle cx="180" cy="135" r="7" fill="#eaf2ff" stroke="currentColor" strokeWidth="2" />
              <circle cx="300" cy="45" r="5" fill="currentColor" />
            </svg>
          </div>
          <div className="lp-hero-intro">
            <p className="lp-hero-category">Nuestra historia</p>
            <h1>
              Nació en un consultorio.
              <br />
              <span>Hoy está listo para el tuyo.</span>
            </h1>
            <p className="lp-hero-description">
              Dentiqly empezó como el sistema interno del centro odontológico
              ODAF. Lo construimos al lado de su equipo, resolviendo lo de todos
              los días: la agenda, las historias clínicas, las obras sociales y
              la caja.
            </p>
            <div className="lp-hero-actions">
              <TrialLink ctaLocation="about" ctaLabel="Empezar gratis" className="lp-button">
                Empezar gratis <ArrowRight size={18} />
              </TrialLink>
              <Link to="/#demo" className="lp-button lp-button-outline">
                Ver el software <ArrowRight size={18} />
              </Link>
            </div>
            <p className="lp-hero-reassurance">
              <span>
                <Check size={15} />
                7 días gratis
              </span>
              <span>
                <Check size={15} />
                Sin tarjeta de crédito
              </span>
            </p>
          </div>
        </section>

        {/* ── Cómo empezó ── */}
        <section className="lp-section lp-about-story">
          <div className="lp-container lp-about-story-grid">
            <div>
              <p className="lp-eyebrow">Cómo empezó</p>
              <h2>
                Primero lo usó
                <br />
                un consultorio de verdad.
              </h2>
            </div>
            <div className="lp-about-story-copy">
              <p>
                La idea era simple: que la agenda, las fichas de los pacientes
                y los cobros estuvieran en un mismo lugar, y que odontólogos y
                recepción trabajaran con la misma información.
              </p>
              <p>
                Cada función se probó primero en la atención real de ODAF. Lo
                que no servía en el día a día, se cambiaba.
              </p>
              <p>
                Hoy abrimos Dentiqly a otros consultorios con la misma idea:
                menos tiempo en la gestión y más tiempo con tus pacientes.
              </p>
              <div className="lp-about-odaf">
                <img src="/assets/odaf-logo.png" alt="Centro odontológico ODAF" width="80" height="35" />
                <span>
                  <strong>Centro odontológico ODAF</strong>
                  Donde nació Dentiqly y lo usan todos los días.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── En qué creemos ── */}
        <section className="lp-section lp-about-values">
          <div className="lp-container">
            <p className="lp-eyebrow">En qué creemos</p>
            <h2>
              Software para atender mejor,
              <br />
              no para sumar trabajo.
            </h2>
            <ul className="lp-about-values-grid">
              {principios.map((p, i) => (
                <li key={p.titulo}>
                  <div className="lp-about-value-top">
                    <span className={`lp-product-icon lp-product-icon-${p.icono}`}>
                      <ProductIcon name={p.icono} size={34} />
                    </span>
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Qué resuelve hoy ── */}
        <section className="lp-section lp-about-today">
          <div className="lp-container lp-about-today-grid">
            <div>
              <p className="lp-eyebrow">Qué resuelve hoy</p>
              <h2>Todo tu consultorio, en un solo lugar.</h2>
              <Link to="/#funcionalidades" className="lp-text-link">
                Conocé las funcionalidades <ArrowRight size={16} />
              </Link>
            </div>
            <ul className="lp-check-list">
              {resuelve.map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <LandingContact />

        <section className="lp-final">
          <div className="lp-container">
            <p className="lp-eyebrow">Un consultorio más organizado empieza acá</p>
            <div className="lp-final-row">
              <h2>
                Probalo en tu clínica
                <br />
                durante 7 días.
              </h2>
              <TrialLink ctaLocation="about" ctaLabel="Crear mi cuenta gratis" className="lp-final-link">
                <ArrowRight size={19} />
                <span>Crear mi cuenta gratis</span>
              </TrialLink>
            </div>
            <div className="lp-final-bottom">
              <span>7 días para conocer una nueva forma de trabajar.</span>
              <span>Sin tarjeta. Sin instalaciones.</span>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter enHome={false} />
    </div>
  );
};
