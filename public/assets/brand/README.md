# Dentiqly · Identidad v2

Generada con la herramienta integrada `image_gen`. Se conserva el nombre Dentiqly; el logotipo lo representa en minúsculas. El símbolo combina una d con un diente en su espacio interior.

- `dentiqly-logo-v2.png`: logotipo horizontal para fondos claros; PNG con transparencia, 2172 × 724. Aplicado al encabezado y pie de la landing.
- `dentiqly-symbol-v2.png`: símbolo independiente; PNG con transparencia, 1254 × 1254.
- `dentiqly-logo-dark-v2.png`: composición para fondos oscuros; PNG con fondo azul marino, 2167 × 726. Esta variante tiene fondo propio, no transparencia.

Los archivos originales anteriores se conservan. Son imágenes de mapa de bits, no archivos vectoriales.

## Uso en el sistema

La identidad está centralizada en `src/config/brand.ts` y el componente `src/components/brand/BrandLogo.tsx`.

- Las pantallas usan las exportaciones WebP optimizadas; las variantes blancas conservan la silueta y la transparencia del original, sin volver a generar sus formas.
- `icons/` contiene el favicon en 16, 32, 48 y 64 píxeles, el ícono de Apple de 180 píxeles y los íconos de instalación de 192 y 512 píxeles. La variante `maskable` tiene márgenes de protección propios.
- `/favicon.ico` incluye las cuatro resoluciones del navegador.
- `dentiqly-social-v2.png` es la imagen de 1200 × 630 píxeles para compartir enlaces.
- `dentiqly-logo-white-v2.png` es la variante transparente compatible con los correos del sistema.
- `src/brand.css` aplica la tipografía, las superficies y los detalles de marca compartidos.

Para reproducir estas adaptaciones mecánicas a partir de los PNG originales, ejecutar `node scripts/build-brand-assets.mjs` desde `Dentiqly-FE`. El script usa la instalación de `sharp` disponible en el proyecto y conserva los originales.

## Prompts finales

### Logotipo principal

Use case: logo-brand. Create one finished horizontal brand logo for Dentiqly, a professional dental practice management SaaS. Intended use: website header and footer on white and pale #EAF2FF backgrounds. Exact text: "dentiqly" in all lowercase, spelled d-e-n-t-i-q-l-y, no additional words. Design a sophisticated, memorable blue emblem at left combining a lowercase d silhouette with a restrained dental arch/tooth suggestion in its negative space. Smooth rounded geometric construction, excellent small-size readability, no tiny details. Wordmark at right in deep navy #0B2440, medium-semibold humanist sans serif closely compatible with Instrument Sans; careful custom kerning and open counters, subtle personality in q and y. Icon in solid royal blue #2458ED. Visually balanced horizontal lockup, emblem approximately the height of the lowercase wordmark ascenders. Flat vector-like edges, meticulous professional identity design. Real transparent background with alpha, absolutely no gradient, shadow, gloss, 3D, sparkle, medical cross, stock smiling cartoon tooth, tagline, border, page mockup or watermark. Only ONE logo, centered, large in a wide composition, modest transparent padding. Do not make a brand board or alternate versions.

### Símbolo

Use case: logo-brand. Input image is the exact approved identity to derive from. Create a standalone app icon asset by retaining ONLY the blue d emblem with its tooth-shaped transparent negative space from the LEFT side of the reference image. Remove the entire wordmark; no letters or text beyond the original emblem's d silhouette. Preserve the emblem geometry exactly. Center that emblem on a SQUARE truly transparent canvas, fill 80 percent of the width/height with balanced 10 percent margins. Solid royal blue #2458ED, crisp flat edges, no gradient, no shadow, no added enclosing tile, no glow, no textures, no mockup. The interior tooth cutout must remain transparent, not white.

### Versión para fondos oscuros

Use case: logo-brand. Input image role: brand identity reference, not an edit target. Create a NEW clean dark-background brand asset for this exact Dentiqly identity. Entire canvas is uniform solid dark navy #0B2440. Center ONE horizontal logo: on the left, the same royal blue #2458ED lowercase d emblem with its tooth-shaped counter cut out to show the navy background; on the right the same bold rounded humanist sans serif lowercase word "dentiqly" in pure white. Spell exactly d-e-n-t-i-q-l-y. Preserve the identity's emblem silhouette, letter shapes, spacing and balance from the reference, but draw fresh smooth pristine vector-style shapes, not distressed photo textures. The reference's dark wordmark becomes crisp WHITE with clean open letter counters. Wide landscape composition, generous but not excessive margin. Everything is opaque; no transparency, no gradient, no texture, no shadows, no 3D, no mockup, no extra text, absolutely no speckles. Clean brand presentation on one flat dark navy field.
