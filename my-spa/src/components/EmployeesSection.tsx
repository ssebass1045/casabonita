// File: my-spa/src/components/EmployeesSection.tsx
import React from 'react';
import Card from './Card';

interface Employee {
  id: number;
  name: string;
  specialty?: string;
  description?: string;
  imageUrl?: string;
}

// --- ¡ASEGÚRATE DE QUE ESTA INTERFAZ ESTÉ ASÍ! ---
interface EmployeesSectionProps {
  employees: Employee[];
}

const EmployeesSection: React.FC<EmployeesSectionProps> = ({ employees }) => {
  return (
    <section id="employees" className="section section-alt-background">
      <h2 className="section-title">Nuestro Equipo</h2>
      <div className="cards-grid">
        {employees.map(employee => (
          <Card
            key={employee.id}
            title={employee.name}
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
