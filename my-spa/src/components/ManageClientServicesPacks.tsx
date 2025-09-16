import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import ClientServicesPackForm from './ClientServicesPackForm';
import AdditionalPaymentForm from './AdditionalPaymentForm'; // <-- Importar el nuevo componente

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface Client {
  id: number;
  name: string;
}

interface ServicesPack {
  id: number;
  name: string;
}

interface ClientServicesPack {
  id: number;
  client: Client;
  servicesPack: ServicesPack;
  totalPrice: number;
  amountPaid: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  purchaseDate: string;
  expirationDate?: string;
  isActive: boolean;
}

const ManageClientServicesPacks = () => {
  const [clientPacks, setClientPacks] = useState<ClientServicesPack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false); // <-- Nuevo estado para modal de pago
  const [selectedPack, setSelectedPack] = useState<ClientServicesPack | null>(null); // <-- Para almacenar el paquete seleccionado

  useEffect(() => {
    fetchClientPacks();
  }, []);

  const fetchClientPacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ClientServicesPack[]>(`${API_BASE_URL}/services-pack/client/all`);
      setClientPacks(response.data);
    } catch (err: any) {
      console.error("Error fetching client packs:", err);
      setError(err.message || "Error al cargar los paquetes de clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar la función handleAddPayment antigua que usaba PUT
  // Ya que ahora usaremos el nuevo endpoint de pagos

  const handleDeactivatePack = async (packId: number) => {
    const confirmDeactivate = window.confirm(
      "¿Estás seguro de que quieres desactivar este paquete?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmDeactivate) return;

    try {
      const pack = clientPacks.find(p => p.id === packId);
      if (!pack) return;

      await axios.put(`${API_BASE_URL}/services-pack/client/${packId}`, {
        clientId: pack.client.id,
        servicesPackId: pack.servicesPack.id,
        totalPrice: parseFloat(pack.totalPrice.toString()),
        amountPaid: parseFloat(pack.amountPaid.toString()),
        sessionsRemaining: pack.sessionsRemaining,
        expirationDate: pack.expirationDate,
        isActive: false
      });
      fetchClientPacks();
    } catch (err: any) {
      console.error("Error deactivating pack:", err);
      setError(err.message || "Error al desactivar el paquete.");
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenPaymentModal = (pack: ClientServicesPack) => {
    setSelectedPack(pack);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedPack(null);
    fetchClientPacks(); // Refrescar la lista después del pago
  };

  const handlePaymentCancel = () => {
    setIsPaymentModalOpen(false);
    setSelectedPack(null);
  };

  const handleFormSuccess = () => {
    setIsCreateModalOpen(false);
    fetchClientPacks();
  };

  const handleFormCancel = () => {
    setIsCreateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div>
        <p>Cargando paquetes de clientes...</p>
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
      <h2>Gestionar Paquetes de Clientes</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Vender Nuevo Paquete
      </button>

      {clientPacks.length === 0 ? (
        <p>No hay paquetes de clientes para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Paquete</th>
              <th>Precio Total</th>
              <th>Pagado</th>
              <th>Sesiones</th>
              <th>Fecha Compra</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientPacks.map((pack) => (
              <tr key={pack.id}>
                <td>{pack.client.name}</td>
                <td>{pack.servicesPack.name}</td>
                <td>${parseFloat(pack.totalPrice.toString()).toFixed(2)}</td>
                <td>${parseFloat(pack.amountPaid.toString()).toFixed(2)}</td>
                <td>{pack.sessionsUsed}/{pack.sessionsUsed + pack.sessionsRemaining}</td>
                <td>{new Date(pack.purchaseDate).toLocaleDateString()}</td>
                <td>{pack.isActive ? 'Activo' : 'Inactivo'}</td>
                <td>
                  {pack.isActive && (
                    <>
                      <button 
                        style={{ 
                          marginRight: '5px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleOpenPaymentModal(pack)} // <-- Cambiado para usar el modal
                      >
                        Abonar
                      </button>
                      
                      <button 
                        onClick={() => handleDeactivatePack(pack.id)}
                        style={{ 
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer'
                        }}
                      >
                        Desactivar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para crear nuevo paquete */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleFormCancel}
        title="Vender Nuevo Paquete"
      >
        <ClientServicesPackForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Modal para abonos adicionales */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentCancel}
        title="Abonar a Paquete"
      >
        {selectedPack && (
          <AdditionalPaymentForm
            clientPackId={selectedPack.id}
            clientName={selectedPack.client.name}
            packName={selectedPack.servicesPack.name}
            currentAmountPaid={parseFloat(selectedPack.amountPaid.toString())}
            totalPrice={parseFloat(selectedPack.totalPrice.toString())}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageClientServicesPacks;