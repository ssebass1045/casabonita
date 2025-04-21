// File: my-spa/src/layouts/PrivateLayout.tsx
import React, { useContext } from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';
import AdminPanel from '../components/AdminPanel';

const PrivateLayout = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {/* Aquí puedes agregar la estructura común del layout privado, como la barra de navegación */}
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        {/* Otras rutas privadas */}
      </Routes>
    </>
  );
};

export default PrivateLayout;
