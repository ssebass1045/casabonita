// File: my-spa/src/components/ChangePassword.tsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../auth/authContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext); // Obtenemos el usuario para el ID

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setError('No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { newPassword };
      // El token JWT ya se envía globalmente por axios
      await axios.patch(`${API_BASE_URL}/users/password`, payload);

      setSuccessMessage('¡Contraseña actualizada correctamente!');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error("Error updating password:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para cambiar la contraseña. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al actualizar la contraseña.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Cambiar Contraseña</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
            {successMessage}
          </div>
        )}

        {/* Campo Nueva Contraseña */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nueva Contraseña:
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Campo Confirmar Contraseña */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Confirmar Nueva Contraseña:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Botón Actualizar */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
