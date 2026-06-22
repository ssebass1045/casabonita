// File: my-spa/src/components/Home.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import TreatmentsSection from "./TreatmentsSection";
import ProductsSection from "./ProductsSection";
import EmployeesSection from "./EmployeesSection";
import BlogsSection from "./BlogsSection";
import Seo, {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema,
} from "./Seo";

// Importa los componentes de íconos SVG que creamos por separado
import InstagramIcon from "../assets/icons/InstagramIcon";
import FacebookIcon from "../assets/icons/FacebookIcon";

// **NUEVO: Importa tu logo aquí. Ajusta la ruta si es necesario.**
import spaLogo from "../assets/imagenes/logo-casabonita.png"; // <--- RUTA A TU LOGO. Por ejemplo: '../assets/images/tu-logo.png'
import heroSpaImage from "../assets/imagenes/pexels-photo-347139.webp";

// Importa la imagen hero si la vas a almacenar localmente
// Si vas a usar las imágenes de Figurbell, no necesitas importarlas aquí,
// las cargamos directamente desde su URL en el <img>.
// import heroMainImage from '../assets/images/hero-main.jpg';
// import heroSideImage1 from '../assets/images/hero-side-1.jpg';
// import heroSideImage2 from '../assets/images/hero-side-2.jpg';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// --- Interfaces para todos los datos públicos (Mantener igual) ---
interface Treatment {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  imageUrl?: string;
}

interface Employee {
  id: number;
  name: string;
  specialty?: string;
  description?: string;
  imageUrl?: string;
}

interface Blog {
  id: number;
  title: string;
  content: string;
  author?: string;
  imageUrl?: string;
}

const faqItems = [
  {
    question: "¿Qué tratamientos ofrece Casa Bonita en Caldas, Antioquia?",
    answer:
      "Ofrecemos tratamientos faciales, corporales, depilación, cuidado de la piel, belleza integral y experiencias de bienestar personalizadas en Caldas, Antioquia.",
  },
  {
    question: "¿Cómo puedo reservar una cita en Casa Bonita Centro Estético?",
    answer:
      "Puedes reservar tu cita por WhatsApp, desde la sección de contacto o solicitando información sobre el tratamiento que te interesa directamente en la web.",
  },
  {
    question:
      "¿Casa Bonita ofrece asesoría personalizada para el cuidado de la piel?",
    answer:
      "Sí. Evaluamos tus necesidades para orientarte hacia tratamientos y rutinas de belleza adaptadas a tu tipo de piel, objetivos y bienestar general.",
  },
  {
    question: "¿Dónde está ubicado Casa Bonita Centro Estético?",
    answer:
      "Casa Bonita está orientado a clientes de Caldas, Antioquia y sus alrededores, con enfoque en belleza, cuidado personal y bienestar integral.",
  },
];

const serviceSchemaItems = [
  {
    name: "Tratamientos faciales",
    description:
      "Protocolos enfocados en limpieza, hidratación, renovación y cuidado estético del rostro.",
    category: "Facial",
  },
  {
    name: "Tratamientos corporales",
    description:
      "Experiencias de bienestar y estética corporal para realzar tu figura y mejorar tu confort.",
    category: "Corporal",
  },
  {
    name: "Depilación y cuidado de la piel",
    description:
      "Servicios orientados a una piel más lisa, cuidada y con apariencia saludable.",
    category: "Depilación y piel",
  },
  {
    name: "Belleza integral",
    description:
      "Servicios de belleza diseñados para proyectar confianza, armonía y bienestar personal.",
    category: "Belleza",
  },
];

