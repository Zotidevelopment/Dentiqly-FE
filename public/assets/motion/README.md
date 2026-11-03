# Demos animadas de Dentiqly

Cuatro piezas originales de motion design, creadas para esta landing. Son
demostraciones ilustrativas con datos ficticios, basadas en los flujos y la
identidad del producto. No son grabaciones de pantalla. Las capturas reales
siguen disponibles en `../screenshots/` y desde «Ver pantalla real».

| Archivo | Secuencia |
| --- | --- |
| `booking-loop.webm` | Elegir día y horario → enviar solicitud → confirmación |
| `agenda-loop.webm` | Buscar paciente → elegir profesional y horario → guardar turno |
| `patient-loop.webm` | Abrir ficha → odontograma → seleccionar pieza → guardar |
| `finance-loop.webm` | Ingresar importe → transferencia → registrar ingreso |

Cada video dura 8 segundos, mide 1120 × 840 y usa VP8/WebM sin audio a 15 fps.
El cierre vuelve mediante una disolvencia al estado inicial. Los cuatro
archivos suman aproximadamente 0,9 MB. Los posters WebP tienen su original PNG.
Los íconos SVG originales están en `../icons/` y comparten el componente
`src/components/landing/ui/ProductIcon.tsx`.

## Reproducción

`ProductMotion.tsx` reproduce en bucle cuando la pieza entra en pantalla y la
pestaña está visible. Se pausa fuera de pantalla y permite pausar/reanudar.
Con `prefers-reduced-motion: reduce`, empieza detenida y requiere reproducción
explícita. El poster funciona como vista previa durante la carga.

## Regenerar

Con Vite iniciado, ejecutar desde la raíz del frontend:

```powershell
$env:DENTIQLY_PLAYWRIGHT_MODULE = 'ruta/al/modulo/playwright-core'
$env:DENTIQLY_BROWSER_PATH = 'ruta/a/chrome.exe'
$env:DENTIQLY_FFMPEG = 'ruta/a/ffmpeg.exe'
node scripts/render-product-motion.mjs http://127.0.0.1:5174
```

Playwright y FFmpeg pueden provenir del entorno; no se agregan dependencias
al proyecto. El renderer compone cada cuadro desde `MotionScene.tsx` y
`motion-scene.css`, exporta fuera del árbol observado por Vite y copia los
archivos terminados al directorio público. El estudio de render no se importa
desde la aplicación ni se incluye en el bundle público.

Opciones: `DENTIQLY_MOTION_VARIANTS=booking,agenda` limita las piezas;
`DENTIQLY_MOTION_POSTERS_ONLY=1` genera únicamente posters. Para verificar
videos, controles, accesibilidad de movimiento, navegación y tamaños:

```powershell
node scripts/check-product-motion.mjs http://127.0.0.1:5174
```
