import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './brand.css';
import './i18n';

import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAuth.tsx';
import { initTracking } from './lib/tracking';

// Carga GA4 y el Pixel de Meta antes del primer render, para que el page_view
// inicial que emite RouteTracker encuentre los dos destinos ya en pie.
initTracking();

// Después de un deploy, una pestaña abierta todavía pide los chunks viejos
// (otro hash) y falla el import dinámico. Recargamos una vez para traer la
// versión nueva; el sessionStorage evita un bucle si el error sigue.
window.addEventListener('vite:preloadError', (event) => {
  const clave = 'dentiqly:recarga-por-deploy';
  const ultima = Number(sessionStorage.getItem(clave) || 0);
  if (Date.now() - ultima < 10_000) return;
  event.preventDefault();
  sessionStorage.setItem(clave, String(Date.now()));
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
