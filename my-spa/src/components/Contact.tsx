import React from 'react';
import Seo, { buildBreadcrumbSchema } from './Seo';

const whatsappUrl = 'https://wa.me/573217571992';
const googleSearchBusinessUrl =
  'https://www.google.com/search?q=Casa+Bonita+Centro+Estetico+Caldas+Antioquia';

const Contact: React.FC = () => {
  return (
    <section className="section reveal">
      <Seo
        title="Contacto y Reservas en Caldas, Antioquia"
        description="Contacta a Casa Bonita Centro Estetico en Caldas, Antioquia por WhatsApp, correo o redes sociales para reservar tratamientos de belleza y bienestar."
        path="/contact"
        keywords={[
          'contacto spa',
          'reservar tratamiento',
          'whatsapp centro estetico',
          'casa bonita contacto',
          'contacto caldas antioquia',
        ]}
        structuredData={buildBreadcrumbSchema([
          { name: 'Inicio', path: '/' },
          { name: 'Contacto', path: '/contact' },
        ])}
      />

      <div className="section-kicker">Agenda tu cita</div>
      <h1 className="section-title">Contacto y Reservas en Caldas, Antioquia</h1>
      <p className="section-description">
        Agenda tu experiencia en Casa Bonita Centro Estetico y recibe atencion
        personalizada para tratamientos de belleza, cuidado de la piel y
        bienestar.
      </p>

      <h2 className="subsection-title">Canales para reservar y ubicar el negocio</h2>

      <div className="contact-info-grid">
        <a className="contact-info-card" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <strong>WhatsApp</strong>
          <span>+57 321 757 1992</span>
        </a>

        <a className="contact-info-card" href="mailto:casabonitacentroestetico@gmail.com">
          <strong>Correo</strong>
          <span>casabonitacentroestetico@gmail.com</span>
        </a>

        <a
          className="contact-info-card"
          href="https://www.instagram.com/casabonitacentroestetico/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>Instagram</strong>
          <span>@casabonitacentroestetico</span>
        </a>

        <a
          className="contact-info-card"
          href={googleSearchBusinessUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>Google</strong>
          <span>Ver ficha del negocio</span>
        </a>
      </div>
    </section>
  );
};

export default Contact;
