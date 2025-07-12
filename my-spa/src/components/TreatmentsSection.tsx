// File: my-spa/src/components/TreatmentsSection.tsx
import React from 'react';
import Card from './Card';

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

  return (
    <section id="treatments" className="section section-alt-background"> {/* Aplicamos clases */}
      <h2 className="section-title">Nuestros Tratamientos</h2> {/* Aplicamos clase */}
      <div className="cards-grid"> {/* Aplicamos clase */}
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
