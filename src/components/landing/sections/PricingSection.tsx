import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  X,
  Check,
  Calendar,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Shield,
  Headphones,
  Building2,
  Stethoscope,
  Globe,
  Zap,
  Bell,
  DollarSign,
  Wallet,
  UserCog,
  CalendarOff,
  Settings,
  Briefcase,
  Clock,
  ClipboardList,
  Pill,
  FolderOpen,
  TrendingUp,
  Lock,
  Smartphone,
  RefreshCw,
  Star,
  Minus,
} from "lucide-react"
import { TrialLink } from "../../ui/TrialLink"
import { useBillingPlans } from "../../../hooks/useBillingPlans"
import { useCountry } from "../../../hooks/useCountry"
import { SectionHeading } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"
import { Spark } from "../ui/Spark"
import { btnOnDark, btnSecondary, btnPrimary } from "../ui/cta"

const allFeatureIcons = [
  [Calendar, Clock, Globe, CalendarOff, Bell, RefreshCw],
  [UserCog, FileText, Stethoscope, ClipboardList, Pill, FolderOpen, CreditCard],
  [DollarSign, Wallet, TrendingUp, Shield, Briefcase],
  [Building2, Users, Briefcase, Settings, BarChart3],
  [Globe, Smartphone, FileText, FolderOpen, UserCog],
  [Lock, RefreshCw, Headphones, Star, Zap],
]

const formatUsd = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2))

