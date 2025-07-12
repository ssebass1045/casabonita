// File: my-spa/src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminToolbar from '../components/AdminToolbar';

const AdminLayout = () => {
  return (
    <div>
      <AdminToolbar />
      <div className="admin-layout-container"> {/* Aplicamos la clase principal */}
        <nav className="admin-sidebar"> {/* Aplicamos la clase de barra lateral */}
          <ul className="admin-sidebar-list"> {/* Aplicamos la clase de lista */}
            {/* Usamos las clases para los enlaces de la barra lateral */}
            <li><Link to="/admin" className="admin-sidebar-link">Dashboard</Link></li>
            <li><Link to="/admin/appointments" className="admin-sidebar-link">Gestionar Citas</Link></li>
            <li><Link to="/admin/clients" className="admin-sidebar-link">Gestionar Clientes</Link></li>
            <li><Link to="/admin/employees" className="admin-sidebar-link">Gestionar Empleados</Link></li>
            <li><Link to="/admin/products" className="admin-sidebar-link">Gestionar Productos</Link></li>
            <li><Link to="/admin/treatments" className="admin-sidebar-link">Gestionar Tratamientos</Link></li>
            <li><Link to="/admin/blogs" className="admin-sidebar-link">Gestionar Blogs</Link></li>
            <li><Link to="/admin/employee-availabilities" className="admin-sidebar-link">Gestionar Disponibilidad</Link></li>
            <li><Link to="/admin/metrics" className="admin-sidebar-link">Métricas</Link></li>
            <li><Link to="/admin/send-message" className="admin-sidebar-link">Enviar Mensaje WhatsApp</Link></li>
            <li><Link to="/admin/payroll" className="admin-sidebar-link">Liquidación Empleados</Link></li>
            <li><Link to="/admin/change-password" className="admin-sidebar-link">Cambiar Contraseña</Link></li>
            {/* El enlace "Ver Sitio Público" ya está en AdminToolbar */}
          </ul>
        </nav>

        <main className="admin-main-content"> {/* Aplicamos la clase de contenido principal */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
