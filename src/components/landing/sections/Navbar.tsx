import React, { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { TrialLink } from "../../ui/TrialLink"
import { Menu, X, User } from "lucide-react"
import { ThinArrow } from "../components/ThinArrow"
import gsap from "gsap"

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isLanding = location.pathname === "/"

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
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isLanding && location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [location, isLanding])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.05,
      })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!mobileMenuRef.current) return
    const links = mobileMenuRef.current.querySelectorAll(".mobile-nav-link")
    if (mobileMenuOpen) {
      gsap.fromTo(mobileMenuRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" })
      gsap.fromTo(links, { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, delay: 0.1, ease: "power3.out" })
    }
  }, [mobileMenuOpen])

  const navLinks = [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Por qué Dentiqly", href: "#por-que-dentiqly" },
    { label: "Precios", href: "#precios" },
    { label: "Preguntas", href: "#faq" },
  ]

  return (
    <>
      <nav
        ref={navRef}
        className="fixed z-50 transition-all duration-500 ease-in-out"
        style={
          isScrolled
            ? {
                top: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "92%",
                maxWidth: "1080px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
                padding: "6px 20px",
              }
            : {
                top: "0",
                left: "0",
                transform: "none",
                width: "100%",
                maxWidth: "100%",
                borderRadius: "0",
                backgroundColor: "transparent",
                boxShadow: "none",
                padding: "0 32px",
              }
        }
      >
        <div
          className="w-full flex items-center justify-between relative mx-auto transition-all duration-500"
          style={{
            height: isScrolled ? "52px" : "68px",
            maxWidth: isScrolled ? "100%" : "1200px",
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 hover:opacity-75 transition-opacity duration-200">
            <img
              src="/assets/dentiqly-logo.png"
              alt="Dentiqly"
              width={91}
              height={28}
              className="h-[27px] w-auto"
            />
          </Link>

          {/* Center nav links */}
          <div className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="px-3 py-1.5 text-[13.5px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-150 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="h-9 px-4 text-[13px] flex items-center gap-1.5 rounded-full font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
            >
              <User size={13} />
              Iniciar sesión
            </Link>

            <TrialLink
              ctaLocation="navbar"
              ctaLabel="Creá tu cuenta gratis"
              className="group h-9 px-5 text-[13px] flex items-center gap-1.5 rounded-full font-semibold bg-[#0047FF] text-white hover:bg-[#003BCC] transition-all duration-200 shadow-sm shadow-[#0047FF]/20"
            >
              Creá tu cuenta gratis
              <ThinArrow size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </TrialLink>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-40 bg-white pt-20 px-6 lg:hidden flex flex-col"
        >
          <div className="flex flex-col">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="mobile-nav-link text-[1.15rem] font-semibold text-gray-800 hover:text-[#0047FF] py-4 border-b border-gray-100 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="h-12 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 font-medium transition-all hover:bg-gray-50"
            >
              Iniciar sesión
            </Link>
            <TrialLink
              ctaLocation="navbar"
              ctaLabel="Creá tu cuenta gratis (mobile)"
              onClick={() => setMobileMenuOpen(false)}
              className="h-12 flex items-center justify-center rounded-full bg-[#0047FF] text-white font-bold transition-all hover:bg-[#003BCC] shadow-lg shadow-[#0047FF]/25"
            >
              Creá tu cuenta gratis
            </TrialLink>
          </div>
        </div>
      )}
    </>
  )
}