export const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const { t } = useTranslation("landing")

  const plans = useBillingPlans()
  const country = useCountry()
  const isArgentina = country === "AR"

  const mainFeatures = t("pricing.mainFeatures", { returnObjects: true }) as string[]
  const featureCategories = t("pricing.featureCategories", { returnObjects: true }) as { category: string; items: string[] }[]
  const comparisonFeatures = t("pricing.comparison", { returnObjects: true }) as { name: string; pro: string; enterprise: string }[]

  const usdMonthly = plans?.usd.monthly.price
  const usdAnnualPerMonth = plans ? (plans.usd.annual.pricePerMonth ?? Math.round(plans.usd.annual.price / 12)) : undefined
  const discount = plans?.usd.annual.discount
  const arsMonthly = plans?.ars.monthly.price
  const arsAnnualPerMonth = plans ? (plans.ars.annual.pricePerMonth ?? Math.round(plans.ars.annual.price / 12)) : undefined

  const displayUsd = isAnnual ? usdAnnualPerMonth : usdMonthly
  const displayArs = isAnnual ? arsAnnualPerMonth : arsMonthly

  useEffect(() => {
    document.body.style.overflow = showAllFeatures ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [showAllFeatures])

  return (
    <>
      <section id="precios" data-navbar-theme="light" className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="landing-glow left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 bg-brand-blue/[0.08]" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow={t("pricing.eyebrow")} title={t("pricing.title")} subtitle={t("pricing.subtitle")} />

          {/* Toggle mensual / anual */}
          <Reveal delay={0.05} className="mt-10 flex justify-center">
            <div className="relative inline-flex items-center rounded-full bg-brand-surface p-1 ring-1 ring-brand-ink/[0.06]">
              {[
                { key: false, label: t("pricing.monthly") },
                { key: true, label: t("pricing.annual") },
              ].map((opt) => {
                const active = isAnnual === opt.key
                return (
                  <button
                    key={String(opt.key)}
                    onClick={() => setIsAnnual(opt.key)}
                    className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-[14px] font-semibold transition-colors ${
                      active ? "text-white" : "text-brand-muted hover:text-brand-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="pricing-toggle"
                        className="absolute inset-0 -z-10 rounded-full bg-brand-ink"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    {opt.label}
                    {opt.key && discount !== undefined && (
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${active ? "bg-emerald-400 text-brand-ink" : "bg-emerald-100 text-emerald-700"}`}>
                        -{discount}%
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Reveal>

          {/* Tarjetas */}
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
            {/* Profesional */}
            <Reveal className="relative overflow-hidden rounded-[30px] bg-brand-navy p-8 text-white shadow-[0_50px_100px_-40px_rgba(11,16,35,0.6)] sm:p-10">
              <div className="landing-glow -right-20 -top-20 h-72 w-72 bg-brand-blue/40" aria-hidden="true" />
              <Spark size={120} className="absolute -bottom-10 -right-6 text-white/[0.04]" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[1.3rem] font-semibold tracking-tight">{t("pricing.professional")}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    <Spark size={9} /> {t("pricing.popular")}
                  </span>
                </div>

                <div className="mt-8 flex items-end gap-3">
                  {displayUsd === undefined ? (
                    <div className="h-14 w-44 animate-pulse rounded-xl bg-white/10" />
                  ) : (
                    <>
                      <span className="font-display text-[3.6rem] font-bold leading-none tracking-tight">
                        <span className="mr-1 align-top text-[1.4rem] font-semibold text-white/60">USD</span>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={String(displayUsd)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="inline-block"
                          >
                            {formatUsd(displayUsd)}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      {isAnnual && usdMonthly !== undefined && (
                        <span className="mb-2 text-xl text-white/35 line-through">USD {formatUsd(usdMonthly)}</span>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-2 text-[13.5px] text-white/55">
                  {t("pricing.usdMonth")}
                  {isArgentina && displayArs !== undefined && displayArs > 0 && (
                    <> · {t("pricing.arsEquiv", { amount: displayArs.toLocaleString("es-AR") })}</>
                  )}
                </p>

                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {mainFeatures.map((text) => (
                    <li key={text} className="flex items-start gap-2.5 text-[14px] text-white/85">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setShowAllFeatures(true)}
                  className="mt-5 inline-flex items-center gap-1 text-[13.5px] font-semibold text-brand-blue-light transition-colors hover:text-white"
                >
                  {t("pricing.allFeatures")}
                  <ArrowRight size={14} />
                </button>

                <div className="mt-8">
                  <TrialLink ctaLocation="pricing" ctaLabel={t("pricing.cta")} className={`${btnOnDark} w-full sm:w-auto`}>
                    {t("pricing.cta")}
                    <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </TrialLink>
                  <p className="mt-3 text-[12.5px] text-white/45">{t("pricing.trial")}</p>
                </div>
              </div>
            </Reveal>

            {/* Enterprise */}
            <Reveal delay={0.1} className="flex flex-col rounded-[30px] bg-brand-surface p-8 ring-1 ring-brand-ink/[0.07] sm:p-10">
              <span className="font-display text-[1.3rem] font-semibold tracking-tight text-brand-ink">{t("pricing.enterprise")}</span>
              <p className="mt-6 font-display text-[2rem] font-bold leading-none tracking-tight text-brand-ink">A medida</p>
              <p className="mt-5 text-[15px] leading-relaxed text-brand-muted">{t("pricing.enterpriseDesc")}</p>

              <ul className="mt-7 space-y-3">
                {comparisonFeatures.map((f) => (
                  <li key={f.name} className="flex items-start gap-2.5 text-[14px] text-brand-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-ink/[0.07] text-brand-ink">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span>
                      <span className="text-brand-muted">{f.name}: </span>
                      <span className="font-semibold">{f.enterprise}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <a href="mailto:ventas@dentiqly.com" className={`${btnSecondary} w-full sm:w-auto`}>
                  {t("pricing.contactSales")}
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Comparativa */}
          <Reveal delay={0.15} className="mt-8 overflow-hidden rounded-[26px] ring-1 ring-brand-ink/[0.07]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-brand-surface px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-brand-muted sm:px-7">
              <span>{t("pricing.compareTitle")}</span>
              <span className="text-center">{t("pricing.professional")}</span>
              <span className="text-center">{t("pricing.enterprise")}</span>
            </div>
            {comparisonFeatures.map((f, i) => (
              <div
                key={f.name}
                className={`grid grid-cols-[1.4fr_1fr_1fr] items-center px-5 py-4 text-[13.5px] sm:px-7 ${
                  i > 0 ? "border-t border-brand-ink/[0.06]" : ""
                }`}
              >
                <span className="font-medium text-brand-ink">{f.name}</span>
                <span className="text-center text-brand-muted">{f.pro}</span>
                <span className="text-center font-semibold text-brand-ink">{f.enterprise}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Modal: todas las funcionalidades */}
      <AnimatePresence>
        {showAllFeatures && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ overscrollBehavior: "contain" }}
            onWheel={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("pricing.modalTitle")}
          >
            <div className="absolute inset-0 bg-brand-navy/70 backdrop-blur-sm" onClick={() => setShowAllFeatures(false)} />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative flex w-full max-w-4xl flex-col rounded-[28px] bg-white shadow-2xl"
              style={{ maxHeight: "85vh" }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-brand-ink/[0.06] px-6 py-5 sm:px-8">
                <div>
                  <h3 className="font-display text-[1.5rem] font-semibold tracking-tight text-brand-ink">{t("pricing.modalTitle")}</h3>
                  <p className="mt-0.5 text-[13.5px] text-brand-muted">{t("pricing.modalSubtitle")}</p>
                </div>
                <button
                  onClick={() => setShowAllFeatures(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface transition-colors hover:bg-brand-blue-tint"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-brand-ink/60" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-7 sm:px-8" style={{ overscrollBehavior: "contain" }}>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {featureCategories.map((group, gi) => (
                    <div key={group.category}>
                      <h4 className="mb-3 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-widest text-brand-blue">
                        <Spark size={9} /> {group.category}
                      </h4>
                      <div className="space-y-2.5">
                        {group.items.map((text, fi) => {
                          const Icon = allFeatureIcons[gi]?.[fi] ?? Minus
                          return (
                            <div key={text} className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-blue-tint">
                                <Icon className="h-3 w-3 text-brand-blue" />
                              </div>
                              <span className="text-[13.5px] leading-snug text-brand-ink/80">{text}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 rounded-b-[28px] border-t border-brand-ink/[0.06] bg-brand-surface px-6 py-5 sm:px-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-[13.5px] text-brand-muted">{t("pricing.featureCount")}</p>
                  <TrialLink
                    ctaLocation="pricing"
                    ctaLabel={t("pricing.startTrial")}
                    onClick={() => setShowAllFeatures(false)}
                    className={btnPrimary}
                  >
                    {t("pricing.startTrial")}
                    <ArrowRight size={16} />
                  </TrialLink>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
