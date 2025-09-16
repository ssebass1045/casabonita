import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface Client {
  id: number;
  name: string;
}

interface ServicesPack {
  id: number;
  name: string;
  totalPrice: number;
  sessionCount: number;
}

interface ClientServicesPackFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ClientServicesPackForm: React.FC<ClientServicesPackFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [servicesPacks, setServicesPacks] = useState<ServicesPack[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo'); // <-- Nueva línea
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Agregar esta constante después de los estados
  const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro']; // <-- Nueva línea


  useEffect(() => {
    fetchClients();
    fetchServicesPacks();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get<Client[]>(`${API_BASE_URL}/clients`);
      setClients(response.data);
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      setError("Error al cargar la lista de clientes");
    }
  };

  const fetchServicesPacks = async () => {
    try {
      const response = await axios.get<ServicesPack[]>(`${API_BASE_URL}/services-pack`);
      setServicesPacks(response.data);
    } catch (err: any) {
      console.error("Error fetching services packs:", err);
      setError("Error al cargar la lista de paquetes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const selectedPack = servicesPacks.find(pack => pack.id === parseInt(selectedPackId));
      
      if (!selectedPack) {
        throw new Error("Paquete no seleccionado");
      }

      const packData = {
        clientId: parseInt(selectedClientId),
        servicesPackId: parseInt(selectedPackId),
        totalPrice: parseFloat(selectedPack.totalPrice.toString()),
        amountPaid: parseFloat(amountPaid) || 0,
        sessionsRemaining: selectedPack.sessionCount,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        paymentMethod: paymentMethod // <-- Agregar esta línea
      };

      await axios.post(`${API_BASE_URL}/services-pack/client`, packData);
      onSuccess();
    } catch (err: any) {
      console.error("Error selling services pack:", err);
      setError(err.response?.data?.message || "Error al vender el paquete");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPack = servicesPacks.find(pack => pack.id === parseInt(selectedPackId));

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="client" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Cliente:
        </label>
        <select
          id="client"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        >
          <option value="">Selecciona un cliente...</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="pack" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Paquete:
        </label>
        <select
          id="pack"
          value={selectedPackId}
          onChange={(e) => setSelectedPackId(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        >
          <option value="">Selecciona un paquete...</option>
          {servicesPacks.map(pack => (
            <option key={pack.id} value={pack.id}>
              {pack.name} - ${parseFloat(pack.totalPrice.toString()).toFixed(2)} - {pack.sessionCount} sesiones
            </option>
          ))}
        </select>
      </div>

      {selectedPack && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p><strong>Precio Total:</strong> ${parseFloat(selectedPack.totalPrice.toString()).toFixed(2)}</p>
          <p><strong>Sesiones Incluidas:</strong> {selectedPack.sessionCount}</p>
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="amountPaid" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Monto Pagado:
        </label>
        <input
          type="number"
          id="amountPaid"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          min="0"
          step="0.01"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          placeholder="0.00"
        />
      </div>

      {/* Agregar este nuevo bloque para el método de pago */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Método de Pago:
        </label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        >
          {paymentMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="expirationDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Fecha de Expiración (opcional):
        </label>
        <input
          type="date"
          id="expirationDate"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            border: '1px solid #ccc',
            backgroundColor: '#f8f9fa',
            color: '#333',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Vendiendo...' : 'Vender Paquete'}
        </button>
      </div>
    </form>
  );
};

export default ClientServicesPackForm;