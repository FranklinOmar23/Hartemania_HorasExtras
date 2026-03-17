import React from 'react';
import { Navigate } from 'react-router-dom';

// ============================================
// COMPONENTE PUBLIC ROUTE
// Para rutas públicas como login, registro, etc.
// NOTA: Como no hay login, redirige al dashboard
// ============================================

const PublicRoute = ({ children }) => {
  // En modo demo/sin login, redirigimos al dashboard
  // Esto evita que se pueda acceder a rutas como /login
  
  // Si en el futuro se implementa login, descomentar:
  // const { isAuthenticated } = useAuth();
  // 
  // if (isAuthenticated) {
  //   return <Navigate to="/" replace />;
  // }

  // Por ahora, redirigimos al dashboard
  return <Navigate to="/" replace />;
};

// ============================================
// VERSIÓN CON LOGIN (COMENTADA PARA REFERENCIA)
// ============================================
/*
const PublicRouteWithAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
*/

export default PublicRoute;