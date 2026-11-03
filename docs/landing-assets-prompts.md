# Assets visuales para la landing de Dentiqly — prompts para generar con GPT

La landing nueva es 100% vectorial (mini-interfaces en código, sin fotos de stock), así que funciona
tal cual está. Estos assets son **opcionales**: suman identidad, pero no hay ningún placeholder
roto esperándolos. Están ordenados por impacto.

## Reglas comunes para todos los prompts

Pegá este bloque al inicio de cada prompt para mantener consistencia:

```
Estilo de marca Dentiqly (software de gestión para clínicas dentales):
- Paleta: azul eléctrico #2563FF como protagonista, azul claro #63B3FF para brillos,
  navy profundo #0B1023 para sombras/fondos oscuros, blanco #FFFFFF y gris #F5F7FA.
- Estética: limpia, moderna, premium, minimalista. Mucho aire. Superficies de vidrio
  esmerilado y plástico brillante con degradados suaves azul→celeste. Sombras suaves y largas.
- Iluminación de estudio, suave, desde arriba-izquierda. Sin ruido, sin textura grunge.
- Nada de texto dentro de la imagen (lo agregamos nosotros en código).
- Nada de logos inventados ni marcas de terceros.
- Fondo transparente (PNG con alpha) salvo que se indique lo contrario.
```

---

## 1. Imagen para compartir en redes (OG image) — PRIORIDAD ALTA

**Por qué:** hoy `og-image.png` es una captura cruda del dashboard de 1,7 MB. Es lo primero que ve
un lead cuando le pasan el link por WhatsApp, Instagram o LinkedIn.

**Dónde va:** reemplaza `public/assets/og-image.png`. Tamaño final 1200×630 px, PNG o JPG < 300 KB.

**Prompt:**

```
[bloque de estilo]

Imagen horizontal 1200x630 para compartir en redes sociales. Fondo con degradado radial de
blanco (#FFFFFF) a celeste muy claro (#EEF3FF), con una grilla sutil de puntos grises apenas
visible. En el centro-derecha, una laptop moderna vista en ligera perspectiva 3/4 mostrando una
agenda semanal de turnos con bloques de colores pastel (verde, azul, violeta, ámbar), barra
lateral oscura navy a la izquierda de la pantalla y un botón azul #2563FF arriba a la derecha.
Alrededor de la laptop flotan dos tarjetas blancas con sombra suave: una con un ícono de sobre
verde (recordatorio enviado) y otra con un ícono de calendario azul (nueva reserva). Un resplandor
azul suave detrás de la laptop. El tercio izquierdo de la imagen queda LIBRE y limpio para que
nosotros pongamos el titular y el logo después. Sin texto legible en la pantalla (usar bloques
y líneas abstractas en lugar de palabras). Fotorrealista, render 3D de producto, 8k.
```

**Después de generar:** en Figma/Canva, ponele a la izquierda el logo real (`public/assets/dentiqly-logo.png`)
y el titular en Bricolage Grotesque Bold: "Tu clínica dental, ordenada y en piloto automático." con
"piloto automático." en #2563FF. Exportá a 1200×630.

---

## 2. Diente 3D de marca (hero / sección de cierre) — PRIORIDAD MEDIA

**Por qué:** el brand kit ya define un diente blanco brillante con el swoosh azul del isotipo. Un
render limpio de eso, en transparente, sirve como "mascota" visual en la sección navy de cierre
(a la derecha del titular "Empezá a ordenar tu clínica hoy mismo", detrás del formulario) o en
posts de Instagram.

**Dónde va:** `public/assets/brand/tooth-3d.png`, 1600×1600 px, PNG transparente, < 400 KB
(convertir a WebP si pesa más). Para usarlo en la landing: agregá un `<img>` decorativo con
`pointer-events-none` y opacidad 0.9 en `CtaSection.tsx`, posicionado absoluto abajo a la
derecha, oculto en mobile.

**Prompt:**

```
[bloque de estilo]

Render 3D de un molar estilizado, blanco perlado y brillante, superficie lisa tipo porcelana
con reflejos suaves, ligeramente rotado 15 grados hacia la derecha. Detrás del diente, una
pincelada curva (swoosh) en azul #2563FF con degradado a #63B3FF que lo abraza desde abajo a la
izquierda hasta arriba a la derecha, con un pequeño destello de estrella de cuatro puntas en
el extremo superior derecho. Estilo ícono 3D premium tipo app de salud moderna, sin cara ni
ojos, nada caricaturesco. Fondo transparente. Vista frontal con leve picado. Luz suave de
estudio. Ultra limpio, 4k.
```

---

## 3. Set de íconos 3D para "Cómo empezar" y "Seguridad" — PRIORIDAD MEDIA

**Por qué:** hoy esas secciones usan íconos de línea (Lucide). Un set 3D consistente en vidrio azul
les da el toque premium del brand kit (sección "08. Estilo visual").

**Dónde van:** `public/assets/icons-3d/<nombre>.png`, 512×512 px cada uno, PNG transparente,
< 60 KB cada uno (pasar por TinyPNG o convertir a WebP). Reemplazan el `<Icon>` de Lucide en
`StepsSection.tsx` (3 íconos) y `SecuritySection.tsx` (4 íconos).

