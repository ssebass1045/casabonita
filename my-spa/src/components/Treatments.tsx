import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "./Card";
import Seo, { buildBreadcrumbSchema, buildServiceSchema } from "./Seo";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export enum TreatmentCategory {
  FACIAL = "facial",
  CORPORAL = "corporal",
  DEPILACION = "depilacion",
  CEJAS_PESTANAS = "cejas_pestanas",
  MASAJES_RELAJACION = "masajes_relajacion",
  CUIDADO_PIEL = "cuidado_piel",
  BELLEZA = "belleza",
  OTROS = "otros",
}

const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  [TreatmentCategory.FACIAL]: "Rostro",
  [TreatmentCategory.CUIDADO_PIEL]: "Cuidado de Piel",
  [TreatmentCategory.CORPORAL]: "Corporal",
  [TreatmentCategory.MASAJES_RELAJACION]: "Masajes y Relajación",
  [TreatmentCategory.DEPILACION]: "Depilación",
  [TreatmentCategory.CEJAS_PESTANAS]: "Cejas y Pestañas",
  [TreatmentCategory.BELLEZA]: "Belleza",
  [TreatmentCategory.OTROS]: "Otros",
};

const treatmentSchemaItems = [
  {
    name: "Tratamientos faciales",
    description:
      "Servicios enfocados en limpieza, hidratación y renovación del rostro.",
    category: "Facial",
  },
  {
    name: "Tratamientos corporales",
    description:
      "Protocolos de bienestar y estética corporal orientados al cuidado integral.",
    category: "Corporal",
  },
  {
    name: "Depilación",
    description:
      "Opciones de depilación y cuidado para una piel más suave y cómoda.",
    category: "Depilación",
  },
  {
    name: "Cuidado de la piel",
    description:
      "Experiencias orientadas a proteger, equilibrar y realzar la piel.",
    category: "Piel",
  },
];

interface Treatment {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: TreatmentCategory;
  isFeatured?: boolean;
}

const Treatments: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TreatmentCategory | "">(
    "",
  );

  const categoryOptions = useMemo(() => {
    return Object.values(TreatmentCategory);
  }, []);

  useEffect(() => {
    const fetchTreatments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (categoryFilter) params.append("category", categoryFilter);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());

        const response = await axios.get<Treatment[]>(
          `${API_BASE_URL}/treatments?${params.toString()}`,
        );
        setTreatments(response.data);
      } catch (err: any) {
        console.error("Error fetching treatments:", err);
        setError("No se pudieron cargar los tratamientos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreatments();
  }, [searchTerm, categoryFilter]);

  const handleRequestAppointment = (treatmentName: string) => {
    const message = `¡Hola! Me gustaría pedir una cita para el tratamiento de "${treatmentName}".`;
    const whatsappUrl = `https://wa.me/573217571992?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="treatments-page" className="section reveal">
      <Seo
        title="Tratamientos Faciales y Corporales en Caldas, Antioquia"
        description="Explora los tratamientos faciales, corporales, depilacion, cuidado de la piel, cejas, pestanas y bienestar de Casa Bonita Centro Estetico en Caldas, Antioquia."
        path="/treatments"
        keywords={[
          "tratamientos faciales",
          "tratamientos corporales",
          "depilacion",
          "cuidado de la piel",
          "cejas y pestanas",
          "spa estetico",
          "tratamientos en caldas antioquia",
        ]}
        structuredData={[
          buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Tratamientos", path: "/treatments" },
          ]),
          buildServiceSchema(treatmentSchemaItems),
        ]}
      />
      <div className="section-kicker">Servicios de belleza</div>
      <h1 className="section-title">Tratamientos faciales y corporales en Caldas, Antioquia</h1>
      <p className="section-description">
        Explora nuestros tratamientos por categoría y encuentra el indicado para
        ti, con atención pensada para belleza, piel y bienestar integral.
      </p>
      <h2 className="subsection-title">Encuentra el servicio ideal según tu objetivo estético</h2>

      <div className="filters-row">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as TreatmentCategory | "")
          }
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p>Cargando tratamientos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && !error && (
        <div className="cards-grid">
          {treatments.length > 0 ? (
            treatments.map((treatment) => (
              <Card
                key={treatment.id}
                title={treatment.name}
                description={
                  treatment.description || "Descripción no disponible."
                }
                imageUrl={treatment.imageUrl}
                buttonText="Pedir cita"
                onButtonClick={() => handleRequestAppointment(treatment.name)}
                className="card--lux"
                eyebrow={
                  CATEGORY_LABELS[
                    (treatment.category ||
                      TreatmentCategory.OTROS) as TreatmentCategory
                  ]
                }
                badge={treatment.isFeatured ? "Recomendado" : undefined}
              />
            ))
          ) : (
            <p>No se encontraron tratamientos con los filtros seleccionados.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Treatments;
