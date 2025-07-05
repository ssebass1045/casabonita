// File: my-spa/src/components/ManageEmployees.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import EmployeeForm, { EmployeeSpecialty } from './EmployeeForm'; // <-- Importa el enum

const API_BASE_URL = 'http://localhost:3000';

interface Employee {
  id: number;
  name: string;
  specialty?: EmployeeSpecialty; // <-- Usa el tipo EmployeeSpecialty
  description?: string;
  phone?: string;
  imageUrl?: string;
}

const ManageEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Employee[]>(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      setError(err.message || "Error al cargar los empleados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: number, employeeName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar a "${employeeName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(employeeId);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/employees/${employeeId}`);
      setEmployees(prevEmployees => 
        prevEmployees.filter(employee => employee.id !== employeeId)
      );
      console.log(`Empleado "${employeeName}" eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para eliminar empleados. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 404) {
        setError("El empleado no fue encontrado. Puede que ya haya sido eliminado.");
        setEmployees(prevEmployees => 
          prevEmployees.filter(employee => employee.id !== employeeId)
        );
      } else {
        setError(err.message || "Error al eliminar el empleado.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEmployee(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingEmployee(undefined);
    fetchEmployees(); // Recarga la lista
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingEmployee(undefined);
  };

  if (isLoading) {
    return (
      <div>
        <p>Cargando empleados...</p>
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
      <h2>Gestionar Empleados</h2>

      <button 
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleOpenCreateModal}
      >
        Añadir Nuevo Empleado
      </button>

      {employees.length === 0 ? (
        <p>No hay empleados para mostrar.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Biografía</th>
              <th>Teléfono</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.specialty || '-'}</td> {/* <-- Mostrar especialidad */}
                <td>{employee.description?.substring(0, 50)}...</td>
                <td>{employee.phone || '-'}</td>
                <td>
                  {employee.imageUrl ? (
                    <img src={employee.imageUrl} alt={employee.name} width="50" />
                  ) : (
                    'No img'
                  )}
                </td>
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
                    onClick={() => handleOpenEditModal(employee)}
                  >
                    Editar
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                    disabled={isDeleting === employee.id}
                    style={{ 
                      backgroundColor: isDeleting === employee.id ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: isDeleting === employee.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isDeleting === employee.id ? 'Eliminando...' : 'Eliminar'}
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
        title={editingEmployee ? 'Editar Empleado' : 'Añadir Nuevo Empleado'}
      >
        <EmployeeForm
          employee={editingEmployee}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageEmployees;
