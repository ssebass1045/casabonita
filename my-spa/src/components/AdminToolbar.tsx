// File: my-spa/src/components/AdminToolbar.tsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';

const AdminToolbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-toolbar"> {/* Aplicamos la clase principal */}
      <div className="admin-toolbar-group"> {/* Aplicamos la clase para el grupo de enlaces */}
        <Link to="/" className="admin-toolbar-link" target="_blank" rel="noopener noreferrer">Ver Sitio</Link>
        <span style={{ borderLeft: '1px solid var(--color-secondary)', margin: '0 var(--spacing-xs)' }}></span> {/* Usamos variable CSS */}
        <Link to="/admin" className="admin-toolbar-link" style={{ fontWeight: 'bold' }}>Panel de Admin</Link>
      </div>
      <div className="admin-toolbar-group"> {/* Aplicamos la clase para el grupo de enlaces */}
        <span style={{ marginRight: 'var(--spacing-md)' }}>Bienvenido, {user?.username || 'Admin'}</span> {/* Usamos variable CSS */}
        <Link to="/admin/change-password" className="admin-toolbar-link">Cambiar Contraseña</Link>
        <button onClick={handleLogout} className="admin-toolbar-button"> {/* Aplicamos la clase de botón */}
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;
