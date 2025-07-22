// File: my-spa/src/layouts/PublicLayout.tsx
import React, { useState, useContext } from 'react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AuthContext } from '../auth/authContext';
import AdminToolbar from '../components/AdminToolbar';

const PublicLayout = () => {
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setMenuOpen] = useState(false); // Estado para el menú móvil

  const topOffset = user ? '56px' : '0';

  // Función para abrir/cerrar el menú
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  // Función para cerrar el menú (útil al hacer clic en un enlace)
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {user && <AdminToolbar />}
      
      <div className='App'>
        <nav className="public-navbar" style={{ top: topOffset }}>
          {/* Contenedor principal para alinear el logo y el botón */}
          <div className="public-navbar-container">
            <HashLink to="/#welcome" className="public-navbar-brand" onClick={closeMenu}>
              Casa Bonita SPA
            </HashLink>
            
            {/* Botón de Hamburguesa (visible en móvil) */}
            <button className="public-menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? 'Cerrar' : 'Menú'}
            </button>

            {/* Agrupación de enlaces de navegación */}
            <div className={`public-navbar-links-group ${isMenuOpen ? 'is-open' : ''}`}>
              <HashLink smooth to="/#about" className="public-navbar-link" onClick={closeMenu}>Conoce</HashLink>
              <HashLink smooth to="/#treatments" className="public-navbar-link" onClick={closeMenu}>Tratamientos</HashLink>
              <HashLink smooth to="/#products" className="public-navbar-link" onClick={closeMenu}>Productos</HashLink>
              <HashLink smooth to="/#blogs" className="public-navbar-link" onClick={closeMenu}>Blog</HashLink>
              <HashLink smooth to="/#employees" className="public-navbar-link" onClick={closeMenu}>Equipo</HashLink>
              <HashLink smooth to="/#contact" className="public-navbar-link" onClick={closeMenu}>Contacto</HashLink>
              
              {!user && (
                <RouterLink to="/login" className="public-navbar-link login-button" onClick={closeMenu}>Login</RouterLink>
              )}
            </div>
          </div>
        </nav>

        <Outlet /> 
      </div>
    </>
  );
};

export default PublicLayout;
