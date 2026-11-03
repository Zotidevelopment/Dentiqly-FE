import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TrialLink } from "../../ui/TrialLink";
import { ProductScreenshot } from "./ProductScreenshot";
import { ProductMotion } from "./ProductMotion";
import { ProductIcon } from "../ui/ProductIcon";

const products = [
  {
    name: "Reservas",
    view: "booking",
    screen: "agenda",
    title: "Tu próximo paciente puede reservar ahora.",
    text: "Compartí tu enlace de reservas. Tus pacientes eligen entre los horarios disponibles y envían su solicitud, incluso cuando el consultorio está cerrado.",
    detail: "Elegir día. Elegir horario. Enviar la reserva.",
    steps: ["Día", "Horario", "Reserva enviada"],
  },
  {
    name: "Agenda",
    view: "agenda",
    screen: "agenda",
    title: "Una agenda clara. Un equipo conectado.",
    text: "Organizá los turnos de tus profesionales y permití que tus pacientes reserven en línea. Tu equipo y vos pueden consultar la misma agenda, estén donde estén.",
    detail: "Turnos, reservas en línea y recordatorios por correo.",
    steps: ["Paciente", "Profesional y horario", "Turno guardado"],
  },
  {
    name: "Pacientes",
    view: "patient",
    screen: "patient",
    title: "Cada paciente, con toda su historia.",
    text: "Consultá la historia clínica, el odontograma y los tratamientos desde la ficha del paciente. Tené el contexto de cada consulta a mano, sin buscar en carpetas y archivos sueltos.",
    detail: "Historias clínicas, odontogramas y archivos.",
    steps: ["Ficha clínica", "Odontograma", "Registro guardado"],
  },
  {
    name: "Finanzas",
    view: "finance",
    screen: "finance",
    title: "Los números de tu clínica, más claros.",
    text: "Registrá tus cobros, consultá los saldos pendientes y liquidá a tus profesionales. Cerrá el día sabiendo cómo está tu consultorio.",
    detail: "Caja, cuentas corrientes y liquidaciones.",
    steps: ["Paciente e importe", "Forma de pago", "Ingreso registrado"],
  },
] as const;

export function ProductHero() {
  const [active, setActive] = useState(0);
  const product = products[active];

  return (
    <section className="lp-hero">
      <div className="lp-hero-art" aria-hidden="true">
        <svg className="lp-hero-sheet" viewBox="0 0 280 260" fill="none">
          <rect
            x="12"
            y="18"
            width="248"
            height="222"
            rx="22"
            fill="#f8fbff"
            stroke="currentColor"
          />
          <path
            d="M12 70H260M73 70V240M135 70V240M197 70V240M12 112H260M12 154H260M12 196H260"
            stroke="currentColor"
          />
          <path
            d="M67 9V32M204 9V32"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="81" y="120" width="45" height="26" rx="6" fill="#c8dbfb" />
          <rect x="143" y="162" width="45" height="26" rx="6" fill="#d5e7e3" />
          <rect x="205" y="78" width="45" height="26" rx="6" fill="#c8dbfb" />
        </svg>
        <svg className="lp-hero-orbit" viewBox="0 0 440 580" fill="none">
          <rect
            x="83"
            y="35"
            width="310"
            height="460"
            rx="155"
            stroke="currentColor"
          />
          <rect
            x="40"
            y="-8"
            width="396"
            height="546"
            rx="198"
            stroke="currentColor"
          />
          <path
            d="M238 112V201C238 236 209 265 174 265H83"
            stroke="currentColor"
            strokeDasharray="5 7"
          />
          <circle
            cx="238"
            cy="112"
            r="7"
            fill="#f8fbff"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="83"
            cy="265"
            r="7"
            fill="#d0e1fc"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="380"
            cy="395"
            r="36"
            fill="#f8fbff"
            stroke="currentColor"
          />
          <path
            d="M368 395L377 404L393 386"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg className="lp-hero-route" viewBox="0 0 380 260" fill="none">
          <path
            d="M-30 215H100C144 215 180 179 180 135V125C180 81 216 45 260 45H400"
            stroke="currentColor"
          />
          <path
            d="M-30 242H100C159 242 207 194 207 135V125C207 96 231 72 260 72H400"
            stroke="currentColor"
            strokeDasharray="3 8"
          />
          <circle
            cx="180"
            cy="135"
            r="7"
            fill="#eaf2ff"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="300" cy="45" r="5" fill="currentColor" />
        </svg>
      </div>
      <div className="lp-hero-intro">
        <p className="lp-hero-category">
          Software para consultorios odontológicos
        </p>
        <h1>
          Entre un paciente y otro,
          <br />
          <span>que la gestión no te quite tiempo.</span>
        </h1>
        <p className="lp-hero-description">
          De la agenda al odontograma y la caja: conectá el trabajo de tu
          consultorio con Dentiqly. Tené la información a mano y cerrá el día
          con menos pendientes.
        </p>
        <div className="lp-hero-actions">
          <TrialLink
            ctaLocation="hero"
            ctaLabel="Empezar gratis"
            className="lp-button"
          >
            Empezar gratis <ArrowRight size={18} />
          </TrialLink>
          <a href="#demo" className="lp-button lp-button-outline">
            Ver el software <ArrowRight size={18} />
          </a>
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

      <div className="lp-product-navigation">
      <button type="button" className="lp-product-arrow" aria-label="Funcionalidad anterior" onClick={() => setActive((active + products.length - 1) % products.length)}><ChevronLeft size={21} /></button>
      <div
        className="lp-product-switcher"
        role="tablist"
        aria-label="Conocé Dentiqly"
      >
        {products.map((item, index) => (
          <button
            type="button"
            key={item.view}
            role="tab"
            id={`hero-tab-${item.view}`}
            aria-selected={active === index}
            aria-controls="hero-product-panel"
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              if (
                !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? products.length - 1
                    : (active + (event.key === "ArrowRight" ? 1 : products.length - 1)) % products.length;
              setActive(next);
              document
                .getElementById(`hero-tab-${products[next].view}`)
                ?.focus();
            }}
          >
            <span className={`lp-product-icon lp-product-icon-${item.view}`}><ProductIcon name={item.view} size={36} /></span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <button type="button" className="lp-product-arrow" aria-label="Siguiente funcionalidad" onClick={() => setActive((active + 1) % products.length)}><ChevronRight size={21} /></button>
      </div>

      <div
        className="lp-hero-product-card"
        id="hero-product-panel"
        role="tabpanel"
        aria-labelledby={`hero-tab-${product.view}`}
        tabIndex={0}
      >
        <div className="lp-hero-product-copy" key={product.view}>
          <span className="lp-product-name"><ProductIcon name={product.view} size={22} />{product.name}</span>
          <h2>{product.title}</h2>
          <p>{product.text}</p>
          <ol className="lp-motion-steps" aria-label="Pasos de la demostración">{product.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
          <a href="#funcionalidades" className="lp-text-link">
            Conocé las funcionalidades <ArrowRight size={17} />
          </a>
        </div>
        <div
          className={`lp-hero-product-visual lp-hero-visual-${product.view}`}
        >
          <ProductMotion key={product.view} variant={product.view} />
          <ProductScreenshot view={product.screen} compact />
        </div>
      </div>
    </section>
  );
}
