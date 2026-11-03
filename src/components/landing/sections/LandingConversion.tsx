import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TrialLink } from "../../ui/TrialLink";
import type { BillingPlans } from "../../../hooks/useBillingPlans";

export function LandingPricing() {
  const [annual, setAnnual] = useState(false);
  const [currency, setCurrency] = useState<"ars" | "usd">("ars");
  const [plans, setPlans] = useState<BillingPlans | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    setStatus("loading");
    const base = (
      import.meta.env.VITE_API_URL || "http://localhost:3000/api"
    ).replace(/\/$/, "");
    fetch(`${base}/billing/plans`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("plans");
        return response.json();
      })
      .then((data) => {
        if (
          ![
            data?.ars?.monthly,
            data?.ars?.annual,
            data?.usd?.monthly,
            data?.usd?.annual,
          ].every((plan) => Number.isFinite(plan?.price) && plan.price >= 0)
        )
          throw new Error("plans");
        setPlans(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [attempt]);
  const plan = plans?.[currency][annual ? "annual" : "monthly"];
  const amount = plan
    ? annual
      ? (plan.pricePerMonth ?? plan.price / 12)
      : plan.price
    : null;
  const format = (price: number) =>
    new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: currency === "ars" ? 0 : 2,
    }).format(price);
  const discount = plans?.[currency].annual.discount;
  // Primer mes con descuento (cupón de LemonSqueezy): solo en el plan mensual.
  const primerMes =
    !annual && plan?.firstMonthDiscount && plan.firstMonthPrice !== undefined
      ? { precio: plan.firstMonthPrice, off: plan.firstMonthDiscount }
      : null;
  // El cobro es en dólares: en pesos se aclara que es aproximado y cuánto se cobra.
  const usdPlan = plans?.usd[annual ? "annual" : "monthly"];
  return (
    <section id="precios" className="lp-section lp-pricing">
      <div className="lp-container lp-pricing-grid">
        <div className="lp-pricing-copy">
          <p className="lp-eyebrow">
            Un plan para el trabajo de todos los días
          </p>
          <h2>
            Tu clínica completa.
            <br />
            <span className="lp-muted-heading">Un solo plan.</span>
          </h2>
          <p>
            Dejá de sumar herramientas sueltas. Agenda, pacientes y
            administración, en una misma suscripción por clínica.
          </p>
          <ul className="lp-pricing-promises">
            <li>
              <CheckCircle2 size={20} />
              <span>
                <strong>Tu equipo, incluido.</strong> Usuarios y profesionales
                ilimitados.
              </span>
            </li>
            <li>
              <CheckCircle2 size={20} />
              <span>
                <strong>Espacio para crecer.</strong> Hasta 3 sucursales en el
                plan Profesional.
              </span>
            </li>
            <li>
              <CheckCircle2 size={20} />
              <span>
                <strong>Primero, conocelo.</strong> 7 días de prueba sin
                tarjeta de crédito.
              </span>
            </li>
          </ul>
          <div className="lp-enterprise">
            <span>¿Tenés más sucursales o necesidades especiales?</span>
            <a href="mailto:ventas@dentiqly.com" className="lp-text-link">
              Hablemos de tu clínica <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <div className="lp-price-card">
          <div className="lp-price-card-header">
            <span>PROFESIONAL</span>
            <span className="lp-price-tag">Todo conectado.</span>
          </div>
          <div className="lp-price-controls">
            <div
              role="group"
              aria-label="Período de facturación"
              className="lp-price-period"
            >
              <button
                type="button"
                aria-pressed={!annual}
                onClick={() => setAnnual(false)}
              >
                Mensual
              </button>
              <button
                type="button"
                aria-pressed={annual}
                onClick={() => setAnnual(true)}
              >
                Anual {discount ? <span>−{discount}%</span> : ""}
              </button>
            </div>
            <label className="lp-currency">
              <span className="sr-only">Moneda</span>
              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as "ars" | "usd")
                }
              >
                <option value="ars">ARS</option>
                <option value="usd">USD</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </div>
          <div className="lp-price-amount" aria-live="polite">
            {status === "loading" ? (
              <div className="lp-price-loading" role="status">
                <Loader2 size={21} className="animate-spin" /> Cargando precio…
              </div>
            ) : status === "error" ? (
              <div className="lp-price-error">
                <strong>No pudimos cargar el precio.</strong>
                <button type="button" onClick={() => setAttempt(attempt + 1)}>
                  Reintentar <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="lp-price-symbol">$</span>
                  <strong>{format(amount!)}</strong>
                  <span className="lp-price-currency">
                    {currency.toUpperCase()}
                  </span>
                </div>
                <p>por mes, por clínica</p>
              </>
            )}
            {status === "ready" && primerMes && (
              <p className="lp-price-intro">
                <span>{primerMes.off}% off</span> Tu primer mes: $ {format(primerMes.precio)} {currency.toUpperCase()}
              </p>
            )}
            {status === "ready" && annual && plan && (
              <small>
                Un pago anual de $ {format(plan.price)} {currency.toUpperCase()}
                .
              </small>
            )}
            {status === "ready" && currency === "ars" && usdPlan && (
              <small>
                Precio aproximado. Se cobra en dólares (USD{" "}
                {primerMes ? `${usdPlan.firstMonthPrice} el primer mes, después ${usdPlan.price}` : usdPlan.price}
                {annual ? " por año" : ""}) con tu tarjeta.
              </small>
            )}
          </div>
          <TrialLink
            ctaLocation="pricing"
            ctaLabel="Empezar mi prueba gratis"
            className="lp-button"
          >
            Empezar mi prueba gratis <ArrowUpRight size={19} />
          </TrialLink>
          <p className="lp-price-trial">
            7 días para probarlo · Sin tarjeta de crédito
          </p>
          <ul className="lp-check-list lp-price-features">
            {[
              "Agenda y reservas online",
              "Historias clínicas y archivos",
              "Odontograma y planes de tratamiento",
              "Recordatorios por email en un clic",
              "Caja, cuentas corrientes y liquidaciones",
              "Equipo, roles y hasta 3 sucursales",
            ].map((feature) => (
              <li key={feature}>
                <Check size={16} />
                {feature}
              </li>
            ))}
          </ul>
          <a href="#funcionalidades" className="lp-price-detail">
            Conocé lo que vas a poder hacer <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

