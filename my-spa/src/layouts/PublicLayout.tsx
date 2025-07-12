// File: my-spa/src/layouts/PublicLayout.tsx
import React, { useContext } from 'react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AuthContext } from '../auth/authContext';
import AdminToolbar from '../components/AdminToolbar';

const PublicLayout = () => {
  const { user } = useContext(AuthContext);

  // La altura del AdminToolbar es de aproximadamente 56px (padding + altura de línea)
  const topOffset = user ? '56px' : '0'; 

  return (
    <>
      {/* Muestra el AdminToolbar solo si el usuario está logueado */}
      {user && <AdminToolbar />}
      
      <div className='App'>
        {/* Aplicamos la clase public-navbar y el top dinámico */}
        <nav className="public-navbar" style={{ top: topOffset }}>
          <ul className="public-navbar-list">
            <li>
              <HashLink to="/#welcome" className="public-navbar-brand">
                Casa Bonita SPA
              </HashLink>
            </li>
            <li className="public-navbar-group">
              <HashLink smooth to="/#about" className="public-navbar-link">Conoce</HashLink>
              <HashLink smooth to="/#treatments" className="public-navbar-link">Tratamientos</HashLink>
              <HashLink smooth to="/#products" className="public-navbar-link">Productos</HashLink>
              <HashLink smooth to="/#blogs" className="public-navbar-link">Blog</HashLink>
              <HashLink smooth to="/#employees" className="public-navbar-link">Equipo</HashLink>
              <HashLink smooth to="/#contact" className="public-navbar-link">Contacto</HashLink>
            </li>
            <li>
              {!user && (
                <RouterLink to="/login" className="public-navbar-link login-button">Login</RouterLink>
              )}
            </li>
          </ul>
        </nav>

        <Outlet /> 
      </div>
    </>
  );
};

export default PublicLayout;
