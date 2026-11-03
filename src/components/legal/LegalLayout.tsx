import React from 'react';
import { Navbar } from '../landing/sections/Navbar';
import { FooterSection } from '../landing/sections/FooterSection';
import { SEO } from '../seo/SEO';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
  seoDescription?: string;
  seoCanonical?: string;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, subtitle, lastUpdated, children, seoDescription, seoCanonical }) => {
  return (
    <div className="min-h-screen bg-[#FAFCFF]">
      <SEO title={title} description={seoDescription || subtitle} canonical={seoCanonical} />
      <Navbar />

      {/* Hero header */}
      <header className="dentiqly-legal-header pt-36 pb-12 lg:pt-40 lg:pb-16 relative overflow-hidden">
        <div className="dentiqly-brand-pattern" aria-hidden="true" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0B2440] mb-3 tracking-tight">{title}</h1>
          <p className="text-[#8A93A8] text-lg">{subtitle}</p>
          <p className="text-[#65788D] text-sm mt-4">Última actualización: {lastUpdated}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-8 sm:p-12 lg:p-16">
          <div className="prose prose-gray max-w-none prose-headings:text-[#0B2440] prose-headings:font-extrabold prose-p:text-[#5A6178] prose-p:leading-relaxed prose-li:text-[#5A6178] prose-a:text-[#2458ED] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-[#0B2440]">
            {children}
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};