const Home = () => {
  // --- Estados para cada tipo de dato (Mantener igual) ---
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [treatmentsRes, productsRes, employeesRes, blogsRes] =
          await Promise.all([
            axios.get<Treatment[]>(`${API_BASE_URL}/treatments`),
            axios.get<Product[]>(`${API_BASE_URL}/products`),
            axios.get<Employee[]>(`${API_BASE_URL}/employees`),
            axios.get<Blog[]>(`${API_BASE_URL}/blogs`),
          ]);

        setTreatments(treatmentsRes.data);
        setProducts(productsRes.data);
        setEmployees(employeesRes.data);
        setBlogs(blogsRes.data);
      } catch (err: any) {
        console.error("Error fetching public data:", err);
        setError(
          "No se pudo cargar la información del sitio. Por favor, inténtalo de nuevo más tarde.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  if (isLoading) {
    return (
      <div className="section text-center">Cargando Casa Bonita SPA...</div>
    );
  }

  if (error) {
    return (
      <p className="section text-center" style={{ color: "red" }}>
        Error: {error}
      </p>
    );
  }

  return (
    <div>
      <Seo
        title="Casa Bonita Centro Estetico en Caldas, Antioquia"
        description="Centro estetico de belleza en Caldas, Antioquia, especializado en tratamientos faciales, corporales, depilacion, cuidado de la piel y bienestar personalizado."
        path="/"
        keywords={[
          "casa bonita centro estetico",
          "casa bonita spa",
          "spa en caldas antioquia",
          "tratamientos faciales",
          "tratamientos corporales",
          "centro de belleza en caldas",
          "cuidado de la piel",
          "depilacion",
          "bienestar",
          "centro estetico en caldas antioquia",
        ]}
        structuredData={[
          buildBreadcrumbSchema([{ name: "Inicio", path: "/" }]),
          buildFaqSchema(faqItems),
          buildServiceSchema(serviceSchemaItems),
        ]}
      />
      {/* Sección de Bienvenida o "Hero" - AJUSTADA */}
      <section id="welcome">
        {" "}
        {/* Elimina la clase "hero-section" si la tenías aquí. `#welcome` ahora maneja el display flex. */}
        {/* **1. Contenedor para el contenido de texto (Izquierda) y el logo.** */}
        <div className="hero-content-wrapper">
          {/* **NUEVO: Contenedor para el logo.** */}
          <div className="hero-logo-container">
            <img
              src={spaLogo}
              alt="Logo de Casa Bonita Centro Estetico"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <h1 className="section-title">
            Casa Bonita Centro Estético en Caldas, Antioquia
          </h1>
          <p className="section-description">
            Belleza, bienestar y cuidado de la piel en un solo lugar
          </p>

          <p className="hero-long-description">
            No es vanidad, es amor propio. Descubre tratamientos faciales,
            corporales y experiencias de belleza diseñadas para resaltar tu
            bienestar en <b className="tx-bg">Casa Bonita Centro Estético</b>,
            tu espacio de cuidado personal en Caldas, Antioquia.
          </p>

          <div className="hero-buttons-container">
            <a
              href="https://wa.me/573217571992"
              target="_blank"
              rel="noopener noreferrer"
              className="elementor-button book-now"
            >
              <span>¡Reservar Ahora!</span>
            </a>
            <a href="#treatments" className="elementor-button our-services">
              <span className="elementor-button-icon elementor-align-icon-right">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 448 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                </svg>
              </span>
              <span>Nuestros Servicios</span>
            </a>
          </div>
        </div>
        {/* **2. Contenedor de las imágenes al lado derecho.** */}
        <div className="hero-images-display">
          {/* Imagen principal de la modelo. Puedes usar la URL directa o tu importación local. */}
          <img
            src={heroSpaImage}
            alt="Centro estético de belleza y bienestar en Caldas Antioquia"
            className="hero-main-image"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          {/* Si tienes las otras dos imágenes secundarias de Figurbell, añádelas aquí: */}
          {/* <img src="URL_IMAGEN_SECUNDARIA_1" alt="Imagen secundaria de spa" className="hero-secondary-image" /> */}
          {/* <img src="URL_IMAGEN_SECUNDARIA_2" alt="Otra imagen secundaria de spa" className="hero-secondary-image" /> */}
        </div>
      </section>

      {/* Sección "Conoce Casa Bonita" - Mantener o ajustar si es necesario */}
      <section id="about" className="section section-custom-bg-1 reveal">
        <div className="section-kicker">
          Centro de belleza en Caldas, Antioquia
        </div>
        <h2 className="section-title">Conoce Casa Bonita</h2>
        <p className="section-description">
          Somos un centro estético de belleza enfocado en ayudarte a sentirte
          bien por dentro y por fuera, con un servicio cálido, personalizado y
          pensado para clientes de Caldas, Antioquia.
        </p>
        <div className="info-grid">
          <article className="info-card">
            <h3>Tratamientos personalizados</h3>
            <p>
              Diseñamos experiencias de cuidado facial, corporal y belleza
              integral según tus objetivos, tu piel y tu momento.
            </p>
          </article>
          <article className="info-card">
            <h3>Ambiente de bienestar</h3>
            <p>
              Cada visita busca ofrecer tranquilidad, confianza y una sensación
              de renovación en un entorno pensado para el autocuidado.
            </p>
          </article>
          <article className="info-card">
            <h3>Enfoque local y humano</h3>
            <p>
              Queremos que Casa Bonita sea una referencia de belleza y bienestar
              para Caldas, Antioquia y sus alrededores.
            </p>
          </article>
        </div>
      </section>

      {/* Renderiza todas las secciones (Mantener igual) */}
      <TreatmentsSection treatments={treatments} />
      <ProductsSection products={products} />
      <EmployeesSection employees={employees} />
      <BlogsSection blogs={blogs} />

      <section id="faq" className="section reveal">
        <div className="section-kicker">Preguntas frecuentes</div>
        <h2 className="section-title">
          Resolvemos tus dudas antes de reservar
        </h2>
        <p className="section-description">
          Información útil sobre nuestros tratamientos de belleza, cuidado de la
          piel y procesos de reserva en Caldas, Antioquia.
        </p>
        <div className="faq-grid">
          {faqItems.map((item) => (
            <article key={item.question} className="faq-card">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Sección de Contacto - Mantener o ajustar si es necesario */}
      <section id="contact" className="section section-dark-background reveal">
        <h2 className="section-title">Reserva tu experiencia de belleza</h2>
        <p className="section-description">
          Estamos listos para atenderte en Casa Bonita Centro Estético, tu
          espacio de bienestar en Caldas, Antioquia.
        </p>
        <div className="contact-links">
          <a
            href="https://wa.me/573217571992"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            WhatsApp
          </a>
          <a
            href="mailto:casabonitacentroestetico@gmail.com"
            className="contact-link"
          >
            Email
          </a>
        </div>
      </section>

      {/* **NUEVO: Los iconos sociales se MUEVEN al final del componente Home.** */}
      {/* Puedes colocarlo justo antes del cierre del div principal del return, o dentro de un componente Footer si tienes uno. */}
      <div className="footer-social-icons">
        <h3>Síguenos en</h3>
        <div className="hero-social-icons">
          {" "}
          {/* Puedes reutilizar `hero-social-icons` o crear una nueva clase si quieres estilos específicos para el footer */}
          <a
            href="https://www.instagram.com/casabonitacentroestetico/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://www.facebook.com/casabonitacentroestetico/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            <FacebookIcon />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
