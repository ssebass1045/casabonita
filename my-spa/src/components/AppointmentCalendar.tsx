// File: my-spa/src/components/AppointmentCalendar.tsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import axios from 'axios';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';

// Importa el enum DayOfWeek desde la nueva ubicación centralizada
import { DayOfWeek } from '../enums/day-of-week.enum'; // <-- ¡CAMBIO AQUÍ!

const API_BASE_URL = 'http://localhost:3000';

// Interfaces de datos (deben coincidir con el backend)
interface Client { id: number; name: string; }
interface Employee { id: number; name: string; specialty?: string; }
interface Treatment { id: number; name: string; price?: number; }
enum AppointmentStatus { PENDIENTE = 'Pendiente', CONFIRMADA = 'Confirmada', CANCELADA = 'Cancelada', REALIZADA = 'Realizada' }
enum PaymentMethod { EFECTIVO = 'Efectivo', TARJETA = 'Tarjeta', TRANSFERENCIA = 'Transferencia', OTRO = 'Otro' }
enum PaymentStatus { PENDIENTE = 'Pendiente', PAGADO = 'Pagado' }

interface Appointment {
  id: number;
  clientId: number;
  employeeId: number;
  treatmentId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  price?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
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

interface AppointmentCalendarProps { 
  appointments: Appointment[];
  employees: Employee[];
  employeeAvailabilities: EmployeeAvailability[];
  onEventClick: (appointment: Appointment) => void;
  onDateClick: (date: Date) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ 
  appointments, 
  employees, 
  employeeAvailabilities, 
  onEventClick, 
  onDateClick 
}) => {
  const calendarRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  const [initialFormDate, setInitialFormDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [employeesRes, appointmentsRes, availabilitiesRes] = await Promise.all([
          axios.get<Employee[]>(`${API_BASE_URL}/employees`),
          axios.get<Appointment[]>(`${API_BASE_URL}/appointments`),
          axios.get<EmployeeAvailability[]>(`${API_BASE_URL}/employee-availabilities`),
        ]);
        // Estos setStates ya no son necesarios aquí, los datos vienen de props
        // setEmployees(employeesRes.data);
        // setAppointments(appointmentsRes.data);
        // setEmployeeAvailabilities(availabilitiesRes.data);
      } catch (err: any) {
        console.error("Error fetching calendar data:", err);
        setError(err.message || "Error al cargar los datos del calendario.");
      } finally {
        setIsLoading(false);
      }
    };
    // fetchData(); // Ya no se llama aquí, el padre ManageAppointments lo hace
  }, []);

  // Función para transformar citas a eventos de FullCalendar
  const getCalendarEvents = () => {
    return appointments.map(app => ({
      id: app.id.toString(),
      resourceId: app.employeeId.toString(),
      title: `${app.treatment?.name || 'Servicio'} - ${app.client?.name || 'Cliente'}`,
      start: app.startTime,
      end: app.endTime,
      extendedProps: {
        appointmentData: app
      },
      color: app.status === AppointmentStatus.CONFIRMADA ? '#28a745' : (app.status === AppointmentStatus.PENDIENTE ? '#ffc107' : '#dc3545'),
    }));
  };

  // Función para transformar disponibilidad a eventos de fondo de FullCalendar
  const getCalendarResources = () => {
    return employees.map(emp => ({
      id: emp.id.toString(),
      title: emp.name,
      extendedProps: {
        specialty: emp.specialty,
      }
    }));
  };

  const getCalendarBusinessHours = () => {
    return employeeAvailabilities.map(av => ({
      daysOfWeek: [Object.values(DayOfWeek).indexOf(av.dayOfWeek) + 1],
      startTime: av.startTime,
      endTime: av.endTime,
      resourceId: av.employeeId.toString(),
      display: 'background',
      color: '#e0ffe0',
    }));
  };

  // Manejadores de eventos del calendario
  const handleDateClick = (arg: any) => {
    onDateClick(arg.date);
  };

  const handleEventClick = (clickInfo: any) => {
    onEventClick(clickInfo.event.extendedProps.appointmentData);
  };

  const handleFormSuccess = async () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
    setInitialFormDate(null);
    // Estos setStates ya no son necesarios aquí, el padre ManageAppointments lo hace
    // const [employeesRes, appointmentsRes, availabilitiesRes] = await Promise.all([
    //   axios.get<Employee[]>(`${API_BASE_URL}/employees`),
    //   axios.get<Appointment[]>(`${API_BASE_URL}/appointments`),
    //   axios.get<EmployeeAvailability[]>(`${API_BASE_URL}/employee-availabilities`),
    // ]);
    // setEmployees(employeesRes.data);
    // setAppointments(appointmentsRes.data);
    // setEmployeeAvailabilities(availabilitiesRes.data);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
    setInitialFormDate(null);
  };

  // Los checks de isLoading y error ahora se manejan en ManageAppointments
  // if (isLoading) { return <div>Cargando calendario...</div>; }
  // if (error) { return <p style={{ color: 'red' }}>Error: {error}</p>; }

  return (
    <div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimelinePlugin]}
        initialView="resourceTimelineDay"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek,dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="es"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        nowIndicator={true}

        resources={getCalendarResources()}
        resourceAreaHeaderContent="Empleados"

        events={getCalendarEvents()}
        eventClick={handleEventClick}

        businessHours={getCalendarBusinessHours()}

        select={handleDateClick}
      />

      {/* El Modal y AppointmentForm ahora se renderizan en ManageAppointments */}
      {/*
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
      */}
    </div>
  );
};

export default AppointmentCalendar;
