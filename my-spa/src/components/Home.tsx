// File: my-spa/src/components/Home.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TreatmentsSection from './TreatmentsSection';
import ProductsSection from './ProductsSection';
import EmployeesSection from './EmployeesSection';
import BlogsSection from './BlogsSection';


// Importa los componentes de íconos SVG que creamos por separado
import InstagramIcon from '../assets/icons/InstagramIcon';
import FacebookIcon from '../assets/icons/FacebookIcon';

// **NUEVO: Importa tu logo aquí. Ajusta la ruta si es necesario.**
import spaLogo from '../assets/imagenes/logo-casabonita.png'; // <--- RUTA A TU LOGO. Por ejemplo: '../assets/images/tu-logo.png'

// Importa la imagen hero si la vas a almacenar localmente
// Si vas a usar las imágenes de Figurbell, no necesitas importarlas aquí,
// las cargamos directamente desde su URL en el <img>.
// import heroMainImage from '../assets/images/hero-main.jpg';
// import heroSideImage1 from '../assets/images/hero-side-1.jpg';
// import heroSideImage2 from '../assets/images/hero-side-2.jpg';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


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
        return <div className="section text-center">Cargando Casa Bonita SPA...</div>;
    }

    if (error) {
        return <p className="section text-center" style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div>
            {/* Sección de Bienvenida o "Hero" - AJUSTADA */}
            <section id="welcome"> {/* Elimina la clase "hero-section" si la tenías aquí. `#welcome` ahora maneja el display flex. */}
                {/* **1. Contenedor para el contenido de texto (Izquierda) y el logo.** */}
                <div className="hero-content-wrapper">
                    {/* **NUEVO: Contenedor para el logo.** */}
                    <div className="hero-logo-container">
                        <img src={spaLogo} alt="Casa Bonita SPA Logo" /> {/* Usamos la importación de tu logo */}
                    </div>

                    <h1 className="section-title">Casa Bonita SPA</h1>
                    <p className="section-description">Centro Estético de Tratamientos Faciales, Corporales y de belleza</p>

                    <p className="hero-long-description">
                        No es vanidad, es Amor propio. Descubre Tratamientos Faciales y Corporales excepcionales de alta calidad y efectividad en <b className="tx-bg">Casa Bonita SPA</b>. ¡Reserva ahora y regálate el cuidado que mereces!
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
                        <a
                            href="#treatments"
                            className="elementor-button our-services"
                        >
                            <span className="elementor-button-icon elementor-align-icon-right">
                                <svg aria-hidden="true" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
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
                        src="https://ibb.co/ZzLMYv5C" // URL de Figurbell como ejemplo.
                        // O si importaste localmente: src={heroMainImage}
                        alt="Tratamiento de Spa"
                        className="hero-main-image"
                    />
                    {/* Si tienes las otras dos imágenes secundarias de Figurbell, añádelas aquí: */}
                    {/* <img src="URL_IMAGEN_SECUNDARIA_1" alt="Imagen secundaria de spa" className="hero-secondary-image" /> */}
                    {/* <img src="URL_IMAGEN_SECUNDARIA_2" alt="Otra imagen secundaria de spa" className="hero-secondary-image" /> */}
                </div>
            </section>

            {/* Sección "Conoce Casa Bonita" - Mantener o ajustar si es necesario */}
            <section id="about" className="section section-custom-bg-1">
                <h2 className="section-title">Conoce Casa Bonita</h2>
                <p className="section-description">
                    Casa Bonita SPA nace del deseo profundo de brindar bienestar, belleza y armonía en un solo lugar. Somos más que un centro de estética: somos un refugio donde cuerpo, mente y espíritu se equilibran en un ambiente de tranquilidad y cuidado personalizado.

Nuestra historia comenzó con la convicción de que todos merecen un espacio para reconectar consigo mismos. Por eso, diseñamos un entorno acogedor, donde cada detalle —desde la música hasta los aromas— está pensado para ofrecerte una experiencia única de relajación.

Nuestra misión es ayudarte a sentirte bien contigo mismo, resaltando tu belleza natural y renovando tu energía interior. Creemos en una estética consciente, en el poder del toque humano y en tratamientos que combinan tecnología con técnicas tradicionales.

En Casa Bonita encontrarás:

Un equipo de profesionales apasionados y certificados.

Tratamientos personalizados según tus necesidades.

Productos de alta calidad, naturales y libres de crueldad.

Un ambiente sereno, moderno y cuidadosamente diseñado.

Elíjenos porque tu bienestar es nuestra prioridad. Te invitamos a vivir una experiencia que transforma, que embellece y que deja huella en tu día a día.
                </p>
            </section>

            {/* Renderiza todas las secciones (Mantener igual) */}
            <TreatmentsSection treatments={treatments} />
            <ProductsSection products={products} />
            <EmployeesSection employees={employees} />
            <BlogsSection blogs={blogs} />

            {/* Sección de Contacto - Mantener o ajustar si es necesario */}
            <section id="contact" className="section section-dark-background">
                <h2 className="section-title">Contacto</h2>
                <p className="section-description">¡Nos encantaría saber de ti!</p>
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
                        href="casabonitacentroestetico@gmail.com"
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
                <div className="hero-social-icons"> {/* Puedes reutilizar `hero-social-icons` o crear una nueva clase si quieres estilos específicos para el footer */}
                    <a href="https://www.instagram.com/casabonitacentroestetico/" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                        <InstagramIcon />
                    </a>
                    <a href="https://www.facebook.com/casabonitacentroestetico/" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                        <FacebookIcon />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Home;