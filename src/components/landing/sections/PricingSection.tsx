import React, { useEffect, useRef, useState } from "react"
import { TrialLink } from "../../ui/TrialLink"
import { useTranslation } from "react-i18next"
import { useBillingPlans } from "../../../hooks/useBillingPlans"
import { useCountry } from "../../../hooks/useCountry"
import {
  ArrowRight,
  X,
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
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const mainFeatureIcons = [Calendar, UserCog, Stethoscope, DollarSign, Wallet, Building2]

const allFeatureIcons = [
  [Calendar, Clock, Globe, CalendarOff, Bell, RefreshCw],
  [UserCog, FileText, Stethoscope, ClipboardList, Pill, FolderOpen, CreditCard],
  [DollarSign, Wallet, TrendingUp, Shield, Briefcase],
  [Building2, Users, Briefcase, Settings, BarChart3],
  [Globe, Smartphone, FileText, FolderOpen, UserCog],
  [Lock, RefreshCw, Headphones, Star, Zap],
]

export const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const { t } = useTranslation('landing')

  const plans = useBillingPlans()
  const country = useCountry()
  const isArgentina = country === 'AR'

  const mainFeatures = (t('pricing.mainFeatures', { returnObjects: true }) as string[])
  const featureCategories = (t('pricing.featureCategories', { returnObjects: true }) as { category: string; items: string[] }[])
  const comparisonFeatures = (t('pricing.comparison', { returnObjects: true }) as { name: string; pro: string; enterprise: string }[])

  const usdMonthly = plans?.usd.monthly.price
  const usdAnnualPerMonth = plans ? (plans.usd.annual.pricePerMonth ?? Math.round(plans.usd.annual.price / 12)) : undefined
  const discount = plans?.usd.annual.discount
  const arsMonthly = plans?.ars.monthly.price
  const arsAnnualPerMonth = plans ? (plans.ars.annual.pricePerMonth ?? Math.round(plans.ars.annual.price / 12)) : undefined

  const displayUsd = isAnnual ? usdAnnualPerMonth : usdMonthly
  const displayArs = isAnnual ? arsAnnualPerMonth : arsMonthly

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pricing-header", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      })

      gsap.from(".pricing-columns", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      })

      gsap.from(".pricing-table", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pricing-table", start: "top 85%" },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (showAllFeatures) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showAllFeatures])

  return (
    <>
      <section
        ref={sectionRef}
        id="precios"
        data-navbar-theme="light"
        className="py-28 sm:py-36 bg-white relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="pricing-header mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#0B1023] tracking-tight mb-10">
              {t('pricing.title')}
            </h2>

            {/* Toggle mensual/anual */}
            <div className="inline-flex items-center bg-[#F0F4FF] rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !isAnnual
                    ? "bg-[#0B1023] text-white shadow-sm"
                    : "text-[#0B1023]/60 hover:text-[#0B1023]"
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isAnnual
                    ? "bg-[#0B1023] text-white shadow-sm"
                    : "text-[#0B1023]/60 hover:text-[#0B1023]"
                }`}
              >
                {t('pricing.annual')}
              </button>
            </div>
          </div>

          {/* Plan Columns */}
          <div className="pricing-columns grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-16">
            {/* Professional */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-[#0B1023] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {t('pricing.professional')}
                </span>
                {isAnnual && discount !== undefined && (
                  <span className="inline-flex items-center bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-3 py-1.5 rounded-full">
                    {discount}% off
                  </span>
                )}
              </div>

              <div className="mb-1">
                {displayUsd === undefined ? (
                  <div className="h-12 w-36 bg-[#0B1023]/5 rounded-xl animate-pulse" />
                ) : isAnnual ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-semibold text-[#0B1023] tracking-tight">
                      USD {displayUsd}
                    </span>
                    <span className="text-2xl text-[#0B1023]/30 line-through">
                      USD {usdMonthly}
                    </span>
                  </div>
                ) : (
                  <span className="text-5xl font-semibold text-[#0B1023] tracking-tight">
                    USD {displayUsd}
                  </span>
                )}
              </div>

              {isArgentina && displayArs !== undefined && displayArs > 0 && (
                <p className="text-sm text-[#0B1023]/40 mb-1">
                  ({t('pricing.arsEquiv', { amount: displayArs.toLocaleString("es-AR") })})
                </p>
              )}

              <p className="text-sm text-[#0B1023]/40 mb-8">{t('pricing.usdMonth')}</p>

              {/* 6 Main Features */}
              <div className="space-y-3 mb-6">
                {mainFeatures.map((text, i) => {
                  const Icon = mainFeatureIcons[i]
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#2563FF]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#2563FF]" />
                      </div>
                      <span className="text-sm text-[#0B1023]/70">{text}</span>
                    </div>
                  )
                })}
              </div>

              {/* Ver más */}
              <button
                onClick={() => setShowAllFeatures(true)}
                className="text-[#2563FF] text-sm font-semibold hover:text-[#1D4ED8] transition-colors mb-8 flex items-center gap-1"
              >
                {t('pricing.allFeatures')}
                <ArrowRight size={14} />
              </button>

              <TrialLink
                ctaLocation="pricing"
                ctaLabel={t('pricing.cta')}
                className="inline-flex items-center justify-center gap-2 bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm"
              >
                {t('pricing.cta')}
                <ArrowRight size={16} />
              </TrialLink>

              <p className="text-xs text-[#0B1023]/40 mt-4">
                {t('pricing.trial')}
              </p>
            </div>

            {/* Enterprise */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center bg-[#F0F4FF] text-[#0B1023]/70 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {t('pricing.enterprise')}
                </span>
              </div>

              <p className="text-lg text-[#0B1023]/60 leading-relaxed mb-8 max-w-sm">
                {t('pricing.enterpriseDesc')}
              </p>

              <a
                href="mailto:ventas@dentiqly.com"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#0B1023]/15 hover:border-[#2563FF] text-[#0B1023] font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm"
              >
                {t('pricing.contactSales')}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="pricing-table border-t border-[#0B1023]/10">
            {comparisonFeatures.map((feature, i) => (
              <div
                key={i}
                className="grid grid-cols-3 md:grid-cols-[1fr_1fr_1fr] py-5 border-b border-[#0B1023]/[0.06] items-center"
              >
                <span className="text-sm text-[#0B1023]/70 font-medium">
                  {feature.name}
                </span>
                <span className="text-sm text-[#0B1023]/50 text-center md:text-left">
                  {feature.pro}
                </span>
                <span className="text-sm text-[#0B1023]/50 text-center md:text-left">
                  {feature.enterprise}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features Modal */}
      {showAllFeatures && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ overscrollBehavior: "contain" }}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0B1023]/60 backdrop-blur-sm"
            onClick={() => setShowAllFeatures(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ maxHeight: "85vh" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#0B1023]/[0.06]" style={{ flexShrink: 0 }}>
              <div>
                <h3 className="text-2xl font-semibold text-[#0B1023] tracking-tight">
                  {t('pricing.modalTitle')}
                </h3>
                <p className="text-sm text-[#0B1023]/40 mt-1">
                  {t('pricing.modalSubtitle')}
                </p>
              </div>
              <button
                onClick={() => setShowAllFeatures(false)}
                className="w-10 h-10 rounded-full bg-[#F0F4FF] hover:bg-[#E0E8FF] flex items-center justify-center transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-[#0B1023]/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: "auto", flex: "1 1 0%", minHeight: 0, overscrollBehavior: "contain" }} className="px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {featureCategories.map((group, gi) => (
                  <div key={gi}>
                    <h4 className="text-xs font-bold text-[#2563FF] uppercase tracking-widest mb-4">
                      {group.category}
                    </h4>
                    <div className="space-y-3">
                      {group.items.map((text, fi) => {
                        const Icon = allFeatureIcons[gi]?.[fi]
                        return (
                          <div key={fi} className="flex items-start gap-3">
                            {Icon && (
                              <div className="w-7 h-7 rounded-lg bg-[#2563FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Icon className="w-3.5 h-3.5 text-[#2563FF]" />
                              </div>
                            )}
                            <span className="text-sm text-[#0B1023]/70 leading-snug">
                              {text}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-[#0B1023]/[0.06] bg-[#F8FAFF] rounded-b-3xl" style={{ flexShrink: 0 }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-[#0B1023]/50">
                  {t('pricing.featureCount')}
                </p>
                <TrialLink
                  ctaLocation="pricing"
                  ctaLabel={t('pricing.startTrial')}
                  onClick={() => setShowAllFeatures(false)}
                  className="inline-flex items-center justify-center gap-2 bg-[#2563FF] hover:bg-[#1D4ED8] text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm"
                >
                  {t('pricing.startTrial')}
                  <ArrowRight size={16} />
                </TrialLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
