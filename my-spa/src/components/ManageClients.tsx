// File: my-spa/src/components/ManageClients.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import ClientForm from './ClientForm';

const API_BASE_URL = 'http://localhost:3000';

enum Gender {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro',
  PREFIERO_NO_DECIR = 'Prefiero no decir',
}

interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: Gender;
  observations?: string; // <-- NUEVO CAMPO
}

const ManageClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Client[]>(`${API_BASE_URL}/clients`);
      setClients(response.data);
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      setError(err.message || "Error al cargar los clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: number, clientName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar a "${clientName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(clientId);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/clients/${clientId}`);
      setClients(prevClients => 
        prevClients.filter(client => client.id !== clientId)
      );
      console.log(`Cliente "${clientName}" eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error deleting client:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para eliminar clientes. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 404) {
        setError("El cliente no fue encontrado. Puede que ya haya sido eliminado.");
        setClients(prevClients => 
          prevClients.filter(client => client.id !== clientId)
        );
      } else {
        setError(err.message || "Error al eliminar el cliente.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingClient(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingClient(undefined);
    fetchClients(); // Recarga la lista
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingClient(undefined);
  };

  if (isLoading) {
    return (
      <div>
        <p>Cargando clientes...</p>
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
      <h2>Gestionar Clientes</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Añadir Nuevo Cliente
      </button>

      {clients.length === 0 ? (
        <p>No hay clientes para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Edad</th>
              <th>Género</th>
              <th>Observaciones</th> {/* <-- NUEVA COLUMNA */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.phone || '-'}</td>
                <td>{client.email || '-'}</td>
                <td>{client.age || '-'}</td>
                <td>{client.gender || '-'}</td>
                <td>{client.observations?.substring(0, 50) || '-'}...</td> {/* <-- Mostrar observaciones */}
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
                    onClick={() => handleOpenEditModal(client)}
                  >
                    Editar
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteClient(client.id, client.name)}
                    disabled={isDeleting === client.id}
                    style={{ 
                      backgroundColor: isDeleting === client.id ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: isDeleting === client.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isDeleting === client.id ? 'Eliminando...' : 'Eliminar'}
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
        title={editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
      >
        <ClientForm
          client={editingClient}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageClients;
