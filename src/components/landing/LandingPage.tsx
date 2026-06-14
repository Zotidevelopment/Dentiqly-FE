import React, { useRef, useState, useEffect } from "react"
import { useLenis } from "./animations/useLenis"
import { SEO, PAGE_SEO } from "../seo/SEO"
import { CustomCursor } from "./components/CustomCursor"
import { Navbar } from "./sections/Navbar"
import { HeroSection } from "./sections/HeroSection"
import { SocialProofBar } from "./sections/SocialProofBar"
import { ProductShowcase } from "./sections/ProductShowcase"
import { TabbedShowcase } from "./sections/TabbedShowcase"
// import { FeatureDeepDive } from "./sections/FeatureDeepDive"
// import { TestimonialSection } from "./sections/TestimonialSection"
import { SecuritySection } from "./sections/SecuritySection"
import { FaqSection } from "./sections/FaqSection"
import { PricingSection } from "./sections/PricingSection"
import { CtaSection } from "./sections/CtaSection"
import { FooterSection } from "./sections/FooterSection"
import { PerformanceSection } from "./sections/PerformanceSection"

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDemoFullscreen, setIsDemoFullscreen] = useState(false)
  const lenisRef = useLenis()

  useEffect(() => {
    if (lenisRef.current) {
      if (isDemoFullscreen) {
        lenisRef.current.stop()
      } else {
        lenisRef.current.start()
      }
    }
  }, [isDemoFullscreen, lenisRef])

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FAFCFF] font-sans text-[#0A0F2D] selection:bg-[#2563FF] selection:text-white overflow-hidden cursor-none md:cursor-none"
    >
      <SEO {...PAGE_SEO.home} />
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection onOpenDemo={() => setIsDemoFullscreen(true)} />
        <SocialProofBar />
        <TabbedShowcase />
        <ProductShowcase isFullscreen={isDemoFullscreen} onToggleFullscreen={setIsDemoFullscreen} />
        <PerformanceSection />
        <PricingSection />
        <SecuritySection />
        <FaqSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  )
}
