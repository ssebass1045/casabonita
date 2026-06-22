import React from 'react';
import { Link } from 'react-router-dom';
import Seo, { buildBreadcrumbSchema } from './Seo';

const About: React.FC = () => {
  return (
    <section className="section reveal">
      <Seo
        title="Sobre Casa Bonita Centro Estetico en Caldas, Antioquia"
        description="Conoce Casa Bonita Centro Estetico, un espacio de belleza, bienestar y cuidado personalizado en Caldas, Antioquia."
        path="/about"
        keywords={[
          'sobre casa bonita',
          'centro estetico',
          'spa de belleza',
          'bienestar personalizado',
          'caldas antioquia',
        ]}
        structuredData={buildBreadcrumbSchema([
          { name: 'Inicio', path: '/' },
          { name: 'Conoce Casa Bonita', path: '/about' },
        ])}
      />

      <div className="section-kicker">Nuestra esencia</div>
      <h1 className="section-title">Conoce Casa Bonita en Caldas, Antioquia</h1>
      <p className="section-description">
        En Casa Bonita Centro Estetico creamos experiencias de belleza y
        bienestar pensadas para cuidar tu piel, tu energia y tu confianza con
        una atención cercana y profesional.
      </p>

      <div className="about-content-block">
        <h2>Nuestra propuesta de valor</h2>
        <p>
          Nuestro enfoque combina trato humano, evaluacion personalizada y
          tratamientos diseñados para las necesidades reales de cada cliente.
          Nos especializamos en cuidado facial, tratamientos corporales,
          depilacion, belleza integral y rutinas que elevan tu bienestar en
          Caldas, Antioquia.
        </p>
        <h3>Más que estética, bienestar integral</h3>
        <p>
          Queremos que cada visita se sienta como una pausa consciente: un lugar
          donde la belleza se trabaja con tecnica, calidez y resultados.
        </p>
      </div>

      <div className="section-cta-row">
        <Link to="/treatments" className="elementor-button book-now">
          Ver tratamientos
        </Link>
      </div>
    </section>
  );
};

export default About;
