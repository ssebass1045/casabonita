// File: my-spa/src/components/BlogsSection.tsx
import React from 'react';
import Card from './Card'; // Importa el componente Card

interface Blog {
  id: number;
  title: string;
  content: string;
  author?: string;
  imageUrl?: string;
}

interface BlogsSectionProps {
  blogs: Blog[];
}

const BlogsSection: React.FC<BlogsSectionProps> = ({ blogs }) => {
  const sectionStyle: React.CSSProperties = {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
    justifyItems: 'center',
  };

  return (
    <section id="blogs" style={sectionStyle}>
      <h2>Nuestro Blog</h2>
      <div style={gridStyle}>
        {blogs.map(blog => (
          <Card
            key={blog.id}
            title={blog.title}
            // Muestra un extracto del contenido
            description={`${blog.content.substring(0, 100)}...`}
            imageUrl={blog.imageUrl}
            buttonText="Leer Más"
            // La acción del botón puede ser una redirección a una página de detalle del blog en el futuro
            onButtonClick={() => alert(`Redirigiendo al blog: ${blog.title}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default BlogsSection;
