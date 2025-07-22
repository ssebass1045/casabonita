// File: my-spa/src/components/Login.tsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      console.error('Login failed on component:', err);
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="login-container"> {/* Clase para el contenedor principal */}
      <div className="login-card"> {/* Clase para la tarjeta de login */}
        <h1 className="login-brand">Casa Bonita SPA</h1> {/* Título/Logo */}
        <h2 className="login-title">Iniciar Sesión</h2> {/* Título del formulario */}
        <form onSubmit={handleSubmit} className="login-form"> {/* Clase para el formulario */}
          {error && <p className="login-error-message">{error}</p>} {/* Clase para mensajes de error */}
          
          <div className="form-group"> {/* Clase para agrupar label e input */}
            <label htmlFor="username" className="form-label">Usuario:</label>
            <input
              type="text"
              id="username"
              name="username" // Añadir name para consistencia
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input" // Clase para los inputs
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password" // Añadir name para consistencia
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <button type="submit" className="login-button"> {/* Clase para el botón */}
            Entrar
          </button>
        </form>
        
        <div className="login-back-link-container"> {/* Contenedor para el enlace de volver */}
          <Link to="/" className="login-back-link">← Volver a la página principal</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
