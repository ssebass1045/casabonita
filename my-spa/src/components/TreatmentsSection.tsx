// File: my-spa/src/components/TreatmentsSection.tsx
import React from 'react';
import Card from './Card'; // Importa el componente Card

interface Treatment {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface TreatmentsSectionProps {
  treatments: Treatment[];
}

const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({ treatments }) => {
  const handleRequestAppointment = (treatmentName: string) => {
    const message = `¡Hola! Me gustaría pedir una cita para el tratamiento de "${treatmentName}".`;
    const whatsappUrl = `https://wa.me/573101234567?text=${encodeURIComponent(message)}`; // Reemplaza con tu número de WhatsApp
    window.open(whatsappUrl, '_blank');
  };

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
    <section id="treatments" style={sectionStyle}>
      <h2>Nuestros Tratamientos</h2>
      <div style={gridStyle}>
        {treatments.map(treatment => (
          <Card
            key={treatment.id}
            title={treatment.name}
            description={treatment.description || 'Descripción no disponible.'}
            imageUrl={treatment.imageUrl}
            buttonText="Pedir Cita"
            onButtonClick={() => handleRequestAppointment(treatment.name)}
          />
        ))}
      </div>
    </section>
  );
};

export default TreatmentsSection;
