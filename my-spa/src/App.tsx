// File: my-spa/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import AdminLayout from './layouts/AdminLayout';

// Componentes de Página/Sección (Importa todos los que se usarán en las rutas)
import Login from './components/Login';
import ManageTreatments from './components/ManageTreatments';
import ManageBlogs from './components/ManageBlogs';
import ManageEmployees from './components/ManageEmployees';
import ManageProducts from './components/ManageProducts';
import ManageClients from './components/ManageClients';
import ChangePassword from './components/ChangePassword';

// Componentes de las secciones públicas (ahora importados aquí)
import Home from './components/Home';
import About from './components/About';
import Treatments from './components/Treatments'; // Estos son los componentes de vista pública
import Blog from './components/Blog';
import Members from './components/Members';
import Contact from './components/Contact';


// Contexto
import { AuthProvider } from './auth/authContext';

function App() {
  return (
    <AuthProvider>
      <Router> {/* ÚNICO ROUTER EN TODA LA APP */}
        <Routes>
          {/* Rutas Públicas (anidadas bajo PublicLayout) */}
          <Route path="/" element={<PublicLayout />}>
             <Route index element={<Home />} /> {/* Ruta por defecto para / */}
             <Route path="about" element={<About />} />
             <Route path="treatments" element={<Treatments />} /> {/* Componente de vista pública */}
             <Route path="blog" element={<Blog />} />
             <Route path="members" element={<Members />} />
             <Route path="contact" element={<Contact />} />
             {/* Puedes añadir más rutas públicas aquí si las necesitas */}
          </Route>

          {/* Ruta de Login (fuera de PublicLayout, ya que es una página propia) */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas / Admin (anidadas bajo PrivateLayout y AdminLayout) */}
          <Route element={<PrivateLayout />}> {/* Guardia de Autenticación */}
            <Route path="/admin" element={<AdminLayout />}> {/* Layout del Admin con Outlet */}
              {/* Rutas anidadas que se renderizarán dentro del Outlet de AdminLayout */}
              <Route index element={<h2>Dashboard Admin (Placeholder)</h2>} /> {/* Ruta por defecto /admin */}
              <Route path="treatments" element={<ManageTreatments />} />
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="employees" element={<ManageEmployees />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="clients" element={<ManageClients />} />
              <Route path="change-password" element={<ChangePassword />} />
              {/* Puedes añadir más rutas de admin aquí */}
            </Route>
          </Route>

          {/* Ruta Catch-all o Not Found (Opcional) */}
          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
