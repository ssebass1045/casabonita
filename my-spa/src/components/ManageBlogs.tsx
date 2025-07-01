// File: my-spa/src/components/ManageBlogs.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import BlogForm from './BlogForm';

const API_BASE_URL = 'http://localhost:3000';

interface Blog {
  id: number;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
  imageUrl?: string;
}

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<Blog | undefined>(undefined);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Blog[]>(`${API_BASE_URL}/blogs`);
      setBlogs(response.data);
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      setError(err.message || "Error al cargar los blogs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: number, blogTitle: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el blog "${blogTitle}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(blogId);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/blogs/${blogId}`);
      setBlogs(prevBlogs => 
        prevBlogs.filter(blog => blog.id !== blogId)
      );
      console.log(`Blog "${blogTitle}" eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error deleting blog:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para eliminar blogs. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 404) {
        setError("El blog no fue encontrado. Puede que ya haya sido eliminado.");
        setBlogs(prevBlogs => 
          prevBlogs.filter(blog => blog.id !== blogId)
        );
      } else {
        setError(err.message || "Error al eliminar el blog.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  // Función para abrir el modal de creación
  const handleOpenCreateModal = () => {
    setEditingBlog(undefined);
    setIsModalOpen(true);
  };

  // Función para abrir el modal de edición
  const handleOpenEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  // Función para manejar el éxito (crear o editar)
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingBlog(undefined);
    fetchBlogs();
  };

  // Función para manejar la cancelación
  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingBlog(undefined);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // --- Renderizado ---

  if (isLoading) {
    return (
      <div>
        <p>Cargando blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Recargar Página</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Gestionar Blogs</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Añadir Nuevo Blog
      </button>

      {blogs.length === 0 ? (
        <p>No hay blogs para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Contenido</th>
              <th>Autor</th>
              <th>Fecha</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.id}</td>
                <td>{blog.title}</td>
                <td>{blog.content?.substring(0, 50)}...</td>
                <td>{blog.author || '-'}</td>
                <td>{formatDate(blog.createdAt)}</td>
                <td>
                  {blog.imageUrl ? (
                    <img src={blog.imageUrl} alt={blog.title} width="50" />
                  ) : (
                    'No img'
                  )}
                </td>
                <td>
                  <button 
                    style={{ 
                      marginRight: '5px',
                      backgroundColor: '#ffc107',
                      color: 'black',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleOpenEditModal(blog)}
                  >
                    Editar
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteBlog(blog.id, blog.title)}
                    disabled={isDeleting === blog.id}
                    style={{ 
                      backgroundColor: isDeleting === blog.id ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: isDeleting === blog.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isDeleting === blog.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingBlog ? 'Editar Blog' : 'Añadir Nuevo Blog'}
      >
        <BlogForm
          blog={editingBlog}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageBlogs;
