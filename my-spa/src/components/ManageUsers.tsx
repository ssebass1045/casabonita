// File: my-spa/src/components/ManageUsers.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from './Modal';
import UserForm from './UserForm'; // Crearemos este formulario en el siguiente paso

const API_BASE_URL = 'http://localhost:3000';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Error al cargar los usuarios.");
      toast.error("Error al cargar los usuarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
    fetchUsers();
    toast.success("Operación de usuario realizada exitosamente.");
  };

  const handleOpenCreateModal = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`);
        fetchUsers();
        toast.success(`Usuario "${username}" eliminado exitosamente.`);
      } catch (err: any) {
        console.error("Error deleting user:", err);
        toast.error(err.response?.data?.message || "Error al eliminar el usuario.");
      }
    }
  };

  if (isLoading) return <div>Cargando usuarios...</div>;
  if (error) return <p className="message-error">{error}</p>;

  return (
    <div>
      <h2>Gestionar Usuarios</h2>
      <button
        className="action-button"
        style={{ backgroundColor: 'var(--color-success)', marginBottom: '20px' }}
        onClick={handleOpenCreateModal}
      >
        Añadir Nuevo Usuario
      </button>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                {/* El botón de eliminar está deshabilitado para el usuario admin (ID 1) */}
                <button
                  className="action-button delete"
                  onClick={() => handleDeleteUser(user.id, user.username)}
                  disabled={user.id === 1}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
      >
        <UserForm
          user={editingUser}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ManageUsers;
