// File: my-spa/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import AdminLayout from './layouts/AdminLayout';

// Componentes de Página/Sección
import Login from './components/Login';
import Home from './components/Home';
import About from './components/About';
import Treatments from './components/Treatments';
import Blog from './components/Blog';
import Members from './components/Members';
import Contact from './components/Contact';

// Componentes de gestión del Admin
import ManageTreatments from './components/ManageTreatments';
import ManageBlogs from './components/ManageBlogs';
import ManageEmployees from './components/ManageEmployees';
import ManageProducts from './components/ManageProducts';
import ManageClients from './components/ManageClients';
import ManageAppointments from './components/ManageAppointments';
import ManageEmployeeAvailabilities from './components/ManageEmployeeAvailabilities';
import MetricsDashboard from './components/MetricsDashboard';
import SendCustomMessage from './components/SendCustomMessage';
import EmployeePayroll from './components/EmployeePayroll';
import ChangePassword from './components/ChangePassword';

// Contexto
import { AuthProvider } from './auth/authContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas (anidadas bajo PublicLayout) */}
          <Route path="/" element={<PublicLayout />}>
             <Route index element={<Home />} />
             <Route path="about" element={<About />} />
             <Route path="treatments" element={<Treatments />} />
             <Route path="blog" element={<Blog />} />
             <Route path="members" element={<Members />} />
             <Route path="contact" element={<Contact />} />
          </Route>

          {/* Ruta de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas / Admin */}
          <Route element={<PrivateLayout />}>
            <Route path="/admin" element={<AdminLayout />}>
              {/* --- CAMBIO AQUÍ: Reemplaza el placeholder por el dashboard de métricas --- */}
              <Route index element={<MetricsDashboard />} />
              <Route path="treatments" element={<ManageTreatments />} />
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="employees" element={<ManageEmployees />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="clients" element={<ManageClients />} />
              <Route path="appointments" element={<ManageAppointments />} />
              <Route path="employee-availabilities" element={<ManageEmployeeAvailabilities />} />
              <Route path="metrics" element={<MetricsDashboard />} />
              <Route path="send-message" element={<SendCustomMessage />} />
              <Route path="payroll" element={<EmployeePayroll />} />
              <Route path="change-password" element={<ChangePassword />} />
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
