// ============================================
// ARCHIVO DE EXPORTACIÓN DE RUTAS
// ============================================

// Primero importamos todos los componentes
import AppRouter from './AppRouter';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// ============================================
// CONSTANTES DE RUTAS
// ============================================
export const ROUTES = {
  // Dashboard
  DASHBOARD: '/',

  // Empleados
  EMPLEADOS: '/empleados',
  EMPLEADOS_NUEVO: '/empleados/nuevo',
  EMPLEADOS_EDITAR: (id) => `/empleados/editar/${id}`,
  EMPLEADOS_DETALLE: (id) => `/empleados/${id}`,

  // Importación
  IMPORTACION: '/importacion',
  IMPORTACION_DETALLE: (id) => `/importacion/${id}`,

  // Registros
  REGISTROS: '/registros',
  REGISTROS_MANUAL: '/registros/manual',

  // Cálculos
  CALCULOS: '/calculos',
  CALCULOS_DETALLE: (id) => `/calculos/${id}`,

  // Reportes
  REPORTES: '/reportes',
  REPORTES_GENERADO: '/reportes/generado',

  // Configuración
  CONFIGURACION: '/configuracion',
  CONFIGURACION_JORNADAS: '/configuracion/jornadas',
  CONFIGURACION_FERIADOS: '/configuracion/feriados',
  CONFIGURACION_TIPOS_HE: '/configuracion/tipos-he',

  // Auth (para futuro)
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password'
};

// ============================================
// HELPER PARA NAVEGACIÓN
// ============================================
export const navigateTo = (navigate, route, params = {}) => {
  if (typeof route === 'function') {
    navigate(route(params));
  } else {
    navigate(route);
  }
};

// Exportaciones nombradas
export { 
  AppRouter,
  PrivateRoute,
  PublicRoute
};

// ============================================
// EXPORTACIÓN POR DEFECTO (TODOS LOS EXPORTS)
// ============================================
export default {
  AppRouter,
  PrivateRoute,
  PublicRoute,
  ROUTES,
  navigateTo
};