Generar los 7 **en una sola conversación** para mantener el estilo, con este prompt base y
cambiando solo la línea del objeto:

```
[bloque de estilo]

Ícono 3D aislado sobre fondo transparente, encuadre cuadrado 1:1 centrado, mismo ángulo de
cámara para toda la serie (vista frontal con 20 grados de picado). Material: vidrio azul
translúcido #2563FF con bordes redondeados, reflejos blancos suaves y un leve brillo interno
celeste #63B3FF. Sombra de contacto suave debajo. Sin texto. Estilo glassmorphism premium,
consistente con una serie de íconos de app.

Objeto: [VER LISTA]
```

Lista de objetos (uno por imagen):

| Archivo | Objeto a describir |
|---|---|
| `step-account.png` | una tarjeta de perfil de usuario con un signo "+" flotando a su derecha |
| `step-migrate.png` | una hoja de cálculo plana de la que salen tres fichas volando hacia una nube pequeña |
| `step-link.png` | dos eslabones de cadena unidos formando un link, con un pequeño calendario detrás |
| `sec-lock.png` | un candado cerrado con el arco plateado y el cuerpo de vidrio azul |
| `sec-layers.png` | tres capas cuadradas apiladas con separación, la del medio resaltada |
| `sec-database.png` | un cilindro de base de datos con tres anillos y un tilde verde pequeño al frente |
| `sec-cloud.png` | una nube redondeada con un escudo pequeño integrado en su parte inferior derecha |

---

## 4. Foto de ambiente para "Sobre nosotros" — PRIORIDAD BAJA

**Por qué:** la landing no usa fotos a propósito (las de stock eran lo más genérico que tenía).
Pero la página `/sobre-nosotros` sí se beneficia de una imagen de ambiente real.
**No generar personas identificables ni "testimonios" con caras inventadas**: eso resta confianza
y es fácil de detectar.

**Dónde va:** `public/assets/about/clinic-ambient.jpg`, 1600×1067 px (3:2), JPG calidad 80, < 250 KB.

**Prompt:**

```
[bloque de estilo, sin la regla de fondo transparente]

Fotografía editorial de la recepción de una clínica dental moderna y luminosa, vista desde el
mostrador. Sobre el mostrador, una tablet apoyada en un soporte muestra una interfaz de agenda
con una barra lateral navy oscuro y bloques de turnos de colores pastel (sin texto legible).
Al lado, un teléfono con una notificación azul desenfocada. Madera clara, paredes blancas, una
planta, luz natural de ventana a la izquierda. Sin personas en primer plano; si hay alguien,
que esté de espaldas y desenfocado al fondo. Profundidad de campo corta, 35 mm, tonos cálidos
neutros con acentos azules. Fotorrealista.
```

---

## 5. Creativos para anuncios y posts (lead generation) — PRIORIDAD ALTA si hacés ads

**Por qué:** la landing convierte; los anuncios traen el tráfico. Estos usan la misma identidad
para que el lead sienta continuidad entre el anuncio y la página.

**Dónde van:** no van al repo; son para Meta Ads / Instagram. Formato 1:1 (1080×1080) y 4:5
(1080×1350). Pedir ambos.

**Prompt A — "Antes / Después":**

```
[bloque de estilo, sin la regla de fondo transparente]

Composición cuadrada 1080x1080 dividida verticalmente en dos mitades. Mitad izquierda: fondo
gris claro #F5F7FA, un escritorio desordenado visto desde arriba con una agenda de papel llena
de tachaduras, post-its, un teléfono con muchas notificaciones y una calculadora. Estilo render
3D isométrico, colores apagados. Mitad derecha: fondo blanco limpio con resplandor azul suave,
una tablet flotando mostrando una agenda semanal ordenada con bloques de colores pastel y una
tarjeta flotante con un tilde verde. Estilo render 3D isométrico, luminoso. Una línea diagonal
suave separa las mitades. Tercio superior de la imagen libre para titular. Sin texto.
```

**Prompt B — "Producto hero":**

```
[bloque de estilo, sin la regla de fondo transparente]

Composición vertical 1080x1350. Fondo navy profundo #0B1023 con un resplandor radial azul
#2563FF en el centro y una grilla de puntos muy sutil. En el centro, un smartphone moderno visto
de frente con leve inclinación, mostrando una pantalla de reserva de turno online: selector de
fecha, grilla de horarios con uno resaltado en azul y un botón oscuro de confirmar (sin texto
legible, usar bloques). Alrededor del teléfono flotan tres tarjetas blancas pequeñas con íconos:
sobre verde, calendario azul, gráfico de barras. Mitad inferior de la imagen libre para titular
y botón. Render 3D premium, 8k.
```

---

## Checklist antes de subir cualquier asset

- [ ] Pesa menos de lo indicado (usar [squoosh.app](https://squoosh.app) → WebP o PNG optimizado).
- [ ] Fondo realmente transparente (abrilo sobre fondo oscuro y mirá los bordes).
- [ ] No tiene texto generado por la IA (suele salir con errores de ortografía).
- [ ] No tiene caras de personas inventadas presentadas como clientes o equipo.
- [ ] Los azules coinciden con #2563FF (si salió violeta o cian, pedí "más azul eléctrico puro").
