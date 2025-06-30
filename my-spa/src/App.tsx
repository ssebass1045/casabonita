// File: my-spa/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout'; // Guardia de autenticación
import AdminLayout from './layouts/AdminLayout'; // Layout específico del admin

// Componentes de Página/Sección
import Login from './components/Login';
import Home from './components/Home'; // Asumiendo que PublicLayout los usa internamente o los definimos aquí
import About from './components/About';
import Treatments from './components/Treatments';
import Blog from './components/Blog';
import Members from './components/Members';
import Contact from './components/Contact';
import ManageTreatments from './components/ManageTreatments'; // Componente de gestión
import ManageBlogs from './components/ManageBlogs'; // Componente de gestión
import ChangePassword from './components/ChangePassword'; // Necesitaremos crear este

// Contexto
import { AuthProvider } from './auth/authContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/*" element={<PublicLayout />}>
             {/* Si PublicLayout usa Outlet, define rutas públicas aquí */}
             {/* Ejemplo: */}
             {/* <Route index element={<Home />} /> */}
             {/* <Route path="about" element={<About />} /> ... etc */}
             {/* Si PublicLayout ya tiene las Routes, no necesitas anidar aquí */}
          </Route>

          {/* Ruta de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas / Admin */}
          <Route element={<PrivateLayout />}> {/* Guardia de Autenticación */}
            <Route path="/admin" element={<AdminLayout />}> {/* Layout del Admin con Outlet */}
              {/* Rutas anidadas que se renderizarán dentro del Outlet de AdminLayout */}
              <Route index element={<h2>Dashboard Admin (Placeholder)</h2>} /> {/* Ruta por defecto /admin */}
              <Route path="treatments" element={<ManageTreatments />} />
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="change-password" element={<ChangePassword />} />
              {/* Puedes añadir más rutas de admin aquí */}
            </Route>
          </Route>

          {/* Ruta Catch-all o Not Found (Opcional) */}
          {/* <Route path="*" element={<h1>Página no encontrada</h1>} /> */}

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
