import React from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { ArrowRight, Check, PlayCircle } from "lucide-react"
import { TrialLink } from "../../ui/TrialLink"
import { Eyebrow } from "../ui/SectionHeading"
import { btnPrimaryLg, btnSecondaryLg } from "../ui/cta"
import { HeroAppMock } from "../components/HeroAppMock"

const ease = [0.22, 1, 0.36, 1] as const

export const HeroSection: React.FC = () => {
  const { t } = useTranslation("landing")

  const scrollToDemo = () => {
    document.querySelector("#demo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden bg-white pt-32 sm:pt-36 lg:pt-40">
      {/* Fondo: grilla de puntos con máscara radial + resplandor azul */}
      <div className="bg-dot-grid mask-fade-radial pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="landing-glow left-1/2 top-[-260px] h-[560px] w-[900px] -translate-x-1/2 bg-brand-blue/[0.16]"
        aria-hidden="true"
      />
      <div
        className="landing-glow right-[-200px] top-[380px] h-[420px] w-[520px] bg-brand-blue-light/[0.18]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease }}
          className="flex justify-center"
        >
          <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="mx-auto mt-6 max-w-[16ch] font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.035em] text-brand-ink sm:text-[3.6rem] lg:text-[4.6rem]"
        >
          {t("hero.headline")} <span className="text-gradient-blue">{t("hero.headlineHighlight")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease }}
          className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-brand-muted sm:text-lg"
        >
          {t("hero.subheadline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38, ease }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <TrialLink ctaLocation="hero" ctaLabel={t("hero.ctaPrimary")} className={btnPrimaryLg}>
            {t("hero.ctaPrimary")}
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </TrialLink>
          <button type="button" onClick={scrollToDemo} className={btnSecondaryLg}>
            <PlayCircle size={18} className="text-brand-blue" />
            {t("hero.ctaDemo")}
          </button>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-brand-muted"
        >
          {[t("hero.trust1"), t("hero.trust2"), t("hero.trust3")].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check size={10} strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Mock del producto */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease }}
        className="relative z-10 mx-auto mt-14 max-w-7xl px-4 sm:mt-16 sm:px-8 lg:mt-20 lg:px-12"
      >
        <HeroAppMock />
      </motion.div>

      {/* Degradé para fundir el mock con la siguiente sección */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-transparent" aria-hidden="true" />
      <div className="h-16 sm:h-20" />
    </section>
  )
}
