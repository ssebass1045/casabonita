// File: my-spa/src/components/TreatmentForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

interface Treatment {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface TreatmentFormData {
  name: string;
  description: string;
  price: string;
  image: File | null;
}

interface TreatmentFormProps {
  treatment?: Treatment; // Opcional: si se pasa, estamos editando
  onSuccess: () => void;
  onCancel: () => void;
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({ treatment, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<TreatmentFormData>({
    name: '',
    description: '',
    price: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!treatment; // Determina si estamos editando

  // Efecto para pre-poblar el formulario si estamos editando
  useEffect(() => {
    if (treatment) {
      setFormData({
        name: treatment.name || '',
        description: treatment.description || '',
        price: treatment.price ? treatment.price.toString() : '',
        image: null // La imagen existente no se pre-carga en el input file
      });
    }
  }, [treatment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre del tratamiento es obligatorio');
      }

      // Validar precio si se proporciona
      let priceNumber: number | undefined = undefined;
      if (formData.price.trim()) {
        priceNumber = parseFloat(formData.price);
        if (isNaN(priceNumber) || priceNumber < 0) {
          throw new Error('El precio debe ser un número válido mayor o igual a 0');
        }
      }

      // Crear FormData para enviar archivos
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      
      // Solo agregar descripción si no está vacía
      if (formData.description.trim()) {
        submitData.append('description', formData.description.trim());
      }
      
      // Solo agregar precio si es válido
      if (priceNumber !== undefined) {
        submitData.append('price', priceNumber.toFixed(2));
      }

      // Añadir imagen si se seleccionó una nueva
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Determinar la URL y método HTTP
      const url = isEditing 
        ? `${API_BASE_URL}/treatments/${treatment.id}` 
        : `${API_BASE_URL}/treatments`;
      
      const method = isEditing ? 'patch' : 'post';

      // Enviar al backend
      await axios[method](url, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Éxito: llamar al callback
      onSuccess();

    } catch (err: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} treatment:`, err);
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
        setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el tratamiento`);
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
          Nombre del Tratamiento *
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
          placeholder="Ej: Limpieza Facial Profunda"
        />
      </div>

      {/* Campo Descripción */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Descripción
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
          placeholder="Describe el tratamiento..."
        />
      </div>

      {/* Campo Precio */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="price" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Precio ($)
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="0.00"
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Deja vacío si no quieres especificar un precio
        </small>
      </div>

      {/* Campo Imagen */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="image" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {isEditing ? 'Nueva Imagen del Tratamiento (opcional)' : 'Imagen del Tratamiento'}
        </label>
        
        {/* Mostrar imagen actual si estamos editando */}
        {isEditing && treatment?.imageUrl && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Imagen actual:</p>
            <img 
              src={treatment.imageUrl} 
              alt={treatment.name} 
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
            : (isEditing ? 'Actualizar Tratamiento' : 'Crear Tratamiento')
          }
        </button>
      </div>
    </form>
  );
};

export default TreatmentForm;
