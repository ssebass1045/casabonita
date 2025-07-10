// File: my-spa/src/layouts/PublicLayout.tsx
import React, { useContext } from 'react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AuthContext } from '../auth/authContext';
import AdminToolbar from '../components/AdminToolbar';

const PublicLayout = () => {
  const { user } = useContext(AuthContext);

  // Estilo para la barra de navegación pública
  const navStyle: React.CSSProperties = {
    position: 'sticky',
    top: user ? '56px' : '0',
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '0 20px', // Añadimos padding horizontal
  };

  // --- NUEVOS ESTILOS para la lista y los enlaces ---
  const ulStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between', // Distribuye el espacio
    alignItems: 'center',
    listStyle: 'none',
    margin: 0,
    padding: '15px 0',
    height: '100%',
  };

  const linkGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px', // Espacio entre los enlaces
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 500,
  };
  // --- FIN NUEVOS ESTILOS ---

  return (
    <>
      {user && <AdminToolbar />}
      
      <div className='App'>
        <nav style={navStyle}>
          {/* --- CAMBIO AQUÍ: Aplicamos los nuevos estilos y estructura --- */}
          <ul style={ulStyle}>
            <li>
              <HashLink to="/#welcome" style={{ ...linkStyle, fontWeight: 'bold', fontSize: '1.2em' }}>
                Casa Bonita SPA
              </HashLink>
            </li>
            <li style={linkGroupStyle}>
              <HashLink smooth to="/#about" style={linkStyle}>Conoce</HashLink>
              <HashLink smooth to="/#treatments" style={linkStyle}>Tratamientos</HashLink>
              <HashLink smooth to="/#products" style={linkStyle}>Productos</HashLink>
              <HashLink smooth to="/#blogs" style={linkStyle}>Blog</HashLink>
              <HashLink smooth to="/#employees" style={linkStyle}>Equipo</HashLink>
              <HashLink smooth to="/#contact" style={linkStyle}>Contacto</HashLink>
            </li>
            <li>
              {!user && (
                <RouterLink to="/login" style={{ ...linkStyle, fontWeight: 'bold' }}>Login</RouterLink>
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