const questions = [
  [
    "¿Cómo empiezo la prueba gratuita?",
    "Creá tu cuenta, configurá tu clínica y sumá tus profesionales y servicios. Tenés 7 días para explorar las funcionalidades con tu equipo. No necesitás ingresar una tarjeta de crédito para empezar.",
  ],
  [
    "¿Necesito instalar algo?",
    "No. Dentiqly funciona desde el navegador. Podés entrar desde una computadora, tablet o celular con conexión a internet y acceder a la información de tu consultorio.",
  ],
  [
    "¿Puedo sumar a mi recepcionista y a mis profesionales?",
    "Sí. El plan Profesional incluye usuarios y profesionales ilimitados. Podés asignar roles para que cada persona acceda a las herramientas que necesita en su trabajo.",
  ],
  [
    "¿Cómo se envían los recordatorios?",
    "Desde Recordatorios elegís el día y les mandás el recordatorio por email a todos los pacientes con turno, con un solo clic. El mensaje lo escribís vos.",
  ],
  [
    "¿Puedo trasladar los pacientes que tengo en otro sistema?",
    "Escribinos y contanos qué sistema o planillas usás. Nuestro equipo puede orientarte sobre la migración y revisar qué información se puede trasladar antes de que hagas el cambio.",
  ],
  [
    "¿Puedo gestionar más de una sucursal?",
    "Sí. El plan Profesional incluye hasta 3 sucursales, con sus profesionales y agendas. Para una organización más grande, contactanos y evaluamos una propuesta a medida.",
  ],
];

export function LandingQuestions() {
  return (
    <section id="faq" className="lp-section lp-faq">
      <div className="lp-container lp-faq-grid">
        <div>
          <p className="lp-eyebrow">Antes de empezar</p>
          <h2>
            Está bien
            <br />
            tener preguntas.
          </h2>
          <p>
            Empezar con un software nuevo tiene que darte claridad desde el
            primer día.
          </p>
          <a href="#contacto" className="lp-text-link">
            Hablemos de tus dudas <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="lp-faq-list">
          {questions.map(([question, answer], i) => (
            <details
              key={question}
              name="landing-faq"
              open={i === 0 ? true : undefined}
            >
              <summary>
                {question}
                <Plus size={19} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingContact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setLoading(true);
    setError("");
    try {
      const base = (
        import.meta.env.VITE_API_URL || "http://localhost:3000/api"
      ).replace(/\/$/, "");
      const response = await fetch(`${base}/saas/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          motivo: "consulta",
          telefono: data.telefono || "",
        }),
      });
      if (!response.ok)
        throw new Error(
          "No pudimos enviar tu consulta. Intentá nuevamente o escribinos a hola@dentiqly.com.",
        );
      setSent(true);
    } catch {
      setError(
        "No pudimos enviar tu consulta. Intentá nuevamente o escribinos a hola@dentiqly.com.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <section id="contacto" className="lp-contact">
      <div className="lp-container">
        <details className="lp-contact-details">
          <summary>
            <span>
              <Mail size={21} />
              <span>
                ¿Preferís hablar con nosotros primero?
                <small>Contanos cómo trabajás y resolvemos tus dudas.</small>
              </span>
            </span>
            <span className="lp-contact-open">
              Contactar al equipo <Plus size={19} />
            </span>
          </summary>
          {sent ? (
            <div className="lp-contact-success" role="status">
              <CheckCircle2 size={28} />
              <div>
                <h3>Tu consulta ya está en nuestras manos.</h3>
                <p>El equipo de Dentiqly te va a responder por email.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="lp-contact-form">
              <div className="lp-form-grid">
                <label>
                  Nombre
                  <input
                    name="nombre"
                    required
                    autoComplete="given-name"
                    maxLength={100}
                  />
                </label>
                <label>
                  Apellido
                  <input
                    name="apellido"
                    required
                    autoComplete="family-name"
                    maxLength={100}
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                  />
                </label>
                <label>
                  Nombre de tu clínica
                  <input
                    name="clinica"
                    required
                    autoComplete="organization"
                    maxLength={160}
                  />
                </label>
                <label className="lp-form-wide">
                  ¿En qué podemos ayudarte?
                  <textarea
                    name="mensaje"
                    required
                    rows={3}
                    maxLength={3000}
                    placeholder="Contanos sobre tu consultorio o tu consulta."
                  />
                </label>
              </div>
              <div className="lp-form-footer">
                <span>
                  Usamos tus datos para responder tu consulta.{" "}
                  <Link to="/privacidad">Ver la política de privacidad.</Link>
                </span>
                <button type="submit" className="lp-button" disabled={loading}>
                  {loading ? "Enviando…" : "Enviar consulta"}
                  {loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <ArrowUpRight size={17} />
                  )}
                </button>
              </div>
              {error && (
                <p className="lp-form-error" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </details>
      </div>
    </section>
  );
}
