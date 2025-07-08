// File: my-spa/src/components/ManageAppointments.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';
import AppointmentCalendar from './AppointmentCalendar';

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

// La interfaz EmployeeAvailability ya usa el DayOfWeek importado
enum DayOfWeek {
  LUNES = 'Lunes',
  MARTES = 'Martes',
  MIERCOLES = 'Miércoles',
  JUEVES = 'Jueves',
  VIERNES = 'Viernes',
  SABADO = 'Sábado',
  DOMINGO = 'Domingo',
}

interface EmployeeAvailability {
  id: number;
  employeeId: number;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  maxAppointmentsAtOnce: number;
  employee?: Employee;
}

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeAvailabilities, setEmployeeAvailabilities] = useState<EmployeeAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  const [initialFormDate, setInitialFormDate] = useState<Date | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<number | null>(null);
  const [isGeneratingCombinedInvoice, setIsGeneratingCombinedInvoice] = useState<boolean>(false); // <-- NUEVO ESTADO
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<number[]>([]); // <-- NUEVO ESTADO

  const fetchAllCalendarData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [employeesRes, appointmentsRes, availabilitiesRes] = await Promise.all([
        axios.get<Employee[]>(`${API_BASE_URL}/employees`),
        axios.get<Appointment[]>(`${API_BASE_URL}/appointments`),
        axios.get<EmployeeAvailability[]>(`${API_BASE_URL}/employee-availabilities`),
      ]);
      setEmployees(employeesRes.data);
      setAppointments(appointmentsRes.data);
      setEmployeeAvailabilities(availabilitiesRes.data);
    } catch (err: any) {
      console.error("Error fetching calendar data:", err);
      setError(err.message || "Error al cargar los datos del calendario.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCalendarData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAppointment(undefined);
    setInitialFormDate(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
    setInitialFormDate(null);
    fetchAllCalendarData(); // Recarga la lista
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
    setInitialFormDate(null);
  };

  // Función para formatear fecha y hora
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- FUNCIÓN: Generar Factura Individual ---
  const handleGenerateInvoice = async (appointmentId: number) => {
    setIsGeneratingInvoice(appointmentId);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/${appointmentId}/generate`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura_${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Factura para la cita ${appointmentId} generada y descargada.`);

    } catch (err: any) {
      console.error(`Error al generar factura para la cita ${appointmentId}:`, err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para generar facturas. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "La cita no cumple los requisitos para ser facturada (debe estar Realizada y Pagada).");
      } else if (err.response?.status === 404) {
        setError("Cita no encontrada para generar factura.");
      } else {
        setError(err.message || "Error desconocido al generar la factura.");
      }
    } finally {
      setIsGeneratingInvoice(null);
    }
  };
  // --- FIN FUNCIÓN Generar Factura Individual ---

  // --- NUEVA FUNCIÓN: Manejar Selección de Checkbox ---
  const handleCheckboxChange = (appointmentId: number, isChecked: boolean) => {
    setSelectedAppointmentIds(prevSelected => {
      if (isChecked) {
        return [...prevSelected, appointmentId];
      } else {
        return prevSelected.filter(id => id !== appointmentId);
      }
    });
  };

  // --- NUEVA FUNCIÓN: Generar Factura Combinada ---
  const handleGenerateCombinedInvoice = async () => {
    if (selectedAppointmentIds.length === 0) {
      setError("Selecciona al menos una cita para generar una factura combinada.");
      return;
    }

    setIsGeneratingCombinedInvoice(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/generate-combined`, {
        appointmentIds: selectedAppointmentIds
      }, {
        responseType: 'blob', // Espera una respuesta binaria (el PDF)
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura_combinada_${new Date().getTime()}.pdf`); // Nombre genérico o basado en cliente
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Factura combinada generada y descargada para citas: ${selectedAppointmentIds.join(', ')}`);
      setSelectedAppointmentIds([]); // Limpiar selección después de generar

    } catch (err: any) {
      console.error(`Error al generar factura combinada:`, err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para generar facturas combinadas. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 400) {
        // Si el backend devuelve un mensaje de error específico (ej. citas de diferentes clientes)
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            setError(errorData.message || "Error de validación al generar factura combinada.");
          } catch (parseError) {
            setError("Error de validación al generar factura combinada (formato de error desconocido).");
          }
        };
        reader.readAsText(err.response.data); // Leer el blob de error como texto
      } else {
        setError(err.message || "Error desconocido al generar la factura combinada.");
      }
    } finally {
      setIsGeneratingCombinedInvoice(false);
    }
  };
  // --- FIN NUEVA FUNCIÓN Generar Factura Combinada ---


  if (isLoading) {
    return <div>Cargando calendario...</div>;
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
      <h2>Calendario de Citas</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Agendar Nueva Cita (Manual)
      </button>

      {/* Renderiza el componente del calendario */}
      <AppointmentCalendar
        appointments={appointments}
        employees={employees}
        employeeAvailabilities={employeeAvailabilities}
        onEventClick={(app) => {
          setEditingAppointment(app);
          setIsModalOpen(true);
        }}
        onDateClick={(date) => {
          setInitialFormDate(date);
          setIsModalOpen(true);
        }}
      />

      {/* TABLA DE CITAS */}
      <h3>Listado de Citas</h3>
      <button
        style={{
          marginBottom: '10px',
          padding: '10px 20px',
          backgroundColor: selectedAppointmentIds.length > 0 ? '#0056b3' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: selectedAppointmentIds.length > 0 ? 'pointer' : 'not-allowed',
          opacity: selectedAppointmentIds.length > 0 ? 1 : 0.6
        }}
        onClick={handleGenerateCombinedInvoice}
        disabled={selectedAppointmentIds.length === 0 || isGeneratingCombinedInvoice}
      >
        {isGeneratingCombinedInvoice ? 'Generando Combinada...' : `Facturar Seleccionadas (${selectedAppointmentIds.length})`}
      </button>

      {appointments.length === 0 ? (
        <p>No hay citas para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em', marginTop: '20px' }}>
          <thead>
            <tr>
              <th></th> {/* Columna para el checkbox */}
              <th>ID</th>
              <th>Cliente</th>
              <th>Profesional</th>
              <th>Servicio</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Precio</th>
              <th>Método Pago</th>
              <th>Estado Pago</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              const canBeFactured = appointment.status === AppointmentStatus.REALIZADA && appointment.paymentStatus === PaymentStatus.PAGADO;
              const isSelected = selectedAppointmentIds.includes(appointment.id);

              return (
                <tr key={appointment.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleCheckboxChange(appointment.id, e.target.checked)}
                      disabled={!canBeFactured} // Solo se pueden seleccionar citas facturables
                    />
                  </td>
                  <td>{appointment.id}</td>
                  <td>{appointment.client?.name || 'N/A'}</td>
                  <td>{appointment.employee?.name || 'N/A'}</td>
                  <td>{appointment.treatment?.name || 'N/A'}</td>
                  <td>{formatDateTime(appointment.startTime)}</td>
                  <td>{formatDateTime(appointment.endTime)}</td>
                  <td>{appointment.status}</td>
                  <td>${parseFloat(appointment.price?.toString() || '0').toFixed(2) || '0.00'}</td>
                  <td>{appointment.paymentMethod || '-'}</td>
                  <td>{appointment.paymentStatus}</td>
                  <td>{appointment.notes?.substring(0, 50) || '-'}...</td>
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
                      onClick={() => {
                        setEditingAppointment(appointment);
                        setIsModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    
                    {/* BOTÓN FACTURAR INDIVIDUAL */}
                    <button
                      style={{
                        marginRight: '5px',
                        backgroundColor: canBeFactured ? '#007bff' : '#ccc',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: canBeFactured ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => handleGenerateInvoice(appointment.id)}
                      disabled={!canBeFactured || isGeneratingInvoice === appointment.id}
                    >
                      {isGeneratingInvoice === appointment.id ? 'Generando...' : 'Facturar'}
                    </button>

                    {/* Botón Eliminar (puedes añadirlo si lo necesitas aquí) */}
                    {/*
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      disabled={isDeleting === appointment.id}
                      style={{
                        backgroundColor: isDeleting === appointment.id ? '#ccc' : '#ff4444',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        cursor: isDeleting === appointment.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isDeleting === appointment.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingAppointment ? 'Editar Cita' : 'Agendar Nueva Cita'}
      >
        <AppointmentForm
          appointment={editingAppointment}
          initialDate={initialFormDate}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageAppointments;
