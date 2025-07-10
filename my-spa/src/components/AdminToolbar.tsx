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

  const toolbarStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    width: '100%',
    backgroundColor: '#343a40',
    color: 'white',
    zIndex: 1001,
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const linkStyle: React.CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 10px',
  };

  return (
    <div style={toolbarStyle}>
      <div>
        {/* --- ENLACE AÑADIDO --- */}
        <Link to="/" style={linkStyle} target="_blank" rel="noopener noreferrer">Ver Sitio</Link>
        <span style={{ borderLeft: '1px solid #6c757d', margin: '0 10px' }}></span>
        
        <Link to="/admin" style={linkStyle}><strong>Panel de Admin</strong></Link>
        <Link to="/admin/appointments" style={linkStyle}>Citas</Link>
        <Link to="/admin/clients" style={linkStyle}>Clientes</Link>
        <Link to="/admin/employees" style={linkStyle}>Empleados</Link>
        <Link to="/admin/treatments" style={linkStyle}>Tratamientos</Link>
        <Link to="/admin/products" style={linkStyle}>Productos</Link>
        <Link to="/admin/blogs" style={linkStyle}>Blogs</Link>
        <Link to="/admin/metrics" style={linkStyle}>Métricas</Link>
      </div>
      <div>
        <span style={{ marginRight: '20px' }}>Bienvenido, {user?.username || 'Admin'}</span>
        <Link to="/admin/change-password" style={linkStyle}>Cambiar Contraseña</Link>
        <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;
