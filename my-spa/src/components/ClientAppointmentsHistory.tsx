// File: my-spa/src/components/ClientAppointmentsHistory.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

interface ClientAppointmentsHistoryProps {
  clientId: number;
  clientName: string;
}

const ClientAppointmentsHistory: React.FC<ClientAppointmentsHistoryProps> = ({ clientId, clientName }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Llama al nuevo endpoint protegido por clientId
        const response = await axios.get<Appointment[]>(`${API_BASE_URL}/appointments/client/${clientId}`);
        setAppointments(response.data);
      } catch (err: any) {
        console.error(`Error fetching appointments for client ${clientId}:`, err);
        if (err.response?.status === 401) {
          setError("No tienes autorización para ver el historial de citas. Por favor, inicia sesión nuevamente.");
        } else if (err.response?.status === 404) {
          setError("Cliente no encontrado o no tiene citas.");
        } else {
          setError(err.message || "Error al cargar el historial de citas.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientAppointments();
  }, [clientId]); // Recarga si el clientId cambia

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

  if (isLoading) {
    return <div>Cargando historial de citas...</div>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h3>Historial de Citas de {clientName}</h3>
      {appointments.length === 0 ? (
        <p>Este cliente no tiene citas registradas.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
          <thead>
            <tr>
              <th>ID Cita</th>
              <th>Servicio</th>
              <th>Profesional</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Precio</th>
              <th>Método Pago</th>
              <th>Estado Pago</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{appointment.treatment?.name || 'N/A'}</td>
                <td>{appointment.employee?.name || 'N/A'}</td>
                <td>{formatDateTime(appointment.startTime)}</td>
                <td>{formatDateTime(appointment.endTime)}</td>
                <td>{appointment.status}</td>
                <td>${parseFloat(appointment.price?.toString() || '0').toFixed(2) || '0.00'}</td>
                <td>{appointment.paymentMethod || '-'}</td>
                <td>{appointment.paymentStatus}</td>
                <td>{appointment.notes?.substring(0, 50) || '-'}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientAppointmentsHistory;
