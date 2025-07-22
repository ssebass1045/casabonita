// File: my-spa/src/layouts/AdminLayout.tsx
import React, { useState, useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminToolbar from '../components/AdminToolbar';
import { AuthContext, UserRole } from '../auth/authContext';

const AdminLayout = () => {
  const { hasRole } = useContext(AuthContext);
  // Estado para controlar la visibilidad del menú en móviles
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <AdminToolbar />
      
      {/* Botón de hamburguesa visible solo en móviles */}
      <button className="admin-menu-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? 'Cerrar' : 'Menú'}
      </button>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div className="admin-layout-container">
        {/* Aplicamos la clase 'is-open' condicionalmente */}
        <nav className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <ul className="admin-sidebar-list">
            {hasRole(UserRole.ADMIN) && (
              <>
                <li><Link to="/admin" className="admin-sidebar-link" onClick={toggleSidebar}>Dashboard</Link></li>
                <li><Link to="/admin/metrics" className="admin-sidebar-link" onClick={toggleSidebar}>Métricas</Link></li>
                <li><Link to="/admin/payroll" className="admin-sidebar-link" onClick={toggleSidebar}>Liquidación Empleados</Link></li>
                <li><Link to="/admin/send-message" className="admin-sidebar-link" onClick={toggleSidebar}>Enviar Mensaje WhatsApp</Link></li>
                <li><Link to="/admin/employees" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Empleados</Link></li>
                <li><Link to="/admin/products" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Productos</Link></li>
                <li><Link to="/admin/treatments" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Tratamientos</Link></li>
                <li><Link to="/admin/blogs" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Blogs</Link></li>
                <li><Link to="/admin/employee-availabilities" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Disponibilidad</Link></li>
                <li><Link to="/admin/users" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Usuarios</Link></li>
              </>
            )}
            <li><Link to="/admin/appointments" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Citas</Link></li>
            <li><Link to="/admin/clients" className="admin-sidebar-link" onClick={toggleSidebar}>Gestionar Clientes</Link></li>
            <li><Link to="/admin/change-password" className="admin-sidebar-link" onClick={toggleSidebar}>Cambiar Contraseña</Link></li>
          </ul>
        </nav>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
