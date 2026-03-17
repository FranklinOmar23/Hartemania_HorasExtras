import React from 'react';
import { Navigate } from 'react-router-dom';


// ============================================
// COMPONENTE PRIVATE ROUTE
// Protege rutas que requieren autenticación
// NOTA: Como no hay login, siempre permite el acceso
// ============================================

const PrivateRoute = ({ children }) => {
  // En modo demo/sin login, siempre retornamos los children
  // Esto permite que todas las rutas sean accesibles
  
  // Si en el futuro se implementa login, descomentar:
  // const { isAuthenticated, loading } = useAuth();
  // 
  // if (loading) {
  //   return <div>Cargando...</div>;
  // }
  // 
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
};

// ============================================
// VERSIÓN CON LOGIN (COMENTADA PARA REFERENCIA)
// ============================================
/*
const PrivateRouteWithAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
*/

export default PrivateRoute;