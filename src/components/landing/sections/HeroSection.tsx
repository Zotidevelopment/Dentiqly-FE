import React, { useRef } from "react"
import { TrialLink } from "../../ui/TrialLink"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { ThinArrow } from "../components/ThinArrow"
import { HeroCalendarPreview } from "../components/HeroCalendarPreview"
import { CheckCircle2, Clock, MessageSquare, Users, Zap } from "lucide-react"

// ─── Hero ─────────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  onOpenDemo?: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDemo }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useTranslation('landing')

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden flex items-center pt-28 pb-16 lg:pt-32 lg:pb-24 lg:min-h-[740px] bg-white"
    >
      {/* ── Copy (left side, constrained) ── */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:pl-16 lg:pr-8">
        <div className="flex flex-col items-start text-left lg:max-w-[560px] xl:max-w-[600px]">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="text-[2.4rem] sm:text-[2.9rem] lg:text-[2.7rem] xl:text-[3.1rem] 2xl:text-[3.5rem] font-bold tracking-[-1.5px] leading-[1.08] text-[#0A0F2D] mb-4"
          >
            {t('hero.headline')}
            <br />
            <span className="text-[#0047FF]">{t('hero.headlineHighlight')}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="text-[0.97rem] text-gray-500 leading-relaxed mb-6"
          >
            {t('hero.subheadline')}
          </motion.p>

          {/* Benefits */}
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.33 }}
            className="space-y-2 mb-7"
          >
            {[
              { icon: <MessageSquare className="w-4 h-4 text-[#0047FF]" />, text: t('hero.benefit1') },
              { icon: <Clock className="w-4 h-4 text-[#0047FF]" />, text: t('hero.benefit2') },
              { icon: <Users className="w-4 h-4 text-[#0047FF]" />, text: t('hero.benefit3') },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-gray-600 font-medium">
                <div className="mt-0.5 w-5 h-5 rounded-md bg-[#0047FF]/8 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                {item.text}
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4"
          >
            <TrialLink
              ctaLocation="hero"
              ctaLabel={t('hero.ctaPrimary')}
              className="group bg-[#0047FF] text-white px-6 py-3 rounded-full text-[14.5px] font-semibold shadow-lg shadow-[#0047FF]/20 hover:shadow-xl hover:shadow-[#0047FF]/30 hover:bg-[#003BCC] transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>{t('hero.ctaPrimary')}</span>
              <ThinArrow size={15} className="group-hover:translate-x-0.5 transition-transform duration-200 shrink-0" />
            </TrialLink>

            <button
              onClick={() => {
                if (onOpenDemo) onOpenDemo()
                else document.querySelector("#funcionalidades")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="bg-white border border-gray-200 text-[#0A0F2D] hover:border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-full text-[14.5px] font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              {t('hero.ctaDemo')}
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-1.5 text-[11.5px] text-gray-400"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            {t('hero.noCard')}
          </motion.p>
        </div>

        {/* ── Mobile calendar (in flow, below copy) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.25, 1, 0.5, 1] }}
          className="lg:hidden mt-10"
        >
          <div className="rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,71,255,0.1)] ring-1 ring-gray-200/60 bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white border border-gray-200 rounded-md px-3 py-0.5 text-[10px] text-gray-400 font-mono">
                  dentiqly.com/agenda
                </div>
              </div>
            </div>
            <div className="h-[260px] overflow-hidden relative">
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{ transform: "scale(0.5)", width: "200%", height: "200%" }}
              >
                <HeroCalendarPreview />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Desktop calendar (absolute, desde el centro hasta el borde derecho) ── */}
      {/* La section tiene overflow-hidden, así que el card se corta en el borde del viewport */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="absolute inset-y-0 hidden lg:flex items-center z-10"
        style={{ left: "50%", right: 0 }}
      >
        {/* Perspective wrapper — fija la altura del card */}
        <div
          className="relative w-full"
          style={{ height: "560px", perspective: "1800px", perspectiveOrigin: "15% 50%" }}
        >
          {/* Card con efecto 3D */}
          <div
            className="rounded-l-2xl overflow-hidden bg-white w-full h-full flex flex-col"
            style={{
              transform: "rotateX(3deg) rotateY(-8deg) rotateZ(0.5deg)",
              boxShadow:
                "0 56px 140px rgba(0,71,255,0.16), 0 24px 64px rgba(0,0,0,0.10), 0 0 0 1px rgba(148,163,184,0.22)",
              transformOrigin: "left center",
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white border border-gray-200 rounded-md px-3 py-0.5 text-[10px] text-gray-400 font-mono">
                  app.dentiqly.com/agenda
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#0047FF] bg-[#0047FF]/8 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0047FF] animate-pulse inline-block" />
                En vivo
              </div>
            </div>

            {/* Calendar — ocupa el resto del card */}
            <div className="flex-1 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{ transform: "scale(0.62)", width: "161.3%", height: "161.3%" }}
              >
                <HeroCalendarPreview />
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  )
}
