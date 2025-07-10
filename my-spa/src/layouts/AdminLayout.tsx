// File: my-spa/src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom'; // <-- Importa Link
import AdminToolbar from '../components/AdminToolbar';

const AdminLayout = () => {
  const layoutContainerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: 'calc(100vh - 56px)',
  };

  const sidebarStyle: React.CSSProperties = {
    flex: '0 0 250px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRight: '1px solid #dee2e6',
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    padding: '20px',
    overflowX: 'auto',
  };

  const navLinkStyle: React.CSSProperties = {
    display: 'block',
    padding: '10px 15px',
    textDecoration: 'none',
    color: '#343a40',
    borderRadius: '5px',
    marginBottom: '5px',
  };

  // Estilo para el enlace activo (puedes implementarlo con NavLink más adelante)
  const activeLinkStyle: React.CSSProperties = {
    ...navLinkStyle,
    backgroundColor: '#e9ecef',
    fontWeight: 'bold',
  };

  return (
    <div>
      <AdminToolbar />
      <div style={layoutContainerStyle}>
        <nav style={sidebarStyle}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* --- CAMBIO AQUÍ: Usamos <Link> en lugar de <a> --- */}
            <li><Link to="/admin/appointments" style={navLinkStyle}>Gestionar Citas</Link></li>
            <li><Link to="/admin/clients" style={navLinkStyle}>Gestionar Clientes</Link></li>
            <li><Link to="/admin/employees" style={navLinkStyle}>Gestionar Empleados</Link></li>
            <li><Link to="/admin/products" style={navLinkStyle}>Gestionar Productos</Link></li>
            <li><Link to="/admin/treatments" style={navLinkStyle}>Gestionar Tratamientos</Link></li>
            <li><Link to="/admin/blogs" style={navLinkStyle}>Gestionar Blogs</Link></li>
            <li><Link to="/admin/employee-availabilities" style={navLinkStyle}>Gestionar Disponibilidad</Link></li>
            <li><Link to="/admin/metrics" style={navLinkStyle}>Métricas</Link></li>
            <li><Link to="/admin/send-message" style={navLinkStyle}>Enviar Mensaje WhatsApp</Link></li>
            <li><Link to="/admin/payroll" style={navLinkStyle}>Liquidación Empleados</Link></li>
          </ul>
        </nav>

        <main style={mainContentStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
