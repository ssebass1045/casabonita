import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from './Card';
import Seo, { buildBreadcrumbSchema } from './Seo';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface Employee {
  id: number;
  name: string;
  specialty?: string;
  description?: string;
  imageUrl?: string;
}

const Members: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get<Employee[]>(`${API_BASE_URL}/employees`);
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <section className="section reveal">
      <Seo
        title="Equipo de Especialistas en Belleza en Caldas, Antioquia"
        description="Conoce al equipo de especialistas de Casa Bonita Centro Estetico en Caldas, Antioquia, enfocado en belleza, cuidado de la piel y bienestar."
        path="/members"
        keywords={[
          'equipo de spa',
          'especialistas en belleza',
          'cosmetologia',
          'profesionales estetica',
          'equipo estetico caldas antioquia',
        ]}
        structuredData={buildBreadcrumbSchema([
          { name: 'Inicio', path: '/' },
          { name: 'Equipo', path: '/members' },
        ])}
      />

      <div className="section-kicker">Especialistas</div>
      <h1 className="section-title">Nuestro equipo de belleza en Caldas, Antioquia</h1>
      <p className="section-description">
        Profesionales comprometidos con una atencion cercana, segura y enfocada
        en resultados.
      </p>
      <h2 className="subsection-title">Expertos en cuidado facial, corporal y bienestar</h2>

      {isLoading ? (
        <p>Cargando especialistas...</p>
      ) : (
        <div className="cards-grid">
          {employees.length > 0 ? (
            employees.map((employee) => (
              <Card
                key={employee.id}
                title={employee.name}
                description={`${employee.specialty || 'Especialista'}. ${employee.description || ''}`}
                imageUrl={employee.imageUrl}
                className="card--lux"
                eyebrow={employee.specialty || 'Especialista'}
              />
            ))
          ) : (
            <p>Pronto mostraremos a todo nuestro equipo de especialistas.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Members;
