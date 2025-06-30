// File: my-spa/src/layouts/PrivateLayout.tsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';

const PrivateLayout = () => {
  const { token } = useContext(AuthContext); // Es más fiable verificar el token

  // Si no hay token, redirige a login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permite el acceso a las rutas anidadas a través del Outlet
  return <Outlet />;
};

export default PrivateLayout;
