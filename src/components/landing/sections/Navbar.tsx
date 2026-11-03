import { BrandLogo } from '../../brand/BrandLogo'
import React, { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { TrialLink } from "../../ui/TrialLink"

/**
 * Navbar de la landing y de las páginas legales.
 * Arriba de todo es transparente; al scrollear se convierte en una píldora
 * flotante con blur. Se comparte con /sobre-nosotros y las páginas legales.
 */
export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation("landing")

  const isLanding = location.pathname === "/"

  const navLinks = [
    { label: t("nav.features"), href: "#funcionalidades" },
    { label: t("nav.demo"), href: "#demo" },
    { label: t("nav.pricing"), href: "#precios" },
    { label: t("nav.faq"), href: "#faq" },
  ]

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      setMobileMenuOpen(false)
      if (isLanding) {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      } else {
        navigate("/" + href)
      }
    },
    [isLanding, navigate]
  )

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isLanding && location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(location.hash)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [location, isLanding])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none bg-white border-b border-brand-ink/[0.06]"
      >
        <nav
          aria-label="Principal"
          className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isScrolled
              ? "w-full max-w-[1200px] px-6 py-3 sm:px-8"
              : "w-full max-w-[1200px] px-6 py-5 sm:px-8"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center transition-opacity hover:opacity-80" aria-label="Dentiqly, inicio">
            <BrandLogo alt="Dentiqly" className="h-[26px] w-auto" />
          </Link>

          {/* Links centro */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-brand-ink/65 transition-colors hover:bg-brand-ink/[0.05] hover:text-brand-ink"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Acciones */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-[14px] font-medium text-brand-ink/65 transition-colors hover:bg-brand-ink/[0.05] hover:text-brand-ink"
            >
              {t("nav.login")}
            </Link>
            <TrialLink
              ctaLocation="navbar"
              ctaLabel={t("nav.signup")}
              className="group inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-blue px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,255,0.8)] transition-all hover:bg-brand-blue-hover"
            >
              {t("nav.signup")}
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </TrialLink>
          </div>

          {/* Hamburguesa */}
          <button
            className="rounded-lg p-2 text-brand-ink/70 transition-colors hover:bg-brand-ink/[0.05] hover:text-brand-ink lg:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Menú mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col bg-white px-6 pt-24 pb-8 lg:hidden"
          >
            <div className="flex flex-col">
              {navLinks.map((item, i) => (
                <motion.a
                  key={item.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="border-b border-brand-ink/[0.07] py-4 font-display text-[1.35rem] font-semibold text-brand-ink"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 items-center justify-center rounded-lg font-semibold text-brand-ink ring-1 ring-inset ring-brand-ink/15"
              >
                {t("nav.login")}
              </Link>
              <TrialLink
                ctaLocation="navbar"
                ctaLabel={`${t("nav.signup")} (mobile)`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-blue font-semibold text-white shadow-lg shadow-brand-blue/25"
              >
                {t("nav.signup")}
                <ArrowRight size={16} />
              </TrialLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
