// File: my-spa/src/components/TreatmentsSection.tsx
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';

interface Treatment {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  isFeatured?: boolean;
}

interface TreatmentsSectionProps {
  treatments: Treatment[];
}

const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({ treatments }) => {
  const CATEGORY_ORDER = useMemo(
    () => [
      'facial',
      'cuidado_piel',
      'corporal',
      'masajes_relajacion',
      'depilacion',
      'cejas_pestanas',
      'belleza',
      'otros',
    ],
    [],
  );

  const CATEGORY_LABELS: Record<string, string> = useMemo(
    () => ({
      facial: 'Rostro',
      cuidado_piel: 'Cuidado de Piel',
      corporal: 'Corporal',
      masajes_relajacion: 'Masajes y Relajación',
      depilacion: 'Depilación',
      cejas_pestanas: 'Cejas y Pestañas',
      belleza: 'Belleza',
      otros: 'Otros',
    }),
    [],
  );

  const availableCategories = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const t of treatments) {
      const category = t.category || 'otros';
      byCategory.set(category, (byCategory.get(category) || 0) + 1);
    }
    return CATEGORY_ORDER.filter((key) => (byCategory.get(key) || 0) > 0);
  }, [CATEGORY_ORDER, treatments]);

  const initialCategory = availableCategories[0] || 'otros';
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const visibleTreatments = useMemo(() => {
    const category = activeCategory || 'otros';
    return treatments
      .filter((t) => (t.category || 'otros') === category)
      .sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)))
      .slice(0, 10);
  }, [activeCategory, treatments]);

  const handleRequestAppointment = (treatmentName: string) => {
    const message = `¡Hola! Me gustaría pedir una cita para el tratamiento de "${treatmentName}".`;
    const whatsappUrl = `https://wa.me/573217571992?text=${encodeURIComponent(message)}`; // Reemplaza con tu número de WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.max(320, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section id="treatments" className="section section-custom-bg-2 reveal"> {/* Aplicamos clases */}
      <h2 className="section-title">Nuestros Tratamientos</h2> {/* Aplicamos clase */}
      <p className="section-description">
        Explora por categorías y reserva el tratamiento perfecto para ti.
      </p>

      <div className="pill-tabs">
        {availableCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={['pill-tab', activeCategory === category ? 'is-active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveCategory(category)}
          >
            {CATEGORY_LABELS[category] || 'Otros'}
          </button>
        ))}
      </div>

      <div className="carousel-shell">
        <button
          type="button"
          className="carousel-nav carousel-nav-left"
          onClick={() => scrollByAmount('left')}
          aria-label="Anterior"
        >
          ‹
        </button>

        <div className="carousel-track" ref={carouselRef}>
          {visibleTreatments.map((treatment) => (
            <div className="carousel-item" key={treatment.id}>
              <Card
                title={treatment.name}
                description={treatment.description || 'Descripción no disponible.'}
                imageUrl={treatment.imageUrl}
                buttonText="Pedir cita"
                onButtonClick={() => handleRequestAppointment(treatment.name)}
                className="card--lux"
                eyebrow={CATEGORY_LABELS[treatment.category || 'otros'] || 'Otros'}
                badge={treatment.isFeatured ? 'Recomendado' : undefined}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="carousel-nav carousel-nav-right"
          onClick={() => scrollByAmount('right')}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      <div className="section-cta-row">
        <Link to="/treatments" className="elementor-button book-now">
          Ver todos los tratamientos
        </Link>
      </div>
    </section>
  );
};


export default TreatmentsSection;
