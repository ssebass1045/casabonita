// File: my-spa/src/components/ManageTreatments.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import TreatmentForm from './TreatmentForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


interface Treatment {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

const ManageTreatments = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | undefined>(undefined); // <-- Cambio aquí: null por undefined

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Treatment[]>(`${API_BASE_URL}/treatments`);
      setTreatments(response.data);
    } catch (err: any) {
      console.error("Error fetching treatments:", err);
      setError(err.message || "Error al cargar los tratamientos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTreatment = async (treatmentId: number, treatmentName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el tratamiento "${treatmentName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(treatmentId);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/treatments/${treatmentId}`);
      setTreatments(prevTreatments => 
        prevTreatments.filter(treatment => treatment.id !== treatmentId)
      );
      console.log(`Tratamiento "${treatmentName}" eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error deleting treatment:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para eliminar tratamientos. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 404) {
        setError("El tratamiento no fue encontrado. Puede que ya haya sido eliminado.");
        setTreatments(prevTreatments => 
          prevTreatments.filter(treatment => treatment.id !== treatmentId)
        );
      } else {
        setError(err.message || "Error al eliminar el tratamiento.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  // Función para abrir el modal de creación
  const handleOpenCreateModal = () => {
    setEditingTreatment(undefined); // <-- Cambio aquí: null por undefined
    setIsModalOpen(true);
  };

  // Función para abrir el modal de edición
  const handleOpenEditModal = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setIsModalOpen(true);
  };

  // Función para manejar el éxito (crear o editar)
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTreatment(undefined); // <-- Cambio aquí: null por undefined
    fetchTreatments();
  };

  // Función para manejar la cancelación
  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingTreatment(undefined); // <-- Cambio aquí: null por undefined
  };

  // --- Renderizado ---

  if (isLoading) {
    return (
      <div>
        <p>Cargando tratamientos...</p>
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
      <h2>Gestionar Tratamientos</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Añadir Nuevo Tratamiento
      </button>

      {treatments.length === 0 ? (
        <p>No hay tratamientos para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((treatment) => (
              <tr key={treatment.id}>
                <td>{treatment.id}</td>
                <td>{treatment.name}</td>
                <td>{treatment.description?.substring(0, 50)}...</td>
                <td>{treatment.price ? `$${treatment.price}` : '-'}</td>
                <td>
                  {treatment.imageUrl ? (
                    <img src={treatment.imageUrl} alt={treatment.name} width="50" />
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
                    onClick={() => handleOpenEditModal(treatment)}
                  >
                    Editar
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteTreatment(treatment.id, treatment.name)}
                    disabled={isDeleting === treatment.id}
                    style={{ 
                      backgroundColor: isDeleting === treatment.id ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: isDeleting === treatment.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isDeleting === treatment.id ? 'Eliminando...' : 'Eliminar'}
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
        title={editingTreatment ? 'Editar Tratamiento' : 'Añadir Nuevo Tratamiento'}
      >
        <TreatmentForm
          treatment={editingTreatment} // Ahora es compatible: Treatment | undefined
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageTreatments;
