// File: my-spa/src/components/Login.tsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/admin');
    } catch (error) {
      console.error('Login failed', error);
      // Aquí puedes mostrar un mensaje de error al usuario
    }
  };

  return (
    <>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
