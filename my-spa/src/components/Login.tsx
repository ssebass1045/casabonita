// File: my-spa/src/components/Login.tsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';

const Login = () => {
  // 1. Cambiar estado a username
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // 2. Añadir estado para errores
  const [error, setError] = useState<string | null>(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 3. Tipar el evento y manejar errores
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    try {
      // 4. Usar username al llamar a login
      await login(username, password);
      navigate('/admin'); // Redirigir en caso de éxito
    } catch (err) {
      console.error('Fallo el inicio de sesión (componente):', err);
      // 5. Establecer mensaje de error para el usuario
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    // 6. Añadir un div contenedor si es necesario (si <></> da problemas)
    <>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        {/* 7. Mostrar el mensaje de error */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
          {/* 8. Cambiar label y atributos del input */}
          <label htmlFor="username">Usuario:</label>
          <input
            type="text" // Cambiar a text
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            />
        
        
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        
        <button type="submit">Iniciar Sesión</button>
      </form>
    </>
    
  );
};

export default Login;
