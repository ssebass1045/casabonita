// File: my-spa/src/components/BlogsSection.tsx
import React from 'react';
import Card from './Card';
import { toast } from 'react-toastify'; // <-- ¡AÑADE ESTA IMPORTACIÓN!

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
  return (
    <section id="blogs" className="section">
      <h2 className="section-title">Nuestro Blog</h2>
      <div className="cards-grid">
        {blogs.map(blog => (
          <Card
            key={blog.id}
            title={blog.title}
            description={`${blog.content.substring(0, 100)}...`}
            imageUrl={blog.imageUrl}
            buttonText="Leer Más"
            // --- CAMBIO AQUÍ: Reemplaza alert() por toast.info() ---
            onButtonClick={() => toast.info(`Redirigiendo al blog: ${blog.title}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default BlogsSection;
