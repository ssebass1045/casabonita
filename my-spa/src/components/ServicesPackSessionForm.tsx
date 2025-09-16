import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface ClientServicesPack {
  id: number;
  client: {
    id: number;
    name: string;
  };
  servicesPack: {
    id: number;
    name: string;
  };
  sessionsRemaining: number;
}

interface Employee {
  id: number;
  name: string;
}

interface ServicesPackSessionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ServicesPackSessionForm: React.FC<ServicesPackSessionFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [clientPacks, setClientPacks] = useState<ClientServicesPack[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [employeePayment, setEmployeePayment] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientPacks();
    fetchEmployees();
  }, []);

  const fetchClientPacks = async () => {
    try {
      const response = await axios.get<ClientServicesPack[]>(`${API_BASE_URL}/services-pack/client/all`);
      setClientPacks(response.data);
    } catch (err: any) {
      console.error("Error fetching client packs:", err);
      setError("Error al cargar los paquetes de clientes");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get<Employee[]>(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      setError("Error al cargar la lista de empleados");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const sessionData = {
        clientServicesPackId: parseInt(selectedPackId),
        employeeId: parseInt(selectedEmployeeId),
        employeePayment: parseFloat(employeePayment),
        notes: notes || undefined
      };

      await axios.post(`${API_BASE_URL}/services-pack/session`, sessionData);
      // Limpiar campos después del éxito
    setSelectedPackId('');
    setSelectedEmployeeId('');
    setEmployeePayment('');
    setNotes('');
    
      onSuccess();
    } catch (err: any) {
      console.error("Error creating session:", err);
      setError(err.response?.data?.message || "Error al registrar la sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPack = clientPacks.find(pack => pack.id === parseInt(selectedPackId));

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="pack" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Paquete del Cliente:
        </label>
        <select
          id="pack"
          value={selectedPackId}
          onChange={(e) => setSelectedPackId(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        >
          <option value="">Selecciona un paquete...</option>
          {clientPacks.map(pack => (
            <option key={pack.id} value={pack.id}>
              {pack.client.name} - {pack.servicesPack.name} ({pack.sessionsRemaining} sesiones restantes)
            </option>
          ))}
        </select>
      </div>

      {selectedPack && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p><strong>Cliente:</strong> {selectedPack.client.name}</p>
          <p><strong>Paquete:</strong> {selectedPack.servicesPack.name}</p>
          <p><strong>Sesiones Restantes:</strong> {selectedPack.sessionsRemaining}</p>
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="employee" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Empleado:
        </label>
        <select
          id="employee"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        >
          <option value="">Selecciona un empleado...</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>{employee.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="employeePayment" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Pago al Empleado:
        </label>
        <input
          type="number"
          id="employeePayment"
          value={employeePayment}
          onChange={(e) => setEmployeePayment(e.target.value)}
          min="0"
          step="0.01"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Notas (opcional):
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
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
          {isLoading ? 'Registrando...' : 'Registrar Sesión'}
        </button>
      </div>
    </form>
  );
};

export default ServicesPackSessionForm;