// File: my-spa/src/layouts/AdminLayout.tsx
import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Opcional: Redirigir al login o a la página principal después del logout
    navigate('/login');
  };

  return (
    <>
      {/* Puedes añadir una cabecera común aquí si quieres */}
      <header style={{ background: '#eee', padding: '10px', marginBottom: '20px' }}>
        Panel de Administración - Bienvenido, {user?.username || 'Admin'}!
      </header>

      
        {/* Barra lateral de navegación */}
        <nav style={{ float: 'left', width: '200px', marginRight: '20px', borderRight: '1px solid #ccc', paddingRight: '20px' }}>
          <ul>
            <li><Link to="/admin/treatments">Gestionar Tratamientos</Link></li>
            <li><Link to="/admin/blogs">Gestionar Blogs</Link></li>
            <li><Link to="/admin/products">Gestionar Productos</Link></li>
            <li><Link to="/admin/appointments">Gestionar Citas</Link></li>
            <li><Link to="/admin/employees">Gestionar Empleados</Link></li>
            <li><Link to="/admin/clients">Gestionar Clientes</Link></li>
            <li><Link to="/admin/employee-availabilities">Gestionar Disponibilidad empleados</Link></li>
            <li><Link to="/admin/metrics">Métricas</Link></li>
            <li><Link to="/admin/change-password">Cambiar Contraseña</Link></li>
            <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
          </ul>
        </nav>

        {/* Área de contenido principal donde se renderizarán las rutas anidadas */}
        <main style={{ marginLeft: '220px' }}>
          <Outlet /> {/* Este componente renderiza el componente de la ruta hija activa */}
        </main>
    </>
      
    
  );
};

export default AdminLayout;
