// File: my-spa/src/components/EmployeesSection.tsx
import React from 'react';
import Card from './Card'; // Importa el componente Card

interface Employee {
  id: number;
  name: string;
  specialty?: string;
  description?: string;
  imageUrl?: string;
}

interface EmployeesSectionProps {
  employees: Employee[];
}

const EmployeesSection: React.FC<EmployeesSectionProps> = ({ employees }) => {
  const sectionStyle: React.CSSProperties = {
    padding: '40px 20px',
    textAlign: 'center',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
    justifyItems: 'center',
  };

  return (
    <section id="employees" style={sectionStyle}>
      <h2>Nuestro Equipo</h2>
      <div style={gridStyle}>
        {employees.map(employee => (
          <Card
            key={employee.id}
            title={employee.name}
            // Combina especialidad y descripción para una bio completa
            description={`${employee.specialty || 'Especialista'}. ${employee.description || ''}`}
            imageUrl={employee.imageUrl}
            // No incluimos botón para esta tarjeta
          />
        ))}
      </div>
    </section>
  );
};

export default EmployeesSection;
