// File: my-spa/src/components/UserForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, UserRole } from './ManageUsers'; // Importa la interfaz y el enum

const API_BASE_URL = 'http://localhost:3000';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
      // La contraseña no se pre-puebla por seguridad
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      username,
      password,
      role,
    };

    // En modo edición, la contraseña es opcional
    if (isEditing && !password) {
      delete (payload as any).password;
    }

    try {
      if (isEditing) {
        await axios.patch(`${API_BASE_URL}/users/${user.id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/users`, payload);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Error saving user:", err);
      toast.error(err.response?.data?.message || 'Error al guardar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="password">
          Contraseña {isEditing ? '(dejar en blanco para no cambiar)' : ''}
        </label>
        <input
          id="password"
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditing} // Requerida solo al crear
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="role">Rol</label>
        <select
          id="role"
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value={UserRole.ADMIN}>Admin</option>
          <option value={UserRole.STAFF}>Staff</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" onClick={onCancel} className="action-button" style={{ backgroundColor: 'var(--color-secondary)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="action-button" style={{ backgroundColor: 'var(--color-success)' }}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
