// File: my-spa/src/components/EmployeeForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


// Define el enum de especialidad en el frontend para consistencia
export enum EmployeeSpecialty { // Exporta para usarlo en ManageEmployees
  ESTILISTA = 'Estilista',
  DERMATOLOGO = 'Dermatólogo/a', // <-- Asegúrate de que sea exactamente así
  MASAJISTA = 'Masajista',
  MANICURISTA = 'Manicurista',
  PELUQUERO = 'Peluquero/a',     // <-- Asegúrate de que sea exactamente así
  COSMETOLOGA = 'Cosmetologo/a',  // <-- Asegúrate de que sea exactamente así
  MEDICO = 'Médico',             // <-- Asegúrate de que sea exactamente así
  OTRO = 'Otro',
}

interface Employee {
  id: number;
  name: string;
  specialty?: EmployeeSpecialty; // <-- Usa el tipo EmployeeSpecialty
  description?: string;
  phone?: string;
  imageUrl?: string;
}

interface EmployeeFormData {
  name: string;
  specialty: EmployeeSpecialty | ''; // <-- Usa el tipo EmployeeSpecialty o string vacío
  description: string;
  phone: string;
  image: File | null;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    specialty: '', // Valor inicial vacío para el select
    description: '',
    phone: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!employee;

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        specialty: employee.specialty || '', // Pre-poblar
        description: employee.description || '',
        phone: employee.phone || '',
        image: null
      });
    }
  }, [employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { // Añade HTMLSelectElement
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
      if (!formData.name.trim()) {
        throw new Error('El nombre del empleado es obligatorio');
      }

      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      
      if (formData.specialty) { // Solo añadir si se seleccionó un valor
        submitData.append('specialty', formData.specialty);
      }
      if (formData.description.trim()) {
        submitData.append('description', formData.description.trim());
      }
      if (formData.phone.trim()) {
        submitData.append('phone', formData.phone.trim());
      }

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const url = isEditing 
        ? `${API_BASE_URL}/employees/${employee.id}` 
        : `${API_BASE_URL}/employees`;
      
      const method = isEditing ? 'patch' : 'post';

      await axios[method](url, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onSuccess();

    } catch (err: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} employee:`, err);
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
        setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el empleado`);
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
          Nombre del Empleado *
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
          placeholder="Ej: María García"
        />
      </div>

      {/* Campo Especialidad (Select/Dropdown) */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="specialty" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Especialidad
        </label>
        <select
          id="specialty"
          name="specialty"
          value={formData.specialty}
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
          {Object.values(EmployeeSpecialty).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Campo Descripción */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Biografía Corta
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
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
          placeholder="Escribe una breve biografía del empleado..."
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

      {/* Campo Imagen */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="image" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {isEditing ? 'Nueva Imagen del Empleado (opcional)' : 'Imagen del Empleado'}
        </label>
        
        {/* Mostrar imagen actual si estamos editando */}
        {isEditing && employee?.imageUrl && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Imagen actual:</p>
            <img 
              src={employee.imageUrl} 
              alt={employee.name} 
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
            : (isEditing ? 'Actualizar Empleado' : 'Crear Empleado')
          }
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
