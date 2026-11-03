import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowRight, Check, Send, ChevronDown } from "lucide-react"
import { TrialLink } from "../../ui/TrialLink"
import { Eyebrow } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"
import { btnOnDark } from "../ui/cta"

const inputClass =
  "w-full rounded-xl bg-brand-surface px-4 py-3 text-[14.5px] text-brand-ink placeholder:text-brand-muted/60 ring-1 ring-inset ring-brand-ink/[0.08] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
const labelClass = "mb-1.5 block text-[12.5px] font-semibold text-brand-ink"

export const CtaSection: React.FC = () => {
  const { t } = useTranslation("landing")
  const bullets = t("cta.bullets", { returnObjects: true }) as string[]

  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    clinica: "",
    telefono: "",
    motivo: "",
    mensaje: "",
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const set = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData((d) => ({ ...d, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
      const response = await fetch(`${apiBaseUrl}/saas/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Hubo un error al enviar el mensaje. Por favor, intentá de nuevo.")
      }
      setSent(true)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contacto" className="relative overflow-hidden bg-brand-navy py-24 text-white sm:py-32">
      <div className="bg-dot-grid-light mask-fade-radial pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="landing-glow left-[-120px] top-[-120px] h-[520px] w-[520px] bg-brand-blue/35" aria-hidden="true" />
      <div className="landing-glow bottom-[-200px] right-[10%] h-[480px] w-[480px] bg-brand-blue-light/20" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        {/* Izquierda */}
        <Reveal>
          <Eyebrow dark>{t("cta.eyebrow")}</Eyebrow>
          <h2 className="mt-6 font-display text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[3rem] lg:text-[3.6rem]">
            {t("cta.title")}
            <br />
            <span className="text-gradient-blue">{t("cta.titleLine2")}</span>
          </h2>
          <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-white/65 sm:text-lg">{t("cta.subtitle")}</p>

          <ul className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-[15px] text-white/85">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <TrialLink ctaLocation="cta_section" ctaLabel={t("cta.ctaButton")} className={btnOnDark}>
              {t("cta.ctaButton")}
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </TrialLink>
          </div>
        </Reveal>

        {/* Formulario */}
        <Reveal delay={0.12}>
          <div className="rounded-[28px] bg-white p-6 text-brand-ink shadow-[0_50px_120px_-40px_rgba(0,0,0,0.6)] sm:p-9">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue-tint text-brand-blue">
                  <Send className="h-7 w-7" />
                </span>
                <h3 className="font-display text-[1.6rem] font-semibold tracking-tight">{t("cta.successTitle")}</h3>
                <p className="mt-2 text-[14.5px] text-brand-muted">{t("cta.successText")}</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-[1.45rem] font-semibold tracking-tight">{t("cta.formTitle")}</h3>
                <p className="mt-1 text-[14px] text-brand-muted">{t("cta.formSubtitle")}</p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div>
                    <label htmlFor="email-input" className={labelClass}>{t("cta.emailLabel")}</label>
                    <input id="email-input" type="email" required value={formData.email} onChange={set("email")} className={inputClass} placeholder={t("cta.emailPlaceholder")} autoComplete="email" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombre-input" className={labelClass}>{t("cta.nameLabel")}</label>
                      <input id="nombre-input" type="text" required value={formData.nombre} onChange={set("nombre")} className={inputClass} placeholder={t("cta.namePlaceholder")} autoComplete="given-name" />
                    </div>
                    <div>
                      <label htmlFor="apellido-input" className={labelClass}>{t("cta.lastNameLabel")}</label>
                      <input id="apellido-input" type="text" required value={formData.apellido} onChange={set("apellido")} className={inputClass} placeholder={t("cta.lastNamePlaceholder")} autoComplete="family-name" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clinica-input" className={labelClass}>{t("cta.clinicLabel")}</label>
                      <input id="clinica-input" type="text" required value={formData.clinica} onChange={set("clinica")} className={inputClass} placeholder={t("cta.clinicPlaceholder")} autoComplete="organization" />
                    </div>
                    <div>
                      <label htmlFor="telefono-input" className={labelClass}>{t("cta.phoneLabel")}</label>
                      <input id="telefono-input" type="tel" value={formData.telefono} onChange={set("telefono")} className={inputClass} placeholder={t("cta.phonePlaceholder")} autoComplete="tel" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="motivo-select" className={labelClass}>{t("cta.reasonLabel")}</label>
                    <div className="relative">
                      <select id="motivo-select" required value={formData.motivo} onChange={set("motivo")} className={`${inputClass} cursor-pointer appearance-none pr-10 ${formData.motivo ? "" : "text-brand-muted/60"}`}>
                        <option value="" disabled>{t("cta.reasonPlaceholder")}</option>
                        <option value="contratar">{t("cta.reasonOptions.contratar")}</option>
                        <option value="demostracion">{t("cta.reasonOptions.demostracion")}</option>
                        <option value="precios">{t("cta.reasonOptions.precios")}</option>
                        <option value="soporte">{t("cta.reasonOptions.soporte")}</option>
                        <option value="otro">{t("cta.reasonOptions.otro")}</option>
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mensaje-textarea" className={labelClass}>{t("cta.messageLabel")}</label>
                    <textarea id="mensaje-textarea" value={formData.mensaje} onChange={set("mensaje")} rows={3} className={`${inputClass} resize-none`} placeholder={t("cta.messagePlaceholder")} />
                  </div>

                  {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13.5px] font-medium text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-blue py-4 text-[15px] font-semibold text-white shadow-[0_10px_28px_-10px_rgba(37,99,255,0.8)] transition-all hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t("cta.submitting") : t("cta.submit")}
                    {!loading && <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
