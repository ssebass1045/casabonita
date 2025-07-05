// File: my-spa/src/components/ClientForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: Gender | '';
  observations: string; // <-- NUEVO CAMPO
}

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    observations: '', // <-- Inicializar
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        age: client.age ? client.age.toString() : '',
        gender: client.gender || '',
        observations: client.observations || '', // <-- Pre-poblar
      });
    }
  }, [client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('El nombre del cliente es obligatorio');
      }

      let ageNumber: number | undefined = undefined;
      if (formData.age.trim()) {
        const parsedAge = parseInt(formData.age, 10);
        if (isNaN(parsedAge) || parsedAge < 0) {
          throw new Error('La edad debe ser un número válido mayor o igual a 0');
        }
        ageNumber = parsedAge;
      }

      const submitData: any = {
        name: formData.name.trim(),
      };

      if (formData.phone.trim()) {
        submitData.phone = formData.phone.trim();
      }
      if (formData.email.trim()) {
        submitData.email = formData.email.trim();
      }
      if (ageNumber !== undefined) {
        submitData.age = ageNumber;
      }
      if (formData.gender) {
        submitData.gender = formData.gender;
      }
      if (formData.observations.trim()) { // <-- Añadir al submitData
        submitData.observations = formData.observations.trim();
      }

      const url = isEditing 
        ? `${API_BASE_URL}/clients/${client.id}` 
        : `${API_BASE_URL}/clients`;
      
      const method = isEditing ? 'patch' : 'post';

      await axios[method](url, submitData);

      onSuccess();

    } catch (err: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} client:`, err);
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
        setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el cliente`);
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

      {/* Campo Nombre */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Nombre del Cliente *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Ej: Ana García"
        />
      </div>

      {/* Campo Teléfono */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Teléfono
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Ej: +57 300 123 4567"
        />
      </div>

      {/* Campo Email */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Ej: ana.garcia@example.com"
        />
      </div>

      {/* Campo Edad */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="age" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Edad
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          min="0"
          max="120"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Ej: 30"
        />
      </div>

      {/* Campo Género (Select/Dropdown) */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="gender" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Género
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">Selecciona...</option>
          {Object.values(Gender).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Campo Observaciones */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="observations" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Observaciones
        </label>
        <textarea
          id="observations"
          name="observations"
          value={formData.observations}
          onChange={handleInputChange}
          rows={4}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Notas importantes sobre el cliente (alergias, condiciones, etc.)..."
        />
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
            : (isEditing ? 'Actualizar Cliente' : 'Crear Cliente')
          }
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
