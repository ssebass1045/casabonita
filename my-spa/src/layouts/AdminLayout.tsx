// File: my-spa/src/layouts/AdminLayout.tsx
import React, { useState, useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AdminToolbar from '../components/AdminToolbar';
import { AuthContext, UserRole } from '../auth/authContext';
import { 
  FiHome, FiBarChart2, FiDollarSign, FiMessageSquare, 
  FiUsers, FiPackage, FiScissors, FiFileText, FiCalendar,
  FiUser, FiClipboard, FiUserCheck, FiSettings, FiMenu, FiX,
  FiBox
} from 'react-icons/fi';

// Crear componentes con tipo any para evitar los errores de TypeScript
const FiXIcon: React.FC<any> = FiX;
const FiMenuIcon: React.FC<any> = FiMenu;
const FiHomeIcon: React.FC<any> = FiHome;
const FiBarChart2Icon: React.FC<any> = FiBarChart2;
const FiDollarSignIcon: React.FC<any> = FiDollarSign;
const FiBoxIcon: React.FC<any> = FiBox
const FiMessageSquareIcon: React.FC<any> = FiMessageSquare;
const FiUsersIcon: React.FC<any> = FiUsers;
const FiPackageIcon: React.FC<any> = FiPackage;
const FiScissorsIcon: React.FC<any> = FiScissors;
const FiFileTextIcon: React.FC<any> = FiFileText;
const FiCalendarIcon: React.FC<any> = FiCalendar;
const FiUserIcon: React.FC<any> = FiUser;
const FiClipboardIcon: React.FC<any> = FiClipboard;
const FiUserCheckIcon: React.FC<any> = FiUserCheck;
const FiSettingsIcon: React.FC<any> = FiSettings;

const AdminLayout: React.FC = () => {
  const { hasRole } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const isActiveLink = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      <AdminToolbar />
      
      {/* Botón de hamburguesa para móviles */}
      <button className="admin-menu-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? <FiXIcon size={24} /> : <FiMenuIcon size={24} />}
      </button>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div className="admin-layout-container">
        <nav className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <div className="sidebar-header">
            <h2>Panel de Administración</h2>
          </div>
          
          <ul className="admin-sidebar-list">
            {hasRole(UserRole.ADMIN) && (
              <>
                <li>
                  <Link 
                    to="/admin" 
                    className={`admin-sidebar-link ${isActiveLink('/admin') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiHomeIcon className="sidebar-icon" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/metrics" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/metrics') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiBarChart2Icon className="sidebar-icon" />
                    <span>Métricas</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/payroll" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/payroll') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiDollarSignIcon className="sidebar-icon" />
                    <span>Liquidación Empleados</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/send-message" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/send-message') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiMessageSquareIcon className="sidebar-icon" />
                    <span>Enviar Mensaje WhatsApp</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/employees" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/employees') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiUsersIcon className="sidebar-icon" />
                    <span>Gestionar Empleados</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/products" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/products') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiPackageIcon className="sidebar-icon" />
                    <span>Gestionar Productos</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/treatments" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/treatments') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiScissorsIcon className="sidebar-icon" />
                    <span>Gestionar Tratamientos</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/services-packs" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/services-packs') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiBox className="sidebar-icon" /> {/* <-- Nuevo icono */}
                    <span>Gestionar Paquetes</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/client-packs" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/client-packs') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiUsers className="sidebar-icon" />
                    <span>Paquetes de Clientes</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/register-pack-session" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/register-pack-session') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiClipboard className="sidebar-icon" />
                    <span>Registrar Sesión</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/blogs" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/blogs') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiFileTextIcon className="sidebar-icon" />
                    <span>Gestionar Blogs</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/employee-availabilities" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/employee-availabilities') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiCalendarIcon className="sidebar-icon" />
                    <span>Gestionar Disponibilidad</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className={`admin-sidebar-link ${isActiveLink('/admin/users') ? 'active' : ''}`} 
                    onClick={toggleSidebar}
                  >
                    <FiUserCheckIcon className="sidebar-icon" />
                    <span>Gestionar Usuarios</span>
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link 
                to="/admin/appointments" 
                className={`admin-sidebar-link ${isActiveLink('/admin/appointments') ? 'active' : ''}`} 
                onClick={toggleSidebar}
              >
                <FiClipboardIcon className="sidebar-icon" />
                <span>Gestionar Citas</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/clients" 
                className={`admin-sidebar-link ${isActiveLink('/admin/clients') ? 'active' : ''}`} 
                onClick={toggleSidebar}
              >
                <FiUserIcon className="sidebar-icon" />
                <span>Gestionar Clientes</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/change-password" 
                className={`admin-sidebar-link ${isActiveLink('/admin/change-password') ? 'active' : ''}`} 
                onClick={toggleSidebar}
              >
                <FiSettingsIcon className="sidebar-icon" />
                <span>Cambiar Contraseña</span>
              </Link>
            </li>
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