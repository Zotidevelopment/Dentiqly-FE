import React, { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, User } from "lucide-react"
import { ThinArrow } from "../components/ThinArrow"
import gsap from "gsap"

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
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
        y: -30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.1,
      })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const darkSections = document.querySelectorAll<HTMLElement>('[data-navbar-theme="dark"]')
    if (darkSections.length === 0) return

    const visibleDarkSections = new Set<HTMLElement>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleDarkSections.add(entry.target as HTMLElement)
          } else {
            visibleDarkSections.delete(entry.target as HTMLElement)
          }
        })
        setIsDark(visibleDarkSections.size > 0)
      },
      {
        rootMargin: "-1px 0px -95% 0px",
      }
    )

    darkSections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!mobileMenuRef.current) return
    const links = mobileMenuRef.current.querySelectorAll(".mobile-nav-link")
    if (mobileMenuOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      )
      gsap.fromTo(
        links,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, delay: 0.15, ease: "power3.out" }
      )
    }
  }, [mobileMenuOpen])

  const navLinks = [
    { label: "Plataforma", href: "/plataforma", isPage: true },
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Por qué Dentiqly", href: "#por-que-dentiqly" },
    { label: "Precios", href: "#precios" },
    { label: "Preguntas", href: "#faq" },
  ]

  return (
    <>
      <nav
        ref={navRef}
        className="fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 top-4 w-[92%] max-w-5xl bg-[#0047FF] border border-white/10 shadow-2xl rounded-full py-1.5 px-6"
      >
        <div className="w-full flex items-center justify-between h-[54px] relative">

          {/* ═══ Left: Logo ═══ */}
          <Link
            to="/"
            className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/dentiqly-logo.png"
              alt="Dentiqly - Software de gestión dental"
              width={91}
              height={28}
              className="h-[28px] w-auto transition-all duration-300 brightness-0 invert"
            />
          </Link>

          {/* ══ center: Nav Links pill ══ */}
          <div className="hidden lg:flex items-center gap-1 lg:gap-1.5 rounded-full px-2 py-1.5 absolute left-1/2 -translate-x-1/2 transition-colors bg-transparent">
            {navLinks.map((item) =>
              item.isPage ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white/15 rounded-full transition-all tracking-normal"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white/15 rounded-full transition-all tracking-normal"
                >
                  {item.label}
                </a>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 transition-colors duration-300 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* ═══ Right: Auth Buttons ═══ */}
          <div className="hidden lg:flex items-center gap-[10px]">
            <Link
              to="/login"
              className="h-[38px] px-5 text-[13px] transition-all duration-300 flex items-center justify-center rounded-full font-medium bg-transparent text-white border border-white/40 hover:border-white/70 hover:bg-white/10"
            >
              <User size={14} className="mr-2" />
              Ingresar
            </Link>
            <Link
              to="/register"
              className="h-[38px] px-5 text-[13px] transition-all duration-300 flex items-center justify-center rounded-full font-extrabold gap-2 shadow-lg group bg-white text-[#0047FF] hover:bg-gray-50 shadow-white/20"
            >
              Probá GRATIS
              <ThinArrow size={18} className="text-[#0047FF] group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-40 bg-[#0A0F2D]/95 backdrop-blur-xl pt-20 px-8 lg:hidden"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((item) =>
              item.isPage ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-nav-link text-xl font-bold text-white/80 hover:text-white py-4 border-b border-white/5 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="mobile-nav-link text-xl font-bold text-white/80 hover:text-white py-4 border-b border-white/5 transition-colors"
                >
                  {item.label}
                </a>
              )
            )}
            <div className="flex flex-col gap-3 mt-8">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white font-medium transition-all"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="h-12 flex items-center justify-center rounded-full bg-[#0047FF] text-white font-extrabold transition-all shadow-lg shadow-[#0047FF]/30"
              >
                🚀 Probá GRATIS
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
