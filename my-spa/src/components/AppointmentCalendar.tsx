// File: my-spa/src/components/AppointmentCalendar.tsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// ELIMINA: import resourceTimelinePlugin from '@fullcalendar/resource-timeline'; // Ya no necesitamos este plugin
import axios from 'axios';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';

// Importa el enum DayOfWeek desde la nueva ubicación centralizada
import { DayOfWeek } from '../enums/day-of-week.enum';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


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

interface EmployeeAvailability {
  id: number;
  employeeId: number;
  dayOfWeek: DayOfWeek;
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
  // Los estados de carga y error ahora se manejan en ManageAppointments
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // Los estados del modal se manejan en ManageAppointments
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  // const [initialFormDate, setInitialFormDate] = useState<Date | null>(null);

  // ELIMINA el useEffect de carga de datos, ahora se hace en ManageAppointments
  // useEffect(() => { ... }, []);

  // Función para transformar citas a eventos de FullCalendar
  const getCalendarEvents = () => {
    return appointments.map(app => ({
      id: app.id.toString(),
      // resourceId: app.employeeId.toString(), // Ya no necesitamos resourceId
      title: `${app.treatment?.name || 'Servicio'} - ${app.client?.name || 'Cliente'} (${app.employee?.name || 'Empleado'})`, // Añade empleado al título
      start: app.startTime,
      end: app.endTime,
      extendedProps: {
        appointmentData: app
      },
      color: app.status === AppointmentStatus.CONFIRMADA ? '#28a745' : (app.status === AppointmentStatus.PENDIENTE ? '#ffc107' : '#dc3545'),
    }));
  };

  // Función para transformar disponibilidad a eventos de fondo de FullCalendar
  // Ahora se aplica a todo el calendario, no por recurso
  const getCalendarBusinessHours = () => {
    // Mapea las disponibilidades a un formato que FullCalendar entienda para businessHours
    // Esto asume que quieres mostrar la disponibilidad general del SPA, no por empleado individual en esta vista
    const businessHours = employeeAvailabilities.map(av => ({
      daysOfWeek: [Object.values(DayOfWeek).indexOf(av.dayOfWeek) + 1], // Convierte enum a número de día (1=Lunes, 7=Domingo)
      startTime: av.startTime, // HH:MM
      endTime: av.endTime,     // HH:MM
      // resourceId ya no es necesario aquí
      // display: 'background', // Esto ya está implícito en businessHours
      // color: '#e0ffe0', // Esto ya está implícito en businessHours
    }));
    // Si hay múltiples bloques para el mismo día, FullCalendar los combinará
    return businessHours;
  };

  // Manejadores de eventos del calendario
  const handleDateClick = (arg: any) => {
    onDateClick(arg.date);
  };

  const handleEventClick = (clickInfo: any) => {
    onEventClick(clickInfo.event.extendedProps.appointmentData);
  };

  // handleFormSuccess y handleFormCancel se manejan en ManageAppointments

  // Los checks de isLoading y error ahora se manejan en ManageAppointments
  // if (isLoading) { return <div>Cargando calendario...</div>; }
  // if (error) { return <p style={{ color: 'red' }}>Error: {error}</p>; }

  return (
    <div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // ELIMINA resourceTimelinePlugin
        initialView="timeGridWeek" // <-- CAMBIO: Vista semanal por franjas de tiempo
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay,dayGridMonth' // <-- Ajusta las vistas disponibles
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

        // ELIMINA: resources={getCalendarResources()}
        // ELIMINA: resourceAreaHeaderContent="Empleados"

        events={getCalendarEvents()}
        eventClick={handleEventClick}

        businessHours={getCalendarBusinessHours()} // Se aplica a todo el calendario

        select={handleDateClick}
        // eventDrop={handleEventDrop} // Para arrastrar y soltar citas (implementar después)
        // eventResize={handleEventResize} // Para redimensionar citas (implementar después)
      />

      {/* El Modal y AppointmentForm ahora se renderizan en ManageAppointments */}
    </div>
  );
};

export default AppointmentCalendar;
