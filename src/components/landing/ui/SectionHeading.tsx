import React from "react"
import { Spark } from "./Spark"
import { Reveal } from "./Reveal"

interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: "center" | "left"
  dark?: boolean
  className?: string
}

export const Eyebrow: React.FC<{ children: React.ReactNode; dark?: boolean; className?: string }> = ({
  children,
  dark,
  className = "",
}) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] ${
      dark
        ? "bg-white/[0.07] text-brand-blue-light ring-1 ring-inset ring-white/10"
        : "bg-brand-blue-tint text-brand-blue ring-1 ring-inset ring-brand-blue/10"
    } ${className}`}
  >
    <Spark size={11} />
    {children}
  </span>
)

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  className = "",
}) => {
  const isCenter = align === "center"
  return (
    <Reveal className={`${isCenter ? "text-center mx-auto" : "text-left"} max-w-3xl ${className}`}>
      {eyebrow && (
        <div className={`mb-5 ${isCenter ? "flex justify-center" : ""}`}>
          <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2
        className={`font-display font-semibold tracking-[-0.03em] leading-[1.06] text-[2.1rem] sm:text-[2.7rem] lg:text-[3.2rem] ${
          dark ? "text-white" : "text-brand-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-[1.05rem] sm:text-lg leading-relaxed ${
            dark ? "text-white/65" : "text-brand-muted"
          } ${isCenter ? "mx-auto max-w-2xl" : "max-w-xl"}`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}
