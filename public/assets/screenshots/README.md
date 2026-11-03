# Capturas reales del producto

Las imágenes `product-*-v3` son capturas de navegador de la aplicación React de Dentiqly, tomadas desde la ruta pública `/demo`. Se conserva la interfaz que ve el usuario: tipografía, navegación, tablas, agenda, ficha clínica, visor de odontogramas y caja. Los datos pertenecen al entorno de demostración.

No se usó generación de imágenes para reconstruir o inventar pantallas. Las versiones WebP son exportaciones optimizadas de las capturas. Las imágenes `*-detail.webp` provienen de una segunda captura del área de contenido real, o del visor clínico abierto, para su presentación en tarjetas pequeñas. Los PNG conservan el encuadre completo.

Vistas disponibles: dashboard, agenda semanal, ficha del paciente, odontograma abierto y caja con el histórico de movimientos. La agenda semanal y el período histórico se seleccionan usando los controles normales del producto. La guía inicial del dashboard se oculta mediante su preferencia de sesión.

`capture-manifest.json` registra fecha, dimensiones, encuadre y archivos de cada captura.

## Volver a capturar

1. Iniciar el frontend con Vite.
2. Disponer de `playwright-core` y Chromium. Si no están en las ubicaciones habituales, indicar `DENTIQLY_PLAYWRIGHT_MODULE` y `DENTIQLY_BROWSER_PATH`.
3. Ejecutar `node scripts/capture-product.mjs http://localhost:5173` desde `Dentiqly-FE`, adaptando el puerto al servidor local.

El script navega la demo sin acceder a historias clínicas de producción ni modificar registros.
