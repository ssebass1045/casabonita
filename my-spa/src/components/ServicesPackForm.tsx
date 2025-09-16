import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface ServicesPack {
  id?: number;
  name: string;
  description?: string;
  totalPrice: number;
  sessionCount: number;
  isActive: boolean;
}

interface ServicesPackFormProps {
  servicesPack?: ServicesPack;
  onSuccess: () => void;
  onCancel: () => void;
}

const ServicesPackForm: React.FC<ServicesPackFormProps> = ({ 
  servicesPack, 
  onSuccess, 
  onCancel 
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [sessionCount, setSessionCount] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (servicesPack) {
      setName(servicesPack.name);
      setDescription(servicesPack.description || '');
      setTotalPrice(servicesPack.totalPrice.toString());
      setSessionCount(servicesPack.sessionCount.toString());
      setIsActive(servicesPack.isActive);
    }
  }, [servicesPack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const packData = {
        name,
        description,
        totalPrice: parseFloat(totalPrice),
        sessionCount: parseInt(sessionCount),
        isActive
      };

      if (servicesPack?.id) {
        // Editar paquete existente
        await axios.put(`${API_BASE_URL}/services-pack/${servicesPack.id}`, packData);
      } else {
        // Crear nuevo paquete
        await axios.post(`${API_BASE_URL}/services-pack`, packData);
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error saving services pack:", err);
      setError(err.response?.data?.message || "Error al guardar el paquete.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Nombre del Paquete:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Descripción:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="totalPrice" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Precio Total:
        </label>
        <input
          type="number"
          id="totalPrice"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          min="0"
          step="0.01"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="sessionCount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Número de Sesiones:
        </label>
        <input
          type="number"
          id="sessionCount"
          value={sessionCount}
          onChange={(e) => setSessionCount(e.target.value)}
          min="1"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Paquete Activo
        </label>
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
          {isLoading ? 'Guardando...' : (servicesPack ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};

export default ServicesPackForm;