import React, { useState } from "react"
import { Plus, Mail } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Eyebrow } from "../ui/SectionHeading"
import { Reveal } from "../ui/Reveal"

const FaqItem: React.FC<{ question: string; answer: string; open: boolean; onToggle: () => void; id: string }> = ({
  question,
  answer,
  open,
  onToggle,
  id,
}) => (
  <div className={`border-b border-brand-ink/[0.07] transition-colors ${open ? "bg-brand-surface/60" : ""}`}>
    <button
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={id}
      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
    >
      <span className={`text-[15.5px] font-semibold transition-colors ${open ? "text-brand-blue" : "text-brand-ink"}`}>{question}</span>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-all duration-300 ${
          open ? "rotate-45 bg-brand-blue text-white ring-brand-blue" : "text-brand-muted ring-brand-ink/15"
        }`}
      >
        <Plus size={15} />
      </span>
    </button>
    <div
      id={id}
      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <p className="px-5 pb-6 text-[14.5px] leading-relaxed text-brand-muted sm:px-6">{answer}</p>
      </div>
    </div>
  </div>
)

export const FaqSection: React.FC = () => {
  const { t } = useTranslation("landing")
  const faqs = t("faq.items", { returnObjects: true }) as { question: string; answer: string }[]
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>{t("faq.eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-brand-ink sm:text-[2.6rem]">
            {t("faq.title")}
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-brand-muted">{t("faq.subtitle")}</p>
          <a
            href="mailto:hola@dentiqly.com"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-surface px-4 py-2.5 text-[14px] font-semibold text-brand-ink ring-1 ring-brand-ink/[0.07] transition-colors hover:bg-brand-blue-tint hover:text-brand-blue"
          >
            <Mail size={15} className="text-brand-blue" />
            {t("faq.contact")}
          </a>
        </Reveal>

        <Reveal delay={0.1} className="overflow-hidden rounded-[26px] ring-1 ring-brand-ink/[0.07]">
          {faqs.map((faq, i) => (
            <FaqItem
              key={faq.question}
              id={`faq-panel-${i}`}
              question={faq.question}
              answer={faq.answer}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </Reveal>
      </div>
    </section>
  )
}
