import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Card from './Card';
import Seo, { buildBreadcrumbSchema } from './Seo';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author?: string;
  imageUrl?: string;
}

const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get<BlogPost[]>(`${API_BASE_URL}/blogs`);
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="section reveal">
      <Seo
        title="Blog de Belleza y Cuidado de la Piel en Caldas, Antioquia"
        description="Lee consejos, novedades y recomendaciones sobre belleza, bienestar y cuidado de la piel en el blog de Casa Bonita Centro Estetico en Caldas, Antioquia."
        path="/blog"
        keywords={[
          'blog de belleza',
          'blog de cuidado de la piel',
          'consejos de spa',
          'bienestar y estetica',
          'belleza en caldas antioquia',
        ]}
        structuredData={buildBreadcrumbSchema([
          { name: 'Inicio', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      <div className="section-kicker">Contenido útil</div>
      <h1 className="section-title">Blog de belleza en Caldas, Antioquia</h1>
      <p className="section-description">
        Publicaciones con tendencias, consejos y recomendaciones para cuidar tu
        piel, mejorar tu rutina y potenciar tu bienestar.
      </p>
      <h2 className="subsection-title">Consejos de estética, piel y autocuidado</h2>

      {isLoading ? (
        <p>Cargando publicaciones...</p>
      ) : (
        <div className="cards-grid">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <Card
                key={blog.id}
                title={blog.title}
                description={`${blog.content.substring(0, 120)}...`}
                imageUrl={blog.imageUrl}
                buttonText="Leer mas"
                onButtonClick={() =>
                  toast.info(`Pronto tendremos pagina detallada para: ${blog.title}`)
                }
                className="card--lux"
                eyebrow={blog.author || 'Blog'}
              />
            ))
          ) : (
            <p>Pronto compartiremos articulos y consejos de belleza.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Blog;
