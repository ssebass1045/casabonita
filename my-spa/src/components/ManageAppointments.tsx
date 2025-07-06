// File: my-spa/src/components/ManageAppointments.tsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';
import { AuthContext } from '../auth/authContext';
import AppointmentCalendar from './AppointmentCalendar';

// Importa el enum DayOfWeek desde la nueva ubicación centralizada
import { DayOfWeek } from '../enums/day-of-week.enum'; // <-- ¡CAMBIO AQUÍ!

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
interface EmployeeAvailability {
  id: number;
  employeeId: number;
  dayOfWeek: DayOfWeek; // <-- Usa el DayOfWeek importado
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
    fetchAllCalendarData();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
    setInitialFormDate(null);
  };

  if (isLoading) {
    return <div>Cargando calendario...</div>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
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
