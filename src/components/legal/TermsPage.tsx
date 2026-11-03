import React from 'react';
import { LegalLayout } from './LegalLayout';

export const TermsPage: React.FC = () => {
  return (
    <LegalLayout
      title="Terminos de Servicio"
      subtitle="Condiciones que rigen el uso de la plataforma Dentiqly."
      lastUpdated="13 de mayo de 2026"
      seoDescription="Términos y condiciones de uso de Dentiqly, el software de gestión dental para clínicas odontológicas en Argentina."
      seoCanonical="/terminos"
    >
      <h2>1. Aceptacion de los terminos</h2>
      <p>
        Al acceder y utilizar Dentiqly ("la Plataforma"), aceptas estar sujeto a estos Terminos de Servicio.
        Si no estas de acuerdo con alguno de estos terminos, no debes utilizar la Plataforma.
        Estos terminos aplican a todos los usuarios, incluyendo administradores de clinica, profesionales
        y pacientes.
      </p>

      <h2>2. Descripcion del servicio</h2>
      <p>
        Dentiqly es una plataforma SaaS (Software como Servicio) de gestion para clinicas dentales que incluye:
      </p>
      <ul>
        <li>Gestion de agenda y turnos con recordatorios por email.</li>
        <li>Historias clinicas digitales y odontograma interactivo.</li>
        <li>Facturacion y control de caja.</li>
        <li>Portal de pacientes para autoservicio.</li>
        <li>Panel multi-sucursal centralizado.</li>
        <li>Almacenamiento de archivos clinicos.</li>
      </ul>

      <h2>3. Registro y cuentas</h2>
      <p>
        Para utilizar Dentiqly, debes crear una cuenta proporcionando informacion veraz y actualizada.
        Eres responsable de:
      </p>
      <ul>
        <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
        <li>Todas las actividades que ocurran bajo tu cuenta.</li>
        <li>Notificarnos inmediatamente sobre cualquier uso no autorizado.</li>
        <li>Asegurar que solo personal autorizado acceda a datos de pacientes.</li>
      </ul>

      <h2>4. Uso aceptable</h2>
      <p>Te comprometes a utilizar Dentiqly unicamente para fines legitimos de gestion dental. Queda prohibido:</p>
      <ul>
        <li>Utilizar la plataforma para actividades ilegales o no autorizadas.</li>
        <li>Intentar acceder a datos de otros tenants o clinicas.</li>
        <li>Realizar ingenieria inversa, descompilar o modificar el software.</li>
        <li>Compartir credenciales de acceso con terceros no autorizados.</li>
        <li>Utilizar la plataforma para enviar comunicaciones no deseadas o spam.</li>
        <li>Sobrecargar intencionalmente los servidores o la infraestructura.</li>
      </ul>

      <h2>5. Datos clinicos y responsabilidad profesional</h2>
      <p>
        Dentiqly proporciona herramientas de gestion, pero <strong>no reemplaza el juicio clinico profesional</strong>.
        La clinica y sus profesionales son los unicos responsables de:
      </p>
      <ul>
        <li>La precision y veracidad de los datos clinicos ingresados.</li>
        <li>Las decisiones medicas basadas en la informacion almacenada.</li>
        <li>El cumplimiento de las regulaciones de salud aplicables en su jurisdiccion.</li>
        <li>La obtencion del consentimiento informado de los pacientes.</li>
      </ul>

      <h2>6. Suscripcion y pagos</h2>
      <p>
        Dentiqly ofrece planes de suscripcion mensual. Al suscribirte:
      </p>
      <ul>
        <li>Aceptas el precio vigente al momento de la contratacion.</li>
        <li>La suscripcion se renueva automaticamente cada mes.</li>
        <li>Puedes cancelar en cualquier momento; el acceso continuara hasta el fin del periodo pagado.</li>
        <li>Los precios pueden actualizarse con 30 dias de aviso previo.</li>
        <li>No se realizan reembolsos por periodos parciales.</li>
      </ul>

      <h2>7. Propiedad intelectual</h2>
      <p>
        Todo el software, diseno, marcas y contenido de Dentiqly son propiedad exclusiva de Dentiqly.
        El uso de la plataforma no te otorga derechos de propiedad intelectual sobre nuestro software
        o contenido. Los datos que ingresas en la plataforma siguen siendo de tu propiedad.
      </p>

      <h2>8. Disponibilidad del servicio</h2>
      <p>
        Nos esforzamos por mantener una disponibilidad del 99.9%. Sin embargo, el servicio puede
        interrumpirse temporalmente por mantenimiento programado, actualizaciones o causas de fuerza mayor.
        Te notificaremos con antelacion sobre mantenimientos planificados.
      </p>

      <h2>9. Limitacion de responsabilidad</h2>
      <p>
        Dentiqly no sera responsable por danos indirectos, incidentales, especiales o consecuentes
        derivados del uso o la imposibilidad de uso de la plataforma. Nuestra responsabilidad total
        no excedera el monto pagado por la suscripcion en los ultimos 12 meses.
      </p>

      <h2>10. Terminacion</h2>
      <p>
        Podemos suspender o terminar tu acceso a Dentiqly si violas estos terminos o si detectamos
        actividad sospechosa. En caso de terminacion, tendras acceso a exportar tus datos durante
        30 dias despues de la suspension.
      </p>

      <h2>11. Ley aplicable</h2>
      <p>
        Estos terminos se rigen por las leyes de la Republica Argentina. Cualquier disputa sera
        resuelta por los tribunales competentes de la Ciudad Autonoma de Buenos Aires.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Para consultas sobre estos Terminos de Servicio:{' '}
        <a href="mailto:legal@dentiqly.com">legal@dentiqly.com</a>
      </p>
    </LegalLayout>
  );
};
