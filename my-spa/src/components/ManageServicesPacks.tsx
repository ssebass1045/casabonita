import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import ServicesPackForm from './ServicesPackForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface ServicesPack {
  id: number;
  name: string;
  description?: string;
  totalPrice: number;
  sessionCount: number;
  isActive: boolean;
}

const ManageServicesPacks = () => {
  const [servicesPacks, setServicesPacks] = useState<ServicesPack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingServicesPack, setEditingServicesPack] = useState<ServicesPack | undefined>(undefined);

  useEffect(() => {
    fetchServicesPacks();
  }, []);

  const fetchServicesPacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ServicesPack[]>(`${API_BASE_URL}/services-pack`);
      setServicesPacks(response.data);
    } catch (err: any) {
      console.error("Error fetching services packs:", err);
      setError(err.message || "Error al cargar los paquetes de servicios.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteServicesPack = async (packId: number, packName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el paquete "${packName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(packId);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/services-pack/${packId}`);
      setServicesPacks(prevPacks => 
        prevPacks.filter(pack => pack.id !== packId)
      );
      console.log(`Paquete "${packName}" eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error deleting services pack:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para eliminar paquetes. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 404) {
        setError("El paquete no fue encontrado. Puede que ya haya sido eliminado.");
        setServicesPacks(prevPacks => 
          prevPacks.filter(pack => pack.id !== packId)
        );
      } else {
        setError(err.message || "Error al eliminar el paquete.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingServicesPack(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pack: ServicesPack) => {
    setEditingServicesPack(pack);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingServicesPack(undefined);
    fetchServicesPacks();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingServicesPack(undefined);
  };

  if (isLoading) {
    return (
      <div>
        <p>Cargando paquetes de servicios...</p>
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
      <h2>Gestionar Paquetes de Servicios</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Añadir Nuevo Paquete
      </button>

      {servicesPacks.length === 0 ? (
        <p>No hay paquetes de servicios para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio Total</th>
              <th>Sesiones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicesPacks.map((pack) => (
              <tr key={pack.id}>
                <td>{pack.id}</td>
                <td>{pack.name}</td>
                <td>{pack.description?.substring(0, 50)}...</td>
                <td>${parseFloat(pack.totalPrice.toString()).toFixed(2)}</td>
                <td>{pack.sessionCount}</td>
                <td>{pack.isActive ? 'Activo' : 'Inactivo'}</td>
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
                    onClick={() => handleOpenEditModal(pack)}
                  >
                    Editar
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteServicesPack(pack.id, pack.name)}
                    disabled={isDeleting === pack.id}
                    style={{ 
                      backgroundColor: isDeleting === pack.id ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: isDeleting === pack.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isDeleting === pack.id ? 'Eliminando...' : 'Eliminar'}
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
        title={editingServicesPack ? 'Editar Paquete' : 'Añadir Nuevo Paquete'}
      >
        <ServicesPackForm
          servicesPack={editingServicesPack}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageServicesPacks;