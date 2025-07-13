// File: my-spa/src/components/AppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// No necesitamos Modal ni ClientForm aquí, ya que redirigimos para crear cliente
// import Modal from './Modal';
// import ClientForm from './ClientForm';

const API_BASE_URL = 'http://localhost:3000';

// Definiciones de Enums (deben coincidir con el backend)
enum AppointmentStatus {
  PENDIENTE = 'Pendiente',
  CONFIRMADA = 'Confirmada',
  CANCELADA = 'Cancelada',
  REALIZADA = 'Realizada',
}

enum PaymentMethod {
  EFECTIVO = 'Efectivo',
  TARJETA = 'Tarjeta',
  TRANSFERENCIA = 'Transferencia',
  OTRO = 'Otro',
}

enum PaymentStatus {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
}

// Interfaces de datos (deben coincidir con el backend)
interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

interface Employee {
  id: number;
  name: string;
  specialty?: string;
}

interface Treatment {
  id: number;
  name: string;
  price?: number;
}

interface Appointment {
  id: number;
  clientId: number;
  employeeId: number;
  treatmentId: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: AppointmentStatus;
  price?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  // Las relaciones se cargan eager en el backend, así que también las tendremos aquí
  client?: Client;
  employee?: Employee;
  treatment?: Treatment;
}

interface AppointmentFormData {
  clientId: string; // Usamos string para el input select
  employeeId: string;
  treatmentId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string; // Duración en minutos (para calcular endTime)
  status: AppointmentStatus;
  price: string;
  paymentMethod: PaymentMethod | '';
  paymentStatus: PaymentStatus;
  notes: string;
}

interface AppointmentFormProps {
  appointment?: Appointment; // Si se pasa, estamos editando
  initialDate?: Date | null; // <-- NUEVO PROP: Fecha/hora inicial para crear
  onSuccess: () => void;
  onCancel: () => void;
}

