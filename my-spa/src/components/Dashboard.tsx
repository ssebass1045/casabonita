// File: my-spa/src/components/Dashboard.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext, UserRole } from '../auth/authContext';
import MetricsDashboard from './MetricsDashboard';

const Dashboard = () => {
  const { user, hasRole } = useContext(AuthContext);

  // Si por alguna razón no hay usuario, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario es ADMIN, muestra el panel de métricas
  if (hasRole(UserRole.ADMIN)) {
    return <MetricsDashboard />;
  }

  // Si el usuario es STAFF, redirige a la gestión de citas
  if (hasRole(UserRole.STAFF)) {
    return <Navigate to="/admin/appointments" replace />;
  }

  // Fallback por si el rol no es ninguno de los anteriores (no debería pasar)
  return <div>No tienes permisos para ver esta sección.</div>;
};

export default Dashboard;
