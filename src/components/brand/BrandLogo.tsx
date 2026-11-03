import type { ImgHTMLAttributes } from "react";
import { brand } from "../../config/brand";

interface BrandLogoProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  tone?: "default" | "inverse";
  variant?: "full" | "mark";
}

/** One identity across the public site, workspaces, booking and patient portal. */
export function BrandLogo({
  tone = "default",
  variant = "full",
  className = "",
  alt = brand.name,
  ...props
}: BrandLogoProps) {
  const isMark = variant === "mark";
  const src = isMark
    ? tone === "inverse"
      ? brand.assets.markInverse
      : brand.assets.mark
    : tone === "inverse"
      ? brand.assets.logoInverse
      : brand.assets.logo;

  return (
    <img
      width={isMark ? 208 : 900}
      height={isMark ? 256 : 240}
      {...props}
      src={src}
      alt={alt}
      className={`dentiqly-brand-logo ${className}`}
      data-brand-tone={tone}
      data-brand-variant={variant}
      decoding="async"
    />
  );
}