const NOTES_TEMPLATE = `MOTIVO DE CONSULTA:

ENFERMEDAD ACTUAL:

EXAMEN MEDICO:

ANALISIS:

CONDUCTA:

DIAGNOSTICO:`;

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, initialDate, onSuccess, onCancel }) => { // <-- Recibe initialDate
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: '',
    employeeId: '',
    treatmentId: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : '', // <-- Usa initialDate
    time: initialDate ? initialDate.toTimeString().substring(0, 5) : '', // <-- Usa initialDate
    duration: '60', // Duración por defecto en minutos
    status: AppointmentStatus.PENDIENTE,
    price: '',
    paymentMethod: '',
    paymentStatus: PaymentStatus.PENDIENTE,
    notes: NOTES_TEMPLATE,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos para los selectores
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  // const [isClientModalOpen, setIsClientModalOpen] = useState(false); // <-- ELIMINA este estado

  // --- NUEVOS ESTADOS PARA EL BUSCADOR DE CLIENTES ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClientDisplay, setSelectedClientDisplay] = useState<string>(''); // Para mostrar el nombre del cliente seleccionado
  const [showClientSuggestions, setShowClientSuggestions] = useState<boolean>(false); // Para controlar la visibilidad de las sugerencias

  const isEditing = !!appointment;
  const navigate = useNavigate();

  // Cargar datos para los selectores
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, employeesRes, treatmentsRes] = await Promise.all([
          axios.get<Client[]>(`${API_BASE_URL}/clients`),
          axios.get<Employee[]>(`${API_BASE_URL}/employees`),
          axios.get<Treatment[]>(`${API_BASE_URL}/treatments`),
        ]);
        setClients(clientsRes.data);
        setEmployees(employeesRes.data);
        setTreatments(treatmentsRes.data);
      } catch (err) {
        console.error("Error loading form data:", err);
        setError("Error al cargar datos para el formulario.");
      }
    };
    fetchData();
  }, []);

  // Pre-poblar formulario si estamos editando
  useEffect(() => {
    if (appointment) {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));

      setFormData({
        clientId: appointment.clientId.toString(),
        employeeId: appointment.employeeId.toString(),
        treatmentId: appointment.treatmentId.toString(),
        date: startTime.toISOString().split('T')[0], // YYYY-MM-DD
        time: startTime.toTimeString().substring(0, 5), // HH:MM
        duration: durationMinutes.toString(),
        status: appointment.status,
        price: appointment.price ? appointment.price.toString() : '',
        paymentMethod: appointment.paymentMethod || '',
        paymentStatus: appointment.paymentStatus,
        notes: appointment.notes || NOTES_TEMPLATE,
      });
      // Pre-poblar el display del cliente si estamos editando
      if (appointment.client) {
        setSelectedClientDisplay(appointment.client.name);
      }
    } else if (initialDate) { // Si no estamos editando pero hay initialDate
        setFormData(prev => ({
            ...prev,
            date: initialDate.toISOString().split('T')[0],
            time: initialDate.toTimeString().substring(0, 5),
            notes: NOTES_TEMPLATE
        }));
    }
  }, [appointment, initialDate]); // <-- Añade initialDate a las dependencias

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- NUEVAS FUNCIONES PARA EL BUSCADOR DE CLIENTES ---
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowClientSuggestions(true); // Mostrar sugerencias al escribir
    setFormData(prev => ({ ...prev, clientId: '' })); // Limpiar clientId si se empieza a buscar de nuevo
    setSelectedClientDisplay(''); // Limpiar display
  };

  const handleClientSelect = (client: Client) => {
    setFormData(prev => ({ ...prev, clientId: client.id.toString() }));
    setSelectedClientDisplay(client.name);
    setSearchTerm(''); // Limpiar el término de búsqueda
    setShowClientSuggestions(false); // Ocultar sugerencias
  };

  const filteredClients = searchTerm.length > 0
    ? clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  // --- FIN NUEVAS FUNCIONES ---

  // Manejar cambio de tratamiento para auto-rellenar precio
  const handleTreatmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTreatmentId = parseInt(e.target.value, 10);
    const selectedTreatment = treatments.find(t => t.id === selectedTreatmentId);
    setFormData(prev => ({
      ...prev,
      treatmentId: e.target.value,
      price: selectedTreatment?.price ? parseFloat(selectedTreatment.price.toString()).toFixed(2) : '' // Auto-rellena precio
    }));
  };

  // Manejar cambio de estado de cita para validar pago
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as AppointmentStatus;
    setFormData(prev => ({
      ...prev,
      status: newStatus,
      // Si el estado es "Realizada", el estado de pago debe ser "Pagado"
      paymentStatus: newStatus === AppointmentStatus.REALIZADA ? PaymentStatus.PAGADO : prev.paymentStatus
    }));
  };

  // Manejar cambio de estado de pago
  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      paymentStatus: e.target.value as PaymentStatus
    }));
  };

  // Función para redirigir a la creación de cliente
  const handleCreateClientRedirect = () => {
    navigate('/admin/clients'); // Redirige a la página de gestión de clientes
    onCancel(); // Cierra el modal actual de agendamiento
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones frontend básicas
      if (!formData.clientId || !formData.employeeId || !formData.treatmentId || !formData.date || !formData.time || !formData.status || !formData.paymentStatus) {
        throw new Error('Por favor, completa todos los campos obligatorios.');
      }

      const parsedPrice = formData.price.trim() ? parseFloat(formData.price) : undefined;
      if (parsedPrice !== undefined && (isNaN(parsedPrice) || parsedPrice < 0)) {
        throw new Error('El precio debe ser un número válido mayor o igual a 0.');
      }

      // Calcular startTime y endTime
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
      const durationMinutes = parseInt(formData.duration, 10);
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        throw new Error('La duración debe ser un número válido de minutos.');
      }
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

      const submitData = {
        clientId: parseInt(formData.clientId, 10),
        employeeId: parseInt(formData.employeeId, 10),
        treatmentId: parseInt(formData.treatmentId, 10),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: formData.status,
        price: parsedPrice,
        paymentMethod: formData.paymentMethod || undefined,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes.trim() || undefined,
      };

      // Regla de negocio frontend: Si el estado es "Realizada", el pago debe ser "Pagado"
      if (submitData.status === AppointmentStatus.REALIZADA && submitData.paymentStatus !== PaymentStatus.PAGADO) {
        throw new Error('El estado de pago debe ser "Pagado" si el estado de la cita es "Realizada".');
      }

      const url = isEditing 
        ? `${API_BASE_URL}/appointments/${appointment.id}` 
        : `${API_BASE_URL}/appointments`;
      
      const method = isEditing ? 'patch' : 'post';

      await axios[method](url, submitData);
      onSuccess();

    } catch (err: any) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la cita:`, err);
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
        setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la cita`);
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

      {/* Buscador de Clientes y Crear Cliente */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="clientSearch" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Cliente *
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
          <input
            type="text"
            id="clientSearch"
            name="clientSearch"
            value={searchTerm || selectedClientDisplay} // Muestra el término de búsqueda o el cliente seleccionado
            onChange={handleSearchTermChange}
            onFocus={() => setShowClientSuggestions(true)} // Mostrar sugerencias al enfocar
            onBlur={() => setTimeout(() => setShowClientSuggestions(false), 100)} // Ocultar con un pequeño retraso
            placeholder="Buscar cliente por nombre..."
            style={{ flexGrow: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            required={!isEditing && !formData.clientId} // Requerido si no estamos editando y no hay cliente seleccionado
          />
          <button 
            type="button" 
            onClick={handleCreateClientRedirect}
            style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Crear Cliente
          </button>

          {/* Sugerencias de Clientes */}
          {showClientSuggestions && filteredClients.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              maxHeight: '150px',
              overflowY: 'auto',
              zIndex: 100,
              listStyle: 'none',
              padding: 0,
              margin: '5px 0 0 0'
            }}>
              {filteredClients.map(client => (
                <li
                  key={client.id}
                  onMouseDown={() => handleClientSelect(client)} // Usar onMouseDown para que se dispare antes de onBlur
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  {client.name} ({client.phone || client.email || 'Sin contacto'})
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Campo oculto para enviar el clientId real */}
        <input type="hidden" name="clientId" value={formData.clientId} required={!isEditing} />
        {formData.clientId && (
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Cliente seleccionado: <strong>{selectedClientDisplay}</strong>
          </p>
        )}
      </div>

      {/* Campo Servicio (Tratamiento) */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="treatmentId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Servicio *
        </label>
        <select
          id="treatmentId"
          name="treatmentId"
          value={formData.treatmentId}
          onChange={handleTreatmentChange} // Usa el handler específico
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Selecciona un servicio...</option>
          {treatments.map(treatment => (
            <option key={treatment.id} value={treatment.id}>{treatment.name} (${parseFloat(treatment.price?.toString() || '0').toFixed(2) || 'N/A'})</option>
          ))}
        </select>
      </div>

      {/* Campo Profesional (Empleado) */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="employeeId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Profesional *
        </label>
        <select
          id="employeeId"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleInputChange}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Selecciona un profesional...</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>{employee.name} ({employee.specialty || 'Sin especialidad'})</option>
          ))}
        </select>
      </div>

      {/* Fecha y Hora */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Fecha *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="time" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Hora Inicio *
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="duration" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Duración (min) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            min="1"
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Campo Estado de la Cita */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Estado de la Cita *
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleStatusChange} // Usa el handler específico
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          {Object.values(AppointmentStatus).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          placeholder="0.00"
        />
      </div>

      {/* Campo Método de Pago */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Método de Pago
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Selecciona...</option>
          {Object.values(PaymentMethod).map(pm => (
            <option key={pm} value={pm}>{pm}</option>
          ))}
        </select>
      </div>

      {/* Campo Estado de Pago */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="paymentStatus" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Estado de Pago *
        </label>
        <select
          id="paymentStatus"
          name="paymentStatus"
          value={formData.paymentStatus}
          onChange={handlePaymentStatusChange} // Usa el handler específico
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          {Object.values(PaymentStatus).map(ps => (
            <option key={ps} value={ps}>{ps}</option>
          ))}
        </select>
      </div>

      {/* Campo Notas */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={4}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
          placeholder="Observaciones adicionales sobre la cita..."
        />
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{ padding: '10px 20px', border: '1px solid #ccc', backgroundColor: '#f5f5f5', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: '10px 20px', border: 'none', backgroundColor: isSubmitting ? '#ccc' : '#007bff', color: 'white', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting 
            ? (isEditing ? 'Actualizando...' : 'Agendando...') 
            : (isEditing ? 'Actualizar Cita' : 'Agendar Cita')
          }
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
