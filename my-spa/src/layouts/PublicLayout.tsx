
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import ScrollContainer from '../components/ScrollContainer';

import Home from '../components/Home';
import About from '../components/About';
import Treatments from '../components/Treatments';
import Blog from '../components/Blog';
import Members from '../components/Members';
import Contact from '../components/Contact';

const PublicLayout = () => {
  return (
    <Router>
      <ScrollToTop/>
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
                
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/treatments" element={<Treatments />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/members" element={<Members />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
            </div>
        </ScrollContainer>
    </Router>
  );
};

export default PublicLayout;