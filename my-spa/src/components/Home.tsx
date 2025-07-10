// File: my-spa/src/components/Home.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TreatmentsSection from './TreatmentsSection';
import ProductsSection from './ProductsSection';
import EmployeesSection from './EmployeesSection';
import BlogsSection from './BlogsSection';

const API_BASE_URL = 'http://localhost:3000';

// --- Interfaces para todos los datos públicos ---
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

const Home = () => {
  // --- Estados para cada tipo de dato ---
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
        // Carga todos los datos públicos en paralelo
        const [
          treatmentsRes,
          productsRes,
          employeesRes,
          blogsRes,
        ] = await Promise.all([
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
        setError("No se pudo cargar la información del sitio. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '24px' }}>Cargando Casa Bonita SPA...</div>;
  }

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</p>;
  }

  return (
    <div>
      {/* Sección de Bienvenida o "Hero" */}
      <section id="welcome" style={{ textAlign: 'center', padding: '50px 20px', background: '#f4f4f4' }}>
        <h1>Bienvenida a Casa Bonita SPA</h1>
        <p>Tu santuario de belleza y bienestar.</p>
      </section>

      {/* Sección "Conoce Casa Bonita" */}
      <section id="about" style={{ padding: '40px 20px' }}>
        <h2 style={{ textAlign: 'center' }}>Conoce Casa Bonita</h2>
        <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          Aquí puedes escribir la historia y la misión de tu SPA. Habla sobre tu filosofía,
          el ambiente que ofreces y por qué los clientes deberían elegirte.
        </p>
      </section>

      {/* Renderiza todas las secciones */}
      <TreatmentsSection treatments={treatments} />
      <ProductsSection products={products} />
      <EmployeesSection employees={employees} />
      <BlogsSection blogs={blogs} />

      {/* Sección de Contacto */}
      <section id="contact" style={{ padding: '40px 20px', background: '#333', color: 'white', textAlign: 'center' }}>
        <h2>Contacto</h2>
        <p>¡Nos encantaría saber de ti!</p>
        {/* Aquí puedes poner los enlaces a WhatsApp, email y redes sociales */}
        <a 
          href="https://wa.me/573101234567" // Reemplaza con tu número
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}
        >
          WhatsApp
        </a>
        <a 
          href="mailto:info@casabonita.com" // Reemplaza con tu email
          style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}
        >
          Email
        </a>
      </section>
    </div>
  );
};

export default Home;
