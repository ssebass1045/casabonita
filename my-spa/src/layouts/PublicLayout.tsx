// File: my-spa/src/layouts/PublicLayout.tsx
import React from 'react';
// ELIMINA: import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom'; // Solo necesitamos Link y Outlet si hay rutas anidadas
import ScrollToTop from '../components/ScrollToTop';
import ScrollContainer from '../components/ScrollContainer';

// ELIMINA las importaciones de componentes de sección aquí, se manejarán en App.tsx
// import Home from '../components/Home';
// import About from '../components/About';
// import Treatments from '../components/Treatments';
// import Blog from '../components/Blog';
// import Members from '../components/Members';
// import Contact from '../components/Contact';

const PublicLayout = () => {
  return (
    // ELIMINA <Router> y </Router>
    <> {/* Usamos un Fragment como contenedor raíz */}
      <ScrollToTop />
      <ScrollContainer>
        <div className='App'>
          <nav>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/about">Conoce Casa Bonita</Link></li>
              <li><Link to="/treatments">Tratamientos</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/members">Equipo De Trabajo</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </nav>

          {/* Aquí se renderizarán las rutas públicas anidadas definidas en App.tsx */}
          <Outlet /> 
        </div>
      </ScrollContainer>
    </>
  );
};

export default PublicLayout;
