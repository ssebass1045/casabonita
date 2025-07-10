// File: my-spa/src/components/ManageAppointments.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';
import AppointmentCalendar from './AppointmentCalendar';
import { DayOfWeek } from '../enums/day-of-week.enum';

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
  client?: Client;
  employee?: Employee;
  treatment?: Treatment;
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

// Enums para ordenación (deben coincidir con el backend)
enum AppointmentSortBy {
  ID = 'id',
  START_TIME = 'startTime',
  CLIENT_NAME = 'client.name',
  EMPLOYEE_NAME = 'employee.name',
  STATUS = 'status',
  PRICE = 'price',
}

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeAvailabilities, setEmployeeAvailabilities] = useState<EmployeeAvailability[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  const [initialFormDate, setInitialFormDate] = useState<Date | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<number | null>(null);
  const [isGeneratingCombinedInvoice, setIsGeneratingCombinedInvoice] = useState<boolean>(false);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<number[]>([]);
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState<number | null>(null);
  const [isSendingCombinedWhatsapp, setIsSendingCombinedWhatsapp] = useState<boolean>(false);

  // --- NUEVOS ESTADOS PARA PAGINACIÓN, FILTRADO Y ORDENACIÓN ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [filterClientId, setFilterClientId] = useState<string>('');
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<AppointmentSortBy>(AppointmentSortBy.START_TIME);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  // --- FIN NUEVOS ESTADOS ---

  const fetchAllCalendarData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const appointmentParams = {
        page: currentPage,
        limit: itemsPerPage,
        clientId: filterClientId || undefined,
        employeeId: filterEmployeeId || undefined,
        status: filterStatus || undefined,
        paymentStatus: filterPaymentStatus || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
        search: searchTerm || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      const [employeesRes, appointmentsRes, availabilitiesRes, clientsRes] = await Promise.all([
        axios.get<Employee[]>(`${API_BASE_URL}/employees`),
        axios.get<[Appointment[], number]>(`${API_BASE_URL}/appointments`, { params: appointmentParams }),
        axios.get<EmployeeAvailability[]>(`${API_BASE_URL}/employee-availabilities`),
        axios.get<Client[]>(`${API_BASE_URL}/clients`),
      ]);
      setEmployees(employeesRes.data);
      setAppointments(appointmentsRes.data[0]);
      setTotalAppointments(appointmentsRes.data[1]);
      setEmployeeAvailabilities(availabilitiesRes.data);
      setClients(clientsRes.data);
    } catch (err: any) {
      console.error("Error fetching calendar data:", err);
      setError(err.message || "Error al cargar los datos del calendario.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filterClientId, filterEmployeeId, filterStatus, filterPaymentStatus, filterStartDate, filterEndDate, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchAllCalendarData();
  }, [fetchAllCalendarData]);

  const handleOpenCreateModal = () => {
    setEditingAppointment(undefined);
    setInitialFormDate(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
    setInitialFormDate(null);
    fetchAllCalendarData();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
    setInitialFormDate(null);
  };

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
    } catch (err: any) {
      console.error(`Error al generar factura para la cita ${appointmentId}:`, err);
      setError(err.response?.data?.message || "Error al generar la factura.");
    } finally {
      setIsGeneratingInvoice(null);
    }
  };

  const handleCheckboxChange = (appointmentId: number, isChecked: boolean) => {
    setSelectedAppointmentIds(prevSelected => {
      if (isChecked) {
        return [...prevSelected, appointmentId];
      } else {
        return prevSelected.filter(id => id !== appointmentId);
      }
    });
  };

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
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura_combinada_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSelectedAppointmentIds([]);
    } catch (err: any) {
      console.error(`Error al generar factura combinada:`, err);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string);
          setError(errorData.message || "Error de validación al generar factura combinada.");
        } catch (parseError) {
          setError("Error de validación al generar factura combinada (formato de error desconocido).");
        }
      };
      reader.readAsText(err.response.data);
    } finally {
      setIsGeneratingCombinedInvoice(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar esta cita?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`);
      fetchAllCalendarData();
    } catch (err: any) {
      console.error("Error deleting appointment:", err);
      setError(err.response?.data?.message || "Error al eliminar la cita.");
    }
  };

  const handleSendInvoiceByWhatsapp = async (appointmentId: number) => {
    setIsSendingWhatsapp(appointmentId);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/${appointmentId}/send-whatsapp`);
      alert(response.data.message || 'Factura enviada por WhatsApp exitosamente.');
    } catch (err: any) {
      console.error('Error sending invoice by WhatsApp:', err);
      setError(err.response?.data?.message || 'Error al enviar la factura por WhatsApp.');
    } finally {
      setIsSendingWhatsapp(null);
    }
  };

  const handleSendCombinedInvoiceByWhatsapp = async () => {
    if (selectedAppointmentIds.length === 0) {
      setError("Selecciona al menos una cita para enviar una factura combinada por WhatsApp.");
      return;
    }
    setIsSendingCombinedWhatsapp(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/send-combined-whatsapp`, {
        appointmentIds: selectedAppointmentIds
      });
      alert(response.data.message || 'Factura combinada enviada por WhatsApp exitosamente.');
      setSelectedAppointmentIds([]);
    } catch (err: any) {
      console.error('Error sending combined invoice by WhatsApp:', err);
      setError(err.response?.data?.message || 'Error al enviar la factura combinada por WhatsApp.');
    } finally {
      setIsSendingCombinedWhatsapp(false);
    }
  };

  if (isLoading) {
    return <div>Cargando calendario y citas...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Recargar Página</button>
      </div>
    );
  }

  const totalPages = Math.ceil(totalAppointments / itemsPerPage);

  return (
    <div>
      <h2>Calendario de Citas</h2>
      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Agendar Nueva Cita (Manual)
      </button>
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
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3>Filtros y Búsqueda</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label htmlFor="filterClientId">Cliente:</label>
            <select id="filterClientId" value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">Todos</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterEmployeeId">Empleado:</label>
            <select id="filterEmployeeId" value={filterEmployeeId} onChange={(e) => setFilterEmployeeId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">Todos</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterStatus">Estado Cita:</label>
            <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">Todos</option>
              {Object.values(AppointmentStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterPaymentStatus">Estado Pago:</label>
            <select id="filterPaymentStatus" value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">Todos</option>
              {Object.values(PaymentStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterStartDate">Fecha Inicio:</label>
            <input type="date" id="filterStartDate" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label htmlFor="filterEndDate">Fecha Fin:</label>
            <input type="date" id="filterEndDate" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label htmlFor="searchTerm">Buscar:</label>
            <input type="text" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Nombre, notas, etc." style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>
        <button onClick={() => {
          setFilterClientId('');
          setFilterEmployeeId('');
          setFilterStatus('');
          setFilterPaymentStatus('');
          setFilterStartDate('');
          setFilterEndDate('');
          setSearchTerm('');
          setCurrentPage(1);
        }} style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Limpiar Filtros
        </button>
      </div>
      <h3>Listado de Citas</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          style={{
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
          {isGeneratingCombinedInvoice ? 'Generando...' : `Facturar Seleccionadas (${selectedAppointmentIds.length})`}
        </button>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: selectedAppointmentIds.length > 0 ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedAppointmentIds.length > 0 ? 'pointer' : 'not-allowed',
            opacity: selectedAppointmentIds.length > 0 ? 1 : 0.6
          }}
          onClick={handleSendCombinedInvoiceByWhatsapp}
          disabled={selectedAppointmentIds.length === 0 || isSendingCombinedWhatsapp}
        >
          {isSendingCombinedWhatsapp ? 'Enviando...' : `Enviar WhatsApp (${selectedAppointmentIds.length})`}
        </button>
      </div>
      {appointments.length === 0 ? (
        <p>No hay citas para mostrar con los filtros actuales.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em', marginTop: '20px' }}>
          <thead>
            <tr>
              <th></th>
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
              const isPending = appointment.status === AppointmentStatus.PENDIENTE;

              return (
                <tr key={appointment.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleCheckboxChange(appointment.id, e.target.checked)}
                      disabled={!canBeFactured}
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
                      style={{ marginRight: '5px', backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingAppointment(appointment);
                        setIsModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      style={{ marginRight: '5px', backgroundColor: canBeFactured ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: canBeFactured ? 'pointer' : 'not-allowed' }}
                      onClick={() => handleGenerateInvoice(appointment.id)}
                      disabled={!canBeFactured || isGeneratingInvoice === appointment.id}
                    >
                      {isGeneratingInvoice === appointment.id ? 'Generando...' : 'Facturar'}
                    </button>
                    <button
                      style={{ marginRight: '5px', backgroundColor: canBeFactured ? '#28a745' : '#ccc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: canBeFactured ? 'pointer' : 'not-allowed' }}
                      onClick={() => handleSendInvoiceByWhatsapp(appointment.id)}
                      disabled={!canBeFactured || isSendingWhatsapp === appointment.id}
                    >
                      {isSendingWhatsapp === appointment.id ? 'Enviando...' : 'Enviar WhatsApp'}
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      disabled={!isPending}
                      style={{ backgroundColor: isPending ? '#ff4444' : '#ccc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: isPending ? 'pointer' : 'not-allowed' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
          disabled={currentPage === 1}
          style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages} (Total: {totalAppointments} citas)</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
          disabled={currentPage === totalPages}
          style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Siguiente
        </button>
        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }} style={{ padding: '8px', borderRadius: '4px' }}>
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>
      </div>
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
