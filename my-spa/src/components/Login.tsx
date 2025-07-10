// File: my-spa/src/components/Login.tsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Importa Link
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f4f4' }}>
      <div style={{ padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '10px', border: 'none', background: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
            Entrar
          </button>
        </form>
        
        {/* --- ENLACE AÑADIDO --- */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/">← Volver a la página principal</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
