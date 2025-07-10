// File: my-spa/src/components/EmployeeAvailabilityForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DayOfWeek } from '../enums/day-of-week.enum'; // <-- ¡CAMBIO AQUÍ!

const API_BASE_URL = 'http://localhost:3000';

// Importa el enum DayOfWeek desde la nueva ubicación centralizada

// Interfaz para el empleado (solo lo necesario para el selector)
interface Employee {
  id: number;
  name: string;
}

interface EmployeeAvailability {
  id: number;
  employeeId: number;
  dayOfWeek: DayOfWeek; // <-- Usa el DayOfWeek importado
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  maxAppointmentsAtOnce: number;
  employee?: Employee; // Relación cargada eager
}

interface EmployeeAvailabilityFormData {
  employeeId: string; // Para el selector
  dayOfWeek: DayOfWeek | ''; // Para el selector
  startTime: string;
  endTime: string;
  maxAppointmentsAtOnce: string; // Para el input number
}

interface EmployeeAvailabilityFormProps {
  availability?: EmployeeAvailability; // Si se pasa, estamos editando
  onSuccess: () => void;
  onCancel: () => void;
}

const EmployeeAvailabilityForm: React.FC<EmployeeAvailabilityFormProps> = ({ availability, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<EmployeeAvailabilityFormData>({
    employeeId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    maxAppointmentsAtOnce: '1', // Valor por defecto
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]); // Para el selector de empleados

  const isEditing = !!availability;

  // Cargar lista de empleados
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get<Employee[]>(`${API_BASE_URL}/employees`);
        setEmployees(response.data);
      } catch (err) {
        console.error("Error loading employees for form:", err);
        setError("Error al cargar la lista de empleados.");
      }
    };
    fetchEmployees();
  }, []);

  // Pre-poblar formulario si estamos editando
  useEffect(() => {
    if (availability) {
      setFormData({
        employeeId: availability.employeeId.toString(),
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
        maxAppointmentsAtOnce: availability.maxAppointmentsAtOnce.toString(),
      });
    }
  }, [availability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones frontend
      if (!formData.employeeId || !formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.maxAppointmentsAtOnce) {
        throw new Error('Por favor, completa todos los campos obligatorios.');
      }
      if (formData.startTime >= formData.endTime) {
        throw new Error('La hora de inicio debe ser anterior a la hora de fin.');
      }
      const maxApp = parseInt(formData.maxAppointmentsAtOnce, 10);
      if (isNaN(maxApp) || maxApp < 1) {
        throw new Error('El máximo de citas simultáneas debe ser un número mayor o igual a 1.');
      }

      const submitData = {
        employeeId: parseInt(formData.employeeId, 10),
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxAppointmentsAtOnce: maxApp,
      };

      const url = isEditing 
        ? `${API_BASE_URL}/employee-availabilities/${availability.id}` 
        : `${API_BASE_URL}/employee-availabilities`;
      
      const method = isEditing ? 'patch' : 'post';

      await axios[method](url, submitData);
      onSuccess();

    } catch (err: any) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la disponibilidad:`, err);
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
        setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la disponibilidad`);
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

      {/* Campo Empleado */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="employeeId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Empleado *
        </label>
        <select
          id="employeeId"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleInputChange}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Selecciona un empleado...</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      {/* Campo Día de la Semana */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="dayOfWeek" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Día de la Semana *
        </label>
        <select
          id="dayOfWeek"
          name="dayOfWeek"
          value={formData.dayOfWeek}
          onChange={handleInputChange}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Selecciona un día...</option>
          {Object.values(DayOfWeek).map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Campo Hora Inicio */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="startTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Hora Inicio *
        </label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {/* Campo Hora Fin */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="endTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Hora Fin *
        </label>
        <input
          type="time"
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {/* Campo Máximo de Citas Simultáneas */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="maxAppointmentsAtOnce" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Máx. Citas Simultáneas *
        </label>
        <input
          type="number"
          id="maxAppointmentsAtOnce"
          name="maxAppointmentsAtOnce"
          value={formData.maxAppointmentsAtOnce}
          onChange={handleInputChange}
          min="1"
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <small style={{ fontSize: '12px', color: '#666' }}>
          Número de citas que este empleado puede atender a la vez en este bloque.
        </small>
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
            : (isEditing ? 'Actualizar Disponibilidad' : 'Crear Disponibilidad')
          }
        </button>
      </div>
    </form>
  );
};

export default EmployeeAvailabilityForm;
