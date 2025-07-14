// File: my-spa/src/components/BlogForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


interface Blog {
  id: number;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
  imageUrl?: string;
}

interface BlogFormData {
  title: string;
  content: string;
  author: string;
  image: File | null;
}

interface BlogFormProps {
  blog?: Blog; // Opcional: si se pasa, estamos editando
  onSuccess: () => void;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ blog, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    author: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!blog; // Determina si estamos editando

  // Efecto para pre-poblar el formulario si estamos editando
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        author: blog.author || '',
        image: null // La imagen existente no se pre-carga en el input file
      });
    }
  }, [blog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.title.trim()) {
        throw new Error('El título del blog es obligatorio');
      }
      if (!formData.content.trim()) {
        throw new Error('El contenido del blog es obligatorio');
      }

      // Crear FormData para enviar archivos
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('content', formData.content.trim());
      
      // Solo agregar autor si no está vacío
      if (formData.author.trim()) {
        submitData.append('author', formData.author.trim());
      }

      // Añadir imagen si se seleccionó una nueva
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Determinar la URL y método HTTP
      const url = isEditing 
        ? `${API_BASE_URL}/blogs/${blog.id}` 
        : `${API_BASE_URL}/blogs`;
      
      const method = isEditing ? 'patch' : 'post';

      // Enviar al backend
      await axios[method](url, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Éxito: llamar al callback
      onSuccess();

    } catch (err: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} blog:`, err);
      if (err.response?.status === 401) {
        setError('No tienes autorización. Por favor, inicia sesión nuevamente.');
      } else if (err.response?.status === 400) {
        const backendMessage = err.response?.data?.message;
        if (Array.isArray(backendMessage)) {
          setError(`Errores de validación: ${backendMessage.join(', ')}`);
        } else {
          setError(backendMessage || 'Error de validación en los datos enviados.');
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el blog`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Campo Título */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Título del Blog *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Ej: Los beneficios de la limpieza facial"
        />
      </div>

      {/* Campo Contenido */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="content" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Contenido *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          required
          rows={8}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Escribe el contenido completo del blog..."
        />
      </div>

      {/* Campo Autor */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="author" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Autor
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Nombre del autor (opcional)"
        />
      </div>

      {/* Campo Imagen */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="image" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {isEditing ? 'Nueva Imagen del Blog (opcional)' : 'Imagen del Blog'}
        </label>
        
        {/* Mostrar imagen actual si estamos editando */}
        {isEditing && blog?.imageUrl && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Imagen actual:</p>
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
            />
          </div>
        )}
        
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleFileChange}
          accept="image/*"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        {formData.image && (
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Nueva imagen seleccionada: {formData.image.name}
          </p>
        )}
        {isEditing && (
          <small style={{ color: '#666', fontSize: '12px' }}>
            Si no seleccionas una nueva imagen, se mantendrá la actual
          </small>
        )}
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            border: '1px solid #ccc',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting 
            ? (isEditing ? 'Actualizando...' : 'Creando...') 
            : (isEditing ? 'Actualizar Blog' : 'Crear Blog')
          }
        </button>
      </div>
    </form>
  );
};

export default BlogForm;
