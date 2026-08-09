import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import { ConsentSettings } from './ConsentSettings';

export const CookiesPage: React.FC = () => {
  return (
    <LegalLayout
      title="Politica de Cookies"
      subtitle="Como utilizamos cookies y tecnologias similares en nuestra plataforma."
      lastUpdated="13 de mayo de 2026"
      seoDescription="Política de cookies de Dentiqly. Información sobre el uso de cookies en nuestro software de gestión dental."
      seoCanonical="/cookies"
    >
      <h2>1. Que son las cookies?</h2>
      <p>
        Las cookies son pequenos archivos de texto que se almacenan en tu dispositivo cuando visitas
        nuestra plataforma. Nos permiten recordar tus preferencias, mantener tu sesion activa y
        mejorar tu experiencia de uso.
      </p>

      <h2>2. Tipos de cookies que utilizamos</h2>

      <h3>Cookies esenciales</h3>
      <p>
        Estas cookies son necesarias para el funcionamiento basico de la plataforma. Sin ellas,
        no podrias iniciar sesion ni navegar entre las secciones. No requieren consentimiento
        ya que son indispensables para el servicio.
      </p>
      <ul>
        <li><strong>Sesion de usuario:</strong> mantiene tu sesion activa mientras usas Dentiqly.</li>
        <li><strong>Token de autenticacion:</strong> verifica tu identidad de forma segura.</li>
        <li><strong>Preferencias de tenant:</strong> identifica tu clinica en el sistema multi-tenant.</li>
        <li><strong>CSRF token:</strong> proteccion contra ataques de falsificacion de solicitudes.</li>
      </ul>

      <h3>Cookies de rendimiento</h3>
      <p>
        Nos ayudan a entender como interactuas con la plataforma para mejorar la experiencia:
      </p>
      <ul>
        <li><strong>Analiticas:</strong> recopilan estadisticas anonimas sobre el uso de funcionalidades.</li>
        <li><strong>Rendimiento:</strong> miden tiempos de carga y detectan problemas tecnicos.</li>
      </ul>

      <h3>Cookies de funcionalidad</h3>
      <p>
        Permiten recordar tus preferencias para personalizar tu experiencia:
      </p>
      <ul>
        <li><strong>Preferencias de interfaz:</strong> tema visual, idioma, zona horaria.</li>
        <li><strong>Ultima vista:</strong> recuerda la seccion donde estabas trabajando.</li>
        <li><strong>Configuracion de agenda:</strong> vista preferida (dia, semana, mes).</li>
      </ul>

      <h2>3. Cookies de terceros</h2>
      <p>
        Algunos servicios externos que utilizamos pueden colocar sus propias cookies:
      </p>
      <ul>
        <li><strong>Pasarela de pagos:</strong> para procesar transacciones de forma segura.</li>
        <li><strong>Servicios de soporte:</strong> para ofrecer asistencia en tiempo real.</li>
      </ul>
      <p>
        No utilizamos cookies de publicidad ni de seguimiento de terceros para fines de marketing.
      </p>

      <h2>4. Duracion de las cookies</h2>
      <ul>
        <li><strong>Cookies de sesion:</strong> se eliminan automaticamente al cerrar el navegador.</li>
        <li><strong>Cookies persistentes:</strong> permanecen hasta 12 meses o hasta que las elimines manualmente.</li>
      </ul>

      <h2>5. Como gestionar las cookies</h2>
      <p>
        Podes cambiar cuando quieras tu decision sobre las cookies de analitica desde aca mismo.
        El cambio se aplica de inmediato.
      </p>

      <ConsentSettings />

      <p>
        Tambien podes controlar y eliminar cookies a traves de la configuracion de tu navegador.
        Ten en cuenta que deshabilitar las cookies esenciales puede impedir el correcto
        funcionamiento de la plataforma.
      </p>
      <ul>
        <li><strong>Chrome:</strong> Configuracion &gt; Privacidad y seguridad &gt; Cookies</li>
        <li><strong>Firefox:</strong> Preferencias &gt; Privacidad &gt; Cookies</li>
        <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Gestionar datos del sitio</li>
        <li><strong>Edge:</strong> Configuracion &gt; Cookies y permisos del sitio</li>
      </ul>

      <h2>6. Almacenamiento local</h2>
      <p>
        Ademas de cookies, utilizamos el almacenamiento local del navegador (localStorage) para
        guardar tokens de autenticacion y preferencias de la aplicacion. Este almacenamiento es
        necesario para el funcionamiento de la plataforma como aplicacion web.
      </p>

      <h2>7. Actualizaciones</h2>
      <p>
        Esta politica puede actualizarse periodicamente. Consulta la fecha de ultima actualizacion
        en la parte superior de esta pagina. Para mas informacion sobre como protegemos tu privacidad,
        visita nuestra <Link to="/privacidad">Politica de Privacidad</Link>.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Si tienes preguntas sobre nuestra Politica de Cookies:{' '}
        <a href="mailto:privacidad@dentiqly.com">privacidad@dentiqly.com</a>
      </p>
    </LegalLayout>
  );
};
