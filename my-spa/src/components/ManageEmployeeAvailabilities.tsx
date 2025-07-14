// File: my-spa/src/components/ManageEmployeeAvailabilities.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import EmployeeAvailabilityForm from './EmployeeAvailabilityForm'
import { DayOfWeek } from '../enums/day-of-week.enum';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


interface Employee {
  id: number;
  name: string;
}

interface EmployeeAvailability {
  id: number;
  employeeId: number;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  maxAppointmentsAtOnce: number;
  employee?: Employee; // Relación cargada eager
}

const ManageEmployeeAvailabilities = () => {
  const [availabilities, setAvailabilities] = useState<EmployeeAvailability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAvailability, setEditingAvailability] = useState<EmployeeAvailability | undefined>(undefined);

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<EmployeeAvailability[]>(`${API_BASE_URL}/employee-availabilities`);
      setAvailabilities(response.data);
    } catch (err: any) {
      console.error("Error fetching employee availabilities:", err);
      setError(err.message || "Error al cargar las disponibilidades.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvailability = async (availabilityId: number) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar esta disponibilidad?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(availabilityId);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/employee-availabilities/${availabilityId}`);
      setAvailabilities(prevAvailabilities => 
        prevAvailabilities.filter(availability => availability.id !== availabilityId)
      );
      console.log(`Disponibilidad ${availabilityId} eliminada exitosamente.`);
    } catch (err: any) {
      console.error("Error deleting availability:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para eliminar disponibilidades. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 404) {
        setError("La disponibilidad no fue encontrada. Puede que ya haya sido eliminada.");
        setAvailabilities(prevAvailabilities => 
          prevAvailabilities.filter(availability => availability.id !== availabilityId)
        );
      } else {
        setError(err.message || "Error al eliminar la disponibilidad.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAvailability(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (availability: EmployeeAvailability) => {
    setEditingAvailability(availability);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAvailability(undefined);
    fetchAvailabilities(); // Recarga la lista
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingAvailability(undefined);
  };

  if (isLoading) {
    return (
      <div>
        <p>Cargando disponibilidades...</p>
      </div>
    );
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
      <h2>Gestionar Disponibilidad de Empleados</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Añadir Nueva Disponibilidad
      </button>

      {availabilities.length === 0 ? (
        <p>No hay disponibilidades para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Día</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Máx. Citas Simultáneas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map((availability) => (
              <tr key={availability.id}>
                <td>{availability.id}</td>
                <td>{availability.employee?.name || 'N/A'}</td>
                <td>{availability.dayOfWeek}</td>
                <td>{availability.startTime}</td>
                <td>{availability.endTime}</td>
                <td>{availability.maxAppointmentsAtOnce}</td>
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
                    onClick={() => handleOpenEditModal(availability)}
                  >
                    Editar
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteAvailability(availability.id)}
                    disabled={isDeleting === availability.id}
                    style={{ 
                      backgroundColor: isDeleting === availability.id ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: isDeleting === availability.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isDeleting === availability.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingAvailability ? 'Editar Disponibilidad' : 'Añadir Nueva Disponibilidad'}
      >
        <EmployeeAvailabilityForm
          availability={editingAvailability}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageEmployeeAvailabilities;
